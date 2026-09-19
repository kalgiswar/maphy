var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var moment = require('moment');
var Sequelize = require("sequelize");
var sequelize = require('../../../db/conn');
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var otpGenerator = require('otp-generator');

// GET /api/v1/register/firms — List all organizations (superuser only)
router.get('/', async function(req, res, next) {
    const firm = models.firm;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    if (!req.userInfo || !req.userInfo.isSuperuser) {
      return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
    }

    let result = await firm.findAndCountAll({
          attributes: ['id', 'name', 'image', 'created_at', 'updated_at', 'activated', 'expiration_date'
        ],
          where: {name: {
            [Op.like]: '%'+ search+'%'
          }},
          order: [
              [sort, order]
          ],
          limit: limit,
          offset: offset
        });

    // Enrich each firm with user count
    var response = [];
    if (!_.isNil(result)) {
        for (const row of result.rows) {
          const userCount = await models.user.count({
            where: { firm_id: row.id, deleted_at: null }
          });
          const formatted = formatResponse(row);
          formatted.users_count = userCount;
          response.push(formatted);
        }
    }
    
    res.json({ total: result.count, rows: response });
    next();
});

// GET /api/v1/register/firms/selectList — For dropdown (superuser only)
router.get('/selectList', async function(req, res, next) {
    if (!req.userInfo || !req.userInfo.isSuperuser) {
      return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
    }

    const firm = models.firm;
    const result = await firm.findAll({
      attributes: ['id', 'name'],
      where: {
        activated: 1,
        id: { [Op.ne]: 1 }
      },
      order: [['name', 'ASC']]
    });

    const items = result.map(r => ({ id: r.id, text: r.name }));
    res.json({ items });
});

// GET /api/v1/register/firms/org-overview — Super Admin dashboard overview
router.get('/org-overview', async function(req, res, next) {
    if (!req.userInfo || !req.userInfo.isSuperuser) {
      return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
    }

    try {
      const firm = models.firm;
      
      // Total orgs (exclude firm_id=1 which is superadmin's own)
      const totalOrgs = await firm.count({ where: { id: { [Op.ne]: 1 } } });
      const activeOrgs = await firm.count({ where: { id: { [Op.ne]: 1 }, activated: 1 } });
      const inactiveOrgs = totalOrgs - activeOrgs;

      // Total users across all orgs (exclude superadmin firm)
      const totalUsers = await models.user.count({
        where: { firm_id: { [Op.ne]: 1 }, deleted_at: null }
      });

      // Total assets across all orgs
      const totalAssets = await models.asset.count({
        where: { firm_id: { [Op.ne]: 1 }, deleted_at: null }
      });

      // Get all orgs with summary data
      const orgs = await firm.findAll({
        attributes: ['id', 'name', 'activated', 'created_at', 'expiration_date'],
        where: { id: { [Op.ne]: 1 } },
        order: [['created_at', 'DESC']]
      });

      const orgSummaries = [];
      for (const org of orgs) {
        const [usersCount, assetsCount] = await Promise.all([
          models.user.count({ where: { firm_id: org.id, deleted_at: null } }),
          models.asset.count({ where: { firm_id: org.id, deleted_at: null } })
        ]);

        orgSummaries.push({
          id: org.id,
          name: org.name,
          activated: org.activated,
          created_at: util.createdUpdatedDateFormat(org.created_at),
          expiration_date: org.expiration_date ? moment(org.expiration_date).format('DD/MM/YYYY') : null,
          users_count: usersCount,
          assets_count: assetsCount
        });
      }

      res.json({
        totalOrgs,
        activeOrgs,
        inactiveOrgs,
        totalUsers,
        totalAssets,
        organizations: orgSummaries
      });
    } catch (err) {
      console.error('Error fetching org overview:', err);
      res.json({
        totalOrgs: 0, activeOrgs: 0, inactiveOrgs: 0,
        totalUsers: 0, totalAssets: 0, organizations: []
      });
    }
});

// GET /api/v1/register/firms/:id — Get single organization details
router.get('/:id', async function(req, res, next) {
    const id = _.parseInt(req.params.id);
    const result = await getFirmById(id);
    if (_.isNil(result)) {
      return res.json({});
    }
    const response = formatResponse(result);
    
    // Enrich with user count
    const userCount = await models.user.count({
      where: { firm_id: id, deleted_at: null }
    });
    response.users_count = userCount;
    
    res.json(response);
});

// GET /api/v1/register/firms/:id/users — List users of an organization (superuser only)
router.get('/:id/users', async function(req, res, next) {
    if (!req.userInfo || !req.userInfo.isSuperuser) {
      return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
    }

    const orgId = _.parseInt(req.params.id);
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    const location = models.location;
    const department = models.department;
    const company = models.company;
    const userGroups = models.userGroups;
    const group = models.group;
    const user = models.user;

    user.belongsTo(location, { foreignKey: 'location_id' });
    user.belongsTo(department, { foreignKey: 'department_id' });
    user.belongsTo(company, { foreignKey: 'company_id' });
    user.hasMany(userGroups, { foreignKey: 'user_id' });
    userGroups.belongsTo(group, { foreignKey: 'group_id' });

    let where = {
      firm_id: orgId,
      deleted_at: null,
      email: {
        [Op.like]: '%' + search + '%'
      }
    };

    let result = await user.findAndCountAll({
      attributes: [
        'id', 'first_name', 'last_name', 'username', 'email', 'phone',
        'jobtitle', 'activated', 'created_at', 'updated_at'
      ],
      where: where,
      include: [
        { model: location, attributes: ['id', 'name'] },
        { model: department, attributes: ['id', 'name'] },
        { model: company, attributes: ['id', 'name'] },
        { model: userGroups, attributes: ['user_id', 'group_id'], include: [{ model: group, attributes: ['id', 'name'] }] }
      ],
      order: [[sort, order]],
      limit: limit,
      offset: offset
    });

    var response = [];
    if (!_.isNil(result)) {
      _.map(result.rows, row => {
        const groups = [];
        if (row.userGroups && row.userGroups.length > 0) {
          row.userGroups.forEach(ug => {
            if (ug.group) {
              groups.push({ id: ug.group.id, name: ug.group.name });
            }
          });
        }
        response.push({
          id: row.id,
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          first_name: row.first_name,
          last_name: row.last_name,
          username: row.username,
          email: row.email,
          phone: row.phone,
          jobtitle: row.jobtitle,
          activated: row.activated,
          location: row.location ? { id: row.location.id, name: row.location.name } : null,
          department: row.department ? { id: row.department.id, name: row.department.name } : null,
          company: row.company ? { id: row.company.id, name: row.company.name } : null,
          groups: groups,
          created_at: util.createdUpdatedDateFormat(row.created_at),
          updated_at: util.createdUpdatedDateFormat(row.updated_at)
        });
      });
    }

    res.json({ total: result.count, rows: response });
});

// GET /api/v1/register/firms/:id/summary — Org summary stats (superuser only)
router.get('/:id/summary', async function(req, res, next) {
    if (!req.userInfo || !req.userInfo.isSuperuser) {
      return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
    }

    const orgId = _.parseInt(req.params.id);

    try {
      const [usersCount, assetsCount, licensesCount, accessoriesCount, consumablesCount] = await Promise.all([
        models.user.count({ where: { firm_id: orgId, deleted_at: null } }),
        models.asset.count({ where: { firm_id: orgId, deleted_at: null } }),
        models.license.count({ where: { firm_id: orgId, deleted_at: null } }),
        models.accessory.count({ where: { firm_id: orgId, deleted_at: null } }),
        models.consumable.count({ where: { firm_id: orgId, deleted_at: null } })
      ]);

      res.json({
        users_count: usersCount,
        assets_count: assetsCount,
        licenses_count: licensesCount,
        accessories_count: accessoriesCount,
        consumables_count: consumablesCount
      });
    } catch (err) {
      console.error('Error fetching org summary:', err);
      res.json({
        users_count: 0, assets_count: 0, licenses_count: 0,
        accessories_count: 0, consumables_count: 0
      });
    }
});

// POST /api/v1/register/firms — Create new organization
router.post('/', async function(req, res, next) {
    const firm = models.firm;

    let creatorUserId = 1;
    if (req.userInfo && req.userInfo.userId) {
      creatorUserId = req.userInfo.userId;
    } else if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.userId) {
          creatorUserId = decoded.userId;
        }
      } catch (err) {
        console.error("Token decoding in firm post bypass failed:", err);
      }
    }

    var firmRequest = {
        name: req.body.name || req.body.org_name,
        activated: req.body.activated !== undefined ? req.body.activated : 1,
        user_id: creatorUserId
    };

    let firmId = 0;
    try {
      const response = await sequelize.transaction(async t => {
        // 1. Create the firm/organization
        const firmRes = await firm.create(firmRequest, { transaction: t });
        firmId = firmRes.id;

        // Associate locations with the new organization/firm
        if (req.body.location_ids && Array.isArray(req.body.location_ids) && req.body.location_ids.length > 0) {
          await models.location.update({
            firm_id: firmId
          }, {
            where: {
              id: req.body.location_ids
            },
            transaction: t
          });
        }

        // 2. Clone default permission groups for the new firm
        const defaultGroups = await models.group.findAll({
          where: {
            [Op.or]: [{ firm_id: 1 }, { firm_id: null }]
          },
          transaction: t
        });

        for (const defaultGrp of defaultGroups) {
          if (defaultGrp.name.toLowerCase() === 'super admin') {
            continue;
          }
          let permissionsObj = {};
          try {
            permissionsObj = JSON.parse(defaultGrp.permissions || '{}');
          } catch (e) {}
          if (permissionsObj.superuser) {
            permissionsObj.superuser = "0";
          }

          await models.group.create({
            name: defaultGrp.name,
            permissions: JSON.stringify(permissionsObj),
            firm_id: firmId
          }, { transaction: t });
        }

        // 3. Clone default status labels
        const defaultStatusLabels = await models.statusLabel.findAll({
          where: { firm_id: 1, deleted_at: null },
          transaction: t
        });

        for (const sl of defaultStatusLabels) {
          await models.statusLabel.create({
            name: sl.name,
            color: sl.color || null,
            deployable: sl.deployable || 0,
            pending: sl.pending || 0,
            archived: sl.archived || 0,
            notes: sl.notes || null,
            show_in_nav: sl.show_in_nav || 0,
            default_label: sl.default_label || 0,
            firm_id: firmId,
            user_id: creatorUserId
          }, { transaction: t });
        }

        return { status: 'ok', id: firmId };
      });

      res.result = { id: firmId, status: 'ok', success: true };
      next();
    } catch (err) {
      console.error("Firm registration transaction error:", err);
      res.result = { status: 'error', error: err.message };
      next();
    }
});

// PUT /api/v1/register/firms/:id/subscription
router.put('/:id/subscription', async function(req, res, next) {
  const firm = models.firm;
  const firmSubscription = models.firmSubscription;

  const id = req.params.id;
  const numberOfDays = req.body.number_of_days;
  const today = new Date();
  const result = await getFirmById(id);
  let expirationDate = today;
  if (!_.isNil(result.expiration_date)) {
    expirationDate = moment(result.expiration_date, "DD/MM/YYYY");
  } else {
    expirationDate = moment(expirationDate, "DD/MM/YYYY");
  }
  expirationDate = moment(expirationDate).add(numberOfDays, 'days');
  const userId = _.isNil(req.userInfo) ? result.user_id : req.userInfo.userId;
  await sequelize.transaction(t => {
    return firm.update({expiration_date: expirationDate, user_id: userId}, {where: {id: id}}, {transaction: t}).then(r => {
      return firmSubscription.create({firm_id: id, user_id: userId, created_at: new Date(), amount: req.body.amount, number_of_days: numberOfDays, expiration_date: expirationDate, description: req.body.description}, { transaction: t });
    });
  }).then(function (result) {
    res.result = {id: id};
  }).catch(function (err) {
    res.result = {error: err.message};
  });
});

// PUT /api/v1/register/firms/:id/activate
router.put('/:id/activate', async function(req, res, next) {
  await statusUpdate(1, req, res);
  next();
});

// PUT /api/v1/register/firms/:id/deactivate
router.put('/:id/deactivate', async function(req, res, next) {
  await statusUpdate(0, req, res);
  next();
});

// DELETE /api/v1/register/firms/:id — Delete organization
router.delete('/:id', async function(req, res, next) {
  if (!req.userInfo || !req.userInfo.isSuperuser) {
    return res.status(401).json({result: {error: constants.errorMessages.permissionIssue}});
  }

  const id = _.parseInt(req.params.id);
  if (id === 1) {
    return res.status(400).json({ message: 'Cannot delete the super admin organization' });
  }

  try {
    const firm = models.firm;
    await firm.update({ deleted_at: new Date() }, { where: { id: id } });
    res.result = { success: true, id: id };
  } catch (err) {
    res.result = { error: err.message };
  }
  next();
});

async function statusUpdate(status, req, res) {
  const user = models.user;
  const firm = models.firm;
  const id = _.parseInt(req.params.id);
  const userId = req.userInfo.userId;
  await sequelize.transaction(t => {
    return user.update({activated: status}, {where: {firm_id: id}}, {transaction: t}).then(r => {
      return firm.update({activated: status, user_id: userId}, {where: {id: id}}, { transaction: t });
    });
  }).then(function (result) {
    res.result = {id: id};
  }).catch(function (err) {
    res.result = {error: err.message};
  });

  return res;
}

async function getFirmById(id) {
  const firm = models.firm;

  let result = await firm.findOne({
      attributes: ['id', 'name', 'image', 'created_at', 'updated_at', 'activated', 'expiration_date', 'user_id'
  ],
    where: {id: id}
  });
  return result;
}

function formatResponse(company) {
  return  {
      id: company.id,
      name: company.name,
      image: company.image,
      created_at: util.createdUpdatedDateFormat(company.created_at),
      updated_at: util.createdUpdatedDateFormat(company.updated_at),
      activated: company.activated,
      expiration_date: company.expiration_date ? moment(company.expiration_date).format('DD/MM/YYYY') : null
  };
}

module.exports = router;

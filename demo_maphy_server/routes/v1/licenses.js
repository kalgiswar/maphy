var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
var constants = require('../../shared/constants')
var { errorHandler } = require('../../shared/error-handler')


router.get('/', errorHandler(async function (req, res, next) {
  const license = models.license;
  const category = models.category;
  const company = models.company;
  const manufacturer = models.manufacturer;
  const supplier = models.supplier;
  const licenseSeat = models.licenseSeat;
  const licenseNotifications = models.licenseNotifications;
  license.belongsTo(category, { foreignKey: 'category_id' });
  license.belongsTo(company, { foreignKey: 'company_id' });
  license.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
  license.belongsTo(supplier, { foreignKey: 'supplier_id' });
  license.hasMany(licenseSeat, { foreignKey: 'license_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);
  const type = queries.type;
  let isSuperuser = req.userInfo.isSuperuser;
  if (type == "" || type == "undefined" || type == "All" || type == "all") {
    where = [{
      name: {
        [Op.like]: '%' + search + '%'
      }
    }, {
      deleted_at: {
        [Op.eq]: null
      }
    }, { firm_id: req.userInfo.firmId }]
  }
  else {
    if (type == "expired") {
      where = [{ name: { [Op.like]: '%' + search + '%' } },
      { deleted_at: { [Op.eq]: null } },
      { firm_id: req.userInfo.firmId },
      {
        where: sequelize.where(sequelize.fn('datediff', sequelize.col('expiration_date'), sequelize.fn("NOW")), {
          [Op.lt]: 0
        })
      }
      ]
    }
    else {
      const licenseExpiryDiff = await licenseNotifications.findOne({
        raw: true,
        attributes: ['no_of_days'
        ], where: { firm_id: req.userInfo.firmId }
      });
      const noOfDays = licenseExpiryDiff ? licenseExpiryDiff.no_of_days : 30;

      where = [{ name: { [Op.like]: '%' + search + '%' } },
      { deleted_at: { [Op.eq]: null } },
      { firm_id: req.userInfo.firmId },
      {
        where: {
          [Op.and]:
          [sequelize.where(sequelize.fn('datediff', sequelize.col('expiration_date'), sequelize.fn("NOW")), { [Op.gte]: 0 }),
          sequelize.where(sequelize.fn('datediff', sequelize.col('expiration_date'), sequelize.fn("NOW")), { [Op.lt]: noOfDays })
          ]
        }
      }
      ]
    }
  }

  // let where = [{
  //   name: {
  //     [Op.like]: '%' + search + '%'
  //   }
  // }, {
  //   deleted_at: {
  //     [Op.eq]: null
  //   }
  // }, { firm_id: req.userInfo.firmId }]
  util.addCondition(queries.company_id, where, { company_id: queries.company_id })
  util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id })
  util.addCondition(queries.category_id, where, { category_id: queries.category_id })
  util.addCondition(queries.supplier_id, where, { supplier_id: queries.supplier_id })
  let assigned_to = req.userInfo.userId
  if (!_.isNil(queries.assigned_to)) {
    assigned_to = queries.assigned_to
    isSuperuser = false
  }
  let licenseIds = []

  if (!_.isNil(queries.asset_id)) {
    const licenseSeatResponse = await licenseSeat.findAll({ attributes: ['license_id'], where: { asset_id: _.parseInt(queries.asset_id) } })
    if (!_.isEmpty(licenseSeatResponse)) {
      _.map(licenseSeatResponse, accUser => { licenseIds.push(accUser.license_id) })
    }
    where.push({ id: { [Op.in]: licenseIds } })
  } else {
    if (!isSuperuser) {
      const licenseSeatResponse = await licenseSeat.findAll({ attributes: ['license_id'], where: { assigned_to: _.isNil(assigned_to) ? req.userInfo.userId : assigned_to } })
      if (!_.isEmpty(licenseSeatResponse)) {
        _.map(licenseSeatResponse, accUser => { licenseIds.push(accUser.license_id) })
      }
      where.push([{
        [Op.or]: [
          { id: { [Op.in]: licenseIds } }
        ]
      }])
    }
  }

  // if (_.isEmpty(licenseIds) && !isSuperuser) {
  //   res.json({ total: 0, rows: [] });
  // } else {
  let result = await license.findAndCountAll({
    attributes: [
      'id', 'name', 'termination_date', 'serial', 'expiration_date', 'serial', 'license_name', 'license_email', 'maintained', 'notes', 'order_number', 'purchase_cost', 'purchase_order', 'reassignable', 'seats', 'created_at', 'updated_at', 'purchase_date', 'expiration_date',
      [Sequelize.literal('(SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and assigned_to is null and asset_id is null)'), 'licenseSeatCount'],
      [Sequelize.literal('seats - (SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and (assigned_to is not null or asset_id is not null))'), 'free_seats_count']
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: false },
      { model: supplier, attributes: ['id', 'name'], required: false },
      { model: manufacturer, attributes: ['id', 'name'], required: false }
    ],
    where: where,
    order: Sequelize.literal(`${sort} ${order}`),
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });

}))

//for chart
router.get('/chart', errorHandler(async (req, res, next) => {
  const { license, licenseSeat } = models;
  const Op = Sequelize.Op;
  const queries = req.query;

  const where = {
    deleted_at: null,
    firm_id: req.userInfo.firmId
  };

  util.addCondition(queries.company_id, where, { company_id: queries.company_id });
  util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id });
  util.addCondition(queries.category_id, where, { category_id: queries.category_id });
  util.addCondition(queries.supplier_id, where, { supplier_id: queries.supplier_id });

  // totalSeats across licenses
  const totalSeatsResult = await license.findOne({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('seats')), 'totalSeats']],
    where,
    raw: true
  });

  const totalSeats = Number(totalSeatsResult.totalSeats) || 0;

  // totalAssignedSeats across license_seats
  licenseSeat.belongsTo(license, { foreignKey: 'license_id' });
  const assignedSeatsResult = await licenseSeat.findOne({
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('licenseSeat.id')), 'totalAssignedSeats']],
    include: [{
      model: license,
      attributes: [],
      where: { firm_id: req.userInfo.firmId }
    }],
    where: {
      assigned_to: { [Op.ne]: null }
    },
    raw: true
  });

  const totalAssignedSeats = Number(assignedSeatsResult.totalAssignedSeats) || 0;

  const totalFreeSeats = totalSeats - totalAssignedSeats;

  res.json({
    totalSeats,
    totalAssignedSeats,
    totalFreeSeats
  });

}));

//for chart

router.get('/selectList', errorHandler(async function (req, res, next) {
  const license = models.license;
  const response = await util.getSelectList(license, req)
  res.json(response);
}))

router.get('/:id', errorHandler(async function (req, res, next) {
  const response = await licenseById(req);

  res.json(response);
}))

router.get('/:id/clone', errorHandler(async function (req, res, next) {
  const response = await licenseById(req);

  res.json(response);
}))

router.get('/:id/seats', errorHandler(async function (req, res, next) {
  const licenseSeat = models.licenseSeat;
  const license = models.license;
  const user = models.user;
  const asset = models.asset;
  const department = models.department;
  const location = models.location;
  const model = models.model;
  asset.belongsTo(model, { foreignKey: 'model_id' });

  licenseSeat.belongsTo(user, { foreignKey: 'assigned_to' })
  licenseSeat.belongsTo(asset, { foreignKey: 'asset_id' })
  licenseSeat.belongsTo(license, { foreignKey: 'license_id' })
  user.belongsTo(department, { foreignKey: 'department_id' })
  department.belongsTo(location, { foreignKey: 'location_id' })
  const queries = req.query;
  const { sort, limit, offset, order } = util.queryRequest(queries);
  let result = await licenseSeat.findAndCountAll({
    attributes: [
      'id', 'license_id', 'assigned_to', 'asset_id'
    ],
    include: [
      {
        model: user,
        required: false,
        attributes: ['id', 'first_name', 'last_name']
      },
      {
        model: asset,
        required: false,
        attributes: ['id', 'asset_tag', 'name', 'assigned_type', 'assigned_to',
          [Sequelize.literal('(SELECT CASE WHEN assigned_type = "App\\\\Models\\\\Location" THEN (SELECT name FROM locations WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\User" THEN (SELECT username as name FROM users WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\Asset" THEN (SELECT name FROM assets WHERE id = `asset`.`assigned_to`) END)'), 'assignedLocation']
        ],
        include: [
          { model: model, required: true, attributes: ['id', 'name', 'model_number'] }
        ]
      },
      {
        model: license,
        attributes: ['reassignable', 'name'],
        where: { firm_id: req.userInfo.firmId }
      }
    ],
    where: { license_id: req.params.id },
    // order: [
    //     [sort, order]
    // ],
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, (row, ind) => {
      response.push({
        id: row.id,
        license_id: row.license_id,
        assigned_asset: _.isNil(row.asset) ? {} : {
          id: row.asset.id,
          name: `${row.asset.name} (${row.asset.asset_tag}) - (${row.asset.asset_tag}) - ${row.asset.model.name}`
        },
        assigned_user: _.isNil(row.user) ? {} : {
          id: row.user.id,
          name: `${row.user.first_name} ${row.user.last_name}`,
          department: null
          // department: _.isNil(row.user.department) ? {} : {
          //   id: row.user.department.id,
          //   name: row.user.department.name
          // }
        },
        location: !_.isNil(row.asset) && _.eq(row.asset.assigned_type, constants.itemTypes.location) ? {
          id: row.asset.assigned_to,
          name: row.asset.dataValues.assignedLocation
        } : {},
        available_actions: { checkout: true, clone: true, update: true, delete: true, checkin: true },
        name: `Seat ${ind + 1}`,
        reassignable: row.license.reassignable,
        user_can_checkout: _.some(result, x => _.isNil(x.assigned_to) && _.isNil(x.asset_id))
      })
    })
  }
  res.json({ total: result.count, rows: response });
  //res.json(response);
}))

router.get('/:id/checkin', errorHandler(async function (req, res, next) {
  const licenseSeat = models.licenseSeat;
  const license = models.license
  licenseSeat.belongsTo(license, { foreignKey: 'license_id' });
  var result = await licenseSeat.findOne({
    attributes: ['id', 'license_id', 'notes'],
    include: [{
      model: license,
      attributes: ['serial', 'name']
    }],
    where: {
      id: req.params.id
    }
  })
  var response = {}
  if (!_.isNil(result)) {
    response = {
      id: result.id,
      license_id: result.license_id,
      notes: result.notes,
      name: result.license.name,
      serial: result.license.serial
    }
  }
  res.json(response);
}))

router.post('/', errorHandler(async function (req, res, next) {
  const { license, licenseSeat, actionLogs } = models;
  req.body.user_id = req.userInfo.userId
  var request = req.body;
  let id = 0
  await sequelize.transaction(t => {
    return license.create(request, { transaction: t }).then(licenseResult => {
      id = licenseResult.id
      let licenseSeats = []
      for (var i = 0; i < req.body.seats; i++) {
        licenseSeats.push({ license_id: id });
      }
      return licenseSeat.bulkCreate(licenseSeats, { transaction: t }).then(async assetResult => {
        const { actionTypes, itemTypes } = constants;

        const actionLog = {
          action_type: actionTypes.create,
          item_type: itemTypes.license,
          user_id: req.userInfo.userId,
          item_id: id,
          notes: `added ${req.body.seats} seats`,
          firm_id: req.userInfo.firmId
        }
        await actionLogs.create(actionLog, { transaction: t });
      });

    });
  }).then(function (result) {
    res.result = { id: id }
    console.log('commit')
  }).catch(function (err) {
    res.result = { error: err.message }
  });

  next()
}))

router.post('/:id/checkout', errorHandler(async function (req, res, next) {
  const { licenseSeat, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  var request = {
    license_id: id,
    notes: req.body.notes,
    user_id: req.userInfo.userId
  }
  let targetId, targetType
  if (_.eq(req.body.checkout_to_type, 'user')) {
    request.assigned_to = req.body.assigned_to
    targetId = req.body.assigned_to
    targetType = constants.itemTypes.user
  } else {
    request.asset_id = req.body.asset_id
    targetId = req.body.asset_id
    targetType = constants.itemTypes.asset
  }

  var seat = await licenseSeat.findOne({ where: { license_id: id, assigned_to: null, asset_id: null } });
  console.log("seatid:", seat);
  var seatId = seat.id;
  console.log("seatid:", seatId);
  await sequelize.transaction(t => {
    return licenseSeat.update(request, { where: { id: seatId } }, { transaction: t }).then(r => {
      const { actionTypes, itemTypes } = constants;
      const actionLog = {
        action_type: actionTypes.checkout,
        item_type: itemTypes.license,
        user_id: req.userInfo.userId,
        item_id: id,
        target_id: targetId,
        target_type: targetType,
        notes: request.notes,
        firm_id: req.userInfo.firmId
      }
      return actionLogs.create(actionLog, { transaction: t });
    })
  }).then(() => {
    res.result = { id: id }
  }).catch(err => {
    res.result = { error: err.message }
  })

  next()
}))

router.post('/:id/checkout/:seatId', errorHandler(async function (req, res, next) {
  const licenseSeat = models.licenseSeat;
  const id = _.parseInt(req.params.id)
  const seatId = _.parseInt(req.params.seatId)
  var request = {
    license_id: id,
    notes: req.body.note,
    user_id: req.userInfo.userId
  }
  if (_.eq(req.body.checkout_to_type, 'user')) {
    request.assigned_to = req.body.assigned_to
  } else {
    request.asset_id = req.body.asset_id
  }

  let result = await licenseSeat.update(request, { where: { id: seatId } });

  res.result = result;
  next()
}))

router.post('/:id/checkin', errorHandler(async function (req, res, next) {
  const { licenseSeat, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  var request = {
    assigned_to: null,
    asset_id: null,
    notes: req.body.notes,
    user_id: req.userInfo.userId,
  }
  await sequelize.transaction(t => {
    return licenseSeat.update(request, { where: { id: id } }, { transaction: t }).then(licenseResult => {
      const { actionTypes, itemTypes } = constants;

      const actionLog = {
        action_type: actionTypes.checkInFrom,
        item_type: itemTypes.license,
        user_id: req.userInfo.userId,
        item_id: id,
        notes: request.notes,
        firm_id: req.userInfo.firmId
      }
      return actionLogs.create(actionLog, { transaction: t });
    });
  }).then(function (result) {
    res.result = { id: result.id }
  }).catch(function (err) {
    res.result = { error: err.message }
  })

  next()
}))

router.put('/:id', errorHandler(async function (req, res, next) {
  const { license, actionLogs, licenseSeat } = models;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId;
  let current_seats = req.body.seats;
  let seats_details = await license.findOne({
    raw: true,
    attributes: [
      'seats',
      [Sequelize.literal('(SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and (assigned_to is not null or asset_id is not null))'), 'alottedSeatCount'],
      [Sequelize.literal('seats - (SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and (assigned_to is not null or asset_id is not null))'), 'free_seats_count'],
    ],
    where: { id: id }
  });
  // If new seats  grater than or equal to already existing seats count
  if (_.gte(current_seats, seats_details.seats)) {
    await sequelize.transaction(t => {
      return license.update(req.body, { where: { id: id } }, { transaction: t }).then(licenseResult => {
        if (_.gt(current_seats, seats_details.seats)) {
          let licenseSeats = [];
          for (var i = seats_details.seats + 1; i <= req.body.seats; i++) {
            licenseSeats.push({ license_id: id });
          }
          licenseSeat.bulkCreate(licenseSeats, { transaction: t });
        }
        const { actionTypes, itemTypes } = constants;
        const actionLog = {
          action_type: actionTypes.update,
          item_type: itemTypes.license,
          user_id: req.userInfo.userId,
          item_id: id,
          firm_id: req.userInfo.firmId
        }

        return actionLogs.create(actionLog, { transaction: t });

      });

    }).then(function (result) {
      res.result = { id: result.id }
    }).catch(function (err) {
      res.result = { error: err.message }
    })
  }

  else {
    if (_.lt(current_seats, seats_details.seats) && _.gte(current_seats, seats_details.alottedSeatCount)) {
      await sequelize.transaction(t => {
        return license.update(req.body, { where: { id: id } }, { transaction: t }).then(async licenseResult => {
          const { actionTypes, itemTypes } = constants;
          const actionLog = {
            action_type: actionTypes.update,
            item_type: itemTypes.license,
            user_id: req.userInfo.userId,
            item_id: id,
            firm_id: req.userInfo.firmId
          }
          let delete_seats_count = seats_details.seats - current_seats;
          let delete_seats_id = await licenseSeat.findAll({
            raw: true,
            attributes: ['id'],
            limit: delete_seats_count,
            where: { license_id: id },
            order: [['id', 'DESC']]
          });
          let res = delete_seats_id.map(function (elem) { return elem.id }).join(",");
          sequelize.query("DELETE FROM `license_seats` WHERE `id` in (" + res + ")");
          //return licenseSeat.destroy({ where: { id: [res]}})
          return actionLogs.create(actionLog, { transaction: t });

        });

      }).then(function (result) {
        res.result = { id: result.id }
      }).catch(function (err) {
        res.result = { error: err.message }
      })
    }
    else
      res.result = { error: "This license is currently checked out and cannot be deleted.Please check the license first" }
  }
  next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
  const { license, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId
  req.body.deleted_at = new Date()

  await sequelize.transaction(t => {
    return license.update(req.body, { where: { id: id } }, { transaction: t }).then(licenseResult => {
      const { actionTypes, itemTypes } = constants;

      const actionLog = {
        action_type: actionTypes.delete,
        item_type: itemTypes.license,
        user_id: req.userInfo.userId,
        item_id: id,
        firm_id: req.userInfo.firmId
      }
      return actionLogs.create(actionLog, { transaction: t });
    });
  }).then(function (result) {
    res.result = { id: result.id }
  }).catch(function (err) {
    res.result = { error: err.message }
  })
  next()
}))

async function licenseById(req) {
  const license = models.license;
  const category = models.category;
  const company = models.company;
  const manufacturer = models.manufacturer;
  const supplier = models.supplier;
  license.belongsTo(category, { foreignKey: 'category_id' });
  license.belongsTo(company, { foreignKey: 'company_id' });
  license.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
  license.belongsTo(supplier, { foreignKey: 'supplier_id' });
  //    accessory.hasMany(accessoryUser, {foreignKey: 'assigned_to'});

  const id = _.parseInt(req.params.id);
  let result = await license.findOne({
    attributes: [
      'id', 'name', 'serial', 'license_name', 'license_email', 'maintained', 'notes', 'order_number', 'purchase_cost', 'purchase_order', 'reassignable', 'seats', 'created_at', 'updated_at', 'purchase_date', 'expiration_date', 'termination_date'
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: true },
      { model: supplier, attributes: ['id', 'name'], required: true },
      { model: manufacturer, attributes: ['id', 'name'], required: true },
      //              {model: accessoryUser, attributes: ['id', 'note']}
    ],
    where: { id: id }
  });
  const response = _.isNil(result) ? {} : formatResponse(result);
  return response
}

function formatResponse(row) {
  //const remainingQty = _.isNil(row.dataValues.licenseSeatCount) ? row.seats : row.dataValues.licenseSeatCount
  //const remainingQty = row.seats - checkoutCount
  return {
    id: row.id,
    name: row.name,
    free_seats_count: row.dataValues.free_seats_count,
    license_name: row.license_name,
    license_email: row.license_email,
    maintained: row.maintained,
    termination_date: {
      date: util.formatDate(row.termination_date, 'YYYY-MM-DD'),
      formatted: util.formatDate(row.termination_date, 'YYYY-MM-DD')
    },
    expiration_date: {
      date: util.formatDate(row.expiration_date, 'YYYY-MM-DD'),
      formatted: util.formatDate(row.expiration_date, 'YYYY-MM-DD')
    },
    serial: row.serial,
    notes: row.notes,
    order_number: row.order_number,
    product_key: row.serial,
    purchase_cost: row.purchase_cost,
    purchase_order: row.purchase_order,
    reassignable: row.reassignable,
    seats: row.seats,
    category: util.getRelationalObject(row.category),
    manufacturer: util.getRelationalObject(row.manufacturer),
    supplier: util.getRelationalObject(row.supplier),
    company: util.getRelationalObject(row.company),
    created_at: util.createdUpdatedDateFormat(row.created_at),
    updated_at: util.createdUpdatedDateFormat(row.updated_at),
    purchase_date: {
      date: util.formatDate(row.purchase_date, 'YYYY-MM-DD'),
      formatted: util.formatDate(row.purchase_date, 'YYYY-MM-DD')
    },
    //      user_can_checkout: _.eq(remainingQty, 0) ? false : true,
    available_actions: {
      checkout: true,
      checkin: false,
      update: true,
      delete: true
    }
  }
}

module.exports = router;

var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
var bcrypt = require('bcryptjs')
var speakeasy = require('speakeasy');
var qrcode = require('qrcode');
var jwt = require('jsonwebtoken')
var otpGenerator = require('otp-generator')
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
const user = models.user;
user.belongsTo(user, { foreignKey: 'manager_id', as: 'manager' });
const { errorHandler } = require('../../shared/error-handler');
const { IncomingWebhook } = require('@slack/webhook');

// Read a url from the environment variables
const url = process.env.SLACK_WEBHOOK_URL;

// Initialize
const webhook = new IncomingWebhook(url);

router.get('/', errorHandler(async function (req, res, next) {
  const location = models.location;
  const department = models.department;
  const company = models.company;
  const userGroups = models.userGroups;
  const group = models.group;
  const talentGroup = models.talentGroup;
  user.belongsTo(location, { foreignKey: 'location_id' });
  user.belongsTo(talentGroup, { foreignKey: 'talent_group_id' });
  user.belongsTo(department, { foreignKey: 'department_id' });
  user.belongsTo(company, { foreignKey: 'company_id' });
  user.hasMany(userGroups, { foreignKey: 'user_id' })
  userGroups.belongsTo(group, { foreignKey: 'group_id' })
  const queries = req.query;
  const isDeleteRequest = _.isNil(queries.deleted) || _.isEmpty(queries.deleted) ? false : queries
  const { search, sort, limit, offset, order } = util.queryRequest(queries);
  let where = [{
    email: {
      [Op.like]: '%' + search + '%'
    },
    deleted_at: isDeleteRequest ? {
      [Op.ne]: null
    } : { [Op.eq]: null }
  }];
  if (!req.userInfo.isSuperuser) {
    where.push({ firm_id: req.userInfo.firmId });
    where.push(Sequelize.literal(`NOT EXISTS (
      SELECT 1 FROM users_groups ug 
      JOIN permission_groups pg ON ug.group_id = pg.id 
      WHERE ug.user_id = user.id 
      AND (
        JSON_EXTRACT(pg.permissions, '$.superuser') = '1' 
        OR pg.permissions LIKE '%"superuser":"1"%'
      )
    )`));
  } else if (queries.firm_id) {
    // Superuser can filter by specific org
    where.push({ firm_id: _.parseInt(queries.firm_id) });
  }
  util.addCondition(queries.company_id, where, { company_id: queries.company_id })
  //util.addCondition(queries.category_id, where, {manufacturer_id: queries.category_id})
  util.addCondition(queries.department_id, where, { department_id: queries.department_id })
  util.addCondition(queries.location_id, where, { location_id: queries.location_id })

  let result = await user.findAndCountAll({
    attributes: [
      'id', 'location_id', 'first_name', 'avatar', 'last_name', 'username', 'permissions', 'employee_num', 'jobtitle', 'phone', 'website', 'address', 'city', 'state', 'country', 'zip', 'email', 'notes', 'activated', 'two_factor_enrolled', 'last_login', 'deleted_at', 'created_at', 'updated_at', 'talent_group_id', 'user_type',
      [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assigned_to` = user.`id`)'), 'assetsCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `license_seats` WHERE `license_seats`.`assigned_to` = user.`id`)'), 'licensesCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`assigned_to` = user.`id`)'), 'accessoriesCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `consumables_users` WHERE `consumables_users`.`assigned_to` = user.`id`)'), 'consumablesCount']
    ],
    where: where,
    include: [
      { model: location, attributes: ['id', 'name'] },
      { model: department, attributes: ['id', 'name'] },
      { model: company, attributes: ['id', 'name'] },
      { model: talentGroup, attributes: ['id', 'name'] },
      { model: user, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
      { model: userGroups, attributes: ['user_id', 'group_id'], include: [{ model: group, attributes: ['id', 'name'] }] }
    ],
    order: [
      [sort, order]
    ],
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatResponse(row, req))
    })
  }

  res.json({ total: result.count, rows: response });
}))

router.get('/chart', errorHandler(async (req, res, next) => {
  const { user, userGroups, group } = models;
  const Op = Sequelize.Op;

  // Declare local temporary associations (only for this API call)
  userGroups.belongsTo(group, { foreignKey: 'group_id' });
  userGroups.belongsTo(user, { foreignKey: 'user_id' });

  // Total users (excluding deleted ones)
  const totalUsers = await user.count({
    where: {
      deleted_at: { [Op.eq]: null },
      firm_id: req.userInfo.firmId
    }
  });

  // Group-wise user count
  const groupwiseCounts = await userGroups.findAll({
    attributes: [
      [Sequelize.col('group.name'), 'groupName'],
      [Sequelize.fn('COUNT', Sequelize.col('userGroups.user_id')), 'userCount']
    ],
    include: [
      { model: group, attributes: [] },
      {
        model: user,
        attributes: [],
        where: {
          deleted_at: { [Op.eq]: null },
          firm_id: req.userInfo.firmId
        }
      }
    ],
    group: ['group.name'],
    raw: true
  });

  res.json({
    totalUsers,
    groups: groupwiseCounts
  });

}));


router.get('/selectList', errorHandler(async function (req, res, next) {
  const response = await util.getSelectList(user, req, true)
  res.json(response);
}))

router.get('/me', errorHandler(async function (req, res, next) {
  const userId = req.userInfo.userId;
  const userResponse = await user.findOne({
    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'onboarding_dismissed'],
    where: { id: userId }
  });
  res.json(userResponse);
}))

// GET /api/v1/users/me/permissions — Returns live group permissions from DB (no JWT cache).
// Called by the client on startup to keep localStorage fresh whenever group permissions change.
router.get('/me/permissions', errorHandler(async function (req, res, next) {
  const { QueryTypes } = require('sequelize');
  const sequelize = require('../../db/conn');
  const userId = req.userInfo.userId;
  const firmId = req.userInfo.firmId;

  // Super admins always have full permissions
  if (req.userInfo.isSuperuser || req.userInfo._originalSuperuser) {
    return res.json({ permissions: null, isSuperuser: true });
  }

  const rows = await sequelize.query(
    `SELECT pg.permissions
     FROM users u
     INNER JOIN users_groups ug ON ug.user_id = u.id AND (ug.firm_id = u.firm_id OR ug.firm_id = 1 OR ug.firm_id IS NULL)
     INNER JOIN permission_groups pg ON pg.id = ug.group_id AND (pg.firm_id = u.firm_id OR pg.firm_id = 1 OR pg.firm_id IS NULL)
     WHERE u.id = :userId AND u.firm_id = :firmId AND u.deleted_at IS NULL AND u.activated = 1
     LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: { userId, firmId } }
  );

  if (!rows || rows.length === 0) {
    return res.json({ permissions: {}, isSuperuser: false });
  }

  let permissions = rows[0].permissions;
  if (typeof permissions === 'string') {
    try { permissions = JSON.parse(permissions); } catch (e) { permissions = {}; }
  }
  // Remove superuser flag for non-firm-1 tenants
  if (Number(firmId) !== 1) {
    delete permissions.superuser;
  }

  res.json({ permissions, isSuperuser: false });
}))


router.get('/:id', errorHandler(async function (req, res, next) {
  const location = models.location;
  const department = models.department;
  const company = models.company;
  const userGroups = models.userGroups;
  const group = models.group;
  user.belongsTo(location, { foreignKey: 'location_id' });
  user.belongsTo(department, { foreignKey: 'department_id' });
  user.belongsTo(company, { foreignKey: 'company_id' });
  //user.belongsTo(user, {foreignKey: 'manager_id', as: 'manager'});
  user.hasMany(userGroups, { foreignKey: 'user_id' })
  userGroups.belongsTo(group, { foreignKey: 'group_id' })
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);

  let result = await user.findOne({
    attributes: [
      'id', 'first_name', 'avatar', 'last_name', 'username', 'employee_num', 'permissions', 'jobtitle', 'phone', 'website', 'address', 'city', 'state', 'country', 'zip', 'email', 'notes', 'activated', 'two_factor_enrolled', 'last_login', 'deleted_at', 'created_at', 'updated_at',
      [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`user_id` = user.`id`)'), 'assetsCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`user_id` = user.`id`)'), 'licensesCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`user_id` = user.`id`)'), 'accessoriesCount'],
      [Sequelize.literal('(SELECT COUNT(*) FROM `consumables` WHERE `consumables`.`user_id` = user.`id`)'), 'consumablesCount']
    ],
    include: [
      { model: location, attributes: ['id', 'name'] },
      { model: department, attributes: ['id', 'name'] },
      { model: company, attributes: ['id', 'name'] },
      //{model: user, as: 'manager', attributes: ['id', 'first_name', 'last_name']},
      { model: userGroups, attributes: ['user_id', 'group_id'], include: [{ model: group, attributes: ['id', 'name'] }] }
    ],
    where: req.userInfo.isSuperuser ? { id: req.params.id } : { id: req.params.id, firm_id: req.userInfo.firmId },
    order: [
      [sort, order]
    ],
    limit: limit,
    offset: offset
  });

  var response = {}
  if (!_.isNil(result)) {
    response = formatResponse(result)
  }

  res.json(response);

}))

router.get('/:id/status', errorHandler(async (req, res) => {
  let userResponse = await util.getUserStatus(user, req.params.id)
  let response = {}
  if (!_.isNil(userResponse)) {
    if (_.isNil(userResponse.availability_status)) {
      userResponse.availability_status = constants.userAvailabilityStatus.unavailable
    }
    const userStatus = _.eq(userResponse.availability_status, constants.userAvailabilityStatus.unavailable) ? false : true
    response = { id: userResponse.id, userType: userResponse.user_type, availabilityStatus: userStatus }
  }
  res.send(response)
}))

router.post('/', errorHandler(async function (req, res, next) {
  try {
    const userGroups = models.userGroups;
    req.body.permissions = JSON.stringify(req.body.permissions);
    const first_name = req.body.first_name;
    const isExists = await util.uniqueCheck(user, { email: req.body.email })
    if (isExists)
      res.json({ message: constants.errorMessages.emailExists })
    else {
      const groupRes = await models.group.findOne({ where: { id: req.body.group_id } });
      if (!groupRes) {
        return res.status(400).json({ message: "Group not found" });
      }

      const callerLevel = getCallerLevel(req.userInfo);
      const targetGroupLevel = getGroupLevel(groupRes);
      if (callerLevel < 3 && targetGroupLevel >= callerLevel) {
        return res.status(403).json({ message: "Forbidden: You cannot assign users to a group at or above your own privilege level." });
      }

      const groupPermissions = groupRes.permissions ? JSON.parse(groupRes.permissions) : {};
      const isCreatingSuper = groupPermissions.superuser === '1' || groupPermissions.superuser === 1 || groupPermissions.superuser === true;

      const isCreatorSuper = req.userInfo && (req.userInfo.isSuperuser || req.userInfo.permissions?.superuser === '1' || req.userInfo.permissions?.superuser === 1 || req.userInfo.permissions?.superuser === true || req.userInfo.permissions?.superuser === 'true');

      if (isCreatingSuper) {
        return res.status(403).json({ message: "Forbidden: Creating superuser accounts is not allowed" });
      }

      // Determine firm_id: superuser must specify which org the user belongs to
      let firmId;
      if (isCreatorSuper) {
        firmId = req.body.firm_id || 1;
      } else {
        firmId = req.userInfo.firmId;
      }
      req.body.firm_id = firmId;

      const saltRounds = 10;
      const password = otpGenerator.generate(6, { alphabets: true, upperCase: false, specialChars: false });
      const bcryptResponse = await bcrypt.hash(password, saltRounds)
      req.body.password = bcryptResponse;
      var request = req.body;
      let userId = 0
      var response = await sequelize.transaction(t => {
        return user.create(request, { transaction: t }).then(result => {
          userId = result.id
          var groups = []
          groups.push({ user_id: userId, group_id: req.body.group_id, firm_id: firmId });
          return userGroups.bulkCreate(groups, { transaction: t });
        }).catch(function (err) {
          console.log("errror create:", err)
          throw err;
        });
      }).then(function (result) {
        util.sendEmail(req.body.email, constants.emailTemplates.usercredentials, { password: password, name: first_name });
        res.result = { status: 'ok', id: userId, success: true };
        return { status: 'ok', id: userId, success: true }
      });
    }
  } catch (err) {
    console.log("errr catch try:", err);
    throw err;
  }
  next();
}))

router.post('/login', errorHandler(async function (req, res, next) {
  const userRequest = req.body
  const userGroups = models.userGroups;
  const group = models.group;
  //const active_users = 1;
  user.hasMany(userGroups, { foreignKey: 'user_id' })
  userGroups.belongsTo(group, { foreignKey: 'group_id' })
  //await util.encrypt(userRequest)
  const userResponse = await user.findOne({
    attributes: ['id', 'first_name', 'last_name', 'two_factor_enrolled', 'two_factor_optin', 'username', 'password', 'email', 'permissions', 'availability_status', 'user_type', 'talent_group_id', 'firm_id', 'onboarding_dismissed'
    ],
    include: {
      model: userGroups, attributes: ['group_id'], include: {
        model: group,
        attributes: ['permissions']
      }
    },
    where: { email: userRequest.email, activated: 1, deleted_at: null }
  })
  let accessToken = {},
    success = false,
    message = 'Invalid Email or Password',
    isSuperuser = false,
    scanCode = '',
    permissions = []
  let result = {}
  if (_.isNil(userResponse)) {
    //   await user.update({active_users:1}, {where: {id: userResponse.id}})

    result = { success, message }
  } else {
    const isPasswordMatching = await bcrypt.compare(req.body.password, userResponse.password)
    if (isPasswordMatching) {
      const secret = process.env.JWT_SECRET
      if (!_.isNil(userResponse.userGroups) && _.size(userResponse.userGroups) > 0 && !_.isNil(_.head(userResponse.userGroups).group)) {
        permissions = JSON.parse(_.head(userResponse.userGroups).group.permissions)
      }
      if (!_.isNil(permissions))
        isSuperuser = _.isNil(permissions.superuser) || _.eq(permissions.superuser, '0') ? false : true
      accessToken = jwt.sign({
        userId: userResponse.id,
        username: userResponse.username,
        firstName: userResponse.first_name,
        lastName: userResponse.last_name,
        email: userResponse.email,
        isSuperuser: isSuperuser,
        talentGroupId: userResponse.talent_group_id,
        availabilityStatus: userResponse.availability_status,
        userType: userResponse.user_type,
        firmId: userResponse.firm_id
      }, secret, { expiresIn: '8h' })
      success = true
      message = ''
      if (userResponse.two_factor_optin && !userResponse.two_factor_enrolled) {
        const qrSecret = speakeasy.generateSecret({ length: 20 })
        await user.update({ two_factor_secret: qrSecret.base32 }, { where: { id: userResponse.id } })

        scanCode = await qrcode.toDataURL(qrSecret.otpauth_url)
      }
    }
    result = { success, accessToken, message, isSuperuser, permissions, scanCode, twoFactorOptin: userResponse.two_factor_optin, twoFactorEnrolled: userResponse.two_factor_enrolled, onboarding_dismissed: userResponse.onboarding_dismissed }
  }
  res.result = result;
  next()
}))

router.post('/totpSetup/:id', errorHandler(async function (req, res, next) {
  var userToken = req.body.token
  var id = req.params.id
  const userResponse = await user.findOne({
    attributes: ['id', 'two_factor_secret'],
    where: { id: id }
  })

  var token = speakeasy.totp({
    secret: userResponse.two_factor_secret,
    encoding: 'base32'
  });
  res.json({ token: token })
}))

router.put('/verify/:id', errorHandler(async function (req, res, next) {
  var userToken = req.body.token
  var id = req.params.id
  const userResponse = await user.findOne({
    attributes: ['id', 'two_factor_secret'],
    where: { id: id }
  })

  var verified = speakeasy.time.verify({
    secret: userResponse.two_factor_secret,
    encoding: 'base32',
    token: userToken
  });
  await user.update({ two_factor_enrolled: verified }, { where: { id: id } })
  res.result = { verified }
  next()
}))

router.post('/generateOtp', errorHandler(async function (req, res, next) {
  const email = req.body.email;
  let userResponse = await user.findOne({ where: { email: email } })
  const username = userResponse.username
  if (!_.isNil(userResponse)) {
    const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
    userResponse = await user.update({ password_otp: otp }, { where: { email: email } })
    //await util.sendMail(email, constants.emailTemplates.forgetPassword, { otp, name: 'name' })
    await util.sendEmail(email, constants.emailTemplates.forgetPassword, { password: otp, name: username })
    // res.result = { otp: otp }
    res.json({
      message: 'OTP for Forgot Password sent successfully',
      success: true
    });
  } else {
    res.json({ message: constants.errorMessages.emailNotExists })
  }
  next()
}));

router.put('/onboarding/dismiss', errorHandler(async function (req, res, next) {
  const userId = req.userInfo.userId;
  await user.update({ onboarding_dismissed: true }, { where: { id: userId } });
  res.result = { success: true, message: 'Onboarding dismissed successfully' };
  next();
}));

function getGroupLevel(group) {
  if (!group) return 0;
  const data = group.dataValues || group;
  const name = (data.name || '').toLowerCase();
  if (name.includes('super admin')) return 3;
  if (name.includes('admin')) return 2;
  if (name.includes('manager')) return 1;
  if (name.includes('fow')) return 1;

  let perms = {};
  try {
    perms = typeof data.permissions === 'string'
      ? JSON.parse(data.permissions)
      : (data.permissions || {});
  } catch (e) { }
  if (perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true) return 3;
  if (perms.admin === true || perms.admin === 1 || perms.admin === '1' || perms.admin === 'true') return 2;
  return 1;
}

function getCallerLevel(userInfo) {
  if (!userInfo) return 0;
  if (userInfo.isSuperuser || userInfo._originalSuperuser) return 3;
  if (userInfo.isAdmin) return 2;
  return 1;
}

async function getUserLevel(userId) {
  if (userId === 1) return 3;
  const userRow = await models.user.findOne({
    attributes: ['permissions', 'firm_id'],
    where: { id: userId }
  });
  if (userRow) {
    if (Number(userRow.firm_id) === 1) {
      let perms = {};
      try {
        perms = typeof userRow.permissions === 'string' ? JSON.parse(userRow.permissions) : userRow.permissions;
      } catch (e) {}
      if (perms && (perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true)) {
        return 3;
      }
    }
  }
  const rows = await sequelize.query(`
    SELECT pg.permissions
    FROM users_groups ug
    INNER JOIN permission_groups pg ON pg.id = ug.group_id
    WHERE ug.user_id = :userId
  `, {
    type: Sequelize.QueryTypes.SELECT,
    replacements: { userId }
  });
  if (!rows || rows.length === 0) return 1;
  let highestLevel = 1;
  for (const row of rows) {
    let perms = {};
    try {
      perms = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
    } catch (e) {}
    if (perms && (perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true)) {
      return 3;
    }
    if (perms && (perms.admin === true || perms.admin === 1 || perms.admin === '1' || perms.admin === 'true')) {
      highestLevel = 2;
    }
  }
  return highestLevel;
}

router.put('/:id', errorHandler(async function (req, res, next) {
  const userGroups = models.userGroups;
  const user = models.user;
  const id = _.parseInt(req.params.id)

  const foundUser = await user.findOne({ where: { id: id } });
  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // 1. Self edit protection
  if (id === req.userInfo.userId) {
    return res.status(403).json({ message: "Forbidden: Self editing is not allowed under User Management." });
  }

  // 2. User privilege level restriction (cannot edit someone at same or higher level than yourself)
  const targetLevel = await getUserLevel(id);
  const callerLevel = getCallerLevel(req.userInfo);
  if (callerLevel < 3 && callerLevel <= targetLevel) {
    return res.status(403).json({ message: "Forbidden: You can only edit users at a lower privilege level than your own." });
  }

  if (!req.userInfo.isSuperuser && foundUser.firm_id !== req.userInfo.firmId) {
    return res.status(403).json({ message: "Forbidden: Access denied to this tenant user" });
  }

  // Prevent demoting the only super admin or promoting others to super admin
  if (req.body.group_id) {
    const groupRes = await models.group.findOne({ where: { id: req.body.group_id } });
    if (!groupRes) {
      return res.status(400).json({ message: "Group not found" });
    }

    const callerLevel = getCallerLevel(req.userInfo);
    const targetGroupLevel = getGroupLevel(groupRes);
    if (callerLevel < 3 && targetGroupLevel >= callerLevel) {
      return res.status(403).json({ message: "Forbidden: You cannot assign users to a group at or above your own privilege level." });
    }

    const groupPermissions = groupRes.permissions ? JSON.parse(groupRes.permissions) : {};
    const isTargetSuper = groupPermissions.superuser === '1' || groupPermissions.superuser === 1 || groupPermissions.superuser === true;

    if (id === 1 && !isTargetSuper) {
      return res.status(403).json({ message: "Forbidden: Demoting the default super admin is not allowed" });
    }
    if (id !== 1 && isTargetSuper) {
      return res.status(403).json({ message: "Forbidden: Assigning superuser group is not allowed" });
    }
  }

  const targetFirmId = foundUser.firm_id;
  const isExists = await util.uniqueCheck(user, { email: req.body.email, firm_id: targetFirmId, id: { [Op.ne]: req.params.id } })
  if (isExists)
    res.json({ message: constants.errorMessages.emailExists })
  else {
    if (!_.isNil(req.body.permissions))
      req.body.permissions = JSON.stringify(req.body.permissions);

    var request = req.body;
    request.firm_id = targetFirmId; // Prevent superuser caller's firm ID from overwriting

    const result = await sequelize.transaction(t => {
      return user.update(request, { where: { id: id } }, { transaction: t }).then(result => {
        return userGroups.destroy({ where: { user_id: id } }, { transaction: t }).then(result => {
          var groups = []
          groups.push({ user_id: id, group_id: req.body.group_id, firm_id: targetFirmId });
          return userGroups.bulkCreate(groups, { transaction: t });
        })
      });
    }).then(function (result) {
      return { status: 'ok' }
    }).catch(function (err) {
      console.log("Error updating user:", err);
      return { status: 'error' }
    });


    res.result = result;
    next()
  }
}));



router.post('/maintenanceEmail', errorHandler(async function (req, res, next) {
  const email = ['devops@maphyasset.com', 'qa@maphyasset.com', 'deepak.v@rsctec.com', 'ar@rsctec.com', 'sathya@rsctec.com', 'tgnarayanan@rsctec.com', 'Sathishraj.b@rsctec.com', 'vinothkumarb654@gmail.com', 'ganesan.s@rsctec.com', 'gvs@rsctec,com'];
  const firmId = req.userInfo.firmId;
  const startDate = req.body.startDate
  const endDate = req.body.endDate
  let userResponse = await user.findOne({ where: { email: email, firm_id: firmId } })
  if (!_.isNil(userResponse)) {
    await util.sendMail(email, constants.emailTemplates.maintenanceMail, { startDate, endDate })
    res.result = { startDate: startDate, endDate: endDate };
  }
  else {
    res.json({ message: constants.errorMessages.emailNotExists })
  }
  next()
}))

router.post('/slack', errorHandler(async function (req, res, next) {
  //const name = req.body.name
  // req.body.email = req.userInfo.email
  //   const email = req.body.email
  const message = req.body.message
  // let result = await webhook.send(name, message);
  let result = await webhook.send(message);

  res.result = result;
  next()
}));

router.post('/changePassword', errorHandler(async function (req, res, next) {

  const firmId = req.userInfo.firmId;
  const saltRounds = 10;
  const password = await bcrypt.hash(req.body.newPassword, saltRounds);
  const user = models.user;
  const userResponse = await user.findOne({
    attributes: ['password'],
    where: { id: req.userInfo.userId, activated: 1 }
  });
  const isPasswordMatching = await bcrypt.compare(req.body.oldPassword, userResponse.password);
  if (isPasswordMatching) {
    const response1 = await user.update({ password: password }, { where: { id: req.userInfo.userId, firm_id: firmId } });
    res.result = response1;
    next();
  } else {
    res.json({ message: constants.errorMessages.invalidOldpassword });
  }

}));



router.put('/password/update', errorHandler(async function (req, res, next) {
  const user = models.user;
  const email = req.body.email
  const otp = req.body.otp;
  const saltRounds = 10;
  const bcryptResponse = await bcrypt.hash(req.body.password, saltRounds);
  let userResponse = await user.findOne({ where: { email: email, password_otp: otp } })

  if (_.isNil(userResponse)) {
    res.json({ message: constants.errorMessages.invalidOtp })
  } else {
    const userResponse = await user.update({ password: bcryptResponse, password_otp: null }, { where: { email: email } })
    res.result = userResponse
  }
  next()
}))

router.put('/restore/:id', errorHandler(async function (req, res, next) {
  const user = models.user;
  const id = _.parseInt(req.params.id)

  const foundUser = await user.findOne({ where: { id: id } });
  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!req.userInfo.isSuperuser && foundUser.firm_id !== req.userInfo.firmId) {
    return res.status(403).json({ message: "Forbidden: Access denied to this tenant user" });
  }

  const request = {
    deleted_at: null,
    user_id: req.userInfo.userId
  }
  let result = await user.update(request, { where: { id: id } });

  res.result = result;
  next()
}));


router.put('/status/:id', errorHandler(async function (req, res, next) {
  let { ticket, ticketStatus, user } = models;
  const id = _.parseInt(req.params.id)
  let ticketStatuses = await util.getSelectList(ticketStatus, req)
  ticketStatuses = ticketStatuses.items;
  const holdStatus = _.find(ticketStatuses, x => x.text == constants.ticketStatusName.hold);
  const inprogressStatus = _.find(ticketStatuses, x => x.text == constants.ticketStatusName.inprogress)
  req.body.availability_status = _.eq(req.body.availability_status, 0) ? constants.userAvailabilityStatus.unavailable : req.body.availability_status
  const userInfo = await util.getUserInfo(user, req.userInfo.userId)

  let ticketResponses = await ticket.findAll({
    attributes: ['id', 'details', 'assigned_to', 'user_id'],
    where: {
      assigned_to: req.userInfo.userId, firm_id: req.userInfo.firmId,
      status_id: _.eq(req.body.availability_status, constants.userAvailabilityStatus.unavailable) ?
        inprogressStatus.id : holdStatus.id
    }
  });

  let ticketRequest = {}

  if (_.isEmpty(ticketResponses)) {
    if (_.eq(req.body.availability_status, constants.userAvailabilityStatus.unavailable)) {
      let result = await user.update({
        user_id: req.userInfo.user_id,
        availability_status: req.body.availability_status
      },
        { where: { id: req.userInfo.userId } })
      res.result = result
    } else {
      const status = _.find(ticketStatuses, x => x.text == constants.ticketStatusName.inprogress)
      const openStatus = _.find(ticketStatuses, x => x.text == constants.ticketStatusName.open)
      let ticketResponse = await ticket.findOne({
        attributes: ['id', 'details', 'assigned_to', 'user_id'],
        where: {
          status_id: openStatus.id,
          talent_group_id: req.userInfo.talentGroupId,
          firm_id: req.userInfo.firmId
        },
        order: [['createdAt', 'ASC']]
      })
      if (!_.isNil(ticketResponse)) {
        let ticketDetails = JSON.parse(ticketResponse.details)
        ticketDetails.push({
          user: userInfo.name,
          detail: constants.ticketStatusName.inprogress,
          status: constants.ticketStatusName.inprogress,
          date: new Date()
        })
        const details = JSON.stringify(ticketDetails)
        ticketRequest = {
          id: ticketResponse.id,
          status_id: status.id,
          assigned_to: req.userInfo.userId,
          details: details,
          user_id: req.userInfo.userId,
          updated_at: new Date()
        }
        if (!_.isNil(ticketRequest) && !_.isNil(ticketRequest.id)) {
          res.result = await updateTicketAndUserStatus(ticketRequest, id, req.body.availability_status, ticket)
        }
      }
      else {
        let result = await user.update({
          user_id: req.userInfo.user_id,
          availability_status: req.body.availability_status
        },
          { where: { id: req.userInfo.userId } })
        res.result = result
        //res.result={sucess:true, message:"Updated Succesfully"};
      }
    }
  } else {
    for (const ticketResponse of ticketResponses) {
      let ticketDetails = _.isEmpty(ticketResponse) ? [] : JSON.parse(ticketResponse.details)
      const status = _.eq(req.body.availability_status, constants.userAvailabilityStatus.unavailable) ?
        constants.ticketStatusName.hold : constants.ticketStatusName.inprogress

      ticketDetails.push({
        user: userInfo.name,
        detail: status,
        status: status,
        date: new Date()
      })
      ticketRequest = {
        id: ticketResponse.id,
        status_id: _.find(ticketStatuses, x => x.text == status).id,
        details: JSON.stringify(ticketDetails),
        user_id: req.userInfo.userId,
        updated_at: new Date()
      }
      if (!_.isNil(ticketRequest) && !_.isNil(ticketRequest.id)) {
        res.result = await updateTicketAndUserStatus(ticketRequest, id, req.body.availability_status, ticket)
      }
    }
  }
  //res.result = response
  next();
}));

async function updateTicketAndUserStatus(ticketRequest, id, availabilityStatus, ticket) {
  const user = models.user;
  const response = await sequelize.transaction(t => {
    return ticket.update(ticketRequest, { where: { id: ticketRequest.id } }, { transaction: t }).then(result => {
      return user.update({
        availability_status:
          _.eq(availabilityStatus, constants.userAvailabilityStatus.available) ?
            constants.userAvailabilityStatus.busy : constants.userAvailabilityStatus.unavailable
      },
        { where: { id: id } }, { transaction: t });
    });
  }).then(function (result) {
    return { status: 'ok', id: id }
  }).catch(function (err) {
    return { status: 'error' }
  });
  return response
}

router.delete('/:id', errorHandler(async function (req, res, next) {
  const id = _.parseInt(req.params.id);
  const foundUser = await user.findOne({ where: { id: id } });
  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // 1. Self deletion protection
  if (id === req.userInfo.userId) {
    return res.status(403).json({ message: "Forbidden: Self deletion is not allowed." });
  }

  // 2. User privilege level restriction (cannot delete someone at same or higher level than yourself)
  const targetLevel = await getUserLevel(id);
  const callerLevel = getCallerLevel(req.userInfo);
  if (callerLevel < 3 && callerLevel <= targetLevel) {
    return res.status(403).json({ message: "Forbidden: You can only delete users at a lower privilege level than your own." });
  }

  if (!req.userInfo.isSuperuser && foundUser.firm_id !== req.userInfo.firmId) {
    return res.status(403).json({ message: "Forbidden: Access denied to this tenant user" });
  }

  var datetime = new Date();
  const userRequest = {
    deleted_at: datetime,
    user_id: req.userInfo.userId
  }
  let result = await user.update(userRequest, { where: { id: id } });


  res.result = result;
  next()
}))

function bindUserGroups(user) {
  var userGroups = []
  var total = _.size(user.dataValues.userGroups)
  if (total > 0) {
    _.map(user.dataValues.userGroups, group => {
      total = total + 1
      if (!_.isNil(group.dataValues) && !_.isNil(group.dataValues.group) && !_.isNil(group.dataValues.group.dataValues))
        userGroups.push(util.getRelationalObject(group.dataValues.group.dataValues))
    })
  }
  return { total: total, rows: userGroups }
}

function getManager(user) {
  return _.isNil(user) ? {} : {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`
  }
}

function getUserLevelSync(user) {
  if (user.id === 1) return 3;
  let perms = {};
  try {
    perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {});
  } catch (e) {}
  if (perms && (perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true)) {
    return 3;
  }
  
  const userGroups = user.dataValues.userGroups || user.userGroups || [];
  let highestLevel = 1;
  for (const ug of userGroups) {
    const group = ug.group || (ug.dataValues && ug.dataValues.group);
    if (group) {
      let gPerms = {};
      try {
        gPerms = typeof group.permissions === 'string' ? JSON.parse(group.permissions) : (group.permissions || {});
      } catch (e) {}
      if (gPerms && (gPerms.superuser === '1' || gPerms.superuser === 1 || gPerms.superuser === true)) {
        return 3;
      }
      if (gPerms && (gPerms.admin === true || gPerms.admin === 1 || gPerms.admin === '1' || gPerms.admin === 'true')) {
        highestLevel = 2;
      }
    }
  }
  return highestLevel;
}

function formatResponse(user, req) {
  const actions = util.getAvailableActionsMain([
    user.dataValues.assetsCount,
    user.dataValues.accessoriesCount,
    user.dataValues.consumablesCount,
    user.dataValues.licensesCount
  ]);

  if (req && req.userInfo) {
    const callerLevel = getCallerLevel(req.userInfo);
    const targetLevel = getUserLevelSync(user);

    // 1. Cannot edit/delete self
    if (user.id === req.userInfo.userId) {
      actions.update = false;
      actions.delete = false;
    }
    // 2. Cannot edit/delete user at same or higher level than caller
    else if (callerLevel < 3 && callerLevel <= targetLevel) {
      actions.update = false;
      actions.delete = false;
    }
  }

  return {
    id: user.id,
    firm_id: user.firm_id,
    avatar: user.avatar,
    name: `${user.first_name} ${user.last_name}`,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    employee_num: user.employee_num,
    manager: getManager(user.dataValues.manager),
    jobtitle: user.jobtitle,
    phone: user.phone,
    website: user.website,
    address: user.address,
    city: user.city,
    state: user.state,
    country: user.country,
    zip: user.zip,
    email: user.email,
    talent_group_id: user.talent_group_id,
    user_type: user.user_type,
    talentGroup: util.getRelationalObject(user.dataValues.talentGroup),
    department: util.getRelationalObject(user.dataValues.department),
    location: util.getRelationalObject(user.dataValues.location),
    notes: user.notes,
    activated: user.activated,
    two_factor_activated: user.two_factor_activated,
    two_factor_enrolled: user.two_factor_enrolled,
    assets_count: user.dataValues.assetsCount,
    licenses_count: user.dataValues.licensesCount,
    accessories_count: user.dataValues.accessoriesCount,
    consumables_count: user.dataValues.consumablesCount,
    company: util.getRelationalObject(user.dataValues.company),
    created_at: util.createdUpdatedDateFormat(user.created_at),
    updated_at: util.createdUpdatedDateFormat(user.updated_at),
    last_login: util.createdUpdatedDateFormat(user.last_login),
    deleted_at: util.createdUpdatedDateFormat(user.deleted_at),
    available_actions: actions,
    groups: bindUserGroups(user),
    permissions: _.isNil(user.permissions) ? {} : JSON.parse(user.permissions),
  }
}

module.exports = router;

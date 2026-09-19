var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
var constants = require('../../../shared/constants')
var { errorHandler } = require('../../../shared/error-handler')


const assetAllowedSortColumns = [
  'id', 'name', 'asset_tag', 'serial', 'purchase_date', 'purchase_cost', 'warranty_months',
  'notes', 'expected_checkin', 'last_audit_date', 'next_audit_date', 'image', 'created_at', 'updated_at',
  'company.name'
];

const accessoryAllowedSortColumns = [
  'id', 'name', 'total', 'qty', 'min_amt', 'min_qty', 'avail', 'company.name'
];

const licenseAllowedSortColumns = [
  'id', 'name', 'serial', 'license_name', 'license_email', 'notes', 'order_number', 'purchase_cost', 'purchase_order', 'seats',
  'licenseSeatCount', 'free_seats_count', 'company.name'
];

const componentAllowedSortColumns = [
  'id', 'name', 'serial', 'qty', 'min_amt', 'order_number', 'purchase_cost', 'purchase_date',
  'checkoutCount', 'remaining', 'company.name'
];

const consumableAllowedSortColumns = [
  'id', 'name', 'item_no', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'created_at', 'updated_at', 'purchase_date',
  'checkoutCount', 'remaining', 'company.name'
];

const activityAllowedSortColumns = [
  'id', 'action_type', 'item_type', 'item_id', 'target_type', 'target_id', 'created_at', 'updated_at',
  'user.username', 'user.first_name', 'user.last_name'
];

router.get('/assets', errorHandler(async function (req, res, next) {
  const asset = models.asset;
  const company = models.company;
  asset.belongsTo(company, { foreignKey: 'company_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, assetAllowedSortColumns);

  let result = await asset.findAndCountAll({
    attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number',
      // 'capacity',
       'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'purchase_date',
      //  'hydrostatic_test_due_date',
        'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at',
      //     'assigned_type', [
      //         Sequelize.literal(
      //             '(SELECT CASE WHEN assigned_type = "App\\\\Models\\\\Location" THEN (SELECT name FROM locations WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\User" THEN (SELECT CONCAT(username, " ", employee_num) as name FROM users WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\Asset" THEN (SELECT name FROM assets WHERE id = `asset`.`assigned_to`) END)'), 'assigned']
    ],
    include: [
      { model: company, attributes: ['id', 'name'], required: true }
    ],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      }, firm_id: req.userInfo.firmId
    },
    order: Sequelize.literal(`${sort} ${order}`),
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatAssetResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))


router.get('/accessories', errorHandler(async function (req, res, next) {
  const accessory = models.accessory;
  const company = models.company;
  accessory.belongsTo(company, { foreignKey: 'company_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, accessoryAllowedSortColumns);

  let result = await accessory.findAndCountAll({
    attributes: [
      'id', 'name', ['qty', 'total'], ['min_amt', 'min_qty'], [Sequelize.literal('(qty - min_amt)'), 'avail']
    ],
    include: [
      { model: company, attributes: ['id', 'name'], required: true }
    ],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      }, firm_id: req.userInfo.firmId
    },
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

router.get('/depreciations', errorHandler(async function (req, res, next) {
  const depreciation = models.depreciation;
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);

  let result = await depreciation.findAndCountAll({
    attributes: ['id', 'name', 'months', 'created_at', 'updated_at'],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      },
      deleted_at: {
        [Op.eq]: null
      },
      firm_id: req.userInfo.firmId
    },
    order: [
      [sort, order]
    ],
    limit: limit,
    offset: offset
  });
  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatDepreciationResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))



router.get('/licenses', errorHandler(async function (req, res, next) {
  const license = models.license;
  const company = models.company;
  license.belongsTo(company, { foreignKey: 'company_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, licenseAllowedSortColumns);

  let result = await license.findAndCountAll({
    attributes: [
      'id', 'name', 'serial', 'license_name', 'license_email', 'notes', 'order_number', 'purchase_cost', 'purchase_order', 'seats',
      [Sequelize.literal('(SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and assigned_to is null and asset_id is null)'), 'licenseSeatCount'],
      [Sequelize.literal('seats - (SELECT COUNT(*) FROM license_seats WHERE license_id = `license`.`id` and assigned_to is not null or asset_id is not null)'), 'free_seats_count'],
    ],
    include: [
      { model: company, attributes: ['id', 'name'], required: true }
    ],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      }, firm_id: req.userInfo.firmId
    },
    order: Sequelize.literal(`${sort} ${order}`),
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatLicenseResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))

router.get('/components', errorHandler(async function (req, res, next) {
  const component = models.component;
  const company = models.company;
  component.belongsTo(company, { foreignKey: 'company_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, componentAllowedSortColumns);

  let result = await component.findAndCountAll({
    attributes: [
      'id', 'name', 'serial', 'qty', 'min_amt', 'order_number', 'purchase_cost', 'qty', 'purchase_date',
      [Sequelize.literal('(SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`)'), 'checkoutCount'],
      [Sequelize.literal('qty - (SELECT IFNULL((SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`), 0))'), 'remaining'],
    ],
    include: [
      { model: company, attributes: ['id', 'name'], required: true }
    ],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      }, firm_id: req.userInfo.firmId
    },
    order: Sequelize.literal(`${sort} ${order}`),
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatComponentsResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))
router.get('/consumables', errorHandler(async function (req, res, next) {
  const consumable = models.consumable;
  const company = models.company;
  consumable.belongsTo(company, { foreignKey: 'company_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, consumableAllowedSortColumns);

  let result = await consumable.findAndCountAll({
    attributes: [
      'id', 'name', 'item_no', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date',
      [Sequelize.literal('(SELECT count(id) FROM `consumables_users` WHERE `consumables_users`.`consumable_id` = consumable.`id`)'), 'checkoutCount'],
      [Sequelize.literal('qty - (SELECT count(id) FROM `consumables_users` WHERE `consumables_users`.`consumable_id` = consumable.`id`)'), 'remaining']
    ],
    include: [
      { model: company, attributes: ['id', 'name'], required: true }
    ],
    where: {
      name: {
        [Op.like]: '%' + search + '%'
      }, firm_id: req.userInfo.firmId
    },
    order: Sequelize.literal(`${sort} ${order}`),
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatConsumableResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))


router.get('/activity', errorHandler(async function (req, res, next) {
  const { actionLogs, user } = models;
  actionLogs.belongsTo(user, { foreignKey: 'user_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries, activityAllowedSortColumns);
  const searchCondition = search
    ? {
        [Op.or]: [
          {
            action_type: {
              [Op.like]: `%${search}%`
            }
          },
          {
            item_type: {
              [Op.like]: `%${search}%`
            }
          },
          {
            '$user.first_name$': {
              [Op.like]: `%${search}%`
            }
          },
          {
            '$user.last_name$': {
              [Op.like]: `%${search}%`
            }
          }
        ]
      }
    : {};
  let result = await actionLogs.findAndCountAll({
    attributes: [
      'id', 'action_type', 'item_type', 'item_id', 'target_type', 'target_id', 'created_at', 'updated_at',
      [Sequelize.literal("(SELECT CASE WHEN item_type = 'App\\\\Models\\\\Asset' THEN (SELECT name FROM `assets` WHERE `assets`.`id`=`actionLogs`.`item_id` and `assets`.`name` like '%" + search + "%') WHEN item_type = 'App\\\\Models\\\\Accessory' THEN (SELECT name FROM `accessories` WHERE `accessories`.`id`=`actionLogs`.`item_id` and `accessories`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\License' THEN (SELECT name FROM `licenses` WHERE `licenses`.`id`=`actionLogs`.`item_id` and `licenses`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\Component' THEN (SELECT name FROM `components` WHERE `components`.`id`=`actionLogs`.`item_id` and `components`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\Consumable' THEN (SELECT name FROM `consumables` WHERE `consumables`.`id`=`actionLogs`.`item_id` and `consumables`.`name` like '%" + search + "%')                                     END)"), 'item'],
      [Sequelize.literal("(SELECT CASE WHEN target_type = 'App\\\\Models\\\\Asset' THEN (SELECT name FROM `assets` WHERE `assets`.`id`=`actionLogs`.`target_id` and `assets`.`name` like '%" + search + "%') WHEN target_type = 'App\\\\Models\\\\Location' THEN (SELECT name FROM `locations` WHERE `locations`.`id`=`actionLogs`.`target_id` and `locations`.`name` like '%" + search + "%')             WHEN target_type = 'App\\\\Models\\\\User' THEN (SELECT first_name FROM `users` WHERE `users`.`id`=`actionLogs`.`target_id`)                                     END)"), 'checkoutItem']
    ],
    include: [
      { model: user, attributes: ['id', 'username', 'first_name', 'last_name'], required: true }
    ],
    where: {
      firm_id: req.userInfo.firmId,
      ...searchCondition
    },
    order: [
      [sort, order]
    ],
    limit: limit,
    offset: offset
  })

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatActivityResponse(row))
    })
  }

  res.json({ count: result.count, rows: response });
}))

router.get('/activityForAsset/:id', errorHandler(async function (req, res, next) {
  const { actionLogs, user } = models;
  actionLogs.belongsTo(user, { foreignKey: 'user_id' });
  const queries = req.query;
  const asset_id = _.parseInt(req.params.id);
  const { search, sort, limit, offset, order } = util.queryRequest(queries, activityAllowedSortColumns);

  let result = await actionLogs.findAndCountAll({
    attributes: [
      'id', 'action_type', 'item_type', 'item_id', 'target_type', 'target_id', 'created_at', 'updated_at',
      [Sequelize.literal("(SELECT CASE WHEN item_type = 'App\\\\Models\\\\Asset' THEN (SELECT name FROM `assets` WHERE `assets`.`id`=`actionLogs`.`item_id` and `assets`.`name` like '%" + search + "%') WHEN item_type = 'App\\\\Models\\\\Accessory' THEN (SELECT name FROM `accessories` WHERE `accessories`.`id`=`actionLogs`.`item_id` and `accessories`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\License' THEN (SELECT name FROM `licenses` WHERE `licenses`.`id`=`actionLogs`.`item_id` and `licenses`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\Component' THEN (SELECT name FROM `components` WHERE `components`.`id`=`actionLogs`.`item_id` and `components`.`name` like '%" + search + "%')              WHEN item_type = 'App\\\\Models\\\\Consumable' THEN (SELECT name FROM `consumables` WHERE `consumables`.`id`=`actionLogs`.`item_id` and `consumables`.`name` like '%" + search + "%')                                     END)"), 'item'],
      [Sequelize.literal("(SELECT CASE WHEN target_type = 'App\\\\Models\\\\Asset' THEN (SELECT name FROM `assets` WHERE `assets`.`id`=`actionLogs`.`target_id` and `assets`.`name` like '%" + search + "%') WHEN target_type = 'App\\\\Models\\\\Location' THEN (SELECT name FROM `locations` WHERE `locations`.`id`=`actionLogs`.`target_id` and `locations`.`name` like '%" + search + "%')             WHEN target_type = 'App\\\\Models\\\\User' THEN (SELECT first_name FROM `users` WHERE `users`.`id`=`actionLogs`.`target_id`)    WHEN target_type = 'App\\\\Models\\\\Department' THEN (SELECT name FROM `departments` WHERE `departments`.`id`=`actionLogs`.`target_id` and `departments`.`name` like '%" + search + "%')                                    END)"), 'checkoutItem']
    ],
    include: [
      { model: user, attributes: ['id', 'username', 'first_name', 'last_name'], required: true }
    ],
    where: {
      item_id:asset_id,
      firm_id: req.userInfo.firmId
    },
    order: [
      [sort, order]
    ],
    limit: limit,
    offset: offset
  })

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push(formatActivityResponse(row))
    })
  }

  res.json({ count: result.count, rows: response });
}))

function getItem(row) {
  let response = { id: row.item_id, name: row.dataValues.item, notes: row.dataValues.notes }
  switch (row.item_type) {
    case constants.itemTypes.asset:
      response.type = 'Asset'
      break;
    case constants.itemTypes.consumable:
      response.type = 'Consumable'
      break;
    case constants.itemTypes.component:
      response.type = 'Component'
      break;
    case constants.itemTypes.license:
      response.type = 'License'
      break;
    case constants.itemTypes.accessory:
      response.type = 'Accessory'
      break;
  }
  return response
}
function formatAssetResponse(row) {
  let status = util.getRelationalObject(row.statusLabel)
  status.status_meta = _.isNil(row.last_checkout) ? status.name : 'deployed'
  return {
    id: row.id,
    asset_tag: row.asset_tag,
    assetdetails: row.assetdetails,
    //assetdetails: JSON.parse(asset.assetdetails),
    requestable: row.requestable,
     assigned_to: row.assigned_to,
    //available_actions: { checkout: true, checkin: true, clone: true, restore: false, update: true, delete: false },
    //category: util.getRelationalObject(asset.model.category),
    checkin_counter: row.checkin_counter,
    checkout_counter: row.checkout_counter,
     company: row.company.name,
     created_at: util.createdUpdatedDateFormat(row.created_at),
    // custom_fields: [],
    // deleted_at: util.createdUpdatedDateFormat(asset.deleted_at),
    // eol: asset.model.eol,
    expected_checkin: row.expected_checkin,
    image: row.image,
    // last_audit_date: util.createdUpdatedDateFormat(asset.last_audit_date),
    // last_checkout: util.createdUpdatedDateFormat(asset.last_checkout),
    // location: util.getRelationalObject(asset.location),
    // manufacturer: util.getRelationalObject(asset.model.manufacturer),
    // model: util.getRelationalObject(asset.model),
    // model_number: row.model.model_number, // asset.model_number,
    name: row.name,
    //next_audit_date: util.createdUpdatedDateFormat(asset.next_audit_date),
    notes: row.notes,
    order_number: row.order_number,
    // capacity: row.capacity,
    purchase_cost: row.purchase_cost,
    purchase_date: {
        date: util.formatDate(row.purchase_date, 'YYYY-MM-DD'),
        formatted: util.formatDate(row.purchase_date, 'YYYY-MM-DD')
    },
    // hydrostatic_test_due_date: {
    //     date: util.formatDate(row.hydrostatic_test_due_date, 'YYYY-MM-DD'),
    //     formatted: util.formatDate(row.hydrostatic_test_due_date, 'YYYY-MM-DD')
    // },
    requests_counter: row.requests_counter,
    // rtd_location: util.getRelationalObject(asset.rtdLocation),
    serial: row.serial,
    //  status_label: status,
    // supplier: util.getRelationalObject(asset.supplier),
    updated_at: util.createdUpdatedDateFormat(row.updated_at),
    // user_can_checkout: _.isNil(asset.assigned_to) ? true : false,
    // warranty_expires: util.createdUpdatedDateFormat(asset.warranty_expires),
    warranty_months: row.warranty_months
  }
}
function getTargetItem(row) {
  let response = { id: row.target_id, name: row.dataValues.checkoutItem }
  switch (row.target_type) {
    case constants.itemTypes.asset:
      response.type = 'asset'
      break;
    case constants.itemTypes.location:
      response.type = 'location'
      break;
    case constants.itemTypes.department:
      response.type = 'department'
      break;
    case constants.itemTypes.user:
      response.type = 'user'
      //      response.name = `${row.dataValues.first_name} ${row.dataValues.last_name}`
      break;
  }
  return response
}

function formatConsumableResponse(row) {
  const checkoutCount = _.isNil(row.dataValues.checkoutCount) ? 0 : row.dataValues.checkoutCount
  const remainingQty = row.qty - checkoutCount

  return {
    id: row.id,
    name: row.name,
    item_no: row.item_no,
    image: _.isNil(row.image) ? '' : row.image,
    min_amt: row.min_amt,
    min_qty: row.min_amt,
    model_number: row.model_number,
    order_number: row.order_number,
    purchase_cost: row.purchase_cost,
    qty: row.qty,
    remaining: row.dataValues.remaining,
    remaining_qty: row.dataValues.remaining,

  }
}
function formatActivityResponse(row) {
  return {
    id: row.id,
    action_type: row.action_type,
    admin: _.isNil(row.user) ? {} : { id: row.user.id, first_name: row.user.first_name, last_name: row.user.last_name, name: `${row.user.first_name} ${row.user.last_name}` },
    created_at: util.createdUpdatedDateFormat(row.created_at),
    updated_at: util.createdUpdatedDateFormat(row.updated_at),
    item: getItem(row),
    target: _.isNil(row.target_type) ? '' : getTargetItem(row),
    name: row.item,
    notes: row.notes
  }
}

function formatComponentsResponse(row) {
  //const remainingQty = row.qty - row.dataValues.checkoutCount;
  return {
    id: row.id,
    name: row.name,
    image: _.isNil(row.image) ? '' : row.image,
    min_amt: row.min_amt,
    serial: row.serial,
    order_number: row.order_number,
    purchase_cost: row.purchase_cost,
    qty: row.qty,
    remaining: _.parseInt(row.dataValues.remaining)


  }
}


function formatDepreciationResponse(row) {
  return {
    id: row.id,
    name: row.name,
    months: row.months,
    available_actions: util.getAvailableActions([]),
    created_at: util.createdUpdatedDateFormat(row.created_at),
    updated_at: util.createdUpdatedDateFormat(row.updated_at)
  }
}

function formatResponse(row) {
  //const remainingQty = row.dataValues.total - row.min_amt;
  return {
    id: row.id,
    name: row.name,
    min_qty: row.dataValues.min_qty,
    total: row.dataValues.total,
    avail: row.dataValues.avail,
    company: util.getRelationalObject(row)
  }
}

function formatLicenseResponse(row) {
  //const remainingQty = _.isNil(row.dataValues.licenseSeatCount) ? row.seats : row.dataValues.licenseSeatCount
  //const remainingQty = row.seats - checkoutCount
  return {
    id: row.id,
    name: row.name,
    free_seats_count: row.dataValues.free_seats_count,
    license_name: row.license_name,
    license_email: row.license_email,
    serial: row.serial,
    notes: row.notes,
    order_number: row.order_number,

    purchase_cost: row.purchase_cost,
    purchase_order: row.purchase_order,

    seats: row.seats,

  }
}


module.exports = router;

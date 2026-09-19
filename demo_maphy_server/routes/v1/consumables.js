var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const consumableUser = models.consumableUser;
const user = models.user;
const constants = require('../../shared/constants');
var { errorHandler } = require('../../shared/error-handler');
consumableUser.belongsTo(user, { foreignKey: 'assigned_to', as: 'assignedUser' });
consumableUser.belongsTo(user, { foreignKey: 'user_id', as: 'createdUser' });

router.get('/', errorHandler(async function (req, res, next) {
  const consumable = models.consumable;
  const category = models.category;
  const company = models.company;
  const location = models.location;
  const manufacturer = models.manufacturer;
  //    const consumableUser = models.consumableUser;
  consumable.belongsTo(category, { foreignKey: 'category_id' });
  consumable.belongsTo(company, { foreignKey: 'company_id' });
  consumable.belongsTo(location, { foreignKey: 'location_id' });
  consumable.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
  consumable.hasMany(consumableUser, { foreignKey: 'consumable_id' });
  let isSuperuser = req.userInfo.isSuperuser
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);
  let where = [{
    name: {
      [Op.like]: '%' + search + '%'
    },
    deleted_at: {
      [Op.eq]: null
    }
  }, { firm_id: req.userInfo.firmId }]
  util.addCondition(queries.company_id, where, { company_id: queries.company_id })
  util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id })
  util.addCondition(queries.category_id, where, { category_id: queries.category_id })
  util.addCondition(queries.location_id, where, { location_id: queries.location_id })
  
  let assigned_to = req.userInfo.userId
  if (!_.isNil(queries.assigned_to)) {
    assigned_to = queries.assigned_to
    isSuperuser = false
  }

  let consumableIds = []
  if (!isSuperuser) {
    const consumableUserResponse = await consumableUser.findAll({ attributes: ['consumable_id'], where: { assigned_to: _.isNil(assigned_to) ? req.userInfo.userId : assigned_to } })
    if (!_.isEmpty(consumableUserResponse)) {
      _.map(consumableUserResponse, accUser => { consumableIds.push(accUser.consumable_id) })
      where.push({ id: { [Op.in]: consumableIds } })
    }
    where.push([{
      [Op.or]: [
        { id: { [Op.in]: consumableIds } }
        // {
        //   user_id: req.userInfo.userId
        // }
      ]
    }])
  }

  // if (_.isEmpty(consumableIds) && !isSuperuser) {
  //   res.json({ total: 0, rows: [] });
  // } else {
  let result = await consumable.findAndCountAll({
    attributes: [
      'id', 'name', 'item_no', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date',
      [Sequelize.literal('(SELECT count(id) FROM `consumables_users` WHERE `consumables_users`.`consumable_id` = consumable.`id`)'), 'checkoutCount'],
      [Sequelize.literal('qty - (SELECT count(id) FROM `consumables_users` WHERE `consumables_users`.`consumable_id` = consumable.`id`)'), 'remaining']
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: false },
      { model: location, attributes: ['id', 'name'], required: false },
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

router.get('/chart', errorHandler(async (req, res, next) => {
  const { consumable, consumableUser } = models;
  const queries = req.query;
  const { search } = util.queryRequest(queries);
  const Op = Sequelize.Op;

  // Build WHERE conditions
  let where = {
    deleted_at: null,
    firm_id: req.userInfo.firmId,
    name: { [Op.like]: `%${search}%` }
  };

  util.addCondition(queries.company_id, where, { company_id: queries.company_id });
  util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id });
  util.addCondition(queries.category_id, where, { category_id: queries.category_id });

  let assigned_to = req.userInfo.userId;
  let isSuperuser = req.userInfo.isSuperuser;

  if (!_.isNil(queries.assigned_to)) {
    assigned_to = queries.assigned_to;
    isSuperuser = false;
  }

  let consumableIds = [];
  if (!isSuperuser) {
    const consumableUserResponse = await consumableUser.findAll({
      attributes: ['consumable_id'],
      where: { assigned_to }
    });
    if (!_.isEmpty(consumableUserResponse)) {
      consumableIds = consumableUserResponse.map(cu => cu.consumable_id);
      where.id = { [Op.in]: consumableIds };
    }
  }

  // Main findAndCountAll query
  const result = await consumable.findAndCountAll({
    attributes: [
      'id', 'name', 'qty',
      [Sequelize.literal(`(SELECT COUNT(id) FROM consumables_users WHERE consumables_users.consumable_id = consumable.id)`), 'checkoutCount'],
      [Sequelize.literal(`qty - (SELECT COUNT(id) FROM consumables_users WHERE consumables_users.consumable_id = consumable.id)`), 'remaining']
    ],
    where,
    raw: false
  });

  // Sum totals in JS
  let totalQty = 0;
  let totalCheckoutCount = 0;
  let totalRemainingQty = 0;

  result.rows.forEach(row => {
    totalQty += Number(row.qty);
    totalCheckoutCount += Number(row.get('checkoutCount'));
    totalRemainingQty += Number(row.get('remaining'));
  });

  // Return JSON response
  res.json({
    totalQty,
    totalCheckoutCount,
    totalRemainingQty,
  });

}));


router.get('/selectList', errorHandler(async function (req, res, next) {
  const consumable = models.consumable;
  const response = await util.getSelectList(consumable, req)
  res.json(response);
}))

router.get('/:id', errorHandler(async function (req, res, next) {
  const consumable = models.consumable;
  const category = models.category;
  const company = models.company;
  const location = models.location;
  const manufacturer = models.manufacturer;
  consumable.belongsTo(category, { foreignKey: 'category_id' });
  consumable.belongsTo(company, { foreignKey: 'company_id' });
  consumable.belongsTo(location, { foreignKey: 'location_id' });
  consumable.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });

  const id = _.parseInt(req.params.id);
  let result = await consumable.findOne({
    attributes: [
      'id', 'name', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'qty', 'item_no','created_at', 'updated_at', 'purchase_date'
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: true },
      { model: location, attributes: ['id', 'name'], required: true },
      { model: manufacturer, attributes: ['id', 'name'], required: true }
    ],
    where: { id: id }
  });
  const response = _.isNil(result) ? {} : formatResponse(result);

  res.json(response);
}))

router.get('/:id/checkout', errorHandler(async function (req, res, next) {
  const consumable = models.consumable;
  const id = _.parseInt(req.params.id);
  let result = await consumable.findOne({
    attributes: [
      'id', 'name'
    ],
    where: { id: id }
  });
  const response = _.isNil(result) ? {} : { id: result.id, name: result.name };

  res.json(response);
}))

router.get('/view/:id/users', errorHandler(async function (req, res, next) {
  const queries = req.query;
  const { sort, limit, offset, order } = util.queryRequest(queries);
  var fullUrl = req.protocol + '://' + req.get('host');
  let result = await consumableUser.findAll({
    attributes: [
      'created_at'
    ],
    include: [
      { model: user, as: 'assignedUser', attributes: ['id', 'first_name', 'last_name'] },
      { model: user, as: 'createdUser', attributes: ['id', 'first_name', 'last_name'] }
    ],
    where: {
      consumable_id: req.params.id
    },

    // order: [
    //     [sort, order]
    // ],
    limit: limit,
    offset: offset
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result, row => {
      response.push({
        admin: `${row.createdUser.first_name} ${row.createdUser.last_name}`,
        urlAdmin: `<a href='${fullUrl}/users/${row.createdUser.id}'>${row.createdUser.first_name} ${row.createdUser.last_name}></a>`,
        created_at: util.createdUpdatedDateFormat(row.created_at),
        urlName: `<a href='${fullUrl}/users/${row.createdUser.id}'>${row.assignedUser.first_name} ${row.assignedUser.last_name}></a>`,
        name: `${row.assignedUser.first_name} ${row.assignedUser.last_name}`,
      })
    })
  }
  res.json({ total: _.size(response), rows: response });
  //res.json(response);
}))

router.post('/', errorHandler(async function (req, res, next) {
  const { consumable, actionLogs } = models;
  req.body.user_id = req.userInfo.userId
  let { types, fieldsLength, errorMessages } = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName))
  fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName))
  fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName))
  fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty))
  fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, true, types.string, errorMessages.minQty))
  fields.push(util.addFields(req.body.item_no, fieldsLength.oneNineOne, true, types.string, errorMessages.itemNumber))
  fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate))
  fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost))
  fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber))
  fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber))
  fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName))
  let id
  const errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, consumable)
  if (!_.isEmpty(errors)) {
    res.result = { error: errors }
  } else {
    await sequelize.transaction(t => {
      return consumable.create(req.body, { transaction: t }).then(r => {
        id = r.id
        const { actionTypes, itemTypes } = constants;
        const actionLog = {
          action_type: actionTypes.update,
          item_type: itemTypes.consumable,
          user_id: req.userInfo.userId,
          item_id: r.id,
          firm_id: req.userInfo.firmId
        }
        return actionLogs.create(actionLog, { transaction: t });
      })
    }).then(function (result) {
      res.result = { id: result.id }
    }).catch(function (err) {
      res.result = { error: err.message }
    })
  }
  next()
}))

router.post('/:id/checkout', errorHandler(async function (req, res, next) {
  const actionLogs = models.actionLogs;
  req.body.consumable_id = req.params.id;
  req.body.user_id = req.userInfo.userId;
  //let result = await consumableUser.create(req.body);
  await sequelize.transaction(t => {
    return consumableUser.create(req.body, { transaction: t }).then(r => {
      const { actionTypes, itemTypes } = constants;
      const actionLog = {
        action_type: actionTypes.checkout,
        item_type: itemTypes.consumable,
        user_id: req.userInfo.userId,
        item_id: req.params.id,
        target_id: req.body.assigned_to,
        target_type: constants.itemTypes.user,
        notes: req.body.notes,
        firm_id: req.userInfo.firmId
      }
      return actionLogs.create(actionLog, { transaction: t });
    })
  }).then(() => {
    res.result = { id: req.params.id }
  }).catch(err => {
    res.result = { error: err.message }
  })

  next()
}))

router.put('/:id', errorHandler(async function (req, res, next) {
  const { consumable, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId;
  let current_qty = req.body.qty;
  let { types, fieldsLength, errorMessages } = constants;
  let consumables_details = await consumable.findOne({
    raw: true,
    attributes: [
      'qty',
      [Sequelize.literal('(SELECT COUNT(*) FROM consumables_users WHERE consumable_id = `consumable`.`id`) '), 'alottedConsumablesCount'],

    ],
    where: { id: id }
  });
  if (_.gte(current_qty, consumables_details.alottedConsumablesCount)) {
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName ))
    //  fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName))
    //  fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName))
    //  fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty))
    //  fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, true, types.string, errorMessages.minQty))
    //  fields.push(util.addFields(req.body.item_no, fieldsLength.oneNineOne, true, types.string, errorMessages.itemNumber))
    //  fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate))
    //  fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost))
    //  fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber))
    //  fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber))
    //  fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName))

    const errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId, id: { [Op.ne]: req.params.id } }, fields, consumable)
    if (!_.isEmpty(errors)) {
      res.result = { error: errors }
    } else {
      await sequelize.transaction(t => {
        return consumable.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
          const { actionTypes, itemTypes } = constants;

          const actionLog = {
            action_type: actionTypes.update,
            item_type: itemTypes.consumable,
            user_id: req.userInfo.userId,
            item_id: id,
            notes: req.body.notes,
            firm_id: req.userInfo.firmId
          }
          return actionLogs.create(actionLog, { transaction: t });
        })
      }).then(() => {
        res.result = { id: id }
      }).catch(err => {
        res.result = { error: err.message }
      })
    }
  }
  else {
    res.result = { success: false, error: "This consumable is currently checked out and cannot be deleted.Please check the Consumables first" }
  }
  next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
  const { consumable, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId
  req.body.deleted_at = new Date()
  await sequelize.transaction(t => {
    return consumable.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
      const { actionTypes, itemTypes } = constants;

      const actionLog = {
        action_type: actionTypes.delete,
        item_type: itemTypes.consumable,
        user_id: req.userInfo.userId,
        item_id: id,
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

function formatResponse(row) {
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
    category: util.getRelationalObject(row.category),
    manufacturer: util.getRelationalObject(row.manufacturer),
    location: util.getRelationalObject(row.location),
    company: util.getRelationalObject(row.company),
    created_at: util.createdUpdatedDateFormat(row.created_at),
    updated_at: util.createdUpdatedDateFormat(row.updated_at),
    purchase_date: {
      date: util.formatDate(row.purchase_date, 'YYYY-MM-DD'),
      formatted: util.formatDate(row.purchase_date, 'YYYY-MM-DD')
    },
    user_can_checkout: _.eq(row.dataValues.remaining, 0) ? false : true,
    available_actions: {
      checkout: true,
      checkin: false,
      update: true,
      delete: true
    }
  }
}

module.exports = router;


var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
var { errorHandler } = require('../../shared/error-handler')

/**
 * @swagger
 * /api/v1/components:
 *  get:
 *    description: get all the components
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function (req, res, next) {
  const component = models.component;
  const category = models.category;
  const company = models.company;
  const location = models.location;
  const componentAsset = models.componentAsset;
  component.belongsTo(category, { foreignKey: 'category_id' });
  component.belongsTo(company, { foreignKey: 'company_id' });
  component.belongsTo(location, { foreignKey: 'location_id' });
  componentAsset.belongsTo(component, { foreignKey: 'component_id' });
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);
  let where = [{
    name: {
      [Op.like]: '%' + search + '%'
    }
  }, {
    deleted_at: {
      [Op.eq]: null
    }
  }, { firm_id: req.userInfo.firmId }]
  util.addCondition(queries.company_id, where, { company_id: queries.company_id })
  util.addCondition(queries.location_id, where, { location_id: queries.location_id })
  util.addCondition(queries.category_id, where, { category_id: queries.category_id })
  let isSuperuser = req.userInfo.isSuperuser

  if (!_.isNil(queries.asset_id)) {
    let componentIds = []
    const componentAssetResponse = await componentAsset.findAll({ attributes: ['component_id'], where: { asset_id: _.parseInt(queries.asset_id) } })
    if (!_.isEmpty(componentAssetResponse)) {
      _.map(componentAssetResponse, accUser => { componentIds.push(accUser.component_id) })
    }
    where.push({ id: { [Op.in]: componentIds } })
  } else {
    if (!isSuperuser) {
      where.push({ user_id: req.userInfo.userId })
    }
  }
  let result = await component.findAndCountAll({
    attributes: [
      'id', 'name', 'serial', 'qty', 'min_amt', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date',
      [Sequelize.literal('(SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`)'), 'checkoutCount'],
      [Sequelize.literal('qty - (SELECT IFNULL((SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`), 0))'), 'remaining'],
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: false },
      { model: location, attributes: ['id', 'name'], required: false }
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

router.get('/chart', errorHandler(async function (req, res, next) {
  const { component, componentAsset } = models;
  const queries = req.query;
  const { search } = util.queryRequest(queries);

  let where = [{
    name: { [Op.like]: `%${search}%` }
  }, {
    deleted_at: { [Op.eq]: null }
  }, { firm_id: req.userInfo.firmId }];

  util.addCondition(queries.company_id, where, { company_id: queries.company_id });
  util.addCondition(queries.location_id, where, { location_id: queries.location_id });
  util.addCondition(queries.category_id, where, { category_id: queries.category_id });

  let isSuperuser = req.userInfo.isSuperuser;

  if (!_.isNil(queries.asset_id)) {
    let componentIds = [];
    const componentAssetResponse = await componentAsset.findAll({
      attributes: ['component_id'],
      where: { asset_id: _.parseInt(queries.asset_id) }
    });
    if (!_.isEmpty(componentAssetResponse)) {
      componentIds = componentAssetResponse.map(item => item.component_id);
    }
    where.push({ id: { [Op.in]: componentIds } });
  } else {
    if (!isSuperuser) {
      where.push({ user_id: req.userInfo.userId });
    }
  }

  // Aggregate sums query
  const result = await models.component.findAndCountAll({
    attributes: [
      'id', 'name', 'qty',
      [Sequelize.literal(`(SELECT IFNULL(SUM(assigned_qty), 0) FROM components_assets WHERE components_assets.component_id = component.id)`), 'checkoutCount'],
      [Sequelize.literal(`qty - (SELECT IFNULL(SUM(assigned_qty), 0) FROM components_assets WHERE components_assets.component_id = component.id)`), 'remainingQty']
    ],
    where:where
  });
  
  // Now, sum up totalQty, totalCheckoutCount, totalRemainingQty
  let totalQty = 0;
  let totalCheckoutCount = 0;
  let totalRemainingQty = 0;
  
  result.rows.forEach(row => {
    totalQty += Number(row.qty);
    totalCheckoutCount += Number(row.get('checkoutCount'));
    totalRemainingQty += Number(row.get('remainingQty'));
  });
  
  res.json({
    totalQty,
    totalCheckoutCount,
    totalRemainingQty,
  });
}));


router.get('/selectList', errorHandler(async function (req, res, next) {
  const component = models.component;
  const response = await util.getSelectList(component, req)
  res.json(response);
}))

router.get('/:id/assets', errorHandler(async function (req, res, next) {
  const component = models.component;
  const componentAsset = models.componentAsset;
  const asset = models.asset;
  const model = models.model;
  componentAsset.belongsTo(component, { foreignKey: 'component_id' });
  componentAsset.belongsTo(asset, { foreignKey: 'asset_id' });
  asset.belongsTo(model, { foreignKey: 'model_id' });

  const id = _.parseInt(req.params.id);
  let result = await componentAsset.findAndCountAll({
    attributes: [
      'id', 'assigned_qty', 'asset_id', 'created_at', 'updated_at'
    ],
    include: [
      { model: component, attributes: ['id', 'name'], required: false },
      {
        model: asset, attributes: ['id', 'name', 'asset_tag'], required: true,
        include: [
          { model: model, required: true, attributes: ['id', 'name', 'model_number'] }
        ]
      }
      //  {model: company, attributes: ['id', 'name'], required: true},
      //  {model: location, attributes: ['id', 'name'], required: true}
    ],
    where: { component_id: id, assigned_qty: { [Op.gt]: 0 } }
  });

  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push({
        assigned_pivot_id: row.id,
        available_actions: { checkin: true },
        created_at: util.formatDate(row.created_at),
        id: row.asset.id,
        name: `${row.asset.model.name} ${row.asset.name} (${row.asset.asset_tag})`,
        qty: row.assigned_qty,
        type: "asset"
      })
    })
  }

  res.json({ total: result.count, rows: response });
}))

router.get('/:id', errorHandler(async function (req, res, next) {
  const component = models.component;
  const category = models.category;
  const company = models.company;
  const location = models.location;
  component.belongsTo(category, { foreignKey: 'category_id' });
  component.belongsTo(company, { foreignKey: 'company_id' });
  component.belongsTo(location, { foreignKey: 'location_id' });

  const id = _.parseInt(req.params.id);
  let result = await component.findOne({
    attributes: [
      'id', 'name', 'serial', 'qty', 'min_amt', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date',
      [Sequelize.literal('(SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`)'), 'checkoutCount'],
      [Sequelize.literal('qty - (SELECT IFNULL((SELECT SUM(assigned_qty) FROM `components_assets` WHERE `components_assets`.`component_id` = component.`id`), 0))'), 'remaining'],
    ],
    include: [
      { model: category, attributes: ['id', 'name'], required: true },
      { model: company, attributes: ['id', 'name'], required: true },
      { model: location, attributes: ['id', 'name'], required: true }
    ],
    where: { id: id }
  });
  const response = _.isNil(result) ? {} : formatResponse(result);

  res.json(response);
}))


router.post('/', errorHandler(async function (req, res, next) {
  const { component, actionLogs } = models;
  req.body.user_id = req.userInfo.userId
  let { types, fieldsLength, errorMessages } = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName))
  fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName))
  fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName))
  fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty))
  fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, true, types.string, errorMessages.minQty))
  fields.push(util.addFields(req.body.serial, fieldsLength.oneNineOne, true, types.string, errorMessages.serialNumber))
  fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate))
  fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost))
  fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber))

  const errors = await util.checkRequest('', fields, component)
  if (!_.isEmpty(errors)) {
    res.result = { error: errors }
  } else {
    await sequelize.transaction(t => {
      return component.create(req.body, { transaction: t }).then(r => {
        id = r.id
        const { actionTypes, itemTypes } = constants;
        const actionLog = {
          action_type: actionTypes.create,
          item_type: itemTypes.component,
          user_id: req.userInfo.userId,
          item_id: r.id,
          firm_id: req.userInfo.firmId
        }
        return actionLogs.create(actionLog, { transaction: t });
      })
    }).then(result => {
      res.result = { id: result.id }
    }).catch(err => {
      res.error = { error: err.message }
    })
  }
  next()
}))

router.post('/:id/checkout', errorHandler(async function (req, res, next) {
  const { componentAsset, actionLogs } = models;
  req.body.component_id = req.params.id;
  req.body.user_id = req.userInfo.userId
  //let result = await componentAsset.create(req.body);
  await sequelize.transaction(t => {
    return componentAsset.create(req.body, { transaction: t }).then(r => {
      const { actionTypes, itemTypes } = constants;
      const actionLog = {
        action_type: actionTypes.checkout,
        item_type: itemTypes.component,
        user_id: req.userInfo.userId,
        item_id: req.params.id,
        target_id: req.body.asset_id,
        target_type: constants.itemTypes.asset,
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

router.post('/:id/checkin', errorHandler(async function (req, res, next) {
  const { componentAsset, actionLogs } = models;
  //req.body.component_id = req.params.id;
  req.body.user_id = req.userInfo.userId

  const response = await componentAsset.findOne({ where: { id: req.params.id } })
  req.body.assigned_qty = _.parseInt(response.assigned_qty) - _.parseInt(req.body.assigned_qty)
  if (req.body.assigned_qty < 0) {
    res.result = { error: 'checkin qty should be less than checkout qty' }
  } else {
    //let result = await componentAsset.update(req.body, {where: {id: req.params.id}});
    await sequelize.transaction(t => {
      return componentAsset.update(req.body, { where: { id: req.params.id } }, { transaction: t }).then(r => {
        const { actionTypes, itemTypes } = constants;
        const actionLog = {
          action_type: actionTypes.checkInFrom,
          item_type: itemTypes.component,
          user_id: req.userInfo.userId,
          item_id: response.component_id,
          target_id: response.asset_id,
          target_type: constants.itemTypes.asset,
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
  }
  next()
}))

router.put('/:id', errorHandler(async function (req, res, next) {
  const { component, actionLogs } = models;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId;
  let current_qty = req.body.qty;
  let { types, fieldsLength, errorMessages } = constants;
  let component_details = await component.findOne({
    raw: true,
    attributes: [
      'qty',
      [Sequelize.literal('(SELECT COALESCE(SUM(assigned_qty),0) FROM components_assets WHERE component_id = `component`.`id`) '), 'alottedComponentCount'],
    ],
    where: { id: id }
  });

  if (_.gte(current_qty, _.parseInt(component_details.alottedComponentCount))) {
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName ))
    //  fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName))
    //  fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName))
    //  fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty))
    //  fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, false, types.string, errorMessages.minQty))
    //  fields.push(util.addFields(req.body.serial, fieldsLength.oneNineOne, true, types.string, errorMessages.serialNumber))
    //  fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate))
    //  fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost))
    //  fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber))

    const errors = await util.checkRequest('', fields, component)
    if (!_.isEmpty(errors)) {
      res.result = { error: errors }
    } else {
      await sequelize.transaction(t => {
        return component.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
          const { actionTypes, itemTypes } = constants;
          const actionLog = {
            action_type: actionTypes.update,
            item_type: itemTypes.component,
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
    res.result = { success: false, error: "This component is currently checked out and cannot be deleted.Please check the Components first" }
  }

  next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
  const { component, actionLogs } = models
  const id = _.parseInt(req.params.id)
  req.body.deleted_at = new Date()
  req.body.user_id = req.userInfo.userId
  await sequelize.transaction(t => {
    return component.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
      const { actionTypes, itemTypes } = constants;
      const actionLog = {
        action_type: actionTypes.delete,
        item_type: itemTypes.component,
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
    remaining: _.parseInt(row.dataValues.remaining),
    category: util.getRelationalObject(row.category),
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

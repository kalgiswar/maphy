var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var {errorHandler} = require('../../../shared/error-handler')

/**
 * @swagger
 * /api/v1/models:
 *  get:
 *    description: get all the models
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function(req, res, next) {
    const model = models.model;
    const category = models.category;
    const manufacturer = models.manufacturer;
    const depreciation = models.depreciation;
    model.belongsTo(category, {foreignKey: 'category_id'});
    model.belongsTo(manufacturer, {foreignKey: 'manufacturer_id'});
    model.belongsTo(depreciation, {foreignKey: 'depreciation_id'});

    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);
    let isDeleteRequest = false
    if (_.isNil(queries.status) || _.isEmpty(queries.status))
        isDeleteRequest = false
    else if (_.eq(queries.status, 'deleted')) {
        isDeleteRequest = true
    }

    let result = await model.findAndCountAll({
            attributes: ['id', 'name', 'image', 'model_number', 'eol', 'notes', 'requestable', 'created_at','updated_at', 'deleted_at',
                [Sequelize.literal('(SELECT COUNT(`assets`.`id`) FROM `assets` WHERE `assets`.`model_id` = `model`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL)'), 'assets_count']
            ],
            include: [
                {model: category, required: true, attributes: ['id', 'name']},
                {model: manufacturer, required: true, attributes: ['id', 'name']},
                {model: depreciation, attributes: ['id', 'name']}
            ],
            where: {name: {
                [Op.like]: '%'+ search+'%'
            }, firm_id: req.userInfo.firmId,
            deleted_at: isDeleteRequest ? {
              [Op.ne]: null
            } : {[Op.eq]: null}
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

router.get('/selectList', errorHandler(async function(req, res, next) {
  const model = models.model;
  const response = await util.getSelectList(model, req)
  res.json(response);  
}))

router.get('/:id', errorHandler(async function(req, res, next) {
    const model = models.model;
    const category = models.category;
    const manufacturer = models.manufacturer;
    const depreciation = models.depreciation;
    model.belongsTo(category, {foreignKey: 'category_id'});
    model.belongsTo(manufacturer, {foreignKey: 'manufacturer_id'});
    model.belongsTo(depreciation, {foreignKey: 'depreciation_id'});

    const id = _.parseInt(req.params.id);
    let result = await model.findOne({
        attributes: ['id', 'name', 'image', 'model_number', 'eol', 'notes', 'requestable', 'created_at','updated_at', 'deleted_at',
        [Sequelize.literal('(SELECT COUNT(`assets`.`id`) FROM `assets`)'), 'assets_count']
    ],
    include: [
        {model: category, required: true, attributes: ['id', 'name']},
        {model: manufacturer, required: true, attributes: ['id', 'name']},
        {model: depreciation, attributes: ['id', 'name']}
    ],
    where: {id: id}
    }
    );
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  }))

router.post('/', errorHandler(async function(req, res, next) {
  const model = models.model;
  req.body.user_id = req.userInfo.userId
  let {types, fieldsLength, errorMessages} = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber, `The number ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName))
  // fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName))
  // fields.push(util.addFields(req.body.notes, fieldsLength.oneNineOne, true, types.string, errorMessages.notes))

  // fields.push(util.addFields(req.body.eol, fieldsLength.oneNineOne, true, types.string, errorMessages.eol))
  // fields.push(util.addFields(req.body.depreciation_id, fieldsLength.oneNineOne, true, types.string, errorMessages.depreciationName))
  const errors = await util.checkRequest({name: req.body.name, firm_id: req.userInfo.firmId}, fields, model)
  if (!_.isEmpty(errors)) {
    res.result = {error: errors}
  } else {
    let result = await model.create(req.body);

    res.result = result;
  }
  next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
  const model = models.model;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId
  let {types, fieldsLength, errorMessages} = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))

  // fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber, `The number ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName))
  // fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName))
  // fields.push(util.addFields(req.body.notes, fieldsLength.oneNineOne, true, types.string, errorMessages.notes))

  // fields.push(util.addFields(req.body.eol, fieldsLength.oneNineOne, true, types.string, errorMessages.eol))
  // fields.push(util.addFields(req.body.depreciation_id, fieldsLength.oneNineOne, true, types.string, errorMessages.depreciationName))
 const errors = await util.checkRequest('', fields, model)
  if (!_.isEmpty(errors)) {
    res.result = {error: errors}
  } else {
    let result = await model.update(req.body, {where: {id: id}});
    
    res.result = result;
  }
  next()
}))

router.put('/restore/:id', errorHandler(async function(req, res, next) {
    const model = models.model;
    const id = _.parseInt(req.params.id)
    const modelRequest = {
      deleted_at: null,
      user_id: req.userInfo.userId
    }
    let result = await model.update(modelRequest, {where: {id: id}});
  
    res.result = result;
    next()
  }))
  
router.delete('/:id', errorHandler(async function(req, res, next) {
    const model = models.model;
    const id = _.parseInt(req.params.id)
    var datetime = new Date();
    const modelRequest = {
      deleted_at: datetime,
      user_id: req.userInfo.userId
    } 
    req.body.user_id = req.userInfo.userId
    let result = await model.update(modelRequest, {where: {id: id}});

    // let result = await model.destroy({where: {id: id}});
  
    res.result = result;
    next()
}))

function formatResponse(model) {
    return  {
      id: model.id,
      name: model.name,
      image: model.image,
      notes: model.notes,
      eol: model.eol,
      requestable: model.requestable,
      model_number: model.model_number,
      created_at: util.createdUpdatedDateFormat(model.created_at),
      updated_at: util.createdUpdatedDateFormat(model.updated_at),
      deleted_at: util.formatDate(model.deleted_at),
      assets_count: model.dataValues.assets_count,
      available_actions: {update: true, delete: false, clone: true, restore: false},
      manufacturer: util.getRelationalObject(model.manufacturer),
      category: util.getRelationalObject(model.category),
      depreciation: util.getRelationalObject(model.depreciation)
    }
}

module.exports = router;

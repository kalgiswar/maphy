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
 * /api/v1/suppliers:
 *  get:
 *    description: get all the suppliers
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
const supplierAllowedSortColumns = [
  'id', 'name', 'image', 'address', 'address2', 'city', 'state', 'country', 'zip', 'phone', 'fax', 'email', 'contact', 'notes', 'url', 'created_at', 'updated_at',
  'accessories_count', 'assets_count', 'licenses_count'
];

router.get('/', errorHandler(async function(req, res, next) {
    const supplier = models.supplier;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries, supplierAllowedSortColumns);

    let result = await supplier.findAndCountAll({
          attributes: ['id', 'name', 'image', 'address', 'address2', 'city', 'state', 'country', 'zip', 'phone', 'fax', 'email', 'contact', 'notes', 'url', 'created_at', 'updated_at',
            [Sequelize.literal('(SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`supplier_id` = `supplier`.`id` AND `accessories`.`firm_id`=' + req.userInfo.firmId + ' AND `accessories`.`deleted_at` IS NULL)'), 'accessories_count'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`supplier_id` = `supplier`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL)'), 'assets_count'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`supplier_id` = `supplier`.`id` AND `licenses`.`firm_id`=' + req.userInfo.firmId + ' AND `licenses`.`deleted_at` IS NULL)'), 'licenses_count']
          ],
          where: [{name: {
            [Op.like]: '%'+ search+'%'
          }}, {firm_id: req.userInfo.firmId}, {deleted_at: {[Op.eq]: null}}],
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
    const supplier = models.supplier;
    const response = await util.getSelectList(supplier, req)
    res.json(response);  
  }))

  router.get('/:id', errorHandler(async function(req, res, next) {
    const supplier = models.supplier;

    const id = _.parseInt(req.params.id);
    let result = await supplier.findOne({
      attributes: ['id', 'name', 'image', 'address', 'address2', 'city', 'state', 'country', 'zip', 'phone', 'fax', 'email', 'contact', 'notes', 'url', 'created_at', 'updated_at',
        [Sequelize.literal('(SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`supplier_id` = `supplier`.`id`)'), 'accessoriesCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`supplier_id` = `supplier`.`id`)'), 'assetsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`supplier_id` = `supplier`.`id`)'), 'licensesCount']
      ],
      where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  }))


router.post('/', errorHandler(async function(req, res, next) {
  const supplier = models.supplier;
  req.body.user_id = req.userInfo.userId
  let {types, fieldsLength, errorMessages} = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.url, fieldsLength.oneNineOne, true, types.string, errorMessages.url, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.phone, fieldsLength.oneNineOne, true, types.string, errorMessages.phone, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.email, fieldsLength.oneNineOne, true, types.string, errorMessages.email, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.contact, fieldsLength.oneNineOne, true, types.string, errorMessages.contact, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.address, fieldsLength.oneNineOne, true, types.string, errorMessages.address, `The address ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.address2, fieldsLength.oneNineOne, true, types.string, errorMessages.address2, `The address2 ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.city, fieldsLength.oneNineOne, true, types.string, errorMessages.city, `The city ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.state, fieldsLength.oneNineOne, true, types.string, errorMessages.state, `The state ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.country, fieldsLength.oneNineOne, true, types.string, errorMessages.country, `The country ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.zip, fieldsLength.oneZero, true, types.string, errorMessages.zip, `The zip ${errorMessages.lengthOneZero}`))
  // fields.push(util.addFields(req.body.notes, fieldsLength.oneZero, true, types.string, errorMessages.notes))

const errors = await util.checkRequest({name: req.body.name, firm_id: req.userInfo.firmId}, fields, supplier)
  if (!_.isEmpty(errors)) {
    res.result = {error: errors}
  } else {
    let result = await supplier.create(req.body);

    res.result = result;
  }
  next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
  const supplier = models.supplier;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId
  let {types, fieldsLength, errorMessages} = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.url, fieldsLength.oneNineOne, true, types.string, errorMessages.url, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.phone, fieldsLength.oneNineOne, true, types.string, errorMessages.phone, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.email, fieldsLength.oneNineOne, true, types.string, errorMessages.email, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.contact, fieldsLength.oneNineOne, true, types.string, errorMessages.contact, `The url ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.address, fieldsLength.oneNineOne, true, types.string, errorMessages.address, `The address ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.address2, fieldsLength.oneNineOne, true, types.string, errorMessages.address2, `The address2 ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.city, fieldsLength.oneNineOne, true, types.string, errorMessages.city, `The city ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.state, fieldsLength.oneNineOne, true, types.string, errorMessages.state, `The state ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.country, fieldsLength.oneNineOne, true, types.string, errorMessages.country, `The country ${errorMessages.lengthOneNineOne}`))
  // fields.push(util.addFields(req.body.zip, fieldsLength.oneZero, true, types.string, errorMessages.zip, `The zip ${errorMessages.lengthOneZero}`))
  // fields.push(util.addFields(req.body.notes, fieldsLength.oneZero, true, types.string, errorMessages.notes))

  const errors = await util.checkRequest({name: req.body.name, firm_id: req.userInfo.firmId, id: {[Op.ne]: req.params.id}}, fields, supplier)
  if (!_.isEmpty(errors)) {
    res.result = {error: errors}
  } else {
    let result = await supplier.update(req.body, {where: {id: id}});
    
    res.result = result;
  }
  next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const supplier = models.supplier;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await supplier.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
}))

function formatResponse(supplier) {
  return  {
      id: supplier.id,
      name: supplier.name,
      image: supplier.image,
      address: supplier.address,
      address2: supplier.address2,
      city: supplier.city,
      state: supplier.state,
      country: supplier.country,
      zip: supplier.zip,
      phone: supplier.phone,
      fax: supplier.fax,
      email: supplier.email,
      contact: supplier.contact,
      country: supplier.country,
      notes: supplier.notes,
      url: supplier.url,
      created_at: util.createdUpdatedDateFormat(supplier.created_at),
      updated_at: util.createdUpdatedDateFormat(supplier.updated_at),
      accessories_count: supplier.dataValues.accessories_count,
      assets_count: supplier.dataValues.assets_count,
      licenses_count: supplier.dataValues.licenses_count,
      available_actions: util.getAvailableActions([
        supplier.dataValues.accessories_count,
        supplier.dataValues.assets_count,
        supplier.dataValues.licenses_count
      ])
  }
}

module.exports = router;

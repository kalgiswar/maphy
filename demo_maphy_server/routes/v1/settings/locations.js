var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
var {errorHandler} = require('../../../shared/error-handler')
var {selectListSettings} = require('../../../shared/constants');
const constants = require('../../../shared/constants');
const location = models.location;
const user = models.user;
location.belongsTo(user, {foreignKey: 'manager_id'});
location.belongsTo(location, {foreignKey: 'parent_id', as: 'parent'});
location.belongsTo(location, {foreignKey: 'parent_id', as: 'children'});

/**
 * @swagger
 * /api/v1/locations:
 *  get:
 *    description: get all the locations
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */

router.get('/', errorHandler(async function(req, res, next) {
  const queries = req.query;
  let {search, sort, limit, offset, order} = util.queryRequest(queries);
  if (_.eq(sort, 'manager.name')) {
    sort = 'user.first_name'
  }
  if (_.eq(sort, 'children.name') || _.eq(sort, 'parent.name')) {
    sort = 'location.name'
  }
  let result = await location.findAndCountAll({
        attributes: [
          'id', 'name', 'address', 'address2', 'city', 'currency', 'state', 'image', 'country', 'zip', 'ldap_ou', 'parent_id', 'manager_id', 'created_at', 'updated_at',
          [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`rtd_location_id` = `location`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL)'), 'assets_count'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`assigned_type`='+"'App\\\\Models\\\\Location'"+' and `assets`.`location_id` = `location`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL )'), 'assigned_assets_count'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `users` WHERE `users`.`location_id` = `location`.`id` AND `users`.`firm_id`=' + req.userInfo.firmId + ' AND `users`.`deleted_at` IS NULL)'), 'users_count']
        ],
        include: [{
          model: user,
          attributes: [
            'id',
            'first_name',
            'last_name'
          ]},
          {model: location, as: 'parent', attributes: ['id', 'name']},
          {model: location, as: 'children', attributes: ['id', 'name']},
        ],
        where: [{name: {
          [Op.like]: '%'+ search+'%'
        }}, {deleted_at: {[Op.eq]: null}}, {firm_id: req.userInfo.firmId}],
        order: Sequelize.literal(`${sort} ${order}`),
        limit: limit,
        offset: offset
  })
  
  var response = []
  if (!_.isNil(result)) {
      _.map(result.rows, row => {
        response.push(formatResponse(row))
    })
  }

  res.json({ total: result.count, rows: response });
}))

router.get('/old_get', errorHandler(async function(req, res, next) {
    const queries = req.query;
    let {search, sort, limit, offset, order} = util.queryRequest(queries);
    if (_.eq(sort, 'manager.name')) {
      sort = 'user.first_name'
    }
    if (_.eq(sort, 'children.name') || _.eq(sort, 'parent.name')) {
      sort = 'location.name'
    }
    let result = await location.findAndCountAll({
          attributes: [
            'id', 'name', 'address', 'address2', 'city', 'currency', 'state', 'image', 'country', 'zip', 'ldap_ou', 'parent_id', 'manager_id', 'created_at', 'updated_at',
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`rtd_location_id` = `location`.`id`)'), 'assets_count'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`assigned_type`='+"'App\\\\Models\\\\Location'"+' and `assets`.`assigned_to` = `location`.`id`)'), 'assigned_assets_count'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `users` WHERE `users`.`location_id` = `location`.`id`)'), 'users_count']
          ],
          include: [{
            model: user,
            attributes: [
              'id',
              'first_name',
              'last_name'
            ]},
            {model: location, as: 'parent', attributes: ['id', 'name']},
            {model: location, as: 'children', attributes: ['id', 'name']},
          ],
          where: [{name: {
            [Op.like]: '%'+ search+'%'
          }}, {deleted_at: {[Op.eq]: null}}, {firm_id: req.userInfo.firmId}],
          order: Sequelize.literal(`${sort} ${order}`),
          limit: limit,
          offset: offset
    })
    
    var response = []
    if (!_.isNil(result)) {
        _.map(result.rows, row => {
          response.push(formatResponse(row))
      })
    }

    res.json({ total: result.count, rows: response });
  }))
  
  router.get('/selectList', errorHandler(async function(req, res, next) {
    const page = _.parseInt(req.query.page);
    const search = _.isNil(req.query.search) ? '' : req.query.search;
    const offsetPage = _.parseInt(req.query.page) - 1;
    const limit = selectListSettings.limit
    let where = {
      name: {
        [Op.like]: '%'+ search+'%'
      },
      deleted_at: null
    };
    if (!req.userInfo.isSuperuser || (req.userInfo.firmId && req.userInfo.firmId !== 1)) {
      where.firm_id = req.userInfo.firmId;
    }

    let result = await location.findAndCountAll({
      attributes: [
        'id', 'name', 'parent_id', 'image'
      ],
      where: where,
      order: [
          ['parent_id', 'asc']
      ],
      limit: limit,
      offset: offsetPage
    })

  var response = []
  if (!_.isNil(result)) {
      const ancestors = _.filter(result.rows, row => row.parent_id === null);
      _.map(ancestors, ancestor => {
        response.push({
          id: ancestor.id,
          text: ancestor.name,
          image: _.isNil(ancestor.image) ? '' : ancestor.image,
          parent_id: ancestor.parent_id
        })
        childrenLocation(ancestor, result.rows, response)
      })
  }
  const pageCount = _.ceil(result.count/limit);
  res.json({ 
    total_count: result.count,
    page_count: pageCount,
    page: page,
    items: response,
    pagination: {
      more: page < pageCount ? true : false,
      per_page: limit
    }
  });
}))

function childrenLocation(ancestor, result, response, indent) {
  parents = _.filter(result, row =>  row.parent_id === ancestor.id)
  let childIndent = _.isNil(indent) ? '--' : `--${indent}`
  if (_.size(parents) > 0) {
    _.map(parents, parent => {
      response.push({
        id: parent.id,
        text: `${childIndent}${parent.name}`,
        image: _.isNil(parent.image) ? '' : parent.image,
        parent_id: parent.parent_id
      })
      childrenLocation(parent, result, response, childIndent)
    })
  }         
}

router.get('/:id', errorHandler(async function(req, res, next) {
  let result = await location.findOne({
        attributes: [
          'id', 'name', 'address', 'address2', 'state', 'image', 'currency', 'city','country', 'zip', 'ldap_ou', 'parent_id', 'manager_id', 'created_at', 'updated_at',
          [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`location_id` = `location`.`id` AND `assets`.`deleted_at` IS NULL )'), 'assetsCount'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `users` WHERE `users`.`location_id` = `location`.`id` AND `users`.`deleted_at` IS NULL)'), 'usersCount'],
        ],
        include: [{
          model: user,
          attributes: [
            'id',
            'first_name',
            'last_name'
          ]},
          {model: location, as: 'parent', attributes: ['id', 'name']},
          {model: location, as: 'children', attributes: ['id', 'name']},
        ],
        where: {id: req.params.id}
    });

    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  }))

router.post('/', errorHandler(async function(req, res, next) {
    req.body.user_id = req.userInfo.userId
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.parent_id, fieldsLength.oneNineOne, true, types.string, errorMessages.parentName, `parent name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.manager_id, fieldsLength.oneNineOne, true, types.string, errorMessages.managerName, `manager name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.currency, fieldsLength.oneNineOne, true, types.string, errorMessages.currency, `The currency ${errorMessages.lengthOneNineOne}`))

    // fields.push(util.addFields(req.body.address, fieldsLength.oneNineOne, true, types.string, errorMessages.address, `The address ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.address2, fieldsLength.oneNineOne, true, types.string, errorMessages.address2, `The address2 ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.city, fieldsLength.oneNineOne, true, types.string, errorMessages.city, `The city ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.state, fieldsLength.oneNineOne, true, types.string, errorMessages.state, `The state ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.country, fieldsLength.oneNineOne, true, types.string, errorMessages.country, `The country ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.zip, fieldsLength.oneZero, true, types.string, errorMessages.zip, `The zip ${errorMessages.lengthOneZero}`))

    const errors = await util.checkRequest({name: req.body.name, firm_id: req.userInfo.firmId}, fields, location)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      let result = await location.create(req.body);
      
      res.result = result;
    }
    next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let {types, fieldsLength, errorMessages} = constants
    let fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.parent_id, fieldsLength.oneNineOne, true, types.string, errorMessages.parentName, `parent name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.manager_id, fieldsLength.oneNineOne, true, types.string, errorMessages.managerName, `manager name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.currency, fieldsLength.oneNineOne, true, types.string, errorMessages.currency, `The currency ${errorMessages.lengthOneNineOne}`))

    // fields.push(util.addFields(req.body.address, fieldsLength.oneNineOne, true, types.string, errorMessages.address, `The address ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.address2, fieldsLength.oneNineOne, true, types.string, errorMessages.address2, `The address2 ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.city, fieldsLength.oneNineOne, true, types.string, errorMessages.city, `The city ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.state, fieldsLength.oneNineOne, true, types.string, errorMessages.state, `The state ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.country, fieldsLength.oneNineOne, true, types.string, errorMessages.country, `The country ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.zip, fieldsLength.oneZero, true, types.string, errorMessages.zip, `The zip ${errorMessages.lengthOneZero}`))

       const errors = await util.checkRequest({name: req.body.name, firm_id: req.userInfo.firmId, id: {[Op.ne]: req.params.id}}, fields, location)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      let result = await location.update(req.body, {where: {id: id}});
    
      res.result = result;
    }
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await location.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
}))

function getChildren(childrens) {
  let locations = []  
  _.map(childrens, children => {
    locations.push({id: children.id, name: children.name})
  })
  return locations;
}

function formatResponse(location) {
  return  {
      id: location.id,
      name: location.name,
      city: location.city,
      currency: location.currency,
      image: _.isNil(location.image) ? '' : location.image,
      address: location.address,
      address2: location.address2,
      state: location.state,
      country: location.country,
      zip: location.zip,
      ldap_ou: location.ldap_ou,
      children: getChildren(location.dataValues.children),
      parent: util.getRelationalObject(location.dataValues.parent),
      manager: util.getUser(location),
      created_at: util.createdUpdatedDateFormat(location.created_at),
      updated_at: util.createdUpdatedDateFormat(location.updated_at),
      assets_count: location.dataValues.assets_count,
      users_count: location.dataValues.users_count,
      assigned_assets_count: location.dataValues.assigned_assets_count,
      available_actions: util.getAvailableActions([
        location.dataValues.assets_count,
        location.dataValues.users_count
      ])
  }
}

module.exports = router;

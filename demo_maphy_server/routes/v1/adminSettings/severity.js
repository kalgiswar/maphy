var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants')
var {errorHandler} = require('../../../shared/error-handler')

  router.get('/', errorHandler(async function(req, res, next) {
    const severity = models.severity;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await severity.findAndCountAll({
          attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
          where: {name: {
            [Op.like]: '%'+ search+'%'
          }, 
          deleted_at: {[Op.eq]: null}},
          order: [
              [sort, order]
          ],
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
    const severity = models.severity;
    const response = await util.getSelectList(severity, req)
    res.json(response);  
  }))

  router.get('/:id', errorHandler(async function(req, res, next) {
    const severity = models.severity;

    const id = _.parseInt(req.params.id);
    let result = await severity.findOne({
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
      where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);
    res.json(response);
  }))

  router.post('/', errorHandler(async function(req, res, next) {
    const severity = models.severity;
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    let errors = await util.checkRequest({name: req.body.name}, fields, severity)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      let result = await severity.create(req.body);

      res.result = result;
    }
    next()
  }))

  router.put('/:id', errorHandler(async function(req, res, next) {
    const severity = models.severity;
    const id = _.parseInt(req.params.id)
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({name: req.body.name, id: {[Op.ne]: req.params.id}}, fields, severity)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      let result = await severity.update(req.body, {where: {id: id}});
      
      res.result = result;
    }
    next()
  }))

  router.delete('/:id', errorHandler(async function(req, res, next) {
    const severity = models.severity;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await severity.update(req.body, {where: {id: id}});

    res.result = result;
    next()
  }))


  function formatResponse(severity) {
    return  {
        id: severity.id,
        name: severity.name,
        description: severity.description,
        available_actions: util.getAvailableActions([]),
        created_at: util.createdUpdatedDateFormat(severity.created_at),
        updated_at: util.createdUpdatedDateFormat(severity.updated_at)
    }
  }

module.exports = router;

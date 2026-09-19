var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var {errorHandler} = require('../../../shared/error-handler')

router.get('/', errorHandler(async function(req, res, next) {
    const talentGroup = models.talentGroup;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await talentGroup.findAndCountAll({
          attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
          where: {name: {
            [Op.like]: '%'+ search+'%'
          },
          firm_id: req.userInfo.firmId, 
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
    const talentGroup = models.talentGroup;
    const response = await util.getSelectList(talentGroup, req)
    res.json(response);  
  }))

  router.get('/:id', errorHandler(async function(req, res, next) {
    const talentGroup = models.talentGroup;

    const id = _.parseInt(req.params.id);
    let result = await talentGroup.findOne({
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
      where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);
    res.json(response);
  }))

  router.post('/', errorHandler(async function(req, res, next) {
    const talentGroup = models.talentGroup;
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    let errors = await util.checkRequest({name: req.body.name,firm_id:req.userInfo.firmId,deleted_at:null}, fields, talentGroup)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      req.body.firm_id = req.userInfo.firmId
      let result = await talentGroup.create(req.body);

      res.result = result;
    }
    next()
  }))

  router.put('/:id', errorHandler(async function(req, res, next) {
    const talentGroup = models.talentGroup;
    const id = _.parseInt(req.params.id)
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({name: req.body.name, id: {[Op.ne]: req.params.id},firm_id:req.userInfo.firmId,deleted_at:null}, fields, talentGroup)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      let result = await talentGroup.update(req.body, {where: {id: id}});
      
      res.result = result;
    }
    next()
  }))

  router.delete('/:id', errorHandler(async function(req, res, next) {
    const talentGroup = models.talentGroup;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await talentGroup.update(req.body, {where: {id: id}});

    res.result = result;
    next()
  }))

  function formatResponse(talentGroup) {
    return  {
        id: talentGroup.id,
        name: talentGroup.name,
        description: talentGroup.description,
        available_actions: util.getAvailableActions([]),
        created_at: util.createdUpdatedDateFormat(talentGroup.created_at),
        updated_at: util.createdUpdatedDateFormat(talentGroup.updated_at)
    }
  }

  module.exports = router;

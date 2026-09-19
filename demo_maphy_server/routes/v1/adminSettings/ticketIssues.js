var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
const {errorHandler} = require('../../../shared/error-handler')

router.get('/', errorHandler(async function(req, res, next) {
    const ticketIssue = models.ticketIssue;
    const talentGroup = models.talentGroup;
    const severity = models.severity;
    const skillLevel = models.skillLevel;
    ticketIssue.belongsTo(talentGroup, {foreignKey: 'talent_group_id'});
    ticketIssue.belongsTo(severity, {foreignKey: 'severity_id'});
    ticketIssue.belongsTo(skillLevel, {foreignKey: 'skill_level_id'});
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await ticketIssue.findAndCountAll({
          attributes: ['id', 'name', 'talent_group_id', 'severity_id', 'description', 'created_at', 'updated_at'],
          include: [
          //{model: severity, attributes: ['id', 'name'], required: true},
          {model: talentGroup, attributes: ['id', 'name'], required: true}
//          {model: skillLevel, attributes: ['id', 'name'], required: true}
          ],
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
    const ticketIssue = models.ticketIssue;
    const response = await util.getSelectList(ticketIssue, req)
    res.json(response);  
  }))

  router.get('/:id', errorHandler(async function(req, res, next) {
    const ticketIssue = models.ticketIssue;
    const talentGroup = models.talentGroup;
    const severity = models.severity;
    ticketIssue.belongsTo(talentGroup, {foreignKey: 'talent_group_id'});
    ticketIssue.belongsTo(severity, {foreignKey: 'severity_id'});

    const id = _.parseInt(req.params.id);
    let result = await ticketIssue.findOne({
      attributes: ['id', 'name', 'talent_group_id', 'severity_id', 'description', 'created_at', 'updated_at'],
      include: [{model: severity, attributes: ['id', 'name'], required: true},
      {model: talentGroup, attributes: ['id', 'name'], required: true}],
      where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);
    res.json(response);
  }))

  router.post('/', errorHandler(async function(req, res, next) {
    const ticketIssue = models.ticketIssue;
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    let errors = await util.checkRequest({name: req.body.name,firm_id:req.userInfo.firmId,deleted_at:null}, fields, ticketIssue)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      req.body.firm_id = req.userInfo.firmId
      let result = await ticketIssue.create(req.body);

      res.result = result;
    }
    next()
  }))

  router.put('/:id', errorHandler(async function(req, res, next) {
    const ticketIssue = models.ticketIssue;
    const id = _.parseInt(req.params.id)
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({name: req.body.name, id: {[Op.ne]: req.params.id},firm_id:req.userInfo.firmId,deleted_at:null}, fields, ticketIssue)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
      req.body.user_id = req.userInfo.userId
      let result = await ticketIssue.update(req.body, {where: {id: id}});
      
      res.result = result;
    }
    next()
  }))

  router.delete('/:id', errorHandler(async function(req, res, next) {
    const ticketIssue = models.ticketIssue;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await ticketIssue.update(req.body, {where: {id: id}});

    res.result = result;
    next()
  }))

  function formatResponse(ticketIssue) {
    return  {
        id: ticketIssue.id,
        name: ticketIssue.name,
        description: ticketIssue.description,
        talent_group: {id: ticketIssue.dataValues.talentGroup.id, name: ticketIssue.dataValues.talentGroup.name},
        //severity: {id: ticketIssue.dataValues.severity.id, name: ticketIssue.dataValues.severity.name},
        //skillLevel: {id: ticketIssue.dataValues.skillLevel.id, name: ticketIssue.dataValues.skillLevel.name},
        available_actions: util.getAvailableActions([]),
        created_at: util.createdUpdatedDateFormat(ticketIssue.created_at),
        updated_at: util.createdUpdatedDateFormat(ticketIssue.updated_at)
    }
  }

module.exports = router;

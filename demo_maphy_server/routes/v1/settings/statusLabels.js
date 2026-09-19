var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const { statusType } = require('../../../shared/constants');
const constants = require('../../../shared/constants');
var {errorHandler} = require('../../../shared/error-handler')

router.get('/', errorHandler(async function(req, res, next) {
    const statusLabel = models.statusLabel;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await statusLabel.findAndCountAll({
          attributes: ['id', 'name', 'show_in_nav', 'default_label', 'deployable', 'pending', 'archived', 'notes', 'created_at', 'updated_at',
          [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`status_id` = `statusLabel`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL)'), 'assetsCount'],
        ],
          where: {name: {
            [Op.like]: '%'+ search+'%'},
            firm_id: req.userInfo.firmId},
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
  }));
 
// router.get('/selectList', errorHandler(async function(req, res, next) {
//     const statusLabel = models.statusLabel;
//     const response = await util.getSelectList(statusLabel, req)
//     res.json(response);  
//   }));
 
router.get('/selectList', errorHandler(async function(req, res, next) {
  const statusLabel = models.statusLabel;
  const queries = req.query;
  const type = queries.type;

  // original response
  let response = await util.getSelectList(statusLabel, req);

  if (type === 'checkin') {
    // get only non-archived ids from DB
    const validRows = await statusLabel.findAll({
      attributes: ['id'],
      where: {
        archived: false,
        firm_id: req.userInfo.firmId,
        deleted_at: { [Op.eq]: null }
      }
    });

    const validIds = validRows.map(row => row.id);

    // filter response using ids
    response.items = response.items.filter(item =>
      validIds.includes(item.id)
    );

    // update counts
    response.total_count = response.items.length;

    const limit = response.pagination.per_page;
    response.page_count = Math.ceil(response.total_count / limit);

    response.pagination.more = response.page < response.page_count;
  }

  res.json(response);  
}));
router.get('/:id', errorHandler(async function(req, res, next) {
    const statusLabel = models.statusLabel;

    const id = _.parseInt(req.params.id);
    let result = await statusLabel.findOne({
        attributes: [
            'id', 'name', 'show_in_nav', 'default_label','deployable', 'pending', 'archived', 'notes', 'created_at', 'updated_at',
            [
                Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`status_id` = `statusLabel`.`id`)'), 'assetsCount'
            ],
        ],
        where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  }));

router.post('/', errorHandler(async function(req, res, next) {
    const statusLabel = models.statusLabel;
    req.body.user_id = req.userInfo.userId
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.type, fieldsLength.oneNineOne, true, types.string, '', `The status type ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.color, fieldsLength.oneZero, false, types.string, '', `The color ${errorMessages.lengthOneNineOne}`))

    const type = req.body.type;
    switch (type) {
        case statusType.deployable:
            req.body.deployable = true;
            break;
        case statusType.pending:
            req.body.pending = true;
            break;
        default:
            req.body.archived = true;
            break;
    }
    const errors = await util.checkRequest({name: req.body.name}, fields, statusLabel)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
        let result = await statusLabel.create(req.body);
        res.result = result;
    }
    next()
}));

router.put('/:id', errorHandler(async function(req, res, next) {
    const statusLabel = models.statusLabel;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let {types, fieldsLength, errorMessages} = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.type, fieldsLength.oneNineOne, true, types.string, '', `The status type ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.color, fieldsLength.oneZero, false, types.string, '', `The color ${errorMessages.lengthOneNineOne}`))

    const type = req.body.type;
    switch (type) {
        case statusType.deployable:
            req.body.deployable = true;
            req.body.pending = false;
            req.body.archived = false;
            break;
        case statusType.pending:
            req.body.pending = true;
            req.body.deployable = false;
            req.body.archived = false;
            break;
        default:
            req.body.archived = true;
            req.body.deployable = false;
            req.body.pending = false;
            break;
    }

    const errors = await util.checkRequest({name: req.body.name, id: {[Op.ne]: req.params.id}}, fields, statusLabel)
    if (!_.isEmpty(errors)) {
      res.result = {error: errors}
    } else {
        let result = await statusLabel.update(req.body, {where: {id: id}});
       
        res.result = result;
    }
    next()
}));

router.delete('/:id', errorHandler(async function(req, res, next) {
    const statusLabel = models.statusLabel;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await statusLabel.destroy({where: {id: id}});
 
    res.result = result;
    next()
}));

function formatResponse(statusLabel) {
  return  {
      id: statusLabel.id,
      name: statusLabel.name,
      image: statusLabel.image,
      type: getType(statusLabel),
      color: statusLabel.color,
      show_in_nav: statusLabel.show_in_nav,
      default_label: statusLabel.default_label,
      notes: statusLabel.notes,
      created_at: util.createdUpdatedDateFormat(statusLabel.created_at),
      updated_at: util.createdUpdatedDateFormat(statusLabel.updated_at),
      assets_count: statusLabel.dataValues.assetsCount,
      available_actions: util.getAvailableActions([
        statusLabel.dataValues.assetsCount
      ])
  }
}

function getType(statusLabel) {
    if (statusLabel.deployable)
        return statusType.deployable;
    else if (statusLabel.pending)
        return statusType.pending;
    else if (statusLabel.archived)
        return statusType.archived;
    else
        return statusType.unDeployable;
}

module.exports = router;
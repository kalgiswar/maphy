var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');

router.get('/', async function(req, res, next) {
    const customField = models.customField;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await customField.findAndCountAll({
          where: {name: {
            [Op.like]: '%'+ search+'%'
          }},
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
  });

router.get('/:id', async function(req, res, next) {
    const customField = models.customField;

    const id = _.parseInt(req.params.id);
    let result = await customField.findOne({where: {id: id}});
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  });

router.post('/', async function(req, res, next) {
    const customField = models.customField;
    req.body.user_id = req.userInfo.userId
    req.body.field_values = JSON.stringify(req.body.field_values);
    let result = await customField.create(req.body);
    res.result = result;
    next()
})

router.put('/:id', async function(req, res, next) {
    const customField = models.customField;
    req.body.user_id = req.userInfo.userId
    req.body.field_values = JSON.stringify(req.body.field_values);
    const id = _.parseInt(req.params.id)
    let result = await customField.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
})

router.delete('/:id', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    req.body.user_id = req.userInfo.userId
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    const id = _.parseInt(req.params.id)

    const transResult = await sequelize.transaction(t => {
      return customFieldCustomFieldset.destroy({custom_field_id: id}, {transaction: t}).then(res => {
        return customFieldset.destroy({custom_field_id: id}, {transaction: t});
      });
    }).then(function (result) {
      console.log('commit')
    }).catch(function (err) {
      console.log(err)
    });

    let result = await customField.destroy({where: {id: id}});
  
    res.result = result;
    next()
})

function formatResponse(customField) {
  return  {
      id: customField.id,
      name: customField.name,
      format: customField.format,
      help_text: customField.help_text,
      show_in_email: customField.show_in_email,
      element: customField.element,
      created_at: util.createdUpdatedDateFormat(customField.created_at),
      updated_at: util.createdUpdatedDateFormat(customField.updated_at)
  }
}

module.exports = router;

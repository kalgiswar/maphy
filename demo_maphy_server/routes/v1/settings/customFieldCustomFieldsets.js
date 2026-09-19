var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');

router.get('/:id', async function(req, res, next) {
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    const customField = models.customField; 
    // customField.hasOne(customFieldCustomFieldset, {foreignKey: 'custom_field_id'});
    // customFieldCustomFieldset.belongsTo(customField, {foreignKey: 'custom_field_id'});

    const id = _.parseInt(req.params.id);
    let results = []
    // results = await customFieldCustomFieldset.findAll({
    //     subquery: false,
    //     attributes: ['required'],
    //     where: {custom_field_id: id},
    //     include: [{model: customField, required: true, attributes: ['element'] }],
    //     through: {
    //       attributes: ['id']
    //     }
    // });
    results = await customFieldCustomFieldset.findAll({where: {custom_fieldset_id: id}});

    var fieldIds = []

    var response = []
    if (!_.isNil(results)) {
        _.map(results, row => fieldIds.push(row.custom_field_id))
        var customFields = await customField.findAll({where: {id: fieldIds}});
        _.map(results, row => {
          response.push(formatResponse(row, customFields))
      })
    }
    res.json(response);
  });

router.post('/', async function(req, res, next) {
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    req.body.user_id = req.userInfo.userId
    let result = await customFieldCustomFieldset.create(req.body);
  
    res.result = result;
    next()
})

router.delete('/:id', async function(req, res, next) {
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    req.body.user_id = req.userInfo.userId
    const fieldId = _.isNil(req.query) ? 0 : _.parseInt(req.query.fieldId)
    const fieldsetId = _.parseInt(req.params.id)
    let result = await customFieldCustomFieldset.destroy({where: {custom_fieldset_id: fieldsetId, custom_field_id: fieldId}});
    
    res.result = result;
    next()
})

function formatResponse(fieldset, customFields) {
  var customField = _.find(customFields, x => x.id === fieldset.custom_field_id)
  return  {
    custom_field_id: fieldset.custom_field_id,
    custom_fieldset_id: fieldset.custom_fieldset_id,
    field_encrypted: customField.field_encrypted,
    name: customField.name,
    format: customField.format,
    element: customField.element,
    order: fieldset.order,
    required: fieldset.required
  }
}

module.exports = router;

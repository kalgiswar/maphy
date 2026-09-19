var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var { errorHandler } = require('../../../shared/error-handler')

/**
 * @swagger
 * /api/v1/depeciations:
 *  get:
 *    description: get all the depreciations
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function(req, res, next) {
    const depreciation = models.depreciation;
    const queries = req.query;
    const { search, sort, limit, offset, order } = util.queryRequest(queries);

    let result = await depreciation.findAndCountAll({
        attributes: ['id', 'name', 'months','residual_value', 'created_at', 'updated_at'],
        where: {
            name: {
                [Op.like]: '%' + search + '%'
            },
            deleted_at: {
                [Op.eq]: null
            },
            firm_id: req.userInfo.firmId
        },
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
    const depreciation = models.depreciation;
    const response = await util.getSelectList(depreciation, req)
    res.json(response);
}))

router.get('/:id', errorHandler(async function(req, res, next) {
    const depreciation = models.depreciation;

    const id = _.parseInt(req.params.id);
    let result = await depreciation.findOne({
        attributes: ['id', 'name', 'months','residual_value', 'created_at', 'updated_at'],
        where: { id: id }
    });
    const response = _.isNil(result) ? {} : formatResponse(result);
    res.json(response);
}))

router.post('/', errorHandler(async function(req, res, next) {
    const depreciation = models.depreciation;
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    //fields.push(util.addFields(req.body.months, fieldsLength.oneNineOne, true, types.string, errorMessages.months, `The month ${errorMessages.lengthOneNineOne}`))

    let errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, depreciation)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await depreciation.create(req.body);

        res.result = result;
    }
    next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
    const depreciation = models.depreciation;
    const id = _.parseInt(req.params.id)
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
   // fields.push(util.addFields(req.body.months, fieldsLength.oneNineOne, true, types.string, errorMessages.months, `The month ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({
        name: req.body.name,
        firm_id: req.userInfo.firmId,
        id: {
            [Op.ne]: req.params.id
        }
    }, fields, depreciation)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await depreciation.update(req.body, { where: { id: id } });

        res.result = result;
    }
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const depreciation = models.depreciation;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await depreciation.update(req.body, { where: { id: id } });

    res.result = result;
    next()
}))

function formatResponse(depreciation) {
    return {
        id: depreciation.id,
        name: depreciation.name,
        months: depreciation.months,
        residual_value:depreciation.residual_value,
        available_actions: util.getAvailableActions([]),
        created_at: util.createdUpdatedDateFormat(depreciation.created_at),
        updated_at: util.createdUpdatedDateFormat(depreciation.updated_at)
    }
}

module.exports = router;
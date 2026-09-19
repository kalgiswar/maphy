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
 * /api/v1/manufactures:
 *  get:
 *    description: get all the manufacturers
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;
    const queries = req.query;
    const isDeleteRequest = _.isNil(queries.deleted) || _.isEmpty(queries.deleted) ? false : queries
    const { search, sort, limit, offset, order } = util.queryRequest(queries);

    let result = await manufacturer.findAndCountAll({
          attributes: ['id', 'name', 'image', 'url', 'support_url', 'support_phone', 'support_email', 'created_at', 'updated_at', 'deleted_at',
          [Sequelize.literal('(SELECT count(*) from `assets` inner join `models` on `models`.`id`=`assets`.`model_id` inner join `manufacturers` on `manufacturers`.`id`=`models`.`manufacturer_id` WHERE `models`.`manufacturer_id` = `manufacturer`.`id` AND `assets`.`firm_id`=' + req.userInfo.firmId + ' AND `assets`.`deleted_at` IS NULL)'), 'assetsCount'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`manufacturer_id` = `manufacturer`.`id` AND `accessories`.`firm_id`=' + req.userInfo.firmId + ' AND `accessories`.`deleted_at` IS NULL)'), 'accessoriesCount'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `consumables` WHERE `consumables`.`manufacturer_id` = `manufacturer`.`id` AND `consumables`.`firm_id`=' + req.userInfo.firmId + ' AND `consumables`.`deleted_at` IS NULL)'), 'consumablesCount'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`manufacturer_id` = `manufacturer`.`id` AND `licenses`.`firm_id`=' + req.userInfo.firmId + ' AND `licenses`.`deleted_at` IS NULL)'), 'licensesCount']
        ],
        where: {
            name: {
                [Op.like]: '%' + search + '%'
            },
            deleted_at: isDeleteRequest ? {
                [Op.ne]: null
            } : {
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
    const manufacturer = models.manufacturer;
    const response = await util.getSelectList(manufacturer, req)
    res.json(response);
}))

router.get('/:id', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;

    const id = _.parseInt(req.params.id);
    let result = await manufacturer.findOne({
        attributes: ['id', 'name', 'image', 'url', 'support_url', 'support_phone', 'support_email', 'created_at', 'updated_at', [Sequelize.literal('(SELECT count(*) from `assets` inner join `models` on `models`.`id`=`assets`.`model_id` inner join `manufacturers` on `manufacturers`.`id`=`models`.`manufacturer_id`)'), 'assetsCount'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`manufacturer_id` = `manufacturer`.`id`)'), 'accessoriesCount'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `consumables` WHERE `consumables`.`manufacturer_id` = `manufacturer`.`id`)'), 'consumablesCount'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`manufacturer_id` = `manufacturer`.`id`)'), 'licensesCount']
        ],
        where: { id: id }
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.post('/', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;
    req.body.user_id = req.userInfo.userId
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.url, fieldsLength.oneNineOne, true, types.string, errorMessages.url, `The url ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_url, fieldsLength.oneNineOne, true, types.string, errorMessages.supportUrl, `The support url ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_phone, fieldsLength.oneNineOne, true, types.string, errorMessages.supportPhone, `The support phone ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_email, fieldsLength.oneNineOne, true, types.string, errorMessages.supportEmail, `The support Email ${errorMessages.lengthOneNineOne}`))



    const errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, manufacturer)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await manufacturer.create(req.body);

        res.result = result;
    }
    next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.url, fieldsLength.oneNineOne, true, types.string, errorMessages.url, `The url ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_url, fieldsLength.oneNineOne, true, types.string, errorMessages.supportUrl, `The support url ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_phone, fieldsLength.oneNineOne, true, types.string, errorMessages.supportPhone, `The support phone ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.support_email, fieldsLength.oneNineOne, true, types.string, errorMessages.supportEmail, `The support Email ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({
        name: req.body.name,
        firm_id: req.userInfo.firmId,
        id: {
            [Op.ne]: req.params.id
        }
    }, fields, manufacturer)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await manufacturer.update(req.body, { where: { id: id } });

        res.result = result;
    }
    next()
}))

router.put('/restore/:id', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;
    const id = _.parseInt(req.params.id)
    const manufactureRequest = {
        deleted_at: null,
        user_id: req.userInfo.userId
    }
    let result = await manufacturer.update(manufactureRequest, { where: { id: id } });

    res.result = result;
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const manufacturer = models.manufacturer;
    const id = _.parseInt(req.params.id)
    var datetime = new Date();
    const manufactureRequest = {
        deleted_at: datetime,
        user_id: req.userInfo.userId
    }
    let result = await manufacturer.update(manufactureRequest, { where: { id: id } });
    //let result = await manufacturer.destroy({where: {id: id}});

    res.result = result;
    next()
}))

function formatResponse(manufacturer) {
    return {
        id: manufacturer.id,
        name: manufacturer.name,
        image: manufacturer.image,
        url: manufacturer.url,
        support_url: manufacturer.support_url,
        support_phone: manufacturer.support_phone,
        support_email: manufacturer.support_email,
        deleted_at: manufacturer.deleted_at,
        created_at: util.createdUpdatedDateFormat(manufacturer.created_at),
        updated_at: util.createdUpdatedDateFormat(manufacturer.updated_at),
        assets_count: manufacturer.dataValues.assetsCount,
        accessories_count: manufacturer.dataValues.accessoriesCount,
        consumables_count: manufacturer.dataValues.consumablesCount,
        licenses_count: manufacturer.dataValues.licensesCount,
        available_actions: util.getAvailableActions([
            manufacturer.dataValues.assetsCount,
            manufacturer.dataValues.accessoriesCount,
            manufacturer.dataValues.consumablesCount,
            manufacturer.dataValues.licensesCount
        ])
    }
}

module.exports = router;
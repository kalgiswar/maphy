var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var { errorHandler } = require('../../../shared/error-handler')
//const { statusType } = require('../../shared/constants');

/**
 * @swagger
 * definitions:
 *   category:
 *     properties:
 *       name:
 *         type: string
 *   category type:
 *     properties:
 *       category_type:
 *         type: string
  */
/**
 * @swagger
 * /categories:
 *  get:
 *    description: Get all the categories
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: query
 *        name: limit
 *        description: Number of records to return, by default user can view 10 records per page 
 *        required: false
 *        type: integer
 *      - in: query
 *        name: offset
 *        description: Page to navigate, by default user can see the first page
 *        required: false
 *        type: integer
 *      - in: query
 *        name: search
 *        description: Search the specifc category, by default user can see all the categories
 *        required: false
 *        type: string
 *      - in: query
 *        name: sort
 *        description: Sort the column, id is the default column
 *        required: false
 *        type: string
 *      - in: query
 *        name: order
 *        description: Sort direction (asc or desc)
 *        required: false
 *        type: string
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/category'
 */

router.get('/', errorHandler(async function (req, res, next) {
    const category = models.category;
    const queries = req.query;
    const { search, sort, limit, offset, order } = util.queryRequest(queries);

    let result = await category.findAndCountAll({
        //attributes: ['id', 'name', 'image', 'category_type', 'has_eula', 'eula_text', 'checkin_email', 'require_acceptance', 'created_at', 'updated_at', [Sequelize.literal('(SELECT CASE WHEN category_type = "' + constants.categoryType.accessory + '" THEN (SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.accessory + '" and `accessories`.`deleted_at` is null)    WHEN category_type = "' + constants.categoryType.asset + '" THEN (SELECT COUNT(*) FROM `assets` inner join `models` on `assets`.`model_id`=`models`.`id` where `models`.`category_id`=`category`.`id` and `category`.`category_type`="' + constants.categoryType.asset + '" )                WHEN category_type = "' + constants.categoryType.consumable + '" THEN (SELECT COUNT(*) FROM `consumables` WHERE `consumables`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.consumable + '")                 WHEN category_type = "' + constants.categoryType.component + '" THEN (SELECT COUNT(*) FROM `components` WHERE `components`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.component + '")                WHEN category_type = "' + constants.categoryType.license + '" THEN (SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.license + '")                END)'), 'item_count']],
        attributes: ['id', 'name', 'image', 'category_type', 'has_eula', 'eula_text', 'checkin_email', 'require_acceptance', 'created_at', 'updated_at',
            [Sequelize.literal('(SELECT CASE WHEN category_type = "' + constants.categoryType.accessory + '" THEN (SELECT COUNT(*) FROM `accessories` WHERE `accessories`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.accessory + ' " and `accessories`.`deleted_at` is null) WHEN category_type = "' + constants.categoryType.asset + '" THEN (SELECT COUNT(*) FROM `assets` inner join `models` on `assets`.`model_id`=`models`.`id` where `models`.`category_id`=`category`.`id` and `category`.`category_type`="' + constants.categoryType.asset + '" and `assets`.`deleted_at` is null)                WHEN category_type = "' + constants.categoryType.consumable + '" THEN (SELECT COUNT(*) FROM `consumables` WHERE `consumables`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.consumable + '" and `consumables`.`deleted_at` is null)                 WHEN category_type = "' + constants.categoryType.component + '" THEN (SELECT COUNT(*) FROM `components` WHERE `components`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.component + '" and `components`.`deleted_at` is null)                WHEN category_type = "' + constants.categoryType.license + '" THEN (SELECT COUNT(*) FROM `licenses` WHERE `licenses`.`category_id` = `category`.`id` and `category`.`category_type`="' + constants.categoryType.license + '" and `licenses`.`deleted_at` is null)                END)'), 'item_count']],
        where: [{
            name: {
                [Op.like]: '%' + search + '%'
            }
        }, {
            deleted_at: {
                [Op.eq]: null
            }
        }, { firm_id: req.userInfo.firmId }],
        order: _.eq(sort, 'item_count') ? Sequelize.literal(`item_count ${order}`) : [
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

router.get('/selectList/:type', errorHandler(async function (req, res, next) {
    const category = models.category;
    const response = await util.getSelectList(category, req)
    const result = _.filter(response.items, x => x.category_type === req.params.type)
    res.json(result);
}))

router.get('/:id', errorHandler(async function (req, res, next) {
    const category = models.category;

    const id = _.parseInt(req.params.id);
    let result = await category.findOne({
        attributes: [
            'id', 'name', 'image', 'category_type', 'has_eula', 'eula_text', 'checkin_email', 'require_acceptance', 'created_at', 'updated_at', [Sequelize.literal('(SELECT COUNT(`assets`.`id`) FROM `assets`)'), 'assetsCount'],
            [Sequelize.literal('(SELECT COUNT(`accessories`.`category_id`) FROM `accessories` WHERE `accessories`.`category_id` = `category`.`id`)'), 'accessoriesCount'],
            [Sequelize.literal('(SELECT COUNT(`components`.`category_id`) FROM `components` WHERE `components`.`category_id` = `category`.`id`)'), 'componentsCount'],
            [Sequelize.literal('(SELECT COUNT(`consumables`.`category_id`) FROM `consumables` WHERE `consumables`.`category_id` = `category`.`id`)'), 'consumablesCount'],
            [Sequelize.literal('(SELECT COUNT(`licenses`.`category_id`) FROM `licenses` WHERE `licenses`.`category_id` = `category`.`id`)'), 'licensesCount']
        ],
        where: { id: id }
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

/**
 * @swagger
 * /categories:
 *  post:
 *    description: Creates a new category
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: category
 *        description: category object
 *        in: body
 *        required: true
 *        schema:
 *          $ref: '#/definitions/category'
 *      - name: category type
 *        description: category type object
 *        in: body
 *        required: true
 *        schema:
 *          $ref: '#/definitions/category type'
 *    responses:
 *      '200':
 *        description: A successful created response
 *        content:
 *          application/json:
 */

router.post('/', errorHandler(async function (req, res, next) {
    const category = models.category;
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.category_type, fieldsLength.oneNineOne, true, types.string, errorMessages.typeRequired, `The category type ${errorMessages.lengthOneNineOne}`))
    //     // fields.push(util.addFields(req.body.has_eula, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryEula, `The category EULA ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.eula_text, fieldsLength.oneNineOne, true, types.string, errorMessages.EulaText, `The  EULA Text${errorMessages.lengthOneNineOne}`))

    let errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, category)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await category.create(req.body);

        res.result = result;
    }
    next()
}))

router.put('/:id', errorHandler(async function (req, res, next) {
    const category = models.category;
    const id = _.parseInt(req.params.id)
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    //fields.push(util.addFields(req.body.category_type, fieldsLength.oneNineOne, true, types.string, errorMessages.typeRequired, `The category type ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.has_eula, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryEula, `The category EULA ${errorMessages.lengthOneNineOne}`))
    //fields.push(util.addFields(req.body.eula_text, fieldsLength.oneNineOne, true, types.string, errorMessages.EulaText, `The  EULA Text${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({
        name: req.body.name,
        firm_id: req.userInfo.firmId,
        id: {
            [Op.ne]: req.params.id
        }
    }, fields, category)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await category.update(req.body, { where: { id: id } });

        res.result = result;
    }
    next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
    const category = models.category;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await category.update(req.body, { where: { id: id } });

    res.result = result;
    next()
}))

function getItemsCount(category) {
    const itemsCount = _.find([category.dataValues.accessoriesCount,
    category.dataValues.assetsCount,
    category.dataValues.consumablesCount,
    category.dataValues.licensesCount,
    category.dataValues.componentsCount
    ], x => x > 0)
    return _.isNil(itemsCount) ? 0 : itemsCount;
}

function formatResponse(category) {
    return {
        id: category.id,
        name: category.name,
        image: category.image,
        category_type: category.category_type,
        has_eula: category.has_eula,
        eula_text: _.isNil(category.eula_text) ? '' : category.eula_text,
        checkin_email: category.checkin_email,
        require_acceptance: category.require_acceptance,
        created_at: util.createdUpdatedDateFormat(category.created_at),
        updated_at: util.createdUpdatedDateFormat(category.updated_at),
        accessories_count: category.dataValues.accessoriesCount,
        assets_count: category.dataValues.assetsCount,
        consumables_count: category.dataValues.consumablesCount,
        licenses_count: category.dataValues.licensesCount,
        components_count: category.dataValues.componentsCount,
        item_count: category.dataValues.item_count,
        available_actions: util.getAvailableActions([
            category.dataValues.item_count
        ])
    }
}

module.exports = router;
var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../../db/conn');
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var constants = require('../../../shared/constants')
var _ = require('lodash');
var util = require('../../../utils/index');
const asset = models.asset;
const location = models.location;
asset.belongsTo(location, { foreignKey: 'rtd_location_id', as: 'rtdLocation' });
var { errorHandler } = require('../../../shared/error-handler')
const random = require('random');

/**
 * @swagger
 * /api/v1/hardware:
 *  get:
 *    description: get all the hardware
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function (req, res, next) {
    const category = models.category;
    const company = models.company;
    const manufacturer = models.manufacturer;
    const statusLabel = models.statusLabel;
    const supplier = models.supplier;
    const model = models.model;
    const user = models.user;
    const customField = models.customField;
    const customFieldset = models.customFieldset;
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
    asset.belongsTo(location, { foreignKey: 'location_id' });
    asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
    asset.belongsTo(company, { foreignKey: 'company_id' });
    asset.belongsTo(model, { foreignKey: 'model_id' });
    model.belongsTo(category, { foreignKey: 'category_id' });
    model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    asset.belongsTo(user, { foreignKey: 'user_id' });
    const isSuperuser = req.userInfo.isSuperuser
    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries);
    let { isDeleteRequest, isRequestable, isStatus } = false
    let statusValue = ''
    const status = queries.status
    let statusWhere = {}

    if (!_.isNil(status)) {
        if (_.eq(queries.status, 'Requestable')) {
            isRequestable = true
        } else if (_.eq(queries.status, 'Deleted')) {
            isDeleteRequest = true
        } else {
            isStatus = true
            switch (_.toUpper(status)) {
                case _.toUpper(constants.assetStatus.deployed):
                    //statusWhere = { name: constants.assetStatus.deployed }
                    statusWhere = { archived: 1 }
                    break;
                case _.toUpper(constants.assetStatus.rtd):
                   // statusWhere = { name: constants.assetStatus.rtdAlias }
                   statusWhere = { deployable: 1 }
                    break;
                default:
                    statusWhere = { pending: 1 }
                    //statusValue = assetStatus.archived
                    // statusWhere = {
                    //     name: {
                    //         [Op.notIn]: [constants.assetStatus.deployed, constants.assetStatus.rtdAlias]
                    //     }
                    // }
                    break;
            }
            //statusName = queries.status
        }
    }
    const requestable = queries.requestable
    if (!_.isNil(requestable) && _.eq(requestable, '1')) {
        let result = await asset.findAndCountAll({
            attributes: ['id', 'asset_tag', 'requestable', 'expected_checkin', 'image', 'name', 'serial'],
            include: [
                { model: statusLabel, required: true, attributes: ['id', 'name'] },
                { model: location, attributes: ['id', 'name'] },
                { model: model, required: true, attributes: ['id', 'name', 'model_number'] }
            ],
            where: { requestable: requestable, firm_id: req.userInfo.firmId },
            order: [
                [sort, order]
            ],
            limit: limit,
            offset: offset
        });
        var response = []
        if (!_.isNil(result)) {
            _.map(result.rows, row => {
                response.push(formatRequestableResponse(row))
            })
        }
        res.json({ total: result.count, rows: response });
    } else {
        let where = [{
            assetdetails: {
                [Op.like]: '%' + search + '%'
            },
            firm_id: req.userInfo.firmId,
            [Op.or]: [
                {
                    user_id: isSuperuser ? {
                        [Op.ne]: 0
                    } : req.userInfo.userId
                },
                {
                    assigned_to: isSuperuser ? {
                        [Op.or]: [{
                            [Op.eq]: null
                        }, {
                            [Op.ne]: 0
                        }]
                    } : {
                        [Op.eq]: req.userInfo.userId
                    }
                }
            ],
            deleted_at: isDeleteRequest ? {
                [Op.ne]: null
            } : {
                [Op.eq]: null
            },
            requestable: isRequestable ? {
                [Op.eq]: 1
            } : {
                [Op.in]: [0, 1]
            }
        }]
        util.addCondition(queries.model_id, where, { model_id: queries.model_id })
        util.addCondition(queries.company_id, where, { company_id: queries.company_id })
        util.addCondition(queries.supplier_id, where, { supplier_id: queries.supplier_id })
        util.addCondition(queries.location_id, where, { rtd_location_id: queries.location_id })
        util.addCondition(queries.assigned_to, where, { assigned_to: queries.assigned_to })
        util.addCondition(queries.assigned_type, where, { assigned_type: queries.assigned_type })
        util.addCondition(queries.asset_id, where, { id: queries.asset_id })

        let catWhere = {
            id: {
                [Op.ne]: 0
            }
        }
        if (!_.isNil(queries.category_id)) {
            catWhere = {
                id: {
                    [Op.eq]: queries.category_id
                }
            }
        }

        let manWhere = {
            id: {
                [Op.ne]: 0
            }
        }
        if (!_.isNil(queries.manufacturer_id)) {
            manWhere = {
                id: {
                    [Op.eq]: queries.manufacturer_id
                }
            }
        }

        // let statusWhere = [{
        //     name: isStatus ? {
        //         [Op.eq]: statusValue
        //     } : {
        //         [Op.like]: '%'+ search+'%'
        //     }
        // }]
        //util.addCondition(queries.status_id, statusWhere, {id: queries.status_id})
        if (_.eq(sort, 'category.name')) {
            sort = '`model.category.name`'
        }
        let result = await asset.findAndCountAll({
            attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'tax_value', 'excluding_tax', 'purchase_date', 'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at',
                'assigned_type', [
                    Sequelize.literal(
                        '(SELECT CASE WHEN assigned_type = "App\\\\Models\\\\Location" THEN (SELECT name FROM locations WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\User" THEN (SELECT CONCAT(username, " ", employee_num) as name FROM users WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\Asset" THEN (SELECT name FROM assets WHERE id = `asset`.`assigned_to`) END)'), 'assigned'],
                [Sequelize.literal('(SELECT SUM(excluding_tax) FROM `assets` where deleted_at is null)'), 'TotalAssetCost'],
                [Sequelize.literal('(SELECT COUNT(*) FROM `assets` where  deleted_at is null)'), 'assetsCount'],

            ],
            include: [
                { model: statusLabel, required: true, attributes: ['id', 'name'], where: statusWhere },
                { model: location, as: 'rtdLocation', attributes: ['id', 'name'] },
                { model: location, attributes: ['id', 'name'] },
                { model: supplier, attributes: ['id', 'name'] },
                { model: company, attributes: ['id', 'name'] },
                {
                    model: model,
                    required: true,
                    attributes: ['id', 'name', 'model_number', 'eol'],
                    include: [
                        { model: category, attributes: ['id', 'name'], where: catWhere },
                        { model: manufacturer, attributes: ['id', 'name'], where: manWhere }
                    ]
                }
            ],
            where: where,
            order: Sequelize.literal(`${sort} ${order}`),
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
        //res.json({ total: result.count, rows: response, TotalAssetCost: result.rows[0].dataValues.TotalAssetCost });

    }
}))
router.get('/totalassets', errorHandler(async function (req, res, next) {
    const category = models.category;
    const company = models.company;
    const manufacturer = models.manufacturer;
    const statusLabel = models.statusLabel;
    const supplier = models.supplier;
    const model = models.model;
    const user = models.user;
    const customField = models.customField;
    const customFieldset = models.customFieldset;
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    const firmId = req.userInfo.firmId
    asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
    asset.belongsTo(location, { foreignKey: 'location_id' });
    asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
    asset.belongsTo(company, { foreignKey: 'company_id' });
    asset.belongsTo(model, { foreignKey: 'model_id' });
    model.belongsTo(category, { foreignKey: 'category_id' });
    model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    asset.belongsTo(user, { foreignKey: 'user_id' });
    //const queries = req.query;
    const queries1 = req.query;
    let { searchCompany, searchStatus, searchLocation, searchFrom, searchTo, sort, limit, offset, order } = util.queryRequest1(queries1);
   // const status = queries1.status
   const isSuperuser = req.userInfo.isSuperuser
   const queries = req.query;
  // let { search, sort, limit, offset, order } = util.queryRequest(queries);
   let { isDeleteRequest, isRequestable, isStatus } = false
   let statusValue = ''
   const status = queries.status
   let statusWhere = {}

    //[Sequelize.literal('(SELECT COUNT(*) FROM `assets` where  deleted_at is null)'), 'assetsCount']
    //SELECT * FROM `assets` WHERE purchase_date BETWEEN '2022-02-10' and '2022-02-11'
    // let resultdate = await asset.findOne({
    //     attributes: ['id',
    //         [Sequelize.literal('(SELECT * FROM `assets` where  deleted_at is null And purchase_date BETWEEN' +'2022-02-10'+ 'And' +'2022-02-11'+ ')'), 'assetsCount'] ]
    // });
    // console.log("resultdate",resultdate);
      let where = [{
        company_id: { [Op.like]: '%' + searchCompany + '%' },
        status_id: { [Op.like]: '%' + searchStatus + '%' },
        rtd_location_id: { [Op.like]: '%' + searchLocation + '%' },
        //purchase_date: { [Op.like]: '%' + resultdate + '%' },
        firm_id: req.userInfo.firmId,
        [Op.or]: [
            {
                user_id: isSuperuser ? {
                    [Op.ne]: 0
                } : req.userInfo.userId
            },
            {
                assigned_to: isSuperuser ? {
                    [Op.or]: [{
                        [Op.eq]: null
                    }, {
                        [Op.ne]: 0
                    }]
                } : {
                    [Op.eq]: req.userInfo.userId
                }
            }
        ],
        deleted_at: isDeleteRequest ? {
            [Op.ne]: null
        } : {
            [Op.eq]: null
        },
        requestable: isRequestable ? {
            [Op.eq]: 1
        } : {
            [Op.in]: [0, 1]
        }

    }]
    util.addCondition(queries1.model_id, where, { model_id: queries1.model_id })
    util.addCondition(queries1.company_id, where, { company_id: queries1.company_id })
    util.addCondition(queries1.supplier_id, where, { supplier_id: queries1.supplier_id })
    util.addCondition(queries1.location_id, where, { rtd_location_id: queries1.location_id })
    util.addCondition(queries1.assigned_to, where, { assigned_to: queries1.assigned_to })
    util.addCondition(queries1.assigned_type, where, { assigned_type: queries1.assigned_type })
    util.addCondition(queries1.asset_id, where, { id: queries1.asset_id })

    let catWhere = {
        id: {
            [Op.ne]: 0
        }
    }
    if (!_.isNil(queries1.category_id)) {
        catWhere = {
            id: {
                [Op.eq]: queries1.category_id
            }
        }
    }

    let manWhere = {
        id: {
            [Op.ne]: 0
        }
    }
    if (!_.isNil(queries1.manufacturer_id)) {
        manWhere = {
            id: {
                [Op.eq]: queries1.manufacturer_id
            }
        }
    }


    if (_.eq(sort, 'category.name')) {
        sort = '`model.category.name`'
    }
    let result = await asset.findAndCountAll({
        attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'tax_value', 'excluding_tax', 'purchase_date', 'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at',
            'assigned_type',
            [Sequelize.literal('(SELECT CASE WHEN assigned_type = "App\\\\Models\\\\Location" THEN (SELECT name FROM locations WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\User" THEN (SELECT CONCAT(username, " ", employee_num) as name FROM users WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\Asset" THEN (SELECT name FROM assets WHERE id = `asset`.`assigned_to`) END)'), 'assigned'],
            [Sequelize.literal('(SELECT SUM(excluding_tax) FROM `assets` where deleted_at is null)'), 'TotalAssetCost'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` where  deleted_at is null)'), 'assetsCount'],
         //  [Sequelize.literal('(SELECT * FROM `assets` where  deleted_at is null And purchase_date BETWEEN' +searchFrom+ 'And' +searchTo+ ')'), 'purchasedate'] 

        ],
        include: [
            { model: statusLabel, required: true, attributes: ['id', 'name'], where: statusWhere },
            { model: location, as: 'rtdLocation', attributes: ['id', 'name'] },
            { model: location, attributes: ['id', 'name'] },
            { model: supplier, attributes: ['id', 'name'] },
            { model: company, attributes: ['id', 'name'] },
            {
                model: model,
                required: true,
                attributes: ['id', 'name', 'model_number', 'eol'],
                include: [
                    { model: category, attributes: ['id', 'name'], where: catWhere },
                    { model: manufacturer, attributes: ['id', 'name'], where: manWhere }
                ]
            }
        ],
        where: where,
        order: Sequelize.literal(`${sort} ${order}`),
        limit: limit,
        offset: offset
    });

    var response = []
    if (!_.isNil(result)) {
        _.map(result.rows, row => {
            response.push(formatAssetResponse(row))
        })
    }

    res.json({ total: result.count, rows: response, TotalAssetCost: result.rows[0].dataValues.TotalAssetCost });
}))
router.get('/totalassetcost', errorHandler(async function (req, res, next) {
    const asset = models.asset;
    const firmId = req.userInfo.firmId
    let result = await asset.findOne({
        attributes: ['id',
            [Sequelize.literal('(SELECT SUM(purchase_cost) FROM `assets` where firm_id=' + firmId + ' and deleted_at is null)'), 'TotalAssetCost'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` where firm_id=' + firmId + ' and deleted_at is null)'), 'assetsCount'],
        ], where: { firm_id: req.userInfo.firmId }
    });
    var response = {}
    if (!_.isNil(result)) {
        response = {
            TotalAssetCost: result.dataValues.TotalAssetCost,
            assetsCount: result.dataValues.assetsCount,
        }
    }

    res.json(response);
}))
router.get('/selectList', errorHandler(async function (req, res, next) {
    //    const asset = models.asset;
    const response = await util.getSelectList(asset, req)
    res.json(response);
}))

router.get('/audit/selectList', errorHandler(async function (req, res, next) {
    let auditStatus = constants.auditStatus
    res.json(auditStatus);
}))

router.get('/bytag/:tagId', errorHandler(async function (req, res, next) {
    const result = await getAsset({ asset_tag: req.params.tagId })
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.get('/byserial/:serialno', errorHandler(async function (req, res, next) {
    const result = await getAsset({ serial: req.params.serialno })
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.get('/:id', errorHandler(async function (req, res, next) {
    const result = await getAsset({ id: req.params.id })
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.get('/:id/clone', errorHandler(async function (req, res, next) {
    const result = await getAsset({ id: req.params.id })
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

async function getAsset(where) {
    //const asset = models.asset;
    const category = models.category;
    const company = models.company;
    const manufacturer = models.manufacturer;
    const statusLabel = models.statusLabel;
    const supplier = models.supplier;
    const model = models.model;
    const location = models.location;
    const user = models.user;
    const customField = models.customField;
    const customFieldset = models.customFieldset;
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
    asset.belongsTo(location, { foreignKey: 'rtd_location_id' });
    asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
    asset.belongsTo(company, { foreignKey: 'company_id' });
    asset.belongsTo(model, { foreignKey: 'model_id' });
    model.belongsTo(category, { foreignKey: 'category_id' });
    model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    asset.belongsTo(user, { foreignKey: 'user_id' });

    let result = await asset.findOne({
        attributes: ['id', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'purchase_date', 'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at'],
        include: [
            { model: statusLabel, required: true, attributes: ['id', 'name'] },
            { model: location, attributes: ['id', 'name'] },
            { model: supplier, attributes: ['id', 'name'] },
            { model: company, attributes: ['id', 'name'] },
            {
                model: model,
                required: true,
                attributes: ['id', 'name','model_number'],
                include: [
                    { model: category, attributes: ['id', 'name'] },
                    { model: manufacturer, attributes: ['id', 'name'] }
                ]
            },
            { model: user, attributes: ['id', 'username', 'first_name', 'last_name'] }
        ],
        where: where
    });
    return result
}


router.post('/', errorHandler(async function (req, res, next) {
    var purchase_tax = req.body.purchase_cost;
    var gst_percentage = req.body.gst;
    const tax = Math.round((gst_percentage / 100) * (purchase_tax))
    req.body.tax_value = tax;
    var excluding_taxcost = purchase_tax - tax;
    req.body.excluding_tax = excluding_taxcost;
    console.log("req.body.excluding_tax", req.body.excluding_tax);
    //const asset = models.asset;
    var assetid = random.int(100000000, 999999999)
    const actionLogs = models.actionLogs;
    req.body.asset_tag = assetid;
    const userId = req.userInfo.userId;
    var request = req.body;
    request.assets = [{
        serial: request.serial,
        asset_tag: request.asset_tag,
        tax_value: request.tax_value,
        excluding_tax: request.excluding_tax,
    }]
    request.userId = userId;
    const { actionTypes, itemTypes } = constants;
    let id = 0
    await sequelize.transaction(async t => {
        for (let a of request.assets) {
            const type = util.getItemType(req.body)
            let assetRequest = {
                model_id: request.model_id,
                status_id: request.status_id,
                assigned_type: type.assigned_type,
                name: request.name,
                assetdetails: request.assetdetails,
                purchase_date: request.purchase_date,
                supplier_id: request.supplier_id,
                order_number: request.order_number,
                purchase_cost: request.purchase_cost,
                warranty_months: request.warranty_months,
                notes: request.notes,
                company_id: request.company_id,
                rtd_location_id: request.rtd_location_id,
                requestable: request.requestable,
                asset_tag: a.asset_tag,
                serial: a.serial,
                tax_value: a.tax_value,
                excluding_tax: a.excluding_tax,
                user_id: userId,
                firm_id: req.body.firm_id,
                assigned_to: type.assigned_to
                // checkout_counter: _.isNil(type.assigned_to) ? 0 : 1,
                // checkout_counter: 0
            }
            await asset.create(assetRequest, { transaction: t }).then(async assetResult => {
                id = assetResult.id
                const actionLog = {
                    action_type: actionTypes.create,
                    item_type: itemTypes.asset,
                    user_id: userId,
                    company_id: req.body.company_id,
                    item_id: id,
                    location_id: request.rtd_location_id,
                    firm_id: req.body.firm_id
                }
                await actionLogs.create(actionLog, { transaction: t });
            });
        }
    }).then(function (result) {
        res.result = { id: id }
        console.log('commit')
    }).catch(function (err) {
        res.result = { error: err.message }
    });

    next()
}))


router.post('/bulkcheckout', errorHandler(async function (req, res, next) {
    //const asset = models.asset;
    const type = await util.getItemType(req.body)
    const request = {
        note: req.body.note,
        user_id: req.userInfo.userId,
        expected_checkin: req.body.expected_checkin,
        last_checkout: req.body.checkout_at,
        assigned_type: type.assigned_type,
        assigned_to: type.assigned_to
    }
    let result = await asset.update(request, {
        where: {
            id: {
                [Op.in]: req.body.selected_assets
            }
        }
    });

    res.result = result;
    next()
}))

router.post('/audit', errorHandler(async function (req, res, next) {
    //const asset = models.asset;
    const request = {
        notes: req.body.notes,
        user_id: req.userInfo.userId,
        audit_status_id: req.body.audit_status_id
    }
    if (!_.isNil(req.body.next_audit_date)) {
        request.next_audit_date = req.body.next_audit_date
    }
    if (!_.isNil(req.body.latitude) && !_.isNil(req.body.longitude)) {
        request.latitude = req.body.latitude
        request.longitude = req.body.longitude
    }

    let result = await asset.update(request, { where: { asset_tag: req.body.asset_tag } });

    res.result = result;
    next()
}))

router.post('/:id/checkout', errorHandler(async function (req, res, next) {
    const actionLogs = models.actionLogs;
    const type = await util.getItemType(req.body)
    var checkout_counter = 1
    const response = await asset.findOne({
        attributes: ['checkin_counter', 'checkout_counter'],
        where: { id: req.params.id }
    })

    if (!_.isNil(response) && !_.isNil(response.checkout_counter)) {
        checkout_counter = response.checkout_counter + 1
    }
    const statusLabel = models.statusLabel;
    const deployStatus = await statusLabel.findOne({ attributes: ['id'], where: { name: 'deployed' } })

    const statusId = deployStatus.id

    const request = {
        name: req.body.name,
        note: req.body.note,
        user_id: req.userInfo.userId,
        expected_checkin: req.body.expected_checkin,
        status_id: statusId,
        last_checkout: req.body.checkout_at,
        assigned_type: type.assigned_type,
        assigned_to: type.assigned_to,
        checkout_counter: checkout_counter
        // checkout_counter: 1,
        // checkin_counter: 0
    }

    //    let result = await asset.update(request, { where: { id: req.params.id } });

    await sequelize.transaction(t => {
        return asset.update(request, { where: { id: req.params.id } }, { transaction: t }).then(r => {
            const { actionTypes, itemTypes } = constants;
            const actionLog = {
                action_type: actionTypes.checkout,
                item_type: itemTypes.asset,
                user_id: req.userInfo.userId,
                item_id: req.params.id,
                target_id: type.assigned_to,
                target_type: type.assigned_type,
                notes: req.body.notes,
                firm_id: req.body.firm_id
            }
            return actionLogs.create(actionLog, { transaction: t });
        })
    }).then(() => {
        res.result = { id: req.params.id }
    }).catch(err => {
        res.result = { error: err.message }
    })


    next()
}))

router.post('/:id/checkin', errorHandler(async function (req, res, next) {
    //const asset = models.asset;
    //    const type = await util.getItemType(req.body)
    const actionLogs = models.actionLogs;
    const type = await util.getItemType(req.body)
    var checkin_counter = 1
    const response = await asset.findOne({
        attributes: ['checkin_counter', 'checkout_counter', 'assigned_to', 'assigned_type'],
        where: { id: req.params.id }
    })

    if (!_.isNil(response) && !_.isNil(response.checkin_counter)) {
        checkin_counter = response.checkin_counter + 1
    }
    //const statusLabel = models.statusLabel;
    //const deployStatus = await statusLabel.findOne({ attributes: ['id'], where: { name: 'deployable' } })

    const statusId = req.body.status_id
    const request = {
        name: req.body.name,
        note: req.body.note,
        user_id: req.userInfo.userId,
        status_id: statusId,
        location_id: req.body.assigned_location,
        expected_checkin: req.body.checkin_at,
        last_checkout: null,
        assigned_to: null,
        assigned_type: null,
        checkin_counter: checkin_counter
    }

    //    let result = await asset.update(request, { where: { id: req.params.id } });

    await sequelize.transaction(t => {
        return asset.update(request, { where: { id: req.params.id } }, { transaction: t }).then(r => {
            const { actionTypes, itemTypes } = constants;
            const actionLog = {
                action_type: actionTypes.checkInFrom,
                item_type: itemTypes.asset,
                user_id: req.userInfo.userId,
                item_id: req.params.id,
                target_id: response.assigned_to,
                target_type: response.assigned_type,
                notes: req.body.notes,
                firm_id: req.body.firm_id
            }
            return actionLogs.create(actionLog, { transaction: t });
        })
    }).then(() => {
        res.result = { id: req.params.id }
    }).catch(err => {
        res.result = { error: err.message }
    })

    next()
}))

router.put('/:id', errorHandler(async function (req, res, next) {
    const actionLogs = models.actionLogs;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    const { actionTypes, itemTypes } = constants;

    await sequelize.transaction(async t => {
        await asset.update(req.body, { where: { id: id } }, { transaction: t }).then(async assetResult => {
            const actionLog = {
                action_type: actionTypes.update,
                item_type: itemTypes.asset,
                user_id: req.userInfo.userId,
                company_id: req.body.company_id,
                item_id: id,
                location_id: req.body.rtd_location_id,
                firm_id: req.body.firm_id
            }
            await actionLogs.create(actionLog, { transaction: t });
        });
    }).then(function (result) {
        res.result = { id: id }
        console.log('commit')
    }).catch(function (err) {
        res.result = { error: err.message }
        console.log(err)
    });

    next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
    const actionLogs = models.actionLogs;
    const id = _.parseInt(req.params.id)
    //let result = await asset.destroy({ where: { id: id } });
    req.body.deleted_at = new Date()
    req.body.user_id = req.userInfo.userId
    await sequelize.transaction(async t => {
        return asset.update(req.body, { where: { id: id } }, { transaction: t }).then(() => {
            const actionLog = {
                action_type: actionTypes.delete,
                item_type: itemTypes.asset,
                user_id: req.userInfo.userId,
                item_id: id,
                firm_id: req.body.firm_id
            }
            return actionLogs.create(actionLog, { transaction: t });
        });
    }).then(() => {
        res.result = { id: id }
    }).catch((err) => {
        res.result = { error: err.message }
    });

    next()
}))

function formatRequestableResponse(asset) {
    return {
        asset_tag: asset.asset_tag,
        available_actions: { cancel: true, request: true },
        expected_checkin: asset.expected_checkin,
        id: asset.id,
        image: asset.image,
        location: _.isNil(asset.location) ? null : asset.location.name,
        model: _.isNil(asset.model) ? null : asset.model.name,
        model_number: _.isNil(asset.model) ? null : asset.model.model_number,
        name: asset.name,
        serial: asset.serial,
        status_label: _.isNil(asset.statusLabel) ? null : asset.statusLabel.name
    }
}

function getAssigned(asset) {
    let assigned = { id: asset.id, name: asset.dataValues.assigned, type: '', employee_num: '' }
    switch (asset.assigned_type) {
        case constants.itemTypes.user:
            if (_.size(_.split(asset.dataValues.assigned, ' ')) > 0) {
                assigned.name = _.head(_.split(asset.dataValues.assigned, ' '))
                assigned.employee_num = _.split(asset.dataValues.assigned, ' ')[1]
            }
            assigned.type = 'user'
            break;
        case constants.itemTypes.location:
            assigned.type = 'location'
            break;
        case constants.itemTypes.asset:
            assigned.type = 'asset'
            break;
        default:
            assigned.type = ''
            break;
    }
    return assigned
}

function formatResponse(asset) {
    let status = util.getRelationalObject(asset.statusLabel)
    status.status_meta = _.isNil(asset.last_checkout) ? status.name : 'deployed'
    return {
        id: asset.id,
        asset_tag: asset.asset_tag,
        tax_value: asset.tax_value,
        excluding_tax: asset.excluding_tax,
        assetdetails: asset.assetdetails,
        TotalAssetCost: asset.dataValues.TotalAssetCost,
        //assetdetails: JSON.parse(asset.assetdetails),
        requestable: asset.requestable,
        assigned_to: _.isNil(asset.assigned_type) ? {} : getAssigned(asset),
        available_actions: { checkout: true, checkin: true, clone: true, restore: false, update: true, delete: false },
        category: util.getRelationalObject(asset.model.category),
        checkin_counter: asset.checkin_counter,
        checkout_counter: asset.checkout_counter,
        company: util.getRelationalObject(asset.company),
        created_at: util.createdUpdatedDateFormat(asset.created_at),
        custom_fields: [],
        deleted_at: util.createdUpdatedDateFormat(asset.deleted_at),
        eol: asset.model.eol,
        expected_checkin: asset.expected_checkin,
        image: asset.image,
        last_audit_date: util.createdUpdatedDateFormat(asset.last_audit_date),
        last_checkout: util.createdUpdatedDateFormat(asset.last_checkout),
        location: util.getRelationalObject(asset.location),
        manufacturer: util.getRelationalObject(asset.model.manufacturer),
        model: util.getRelationalObject(asset.model),
        model_number: asset.model.model_number, // asset.model_number,
        name: asset.name,
        next_audit_date: util.createdUpdatedDateFormat(asset.next_audit_date),
        notes: asset.notes,
        order_number: asset.order_number,
        purchase_cost: asset.purchase_cost,
        purchase_date: {
            date: util.formatDate(asset.purchase_date, 'YYYY-MM-DD'),
            formatted: util.formatDate(asset.purchase_date, 'YYYY-MM-DD')
        },
        requests_counter: asset.requests_counter,
        rtd_location: util.getRelationalObject(asset.rtdLocation),
        serial: asset.serial,
        status_label: status,
        supplier: util.getRelationalObject(asset.supplier),
        updated_at: util.createdUpdatedDateFormat(asset.updated_at),
        user_can_checkout: _.isNil(asset.assigned_to) ? true : false,
        warranty_expires: util.createdUpdatedDateFormat(asset.warranty_expires),
        warranty_months: asset.warranty_months
    }
}
function formatAssetResponse(asset) {
    let status = util.getRelationalObject(asset.statusLabel)
    status.status_meta = _.isNil(asset.last_checkout) ? status.name : 'deployed'
    return {
        id: asset.id,
        asset_tag: asset.asset_tag,
        tax_value: asset.tax_value,
        excluding_tax: asset.excluding_tax,
        assetdetails: asset.assetdetails,
        TotalAssetCost: asset.dataValues.TotalAssetCost,
        //assetdetails: JSON.parse(asset.assetdetails),
        requestable: asset.requestable,
        assigned_to: _.isNil(asset.assigned_type) ? {} : getAssigned(asset),
        available_actions: { checkout: true, checkin: true, clone: true, restore: false, update: true, delete: false },
        category: util.getRelationalObject(asset.model.category),
        checkin_counter: asset.checkin_counter,
        checkout_counter: asset.checkout_counter,
        company: util.getRelationalObject(asset.company),
        created_at: util.createdUpdatedDateFormat(asset.created_at),
        custom_fields: [],
        deleted_at: util.createdUpdatedDateFormat(asset.deleted_at),
        eol: asset.model.eol,
        expected_checkin: asset.expected_checkin,
        image: asset.image,
        last_audit_date: util.createdUpdatedDateFormat(asset.last_audit_date),
        last_checkout: util.createdUpdatedDateFormat(asset.last_checkout),
        location: util.getRelationalObject(asset.location),
        manufacturer: util.getRelationalObject(asset.model.manufacturer),
        model: util.getRelationalObject(asset.model),
        model_number: asset.model.model_number, // asset.model_number,
        name: asset.name,
        next_audit_date: util.createdUpdatedDateFormat(asset.next_audit_date),
        notes: asset.notes,
        order_number: asset.order_number,
        purchase_cost: asset.purchase_cost,
        purchase_date: {
            date: util.formatDate(asset.purchase_date, 'YYYY-MM-DD'),
            formatted: util.formatDate(asset.purchase_date, 'YYYY-MM-DD')
        },
        requests_counter: asset.requests_counter,
        rtd_location: util.getRelationalObject(asset.rtdLocation),
        serial: asset.serial,
        status_label: status,
        statusName: status.name,
        supplier: util.getRelationalObject(asset.supplier),
        updated_at: util.createdUpdatedDateFormat(asset.updated_at),
        user_can_checkout: _.isNil(asset.assigned_to) ? true : false,
        warranty_expires: util.createdUpdatedDateFormat(asset.warranty_expires),
        warranty_months: asset.warranty_months
    }
}
module.exports = router;
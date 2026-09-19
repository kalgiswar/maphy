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
const { singleImageUpload } = require('../../../utils');
const { multerErrorHandler } = require('../../../utils');
const im = require('imagemagick');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const assetAllowedSortColumns = [
  'id', 'name', 'asset_tag', 'serial', 'purchase_date', 'purchase_cost', 'warranty_months',
  'notes', 'expected_checkin', 'last_audit_date', 'next_audit_date', 'image', 'created_at', 'updated_at',
  'company.name', 'statusLabel.name', 'location.name', 'rtdLocation.name', 'supplier.name',
  'model.name', 'model.model_number', 'model.eol', 'category.name', 'manufacturer.name', 'depreciation.name',
  'category.name', 'model.category.name', 'model.manufacturer.name'
];


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
    const depreciation = models.depreciation;
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
    asset.belongsTo(location, { foreignKey: 'location_id' });
    asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
    asset.belongsTo(company, { foreignKey: 'company_id' });
    asset.belongsTo(model, { foreignKey: 'model_id' });
    model.belongsTo(category, { foreignKey: 'category_id' });
    model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    asset.belongsTo(user, { foreignKey: 'user_id' });
    asset.belongsTo(depreciation, { foreignKey: 'depreciation_id' });
    const isSuperuser = req.userInfo.isSuperuser
    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries, assetAllowedSortColumns);
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
            // assetdetails: {
            //     [Op.like]: '%' + search + '%'
            // },
            // new addition for search
            [Op.and]: [
                {
                    [Op.or]: [
                        { assetdetails: { [Op.like]: `%${search}%` } },
                        { name: { [Op.like]: `%${search}%` } },
                        { serial: { [Op.like]: `%${search}%` } },
                        { asset_tag: { [Op.like]: `%${search}%` } },
                    ]
                }
            ],
            //new addition for search
            firm_id: req.userInfo.firmId,
            [Op.or]: [
                {
                    user_id: (isSuperuser || req.userInfo.isAdmin) ? {
                        [Op.ne]: 0
                    } : req.userInfo.userId
                },
                {
                    assigned_to: (isSuperuser || req.userInfo.isAdmin) ? {
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
        util.addCondition(queries.depreciation_id, where, { id: queries.depreciation_id })

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
            attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number',
                // 'capacity',
                'purchase_cost', 'tax_value', 'excluding_tax', 'purchase_date',
                // 'hydrostatic_test_due_date',
                'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at', 'depreciation_id',
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
                { model: depreciation, attributes: ['id', 'name'] },
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

router.get('/byStatus', errorHandler(async function (req, res, next) {
    const category = models.category;
    const company = models.company;
    const manufacturer = models.manufacturer;
    const statusLabel = models.statusLabel;
    const supplier = models.supplier;
    const model = models.model;
    const user = models.user;
    const customField = models.customField;
    const customFieldset = models.customFieldset;
    const depreciation = models.depreciation;
    const customFieldCustomFieldset = models.customFieldCustomFieldset;
    asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
    asset.belongsTo(location, { foreignKey: 'location_id' });
    asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
    asset.belongsTo(company, { foreignKey: 'company_id' });
    asset.belongsTo(model, { foreignKey: 'model_id' });
    model.belongsTo(category, { foreignKey: 'category_id' });
    model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    asset.belongsTo(user, { foreignKey: 'user_id' });
    asset.belongsTo(depreciation, { foreignKey: 'depreciation_id' });
    const isSuperuser = req.userInfo.isSuperuser
    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries, assetAllowedSortColumns);
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
                    user_id: (isSuperuser || req.userInfo.isAdmin) ? {
                        [Op.ne]: 0
                    } : req.userInfo.userId
                },
                {
                    assigned_to: (isSuperuser || req.userInfo.isAdmin) ? {
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
        util.addCondition(queries.depreciation_id, where, { id: queries.depreciation_id })

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

        let statusWhere = [{
            name: isStatus ? {
                [Op.eq]: statusValue
            } : {
                [Op.like]: '%' + search + '%'
            }
        }]
        util.addCondition(queries.status_id, statusWhere, { id: queries.status_id })
        if (_.eq(sort, 'category.name')) {
            sort = '`model.category.name`'
        }
        let result = await asset.findAndCountAll({
            attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number',
                // 'capacity', 
                'purchase_cost', 'tax_value', 'excluding_tax', 'purchase_date',
                // 'hydrostatic_test_due_date',
                'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at', 'depreciation_id',
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
                { model: depreciation, attributes: ['id', 'name'] },
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
    let { searchCompany, searchStatus, searchLocation, searchFrom, searchTo, sort, limit, offset, order } = util.queryRequest1(queries1, assetAllowedSortColumns);
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
        attributes: ['id', 'assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number',
            // 'capacity', 
            'purchase_cost', 'tax_value', 'excluding_tax', 'purchase_date',
            // 'hydrostatic_test_due_date',
            'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at',
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

    res.json({ total: result.count, rows: response, TotalAssetCost: (result.rows && result.rows.length > 0) ? (result.rows[0].dataValues.TotalAssetCost || 0) : 0 });
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

router.post('/agent-import', errorHandler(async function (req, res, next) {
    const agentTelemetry = models.agentTelemetry;
    try {
        const payload = req.body;
        payload.firm_id = req.userInfo.firmId;
        const newReport = await agentTelemetry.create(payload);
        res.status(201).json({ success: true, message: 'Telemetry received successfully.', id: newReport.id });
    } catch (err) {
        console.error('Telemetry ingestion error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}));

router.get('/pending-agent', errorHandler(async function (req, res, next) {
    const agentTelemetry = models.agentTelemetry;
    const search = req.query.search || '';
    try {
        const rows = await agentTelemetry.findAll({
            where: {
                firm_id: req.userInfo.firmId,
                [Sequelize.Op.or]: [
                    { hostname: { [Sequelize.Op.like]: `%${search}%` } },
                    { serial: { [Sequelize.Op.like]: `%${search}%` } },
                    { model: { [Sequelize.Op.like]: `%${search}%` } }
                ]
            },
            order: [['created_at', 'DESC']]
        });

        const formattedRows = rows.map(row => {
            const data = row.toJSON();
            const dateVal = data.createdAt || data.created_at || row.createdAt || row.created_at;
            data.timestamp = dateVal ? new Date(dateVal).toISOString().replace('T', ' ').substring(0, 19) : '';
            return data;
        });

        res.json({ rows: formattedRows });
    } catch (err) {
        console.error('Failed to get pending agents:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}));

router.post('/approve-agent', errorHandler(async function (req, res, next) {
    const agentTelemetry = models.agentTelemetry;
    const actionLogs = models.actionLogs;
    const depreciation = models.depreciation;

    const payload = req.body;
    const firmId = req.userInfo.firmId;
    const userId = req.userInfo.userId;

    try {
        // Find the pending agent telemetry report
        const report = await agentTelemetry.findOne({
            where: { id: payload.id, firm_id: firmId }
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Telemetry report not found.' });
        }

        // Resolve depreciation_id
        let depreciationId = 1;
        const defaultDep = await depreciation.findOne({
            where: { firm_id: firmId }
        });
        if (defaultDep) {
            depreciationId = defaultDep.id;
        } else {
            const anyDep = await depreciation.findOne();
            depreciationId = anyDep ? anyDep.id : 1;
        }

        // Create the asset inside a transaction
        let newAssetId = null;
        await sequelize.transaction(async (t) => {
            const newAsset = await asset.create({
                model_id: payload.model_id,
                status_id: payload.status_id,
                assigned_type: null,
                name: payload.name || report.hostname,
                assetdetails: null,
                purchase_date: new Date(),
                supplier_id: null,
                order_number: null,
                purchase_cost: 0,
                warranty_months: null,
                notes: payload.notes || `Ingested automatically via Agent Script. System Specs: CPU: ${report.cpu}, RAM: ${report.ram}, Disk: ${report.disk}, IP: ${report.ip_address}, Logged User: ${report.logged_user}`,
                company_id: payload.company_id,
                rtd_location_id: payload.location_id,
                requestable: 0,
                asset_tag: payload.asset_tag,
                serial: payload.serial || report.serial,
                tax_value: 0,
                excluding_tax: 0,
                user_id: userId,
                firm_id: firmId,
                assigned_to: null,
                depreciation_id: depreciationId
            }, { transaction: t });

            newAssetId = newAsset.id;

            // Create Action Log
            await actionLogs.create({
                action_type: constants.actionTypes.create,
                item_type: constants.itemTypes.asset,
                user_id: userId,
                company_id: payload.company_id,
                item_id: newAsset.id,
                location_id: payload.location_id,
                firm_id: firmId
            }, { transaction: t });

            // Delete the telemetry report
            await agentTelemetry.destroy({
                where: { id: payload.id },
                transaction: t
            });
        });

        res.json({ success: true, message: 'Asset approved and ingested successfully.', id: newAssetId });
    } catch (err) {
        console.error('Failed to approve agent asset:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}));

router.delete('/pending-agent/:id', errorHandler(async function (req, res, next) {
    const agentTelemetry = models.agentTelemetry;
    const firmId = req.userInfo.firmId;
    const id = req.params.id;

    try {
        const deleted = await agentTelemetry.destroy({
            where: { id: id, firm_id: firmId }
        });
        
        if (deleted) {
            res.json({ success: true, message: 'Agent report rejected and discarded.' });
        } else {
            res.status(404).json({ success: false, message: 'Telemetry report not found.' });
        }
    } catch (err) {
        console.error('Failed to delete pending agent:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}));

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
    const depreciation = models.depreciation;
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
    asset.belongsTo(user, { foreignKey: 'assigned_to' });
    asset.belongsTo(depreciation, { foreignKey: 'depreciation_id' });


    let result = await asset.findOne({
        attributes: ['id', 'assigned_to', 'assigned_type', 'asset_tag', 'requestable', 'order_number',
            // 'capacity',
            'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'purchase_date',
            // 'hydrostatic_test_due_date', 
            'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at',
            [
                Sequelize.literal(
                    '(SELECT CASE WHEN assigned_type = "App\\\\Models\\\\Location" THEN (SELECT name FROM locations WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\User" THEN (SELECT CONCAT(username, " ", employee_num) as name FROM users WHERE id = `asset`.`assigned_to`) WHEN assigned_type = "App\\\\Models\\\\Asset" THEN (SELECT name FROM assets WHERE id = `asset`.`assigned_to`) END)'), 'assigned'],
            [Sequelize.literal('(SELECT SUM(excluding_tax) FROM `assets` where deleted_at is null)'), 'TotalAssetCost'],
            [Sequelize.literal('(SELECT COUNT(*) FROM `assets` where  deleted_at is null)'), 'assetsCount'],
        ],
        include: [
            { model: statusLabel, required: true, attributes: ['id', 'name'] },
            { model: location, as: 'rtdLocation', attributes: ['id', 'name'] },
            { model: supplier, attributes: ['id', 'name'] },
            { model: company, attributes: ['id', 'name'] },
            { model: depreciation, attributes: ['id', 'name'] },
            {
                model: model,
                required: true,
                attributes: ['id', 'name', 'model_number'],
                include: [
                    { model: category, attributes: ['id', 'name'] },
                    { model: manufacturer, attributes: ['id', 'name'] }
                ]
            },
            { model: user, attributes: ['id', 'username', 'first_name', 'last_name'] }
        ],
        where: where
    });
    console.log("resul", result);
    return result
}


// async function getAsset(where) {
//     //const asset = models.asset;
//     const category = models.category;
//     const company = models.company;
//     const manufacturer = models.manufacturer;
//     const statusLabel = models.statusLabel;
//     const supplier = models.supplier;
//     const model = models.model;
//     const location = models.location;
//     const depreciation=models.depreciation;
//     const user = models.user;
//     const customField = models.customField;
//     const customFieldset = models.customFieldset;
//     const customFieldCustomFieldset = models.customFieldCustomFieldset;
//     asset.belongsTo(statusLabel, { foreignKey: 'status_id' });
//     asset.belongsTo(location, { foreignKey: 'rtd_location_id' });
//     asset.belongsTo(supplier, { foreignKey: 'supplier_id' });
//     asset.belongsTo(company, { foreignKey: 'company_id' });
//     asset.belongsTo(model, { foreignKey: 'model_id' });
//     model.belongsTo(category, { foreignKey: 'category_id' });
//     model.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
//     asset.belongsTo(user, { foreignKey: 'user_id' });
//     asset.belongsTo(depreciation, { foreignKey: 'depreciation_id' });


//     let result = await asset.findOne({
//         attributes: ['id','assigned_to', 'asset_tag', 'requestable', 'order_number', 'assetdetails', 'checkin_counter', 'checkout_counter', 'expected_checkin', 'image', 'last_audit_date', 'last_checkout', 'name', 'next_audit_date', 'notes', 'order_number', 'purchase_cost', 'purchase_date', 'serial', 'warranty_months', 'requestable', 'created_at', 'updated_at', 'deleted_at'],
//         include: [
//             { model: statusLabel, required: true, attributes: ['id', 'name'] },
//             { model: location, attributes: ['id', 'name'] },
//             { model: supplier, attributes: ['id', 'name'] },
//             { model: company, attributes: ['id', 'name'] },
//             { model: depreciation, attributes: ['id', 'name'] },
//             {
//                 model: model,
//                 required: true,
//                 attributes: ['id', 'name','model_number'],
//                 include: [
//                     { model: category, attributes: ['id', 'name'] },
//                     { model: manufacturer, attributes: ['id', 'name'] }
//                 ]
//             },
//             { model: user, attributes: ['id', 'username', 'first_name', 'last_name'] }
//         ],
//         where: where
//     });
//     return result
// }


router.post('/', singleImageUpload, multerErrorHandler, errorHandler(async function (req, res, next) {
    try {
        console.log("st");
        console.log('req.headers:', req.headers['content-type']);
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

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
        let compressedImagePath = null;

        // ✅ Save image only if API succeeds
        if (req.file) {
            // Write the file to disk manually from buffer
            const uniqueName = `asset_${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
            const rawPath = path.join('uploads', 'raw-' + uniqueName); // temp path
            const finalPath = path.join('uploads', uniqueName);

            // Write original to temp first
            fs.writeFileSync(rawPath, req.file.buffer);

            // Compress using ImageMagick
            const convertCommand = `convert "${rawPath}" -resize 800x -strip -quality 75 "${finalPath}"`;

            await new Promise((resolve, reject) => {
                exec(convertCommand, (error) => {
                    if (error) return reject(error);

                    compressedImagePath = finalPath;

                    // Clean up raw buffer file
                    fs.unlink(rawPath, err => {
                        if (err) console.warn('⚠️ Failed to delete raw buffer image:', err.message);
                    });

                    resolve();
                });
            });
        }

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
                    // hydrostatic_test_due_date: request.hydrostatic_test_due_date,
                    supplier_id: request.supplier_id,
                    order_number: request.order_number,
                    // capacity: request.capacity,
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
                    firm_id: req.userInfo.firmId,
                    assigned_to: type.assigned_to,
                    depreciation_id: req.body.depreciation_id,
                    image: req.file ? compressedImagePath : null

                    // checkout_counter: _.isNil(type.assigned_to) ? 0 : 1,
                    // checkout_counter: 0
                }
                console.log("assets", assetRequest);
                await asset.create(assetRequest, { transaction: t }).then(async assetResult => {
                    id = assetResult.id
                    const actionLog = {
                        action_type: actionTypes.create,
                        item_type: itemTypes.asset,
                        user_id: userId,
                        company_id: req.body.company_id,
                        item_id: id,
                        location_id: request.rtd_location_id,
                        firm_id: req.userInfo.firmId
                    }
                    await actionLogs.create(actionLog, { transaction: t });
                });
            }
        });
        res.result = { id: id };
        console.log('commit');
        next();

    } catch (err) {
        console.error("Asset creation error:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
}));


// router.post('/', errorHandler(async function (req, res, next) {
//     var purchase_tax = req.body.purchase_cost;
//     var gst_percentage = req.body.gst;
//     const tax = Math.round((gst_percentage / 100) * (purchase_tax))
//     req.body.tax_value = tax;
//     var excluding_taxcost = purchase_tax - tax;
//     req.body.excluding_tax = excluding_taxcost;
//     console.log("req.body.excluding_tax", req.body.excluding_tax);
//     //const asset = models.asset;
//     var assetid = random.int(100000000, 999999999)
//     const actionLogs = models.actionLogs;
//     req.body.asset_tag = assetid;
//     const userId = req.userInfo.userId;
//     var request = req.body;
//     request.assets = [{
//         serial: request.serial,
//         asset_tag: request.asset_tag,
//         tax_value: request.tax_value,
//         excluding_tax: request.excluding_tax,
//     }]
//     request.userId = userId;
//     const { actionTypes, itemTypes } = constants;
//     let id = 0
//     await sequelize.transaction(async t => {
//         for (let a of request.assets) {
//             const type = util.getItemType(req.body)
//             let assetRequest = {
//                 model_id: request.model_id,
//                 status_id: request.status_id,
//                 assigned_type: type.assigned_type,
//                 name: request.name,
//                 assetdetails: request.assetdetails,
//                 purchase_date: request.purchase_date,
//                 supplier_id: request.supplier_id,
//                 order_number: request.order_number,
//                 purchase_cost: request.purchase_cost,
//                 warranty_months: request.warranty_months,
//                 notes: request.notes,
//                 company_id: request.company_id,
//                 rtd_location_id: request.rtd_location_id,
//                 requestable: request.requestable,
//                 asset_tag: a.asset_tag,
//                 serial: a.serial,
//                 tax_value: a.tax_value,
//                 excluding_tax: a.excluding_tax,
//                 user_id: userId,
//                 firm_id: req.body.firm_id,
//                 assigned_to: type.assigned_to,
//                 depreciation_id:req.body.depreciation_id,

//                 // checkout_counter: _.isNil(type.assigned_to) ? 0 : 1,
//                 // checkout_counter: 0
//             }
//             await asset.create(assetRequest, { transaction: t }).then(async assetResult => {
//                 id = assetResult.id
//                 const actionLog = {
//                     action_type: actionTypes.create,
//                     item_type: itemTypes.asset,
//                     user_id: userId,
//                     company_id: req.body.company_id,
//                     item_id: id,
//                     location_id: request.rtd_location_id,
//                     firm_id: req.body.firm_id
//                 }
//                 await actionLogs.create(actionLog, { transaction: t });
//             });
//         }
//     }).then(function (result) {
//         res.result = { id: id }
//         console.log('commit')
//     }).catch(function (err) {
//         res.result = { error: err.message }
//     });

//     next()
// }))


router.post('/Old_bulkcheckout', errorHandler(async function (req, res, next) {
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

router.post('/bulkcheckout', errorHandler(async function (req, res, next) {
    const type = await util.getItemType(req.body);
    const statusLabel = models.statusLabel;
    const deployStatus = await statusLabel.findOne({ attributes: ['id'], where: { name: 'deployed' } });
    const statusId = deployStatus.id;
    const selectedAssetIds = req.body.selected_assets;

    // Fetch current checkout_counters for selected assets
    const assets = await asset.findAll({
        attributes: ['id', 'checkout_counter'],
        where: { id: { [Op.in]: selectedAssetIds } }
    });

    // Start transaction
    await sequelize.transaction(async (t) => {
        const { actionTypes, itemTypes } = constants;
        const actionLogs = models.actionLogs;

        // Update each asset and create corresponding action log
        const updatePromises = assets.map(async (item) => {
            const updated_checkout_counter = (item.checkout_counter || 0) + 1;

            const updateRequest = {
                note: req.body.note,
                user_id: req.userInfo.userId,
                expected_checkin: req.body.expected_checkin,
                last_checkout: req.body.checkout_at,
                status_id: statusId,
                assigned_type: type.assigned_type,
                assigned_to: type.assigned_to,
                checkout_counter: updated_checkout_counter
            };

            await asset.update(updateRequest, {
                where: { id: item.id },
                transaction: t
            });

            const actionLog = {
                action_type: actionTypes.checkout,
                item_type: itemTypes.asset,
                user_id: req.userInfo.userId,
                item_id: item.id,
                target_id: type.assigned_to,
                target_type: type.assigned_type,
                notes: req.body.note,  // make sure this is singular 'note' if that's what your model expects
                firm_id: req.userInfo.firmId
            };

            await actionLogs.create(actionLog, { transaction: t });
        });

        await Promise.all(updatePromises); // Run all updates + logs in parallel within transaction
    });

    res.result = { message: 'Bulk checkout completed successfully', updatedAssets: selectedAssetIds };
    next();
}));



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
                firm_id: req.userInfo.firmId
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
                firm_id: req.userInfo.firmId
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

router.put('/:id', singleImageUpload, multerErrorHandler, errorHandler(async function (req, res, next) {
    const actionLogs = models.actionLogs;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let compressedImagePath = null;

    // ✅ Step 1: Fetch existing asset to get current image path
    const existingAsset = await asset.findOne({ where: { id } });

    if (!existingAsset) {
        return res.status(404).json({ error: 'Asset not found' });
    }

    // ✅ Step 2: If new image is uploaded
    if (req.file) {
        const uniqueName = `asset_${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
        const rawPath = path.join('uploads', 'raw-' + uniqueName); // temporary raw image
        const finalPath = path.join('uploads', uniqueName);        // final compressed image

        // Save raw buffer to disk
        fs.writeFileSync(rawPath, req.file.buffer);

        const convertCommand = `convert "${rawPath}" -resize 800x -strip -quality 75 "${finalPath}"`;

        await new Promise((resolve, reject) => {
            exec(convertCommand, (error) => {
                if (error) return reject(error);

                // ✅ Delete raw buffer file
                fs.unlink(rawPath, err => {
                    if (err) console.warn('⚠️ Failed to delete temp image:', err.message);
                });

                // ✅ Delete existing image from disk if exists
                if (existingAsset.image && fs.existsSync(existingAsset.image)) {
                    fs.unlink(existingAsset.image, err => {
                        if (err) console.warn('⚠️ Failed to delete old image:', err.message);
                        else console.log('🗑️ Old image deleted:', existingAsset.image);
                    });
                }

                compressedImagePath = finalPath;
                resolve();
            });
        });
        req.body.image = compressedImagePath;
    } else {
        // ✅ No new image uploaded, keep the current one
        req.body.image = existingAsset.image;
    }
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
                firm_id: req.userInfo.firmId
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
                firm_id: req.userInfo.firmId
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
        // capacity: asset.capacity,
        purchase_cost: asset.purchase_cost,
        purchase_date: {
            date: util.formatDate(asset.purchase_date, 'YYYY-MM-DD'),
            formatted: util.formatDate(asset.purchase_date, 'YYYY-MM-DD')
        },
        // hydrostatic_test_due_date: {
        //     date: util.formatDate(asset.hydrostatic_test_due_date, 'YYYY-MM-DD'),
        //     formatted: util.formatDate(asset.hydrostatic_test_due_date, 'YYYY-MM-DD')
        // },
        requests_counter: asset.requests_counter,
        rtd_location: util.getRelationalObject(asset.rtdLocation),
        serial: asset.serial,
        status_label: status,
        supplier: util.getRelationalObject(asset.supplier),
        updated_at: util.createdUpdatedDateFormat(asset.updated_at),
        user_can_checkout: _.isNil(asset.assigned_to) ? true : false,
        warranty_expires: util.createdUpdatedDateFormat(asset.warranty_expires),
        warranty_months: asset.warranty_months,
        depreciation: util.getRelationalObject(asset.depreciation),

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
        // capacity: asset.capacity,
        purchase_cost: asset.purchase_cost,
        purchase_date: {
            date: util.formatDate(asset.purchase_date, 'YYYY-MM-DD'),
            formatted: util.formatDate(asset.purchase_date, 'YYYY-MM-DD')
        },
        // hydrostatic_test_due_date: {
        //     date: util.formatDate(asset.hydrostatic_test_due_date, 'YYYY-MM-DD'),
        //     formatted: util.formatDate(asset.hydrostatic_test_due_date, 'YYYY-MM-DD')
        // },
        requests_counter: asset.requests_counter,
        rtd_location: util.getRelationalObject(asset.rtdLocation),
        serial: asset.serial,
        status_label: status,
        statusName: status.name,
        supplier: util.getRelationalObject(asset.supplier),
        updated_at: util.createdUpdatedDateFormat(asset.updated_at),
        user_can_checkout: _.isNil(asset.assigned_to) ? true : false,
        warranty_expires: util.createdUpdatedDateFormat(asset.warranty_expires),
        warranty_months: asset.warranty_months,
        depreciation: util.getRelationalObject(asset.depreciation),
    }
}
// Helper for casing-agnostic and space-agnostic matching of excel headers
const getRowValue = (row, possibleKeys) => {
    for (let key of Object.keys(row)) {
        const normalizedKey = key.trim().toLowerCase().replace(/[\s_-]/g, '');
        for (let pk of possibleKeys) {
            if (normalizedKey === pk.toLowerCase().replace(/[\s_-]/g, '')) {
                return row[key];
            }
        }
    }
    return null;
};

// Ensure bulk import template exists
(function ensureBulkTemplateExists() {
    try {
        const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const templatePath = path.join(uploadDir, 'assets_bulk_import_template.xlsx');
        if (!fs.existsSync(templatePath)) {
            console.log('Generating bulk import template at:', templatePath);
            const headers = [
                ['Asset Name', 'Serial', 'Asset Tag', 'Category', 'Model', 'Manufacturer', 'Status', 'Location', 'Company', 'Supplier', 'Purchase Date', 'Purchase Cost', 'Warranty Months', 'Notes']
            ];
            // Add a mock row as a sample
            headers.push([
                'Sample Laptop', 'SAMPLE-SERIAL-123', 'TAG123456', 'Laptops', 'ThinkPad T14', 'Lenovo', 'Ready to Deploy', 'Headquarters', 'My Company', 'Dell Supplier', '2026-06-17', '1200', '36', 'This is a sample asset'
            ]);
            const ws = XLSX.utils.aoa_to_sheet(headers);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Template');
            XLSX.writeFile(wb, templatePath);
        }
    } catch (err) {
        console.error('Error generating bulk template:', err);
    }
})();

// POST /hardware/bulk-upload
router.post('/bulk-upload', upload.single('file'), errorHandler(async function (req, res, next) {
    console.log("=== BULK UPLOAD HANDLER TRIGGERED ===");
    console.log("File:", req.file ? { originalname: req.file.originalname, size: req.file.size } : "undefined");
    console.log("User Info:", req.userInfo);
    try {
        if (!req.file) {
            console.error("Bulk upload failed: No file uploaded in request");
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const firmId = req.userInfo.firmId;
        const userId = req.userInfo.userId;

        // Parse Excel file from buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Parsed ${parsedData.length} rows from spreadsheet`);

        if (!parsedData || parsedData.length === 0) {
            return res.json({ success: true, message: 'Import completed: 0 assets created (empty spreadsheet).' });
        }

        const successRows = [];
        const errorRows = [];
        let importedCount = 0;

        const category = models.category;
        const company = models.company;
        const statusLabel = models.statusLabel;
        const supplier = models.supplier;
        const model = models.model;
        const depreciation = models.depreciation;
        const actionLogs = models.actionLogs;
        const manufacturer = models.manufacturer;

        for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i];
            try {
                const name = getRowValue(row, ['Asset Name', 'Name', 'Asset_Name']);
                const serial = getRowValue(row, ['Serial', 'Serial Number', 'Serial_Number', 'SerialNumber']);
                
                // Skip if empty row
                if (!name && !serial) {
                    continue;
                }

                // Process in separate transaction per row so one failure doesn't roll back the whole list
                await sequelize.transaction(async t => {
                    // 1. Resolve Category
                    let categoryName = getRowValue(row, ['Category', 'Category Name', 'Category_Name']);
                    let categoryRecord = null;
                    if (categoryName) {
                        categoryRecord = await category.findOne({
                            where: { name: categoryName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!categoryRecord) {
                            categoryRecord = await category.create({
                                name: categoryName,
                                category_type: 'asset',
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    } else {
                        categoryRecord = await category.findOne({
                            where: { name: 'General Assets', firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!categoryRecord) {
                            categoryRecord = await category.create({
                                name: 'General Assets',
                                category_type: 'asset',
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 2. Resolve Manufacturer
                    let manufacturerName = getRowValue(row, ['Manufacturer', 'Manufacturer Name', 'Manufacturer_Name']);
                    let manufacturerRecord = null;
                    if (manufacturerName) {
                        manufacturerRecord = await manufacturer.findOne({
                            where: { name: manufacturerName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!manufacturerRecord) {
                            manufacturerRecord = await manufacturer.create({
                                name: manufacturerName,
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    } else {
                        manufacturerRecord = await manufacturer.findOne({
                            where: { firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!manufacturerRecord) {
                            manufacturerRecord = await manufacturer.create({
                                name: 'Default Manufacturer',
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 3. Resolve Model
                    let modelName = getRowValue(row, ['Model', 'Model Name', 'Model_Name']);
                    let modelRecord = null;
                    if (modelName) {
                        modelRecord = await model.findOne({
                            where: { name: modelName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!modelRecord) {
                            modelRecord = await model.create({
                                name: modelName,
                                category_id: categoryRecord.id,
                                manufacturer_id: manufacturerRecord.id,
                                model_number: 'M-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        } else if (!modelRecord.manufacturer_id || !modelRecord.category_id) {
                            await modelRecord.update({
                                manufacturer_id: modelRecord.manufacturer_id || manufacturerRecord.id,
                                category_id: modelRecord.category_id || categoryRecord.id
                            }, { transaction: t });
                        }
                    } else {
                        modelRecord = await model.findOne({
                            where: { name: 'Default Model', firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!modelRecord) {
                            modelRecord = await model.create({
                                name: 'Default Model',
                                category_id: categoryRecord.id,
                                manufacturer_id: manufacturerRecord.id,
                                model_number: 'M-DEFAULT',
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        } else if (!modelRecord.manufacturer_id || !modelRecord.category_id) {
                            await modelRecord.update({
                                manufacturer_id: modelRecord.manufacturer_id || manufacturerRecord.id,
                                category_id: modelRecord.category_id || categoryRecord.id
                            }, { transaction: t });
                        }
                    }

                    // 3. Resolve Status Label
                    let statusName = getRowValue(row, ['Status', 'Status Label', 'Status_Label', 'StatusLabel']);
                    let statusRecord = null;
                    if (statusName) {
                        statusRecord = await statusLabel.findOne({
                            where: { name: statusName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                    }
                    if (!statusRecord) {
                        statusRecord = await statusLabel.findOne({
                            where: { firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!statusRecord) {
                            statusRecord = await statusLabel.create({
                                name: statusName || 'Ready to Deploy',
                                deployable: true,
                                pending: false,
                                archived: false,
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 4. Resolve Location
                    let locationName = getRowValue(row, ['Location', 'Location Name', 'Location_Name', 'RTD Location']);
                    let locationRecord = null;
                    if (locationName) {
                        locationRecord = await models.location.findOne({
                            where: { name: locationName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!locationRecord) {
                            locationRecord = await models.location.create({
                                name: locationName,
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 5. Resolve Company
                    let companyName = getRowValue(row, ['Company', 'Company Name', 'Company_Name']);
                    let companyRecord = null;
                    if (companyName) {
                        companyRecord = await company.findOne({
                            where: { name: companyName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!companyRecord) {
                            companyRecord = await company.create({
                                name: companyName,
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 6. Resolve Supplier
                    let supplierName = getRowValue(row, ['Supplier', 'Supplier Name', 'Supplier_Name']);
                    let supplierRecord = null;
                    if (supplierName) {
                        supplierRecord = await supplier.findOne({
                            where: { name: supplierName, firm_id: firmId, deleted_at: null },
                            transaction: t
                        });
                        if (!supplierRecord) {
                            supplierRecord = await supplier.create({
                                name: supplierName,
                                firm_id: firmId,
                                user_id: userId
                            }, { transaction: t });
                        }
                    }

                    // 7. Resolve Depreciation
                    let depreciationId = modelRecord.depreciation_id;
                    if (!depreciationId) {
                        const defaultDep = await depreciation.findOne({
                            where: { firm_id: firmId },
                            transaction: t
                        });
                        if (defaultDep) {
                            depreciationId = defaultDep.id;
                        } else {
                            const anyDep = await depreciation.findOne({ transaction: t });
                            depreciationId = anyDep ? anyDep.id : 1;
                        }
                    }

                    // Parse Cost & Date
                    let costVal = getRowValue(row, ['Purchase Cost', 'Cost', 'PurchaseCost']);
                    if (costVal) {
                        if (typeof costVal === 'string') {
                            costVal = parseFloat(costVal.replace(/[^0-9.]/g, ''));
                        }
                        if (isNaN(costVal)) {
                            costVal = null;
                        }
                    }

                    let dateVal = getRowValue(row, ['Purchase Date', 'PurchaseDate']);
                    if (dateVal) {
                        if (typeof dateVal === 'number') {
                            dateVal = new Date((dateVal - 25569) * 86400 * 1000);
                        } else {
                            dateVal = new Date(dateVal);
                        }
                        if (isNaN(dateVal.getTime())) {
                            dateVal = null;
                        }
                    }

                    let assetTag = getRowValue(row, ['Asset Tag', 'AssetTag', 'Tag']);
                    if (!assetTag) {
                        assetTag = random.int(100000000, 999999999);
                    }

                    // Create Asset
                    const newAsset = await asset.create({
                        model_id: modelRecord.id,
                        status_id: statusRecord.id,
                        assigned_type: null,
                        name: name || modelRecord.name,
                        assetdetails: null,
                        purchase_date: dateVal,
                        supplier_id: supplierRecord ? supplierRecord.id : null,
                        order_number: getRowValue(row, ['Order Number', 'OrderNumber']) || null,
                        purchase_cost: costVal,
                        warranty_months: getRowValue(row, ['Warranty Months', 'Warranty']) || null,
                        notes: getRowValue(row, ['Notes', 'Note']) || null,
                        company_id: companyRecord ? companyRecord.id : null,
                        rtd_location_id: locationRecord ? locationRecord.id : null,
                        requestable: 0,
                        asset_tag: assetTag,
                        serial: serial || 'S-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                        tax_value: 0,
                        excluding_tax: costVal || 0,
                        user_id: userId,
                        firm_id: firmId,
                        assigned_to: null,
                        depreciation_id: depreciationId
                    }, { transaction: t });

                    // Create Action Log
                    await actionLogs.create({
                        action_type: constants.actionTypes.create,
                        item_type: constants.itemTypes.asset,
                        user_id: userId,
                        company_id: companyRecord ? companyRecord.id : null,
                        item_id: newAsset.id,
                        location_id: locationRecord ? locationRecord.id : null,
                        firm_id: firmId
                    }, { transaction: t });

                    successRows.push(newAsset.name);
                    importedCount++;
                });
            } catch (rowErr) {
                console.error(`Row ${i + 2} import failed:`, rowErr);
                errorRows.push(`Row ${i + 2}: ${rowErr.message}`);
            }
        }

        res.json({
            success: true,
            message: `Import completed: ${importedCount} assets created, ${errorRows.length} failed.`,
            errors: errorRows
        });
    } catch (err) {
        console.error('Bulk upload error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
}));

module.exports = router;
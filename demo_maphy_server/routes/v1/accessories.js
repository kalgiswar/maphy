var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
const { errorHandler } = require('../../shared/error-handler')

router.get('/', errorHandler(async function (req, res, next) {
    const accessory = models.accessory;
    const category = models.category;
    const company = models.company;
    const location = models.location;
    const manufacturer = models.manufacturer;
    const supplier = models.supplier;
    const accessoryUser = models.accessoryUser;
    accessory.belongsTo(category, { foreignKey: 'category_id' });
    accessory.belongsTo(company, { foreignKey: 'company_id' });
    accessory.belongsTo(location, { foreignKey: 'location_id' });
    accessory.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    accessory.belongsTo(supplier, { foreignKey: 'supplier_id' });
    accessory.hasMany(accessoryUser, { foreignKey: 'accessory_id' });
    let isSuperuser = req.userInfo.isSuperuser
    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries);
    let where = [{
        name: {
            [Op.like]: '%' + search + '%'
        }
    }, {
        deleted_at: {
            [Op.eq]: null
        }
    }, { firm_id: req.userInfo.firmId }]
    util.addCondition(queries.company_id, where, { company_id: queries.company_id })
    util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id })
    util.addCondition(queries.supplier_id, where, { supplier_id: queries.supplier_id })
    util.addCondition(queries.category_id, where, { category_id: queries.category_id })
    util.addCondition(queries.location_id, where, { location_id: queries.location_id })

    let assigned_to = req.userInfo.userId
    if (!_.isNil(queries.assigned_to)) {
        assigned_to = queries.assigned_to
        //util.addCondition(queries.assigned_to, where, {assigned_to: assigned_to})
        isSuperuser = false
    }
    let accessoryIds = []
    if (!isSuperuser) {
        const accessoryUserResponse = await accessoryUser.findAll({ attributes: ['accessory_id'], where: { assigned_to: _.isNil(assigned_to) ? req.userInfo.userId : assigned_to } })
        if (!_.isEmpty(accessoryUserResponse)) {
            _.map(accessoryUserResponse, accUser => { accessoryIds.push(accUser.accessory_id) })
        }
        where.push([{
            [Op.or]: [{
                id: {
                    [Op.in]: accessoryIds
                }
            }
                // {
                //   user_id: req.userInfo.userId
                // }
            ]
        }])
    }
    if (_.eq(sort, 'remaining_qty')) {
        sort = 'avail'
    }
    // if (_.isEmpty(accessoryIds) && !isSuperuser) {
    //   res.json({ total: 0, rows: [] });
    // } else {

    let result = await accessory.findAndCountAll({
        attributes: [
            'id', 'name', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date', [Sequelize.literal('(SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)'), 'checkoutCount'],
            [Sequelize.literal('qty - (SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)'), 'avail'],
        ],
        include: [
            { model: category, attributes: ['id', 'name'], required: true },
            { model: company, attributes: ['id', 'name'], required: false },
            { model: location, attributes: ['id', 'name'], required: false },
            { model: manufacturer, attributes: ['id', 'name'], required: false },
            { model: supplier, attributes: ['id', 'name'], required: false }
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

}))

router.get('/chart', errorHandler(async function (req, res, next) {
    const { accessory, category, company, location, manufacturer, supplier, accessoryUser } = models;
    accessory.belongsTo(category, { foreignKey: 'category_id' });
    accessory.belongsTo(company, { foreignKey: 'company_id' });
    accessory.belongsTo(location, { foreignKey: 'location_id' });
    accessory.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    accessory.belongsTo(supplier, { foreignKey: 'supplier_id' });
    accessory.hasMany(accessoryUser, { foreignKey: 'accessory_id' });

    let isSuperuser = req.userInfo.isSuperuser;
    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries);

    let where = [{
        name: { [Op.like]: '%' + search + '%' }
    }, {
        deleted_at: { [Op.eq]: null }
    }, { firm_id: req.userInfo.firmId }];

    util.addCondition(queries.company_id, where, { company_id: queries.company_id });
    util.addCondition(queries.manufacturer_id, where, { manufacturer_id: queries.manufacturer_id });
    util.addCondition(queries.supplier_id, where, { supplier_id: queries.supplier_id });
    util.addCondition(queries.category_id, where, { category_id: queries.category_id });

    let assigned_to = req.userInfo.userId;
    if (!_.isNil(queries.assigned_to)) {
        assigned_to = queries.assigned_to;
        isSuperuser = false;
    }

    let accessoryIds = [];
    if (!isSuperuser) {
        const accessoryUserResponse = await accessoryUser.findAll({
            attributes: ['accessory_id'],
            where: { assigned_to }
        });
        if (!_.isEmpty(accessoryUserResponse)) {
            accessoryIds = accessoryUserResponse.map(accUser => accUser.accessory_id);
        }
        where.push({
            [Op.or]: [{ id: { [Op.in]: accessoryIds } }]
        });
    }

    if (_.eq(sort, 'remaining_qty')) {
        sort = 'avail';
    }

    // Main findAndCountAll query
    let result = await accessory.findAndCountAll({
        attributes: [
            'id', 'name', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost',
            'qty', 'created_at', 'updated_at', 'purchase_date',
            [Sequelize.literal('(SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)'), 'checkoutCount'],
            [Sequelize.literal('qty - (SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)'), 'avail'],
        ],
        include: [
            { model: category, attributes: ['id', 'name'], required: true },
            { model: company, attributes: ['id', 'name'], required: false },
            { model: location, attributes: ['id', 'name'], required: false },
            { model: manufacturer, attributes: ['id', 'name'], required: false },
            { model: supplier, attributes: ['id', 'name'], required: false }
        ],
        where,
        order: Sequelize.literal(`${sort} ${order}`),
        limit,
        offset
    });

    // Sum Remaining Qty & CheckoutCount
    let sums = await accessory.findOne({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('qty - (SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)')), 'totalRemainingQty'],
            [Sequelize.fn('SUM', Sequelize.literal('(SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)')), 'totalCheckoutCount'],
            [Sequelize.fn('SUM', Sequelize.col('qty')), 'totalQty'] // New addition here
        ],
        where
    });
    

    res.json({
        total: result.count,
        totalRemainingQty: sums.get('totalRemainingQty') || 0,
        totalCheckoutCount: sums.get('totalCheckoutCount') || 0,
        totalQty: sums.get('totalQty') || 0
    });

}))

router.get('/selectList', errorHandler(async function (req, res, next) {
    const accessory = models.accessory;
    const response = await util.getSelectList(accessory, req)
    res.json(response);
}))

router.get('/:id', errorHandler(async function (req, res, next) {
    const accessory = models.accessory;
    const category = models.category;
    const company = models.company;
    const location = models.location;
    const manufacturer = models.manufacturer;
    const supplier = models.supplier;
    const accessoryUser = models.accessoryUser;
    accessory.belongsTo(category, { foreignKey: 'category_id' });
    accessory.belongsTo(company, { foreignKey: 'company_id' });
    accessory.belongsTo(location, { foreignKey: 'location_id' });
    accessory.belongsTo(manufacturer, { foreignKey: 'manufacturer_id' });
    accessory.belongsTo(supplier, { foreignKey: 'supplier_id' });
    accessory.hasMany(accessoryUser, { foreignKey: 'user_id' });

    const id = _.parseInt(req.params.id);
    let result = await accessory.findOne({
        attributes: [
            'id', 'name', 'qty', 'min_amt', 'model_number', 'image', 'order_number', 'purchase_cost', 'qty', 'created_at', 'updated_at', 'purchase_date',
            [Sequelize.literal('qty - (SELECT COUNT(*) FROM `accessories_users` WHERE `accessories_users`.`accessory_id` = accessory.`id`)'), 'avail']
        ],
        include: [
            { model: category, attributes: ['id', 'name'], required: true },
            { model: company, attributes: ['id', 'name'], required: true },
            { model: location, attributes: ['id', 'name'], required: true },
            { model: manufacturer, attributes: ['id', 'name'], required: true },
            { model: supplier, attributes: ['id', 'name'], required: true },
            { model: accessoryUser, attributes: ['id', 'note'] }
        ],
        where: { id: id }
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.get('/:id/checkedout', errorHandler(async function (req, res, next) {
    const accessoryUser = models.accessoryUser;
    const user = models.user;
    accessoryUser.belongsTo(user, { foreignKey: 'assigned_to' })
    const queries = req.query;
    const { sort, limit, offset, order } = util.queryRequest(queries);
    let result = await accessoryUser.findAll({
        attributes: [
            'id', 'assigned_to', 'created_at', 'note'
        ],
        include: [
            { model: user, attributes: ['id', 'username', 'employee_num', 'first_name', 'last_name'] }
        ],
        where: { accessory_id: req.params.id },
        order: [
            [sort, order]
        ],
        limit: limit,
        offset: offset
    });

    var response = []
    if (!_.isNil(result)) {
        _.map(result, row => {
            response.push({
                assigned_pivot_id: row.id,
                available_actions: { checkin: true },
                checkout_notes: row.note,
                employee_number: row.user.employee_num,
                first_name: row.user.first_name,
                id: row.assigned_to,
                last_checkout: util.createdUpdatedDateFormat(row.created_at),
                last_name: row.user.last_name,
                name: `${row.user.first_name} ${row.user.last_name}`,
                type: 'user',
                username: row.user.username
            })
        })
    }
    res.json({ count: _.size(response), rows: response });
    //res.json(response)
}))


router.get('/:id/checkin', errorHandler(async function (req, res, next) {
    const accessoryUser = models.accessoryUser;
    const user = models.user;
    accessoryUser.belongsTo(user, { foreignKey: 'assigned_to' })
    let result = await accessoryUser.findOne({
        attributes: [
            'id', 'assigned_to', 'created_at', 'note'
        ],
        include: [
            { model: user, attributes: ['id', 'username', 'employee_num', 'first_name', 'last_name'] }
        ],
        where: { id: req.params.id }
    });

    var response = {}
    if (!_.isNil(result)) {
        response = {
            assigned_pivot_id: result.id,
            available_actions: { checkin: true },
            checkout_notes: result.note,
            employee_number: result.user.employee_num,
            first_name: result.user.first_name,
            id: result.assigned_to,
            last_checkout: util.createdUpdatedDateFormat(result.created_at),
            last_name: result.user.last_name,
            name: `${result.user.first_name} ${result.user.last_name}`,
            type: 'user',
            username: result.user.username
        }
    }
    res.json(response);
}))


router.post('/', errorHandler(async function (req, res, next) {
    const { accessory, actionLogs } = models;
    req.body.user_id = req.userInfo.userId
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName, `The comapany name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName, `The category name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.supplier_id, fieldsLength.oneNineOne, true, types.string, errorMessages.supplierName, `The supplier name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName, `The location name ${errorMessages.lengthOneNineOne}`))

    fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName, `The manufacture name ${errorMessages.lengthOneNineOne}`))
    //fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty, `The qty ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, true, types.string, errorMessages.minQty, `The min qty ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber, `The model number ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber, `The order number ${errorMessages.lengthOneNineOne}`))
    //fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost, `The purchase cost ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate, `The purchase date ${errorMessages.lengthOneNineOne}`))

    fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.int, errorMessages.purchaseCost, `${errorMessages.numberMessage} for Purchase Cost`))

    fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, false, types.int, `Qty ${errorMessages.required}`, `${errorMessages.numberMessage} for Qty`))
    fields.push(util.addFields(req.body.min_amt, fieldsLength.three, false, types.int, '', `${errorMessages.numberMessage} for Min Qty`))

    const errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, accessory)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        await sequelize.transaction(t => {
            return accessory.create(req.body, { transaction: t }).then(r => {
                const { actionTypes, itemTypes } = constants;

                const actionLog = {
                    action_type: actionTypes.create,
                    item_type: itemTypes.accessory,
                    user_id: req.userInfo.userId,
                    item_id: r.id,
                    firm_id: req.userInfo.firmId
                }
                return actionLogs.create(actionLog, { transaction: t });
            });
        }).then(function (result) {
            res.result = { id: result.id }
        }).catch(function (err) {
            res.result = { error: err.message }
        })
    }
    next()
}))

router.post('/:id/checkout', errorHandler(async function (req, res, next) {
    const { accessoryUser, actionLogs } = models;
    req.body.accessory_id = req.params.id;
    req.body.user_id = req.userInfo.userId
    //    let result = await accessoryUser.create(req.body);
    await sequelize.transaction(t => {
        return accessoryUser.create(req.body, { transaction: t }).then(r => {
            const { actionTypes, itemTypes } = constants;
            const actionLog = {
                action_type: actionTypes.checkout,
                item_type: itemTypes.accessory,
                user_id: req.userInfo.userId,
                item_id: req.params.id,
                target_id: req.body.assigned_to,
                target_type: constants.itemTypes.user,
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
    const { accessoryUser, actionLogs } = models;
    req.body.accessory_id = req.params.id;
    req.body.user_id = req.userInfo.userId
    const response = await accessoryUser.findOne({ where: { id: req.params.id } })

    //    let result = await accessoryUser.destroy({where: {id: req.params.id}});

    await sequelize.transaction(t => {
        return accessoryUser.destroy({ where: { id: req.params.id } }, { transaction: t }).then(r => {
            const { actionTypes, itemTypes } = constants;
            const actionLog = {
                action_type: actionTypes.checkInFrom,
                item_type: itemTypes.accessory,
                user_id: req.userInfo.userId,
                item_id: response.accessory_id,
                target_id: response.assigned_to,
                target_type: constants.itemTypes.user,
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

router.put('/:id', errorHandler(async function (req, res, next) {
    const { accessory, actionLogs } = models;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId;
    let current_qty = req.body.qty;
    let { types, fieldsLength, errorMessages } = constants;
    let accessories_details = await accessory.findOne({
        raw: true,
        attributes: ['qty',
            [Sequelize.literal('(SELECT COUNT(*) FROM accessories_users WHERE accessory_id = `accessory`.`id`) '), 'alottedAccessoriesCount'],
        ],
        where: { id: id }
    });
    if (_.gte(current_qty, accessories_details.alottedAccessoriesCount)) {
        var fields = []
        fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName, `The comapany name ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.category_id, fieldsLength.oneNineOne, true, types.string, errorMessages.categoryName, `The category name ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.supplier_id, fieldsLength.oneNineOne, true, types.string, errorMessages.supplierName, `The supplier name ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName, `The location name ${errorMessages.lengthOneNineOne}`))

        // fields.push(util.addFields(req.body.manufacturer_id, fieldsLength.oneNineOne, true, types.string, errorMessages.manufacturerName, `The manufacture name ${errorMessages.lengthOneNineOne}`))
        //     //fields.push(util.addFields(req.body.qty, fieldsLength.oneNineOne, true, types.string, errorMessages.qty, `The qty ${errorMessages.lengthOneNineOne}`))
        //     // fields.push(util.addFields(req.body.min_amt, fieldsLength.oneNineOne, true, types.string, errorMessages.minQty, `The min qty ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.model_number, fieldsLength.oneNineOne, true, types.string, errorMessages.modelNumber, `The model number ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.order_number, fieldsLength.oneNineOne, true, types.string, errorMessages.orderNumber, `The order number ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.purchase_cost, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseCost, `The purchase cost ${errorMessages.lengthOneNineOne}`))
        // fields.push(util.addFields(req.body.purchase_date, fieldsLength.oneNineOne, true, types.string, errorMessages.purchaseDate, `The purchase date ${errorMessages.lengthOneNineOne}`))

        // fields.push(util.addFields(req.body.qty, fieldsLength.three, false, types.int, `Qty ${errorMessages.required}`, `${errorMessages.numberMessage} for qty`))
        // fields.push(util.addFields(req.body.min_amt, fieldsLength.three, false, types.int, '', `${errorMessages.numberMessage} for min qty`))


        const errors = await util.checkRequest({
            name: req.body.name,
            firm_id: req.userInfo.firmId,
            id: {
                [Op.ne]: req.params.id
            }
        }, fields, accessory)
        if (!_.isEmpty(errors)) {
            res.result = { error: errors }
        } else {
            await sequelize.transaction(t => {
                return accessory.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
                    const { actionTypes, itemTypes } = constants;
                    const actionLog = {
                        action_type: actionTypes.update,
                        item_type: itemTypes.accessory,
                        user_id: req.userInfo.userId,
                        item_id: id,
                        firm_id: req.userInfo.firmId
                    }
                    return actionLogs.create(actionLog, { transaction: t });
                });
            }).then(function (result) {
                res.result = { id: id }
            }).catch(function (err) {
                res.result = { error: err.message }
            })
        }
    }
    else {
        res.result = { success: false, error: "This accessory is currently checked out and cannot be deleted.Please check the accessory first" }
    }
    next()
}))

router.delete('/:id', errorHandler(async function (req, res, next) {
    const { accessory, actionLogs } = models
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()

    await sequelize.transaction(t => {
        return accessory.update(req.body, { where: { id: id } }, { transaction: t }).then(r => {
            const { actionTypes, itemTypes } = constants;
            const actionLog = {
                action_type: actionTypes.delete,
                item_type: itemTypes.accessory,
                user_id: req.userInfo.userId,
                item_id: id,
                firm_id: req.userInfo.firmId
            }
            return actionLogs.create(actionLog, { transaction: t });
        });
    }).then(function (result) {
        res.result = { id: id }
    }).catch(function (err) {
        res.result = { error: err.message }
    })
    next()
}))

function formatResponse(row) {
    return {
        id: row.id,
        name: row.name,
        image: _.isNil(row.image) ? '' : row.image,
        min_qty: row.min_amt,
        model_number: row.model_number,
        notes: row.notes,
        order_number: row.order_number,
        purchase_cost: row.purchase_cost,
        qty: row.qty,
        remaining_qty: row.dataValues.avail, // remainingQty,
        notes: null,
        parent: row.parent_id,
        category: util.getRelationalObject(row.category),
        manufacturer: util.getRelationalObject(row.manufacturer),
        location: util.getRelationalObject(row.location),
        supplier: util.getRelationalObject(row.supplier),
        company: util.getRelationalObject(row.company),
        created_at: util.createdUpdatedDateFormat(row.created_at),
        updated_at: util.createdUpdatedDateFormat(row.updated_at),
        note: _.isNil(row.accessoryUser) || _.isNil(row.accessoryUser.note) ? null : row.accessoryUser.note,
        purchase_date: {
            date: util.formatDate(row.purchase_date, 'YYYY-MM-DD'),
            formatted: util.formatDate(row.purchase_date, 'YYYY-MM-DD')
        },
        user_can_checkout: _.eq(row.dataValues.avail, 0) ? false : true,
        available_actions: {
            checkout: true,
            checkin: false,
            update: true,
            delete: true
        }
    }
}

module.exports = router;
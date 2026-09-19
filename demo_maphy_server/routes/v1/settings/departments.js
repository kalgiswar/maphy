var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
const constants = require('../../../shared/constants');
var util = require('../../../utils/index');
var { errorHandler } = require('../../../shared/error-handler')

/**
 * @swagger
 * /api/v1/departments:
 *  get:
 *    description: get all the departments
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function(req, res, next) {
    const department = models.department;
    const location = models.location;
    const company = models.company;
    const user = models.user;
    department.belongsTo(location, { foreignKey: 'location_id' });
    department.belongsTo(company, { foreignKey: 'company_id' });
    //user.hasMany(department, {foreignKey: 'department_id'});
    department.belongsTo(user, { foreignKey: 'manager_id' });

    const queries = req.query;
    let { search, sort, limit, offset, order } = util.queryRequest(queries);

    if (_.eq(sort, 'manager.name')) {
        sort = 'user.first_name'
    }

    let result = await department.findAndCountAll({
        attributes: ['id', 'name', 'image', 'created_at', 'updated_at', [Sequelize.literal('(SELECT COUNT(`users`.`department_id`) FROM `users` WHERE `users`.`department_id` = `department`.`id` AND `users`.`firm_id`=' + req.userInfo.firmId + ' AND `users`.`deleted_at` IS NULL)'), 'users_count'],
          [Sequelize.literal('(SELECT COUNT(*) FROM `assets` WHERE `assets`.`assigned_type`='+"'App\\\\Models\\\\Department'"+' and `assets`.`assigned_to` = `department`.`id` )'), 'assigned_assets_count'],],
        include: [
            { model: location, attributes: ['id', 'name'] },
            { model: company, attributes: ['id', 'name'] },
            {
                model: user,
                attributes: [ 
                    'id',
                    'first_name',
                    'last_name'
                    // [Sequelize.literal('(SELECT COUNT(`users`.`department_id`) FROM `users` WHERE `users`.`department_id` = `department`.`id`)')]
                ]
            }
        ],
        where: {
            name: {
                [Op.like]: '%' + search + '%',
            },
            deleted_at: {
                [Op.eq]: null
            },
            firm_id: req.userInfo.firmId
        },
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

router.get('/selectList', errorHandler(async function(req, res, next) {
    const department = models.department;
    const response = await util.getSelectList(department, req)
    res.json(response);
}))

router.get('/:id', errorHandler(async function(req, res, next) {
    const department = models.department;
    const location = models.location;
    const company = models.company;
    const user =models.user;
    department.belongsTo(location, { foreignKey: 'location_id' });
    department.belongsTo(company, { foreignKey: 'company_id' });
    department.belongsTo(user,{ foreignKey: 'manager_id' });
    const id = _.parseInt(req.params.id);
    let result = await department.findOne({ include: [{ model: location, required: true }, { model: company, required: true }, { model: user, required: true }], where: { id: id } });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
}))

router.post('/', errorHandler(async function(req, res, next) {
    const department = models.department;
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    req.body.user_id = req.userInfo.userId
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName, `The location name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName, `The company name ${errorMessages.lengthOneNineOne}`))
    fields.push(util.addFields(req.body.manager_id, fieldsLength.oneNineOne, true, types.string, errorMessages.managerName, `The manager name ${errorMessages.lengthOneNineOne}`))

    let errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, department)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await department.create(req.body);

        res.result = result;
    }
    next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
    const department = models.department;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
        //  let result = await department.update(req.body, { where: { id: id } });
    let { types, fieldsLength, errorMessages } = constants
    var fields = []
    fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.location_id, fieldsLength.oneNineOne, true, types.string, errorMessages.locationName, `The location name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.company_id, fieldsLength.oneNineOne, true, types.string, errorMessages.companyName, `The company name ${errorMessages.lengthOneNineOne}`))
    // fields.push(util.addFields(req.body.manager_id, fieldsLength.oneNineOne, true, types.string, errorMessages.managerName, `The manager name ${errorMessages.lengthOneNineOne}`))

    const errors = await util.checkRequest({
        name: req.body.name,
        firm_id: req.userInfo.firmId,
        id: {
            [Op.ne]: req.params.id
        }
    }, fields, department)
    if (!_.isEmpty(errors)) {
        res.result = { error: errors }
    } else {
        let result = await department.update(req.body, { where: { id: id } });

        res.result = result;
    }
    //res.result = result;
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const department = models.department;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    let result = await department.update(req.body, { where: { id: id } });
    res.result = result;
    next()
}))

function getCompany(department) {
    let location = {};
    if (!_.isNil(department.company)) {
        location.id = department.company.id
        location.name = department.company.name
    }
    return location;
}

function getLocation(department) {
    let location = {};
    if (!_.isNil(department.location)) {
        location.id = department.location.id
        location.name = department.location.name
    }
    return location;
}

function formatResponse(department) {
    return {
        id: department.id,
        name: department.name,
        image: department.image,
        company: getCompany(department),
        manager: util.getUser(department),
        location: getLocation(department),
        users_count: department.dataValues.users_count,
        assets_count: department.dataValues.assigned_assets_count,
        created_at: util.createdUpdatedDateFormat(department.created_at),
        updated_at: util.createdUpdatedDateFormat(department.updated_at),
        available_actions: util.getAvailableActions([department.dataValues.users_count])
    }
}

module.exports = router;
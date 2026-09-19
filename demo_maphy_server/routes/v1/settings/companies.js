var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var { errorHandler } = require('../../../shared/error-handler');

/**
 * @swagger
 * definitions:
 *   company:
 *     properties:
 *       name:
 *         type: string
 */
/**
 * @swagger
 * /companies:
 *  get:
 *    description: Get all the companies
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
 *        description: Search the specifc company, by default user can see all the companies
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
 *              $ref: '#/definitions/company'
 */
router.get('/', errorHandler(async function (req, res, next) {
  const company = models.company;
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);

  let result = await company.findAndCountAll({
    attributes: ['id', 'name', 'image', 'created_at', 'updated_at',
      [Sequelize.literal('(SELECT COUNT(`users`.`company_id`) FROM `users` WHERE `users`.`company_id` = `company`.`id` AND `users`.`deleted_at` IS NULL)'), 'users_count'],
      [Sequelize.literal('(SELECT COUNT(`accessories`.`company_id`) FROM `accessories` WHERE `accessories`.`company_id` = `company`.`id` AND `accessories`.`deleted_at` IS NULL)'), 'accessories_count'],
      [Sequelize.literal('(SELECT COUNT(`assets`.`company_id`) FROM `assets` WHERE `assets`.`company_id` = `company`.`id` AND `assets`.`deleted_at` IS NULL)'), 'assets_count'],
      [Sequelize.literal('(SELECT COUNT(`components`.`company_id`) FROM `components` WHERE `components`.`company_id` = `company`.`id` AND `components`.`deleted_at` IS NULL)'), 'components_count'],
      [Sequelize.literal('(SELECT COUNT(`consumables`.`company_id`) FROM `consumables` WHERE `consumables`.`company_id` = `company`.`id` AND `consumables`.`deleted_at` IS NULL)'), 'consumables_count'],
      [Sequelize.literal('(SELECT COUNT(`licenses`.`company_id`) FROM `licenses` WHERE `licenses`.`company_id` = `company`.`id` AND `licenses`.`deleted_at` IS NULL)'), 'licenses_count']
    ],
    where: [{
      name: {
        [Op.like]: '%' + search + '%'
      }
    },
    { deleted_at: { [Op.eq]: null } },
    { firm_id: req.userInfo.firmId }
    ],
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

router.get('/selectList', errorHandler(async function (req, res, next) {
  const company = models.company;
  const response = await util.getSelectList(company, req)
  res.json(response);
}))

/**
 * @swagger
 * /companies/{id}:
 *  get:
 *    description: Get a specific company based on the company id
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: id
 *        description: id of the company
 *        in: path
 *        required: true
 *        type: integer
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/company'
 */
router.get('/:id', errorHandler(async function (req, res, next) {
  const company = models.company;

  const id = _.parseInt(req.params.id);
  let result = await company.findOne({
    attributes: ['id', 'name', 'image', 'created_at', 'updated_at',
      [Sequelize.literal('(SELECT COUNT(`users`.`company_id`) FROM `users` WHERE `users`.`company_id` = `company`.`id` AND `users`.`deleted_at` IS NULL)'), 'usersCount'],
      [Sequelize.literal('(SELECT COUNT(`accessories`.`company_id`) FROM `accessories` WHERE `accessories`.`company_id` = `company`.`id` AND `accessories`.`deleted_at` IS NULL)'), 'accessoriesCount'],
      [Sequelize.literal('(SELECT COUNT(`assets`.`company_id`) FROM `assets` WHERE `assets`.`company_id` = `company`.`id` AND `assets`.`deleted_at` IS NULL)'), 'assetsCount'],
      [Sequelize.literal('(SELECT COUNT(`components`.`company_id`) FROM `components` WHERE `components`.`company_id` = `company`.`id` AND `components`.`deleted_at` IS NULL)'), 'componentsCount'],
      [Sequelize.literal('(SELECT COUNT(`consumables`.`company_id`) FROM `consumables` WHERE `consumables`.`company_id` = `company`.`id` AND `consumables`.`deleted_at` IS NULL)'), 'consumablesCount'],
      [Sequelize.literal('(SELECT COUNT(`licenses`.`company_id`) FROM `licenses` WHERE `licenses`.`company_id` = `company`.`id` AND `licenses`.`deleted_at` IS NULL)'), 'licensesCount']
    ],
    where: { id: id }
  });
  const response = _.isNil(result) ? {} : formatResponse(result);
  res.json(response);
}))

/**
 * @swagger
 * /companies:
 *  post:
 *    description: Creates a new company
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: company
 *        description: company object
 *        in: body
 *        required: true
 *        schema:
 *          $ref: '#/definitions/company'
 *    responses:
 *      '200':
 *        description: A successful created response
 *        content:
 *          application/json:
 */
router.post('/', errorHandler(async function (req, res, next) {
  const company = models.company;
  let { types, fieldsLength, errorMessages } = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))
  let errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId }, fields, company)
  if (!_.isEmpty(errors)) {
    res.result = { error: errors }
  } else {
    let result = await company.create(req.body);

    res.result = result;
  }
  next()
}))

/**
 * @swagger
 * /companies/{id}:
 *  put:
 *    description: Updates the specific company
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: id
 *        description: company id
 *        in: path
 *        required: true
 *        type: integer
 *      - name: company
 *        description: company object
 *        in: body
 *        required: true
 *        type: integer
 *        schema:
 *          $ref: '#/definitions/company'
 *    responses:
 *      '200':
 *        description: A successful created response
 *        content:
 *          application/json:
 */
router.put('/:id', errorHandler(async function (req, res, next) {
  const company = models.company;
  const id = _.parseInt(req.params.id)
  let { types, fieldsLength, errorMessages } = constants
  var fields = []
  fields.push(util.addFields(req.body.name, fieldsLength.oneNineOne, true, types.string, errorMessages.nameRequired, `The name ${errorMessages.lengthOneNineOne}`))

  const errors = await util.checkRequest({ name: req.body.name, firm_id: req.userInfo.firmId, id: { [Op.ne]: req.params.id } }, fields, company)
  if (!_.isEmpty(errors)) {
    res.result = { error: errors }
  } else {
    let result = await company.update(req.body, { where: { id: id } });

    res.result = result;
  }
  next()
}))

/**
 * @swagger
 * /companies/{id}:
 *  delete:
 *    description: Deletes the specific company
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: id
 *        description: company id
 *        in: path
 *        required: true
 *        type: integer
 *    responses:
 *      '200':
 *        description: A successful created response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/company'
 */
router.delete('/:id', errorHandler(async function (req, res, next) {
  const company = models.company;
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId
  req.body.deleted_at = new Date()
  let result = await company.update(req.body, { where: { id: id } });
  res.result = result;
  next()
}))

function formatResponse(company) {
  return {
    id: company.id,
    name: company.name,
    image: company.image,
    available_actions: util.getAvailableActions([
      company.dataValues.users_count,
      company.dataValues.accessories_count,
      company.dataValues.assets_count,
      company.dataValues.components_count,
      company.dataValues.consumables_count,
      company.dataValues.licenses_count,
    ]),
    created_at: util.createdUpdatedDateFormat(company.created_at),
    updated_at: util.createdUpdatedDateFormat(company.updated_at),
    users_count: company.dataValues.users_count,
    accessories_count: company.dataValues.accessories_count,
    assets_count: company.dataValues.assets_count,
    components_count: company.dataValues.components_count,
    consumables_count: company.dataValues.consumables_count,
    licenses_count: company.dataValues.licenses_count
  }
}

module.exports = router;

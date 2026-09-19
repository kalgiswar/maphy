var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
var {errorHandler} = require('../../../shared/error-handler')

/**
 * @swagger
 * /api/v1/assets:
 *  get:
 *    description: get all the companies
 *    responses:
 *      '200':
 *        description: A successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
router.get('/', errorHandler(async function(req, res, next) {
    const asset = models.asset;
    const location = models.location;
    const company = models.company;
    asset.belongsTo(location, {foreignKey: 'location_id'});
    asset.belongsTo(company, {foreignKey: 'company_id'});
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await department.findAndCountAll({
          include: [{model: location, required: true}, {model: company, required: true}],
          where: [{name: {
            [Op.like]: '%'+ search+'%'
          }}, {deleted_at: {[Op.eq]: null}}, {firm_id: req.userInfo.firmId}],
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

  router.get('/:id', errorHandler(async function(req, res, next) {
    const asset = models.asset;
    const location = models.location;
    const company = models.company;
    asset.belongsTo(location, {foreignKey: 'location_id'});
    asset.belongsTo(company, {foreignKey: 'company_id'});

    const id = _.parseInt(req.params.id);
    let result = await department.findOne({include: [{model: location, required: true}, {model: company, required: true}], where: {id: id}});
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  }))

  router.post('/', errorHandler(async function(req, res, next) {
    const asset = models.asset;
    req.body.user_id = req.userInfo.userId
    let result = await asset.create(req.body);
    res.result = result;
    next()
  }))

router.put('/:id', errorHandler(async function(req, res, next) {
    const asset = models.asset;
    req.body.user_id = req.userInfo.userId
    const id = _.parseInt(req.params.id)
    let result = await asset.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
    const asset = models.asset;
    req.body.user_id = req.userInfo.userId
    req.body.deleted_at = new Date()
    const id = _.parseInt(req.params.id)
    let result = await asset.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
}))

function getCompany(asset) {
  let location = {};
  if (!_.isNil(asset.company)) {
    location.id = asset.company.id
    location.name = asset.company.name
  }
  return location;
}

function getLocation(asset) {
  let location = {};
  if (!_.isNil(asset.location)) {
    location.id = asset.location.id
    location.name = asset.location.name
  }
  return location;
}

function formatResponse(asset) {
  return  {
      id: asset.id,
      name: asset.name,
      image: asset.image,
      company: getCompany(asset),
//      manager: department.manager_id,
      location: getLocation(asset),
      created_at: util.createdUpdatedDateFormat(asset.created_at),
      updated_at: util.createdUpdatedDateFormat(asset.updated_at)
  }
}

module.exports = router;

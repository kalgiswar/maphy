var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
const {errorHandler} = require('../../shared/error-handler')

router.get('/', errorHandler(async function(req, res, next) {
    const maintenance = models.maintenance;
    const model = models.model;
    const user = models.user;
    const asset = models.asset;
    const location = models.location;
    const company = models.company;
    const supplier = models.supplier;
    maintenance.belongsTo(asset, {foreignKey: 'asset_id'});
    maintenance.belongsTo(user, {foreignKey: 'user_id'});
    asset.belongsTo(company, {foreignKey: 'company_id'});
    asset.belongsTo(model, {foreignKey: 'model_id'});
    asset.belongsTo(location, {foreignKey: 'location_id'});
    maintenance.belongsTo(supplier, {foreignKey: 'supplier_id'});
    const queries = req.query;
    const isDeleteRequest = _.isNil(queries.deleted) || _.isEmpty(queries.deleted) ? false : queries

    let {search, sort, limit, offset, order} = util.queryRequest(queries);
    // let where = [{title: {
    //   [Op.like]: '%'+ search+'%'
    // },
    // deleted_at: isDeleteRequest ? {
    //   [Op.ne]: null
    // } : {[Op.eq]: null}
    // }, {firm_id: req.userInfo.firmId}]

    let where = {
  [Op.and]: [
    { firm_id: req.userInfo.firmId },
    {
      deleted_at: isDeleteRequest
        ? { [Op.ne]: null }
        : { [Op.eq]: null }
    },
    {
      [Op.or]: [
        {
          title: {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$asset.name$': {
            [Op.like]: `%${search}%`
          }
        }
      ]
    }
  ]
};
    util.addCondition(queries.asset_id, where, {asset_id: queries.asset_id})
    if (_.eq(sort, 'model.name')) {
      sort = '`asset.model.name`'
    } else if (_.eq(sort, 'location.name')) {
      sort = '`asset.location.name`'
    }
    let result = await maintenance.findAndCountAll({
          attributes: [
            'id', 'asset_maintenance_type', 'asset_maintenance_time', 'title', 'completion_date','is_warranty', 'cost', 'notes', 'start_date', 'completion_date', 'created_at', 'updated_at'
          ],
          include: [
                {model: supplier, attributes: ['id', 'name'], required: true},
                {model: asset, attributes: ['id', 'name', 'asset_tag'], required: true,
                  include: [
                    {model: location, attributes: ['id', 'name']},
                    {model: company, attributes: ['id', 'name']},
                    {model: model, attributes: ['id', 'name']}
                  ]},
                {model: user, attributes: ['id', 'first_name', 'last_name'], required: true}
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
  
router.get('/selectList', errorHandler(async function(req, res, next) {
  const maintenance = models.maintenance;
  const response = await util.getSelectList(maintenance, req)
  res.json(response);  
}))
  
router.get('/:id', errorHandler(async function(req, res, next) {
  const maintenance = models.maintenance;
  const model = models.model;
  const user = models.user;
  const asset = models.asset;
  const location = models.location;
  const company = models.company;
  const supplier = models.supplier;
  maintenance.belongsTo(model, {foreignKey: 'asset_id'});
  maintenance.belongsTo(user, {foreignKey: 'user_id'});
  asset.belongsTo(company, {foreignKey: 'company_id'});
  asset.belongsTo(model, {foreignKey: 'model_id'});
  asset.belongsTo(location, {foreignKey: 'location_id'});
  maintenance.belongsTo(supplier, {foreignKey: 'supplier_id'});

  let result = await maintenance.findOne({
        attributes: [
          'id', 'asset_maintenance_type', 'asset_maintenance_time', 'title', 'is_warranty','completion_date', 'cost', 'notes', 'start_date', 'created_at', 'updated_at'
        ],
        include: [
              {model: supplier, attributes: ['id', 'name'], required: true},
              {model: asset, attributes: ['id', 'name', 'asset_tag'], required: true,
                include: [
                  {model: location, attributes: ['id', 'name']},
                  {model: company, attributes: ['id', 'name']},
                  {model: model, attributes: ['id', 'name']}
                ]},
              {model: user, attributes: ['id', 'first_name', 'last_name'], required: true}
        ],
        where: {id: req.params.id}
    });

  const response = _.isNil(result) ? {} : formatResponse(result);

  res.json(response);
}))

router.post('/', errorHandler(async function(req, res, next) {
    const maintenance = models.maintenance;
    req.body.user_id = req.userInfo.userId
    let result = await maintenance.create(req.body);
  
    res.result = result;
    next()
}))

router.put('/:id', errorHandler(async function(req, res, next) {
    const maintenance = models.maintenance;
    req.body.user_id = req.userInfo.userId
    const id = _.parseInt(req.params.id)
    let result = await maintenance.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
}))

router.delete('/:id', errorHandler(async function(req, res, next) {
  const maintenance = models.maintenance;
  var datetime = new Date();
  const maintenanceRequest = {
    deleted_at: datetime,
    user_id: req.userInfo.userId
  }    
  const id = _.parseInt(req.params.id)
  let result = await maintenance.update(maintenanceRequest, {where: {id: id}});
  
  res.result = result;
  next()
}))

function formatResponse(row) {
  return  {
      id: row.id,
      title: row.title,
      is_warranty: row.is_warranty,
      asset_maintenance_time: row.asset_maintenance_time,
      asset_maintenance_type: row.asset_maintenance_type,
      cost:row.cost,
      notes: row.notes,
      start_date: {
        date: util.formatDate(row.start_date, 'YYYY-MM-DD'),
        formatted: util.formatDate(row.start_date, 'YYYY-MM-DD')
      },
      completion_date: {
        date: util.formatDate(row.completion_date, 'YYYY-MM-DD'),
        formatted: util.formatDate(row.completion_date, 'YYYY-MM-DD')
      },
      supplier: util.getRelationalObject(row.supplier),
      company: util.getRelationalObject(row.asset.company),
      asset:  _.isNil(row.asset) ? null : {
        id: row.asset.id, name: row.asset.name, asset_tag: row.asset.asset_tag
     },
     assetdetails: row.asset,

     location: util.getRelationalObject(row.asset.location),
      model: util.getRelationalObject(row.asset.model),
      created_at: util.createdUpdatedDateFormat(row.created_at),
      updated_at: util.createdUpdatedDateFormat(row.updated_at),
      user_id: _.isNil(row.user) ? null : {
         id: row.user.id, name: `${row.user.first_name} ${row.user.last_name}`
      },
      available_actions: {
          update: true,
          delete: true
      }
  }
}

module.exports = router;

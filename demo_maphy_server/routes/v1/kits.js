var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');

router.get('/', async function(req, res, next) {
    const kit = models.kit;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await kit.findAndCountAll({
          attributes: [
            'id', 'name', 'created_at', 'updated_at'
          ],
          where: {name: {
            [Op.like]: '%'+ search+'%'
          }},
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
  });
    
router.get('/models', async function(req, res, next) {
    const kitModel = models.kitModel;
    const queries = req.query;
    const {sort, limit, offset, order} = util.queryRequest(queries);

    let result = await kitModel.findAndCountAll({
          attributes: [
            'id', 'kit_id', 'model_id', 'quantity', 'created_at', 'updated_at'
          ],
          order: [
              [sort, order]
          ],
          limit: limit,
          offset: offset
    });

    res.json({ total: result.count, rows: result.rows });
})

router.get('/:id', async function(req, res, next) {
    const kit = models.kit;

    const id = _.parseInt(req.params.id);
    let result = await kit.findOne({
        attributes: [
            'id', 'name', 'created_at', 'updated_at'
          ],
          where: {id: id}
    });
    const response = _.isNil(result) ? {} : formatResponse(result);

    res.json(response);
  });

router.post('/', async function(req, res, next) {
    const kit = models.kit;

    let result = await kit.create(req.body);
  
    res.result = result;
    next()
})

router.post('/models', async function(req, res, next) {
    const kitModel = models.kitModel;

    let result = await kitModel.create(req.body);
  
    res.result = result;
    next()
})

router.put('/:id', async function(req, res, next) {
    const kit = models.kit;
    const id = _.parseInt(req.params.id)
    let result = await kit.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
})

router.put('/models/:id', async function(req, res, next) {
    const kitModel = models.kitModel;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await kitModel.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
})

router.delete('/:id', async function(req, res, next) {
    const kit = models.kit;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await kit.destroy({where: {id: id}});
  
    res.result = result;
    next()
})

router.delete('/model/:id', async function(req, res, next) {
    const kitModel = models.kitModel;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await kitModel.destroy({where: {id: id}});
  
    res.result = result;
    next()
})

function formatResponse(row) {
  return  {
      id: row.id,
      name: row.name,
      created_at: util.createdUpdatedDateFormat(row.created_at),
      updated_at: util.createdUpdatedDateFormat(row.updated_at),
      user_can_checkout: true,
      available_actions: {
          checkout: true,
          update: true,
          delete: true
      }
  }
}

module.exports = router;

var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');

router.get('/', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    const queries = req.query;
    const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let result = await customFieldset.findAndCountAll({
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

  router.get('/selectList', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    const response = await util.getSelectList(customFieldset, req)
    res.json(response);  
  });

router.get('/:id', async function(req, res, next) {
    const customFieldset = models.customFieldset;

    const id = _.parseInt(req.params.id);
    let result = await customFieldset.findOne({where: {id: id}});
    const response = _.isNil(result) ? {} : formatResponse(result);
    res.json(response);
  });

router.post('/', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    req.body.user_id = req.userInfo.userId
    let result = await customFieldset.create(req.body);
  
    res.result = result;
    next()
})

router.put('/:id', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await customFieldset.update(req.body, {where: {id: id}});
  
    res.result = result;
    next()
})

router.delete('/:id', async function(req, res, next) {
    const customFieldset = models.customFieldset;
    const id = _.parseInt(req.params.id)
    req.body.user_id = req.userInfo.userId
    let result = await customFieldset.destroy({where: {id: id}});
    // const transResult = await sequelize.transaction(t => {
    //   return Emp.create(emp, {transaction: t}).then(empResult => {
    //     dept.empId = empResult.id
    //     return Dept.create(dept, {transaction: t});
    //   });
    // }).then(function (result) {
    //   console.log('commit')
    // }).catch(function (err) {
    //   console.log(err)
    // });
    
    res.result = result;
    next()
})

function formatResponse(fieldset) {
  return  {
      id: fieldset.id,
      name: fieldset.name,
      created_at: util.createdUpdatedDateFormat(fieldset.created_at),
      updated_at: util.createdUpdatedDateFormat(fieldset.updated_at)
  }
}

module.exports = router;

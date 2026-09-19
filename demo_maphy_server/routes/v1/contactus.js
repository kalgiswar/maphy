var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
var {errorHandler} = require('../../shared/error-handler')
let contactus=models.contactus;



router.put('/:id', async function (req, res, next) {  
  console.log("put")
req.body.updated_by = req.userInfo.userId;
const id = _.parseInt(req.params.id);
req.body.status="replied";
  let result = await contactus.update(req.body, { where: { id: id } })
    .then(function (result) {
      return { success: true, message: "Updated successfully" }
    }).catch(function (err) {
      return { success: false, message: 'error' }
    });

  res.result = result;

next()
});


router.get('/', async function(req, res, next) {
    const queries = req.query;
   
   const {search, sort, limit, offset, order} = util.queryRequest(queries);

    let where = [{email: {
      [Op.like]: '%'+ search+'%'
    }
  }]
    let result = await contactus.findAndCountAll({
          attributes: ['id', 'email','customer_description','admin_description','status'],
         
      where: where,
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


  //Create customer feedback
  router.post('/', async function(req, res, next) {
     req.body.status="open";
     req.body.created_by=0;
     req.body.updated_by=0;
      let response = await contactus.create(req.body)
      .then(function (result) {
        return {success:true,message:"Your feedback send successfully"}
      }).catch(function (err) {
        return {status: 'error',success:false}
      });
      res.result = response;
    
      next()
  }); 

 

  function formatResponse(row) {
    return  {
        id: row.id,
        email:row.email,
        customer_description:row.customer_description,
        admin_description:row.admin_description,
        status:row.status
    }
  }

  module.exports = router;
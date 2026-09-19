var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var {errorHandler} = require('../../../shared/error-handler');

router.get('/', errorHandler(async function(req, res, next) {
    const licenseNotifications = models.licenseNotifications;
    let result = await licenseNotifications.findAndCountAll({
          attributes: ['id', 'no_of_days', 'description', 'created_at', 'updated_at'],
          where: {
          firm_id: req.userInfo.firmId,},
          
        });
        var response = []
        if (!_.isNil(result)) {
            _.map(result.rows, row => {
              response.push(formatResponse(row))
          })
        }
    
    res.json({ total: result.count, rows: response });
  }))

  router.post('/', errorHandler(async function(req, res, next) {
    const licenseNotifications = models.licenseNotifications;
    const isAvailable=await util.uniqueCheck(licenseNotifications,{firm_id: req.userInfo.firmId})
    if (isAvailable) {
        let result = await licenseNotifications.update(req.body, {where: {firm_id: req.userInfo.firmId}});
        res.result = result;
    } else {
      req.body.user_id = req.userInfo.userId
      req.body.firm_id = req.userInfo.firmId
      let result = await licenseNotifications.create(req.body);
      res.result = result;
    }
    next()
  }))

 
  function formatResponse(licenseNotifications) {
    return  {
        id: licenseNotifications.id,
        no_of_days: licenseNotifications.no_of_days,
        description: licenseNotifications.description,
        available_actions: util.getAvailableActions([]),
        created_at: util.createdUpdatedDateFormat(licenseNotifications.created_at),
        updated_at: util.createdUpdatedDateFormat(licenseNotifications.updated_at)
    }
  }

  module.exports = router;

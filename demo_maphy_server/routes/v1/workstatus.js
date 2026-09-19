var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var sequelize = require('../../db/conn');
const Op = Sequelize.Op;
const models = require('../../db/models/index');
var _ = require('lodash');
var util = require('../../utils/index');
const constants = require('../../shared/constants');
var { errorHandler } = require('../../shared/error-handler')
let workstatus = models.workstatus;

router.get('/', async function (req, res, next) {
    try {
        const queries = req.query;

        const { search, sort, limit, offset, order } = util.queryRequest(queries);

        let where = [{
            id: {
                [Op.like]: '%' + search + '%'
            },
            firm_id: req.userInfo.firmId
        }]
        let result = await workstatus.findAndCountAll({
            attributes: ['id', 'user_id', 'details', 'created_at'],

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
    } catch (err) {
        next(err);
    }
});

router.get('/currentTime', async function (req, res, next) {
    var date = new Date();
    console.log("date", date);
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    currentHours = ("0" + currentHours).slice(-2);
    currentMinute = ("0" + currentMinute).slice(-2);
    let currentTime = currentHours + ":" + currentMinute;
    console.log("current Time:", currentTime);

    res.json({ currentTime: currentTime, success: true });

});
//Create Work Status

router.post('/', async function (req, res, next) {
    // let currentTime = new Date().getHours() + ":" + new Date().getMinutes();
    var date = new Date();
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    currentHours = ("0" + currentHours).slice(-2);
    currentMinute = ("0" + currentMinute).slice(-2);
    let currentTime = currentHours + ":" + currentMinute;
    let statusCommitStartTime = process.env.STATUS_TIME;
    if (statusCommitStartTime >= currentTime) {
        console.log("req...........", req.body.details)
        req.body.user_id = req.userInfo.userId
        req.body.firm_id = req.userInfo.firmId
        var details = req.body.details;
        req.body.details = JSON.stringify(details)
        console.log("req.body.user_id...", req.body.details)
        let response = await workstatus.create(req.body)
            .then(function (result) {
                return { success: true, message: "Created successfully" }
            }).catch(function (err) {
                return { status: 'error', success: false }
            });
        res.result = response;

        next()
    }
    else {
        res.send({ message: "Not allowed to commit after " + statusCommitStartTime, success: false })
    }
});
// router.put('/:id', async function (req, res, next) {
//     // let currentTime = new Date().getHours() + ":" + new Date().getMinutes();
//     var date = new Date();
//     currentHours = date.getHours();
//     currentMinute = date.getMinutes();
//     currentHours = ("0" + currentHours).slice(-2);
//     currentMinute = ("0" + currentMinute).slice(-2);
//     let currentTime = currentHours + ":" + currentMinute;
//     let statusCommitStartTime = process.env.STATUS_TIME;
//     if (statusCommitStartTime >= currentTime) {
//         console.log("req...........", req.body.details)
//         req.body.user_id = req.userInfo.userId;
//         const id = _.parseInt(req.params.id);
//         var details = req.body.details;
//         req.body.details = JSON.stringify(details)
//         console.log("req.body.details...", req.body.details)
//         let response = await workstatus.update(req.body, {where: {id: id}})
//         console.log("result",result)
//             .then(function (result) {
//                 return { success: true, message: "Updated successfully" }
//             }).catch(function (err) {
//                 return { status: 'error', success: false }
//             });
//         res.result = response;
//              next()
//     }
//     else {
//         res.send({ message: "Not allowed to commit after " + statusCommitStartTime, success: false })
//     }
// });

router.put('/:id', async function (req, res, next) {  
    console.log("put")
    console.log("req...........", req.body.details)
    req.body.user_id = req.userInfo.userId
  const id = _.parseInt(req.params.id);
  var details = req.body.details;
    req.body.details = JSON.stringify(details)
    console.log("req.body.details...", req.body.details)
    let result = await workstatus.update(req.body, { where: { id: id } })
      .then(function (result) {
        return { success: true, message: "Updated successfully" }
      }).catch(function (err) {
        return { success: false, message: 'error' }
      });
  
    res.result = result;
  
  next()
  });
function formatResponse(row) {
    return {
        id: row.id,
        CreatedBy: row.user_id,
        // // details: row.details,
        // // details: JSON.parse(row.details),
        details: _.isNil(row.details) ? [] : JSON.parse(row.details),
        created_at: util.createdUpdatedDateFormat(row.created_at),
        //updated_at: util.createdUpdatedDateFormat(row.updated_at)
    }
}

module.exports = router;
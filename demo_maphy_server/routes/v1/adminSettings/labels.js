var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var { errorHandler } = require('../../../shared/error-handler')

let labels = models.labels;


router.get('/', errorHandler(async function (req, res, next) {
    const queries = req.query;

    const { search, sort, limit, offset, order } = util.queryRequest(queries);

    let where = [{
        id: {
            [Op.like]: '%' + search + '%'
        },
        firm_id: req.userInfo.firmId
    }]
    let result = await labels.findAndCountAll({
        // attributes: ['id', 'labels_per_page', 'labels_fontsize', 'labels_width', 'labels_height', 'labels_display_sgutter', 'labels_display_bgutter', 'labels_pmargin_top', 'labels_pmargin_bottom', 'labels_pmargin_right', 'labels_pmargin_left', 'labels_pagewidth', 'labels_pageheight', 'labels_display_tag', 'labels_display_companyname', 'created_at', 'updated_at', 'firm_id'],
        attributes: ['id', 'labels_fontsize', 'labels_width', 'labels_height', 'created_at', 'updated_at', 'firm_id'],

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
}));



router.post('/', errorHandler(async function (req, res, next) {
      let response = await labels.create(req.body)
        .then(function (result) {
            console.log("result", result)
            return { success: true, message: "Created successfully" }
        }).catch(function (err) {
            console.log("error", err)
            return { status: 'error', success: false }
        });
    res.result = response;

    next()
}));

// router.put('/:id', async function (req, res, next) {

//     let response = await labels.create(req.body)
//         .then(function (result) {
//             console.log("result", result)
//             return { success: true, message: "Updated successfully" }
//         }).catch(function (err) {
//             console.log("error", err)
//             return { status: 'error', success: false }
//         });
//     res.result = response;

//     next()
// });

router.put('/:id', errorHandler(async function (req, res, next) {
    req.body.updated_by = req.userInfo.userId;
    let result = await labels.update(req.body, { where: { firm_id: req.userInfo.firmId } })
        .then(function (result) {
            return { success: true, message: "Updated successfully" }
        }).catch(function (err) {
            return { success: false, message: err }
        });

    res.result = result;

    next()
}));

function formatResponse(row) {
    return {
        id: row.id,
        //labels_per_page: row.labels_per_page,
        labels_fontsize: row.labels_fontsize,
        labels_width: row.labels_width,
        labels_height: row.labels_height,
        //labels_display_sgutter: row.labels_display_sgutter,
        //labels_display_bgutter: row.labels_display_bgutter,
        //labels_pmargin_top: row.labels_pmargin_top,
        // labels_pmargin_bottom: row.labels_pmargin_bottom,
        //labels_pmargin_right: row.labels_pmargin_right,
        //labels_pmargin_left: row.labels_pmargin_left,
        //labels_pagewidth: row.labels_pagewidth,
        //labels_pageheight: row.labels_pageheight,
        //labels_display_name: row.labels_display_name,
        // labels_display_serial: row.labels_display_serial,
        //labels_display_tag: row.labels_display_tag,
        //labels_display_model: row.labels_display_model,
        //labels_display_companyname: row.labels_display_companyname,
        created_at: util.createdUpdatedDateFormat(labels.created_at),
        updated_at: util.createdUpdatedDateFormat(labels.updated_at)

    }
}

module.exports = router;
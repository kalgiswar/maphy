var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
const constants = require('../../../shared/constants');
var { errorHandler } = require('../../../shared/error-handler')

var multer = require('multer');
//const branding = require('../../../db/models/branding');
var upload = multer({ dest: './public/data/uploads/' });
var logopath=process.env.logopath;
let branding = models.branding

router.put('/uploadLogo', upload.single('uploaded_file'), errorHandler(async function (req, res, next) {
  let branding = models.branding;
  const id = _.parseInt(req.params.id);
  var image_filename = req.file.filename;
  console.log("i f:", req.userInfo);
  req.body.created_by = req.userInfo.userId;
  req.body.updated_by = req.userInfo.userId;
  req.body.firm_id = req.userInfo.firmId;
  req.body.image = image_filename;
  var response="";
  try {
      let existingEntry = await branding.findOne({ where: { firm_id: req.body.firm_id } });

    if (existingEntry) {
      // Update existing entry
      response = await branding.update(req.body, { where: { firm_id: req.body.firm_id } }).then(function (result) {
        return { success: true, message: "Logo has been updated successfully" }
      }).catch(function (err) {
        return { success: false, message: 'error' }
      });
    } else {
       response = await branding.create(req.body);
    //  res.result = { success: true, message: "Logo has been created successfully" };
    }
  } catch (err) {
    console.log("errr:", err);
    res.result = { success: false, message: 'Error' };
  }
  res.result = response;
  next();

}))
router.get('/getBrandingDetails', async function (req, res, next) {
  const queries = req.query;

  const { search, sort, limit, offset, order } = util.queryRequest(queries);

  let where = [{
    id: {
      [Op.like]: '%' + search + '%'
    }
  }]
  let result = await branding.findAndCountAll({
    attributes: ['id', 'brandtype', 'site_name', 'image', 'created_by', 'updated_by'],

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

// router.get('/getBrandingDetails', async function(req, res, next) {
//   let result = await branding.findAll({
//        attributes: ['id', 'site_name','image' ] ,
//    where:  {firm_id: req.userInfo.firmId}
//      });
//      var response = []
//      if (!_.isNil(result)) {
//          _.map(result.rows, row => {
//            response.push(formatResponse(row))
//        })
//      }

//  res.json({ rows: response });
// });

function formatResponse(row) {
   var image=logopath+row.image;
  return {
    id: row.id,
    brandtype: row.brandtype,
    site_name: row.site_name,
    image: image,
    // created_at: util.createdUpdatedDateFormat(row.created_at),
    //updated_at: util.createdUpdatedDateFormat(row.updated_at),
    created_by: row.created_by,
    updated_by: row.updated_by,
    // firm_id:row.firm_id

  }
}

module.exports = router;
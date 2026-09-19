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
let audit=models.audit;
//for image
const { singleImageUpload } = require('../../utils');
const im = require('imagemagick');
const { exec } = require('child_process');
const fs = require('fs');

const crypto = require('crypto');
const path = require('path');
// router.put('/:id', async function (req, res, next) {  
//   console.log("put")
// req.body.updated_by = req.userInfo.userId;
// const id = _.parseInt(req.params.id);
// req.body.status="replied";
//   let result = await contactus.update(req.body, { where: { id: id } })
//     .then(function (result) {
//       return { success: true, message: "Updated successfully" }
//     }).catch(function (err) {
//       return { success: false, message: 'error' }
//     });

//   res.result = result;

// next()
// });


router.get('/', async function(req, res, next) {
   const queries = req.query;
   const {search, sort, limit, offset, order} = util.queryRequest(queries);
    let where = [{id: {
      [Op.like]: '%'+ search+'%' },
       firm_id: req.userInfo.firmId
      }]
    let result = await audit.findAndCountAll({
          attributes: ['id', 'asset_tag','auditor_name','description','image','status_id','location','gps_coordinates','present_location','created_at','updated_at'],
         
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
  router.post('/',singleImageUpload, errorHandler(async function (req, res, next) {
    req.body.auditor_name = req.userInfo.email;
    req.body.created_by=req.userInfo.userId;
    req.body.updated_by=req.userInfo.userId;
    req.body.firm_id=req.userInfo.firmId;
    req.body.status_id = "Audited";

    let compressedImagePath = null;
    
        // ✅ Save image only if API succeeds
        if (req.file) {
          // Write the file to disk manually from buffer
          const uniqueName = `asset_${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
          const rawPath = path.join('uploads', 'raw-' + uniqueName); // temp path
          const finalPath = path.join('uploads', uniqueName);
    
          // Write original to temp first
          fs.writeFileSync(rawPath, req.file.buffer);
    
          // Compress using ImageMagick
          const convertCommand = `convert "${rawPath}" -resize 800x -strip -quality 75 "${finalPath}"`;
    
          await new Promise((resolve, reject) => {
            exec(convertCommand, (error) => {
              if (error) return reject(error);
    
              compressedImagePath = finalPath;
    
              // Clean up raw buffer file
              fs.unlink(rawPath, err => {
                if (err) console.warn('⚠️ Failed to delete raw buffer image:', err.message);
              });
    
              resolve();
            });
          });
        }
    
        req.body.image= req.file ? compressedImagePath : null
    

    //  if(req.body.status_id = "Audited")(
    //   req.body.status_id="1"
    //  )
    //  else(req.body.status_id = "Not Audited")(
    //   req.body.status_id="2"
    //  )
    console.log("image",req.body);
    let result = await audit.create(req.body);
    res.result = result;
    
      next()
  })); 

 

  function formatResponse(row) {
    return  {
        id: row.id,
        asset_tag:row.asset_tag,
        auditor_name:row.auditor_name,
        description:row.description,
        image:row.image,
        status_id:row.status_id,
        location:row.location,
        gps_coordinates:row.gps_coordinates,
        present_location:row.present_location,
        created_at: util.createdUpdatedDateFormat(row.created_at),
        updated_at: util.createdUpdatedDateFormat(row.updated_at)


    }
  }

  module.exports = router;
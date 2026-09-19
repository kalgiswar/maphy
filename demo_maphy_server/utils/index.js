var _ = require('lodash');
var moment = require('moment');
var Sequelize = require("sequelize");
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const Email = require('email-templates');
var SibApiV3Sdk = require('sib-api-v3-sdk');
const brevo = require('@getbrevo/brevo');
const Op = Sequelize.Op
const multer = require('multer');
const path = require('path');
const fs = require('fs');

var { paginationSettings, dateTimeFormat, selectListSettings, cryptoAlgorithm, checkoutType, itemTypes } = require('../shared/constants');
const constants = require('../shared/constants');

var formatDate = (data, format) => {
  if (_.isNil(data))
    return '';
  else {
    return moment(data).format(format);
  }
}

var createdUpdatedDateFormat = data => {
  return {
    datetime: formatDate(data, dateTimeFormat.createdUpdatedDatetime),
    formatted: formatDate(data, dateTimeFormat.createdUpdatedFormatted)
  }
}

function isSortAllowed(sort, allowedSortColumns) {
  if (!sort || typeof sort !== 'string') return false;
  if (!allowedSortColumns || !Array.isArray(allowedSortColumns)) {
    return /^[a-zA-Z0-9_\.`]+$/.test(sort);
  }
  const cleanSort = sort.replace(/[`']/g, '').trim();
  for (const col of allowedSortColumns) {
    if (typeof col === 'string') {
      const cleanCol = col.replace(/[`']/g, '').trim();
      if (cleanSort === cleanCol || cleanSort.toLowerCase() === cleanCol.toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function getSafeOrder(order) {
  if (!order || typeof order !== 'string') return 'asc';
  const cleanOrder = order.trim().toLowerCase();
  if (cleanOrder === 'asc' || cleanOrder === 'desc') {
    return cleanOrder;
  }
  return 'asc';
}

var queryRequest = (queries, allowedSortColumns) => {
  const search = _.isNil(queries.search) ? '' : queries.search;
  let sort = _.isNil(queries.sort) ? 'id' : _.isEmpty(queries.sort) ? paginationSettings.sortColumn : queries.sort;
  if (!isSortAllowed(sort, allowedSortColumns)) {
    sort = (allowedSortColumns && allowedSortColumns.length > 0) ? allowedSortColumns[0] : 'id';
  }
  const limit = _.isNil(queries.limit) ? paginationSettings.pageSize : _.isEmpty(queries.limit) ? paginationSettings.pageSize : _.parseInt(queries.limit);
  const offset = _.isNil(queries.offset) ? paginationSettings.offset : _.isEmpty(queries.offset) ? paginationSettings.offset : _.parseInt(queries.offset);
  let order = _.isNil(queries.order) ? paginationSettings.sortDirection : _.isEmpty(queries.order) ? paginationSettings.sortDirection : queries.order;
  order = getSafeOrder(order);
  return {
    search: search,
    sort: sort,
    limit: limit,
    offset: offset,
    order: order
  }
}

var queryRequest1 = (queries1, allowedSortColumns) => {
  const searchCompany = _.isNil(queries1.searchCompany) ? '' : queries1.searchCompany;
  const searchStatus = _.isNil(queries1.searchStatus) ? '' : queries1.searchStatus;
  const searchLocation = _.isNil(queries1.searchLocation) ? '' : queries1.searchLocation;
  const searchFrom = _.isNil(queries1.searchFrom) ? '' : queries1.searchFrom;
  const searchTo = _.isNil(queries1.searchTo) ? '' : queries1.searchTo;
  let sort = _.isNil(queries1.sort) ? 'id' : _.isEmpty(queries1.sort) ? paginationSettings.sortColumn : queries1.sort;
  if (!isSortAllowed(sort, allowedSortColumns)) {
    sort = (allowedSortColumns && allowedSortColumns.length > 0) ? allowedSortColumns[0] : 'id';
  }
  const limit = _.isNil(queries1.limit) ? paginationSettings.pageSize : _.isEmpty(queries1.limit) ? paginationSettings.pageSize : _.parseInt(queries1.limit);
  const offset = _.isNil(queries1.offset) ? paginationSettings.offset : _.isEmpty(queries1.offset) ? paginationSettings.offset : _.parseInt(queries1.offset);
  let order = _.isNil(queries1.order) ? paginationSettings.sortDirection : _.isEmpty(queries1.order) ? paginationSettings.sortDirection : queries1.order;
  order = getSafeOrder(order);
  return {
    searchCompany: searchCompany,
    searchStatus: searchStatus,
    searchLocation: searchLocation,
    searchFrom: searchFrom,
    searchTo: searchTo,
    sort: sort,
    limit: limit,
    offset: offset,
    order: order
  }
}
function getAvailableActions(assocaitesModels) {
  var availableActions = { update: true, delete: true };
  var isAssociated = _.some(assocaitesModels, x => x > 0);
  if (isAssociated) {
    availableActions.delete = false;
  }
  return availableActions
}

function getAvailableActionsMain(assocaitesModels) {
  var availableActions = { update: true, delete: true, restore: true, clone: true };
  var isAssociated = _.some(assocaitesModels, x => x > 0);
  if (isAssociated) {
    availableActions.delete = false;
  }
  return availableActions
}

function getUser(model) {
  let manager = {};
  if (!_.isNil(model.user)) {
    manager.id = model.user.id
    manager.first_name = model.user.first_name
    manager.last_name = model.user.last_name
    manager.name = `${model.user.first_name} ${model.user.last_name}`
  }
  return manager;
}

async function getSelectList(model, req, isUser) {
  const page = _.parseInt(req.query.page);
  const search = _.isNil(req.query.search) ? '' : req.query.search;
  const limit = selectListSettings.limit
  const modelAttributes = model.rawAttributes || {};

  const displayField = modelAttributes.name ? 'name' : (modelAttributes.title ? 'title' : (modelAttributes.username ? 'username' : 'id'));

  let attributes = []
  let where = {}
  where[displayField] = {
    [Op.like]: '%' + search + '%'
  }

  if (modelAttributes.firm_id && !req.userInfo.isSuperuser) {
    where.firm_id = req.userInfo.firmId
  }

  if (modelAttributes.deleted_at && !_.eq(model.name, 'group')) {
    where.deleted_at = { [Op.eq]: null }
  }

  if (_.eq(model.name, 'ticketStatus')) {
    where = {
      name: {
        [Op.like]: '%' + search + '%'
      }
    }
    if (modelAttributes.deleted_at) {
      where.deleted_at = { [Op.eq]: null }
    }
  }

  let order = displayField
  switch (model.name) {
    case 'user':
      attributes = ['id', 'first_name', 'last_name', 'username']
      where = {
        username: {
          [Op.like]: '%' + search + '%'
        }
      }
      if (modelAttributes.deleted_at) {
        where.deleted_at = { [Op.eq]: null }
      }
      if (modelAttributes.firm_id && !req.userInfo.isSuperuser) {
        where.firm_id = req.userInfo.firmId
      }
      order = 'username'
      break;
    case 'statusLabel':
    case 'depreciation':
    case 'customFieldset':
    case 'ticketIssue':
    case 'talentGroup':
    case 'severity':
    case 'group':
      attributes = ['id', [displayField, 'text']]
      break;
    case 'ticketStatus':
      attributes = ['id', ['name', 'text'], 'type']
      break;
    case 'category':
      attributes = ['id', ['name', 'text'], 'category_type']
      break;
    default:
      attributes = ['id', [displayField, 'text']]
      if (modelAttributes.image) {
        attributes.push('image')
      }
      break;
  }

  let result = await model.findAndCountAll({
    attributes: attributes,
    where: where,
    order: [
      [order, 'asc']
    ],
  });
  var response = []
  if (!_.isNil(result)) {
    _.map(result.rows, row => {
      response.push({
        id: row.id,
        text: _.isNil(isUser) ? row.dataValues.text : `${row.first_name} (${row.username})`,
        image: _.isNil(row.image) ? '' : row.image,
        category_type: _.eq(model.name, 'category') ? row.category_type : '',
        type: _.eq(model.name, 'ticketStatus') ? row.type : ''
      })
    })
  }
  const pageCount = _.ceil(result.count / limit);
  return {
    total_count: result.count,
    page_count: pageCount,
    page: page,
    items: response,
    pagination: {
      more: page < pageCount ? true : false,
      per_page: limit
    }
  };
}

function getRelationalObject(relationalObject) {
  return _.isNil(relationalObject) ? {} : { id: relationalObject.id, name: relationalObject.name }
}

async function checkRequest(where, fields, model) {
  var errorMessages = await mandatoryCheck(fields)
  if (_.isEmpty(errorMessages) && !_.isEmpty(where)) {
    const isExists = await uniqueCheck(model, where)
    // errorMessages = isExists ? constants.errorMessages.nameExists : ''
    errorMessages = isExists === true ? constants.errorMessages.nameExists : isExists === "inactive" ? constants.errorMessages.nameExistsInactive : ''
  }
  return errorMessages
}

async function mandatoryCheck(fields) {
  let errorMessages = ''
  _.map(fields, field => {
    // if (field.isMandatory && _.eq(field.type, constants.types.string) && _.isEmpty(field.name)) {
    if (field.isMandatory && _.isEmpty(field.name)) {
      errorMessages = concatErrormessages(field.mandatoryError, errorMessages)
      // } else if (field.isMandatory && _.eq(field.type, constants.types.int) && _.eq(field.name, '0')) {
      //   errorMessages = concatErrormessages(field.mandatoryError, errorMessages)
    }
    if (_.eq(field.type, 'int')) {
      if (!Number(field.name)) {
        errorMessages = concatErrormessages(field.lengthError, errorMessages)
      }
    }
    if (_.size(field.name) > field.length) {
      errorMessages = concatErrormessages(field.lengthError, errorMessages)
    }
  })
  return errorMessages
}

function concatErrormessages(message, errorMessage) {
  if (_.isEmpty(errorMessage)) {
    errorMessage = `${message}`
  } else {
    errorMessage = `${errorMessage}\n ${message}`
  }
  return errorMessage
}

// async function uniqueCheck(model, where) {
//   let isExists = false;
//   let result = await model.findAndCountAll({
//     where: where
//   });
//   if (_.size(result.rows) > 0)
//     isExists = true;
//   return isExists
// }

function normalizeValue(value) {
  return value
    ?.trim()                 // remove start/end spaces
    .replace(/\s+/g, ' ');  // replace multiple spaces with single space
}
async function uniqueCheck(model, where) {
  const normalizedWhere = {};
  Object.keys(where).forEach(key => {
    normalizedWhere[key] =
      typeof where[key] === 'string'
        ? normalizeValue(where[key])
        : where[key];
  });
  if (model.name === 'user') {
    normalizedWhere.deleted_at = null;
  }
  const result = await model.findOne({
    where: normalizedWhere
  });
  // No record found
  if (!result) {
    return false;
  }

  // Check deleted field
  if (result.deleted_at !== null) {
    return "inactive";
  }

  return true;
}
async function lengthCheck(lenCheckRequest) {
  let isExists = false;
  let result = await model.findAndCountAll({
    where: where
  });
  if (_.size(result.rows) > 0)
    isExists = true;
  return isExists
}

async function encrypt(request) {
  const key = crypto.scryptSync(request.password, process.env.JWT_SECRET, 24);// crypto.randomBytes(32);
  const iv = Buffer.alloc(16, 0);
  var cipher = crypto.createCipheriv('aes-192-cbc', key, iv)
  let encrypted = '';
  cipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = cipher.read())) {
      encrypted += chunk.toString('base64');
    }
  });
  cipher.on('end', () => {
    request.password = encrypted;
  });
  cipher.end();
}

async function getUserInfo(user, userId) {
  let userInfo = await user.findOne({ attributes: ['id', 'first_name', 'last_name', 'username'], where: { id: userId } })
  if (_.isNil(userInfo)) {
    userInfo = {}
  } else {
    userInfo.name = `${userInfo.first_name} ${userInfo.last_name}`
  }
  return userInfo
}

async function getItemType(req) {
  let type = { assigned_type: '', assigned_to: '' }
  const checkout_to_type = req.checkout_to_type
  if (_.eq(checkout_to_type, checkoutType.user)) {
    type.assigned_type = itemTypes.user
    type.assigned_to = req.assigned_user
  } else if (_.eq(checkout_to_type, checkoutType.asset)) {
    type.assigned_type = itemTypes.asset
    type.assigned_to = req.assigned_asset
  }
  else if (_.eq(checkout_to_type, checkoutType.department)) {
    type.assigned_type = itemTypes.department
    type.assigned_to = req.assigned_department
  } else {
    type.assigned_type = itemTypes.location
    type.assigned_to = req.assigned_location
  }
  return type
}

async function getItemType1(itemtype) {
  const checkout_to_type = itemtype
  if (_.eq(checkout_to_type, checkoutType.user)) {
    type = itemTypes.user
  } else if (_.eq(checkout_to_type, checkoutType.asset)) {
    type= itemTypes.asset
  }
  else if (_.eq(checkout_to_type, checkoutType.department)) {
    type = itemTypes.department
  } else {
    type = itemTypes.location
  }
  return type
}


function addCondition(query, where, queryObject) {
  if (!_.isNil(query)) {
    where.push(queryObject)
  }
  return where
}

// async function sendMail(email, template, mailTemplateValues) {
//   await sendTokenEmail(email, template, mailTemplateValues)
// }

async function sendTokenEmail() {
  try {

    async function sendTokenEmail(to, templateName, mailTemplateValues) {
      // transport = nodemailer.createTransport(sibTransport({
      //   apiKey: process.env.EMAIL_KEY
      // }))
      const email = new Email({
        message: {
          from: process.env.EMAIL_USER,
        },
        preview: process.env.PREVIEW_EMAIL === 'true',
        send: process.env.SEND_EMAIL === 'true',
        //transport: transport
        transport: {
          // host: process.env.MAIL_HOST,
          // port: process.env.MAIL_PORT,
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        },
      })

      email
        .send({
          template: templateName,
          message: {
            to: to,
          },
          locals: mailTemplateValues,
        })
        .then((res) => {
          console.log('res.originalMessage', res.originalMessage)
        })
        .catch(err => {
          console.log(err)
        })
    }
  } catch {
    console.log("error in send email");
  }
}
const tenantId = process.env.AZURE_TENANT_ID || '';
const clientId = process.env.AZURE_CLIENT_ID || '';
const clientSecret = process.env.AZURE_CLIENT_SECRET || '';

async function getAccessToken(){
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id:clientId,
    client_secret:clientSecret,
    scope:'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(url ,{
    method: 'POST',
     headers: {
        'Content-Type': 'application/x-www-form-urlencoded'  // ← is this there?
    },
    body:body
  });

  const data = await response.json();
  return data.access_token;

}

async function sendEmail(email, template, mailTemplateValues) {
  const token = await getAccessToken();
  const emailBody = {
    message: {
        subject:`Maphy Asset Management - Credentials for ${template}`,
        body: {
            contentType: 'Text',
            content: `Dear ${mailTemplateValues.name},

                        Your One-Time Password (OTP) for ${template} is:

                        ${mailTemplateValues.password}

                        Please use this OTP within 5 minutes, as it will expire after that.

                        Thank you,
                        Support Team`
                  },
                toRecipients: [
                    {
                        emailAddress: {
                            address: email
                        }
                    }
                ]
            }
        };
  const response = await fetch('https://graph.microsoft.com/v1.0/users/devadmin@maphyasset.com/sendMail',{
    method: 'POST',
   headers: {
        'Content-Type': 'application/json',  // ← is this there?
        'Authorization':'Bearer '+token
    },
    body:JSON.stringify(emailBody)
  });
  const result = await response.text();
}


// async function sendEmail(email, template, mailTemplateValues) {
//   console.log("email", email);
//   console.log("template", template);
//   console.log("mailTemplateValues", mailTemplateValues);
//   let apiInstance = new brevo.TransactionalEmailsApi();
//   let username = mailTemplateValues?.name;
//   let password = mailTemplateValues?.password;
//   let apiKey = apiInstance.authentications['apiKey'];
//   apiKey.apiKey = process.env.BREVO_API_KEY || '';

//   let sendSmtpEmail = new brevo.SendSmtpEmail();

//   sendSmtpEmail.subject = "Maphy Asset Management - Credentials";
//   sendSmtpEmail.htmlContent = "<html><body><h1>This is my first transactional email test From application password</h1>  <p>Your password is: " + password + "</p></body></html>";
//   sendSmtpEmail.sender = { "name": "Jovidhyahn", "email": "devadmin@maphyasset.com" };
//   sendSmtpEmail.to = [
//     { "email": email, "name": username }
//   ];
//   sendSmtpEmail.replyTo = { "email": "devadmin@maphyasset.com", "name": "Vidhya sankar" };
//   sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
//   sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };

//   apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
//     console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//   }, function (error) {
//     console.error(error);
//     throw error;
//   });
// }

async function getAdminSetting(setting, attributes) {
  let result = await setting.findOne({
    attributes: attributes
  });
  return result
}

async function updateAdminSetting(setting, req) {
  const id = _.parseInt(req.params.id)
  req.body.user_id = req.userInfo.userId;

  let result = await setting.update(req.body, { where: { id: id } });

  return result
}

function addFields(name, nameFieldLength, isMandatory, type, mandatoryError, lengthError) {
  return {
    name: name,
    length: nameFieldLength,
    isMandatory: isMandatory,
    type: type,
    mandatoryError: mandatoryError,
    lengthError: lengthError
  }
}

async function getUserStatus(user, userId) {
  const response = await user.findOne({
    attributes: ['id', 'talent_group_id', 'user_type', 'availability_status'],
    where: { id: userId }
  })
  return response
}

//for image

// File filter for multer
function fileFilter(req, file, cb) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .jpg, .jpeg, .png images are allowed.'), false);
  }
}

const uploadDir = path.join(__dirname, '..', 'uploads');

// ✅ Ensure the uploads folder exists (synchronously, at runtime)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // create the folder if not present
}
// Disk storage config
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err); // Pass to global error handler
};

//for image

module.exports = {
  formatDate: formatDate,
  createdUpdatedDateFormat: createdUpdatedDateFormat,
  queryRequest: queryRequest,
  queryRequest1: queryRequest1,
  getAvailableActions: getAvailableActions,
  getUser: getUser,
  getSelectList: getSelectList,
  getRelationalObject: getRelationalObject,
  encrypt: encrypt,
  uniqueCheck: uniqueCheck,
  getItemType: getItemType,
  getUserInfo: getUserInfo,
  addCondition: addCondition,
  getAdminSetting: getAdminSetting,
  updateAdminSetting: updateAdminSetting,
  mandatoryCheck: mandatoryCheck,
  checkRequest: checkRequest,
  addFields: addFields,
  getUserStatus: getUserStatus,
  // sendMail: sendMail,
  sendEmail: sendEmail,
  getAvailableActionsMain: getAvailableActionsMain,
  getItemType1:getItemType1,
  singleImageUpload: upload.single('image'),
  multipleImageUpload: upload.array('images', 5),
  multerErrorHandler:multerErrorHandler
};
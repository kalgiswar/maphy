var Sequelize = require("sequelize");
var sequelize = require('../conn')
var emp = require("./emp");
var dept = require("./dept");
var company = require("./company");
var manufacturer = require("./manufacturer");
var statusLabel = require("./statusLabel");
var category = require("./category");
var depreciation = require("./depreciation")
var location = require("./location")
var department = require('./department')
var supplier = require('./supplier')
var customField = require('./customField')
var customFieldset = require('./customFieldset')
var customFieldCustomFieldset = require('./customFieldCustomFieldset')
var user = require('./user')
var group = require('./group')
var userGroups = require('./userGroups')
var license = require('./license')
var licenseSeat = require('./licenseSeat')
var accessory = require('./accessory')
var asset = require('./asset')
var accessoryUser = require('./accessoryUser')
var consumable = require('./consumable')
var consumableUser = require('./consumableUser')
var component = require('./component')
var kit = require('./kit')
var kitModel = require('./kitModel')
var model = require('./model')
var actionLogs = require('./actionLogs')
var maintenance = require('./maintenance')
var ticket = require('./ticket')
var setting = require('./setting')
var componentAsset = require('./componentAsset')
var talentGroup = require('./talentGroup')
var ticketIssue = require('./ticketIssue')
var severity = require('./severity')
var skillLevel = require('./skillLevel')
var ticketStatus = require('./ticketStatus')
var branding = require('./branding')
var firm = require('./firm')
var firmSubscription = require('./firmSubscription')
var contactus = require('./contactus');
var audit = require('./audit');

var labels = require('./labels');
var workstatus = require('./workstatus');
var licenseNotifications= require('./licenseNotifications');
var scrapSale= require('./scrapSale');
var shorturl= require('./shortUrl');
var agentTelemetry= require('./agentTelemetry');


module.exports = {
    Emp: emp(sequelize, Sequelize.DataTypes),
    Dept: dept(sequelize, Sequelize.DataTypes),
    company: company(sequelize, Sequelize.DataTypes),
    manufacturer: manufacturer(sequelize, Sequelize.DataTypes),
    statusLabel: statusLabel(sequelize, Sequelize.DataTypes),
    category: category(sequelize, Sequelize.DataTypes),
    depreciation: depreciation(sequelize, Sequelize.DataTypes),
    location: location(sequelize, Sequelize.DataTypes),
    department: department(sequelize, Sequelize.DataTypes),
    supplier: supplier(sequelize, Sequelize.DataTypes),
    customField: customField(sequelize, Sequelize.DataTypes),
    asset: asset(sequelize, Sequelize.DataTypes),
    customFieldset: customFieldset(sequelize, Sequelize.DataTypes),
    customFieldCustomFieldset: customFieldCustomFieldset(sequelize, Sequelize.DataTypes),
    user: user(sequelize, Sequelize.DataTypes),
    group: group(sequelize, Sequelize.DataTypes),
    userGroups: userGroups(sequelize, Sequelize.DataTypes),
    license: license(sequelize, Sequelize.DataTypes),
    licenseSeat: licenseSeat(sequelize, Sequelize.DataTypes),
    licenseNotifications:licenseNotifications(sequelize, Sequelize.DataTypes),
    accessory: accessory(sequelize, Sequelize.DataTypes),
    accessoryUser: accessoryUser(sequelize, Sequelize.DataTypes),
    consumable: consumable(sequelize, Sequelize.DataTypes),
    consumableUser: consumableUser(sequelize, Sequelize.DataTypes),
    component: component(sequelize, Sequelize.DataTypes),
    kit: kit(sequelize, Sequelize.DataTypes),
    kitModel: kitModel(sequelize, Sequelize.DataTypes),
    maintenance: maintenance(sequelize, Sequelize.DataTypes),
    model: model(sequelize, Sequelize.DataTypes),
    actionLogs: actionLogs(sequelize, Sequelize.DataTypes),
    ticket: ticket(sequelize, Sequelize.DataTypes),
    ticketStatus: ticketStatus(sequelize, Sequelize.DataTypes),
    setting: setting(sequelize, Sequelize.DataTypes),
    componentAsset: componentAsset(sequelize, Sequelize.DataTypes),
    talentGroup: talentGroup(sequelize, Sequelize.DataTypes),
    ticketIssue: ticketIssue(sequelize, Sequelize.DataTypes),
    severity: severity(sequelize, Sequelize.DataTypes),
    skillLevel: skillLevel(sequelize, Sequelize.DataTypes),
    branding: branding(sequelize, Sequelize.DataTypes),
    firm: firm(sequelize, Sequelize.DataTypes),
    firmSubscription: firmSubscription(sequelize, Sequelize.DataTypes),
    contactus: contactus(sequelize, Sequelize.DataTypes),
    audit: audit(sequelize, Sequelize.DataTypes),
     labels: labels(sequelize, Sequelize.DataTypes),
    workstatus: workstatus(sequelize, Sequelize.DataTypes),
    scrapSale: scrapSale(sequelize, Sequelize.DataTypes),
    shorturl: shorturl(sequelize, Sequelize.DataTypes),
    agentTelemetry: agentTelemetry(sequelize, Sequelize.DataTypes)


}

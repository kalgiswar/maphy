const asset = require("../db/models/asset")

const paginationSettings = {
    sortDirection: 'asc',
    sortColumn: 'id',
    pageSize: 5,
    offset: 0
}

const dbSettings = {
    dbUrl: 'localhost',
    userName: 'root',
    password: '',
    dbName: 'snipeit',
    dialect: 'mysql'
}

const actionTypes = {
    create: 'create new',
    delete: 'delete',
    checkout: 'checkout',
    update: 'update',
    addSeats: 'add seats',
    checkInFrom: 'checkin from'
}

const itemTypes = {
    asset: 'App\\Models\\Asset',
    consumable: 'App\\Models\\Consumable',
    accessory: 'App\\Models\\Accessory',
    component: 'App\\Models\\Component',
    user: 'App\\Models\\User',
    location: 'App\\Models\\Location',
    license: 'App\\Models\\License',
    department:"App\\Models\\DepartMent"
}

const categoryType = {
    license: 'License',
    consumable: 'Consumable',
    asset: 'Asset',
    accessory: 'Accessory',
    component: 'Component'
}

const checkoutType = {
    user: 'user',
    asset: 'asset',
    location: 'location',
    department:'department'
}

const selectListSettings = {
    attributes: ['id', ['name', 'text'], 'image'],
    limit: 50
}

const dateTimeFormat = {
    createdUpdatedDatetime: 'YYYY-MM-DD',
    createdUpdatedFormatted: 'ddd MMM DD, YYYY'
    // createdUpdatedDatetime: 'YYYY-MM-DD hh:mm:ss',
    // createdUpdatedFormatted: 'ddd MMM DD, YYYY hh:mm'
}

const statusType = {
    deployable: 'deployable',
    archived: 'deployed',
    //unDeployable: 'undeployed',
    // pending: 'undeployed',
    unDeployable: 'undeployable',
    pending: 'undeployable',

}

const ticketStatus = [
    { id: 1, name: 'Not Assigned'},
    { id: 2, name: 'Inprogress', type: 'admin'},
    { id: 3, name: 'Completed', type: 'admin'},
    { id: 4, name: 'Closed', type: 'creator'},
    { id: 5, name: 'Reopen', type: 'creator'},
    { id: 6, name: 'Available', type: 'creator'},
    { id: 7, name: 'Unavailable', type: 'creator'},
    { id: 8, name: 'Escalate', type: 'creator'}
]

const ticketStatusName = {
    open: 'Open',
    inprogress: 'Inprogress',
    closed: 'Close',
    reAssign: 'Reassign',
    escalate: 'Escalate',
    hold: 'Hold',
    sisterTicket: 'Sister Ticket'
}

const userAvailabilityStatus = {
    available: 1,
    unavailable: 2,
    busy: 3
}

const userType = {
    techinician: 1,
    manager: 2
}

const auditStatus = [
    { id: 1, name: 'Completed'},
    { id: 2, name: 'Not Completed'},
    { id: 3, name: 'Verified'}
]

const ticketUserType = {
    superAdmin: 'superAdmin',
    assignedUser: 'assignedUser',
    createdUser: 'createdUser'
}

const assetStatus = {
    deployed: 'Deployed',
    rtd: 'rtd',
    rtdAlias: 'deployable',
    pending: 'Pending',
    undeployable: 'Undeployable',
    archived: 'Archived'
}

const errorMessages = {
    userNameExists: 'Username already exists',
    emailExists: 'Email already exists',
    emailNotExists: 'Email not exists',
    invalidOldpassword:'Invalid Current Password',
    invalidOtp: 'Otp is invalid',
    nameExists: 'The name has already been taken',
    nameExistsInactive: 'The name has already been taken and Inactive',
    nameLength: 'The name may not be greater than 191 characters',
    nameRequired: 'The name is required field',
    typeRequired: 'Type is required field',
    required: 'is required field',
    lengthOneNineOne: 'may not be greater than 191 characters',
    lengthOneZero: 'may not be greater than 10 characters',
    numberMessage: 'Enter integer greater than 0',
    permissionIssue: 'dont have sufficient permission to access',
    categoryName: 'Category Name is required',
    manufacturerName: 'Manufacturer Name is required',
    companyName: 'Company Name is required',
    supplierName: 'Supplier Name is required',
    locationName: 'Location Name is required',
    qty:'Quantity is required',
    minQty:'Min.Quantity is required',
    serialNumber:'Serial Number is required',
    itemNumber:'Item Number is required',
    modelNumber:'Model Number is required',
    orderNumber:'Order Number is required',
    purchaseCost:'Purchase Cost is required',
    purchaseDate:'Purchase Date is required',
    notes:'Notes is required',
    managerName:'Manager Name is required',
    parentName:'Parent Name  is required',
    currency:'Currency is required',
    address:'Address is required',
    address2:'Address 2 is required',
    city:'City is required',
    state:'State is required',
    country:'Country is required',
    zip:'Zip is required',
    url:'URL is required',

    phone:'Phone Number is required',

    email:'Email is required',
    contact:'Contact Name is required',
    eol:'EOL is required',

    depreciationName:'Depreciation Name is required',
    EulaText: ' EULA Text is required',
    supportUrl: ' Support Url is required',
    supportPhone: ' Support Phone is required',
    supportEmail: ' Support Email is required',
    months: ' Month is required'


}

const fieldsLength = {
    oneNineOne: 191,
    oneZero: 10,
    three: 3
}

const cryptoAlgorithm = 'aes-192-cbc'

const types = {
    int: 'int',
    string: 'string',
    bool: 'bool'
}

const adminUser = {
    userName: 'admin'
}

const emailTemplates = {
    forgetPassword: 'forgetpassword',
    usercredentials:'usercredentials',
    maintenanceMail:'maintenancemail'
}

module.exports = {
    paginationSettings: paginationSettings,
    dbSettings: dbSettings,
    dateTimeFormat: dateTimeFormat,
    statusType: statusType,
    selectListSettings: selectListSettings,
    itemTypes: itemTypes,
    actionTypes: actionTypes,
    cryptoAlgorithm: cryptoAlgorithm,
    assetStatus: assetStatus,
    errorMessages: errorMessages,
    checkoutType: checkoutType,
    ticketStatus: ticketStatus,
    fieldsLength: fieldsLength,
    types: types,
    ticketUserType: ticketUserType,
    auditStatus: auditStatus,
    categoryType: categoryType,
    adminUser: adminUser,
    ticketStatusName: ticketStatusName,
    userAvailabilityStatus: userAvailabilityStatus,
    userType: userType,
    emailTemplates: emailTemplates
}
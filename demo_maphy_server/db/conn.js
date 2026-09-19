const { Sequelize } = require('sequelize');
const { AsyncLocalStorage } = require('async_hooks');
var {dbSettings} = require('../shared/constants');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: dialect,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
    },
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: dialect,
    logging: false,
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

const requestStorage = new AsyncLocalStorage();
sequelize.requestStorage = requestStorage;
function addTenantWhere(options, firmId) {
  if (!options.where) {
    options.where = {};
  }

  if (Array.isArray(options.where)) {
    options.where.push({ firm_id: firmId });
    return;
  }

  if (options.where && typeof options.where === 'object') {
    const Op = Sequelize.Op;
    if (options.where[Op.and] && Array.isArray(options.where[Op.and])) {
      const hasFirmId = options.where[Op.and].some(cond => cond && cond.firm_id === firmId);
      if (!hasFirmId) {
        options.where[Op.and].push({ firm_id: firmId });
      }
    } else {
      options.where.firm_id = firmId;
    }
    return;
  }

  options.where = { firm_id: firmId };
}

function scopeBulkMutation(options) {
  if (options && options.bypassTenantIsolation) return;
  const req = requestStorage.getStore();
  const modelAttributes = options.model && options.model.rawAttributes;
  if (req && req.userInfo && req.userInfo.firmId && (!req.userInfo.isSuperuser || req.userInfo._originalSuperuser) && modelAttributes && modelAttributes.firm_id) {
    addTenantWhere(options, req.userInfo.firmId);
  }
}

// Helper to determine the branch filtering ID
function getRequestBranchId(req) {
  if (!req.userInfo) return null;
  
  const isSuper = req.userInfo.isSuperuser;
  const hasDropdown = req.userInfo.branchesDropdown;
  const canSelect = isSuper || hasDropdown;
  
  if (!canSelect) {
    // If not allowed to choose, lock to their assigned location
    return req.userInfo.locationId || null;
  }
  
  const selected = req.headers['x-selected-branch'];
  if (selected && selected !== 'all' && selected !== 'undefined' && selected !== '') {
    return parseInt(selected, 10);
  }
  
  return null;
}

sequelize.addHook('beforeBulkUpdate', scopeBulkMutation);
sequelize.addHook('beforeBulkDestroy', scopeBulkMutation);

function applyTenantIsolation(options, targetModel, req) {
  if (options && options.bypassTenantIsolation) return;
  if (req && req.userInfo && targetModel && (!req.userInfo.isSuperuser || req.userInfo._originalSuperuser)) {
    // Bypass tenant isolation for self-user profile queries (like /users/me)
    if ((targetModel.name === 'user' || targetModel.tableName === 'users') && options.where && options.where.id !== undefined && (parseInt(options.where.id, 10) === parseInt(req.userInfo.userId, 10))) {
      return;
    }

    const modelAttributes = targetModel.rawAttributes || {};

    if (modelAttributes.firm_id && req.userInfo.firmId) {
      const firmId = req.userInfo.firmId;
      if (!options.where) {
        options.where = {};
      }

      if (Array.isArray(options.where)) {
        options.where.push({ firm_id: firmId });
      } else if (options.where && typeof options.where === 'object') {
        const Op = Sequelize.Op;
        if (options.where[Op.and] && Array.isArray(options.where[Op.and])) {
          const hasFirmId = options.where[Op.and].some(cond => cond && cond.firm_id === firmId);
          if (!hasFirmId) {
            options.where[Op.and].push({ firm_id: firmId });
          }
        } else {
          options.where.firm_id = firmId;
        }
      } else {
        options.where = { firm_id: firmId };
      }
    }
  }
}

sequelize.addHook('beforeFind', function (options) {
  const req = requestStorage.getStore();
  applyTenantIsolation(options, this, req);

  if (req && req.userInfo && this) {
    const modelAttributes = this.rawAttributes || {};

    // Enforce Branch Isolation
    const branchId = getRequestBranchId(req);
    if (branchId) {
      const targetField = modelAttributes.rtd_location_id ? 'rtd_location_id' : (modelAttributes.location_id ? 'location_id' : null);
      
      if (targetField) {
        if (!options.where) {
          options.where = {};
        }
        
        // Handle array-style where or object-style where
        if (Array.isArray(options.where)) {
          const condition = { [targetField]: branchId };
          options.where.push(condition);
        } else if (options.where && typeof options.where === 'object') {
          const Op = Sequelize.Op;
          if (options.where[Op.and] && Array.isArray(options.where[Op.and])) {
            options.where[Op.and].push({ [targetField]: branchId });
          } else {
            options.where[targetField] = branchId;
          }
        } else {
          options.where = { [targetField]: branchId };
        }
      }
    }
  }
});

sequelize.addHook('beforeCount', function (options) {
  const req = requestStorage.getStore();
  applyTenantIsolation(options, this, req);
});

module.exports = sequelize;
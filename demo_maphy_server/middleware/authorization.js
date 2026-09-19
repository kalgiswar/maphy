const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const sequelize = require('../db/conn');

function enabled(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function parsePermissions(value) {
  if (_.isNil(value)) {
    return {};
  }
  if (typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (err) {
    return {};
  }
}



function normalizeTenantPermissions(permissions, firmId) {
  const normalized = { ...permissions };
  if (Number(firmId) !== 1) {
    delete normalized.superuser;
  }
  return normalized;
}

async function loadCurrentPermissions(req, res, next) {
  try {
    if (!req.userInfo || !req.userInfo.userId || !req.userInfo.firmId) {
      return next();
    }

    // For org-switching super admins, skip the DB lookup (the user doesn't
    // belong to the selected org's firm, so the query would return no rows).
    // Their permissions are already established as superuser.
    if (req.userInfo._originalSuperuser) {
      req.userInfo.permissions = req.userInfo.permissions || {};
      return next();
    }

    const userRow = await sequelize.query(`
      SELECT id, activated, deleted_at FROM users WHERE id = :userId LIMIT 1
    `, {
      type: QueryTypes.SELECT,
      replacements: { userId: req.userInfo.userId }
    });

    if (!userRow || userRow.length === 0 || userRow[0].activated !== 1 || userRow[0].deleted_at !== null) {
      return res.sendStatus(401);
    }

    const rows = await sequelize.query(`
      SELECT pg.permissions
      FROM users u
      INNER JOIN users_groups ug
        ON ug.user_id = u.id
        AND (ug.firm_id = u.firm_id OR ug.firm_id = 1 OR ug.firm_id IS NULL)
      INNER JOIN permission_groups pg
        ON pg.id = ug.group_id
        AND (pg.firm_id = u.firm_id OR pg.firm_id = 1 OR pg.firm_id IS NULL)
      WHERE u.id = :userId
        AND u.firm_id = :firmId
        AND u.deleted_at IS NULL
        AND u.activated = 1
      LIMIT 1
    `, {
      type: QueryTypes.SELECT,
      replacements: {
        userId: req.userInfo.userId,
        firmId: req.userInfo.firmId
      }
    });

    // If no group row is found in the DB, preserve the JWT-derived values as a
    // safe fallback (isSuperuser was already set correctly during login).
    // This prevents superusers without an explicit users_groups row from
    // being treated as unprivileged and receiving 403 responses.
    if (!rows || rows.length === 0) {
      // Keep whatever isSuperuser/isAdmin/etc. came from the JWT
      req.userInfo.permissions = req.userInfo.permissions || {};
      return next();
    }

    const permissions = normalizeTenantPermissions(
      parsePermissions(rows[0] && rows[0].permissions),
      req.userInfo.firmId
    );

    req.userInfo.permissions = permissions;
    req.userInfo.isSuperuser = Number(req.userInfo.firmId) === 1 && enabled(permissions.superuser);
    req.userInfo.isAdmin = enabled(permissions.admin);
    req.userInfo.branchesDropdown = enabled(permissions.branches_dropdown);
    req.userInfo.editGroupPermissions = enabled(permissions.edit_group_permissions);

    next();
  } catch (err) {
    // On DB error, fall back to JWT-derived isSuperuser so a DB hiccup
    // doesn't lock out the superuser
    if (req.userInfo && req.userInfo.isSuperuser) {
      req.userInfo.permissions = req.userInfo.permissions || {};
      return next();
    }
    next(err);
  }
}


const resourcePermissions = {
  companies: 'companies',
  models: 'models',
  manufacturers: 'manufacturers',
  statuslabels: 'statuslabels',
  categories: 'categories',
  depreciations: 'depreciations',
  locations: 'locations',
  departments: 'departments',
  suppliers: 'suppliers',
  customfields: 'customfields',
  customFieldsets: 'customfields',
  customFieldCustomFieldsets: 'customfields',
  licenses: 'licenses',
  accessories: 'accessories',
  consumables: 'consumables',
  components: 'components',
  kits: 'kits',
  users: 'users',
  hardware: 'assets'
};

const openSubpaths = new Set([
  'login',
  'generateotp',
  'generateOtp',
  'resetpassword',
  'password',
  'changePassword',
  'chart',   // dashboard summary endpoint — accessible to all authenticated users
  'me',      // /users/me and /users/me/permissions — always accessible to the logged-in user
]);

function requestedAction(req) {
  const path = req.path.toLowerCase();
  if (path.includes('checkout')) return 'checkout';
  if (path.includes('checkin')) return 'checkin';
  if (path.includes('audit')) return 'audit';
  if (req.method === 'GET') return 'view';
  if (req.method === 'POST') return 'create';
  if (req.method === 'DELETE') return 'delete';
  return 'edit';
}

function permissionFor(req) {
  const cleanPath = (req.originalUrl || req.url || '').split('?')[0];
  const parts = cleanPath.split('/').filter(Boolean);
  const apiIndex = parts.indexOf('v1');
  const resource = apiIndex >= 0 ? parts[apiIndex + 1] : parts[0];

  const firstPathPart = apiIndex >= 0 ? parts[apiIndex + 2] : parts[1];

  if (resource === 'locations' && firstPathPart === 'selectList' && enabled(req.userInfo && req.userInfo.branchesDropdown)) {
    return null;
  }

  if (resource === 'reports') {
    return 'reportview';
  }

  if (resource === 'audit') {
    return 'assetsaudit';
  }

  if (resource === 'groups') {
    return req.method === 'GET' ? null : 'edit_group_permissions';
  }

  // These routes require the admin flag — they are admin-settings-only endpoints
  const adminOnlyResources = new Set([
    'admin', 'firms', 'labels', 'talentGroups', 'ticketIssues', 'severity', 'licenseNotifications'
  ]);
  if (adminOnlyResources.has(resource)) {
    return enabled(req.userInfo && req.userInfo.isAdmin) ? null : 'admin';
  }

  if (resource === 'users') {
    // Always allow public auth sub-paths
    if (openSubpaths.has(firstPathPart)) return null;

    // Allow selectList endpoint for populating dropdowns (scoped to company/firm by logic/hooks)
    if (firstPathPart === 'selectList') return null;

    // Allow any authenticated user to view or edit their OWN profile
    // (when the :id in the URL matches the user's own JWT userId)
    const ownId = String(req.userInfo && req.userInfo.userId);
    if (firstPathPart === ownId) {
      const action = requestedAction(req);
      if (action === 'view' || action === 'edit') return null;
    }
  }

  // If the resource is not in the known permission map, no check needed
  if (!resourcePermissions[resource]) {
    return null;
  }

  return `${resourcePermissions[resource]}${requestedAction(req)}`;
}

function enforcePermissions(req, res, next) {
  if (!req.userInfo) {
    return next();
  }

  // Superusers have full access globally
  // (including org-switching super admins who temporarily have isSuperuser=false)
  if (req.userInfo.isSuperuser || req.userInfo._originalSuperuser) {
    return next();
  }

  // NOTE: Admins are NOT given a blanket bypass here.
  // They go through the same per-permission checks as managers.
  // The `admin` flag on the client side controls UI access to admin settings panel;
  // actual API access is governed by individual permissions in the group.

  const permission = permissionFor(req);
  if (!permission) {
    return next();
  }

  if (!enabled(req.userInfo.permissions && req.userInfo.permissions[permission])) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this feature.'
    });
  }

  next();
}

module.exports = {
  enabled,
  loadCurrentPermissions,
  enforcePermissions,
  parsePermissions,
  normalizeTenantPermissions
};

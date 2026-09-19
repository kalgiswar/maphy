var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../../../db/models/index');
var _ = require('lodash');
var util = require('../../../utils/index');
var { errorHandler } = require('../../../shared/error-handler')
const { parsePermissions, normalizeTenantPermissions } = require('../../../middleware/authorization')

/**
 * Returns the privilege level of a group:
 *   3 = Super Admin  (superuser: "1")
 *   2 = Admin        (admin: true, not superuser)
 *   1 = Manager/regular (everything else)
 *
 * Accepts both plain objects and Sequelize model instances (.dataValues).
 */
function getGroupLevel(group) {
  if (!group) return 0;
  const data = group.dataValues || group;
  const name = (data.name || '').toLowerCase();
  if (name.includes('super admin')) return 3;
  if (name.includes('admin')) return 2;
  if (name.includes('manager')) return 1;
  if (name.includes('fow')) return 1;

  let perms = {};
  try {
    perms = typeof data.permissions === 'string'
      ? JSON.parse(data.permissions)
      : (data.permissions || {});
  } catch (e) { }
  if (perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true) return 3;
  if (perms.admin === true || perms.admin === 1 || perms.admin === '1' || perms.admin === 'true') return 2;
  return 1;
}

/**
 * Returns the privilege level of the calling user from req.userInfo:
 *   3 = Super Admin (isSuperuser or _originalSuperuser)
 *   2 = Admin       (isAdmin)
 *   1 = Manager/regular
 */
function getCallerLevel(userInfo) {
  if (!userInfo) return 0;
  if (userInfo.isSuperuser || userInfo._originalSuperuser) return 3;
  if (userInfo.isAdmin) return 2;
  return 1;
}

const checkGroupsWritePermission = (req, res, next) => {
  if (!req.userInfo) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const isSuper = req.userInfo.isSuperuser || req.userInfo._originalSuperuser;
  const canEditGroups = req.userInfo.editGroupPermissions;
  if (!isSuper && !canEditGroups) {
    return res.status(403).json({ success: false, message: 'You do not have permission to modify groups.' });
  }
  next();
};

const isSuperuserGroup = (group) => {
  if (!group) return false;
  const data = group.dataValues || group;
  if (data.name && data.name.toLowerCase() === 'super admin') return true;
  if (!data.permissions) return false;
  let perms = {};
  try {
    perms = typeof data.permissions === 'string' ? JSON.parse(data.permissions) : data.permissions;
  } catch (e) { }
  return perms.superuser === '1' || perms.superuser === 1 || perms.superuser === true;
};

// ─── GET / (list all groups) ─────────────────────────────────────────────────
router.get('/', errorHandler(async function (req, res, next) {
  const group = models.group;
  const queries = req.query;
  const { search, sort, limit, offset, order } = util.queryRequest(queries);

  const whereClause = {
    name: { [Op.like]: '%' + search + '%' },
    firm_id: req.userInfo.firmId
  };

  const canManageGroups = req.userInfo.isSuperuser || req.userInfo._originalSuperuser || req.userInfo.editGroupPermissions;

  if (!canManageGroups) {
    whereClause[Op.and] = [
      Sequelize.literal(`(
          permissions IS NULL OR (
            permissions NOT LIKE '%"superuser":"1"%'
            AND permissions NOT LIKE '%"superuser":1%'
            AND permissions NOT LIKE '%"superuser":true%'
          )
        )`),
      { name: { [Op.ne]: 'Super Admin' } }
    ];
  }

  let result = await group.findAndCountAll({
    attributes: ['id', 'name', 'permissions', 'created_at', 'updated_at',
      [Sequelize.literal('(SELECT COUNT(`users_groups`.`group_id`) FROM `users_groups` WHERE `users_groups`.`group_id` = `group`.`id` AND `users_groups`.`firm_id` = `group`.`firm_id`)'), 'usersCount']
    ],
    where: whereClause,
    order: [[sort, order]],
    limit,
    offset
  });

  const response = [];
  if (!_.isNil(result)) {
    _.map(result.rows, row => { response.push(formatResponse(row, req)); });
  }
  res.json({ total: result.count, rows: response });
}))

// ─── GET /selectList ─────────────────────────────────────────────────────────
router.get('/selectList', errorHandler(async function (req, res, next) {
  const group = models.group;
  const callerLevel = getCallerLevel(req.userInfo);

  const isSuper = req.userInfo && (req.userInfo.isSuperuser || req.userInfo._originalSuperuser);
  const allowedFirms = isSuper ? [1, req.userInfo.firmId] : [req.userInfo.firmId];

  const allGroups = await group.findAll({
    attributes: ['id', 'name', 'permissions'],
    where: {
      firm_id: {
        [Op.in]: allowedFirms
      }
    },
    bypassTenantIsolation: true,
    order: [['name', 'ASC']]
  });

  // Callers can only assign groups at a LOWER level than themselves
  const filtered = allGroups.filter(g => {
    const groupLevel = getGroupLevel(g);
    if (callerLevel >= 3) return true;          // Super Admin can assign any group
    if (callerLevel === 2) return groupLevel < 2; // Admin can only assign Manager-level
    return groupLevel < 1;                        // Manager: nothing below (shouldn't happen)
  });

  const items = filtered.map(g => ({ id: g.id, text: g.name }));
  res.json({ items });
}))

// ─── GET /:id ─────────────────────────────────────────────────────────────────
router.get('/:id', errorHandler(async function (req, res, next) {
  const group = models.group;
  const id = _.parseInt(req.params.id);

  let result = await group.findOne({
    attributes: ['id', 'name', 'permissions', 'created_at', 'updated_at',
      [Sequelize.literal('(SELECT COUNT(`users_groups`.`group_id`) FROM `users_groups` WHERE `users_groups`.`group_id` = `group`.`id` AND `users_groups`.`firm_id` = `group`.`firm_id`)'), 'usersCount']
    ],
    where: { id, firm_id: req.userInfo.firmId }
  });

  if (!result) {
    return res.status(404).json({ success: false, message: 'Group not found.' });
  }

  // Hierarchy: callers can only open the edit form for groups at a LOWER level than themselves
  const callerLevel = getCallerLevel(req.userInfo);
  const groupLevel = getGroupLevel(result);
  if (callerLevel < 3 && groupLevel >= callerLevel) {
    return res.status(403).json({ success: false, message: 'You do not have permission to edit this group.' });
  }

  res.json(formatResponse(result, req));
}))

// ─── POST / (create group) ────────────────────────────────────────────────────
router.post('/', checkGroupsWritePermission, errorHandler(async function (req, res, next) {
  const group = models.group;
  var permissions = req.body.permissions;
  permissions = parsePermissions(permissions);
  permissions = normalizeTenantPermissions(permissions, req.userInfo.firmId);
  req.body.permissions = JSON.stringify(permissions);
  req.body.firm_id = req.userInfo.firmId;
  let result = await group.create(req.body);
  res.result = result;
  next();
}))

// ─── PUT /:id (update group) ──────────────────────────────────────────────────
router.put('/:id', checkGroupsWritePermission, errorHandler(async function (req, res, next) {
  const group = models.group;
  const id = _.parseInt(req.params.id);

  const existingGroup = await group.findOne({ where: { id, firm_id: req.userInfo.firmId } });
  if (!existingGroup) {
    return res.status(404).json({ success: false, message: 'Group not found.' });
  }

  // Hierarchy enforcement: callerLevel must be STRICTLY HIGHER than the group's level
  const callerLevel = getCallerLevel(req.userInfo);
  const groupLevel = getGroupLevel(existingGroup);
  if (callerLevel < 3 && groupLevel >= callerLevel) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this group. Only a higher-privileged user can edit it.'
    });
  }

  var permissions = req.body.permissions;
  permissions = parsePermissions(permissions);
  permissions = normalizeTenantPermissions(permissions, req.userInfo.firmId);
  req.body.permissions = JSON.stringify(permissions);

  let result = await group.update(req.body, { where: { id, firm_id: req.userInfo.firmId } });
  res.result = result;
  next();
}))

// ─── DELETE /:id (delete group) ───────────────────────────────────────────────
router.delete('/:id', checkGroupsWritePermission, errorHandler(async function (req, res, next) {
  const group = models.group;
  const id = _.parseInt(req.params.id);

  const existingGroup = await group.findOne({ where: { id, firm_id: req.userInfo.firmId } });
  if (!existingGroup) {
    return res.status(404).json({ success: false, message: 'Group not found.' });
  }

  // Hierarchy enforcement
  const callerLevel = getCallerLevel(req.userInfo);
  const groupLevel = getGroupLevel(existingGroup);
  if (callerLevel < 3 && groupLevel >= callerLevel) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this group. Only a higher-privileged user can delete it.'
    });
  }

  let result = await group.destroy({ where: { id, firm_id: req.userInfo.firmId } });
  res.result = result;
  next();
}))

// ─── formatResponse ───────────────────────────────────────────────────────────
function formatResponse(group, req) {
  const callerLevel = getCallerLevel(req && req.userInfo);
  const groupLevel = getGroupLevel(group);

  const isSuper = req && req.userInfo && (req.userInfo.isSuperuser || req.userInfo._originalSuperuser);
  const canEditGroups = req && req.userInfo && req.userInfo.editGroupPermissions;

  // Can edit/delete only if: has write permission AND caller is strictly higher level than the group
  const canEdit = (isSuper || canEditGroups) && (callerLevel > groupLevel);

  const actions = util.getAvailableActions([group.dataValues.usersCount]);

  if (!canEdit) {
    actions.update = false;
    actions.delete = false;
  }

  return {
    id: group.id,
    name: group.name,
    permissions: JSON.parse(group.permissions),
    available_actions: actions,
    created_at: util.createdUpdatedDateFormat(group.created_at),
    updated_at: util.createdUpdatedDateFormat(group.updated_at),
    users_count: group.dataValues.usersCount
  };
}

module.exports = router;

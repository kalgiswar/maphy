/**
 * rbac_helper.js
 * Utilities for role-based access control assertions and group permission testing.
 */
const { expect } = require('chai');

// ─── Assertion helpers ────────────────────────────────────────────────────────

function expectAllowed(res, label = '') {
  const msg = label ? ` [${label}]` : '';
  expect(res.status, `Expected 2xx but got ${res.status}${msg}: ${JSON.stringify(res.data).slice(0, 200)}`).to.be.lessThan(300);
  expect(res.status, `Expected 2xx but got ${res.status}${msg}`).to.be.greaterThanOrEqual(200);
}

function expectForbidden(res, label = '') {
  const msg = label ? ` [${label}]` : '';
  expect(
    [403],
    `Expected 403 Forbidden but got ${res.status}${msg}: ${JSON.stringify(res.data).slice(0, 200)}`
  ).to.include(res.status);
}

function expectDenied(res, label = '') {
  const msg = label ? ` [${label}]` : '';
  expect(
    [401, 403],
    `Expected 401/403 but got ${res.status}${msg}: ${JSON.stringify(res.data).slice(0, 200)}`
  ).to.include(res.status);
}

function expectUnauthorized(res, label = '') {
  const msg = label ? ` [${label}]` : '';
  expect(
    [401],
    `Expected 401 Unauthorized but got ${res.status}${msg}: ${JSON.stringify(res.data).slice(0, 200)}`
  ).to.include(res.status);
}

function expectNotFound(res, label = '') {
  const msg = label ? ` [${label}]` : '';
  expect(
    [404],
    `Expected 404 Not Found but got ${res.status}${msg}: ${JSON.stringify(res.data).slice(0, 200)}`
  ).to.include(res.status);
}

// ─── Group permission payload builder ────────────────────────────────────────

/**
 * All known permissions with their API key mappings.
 * Key = permission UI name, value = backend permissions JSON key
 */
const PERMISSION_MAP = {
  // Global / Admin
  superuser:             'superuser',
  admin:                 'admin',
  import:                'import',
  reportview:            'reportview',
  edit_group_permissions: 'edit_group_permissions',
  branches_dropdown:     'branches_dropdown',

  // Assets
  assetsview:            'assetsview',
  assetscreate:          'assetscreate',
  assetsedit:            'assetsedit',
  assetsdelete:          'assetsdelete',
  assetscheckin:         'assetscheckin',
  assetscheckout:        'assetscheckout',
  assetsaudit:           'assetsaudit',
  assetsviewrequestable: 'assetsviewrequestable',

  // Accessories
  accessoriesview:       'accessoriesview',
  accessoriescreate:     'accessoriescreate',
  accessoriesedit:       'accessoriesedit',
  accessoriesdelete:     'accessoriesdelete',
  accessoriescheckin:    'accessoriescheckin',
  accessoriescheckout:   'accessoriescheckout',

  // Consumables
  consumablesview:       'consumablesview',
  consumablescreate:     'consumablescreate',
  consumablesedit:       'consumablesedit',
  consumablesdelete:     'consumablesdelete',
  consumablescheckout:   'consumablescheckout',

  // Licenses
  licensesview:          'licensesview',
  licensescreate:        'licensescreate',
  licensesedit:          'licensesedit',
  licensesdelete:        'licensesdelete',
  licensescheckout:      'licensescheckout',
  licenseskeys:          'licenseskeys',

  // Components
  componentsview:        'componentsview',
  componentscreate:      'componentscreate',
  componentsedit:        'componentsedit',
  componentsdelete:      'componentsdelete',
  componentscheckin:     'componentscheckin',
  componentscheckout:    'componentscheckout',

  // Users
  usersview:             'usersview',
  userscreate:           'userscreate',
  usersedit:             'usersedit',
  usersdelete:           'usersdelete',

  // Models / Categories / Departments / Statuslabels / Suppliers / Manufacturers
  modelsview:            'modelsview',
  modelscreate:          'modelscreate',
  modelsedit:            'modelsedit',
  modelsdelete:          'modelsdelete',

  categoriesview:        'categoriesview',
  categoriescreate:      'categoriescreate',
  categoriesedit:        'categoriesedit',
  categoriesdelete:      'categoriesdelete',

  departmentsview:       'departmentsview',
  departmentscreate:     'departmentscreate',
  departmentsedit:       'departmentsedit',
  departmentsdelete:     'departmentsdelete',

  statuslabelsview:      'statuslabelsview',
  statuslabelscreate:    'statuslabelscreate',
  statuslabelsedit:      'statuslabelsedit',
  statuslabelsdelete:    'statuslabelsdelete',

  suppliersview:         'suppliersview',
  supplierscreate:       'supplierscreate',
  suppliersedit:         'suppliersedit',
  suppliersdelete:       'suppliersdelete',

  manufacturersview:     'manufacturersview',
  manufacturerscreate:   'manufacturerscreate',
  manufacturersedit:     'manufacturersedit',
  manufacturersdelete:   'manufacturersdelete',

  locationsview:         'locationsview',
  locationscreate:       'locationscreate',
  locationsedit:         'locationsedit',
  locationsdelete:       'locationsdelete',

  companiesview:         'companiesview',
  companiescreate:       'companiescreate',
  companiesedit:         'companiesedit',
  companiesdelete:       'companiesdelete',

  depreciationsview:     'depreciationsview',
  depreciationscreate:   'depreciationscreate',
  depreciationsedit:     'depreciationsedit',
  depreciationsdelete:   'depreciationsdelete',

  // Self
  selfapi:               'selfapi',
  selfcheckout_assets:   'selfcheckout_assets',
  selfedit_location:     'selfedit_location',
  selftwo_factor:        'selftwo_factor',
};

/**
 * Build a permissions object with all permissions disabled except for the given keys.
 * @param {string[]} enabledKeys - Permission keys to enable (from PERMISSION_MAP)
 * @param {boolean} [superuserExcluded=true] - Always strip superuser (safety)
 */
function buildPermissions(enabledKeys = [], superuserExcluded = true) {
  const perms = {};
  for (const key of Object.values(PERMISSION_MAP)) {
    perms[key] = false;
  }
  for (const key of enabledKeys) {
    const backendKey = PERMISSION_MAP[key] || key;
    perms[backendKey] = true;
  }
  if (superuserExcluded) {
    perms['superuser'] = '0';
  }
  return perms;
}

/**
 * Build a group payload with a given set of permissions enabled.
 * @param {string} name - Group name
 * @param {string[]} enabledKeys - Permission keys to enable
 */
function buildGroupPayload(name, enabledKeys = []) {
  return {
    name,
    permissions: buildPermissions(enabledKeys)
  };
}

/**
 * Determine if a response list is empty (no rows).
 */
function isEmptyList(res) {
  return (res.data?.rows?.length === 0) || (res.data?.items?.length === 0) || (res.data?.total === 0);
}

/**
 * Assert the Super Admin group is absent from a groups list response.
 */
function assertSuperAdminGroupAbsent(res, label = '') {
  const rows = res.data?.rows || [];
  const found = rows.find(r => r.name?.toLowerCase() === 'super admin');
  const msg = label ? ` [${label}]` : '';
  expect(found, `Super Admin group should NOT be visible${msg}`).to.be.undefined;
}

/**
 * Assert the Super Admin group IS present in a groups list response.
 */
function assertSuperAdminGroupPresent(res, label = '') {
  const rows = res.data?.rows || [];
  const found = rows.find(r => r.name?.toLowerCase() === 'super admin');
  const msg = label ? ` [${label}]` : '';
  expect(found, `Super Admin group SHOULD be visible${msg}`).to.not.be.undefined;
}

module.exports = {
  expectAllowed,
  expectForbidden,
  expectDenied,
  expectUnauthorized,
  expectNotFound,
  PERMISSION_MAP,
  buildPermissions,
  buildGroupPayload,
  isEmptyList,
  assertSuperAdminGroupAbsent,
  assertSuperAdminGroupPresent
};

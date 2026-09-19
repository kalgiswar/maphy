/**
 * role_groups_permissions.spec.js
 *
 * The most comprehensive RBAC test suite.
 *
 * Strategy for permission testing:
 * - We use the EXISTING manager user (cyandumbo1822@gmail.com) as our test subject
 * - For each permission test, we:
 *   1. Create a test group with ONLY that permission enabled
 *   2. Assign the manager user to that group (remove their old group)
 *   3. Login as manager → verify the endpoint IS accessible (2xx)
 *   4. Update the group to DISABLE that permission
 *   5. Login as manager again (new token) → verify the endpoint IS BLOCKED (403)
 *   6. Cleanup: restore manager's original groups, delete test group
 *
 * Tests are run sequentially, not in parallel, to avoid race conditions.
 */
const { expect } = require('chai');
const { loginAs, loginWithRaw, ROLES } = require('../../helpers/auth_helper');
const {
  expectAllowed,
  expectForbidden,
  expectDenied,
  buildPermissions,
  assertSuperAdminGroupAbsent,
  assertSuperAdminGroupPresent
} = require('../../helpers/rbac_helper');
const { createSecurityClient, resolveApiBaseUrl } = require('../../helpers/security_helper');
const { uniqueName } = require('../../helpers/workflow_helper');

const MANAGER_EMAIL    = ROLES.manager.email;
const MANAGER_PASSWORD = ROLES.manager.password;
const MANAGER_USER_ID  = 21; // known DB id for the manager test account

/**
 * Login as manager and return an API client with their token.
 */
async function loginManager(apiUrl) {
  const res = await loginWithRaw(MANAGER_EMAIL, MANAGER_PASSWORD);
  if (res.res.status !== 200 || !res.res.data?.accessToken) {
    throw new Error(`Manager login failed: HTTP ${res.res.status} — ${JSON.stringify(res.res.data)}`);
  }
  return createSecurityClient(apiUrl, res.res.data.accessToken);
}

async function getManagerGroups(adminClient) {
  const res = await adminClient.get(`/users/${MANAGER_USER_ID}`);
  if (res.status !== 200) return [];
  let groupsArray = [];
  if (Array.isArray(res.data?.groups)) {
    groupsArray = res.data.groups;
  } else if (res.data?.groups && Array.isArray(res.data.groups.rows)) {
    groupsArray = res.data.groups.rows;
  } else if (Array.isArray(res.data?.userGroups)) {
    groupsArray = res.data.userGroups;
  }
  return groupsArray.map(g => g.group_id || g.id);
}

/**
 * Set the manager's group to a single group (replacing all existing groups).
 */
async function setManagerGroup(adminClient, groupId, firmId = 6) {
  // Use the users update endpoint to reassign groups
  const getRes = await adminClient.get(`/users/${MANAGER_USER_ID}`);
  if (getRes.status !== 200) {
    throw new Error(`Failed to fetch manager user: HTTP ${getRes.status}`);
  }
  const mgrData = getRes.data;
  const payload = {
    first_name: mgrData.first_name,
    last_name: mgrData.last_name,
    username: mgrData.username,
    email: mgrData.email,
    group_id: groupId,
    firm_id: firmId
  };
  const res = await adminClient.put(`/users/${MANAGER_USER_ID}`, payload);
  return res;
}

/**
 * Create a test group with specific permissions enabled.
 */
async function createTestGroup(adminClient, label, enabledPerms) {
  const res = await adminClient.post('/groups', {
    name: uniqueName(`PermTest_${label}`),
    permissions: buildPermissions(enabledPerms, true)
  });
  const id = res.data?.id || res.data?.payload?.id;
  if (!id) throw new Error(`Failed to create test group "${label}": ${JSON.stringify(res.data)}`);
  return id;
}

/**
 * Update a test group's permissions (enable/disable specific perms).
 */
async function updateGroupPermissions(adminClient, groupId, enabledPerms) {
  const res = await adminClient.put(`/groups/${groupId}`, {
    name: uniqueName('PermTest_Updated'),
    permissions: buildPermissions(enabledPerms, true)
  });
  expect(res.status, `Update group permissions: ${JSON.stringify(res.data)}`).to.be.lessThan(300);
}

// ─── Permission Test Cases ───────────────────────────────────────────────────

/**
 * Each entry defines:
 * - name: human-readable label
 * - perm: the permission key
 * - enabledCheck: async(client) => verifies access IS allowed (2xx)
 * - disabledCheck: async(client) => verifies access IS blocked (403)
 * - setup: optional async(adminClient) => returns ctx
 * - teardown: optional async(adminClient, ctx) => cleanup setup resources
 */
const PERMISSION_TEST_CASES = [
  {
    name: 'assetsview',
    label: 'can list hardware assets',
    perm: 'assetsview',
    enabledCheck: async (client) => {
      const res = await client.get('/hardware', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'assetsview [ON]: GET /hardware');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/hardware', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'assetsview [OFF]: GET /hardware');
    }
  },
  {
    name: 'accessoriesview',
    label: 'can list accessories',
    perm: 'accessoriesview',
    enabledCheck: async (client) => {
      const res = await client.get('/accessories', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'accessoriesview [ON]: GET /accessories');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/accessories', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'accessoriesview [OFF]: GET /accessories');
    }
  },
  {
    name: 'consumablesview',
    label: 'can list consumables',
    perm: 'consumablesview',
    enabledCheck: async (client) => {
      const res = await client.get('/consumables', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'consumablesview [ON]: GET /consumables');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/consumables', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'consumablesview [OFF]: GET /consumables');
    }
  },
  {
    name: 'licensesview',
    label: 'can list licenses',
    perm: 'licensesview',
    enabledCheck: async (client) => {
      const res = await client.get('/licenses', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'licensesview [ON]: GET /licenses');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/licenses', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'licensesview [OFF]: GET /licenses');
    }
  },
  {
    name: 'componentsview',
    label: 'can list components',
    perm: 'componentsview',
    enabledCheck: async (client) => {
      const res = await client.get('/components', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'componentsview [ON]: GET /components');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/components', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'componentsview [OFF]: GET /components');
    }
  },
  {
    name: 'usersview',
    label: 'can list users',
    perm: 'usersview',
    enabledCheck: async (client) => {
      const res = await client.get('/users', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'usersview [ON]: GET /users');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/users', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'usersview [OFF]: GET /users');
    }
  },
  {
    name: 'reportview',
    label: 'can access activity report',
    perm: 'reportview',
    enabledCheck: async (client) => {
      const res = await client.get('/reports/activity', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'reportview [ON]: GET /reports/activity');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/reports/activity', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'reportview [OFF]: GET /reports/activity');
    }
  },
  {
    name: 'categoriesview',
    label: 'can list categories',
    perm: 'categoriesview',
    enabledCheck: async (client) => {
      const res = await client.get('/categories', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'categoriesview [ON]: GET /categories');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/categories', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'categoriesview [OFF]: GET /categories');
    }
  },
  {
    name: 'companiesview',
    label: 'can list companies',
    perm: 'companiesview',
    enabledCheck: async (client) => {
      const res = await client.get('/companies', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'companiesview [ON]: GET /companies');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/companies', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'companiesview [OFF]: GET /companies');
    }
  },
  {
    name: 'locationsview',
    label: 'can list locations (branch locations)',
    perm: 'locationsview',
    enabledCheck: async (client) => {
      const res = await client.get('/locations', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'locationsview [ON]: GET /locations');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/locations', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'locationsview [OFF]: GET /locations');
    }
  },
  {
    name: 'departmentsview',
    label: 'can list departments',
    perm: 'departmentsview',
    enabledCheck: async (client) => {
      const res = await client.get('/departments', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'departmentsview [ON]: GET /departments');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/departments', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'departmentsview [OFF]: GET /departments');
    }
  },
  {
    name: 'manufacturersview',
    label: 'can list manufacturers',
    perm: 'manufacturersview',
    enabledCheck: async (client) => {
      const res = await client.get('/manufacturers', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'manufacturersview [ON]: GET /manufacturers');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/manufacturers', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'manufacturersview [OFF]: GET /manufacturers');
    }
  },
  {
    name: 'suppliersview',
    label: 'can list suppliers',
    perm: 'suppliersview',
    enabledCheck: async (client) => {
      const res = await client.get('/suppliers', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'suppliersview [ON]: GET /suppliers');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/suppliers', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'suppliersview [OFF]: GET /suppliers');
    }
  },
  {
    name: 'statuslabelsview',
    label: 'can list status labels',
    perm: 'statuslabelsview',
    enabledCheck: async (client) => {
      const res = await client.get('/statuslabels', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'statuslabelsview [ON]: GET /statuslabels');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/statuslabels', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'statuslabelsview [OFF]: GET /statuslabels');
    }
  },
  {
    name: 'modelsview',
    label: 'can list models',
    perm: 'modelsview',
    enabledCheck: async (client) => {
      const res = await client.get('/models', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'modelsview [ON]: GET /models');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/models', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'modelsview [OFF]: GET /models');
    }
  },
  {
    name: 'depreciationsview',
    label: 'can list depreciations',
    perm: 'depreciationsview',
    enabledCheck: async (client) => {
      const res = await client.get('/depreciations', { params: { limit: 1, offset: 0 } });
      expectAllowed(res, 'depreciationsview [ON]: GET /depreciations');
    },
    disabledCheck: async (client) => {
      const res = await client.get('/depreciations', { params: { limit: 1, offset: 0 } });
      expectForbidden(res, 'depreciationsview [OFF]: GET /depreciations');
    }
  },
  {
    name: 'edit_group_permissions',
    label: 'can create and manage groups',
    perm: 'edit_group_permissions',
    enabledCheck: async (client) => {
      const res = await client.post('/groups', {
        name: uniqueName('PermCheck Group'),
        permissions: buildPermissions(['assetsview'], true)
      });
      expectAllowed(res, 'edit_group_permissions [ON]: POST /groups');
      const id = res.data?.id || res.data?.payload?.id;
      if (id) await client.delete(`/groups/${id}`).catch(() => {});
    },
    disabledCheck: async (client) => {
      const res = await client.post('/groups', {
        name: uniqueName('PermCheck Group'),
        permissions: buildPermissions(['assetsview'], true)
      });
      expectForbidden(res, 'edit_group_permissions [OFF]: POST /groups');
    }
  },
  {
    name: 'assetscreate',
    label: 'can create hardware assets',
    perm: 'assetscreate',
    setup: async (adminClient) => {
      const depRes = await adminClient.post('/depreciations', {
        name: uniqueName('PermTest Dep'),
        months: 12
      });
      const depreciationId = depRes.data?.id || depRes.data?.payload?.id;
      const mfgRes = await adminClient.post('/manufacturers', { name: uniqueName('PermTest Mfg') });
      const mfgId = mfgRes.data?.id;
      const catRes = await adminClient.post('/categories', { name: uniqueName('PermTest Cat'), category_type: 'Asset' });
      const catId = catRes.data?.id;
      const modelRes = await adminClient.post('/models', {
        name: uniqueName('PermTest Model'),
        model_number: uniqueName('PM'),
        category_id: catId,
        manufacturer_id: mfgId
      });
      const modelId = modelRes.data?.id;
      const slRes = await adminClient.post('/statuslabels', { name: uniqueName('PermTest SL'), type: 'deployable', color: '#aabbcc' });
      const statusId = slRes.data?.id;
      return { mfgId, catId, modelId, statusId, depreciationId, _assetIds: [] };
    },
    enabledCheck: async (client, ctx) => {
      const res = await client.post('/hardware', {
        name: uniqueName('PermTest Asset'),
        model_id: ctx.modelId,
        status_id: ctx.statusId,
        depreciation_id: ctx.depreciationId,
        asset_tag: `PCT-${Date.now()}`
      });
      expectAllowed(res, 'assetscreate [ON]: POST /hardware');
      const id = res.data?.id || res.data?.payload?.id;
      if (id) ctx._assetIds.push(id);
    },
    disabledCheck: async (client, ctx) => {
      const res = await client.post('/hardware', {
        name: uniqueName('PermTest Asset2'),
        model_id: ctx.modelId,
        status_id: ctx.statusId,
        depreciation_id: ctx.depreciationId,
        asset_tag: `PCT2-${Date.now()}`
      });
      expectForbidden(res, 'assetscreate [OFF]: POST /hardware');
    },
    teardown: async (adminClient, ctx) => {
      for (const id of (ctx._assetIds || [])) await adminClient.delete(`/hardware/${id}`).catch(() => {});
      if (ctx.modelId) await adminClient.delete(`/models/${ctx.modelId}`).catch(() => {});
      if (ctx.mfgId) await adminClient.delete(`/manufacturers/${ctx.mfgId}`).catch(() => {});
      if (ctx.catId) await adminClient.delete(`/categories/${ctx.catId}`).catch(() => {});
      if (ctx.statusId) await adminClient.delete(`/statuslabels/${ctx.statusId}`).catch(() => {});
      if (ctx.depreciationId) await adminClient.delete(`/depreciations/${ctx.depreciationId}`).catch(() => {});
    }
  },
  {
    name: 'accessoriescreate',
    label: 'can create accessories',
    perm: 'accessoriescreate',
    setup: async (adminClient) => {
      const catRes = await adminClient.post('/categories', { name: uniqueName('PermTest AccCat'), category_type: 'Accessory' });
      return { catId: catRes.data?.id, _accIds: [] };
    },
    enabledCheck: async (client, ctx) => {
      const res = await client.post('/accessories', { name: uniqueName('PermTest Acc'), category_id: ctx.catId, qty: 1 });
      expectAllowed(res, 'accessoriescreate [ON]: POST /accessories');
      const id = res.data?.id || res.data?.payload?.id;
      if (id) ctx._accIds.push(id);
    },
    disabledCheck: async (client, ctx) => {
      const res = await client.post('/accessories', { name: uniqueName('PermTest Acc2'), category_id: ctx.catId, qty: 1 });
      expectForbidden(res, 'accessoriescreate [OFF]: POST /accessories');
    },
    teardown: async (adminClient, ctx) => {
      for (const id of (ctx._accIds || [])) await adminClient.delete(`/accessories/${id}`).catch(() => {});
      if (ctx.catId) await adminClient.delete(`/categories/${ctx.catId}`).catch(() => {});
    }
  },
  {
    name: 'consumablescreate',
    label: 'can create consumables',
    perm: 'consumablescreate',
    setup: async (adminClient) => {
      const catRes = await adminClient.post('/categories', { name: uniqueName('PermTest ConCat'), category_type: 'Consumable' });
      return { catId: catRes.data?.id, _ids: [] };
    },
    enabledCheck: async (client, ctx) => {
      const res = await client.post('/consumables', { name: uniqueName('PermTest Con'), category_id: ctx.catId, qty: 1 });
      expectAllowed(res, 'consumablescreate [ON]: POST /consumables');
      const id = res.data?.id || res.data?.payload?.id;
      if (id) ctx._ids.push(id);
    },
    disabledCheck: async (client, ctx) => {
      const res = await client.post('/consumables', { name: uniqueName('PermTest Con2'), category_id: ctx.catId, qty: 1 });
      expectForbidden(res, 'consumablescreate [OFF]: POST /consumables');
    },
    teardown: async (adminClient, ctx) => {
      for (const id of (ctx._ids || [])) await adminClient.delete(`/consumables/${id}`).catch(() => {});
      if (ctx.catId) await adminClient.delete(`/categories/${ctx.catId}`).catch(() => {});
    }
  }
];

// ─── Main RBAC Permission Test Suite ────────────────────────────────────────

describe('Group Permissions: Enable/Disable per-permission tests', function () {
  this.timeout(300000);

  let adminClient, apiUrl;
  let originalGroupIds = []; // Manager's original group IDs to restore

  before(async function () {
    const adminCtx = await loginAs('admin');
    adminClient = adminCtx.client;
    apiUrl = adminCtx.apiUrl;

    // Save manager's current group assignments for restoration
    originalGroupIds = await getManagerGroups(adminClient);
  });

  after(async function () {
    // Always try to restore the manager's original groups after the suite
    if (originalGroupIds.length > 0) {
      try {
        await setManagerGroup(adminClient, originalGroupIds[0]);
        console.log(`✓ Manager groups restored: ${originalGroupIds}`);
      } catch (e) {
        console.error(`⚠ Failed to restore manager groups: ${e.message}`);
      }
    }
  });

  for (const tc of PERMISSION_TEST_CASES) {
    describe(`[${tc.name}] ${tc.label}`, function () {
      let testGroupId;
      let ctx = {};

      before(async function () {
        // Optional: set up resources needed for this test
        if (tc.setup) {
          ctx = await tc.setup(adminClient);
        }

        // 1. Create test group with ONLY this permission enabled
        testGroupId = await createTestGroup(adminClient, tc.name, [tc.perm]);

        // 2. Assign manager to this group
        const assignRes = await setManagerGroup(adminClient, testGroupId);
        expect(assignRes.status, `Assign manager to test group "${tc.name}"`).to.be.lessThan(300);
      });

      after(async function () {
        // Cleanup: delete test group (will restore original groups in top-level after)
        if (testGroupId) {
          await adminClient.delete(`/groups/${testGroupId}`).catch(() => {});
        }
        if (tc.teardown) {
          await tc.teardown(adminClient, ctx).catch((e) => console.error(`Teardown error: ${e.message}`));
        }
      });

      it(`[ENABLED] "${tc.name}" permission → endpoint is accessible (2xx)`, async function () {
        const mgrClient = await loginManager(apiUrl);
        await tc.enabledCheck(mgrClient, ctx);
      });

      it(`[DISABLED] "${tc.name}" permission OFF → endpoint is blocked (403)`, async function () {
        // Update the group: remove the permission (set all to false)
        await updateGroupPermissions(adminClient, testGroupId, []);

        // Login fresh — new token reflects the updated permissions
        const mgrClient = await loginManager(apiUrl);
        await tc.disabledCheck(mgrClient, ctx);
      });
    });
  }
});

// ─── Group Management Visibility Tests ───────────────────────────────────────

describe('Group Management: Super Admin visibility per role', function () {
  this.timeout(30000);

  it('Super Admin SEES Super Admin group in list', async function () {
    const ctx = await loginAs('superAdmin');
    const res = await ctx.client.get('/groups', { params: { limit: 50, offset: 0 } });
    expect(res.status).to.equal(200);
    assertSuperAdminGroupPresent(res, 'SA');
  });

  it('Admin does NOT see Super Admin group in list', async function () {
    const ctx = await loginAs('admin');
    const res = await ctx.client.get('/groups', { params: { limit: 50, offset: 0 } });
    expect(res.status).to.equal(200);
    assertSuperAdminGroupAbsent(res, 'Admin');
  });

  it('Admin does NOT see Super Admin in selectList', async function () {
    const ctx = await loginAs('admin');
    const res = await ctx.client.get('/groups/selectList');
    expect(res.status).to.equal(200);
    const items = res.data?.items || [];
    const found = items.find(i => i.text?.toLowerCase() === 'super admin');
    expect(found, 'Super Admin should NOT appear in Admin selectList').to.be.undefined;
  });

  it('Manager does NOT see Super Admin in any groups list', async function () {
    const ctx = await loginAs('manager');
    const res = await ctx.client.get('/groups', { params: { limit: 50, offset: 0 } });
    if (res.status === 200) {
      assertSuperAdminGroupAbsent(res, 'Manager');
    }
    expect(res.status).to.be.lessThan(500);
  });

  it('Super Admin can assign superuser:1 to a group and it persists', async function () {
    const ctx = await loginAs('superAdmin');
    const name = uniqueName('SA Perm Test');
    const createRes = await ctx.client.post('/groups', {
      name,
      permissions: { superuser: '1', admin: true }
    });
    expectAllowed(createRes, 'SA create superuser group');
    const id = createRes.data?.id || createRes.data?.payload?.id;
    expect(id, 'Group ID').to.exist;

    const fetchRes = await ctx.client.get(`/groups/${id}`);
    expectAllowed(fetchRes, 'SA fetch superuser group');
    expect(fetchRes.data?.permissions?.superuser).to.be.oneOf(['1', 1, true]);

    await ctx.client.delete(`/groups/${id}`);
  });

  it('Admin CANNOT create a group with superuser:1 — it is stripped', async function () {
    const ctx = await loginAs('admin');
    const name = uniqueName('Admin Escalation Test');
    const createRes = await ctx.client.post('/groups', {
      name,
      permissions: { superuser: '1', admin: true }
    });
    expectAllowed(createRes, 'Admin create group (superuser stripped)');
    const id = createRes.data?.id || createRes.data?.payload?.id;
    expect(id).to.exist;

    const fetchRes = await ctx.client.get(`/groups/${id}`);
    if (fetchRes.status === 200) {
      const superuser = fetchRes.data?.permissions?.superuser;
      expect(superuser).to.be.oneOf(['0', 0, false, undefined, null]);
    }

    await ctx.client.delete(`/groups/${id}`).catch(() => {});
  });
});

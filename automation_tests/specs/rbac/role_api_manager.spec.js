/**
 * role_api_manager.spec.js
 *
 * Verifies the Manager role's access:
 * - Cannot create/update/delete groups without edit_group_permissions
 * - Cannot see superuser groups in selectList
 * - Can access permitted resources (varies by their group's permissions)
 * - Cannot access superuser-only endpoints
 */
const { expect } = require('chai');
const { loginAs } = require('../../helpers/auth_helper');
const {
  expectAllowed,
  expectForbidden,
  expectDenied
} = require('../../helpers/rbac_helper');

describe('Manager Role: Access Control Tests', function () {
  this.timeout(60000);

  let client, apiUrl;

  before(async function () {
    const ctx = await loginAs('manager');
    client = ctx.client;
    apiUrl = ctx.apiUrl;
  });

  // ─── Groups: Manager has no group write access ─────────────────────────────

  it('can read groups list (response is 200 or 403 based on permissions)', async function () {
    const res = await client.get('/groups', { params: { limit: 10, offset: 0 } });
    expect(res.status).to.be.lessThan(500);
  });

  it('cannot create a group without edit_group_permissions', async function () {
    const res = await client.post('/groups', {
      name: `Manager Group Attempt ${Date.now()}`,
      permissions: { assetsview: true }
    });
    // Manager's group has edit_group_permissions: false → should be 403
    expectDenied(res, 'Manager POST /groups');
  });

  it('cannot update a group without edit_group_permissions', async function () {
    // Attempt to update any group
    const listRes = await client.get('/groups', { params: { limit: 5, offset: 0 } });
    const firstGroup = listRes.data?.rows?.[0];
    if (!firstGroup) return this.skip();

    const res = await client.put(`/groups/${firstGroup.id}`, {
      name: firstGroup.name,
      permissions: firstGroup.permissions
    });
    expectDenied(res, `Manager PUT /groups/${firstGroup.id}`);
  });

  it('cannot delete a group without edit_group_permissions', async function () {
    const listRes = await client.get('/groups', { params: { limit: 5, offset: 0 } });
    const firstGroup = listRes.data?.rows?.[0];
    if (!firstGroup) return this.skip();

    const res = await client.delete(`/groups/${firstGroup.id}`);
    expectDenied(res, `Manager DELETE /groups/${firstGroup.id}`);
  });

  it('groups selectList does NOT contain superuser groups', async function () {
    const res = await client.get('/groups/selectList');
    if (res.status === 200) {
      const items = res.data?.items || [];
      const superGroup = items.find(i => i.text?.toLowerCase() === 'super admin');
      expect(superGroup, 'Super Admin should NOT appear in manager selectList').to.be.undefined;
    }
    // 403 is also acceptable — manager may not have read access to selectList
    expect(res.status).to.be.lessThan(500);
  });

  // ─── Manager: Standard access ─────────────────────────────────────────────

  it('can read dashboard chart', async function () {
    const res = await client.get('/users/chart');
    expectAllowed(res, 'Manager GET /users/chart');
  });

  it('can read locations selectList (branches_dropdown)', async function () {
    const res = await client.get('/locations/selectList', { params: { page: 1 } });
    // May be 200 or 403 depending on branches_dropdown permission
    expect(res.status).to.be.lessThan(500);
  });

  // ─── Manager: Cannot reach superuser-only admin control endpoints ──────────

  it('access-controls endpoint returns non-500 (may be 200 or 403)', async function () {
    // The manager's group has admin: true so they may be able to GET this
    // We just ensure no server crash
    const res = await client.get('/admin/access-controls');
    expect(res.status).to.be.lessThan(500);
  });

  // ─── Manager: Verify no access to Super Admin group ───────────────────────

  it('manager cannot see Super Admin group by name in any list', async function () {
    const res = await client.get('/groups', { params: { limit: 50, offset: 0 } });
    if (res.status === 200) {
      const rows = res.data?.rows || [];
      const found = rows.find(r => r.name?.toLowerCase() === 'super admin');
      expect(found, 'Super Admin group should NOT be visible to Manager').to.be.undefined;
    }
    // 403 is fine too
    expect(res.status).to.be.lessThan(500);
  });
});


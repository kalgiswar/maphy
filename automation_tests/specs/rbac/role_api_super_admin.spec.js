/**
 * role_api_super_admin.spec.js
 *
 * Verifies that the Super Admin role has unrestricted access to all API endpoints,
 * including the Super Admin group in group management.
 */
const { expect } = require('chai');
const { loginAs } = require('../../helpers/auth_helper');
const {
  expectAllowed,
  assertSuperAdminGroupPresent
} = require('../../helpers/rbac_helper');

describe('Super Admin: Full API Access Tests', function () {
  this.timeout(60000);

  let client, apiUrl;
  let superAdminGroupId;

  before(async function () {
    const ctx = await loginAs('superAdmin');
    client = ctx.client;
    apiUrl = ctx.apiUrl;
  });

  // ─── Users ───────────────────────────────────────────────────────────────

  it('can list users', async function () {
    const res = await client.get('/users', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /users');
    expect(res.data?.rows, 'Users list should have rows').to.be.an('array');
  });

  // ─── Groups ──────────────────────────────────────────────────────────────

  it('can list groups and SEES Super Admin group', async function () {
    const res = await client.get('/groups', { params: { limit: 50, offset: 0 } });
    expectAllowed(res, 'SA GET /groups');
    assertSuperAdminGroupPresent(res, 'SA groups list');

    const rows = res.data?.rows || [];
    const saGroup = rows.find(g => g.name?.toLowerCase() === 'super admin');
    if (saGroup) superAdminGroupId = saGroup.id;
  });

  it('can fetch Super Admin group by ID', async function () {
    if (!superAdminGroupId) this.skip();
    const res = await client.get(`/groups/${superAdminGroupId}`);
    expectAllowed(res, `SA GET /groups/${superAdminGroupId}`);
    expect(res.data?.name?.toLowerCase()).to.include('super admin');
  });

  it('can access groups selectList', async function () {
    const res = await client.get('/groups/selectList');
    expectAllowed(res, 'SA GET /groups/selectList');
    expect(res.data?.items).to.be.an('array');
    // Super Admin group should appear in selectList for SA
    const found = res.data.items.find(i => i.text?.toLowerCase() === 'super admin');
    expect(found, 'Super Admin should appear in selectList for SA').to.not.be.undefined;
  });

  // ─── Hardware / Assets ───────────────────────────────────────────────────

  it('can list hardware/assets', async function () {
    const res = await client.get('/hardware', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /hardware');
  });

  // ─── Accessories ─────────────────────────────────────────────────────────

  it('can list accessories', async function () {
    const res = await client.get('/accessories', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /accessories');
  });

  // ─── Consumables ─────────────────────────────────────────────────────────

  it('can list consumables', async function () {
    const res = await client.get('/consumables', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /consumables');
  });

  // ─── Licenses ────────────────────────────────────────────────────────────

  it('can list licenses', async function () {
    const res = await client.get('/licenses', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /licenses');
  });

  // ─── Components ──────────────────────────────────────────────────────────

  it('can list components', async function () {
    const res = await client.get('/components', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /components');
  });

  // ─── Settings ────────────────────────────────────────────────────────────

  it('can list companies', async function () {
    const res = await client.get('/companies', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /companies');
  });

  it('can list locations (branch locations)', async function () {
    const res = await client.get('/locations', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /locations');
  });

  it('can list departments', async function () {
    const res = await client.get('/departments', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /departments');
  });

  it('can list manufacturers', async function () {
    const res = await client.get('/manufacturers', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /manufacturers');
  });

  it('can list suppliers', async function () {
    const res = await client.get('/suppliers', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /suppliers');
  });

  it('can list categories', async function () {
    const res = await client.get('/categories', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /categories');
  });

  it('can list status labels', async function () {
    const res = await client.get('/statuslabels', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /statuslabels');
  });

  it('can list models', async function () {
    const res = await client.get('/models', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /models');
  });

  it('can list depreciations', async function () {
    const res = await client.get('/depreciations', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /depreciations');
  });

  // ─── Reports ─────────────────────────────────────────────────────────────

  it('can access activity reports', async function () {
    const res = await client.get('/reports/activity', { params: { limit: 5, offset: 0 } });
    expectAllowed(res, 'SA GET /reports/activity');
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────

  it('can access dashboard chart', async function () {
    const res = await client.get('/users/chart');
    expectAllowed(res, 'SA GET /users/chart');
  });

  // ─── Group CRUD (Super Admin group) ──────────────────────────────────────

  it('can create a group WITH superuser permission and it sticks', async function () {
    const name = `SA Test Group ${Date.now()}`;
    const res = await client.post('/groups', {
      name,
      permissions: { superuser: '1', admin: true }
    });
    expectAllowed(res, 'SA POST /groups with superuser:1');
    const id = res.data?.id || res.data?.payload?.id;
    expect(id, 'Created group ID').to.exist;

    if (id) {
      // Verify the group was saved with superuser: '1'
      const fetchRes = await client.get(`/groups/${id}`);
      expectAllowed(fetchRes, 'SA GET /groups/:id after creation');
      const perms = fetchRes.data?.permissions;
      expect(perms?.superuser).to.be.oneOf(['1', 1, true]);

      // Cleanup
      await client.delete(`/groups/${id}`);
    }
  });
});

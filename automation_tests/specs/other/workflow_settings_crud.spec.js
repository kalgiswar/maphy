const { expect } = require('chai');
const {
  createWorkflowClient,
  uniqueName,
  createResource,
  updateResource,
  deleteResource,
  ensureNamedResource
} = require('../../helpers/workflow_helper');

describe('Settings CRUD Workflow Tests', function () {
  let client;
  let ctx;

  before(async function () {
    ({ client } = await createWorkflowClient());
    ctx = {};
  });

  const simpleResources = [
    { path: '/companies', prefix: 'WF Company' },
    { path: '/locations', prefix: 'WF Location' },
    { path: '/manufacturers', prefix: 'WF Manufacturer' },
    { path: '/suppliers', prefix: 'WF Supplier' },
    { path: '/categories', prefix: 'WF Category', extra: { category_type: 'Asset' } }
  ];

  for (const resource of simpleResources) {
    it(`creates, edits, and deletes ${resource.path}`, async function () {
      const createdName = uniqueName(resource.prefix);
      const updatedName = `${createdName} Updated`;
      const id = await createResource(client, resource.path, {
        name: createdName,
        ...(resource.extra || {})
      });

      await updateResource(client, `${resource.path}/${id}`, {
        name: updatedName,
        ...(resource.extra || {})
      });

      const getRes = await client.get(`${resource.path}/${id}`);
      expect(getRes.status).to.equal(200);
      expect(getRes.data.name).to.equal(updatedName);

      await deleteResource(client, `${resource.path}/${id}`);
    });
  }

  it('creates, edits, and deletes a department with company/location/manager dependencies', async function () {
    ctx.companyId = await ensureNamedResource(client, '/companies', 'WF Dept Company');
    ctx.locationId = await ensureNamedResource(client, '/locations', 'WF Dept Location');

    const users = await client.get('/users/selectList', { params: { page: 1 } });
    expect(users.status).to.equal(200);
    const managerId = users.data.items?.[0]?.id;
    expect(managerId, 'manager user id').to.exist;

    const createdName = uniqueName('WF Department');
    const updatedName = `${createdName} Updated`;
    const id = await createResource(client, '/departments', {
      name: createdName,
      company_id: String(ctx.companyId),
      location_id: String(ctx.locationId),
      manager_id: String(managerId)
    });

    await updateResource(client, `/departments/${id}`, {
      name: updatedName,
      company_id: String(ctx.companyId),
      location_id: String(ctx.locationId),
      manager_id: String(managerId)
    });

    const getRes = await client.get(`/departments/${id}`);
    expect(getRes.status).to.equal(200);
    expect(getRes.data.name).to.equal(updatedName);

    await deleteResource(client, `/departments/${id}`);
  });

  after(async function () {
    if (!client) {
      return;
    }

    if (ctx.locationId) {
      await client.delete(`/locations/${ctx.locationId}`);
    }
    if (ctx.companyId) {
      await client.delete(`/companies/${ctx.companyId}`);
    }
  });
});

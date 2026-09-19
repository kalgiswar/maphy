const { expect } = require('chai');
const {
  createWorkflowClient,
  uniqueName,
  expectSuccess,
  createResource,
  updateResource,
  deleteResource,
  ensureWorkflowContext,
  formWithFile
} = require('../../helpers/workflow_helper');

describe('Inventory, Asset, License, Upload Workflow Tests', function () {
  let client;
  let user;
  let ctx;
  const cleanup = [];

  before(async function () {
    ({ client, user } = await createWorkflowClient());
    ctx = await ensureWorkflowContext(client);
    cleanup.push(
      ['/statuslabels', ctx.statusId],
      ['/models', ctx.modelId],
      ['/depreciations', ctx.depreciationId],
      ['/categories', ctx.licenseCategoryId],
      ['/categories', ctx.consumableCategoryId],
      ['/categories', ctx.componentCategoryId],
      ['/categories', ctx.accessoryCategoryId],
      ['/categories', ctx.assetCategoryId],
      ['/suppliers', ctx.supplierId],
      ['/manufacturers', ctx.manufacturerId],
      ['/locations', ctx.locationId],
      ['/companies', ctx.companyId]
    );
  });

  async function ensureDeployedStatusId() {
    const res = await client.get('/statuslabels', { params: { search: 'deployed', limit: 5, offset: 0 } });
    const existing = res.data.rows?.find((row) => String(row.name).toLowerCase() === 'deployed');
    if (existing?.id) {
      return existing.id;
    }

    const id = await createResource(client, '/statuslabels', {
      name: 'deployed',
      type: 'deployed',
      color: '#0088ff'
    });
    cleanup.push(['/statuslabels', id]);
    return id;
  }

  async function createAsset(namePrefix = 'WF Asset') {
    const id = await createResource(client, '/hardware', {
      name: uniqueName(namePrefix),
      serial: uniqueName('WF-SERIAL'),
      model_id: ctx.modelId,
      status_id: ctx.statusId,
      supplier_id: ctx.supplierId,
      company_id: ctx.companyId,
      rtd_location_id: ctx.locationId,
      depreciation_id: ctx.depreciationId,
      purchase_date: '2026-06-18',
      purchase_cost: 1000,
      gst: 0,
      warranty_months: 12,
      requestable: 0,
      notes: 'Workflow automation asset'
    });
    cleanup.push(['/hardware', id]);
    return id;
  }

  it('creates, edits, checks out, checks in, and deletes an asset', async function () {
    await ensureDeployedStatusId();
    const assetId = await createAsset();

    await updateResource(client, `/hardware/${assetId}`, {
      name: uniqueName('WF Asset Updated'),
      serial: uniqueName('WF-SERIAL-UPDATED'),
      model_id: ctx.modelId,
      status_id: ctx.statusId,
      supplier_id: ctx.supplierId,
      company_id: ctx.companyId,
      rtd_location_id: ctx.locationId,
      depreciation_id: ctx.depreciationId,
      purchase_date: '2026-06-18',
      purchase_cost: 1100,
      warranty_months: 12,
      requestable: 0,
      notes: 'Workflow automation asset update'
    });

    const checkout = await client.post(`/hardware/${assetId}/checkout`, {
      name: 'Asset checkout workflow',
      checkout_to_type: 'user',
      assigned_user: user.userId,
      checkout_at: '2026-06-18',
      expected_checkin: '2026-06-19',
      notes: 'Workflow checkout'
    });
    expectSuccess(checkout, `POST /hardware/${assetId}/checkout`);

    const checkin = await client.post(`/hardware/${assetId}/checkin`, {
      name: 'Asset checkin workflow',
      status_id: ctx.statusId,
      assigned_location: ctx.locationId,
      checkin_at: '2026-06-18',
      notes: 'Workflow checkin'
    });
    expectSuccess(checkin, `POST /hardware/${assetId}/checkin`);

    await deleteResource(client, `/hardware/${assetId}`);
    cleanup.pop();
  });

  it('creates, checks out, checks in, and deletes a license', async function () {
    const licenseId = await createResource(client, '/licenses', {
      name: uniqueName('WF License'),
      serial: uniqueName('WF-LIC'),
      category_id: ctx.licenseCategoryId,
      company_id: ctx.companyId,
      manufacturer_id: ctx.manufacturerId,
      supplier_id: ctx.supplierId,
      seats: 1,
      purchase_date: '2026-06-18',
      expiration_date: '2027-06-18',
      purchase_cost: 99,
      order_number: uniqueName('WF-LIC-ORDER'),
      reassignable: 1,
      maintained: 1
    });
    cleanup.push(['/licenses', licenseId]);

    const checkout = await client.post(`/licenses/${licenseId}/checkout`, {
      checkout_to_type: 'user',
      assigned_to: user.userId,
      notes: 'Workflow license checkout'
    });
    expectSuccess(checkout, `POST /licenses/${licenseId}/checkout`);

    const seats = await client.get(`/licenses/${licenseId}/seats`, { params: { limit: 5, offset: 0 } });
    expect(seats.status).to.equal(200);
    const seatId = seats.data.rows?.[0]?.id;
    expect(seatId, 'license seat id').to.exist;

    const checkin = await client.post(`/licenses/${seatId}/checkin`, {
      notes: 'Workflow license checkin'
    });
    expectSuccess(checkin, `POST /licenses/${seatId}/checkin`);

    await deleteResource(client, `/licenses/${licenseId}`);
    cleanup.pop();
  });

  it('creates an accessory, checks it out and in, then deletes it', async function () {
    const accessoryId = await createResource(client, '/accessories', {
      name: uniqueName('WF Accessory'),
      company_id: String(ctx.companyId),
      category_id: String(ctx.accessoryCategoryId),
      supplier_id: String(ctx.supplierId),
      location_id: String(ctx.locationId),
      manufacturer_id: String(ctx.manufacturerId),
      qty: '2',
      min_amt: '1',
      model_number: uniqueName('WF-ACC-MODEL'),
      order_number: uniqueName('WF-ACC-ORDER'),
      purchase_date: '2026-06-18',
      purchase_cost: '10'
    });
    cleanup.push(['/accessories', accessoryId]);

    const checkout = await client.post(`/accessories/${accessoryId}/checkout`, {
      assigned_to: user.userId,
      notes: 'Workflow accessory checkout'
    });
    expectSuccess(checkout, `POST /accessories/${accessoryId}/checkout`);

    const checkedOut = await client.get(`/accessories/${accessoryId}/checkedout`);
    expect(checkedOut.status).to.equal(200);
    const pivotId = checkedOut.data.rows?.[0]?.assigned_pivot_id;
    expect(pivotId, 'accessory checkout pivot id').to.exist;

    const checkin = await client.post(`/accessories/${pivotId}/checkin`, {
      notes: 'Workflow accessory checkin'
    });
    expectSuccess(checkin, `POST /accessories/${pivotId}/checkin`);

    await deleteResource(client, `/accessories/${accessoryId}`);
    cleanup.pop();
  });

  it('creates a component, checks it out to an asset, checks it in, then deletes it', async function () {
    const assetId = await createAsset('WF Component Target Asset');
    const componentId = await createResource(client, '/components', {
      name: uniqueName('WF Component'),
      category_id: String(ctx.componentCategoryId),
      company_id: String(ctx.companyId),
      location_id: String(ctx.locationId),
      qty: '2',
      min_amt: '1',
      serial: uniqueName('WF-COMP-SERIAL'),
      purchase_date: '2026-06-18',
      purchase_cost: '20',
      order_number: uniqueName('WF-COMP-ORDER')
    });
    cleanup.push(['/components', componentId]);

    const checkout = await client.post(`/components/${componentId}/checkout`, {
      asset_id: assetId,
      assigned_qty: 1,
      notes: 'Workflow component checkout'
    });
    expectSuccess(checkout, `POST /components/${componentId}/checkout`);

    const assignedAssets = await client.get(`/components/${componentId}/assets`);
    expect(assignedAssets.status).to.equal(200);
    const pivotId = assignedAssets.data.rows?.[0]?.assigned_pivot_id;
    expect(pivotId, 'component checkout pivot id').to.exist;

    const checkin = await client.post(`/components/${pivotId}/checkin`, {
      assigned_qty: 1,
      notes: 'Workflow component checkin'
    });
    expectSuccess(checkin, `POST /components/${pivotId}/checkin`);

    await deleteResource(client, `/components/${componentId}`);
    cleanup.pop();
    await deleteResource(client, `/hardware/${assetId}`);
    cleanup.pop();
  });

  it('creates a consumable, checks it out, then deletes it', async function () {
    const consumableId = await createResource(client, '/consumables', {
      name: uniqueName('WF Consumable'),
      category_id: String(ctx.consumableCategoryId),
      company_id: String(ctx.companyId),
      location_id: String(ctx.locationId),
      manufacturer_id: String(ctx.manufacturerId),
      qty: '2',
      min_amt: '1',
      item_no: uniqueName('WF-CONS-ITEM'),
      model_number: uniqueName('WF-CONS-MODEL'),
      purchase_date: '2026-06-18',
      purchase_cost: '5',
      order_number: uniqueName('WF-CONS-ORDER')
    });
    cleanup.push(['/consumables', consumableId]);

    const checkout = await client.post(`/consumables/${consumableId}/checkout`, {
      assigned_to: user.userId,
      notes: 'Workflow consumable checkout'
    });
    expectSuccess(checkout, `POST /consumables/${consumableId}/checkout`);

    await deleteResource(client, `/consumables/${consumableId}`);
    cleanup.pop();
  });

  it('accepts an empty asset bulk-upload file without creating data', async function () {
    const form = formWithFile(
      'file',
      'Asset Name,Serial,Asset Tag,Category,Model,Manufacturer,Status,Location,Company,Supplier\n',
      'workflow-empty-assets.csv',
      'text/csv'
    );
    const res = await client.post('/hardware/bulk-upload', form, {
      headers: form.getHeaders()
    });

    expectSuccess(res, 'POST /hardware/bulk-upload');
    expect(res.data.message || '').to.match(/0 assets created|Import completed/i);
  });

  it('uploads a branding logo only when explicitly enabled', async function () {
    if (process.env.WORKFLOW_ENABLE_LOGO_UPLOAD !== 'true') {
      this.skip();
    }

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64'
    );
    const form = formWithFile('uploaded_file', png, 'workflow-logo.png', 'image/png');
    const res = await client.put('/firms/uploadLogo', form, {
      headers: form.getHeaders()
    });

    expectSuccess(res, 'PUT /firms/uploadLogo');
  });

  after(async function () {
    if (!client) {
      return;
    }

    while (cleanup.length > 0) {
      const [path, id] = cleanup.pop();
      await client.delete(`${path}/${id}`);
    }
  });
});

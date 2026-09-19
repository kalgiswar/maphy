const { expect } = require('chai');
const FormData = require('form-data');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectNoServerError
} = require('./security_helper');

function uniqueName(prefix) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;
}

function decodeJwtPayload(token) {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

async function createWorkflowClient() {
  const apiUrl = resolveApiBaseUrl();
  const token = await loginForToken(apiUrl);
  return {
    apiUrl,
    token,
    user: decodeJwtPayload(token),
    client: createSecurityClient(apiUrl, token)
  };
}

function expectSuccess(res, label) {
  const body = JSON.stringify(res.data);
  expectNoServerError(res, `${label} returned ${res.status}`);
  expect(res.data?.success, `${label} response success flag. Body: ${body}`).to.not.equal(false);
  expect(res.data?.status, `${label} response status. Body: ${body}`).to.not.equal('error');
  expect(res.data?.message || '', `${label} response message. Body: ${body}`).to.not.match(/error/i);
}

function expectCreated(res, label) {
  expectSuccess(res, label);
  expect(res.data?.id, `${label} response id`).to.exist;
  return res.data.id;
}

async function createResource(client, path, payload) {
  const res = await client.post(path, payload);
  return expectCreated(res, `POST ${path}`);
}

async function updateResource(client, path, payload) {
  const res = await client.put(path, payload);
  expectSuccess(res, `PUT ${path}`);
  return res;
}

async function deleteResource(client, path) {
  const res = await client.delete(path);
  expectSuccess(res, `DELETE ${path}`);
  return res;
}

async function listRows(client, path, params = {}) {
  const res = await client.get(path, {
    params: {
      limit: 5,
      offset: 0,
      page: 1,
      ...params
    }
  });
  expectNoServerError(res, `GET ${path} returned ${res.status}`);
  return res.data?.rows || res.data?.items || [];
}

async function findFirstId(client, path, params = {}) {
  const rows = await listRows(client, path, params);
  return rows[0]?.id;
}

async function ensureNamedResource(client, path, prefix, extraPayload = {}) {
  const id = await createResource(client, path, {
    name: uniqueName(prefix),
    ...extraPayload
  });
  return id;
}

async function ensureWorkflowContext(client) {
  const companyId = await ensureNamedResource(client, '/companies', 'WF Company');
  const locationId = await ensureNamedResource(client, '/locations', 'WF Location');
  const manufacturerId = await ensureNamedResource(client, '/manufacturers', 'WF Manufacturer');
  const supplierId = await ensureNamedResource(client, '/suppliers', 'WF Supplier');
  const assetCategoryId = await ensureNamedResource(client, '/categories', 'WF Asset Category', { category_type: 'Asset' });
  const accessoryCategoryId = await ensureNamedResource(client, '/categories', 'WF Accessory Category', { category_type: 'Accessory' });
  const componentCategoryId = await ensureNamedResource(client, '/categories', 'WF Component Category', { category_type: 'Component' });
  const consumableCategoryId = await ensureNamedResource(client, '/categories', 'WF Consumable Category', { category_type: 'Consumable' });
  const licenseCategoryId = await ensureNamedResource(client, '/categories', 'WF License Category', { category_type: 'License' });
  const depreciationId = await ensureNamedResource(client, '/depreciations', 'WF Depreciation', { months: 12 });
  const modelId = await ensureNamedResource(client, '/models', 'WF Asset Model', {
    model_number: uniqueName('WF-MODEL'),
    category_id: assetCategoryId,
    manufacturer_id: manufacturerId,
    depreciation_id: depreciationId
  });
  const statusId = await ensureNamedResource(client, '/statuslabels', 'WF Ready', {
    type: 'deployable',
    color: '#00aa00'
  });

  return {
    companyId,
    locationId,
    manufacturerId,
    supplierId,
    assetCategoryId,
    accessoryCategoryId,
    componentCategoryId,
    consumableCategoryId,
    licenseCategoryId,
    depreciationId,
    modelId,
    statusId
  };
}

function formWithFile(fieldName, content, filename, contentType = 'text/plain') {
  const form = new FormData();
  form.append(fieldName, Buffer.from(content), { filename, contentType });
  return form;
}

module.exports = {
  createWorkflowClient,
  uniqueName,
  expectSuccess,
  expectCreated,
  createResource,
  updateResource,
  deleteResource,
  listRows,
  findFirstId,
  ensureNamedResource,
  ensureWorkflowContext,
  formWithFile
};

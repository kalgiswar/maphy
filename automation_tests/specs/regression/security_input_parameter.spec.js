const { expect } = require('chai');
const axios = require('axios');
const {
  sqlPayloads,
  noSqlPayloads,
  commandPayloads,
  xmlPayloads,
  unsafeSortPayloads,
  massAssignmentFields
} = require('../../security_payloads');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectNoServerError,
  expectDeniedOrFailure,
  isEnabled
} = require('../../helpers/security_helper');

describe('Input Validation and API Parameter Manipulation Tests', function () {
  let apiUrl;
  let client;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  it('keeps SQL, command, and NoSQL-like search probes non-fatal', async function () {
    const payloads = [...sqlPayloads, ...commandPayloads, ...noSqlPayloads];
    const endpoints = ['/hardware', '/tickets', '/users', '/suppliers'];

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        const res = await client.get(endpoint, {
          params: {
            search: typeof payload.value === 'string' ? payload.value : JSON.stringify(payload.value),
            limit: 5,
            offset: 0
          }
        });

        expectNoServerError(res, `${endpoint} payload ${payload.name} returned ${res.status}`);
      }
    }
  });

  it('does not authenticate NoSQL-like object credentials', async function () {
    for (const payload of noSqlPayloads) {
      const res = await axios.post(`${apiUrl}/users/login`, {
        email: payload.value,
        password: payload.value
      }, {
        validateStatus: () => true
      });

      expectNoServerError(res, `NoSQL payload ${payload.name} returned ${res.status}`);
      expect(res.data?.success).to.not.equal(true);
    }
  });

  it('handles XML payloads without XXE-style disclosure', async function () {
    for (const payload of xmlPayloads) {
      const res = await axios.post(`${apiUrl}/users/login`, payload.value, {
        validateStatus: () => true,
        headers: { 'Content-Type': 'application/xml' }
      });
      const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

      expectNoServerError(res, `XML payload ${payload.name} returned ${res.status}`);
      expect(body).to.not.match(/root:|daemon:|bin:|etc\/passwd|SYSTEM/i);
    }
  });

  it('fails closed for invalid id parameter manipulation', async function () {
    const ids = ['0', '-1', '999999999', '../1', '1 OR 1=1'];

    for (const id of ids) {
      const res = await client.get(`/hardware/${encodeURIComponent(id)}`);
      expectNoServerError(res, `/hardware/${id} returned ${res.status}`);
      expect(res.data?.password).to.equal(undefined);
    }
  });

  it('fails closed for unsafe sort and order parameters', async function () {
    for (const sort of unsafeSortPayloads) {
      const res = await client.get('/hardware', {
        params: {
          sort,
          order: 'asc;DROP TABLE users',
          limit: 5,
          offset: 0
        }
      });

      expectNoServerError(res, `/hardware sort "${sort}" returned ${res.status}`);
    }
  });

  it('checks mass assignment defenses on tickets when mutation tests are enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_MUTATION_TESTS')) {
      this.skip();
    }

    const subject = `Security mass assignment ${Date.now()}`;
    const createRes = await client.post('/tickets', {
      subject,
      description: 'Mass assignment probe',
      priority: 'low',
      ...massAssignmentFields
    });

    expect(createRes.status).to.equal(201);
    expect(createRes.data.success).to.equal(true);

    const ticketId = createRes.data.id;
    const getRes = await client.get(`/tickets/${ticketId}`);
    const body = JSON.stringify(getRes.data);

    expect(body).to.not.match(/isAdmin|permissions|role|deleted_at/i);

    const deleteRes = await client.delete(`/tickets/${ticketId}`);
    expect(deleteRes.status).to.be.lessThan(500);
  });
});

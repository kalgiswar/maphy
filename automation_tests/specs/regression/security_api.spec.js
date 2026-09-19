const { expect } = require('chai');
const axios = require('axios');
const {
  authPayloads,
  sqlPayloads,
  unsafeSortPayloads
} = require('../../security_payloads');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectDenied,
  expectNoServerError
} = require('../../helpers/security_helper');

describe('API Security Regression Tests', function () {
  let apiUrl;
  let authedClient;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    authedClient = createSecurityClient(apiUrl, token);
    console.log(`Security API target: ${apiUrl}`);
  });

  describe('Authentication boundaries', function () {
    const protectedEndpoints = [
      '/dashboard',
      '/hardware',
      '/users',
      '/reports/activity'
    ];

    for (const endpoint of protectedEndpoints) {
      it(`blocks anonymous GET ${endpoint}`, async function () {
        const res = await axios.get(`${apiUrl}${endpoint}`, { validateStatus: () => true });
        expectDenied(res);
      });

      it(`blocks malformed bearer token for GET ${endpoint}`, async function () {
        const res = await axios.get(`${apiUrl}${endpoint}`, {
          validateStatus: () => true,
          headers: { Authorization: authPayloads.malformed }
        });
        expectDenied(res);
      });
    }

    it('does not authenticate SQL-like login values', async function () {
      for (const payload of sqlPayloads) {
        const res = await axios.post(`${apiUrl}/users/login`, {
          email: payload.value,
          password: payload.value
        }, {
          validateStatus: () => true
        });

        expect(res.status).to.equal(200);
        expect(res.data.success).to.equal(false);
        expect(res.data.accessToken).to.equal(undefined);
      }
    });

    it('does not allow the agent bearer token to read normal protected APIs', async function () {
      const res = await axios.get(`${apiUrl}/users`, {
        validateStatus: () => true,
        headers: { Authorization: authPayloads.knownAgentBypass }
      });

      expectDenied(res);
    });
  });

  describe('Query payload handling', function () {
    const searchableEndpoints = [
      '/hardware',
      '/tickets',
      '/suppliers',
      '/reports/licenses',
      '/reports/components',
      '/reports/consumables'
    ];

    for (const endpoint of searchableEndpoints) {
      it(`keeps SQL-like search payloads non-fatal on ${endpoint}`, async function () {
        for (const payload of sqlPayloads) {
          const res = await authedClient.get(endpoint, {
            params: {
              search: payload.value,
              limit: 5,
              offset: 0
            }
          });

          expectNoServerError(res, `${endpoint} search payload "${payload.name}" returned ${res.status}`);
          expect(res.data).to.not.be.a('string');
        }
      });
    }

    const sortableEndpoints = [
      '/hardware',
      '/tickets',
      '/suppliers',
      '/reports/licenses',
      '/reports/components',
      '/reports/consumables'
    ];

    for (const endpoint of sortableEndpoints) {
      it(`fails closed for unsafe sort values on ${endpoint}`, async function () {
        for (const sort of unsafeSortPayloads) {
          const res = await authedClient.get(endpoint, {
            params: {
              sort,
              order: 'asc',
              limit: 5,
              offset: 0
            }
          });

          expectNoServerError(res, `${endpoint} sort payload "${sort}" returned ${res.status}`);
          expect(res.data?.success).to.not.equal(false);
        }
      });
    }
  });

  describe('Response exposure', function () {
    it('does not expose password hashes from the users list', async function () {
      const res = await authedClient.get('/users', {
        params: { limit: 5, offset: 0 }
      });

      expect(res.status).to.equal(200);
      expect(res.data.rows).to.be.an('array');
      for (const row of res.data.rows) {
        expect(row).to.not.have.property('password');
      }
    });

    it('does not include stack traces in ordinary not-found API errors', async function () {
      const res = await authedClient.get('/hardware/999999999');
      const bodyText = JSON.stringify(res.data);

      expectNoServerError(res, `/hardware/999999999 returned ${res.status}`);
      expect(bodyText).to.not.match(/stack|at\s+\w+\s+\(/i);
    });
  });

  describe('High-risk public endpoints', function () {
    it('agent telemetry import should require a dedicated secret before accepting POST bodies', async function () {
      const res = await axios.post(`${apiUrl}/hardware/agent-import`, {
        hostname: 'security-probe-host',
        serial: `SECURITY-PROBE-${Date.now()}`
      }, {
        validateStatus: () => true
      });

      expectDenied(res);
    });
  });
});

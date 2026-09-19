const { expect } = require('chai');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectNoServerError
} = require('../../helpers/security_helper');

describe('Previously Failing API Endpoint Regression Checks', function () {
  const endpoints = [
    '/customFieldsets/selectList',
    '/dashboard/chart/tickets',
    '/kits/models',
    '/licenses/selectList',
    '/maintenances/selectList',
    '/severity/selectList',
    '/workstatus'
  ];

  let client;

  before(async function () {
    const apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  for (const endpoint of endpoints) {
    it(`returns without server error for GET ${endpoint}`, async function () {
      let res;
      try {
        res = await client.get(endpoint, {
          params: {
            limit: 5,
            offset: 0,
            page: 1
          }
        });
      } catch (err) {
        throw new Error(`GET ${endpoint} did not return before the API timeout: ${err.message}`);
      }

      expectNoServerError(res, `GET ${endpoint} returned ${res.status}`);
      expect([401, 403], `${endpoint} unexpectedly denied authenticated access`).to.not.include(res.status);
    });
  }
});

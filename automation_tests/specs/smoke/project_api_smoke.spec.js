const { expect } = require('chai');
const axios = require('axios');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectDenied,
  expectNoServerError
} = require('../../helpers/security_helper');
const {
  discoverApiEndpoints,
  discoverMountedRouteFiles,
  materializePath
} = require('../../helpers/project_inventory');

describe('Whole Project API Smoke Coverage', function () {
  const endpoints = discoverApiEndpoints();
  const mountedModules = discoverMountedRouteFiles();
  const protectedGetEndpoints = endpoints.filter((endpoint) => endpoint.method === 'GET' && endpoint.auth);

  let apiUrl;
  let client;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  it('discovers the current backend modules from Express mounts', function () {
    const mountedPaths = mountedModules.map((mount) => mount.mountPath);

    expect(mountedModules.length).to.be.greaterThan(20);
    for (const requiredMount of [
      '/api/v1/users',
      '/api/v1/dashboard',
      '/api/v1/hardware',
      '/api/v1/accessories',
      '/api/v1/components',
      '/api/v1/consumables',
      '/api/v1/licenses',
      '/api/v1/tickets',
      '/api/v1/reports',
      '/api/v1/admin',
      '/api/v1/companies',
      '/api/v1/suppliers',
      '/api/v1/workstatus',
      '/api/v1/shorturl'
    ]) {
      expect(mountedPaths).to.include(requiredMount);
    }
  });

  it('discovers route handlers for the current backend API surface', function () {
    expect(endpoints.length).to.be.greaterThan(100);

    for (const endpoint of endpoints) {
      expect(endpoint.method).to.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)$/);
      expect(endpoint.path).to.match(/^\//);
      expect(endpoint.module).to.be.a('string').and.not.be.empty;
      expect(endpoint.category).to.be.a('string').and.not.be.empty;
    }
  });

  it('keeps public login behavior stable', async function () {
    const res = await axios.post(`${apiUrl}/users/login`, {
      email: `smoke-${Date.now()}@example.test`,
      password: 'wrong-password'
    }, {
      validateStatus: () => true
    });

    expectNoServerError(res, `/users/login returned ${res.status}`);
    expect(res.data?.success).to.not.equal(true);
    expect(res.data?.accessToken).to.equal(undefined);
  });

  for (const endpoint of protectedGetEndpoints) {
    it(`allows authenticated GET ${endpoint.path}`, async function () {
      let res;
      try {
        res = await client.get(materializePath(endpoint.path), {
          params: {
            limit: 5,
            offset: 0,
            page: 1
          }
        });
      } catch (err) {
        throw new Error(`${endpoint.method} ${endpoint.path} did not return before the API timeout: ${err.message}`);
      }

      expectNoServerError(res, `${endpoint.method} ${endpoint.path} returned ${res.status}`);
      expect([401, 403], `${endpoint.path} unexpectedly denied authenticated access`).to.not.include(res.status);
    });
  }

  for (const endpoint of protectedGetEndpoints.filter((_, index) => index % 4 === 0)) {
    it(`blocks anonymous GET ${endpoint.path}`, async function () {
      const res = await axios.get(`${apiUrl}${materializePath(endpoint.path)}`, {
        validateStatus: () => true,
        params: {
          limit: 1,
          offset: 0,
          page: 1
        }
      });

      expectDenied(res);
    });
  }
});

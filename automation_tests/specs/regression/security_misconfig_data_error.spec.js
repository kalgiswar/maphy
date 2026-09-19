const { expect } = require('chai');
const axios = require('axios');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectNoServerError,
  hasSensitiveKey
} = require('../../helpers/security_helper');

describe('Security Misconfiguration, Data Exposure, and Error Handling Tests', function () {
  let apiUrl;
  let client;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  it('does not expose framework fingerprint headers', async function () {
    const res = await client.get('/dashboard');
    expect(res.headers['x-powered-by']).to.equal(undefined);
  });

  it('sends baseline browser/security headers from API responses', async function () {
    const res = await client.get('/dashboard');

    expect(res.headers).to.have.property('x-content-type-options');
    expect(res.headers).to.have.property('x-frame-options');
  });

  it('does not allow overly permissive CORS for arbitrary origins', async function () {
    const res = await axios.options(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: {
        Origin: 'https://evil.example.test',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const allowOrigin = res.headers['access-control-allow-origin'];
    expect(allowOrigin).to.not.equal('*');
    expect(allowOrigin).to.not.equal('https://evil.example.test');
  });

  it('limits methods exposed by OPTIONS on protected API endpoints', async function () {
    const res = await axios.options(`${apiUrl}/users`, { validateStatus: () => true });
    const allowed = `${res.headers.allow || res.headers['access-control-allow-methods'] || ''}`;

    expectNoServerError(res, `OPTIONS /users returned ${res.status}`);
    expect(allowed).to.not.match(/TRACE|CONNECT/i);
  });

  it('does not expose sensitive fields in representative list responses', async function () {
    const endpoints = ['/users', '/hardware', '/tickets', '/settings'];

    for (const endpoint of endpoints) {
      const res = await client.get(endpoint, { params: { limit: 3, offset: 0 } });
      if (res.status === 404) {
        continue;
      }

      expectNoServerError(res, `${endpoint} returned ${res.status}`);
      expect(hasSensitiveKey(res.data)).to.equal(false);
    }
  });

  it('does not leak SQL or stack trace details on malformed resource ids', async function () {
    const res = await client.get('/hardware/%27%20OR%201%3D1');
    const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

    expectNoServerError(res, `malformed id returned ${res.status}`);
    expect(body).to.not.match(/sql|syntax|mysql|stack|trace|ER_PARSE_ERROR|SELECT|FROM/i);
  });

  it('does not expose debug or admin-only endpoints publicly', async function () {
    const rootUrl = apiUrl.replace(/\/api\/v\d+$/, '');
    const debugPaths = ['/debug', '/metrics', '/admin', '/swagger.json', '/api-docs'];

    for (const debugPath of debugPaths) {
      const res = await axios.get(`${rootUrl}${debugPath}`, { validateStatus: () => true });
      expect([401, 403, 404], `${debugPath} returned ${res.status}`).to.include(res.status);
    }
  });
});

const { expect } = require('chai');
const axios = require('axios');
const {
  resolveApiBaseUrl,
  loginForToken,
  loginWithCredentials,
  createSecurityClient,
  expectDenied,
  expectDeniedOrFailure
} = require('../../helpers/security_helper');

describe('Authorization, BOLA, and Function-Level Access Tests', function () {
  let apiUrl;
  let adminToken;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    adminToken = await loginForToken(apiUrl);
  });

  it('blocks anonymous destructive methods on protected resources', async function () {
    const destructiveRequests = [
      axios.delete(`${apiUrl}/users/1`, { validateStatus: () => true }),
      axios.delete(`${apiUrl}/hardware/1`, { validateStatus: () => true }),
      axios.put(`${apiUrl}/branding`, { app_name: 'security-probe' }, { validateStatus: () => true }),
      axios.post(`${apiUrl}/shorturl`, { url: 'https://example.com' }, { validateStatus: () => true })
    ];

    const responses = await Promise.all(destructiveRequests);
    for (const res of responses) {
      expectDenied(res);
    }
  });

  it('blocks hard-coded agent bearer token from protected admin functions', async function () {
    const res = await axios.delete(`${apiUrl}/users/1`, {
      validateStatus: () => true,
      headers: { Authorization: 'Bearer MAPHY_AGENT_SECURE_TOKEN_XYZ123' }
    });

    expectDeniedOrFailure(res);
  });

  it('tests broken function-level authorization with a regular user when configured', async function () {
    if (!process.env.TEST_REGULAR_USER_EMAIL || !process.env.TEST_REGULAR_USER_PASSWORD) {
      this.skip();
    }

    const loginRes = await loginWithCredentials(
      process.env.TEST_REGULAR_USER_EMAIL,
      process.env.TEST_REGULAR_USER_PASSWORD,
      apiUrl
    );
    expect(loginRes.data.success).to.equal(true);

    const regularClient = createSecurityClient(apiUrl, loginRes.data.accessToken);
    const res = await regularClient.delete(`/users/${process.env.TEST_ADMIN_USER_ID || '1'}`);

    expectDeniedOrFailure(res);
  });

  it('tests BOLA/IDOR with two configured resource ids', async function () {
    if (!process.env.TEST_REGULAR_USER_EMAIL || !process.env.TEST_REGULAR_USER_PASSWORD || !process.env.TEST_BOLA_OTHER_RESOURCE) {
      this.skip();
    }

    const loginRes = await loginWithCredentials(
      process.env.TEST_REGULAR_USER_EMAIL,
      process.env.TEST_REGULAR_USER_PASSWORD,
      apiUrl
    );
    expect(loginRes.data.success).to.equal(true);

    const regularClient = createSecurityClient(apiUrl, loginRes.data.accessToken);
    const res = await regularClient.get(process.env.TEST_BOLA_OTHER_RESOURCE);

    expectDeniedOrFailure(res);
  });

  it('does not expose admin-only permission metadata to authenticated list calls', async function () {
    const adminClient = createSecurityClient(apiUrl, adminToken);
    const res = await adminClient.get('/users', { params: { limit: 3, offset: 0 } });
    const body = JSON.stringify(res.data);

    expect(res.status).to.equal(200);
    expect(body).to.not.match(/"password"\s*:/i);
  });
});

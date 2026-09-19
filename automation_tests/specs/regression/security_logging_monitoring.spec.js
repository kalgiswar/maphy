const { expect } = require('chai');
const {
  resolveApiBaseUrl,
  loginForToken,
  loginWithCredentials,
  createSecurityClient,
  isEnabled
} = require('../../helpers/security_helper');

describe('Logging and Monitoring Validation Tests', function () {
  let apiUrl;
  let client;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  it('records security-relevant failed login attempts when audit validation is enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_LOGGING_TESTS')) {
      this.skip();
    }

    await loginWithCredentials(`audit-probe-${Date.now()}@example.test`, 'wrong-password', apiUrl);
    const res = await client.get('/reports/activity', {
      params: {
        search: 'login',
        limit: 20,
        offset: 0
      }
    });
    const body = JSON.stringify(res.data).toLowerCase();

    expect(res.status).to.equal(200);
    expect(body).to.include('login');
  });

  it('records administrative mutation attempts when audit validation is enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_LOGGING_TESTS') || !isEnabled('SECURITY_ENABLE_MUTATION_TESTS')) {
      this.skip();
    }

    await client.post('/shorturl', { url: 'https://example.com/security-audit-probe' });
    const res = await client.get('/reports/activity', {
      params: {
        search: 'short',
        limit: 20,
        offset: 0
      }
    });
    const body = JSON.stringify(res.data).toLowerCase();

    expect(res.status).to.equal(200);
    expect(body).to.match(/short|create|url/);
  });
});

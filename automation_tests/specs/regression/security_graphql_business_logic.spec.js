const { expect } = require('chai');
const axios = require('axios');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectDeniedOrFailure,
  isEnabled
} = require('../../helpers/security_helper');

describe('GraphQL and Business Logic Security Tests', function () {
  let apiUrl;
  let client;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    client = createSecurityClient(apiUrl, token);
  });

  it('does not expose GraphQL introspection when GraphQL is not part of scope', async function () {
    const rootUrl = apiUrl.replace(/\/api\/v\d+$/, '');
    const query = { query: '{ __schema { types { name } } }' };
    const res = await axios.post(`${rootUrl}/graphql`, query, { validateStatus: () => true });

    expect([401, 403, 404]).to.include(res.status);
  });

  it('does not accept negative quantities or prices in checkout/business workflows when enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_MUTATION_TESTS') || !process.env.TEST_COMPONENT_ID) {
      this.skip();
    }

    const res = await client.post(`/components/${process.env.TEST_COMPONENT_ID}/checkout`, {
      assigned_to: process.env.TEST_USER_ID || 1,
      qty: -10,
      purchase_cost: -999
    });

    expectDeniedOrFailure(res);
  });

  it('does not allow workflow actions out of sequence when enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_MUTATION_TESTS') || !process.env.TEST_ASSET_ID) {
      this.skip();
    }

    const res = await client.post(`/hardware/${process.env.TEST_ASSET_ID}/checkin`, {
      status_id: 1,
      assigned_location: 1,
      note: 'Out-of-sequence checkin probe'
    });

    expectDeniedOrFailure(res);
  });
});

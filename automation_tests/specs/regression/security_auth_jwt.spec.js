const { expect } = require('chai');
const axios = require('axios');
const config = require('../../test_config');
const { sqlPayloads } = require('../../security_payloads');
const {
  resolveApiBaseUrl,
  loginForToken,
  loginWithCredentials,
  expectDenied,
  expectDeniedOrFailure,
  isEnabled
} = require('../../helpers/security_helper');
const {
  decodeJwt,
  createAlgNoneToken,
  createExpiredToken,
  tamperToken
} = require('../../helpers/jwt_helper');

describe('Authentication, Session, and JWT Security Tests', function () {
  let apiUrl;
  let validToken;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    validToken = await loginForToken(apiUrl);
  });

  it('rejects weak/default credential guesses without issuing tokens', async function () {
    const guesses = [
      { email: 'admin@example.com', password: 'admin' },
      { email: 'admin@maphy.com', password: 'password' },
      { email: config.credentials.username, password: 'password' },
      { email: config.credentials.username, password: 'admin123' }
    ];

    for (const guess of guesses) {
      const res = await loginWithCredentials(guess.email, guess.password, apiUrl);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.not.equal(true);
      expect(res.data.accessToken).to.not.be.a('string');
    }
  });

  it('rejects injection-style credentials without issuing tokens', async function () {
    for (const payload of sqlPayloads) {
      const res = await loginWithCredentials(payload.value, payload.value, apiUrl);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.not.equal(true);
      expect(res.data.accessToken).to.not.be.a('string');
    }
  });

  it('issues JWTs with an expiration claim', function () {
    const decoded = decodeJwt(validToken);

    expect(decoded.header.alg).to.equal('HS256');
    expect(decoded.payload.exp).to.be.a('number');
    expect(decoded.payload.exp).to.be.greaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects tampered JWT payloads', async function () {
    const res = await axios.get(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${tamperToken(validToken)}` }
    });

    expectDenied(res);
  });

  it('rejects unsigned alg:none JWTs', async function () {
    const decoded = decodeJwt(validToken);
    const unsigned = createAlgNoneToken(decoded.payload);
    const res = await axios.get(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${unsigned}` }
    });

    expectDenied(res);
  });

  it('rejects expired JWTs', async function () {
    const decoded = decodeJwt(validToken);
    const expired = createExpiredToken(decoded.payload, process.env.TEST_JWT_SECRET || 'maphy_jwt_secret_key_2026_xyz');
    const res = await axios.get(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${expired}` }
    });

    expectDenied(res);
  });

  it('does not accept tokens without Bearer scheme', async function () {
    const res = await axios.get(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: { Authorization: validToken }
    });

    expectDeniedOrFailure(res);
  });

  it('has brute-force/rate-limit protection on login when enabled', async function () {
    if (!isEnabled('SECURITY_ENABLE_RATE_LIMIT_TESTS')) {
      this.skip();
    }

    const attempts = parseInt(process.env.SECURITY_RATE_LIMIT_ATTEMPTS || '30', 10);
    let saw429 = false;

    for (let i = 0; i < attempts; i++) {
      const res = await loginWithCredentials(`rate-${Date.now()}-${i}@example.test`, 'wrong-password', apiUrl);
      if (res.status === 429) {
        saw429 = true;
        break;
      }
    }

    expect(saw429).to.equal(true);
  });

  it('token revocation is verified when a logout/revocation endpoint is configured', async function () {
    if (!process.env.TEST_LOGOUT_ENDPOINT) {
      this.skip();
    }

    const logoutRes = await axios.post(`${apiUrl}${process.env.TEST_LOGOUT_ENDPOINT}`, {}, {
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${validToken}` }
    });
    expect(logoutRes.status).to.be.lessThan(500);

    const reuseRes = await axios.get(`${apiUrl}/dashboard`, {
      validateStatus: () => true,
      headers: { Authorization: `Bearer ${validToken}` }
    });
    expectDenied(reuseRes);
  });
});

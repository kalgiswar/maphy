const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const config = require('../test_config');

axios.defaults.timeout = config.apiTimeout;

function resolveApiBaseUrl() {
  let apiUrl = process.env.TEST_API_URL || 'http://localhost:10000/api/v1';
  const envPath = path.join(__dirname, '../../demo_maphy_client/.env');

  if (!process.env.TEST_API_URL && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/REACT_APP_API_URL=(.+)/);
    if (match && match[1]) {
      apiUrl = match[1].trim();
    }
  }

  return apiUrl.replace(/\/+$/, '');
}

async function loginForToken(apiUrl = resolveApiBaseUrl()) {
  const res = await loginWithCredentials(config.credentials.username, config.credentials.password, apiUrl);

  expect(res.status).to.equal(200);
  expect(res.data.success).to.equal(true);
  expect(res.data.accessToken).to.be.a('string').and.not.be.empty;

  return res.data.accessToken;
}

async function loginWithCredentials(email, password, apiUrl = resolveApiBaseUrl()) {
  return axios.post(`${apiUrl}/users/login`, {
    email,
    password
  }, {
    timeout: config.apiTimeout,
    validateStatus: () => true
  });
}

function createSecurityClient(apiUrl = resolveApiBaseUrl(), token) {
  return axios.create({
    baseURL: apiUrl,
    timeout: config.apiTimeout,
    validateStatus: () => true,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

function expectDenied(res) {
  expect([401, 403]).to.include(res.status);
  expect(res.data?.success).to.not.equal(true);
}

function expectDeniedOrFailure(res) {
  if ([401, 403].includes(res.status)) {
    expect(res.data?.success).to.not.equal(true);
    return;
  }

  expect(res.status).to.be.lessThan(500);
  expect(res.data?.success).to.not.equal(true);
}

function expectNoServerError(res, message) {
  expect(res.status, message).to.be.lessThan(500);
}

function hasSensitiveKey(value, keyPattern = /password|passwordHash|token|secret|private|credential/i) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSensitiveKey(item, keyPattern));
  }

  return Object.keys(value).some((key) => keyPattern.test(key) || hasSensitiveKey(value[key], keyPattern));
}

function isEnabled(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function installBrowserProbe(driver) {
  await driver.executeScript(`
    window.__maphySecurityProbe = '';
    window.__maphySecurityDialogs = [];
    window.alert = (message) => window.__maphySecurityDialogs.push(String(message));
    window.confirm = (message) => {
      window.__maphySecurityDialogs.push(String(message));
      return false;
    };
    window.prompt = (message) => {
      window.__maphySecurityDialogs.push(String(message));
      return null;
    };
  `);
}

async function expectNoBrowserExecution(driver) {
  const result = await driver.executeScript(`
    return {
      probe: window.__maphySecurityProbe || '',
      dialogs: window.__maphySecurityDialogs || []
    };
  `);

  expect(result.probe).to.equal('');
  expect(result.dialogs).to.deep.equal([]);
}

module.exports = {
  resolveApiBaseUrl,
  loginForToken,
  loginWithCredentials,
  createSecurityClient,
  expectDenied,
  expectDeniedOrFailure,
  expectNoServerError,
  hasSensitiveKey,
  isEnabled,
  getRequiredEnv,
  installBrowserProbe,
  expectNoBrowserExecution
};

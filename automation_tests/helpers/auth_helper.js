/**
 * auth_helper.js
 * Multi-role login and API client factory for RBAC testing.
 * Supports: superAdmin, admin, manager
 */
const axios = require('axios');
const { resolveApiBaseUrl, loginWithCredentials, createSecurityClient } = require('./security_helper');

const ROLES = {
  superAdmin: {
    email: process.env.TEST_SUPER_ADMIN_EMAIL || 'demo.maphy@gmail.com',
    password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'demo@123',
    label: 'Super Admin'
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'kishoresanthosh0342@gmail.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Kishore@12345',
    label: 'Admin'
  },
  manager: {
    email: process.env.TEST_MANAGER_EMAIL || 'cyandumbo1822@gmail.com',
    password: process.env.TEST_MANAGER_PASSWORD || 'Kishore@12345',
    label: 'Manager'
  }
};

// Token cache to avoid repeated logins within the same test run
const _tokenCache = {};

/**
 * Login as a given role and return { apiUrl, token, client, user }
 * @param {string} role - 'superAdmin' | 'admin' | 'manager'
 * @param {boolean} [forceRefresh=false] - Skip cache and login fresh
 */
async function loginAs(role, forceRefresh = false) {
  const creds = ROLES[role];
  if (!creds) {
    throw new Error(`Unknown role: "${role}". Valid roles: ${Object.keys(ROLES).join(', ')}`);
  }

  const apiUrl = resolveApiBaseUrl();
  const cacheKey = `${role}:${apiUrl}`;

  if (!forceRefresh && _tokenCache[cacheKey]) {
    const token = _tokenCache[cacheKey];
    return {
      apiUrl,
      token,
      client: createSecurityClient(apiUrl, token),
      role,
      label: creds.label,
      email: creds.email
    };
  }

  const res = await loginWithCredentials(creds.email, creds.password, apiUrl);
  if (res.status !== 200 || !res.data?.accessToken) {
    throw new Error(
      `Login failed for role "${role}" (${creds.email}): HTTP ${res.status} — ${JSON.stringify(res.data)}`
    );
  }

  const token = res.data.accessToken;
  _tokenCache[cacheKey] = token;

  return {
    apiUrl,
    token,
    client: createSecurityClient(apiUrl, token),
    role,
    label: creds.label,
    email: creds.email
  };
}

/**
 * Login with raw credentials (not a role alias).
 */
async function loginWithRaw(email, password) {
  const apiUrl = resolveApiBaseUrl();
  const res = await loginWithCredentials(email, password, apiUrl);
  return { apiUrl, res };
}

/**
 * Clear token cache (e.g., after a user is deleted/deactivated in lifecycle tests)
 */
function clearTokenCache(role) {
  const apiUrl = resolveApiBaseUrl();
  const cacheKey = role ? `${role}:${apiUrl}` : null;
  if (cacheKey) {
    delete _tokenCache[cacheKey];
  } else {
    Object.keys(_tokenCache).forEach(k => delete _tokenCache[k]);
  }
}

/**
 * Decode JWT payload (no verification, just inspection)
 */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  ROLES,
  loginAs,
  loginWithRaw,
  clearTokenCache,
  decodeJwt
};

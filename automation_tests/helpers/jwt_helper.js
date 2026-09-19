const crypto = require('crypto');

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function decodeJwt(token) {
  const [header, payload, signature] = token.split('.');
  return {
    header: JSON.parse(decodeBase64Url(header)),
    payload: JSON.parse(decodeBase64Url(payload)),
    signature
  };
}

function signHs256(header, payload, secret) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

function createAlgNoneToken(payload) {
  return `${base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${base64Url(JSON.stringify(payload))}.`;
}

function createExpiredToken(payload, secret = 'maphy_jwt_secret_key_2026_xyz') {
  const expiredPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600
  };

  return signHs256({ alg: 'HS256', typ: 'JWT' }, expiredPayload, secret);
}

function tamperToken(token) {
  const decoded = decodeJwt(token);
  const tamperedPayload = {
    ...decoded.payload,
    email: `tampered-${Date.now()}@example.test`,
    userId: 999999999
  };
  const encodedHeader = base64Url(JSON.stringify(decoded.header));
  const encodedPayload = base64Url(JSON.stringify(tamperedPayload));
  return `${encodedHeader}.${encodedPayload}.${decoded.signature}`;
}

module.exports = {
  decodeJwt,
  createAlgNoneToken,
  createExpiredToken,
  tamperToken,
  signHs256
};

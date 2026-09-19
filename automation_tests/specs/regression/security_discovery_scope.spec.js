const { expect } = require('chai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { endpoints } = require('../../helpers/endpoint_inventory');
const {
  resolveApiBaseUrl,
  loginForToken,
  createSecurityClient,
  expectNoServerError
} = require('../../helpers/security_helper');
const {
  writeEndpointInventoryReport,
  writeChecklistReport
} = require('../../helpers/report_helper');

describe('Scope Definition, API Discovery, and Reconnaissance', function () {
  let apiUrl;
  let authedClient;

  before(async function () {
    apiUrl = resolveApiBaseUrl();
    const token = await loginForToken(apiUrl);
    authedClient = createSecurityClient(apiUrl, token);
  });

  it('documents authorization before running active pentest checks', function () {
    if (process.env.SECURITY_AUTHORIZED !== 'true') {
      this.skip();
    }

    expect(process.env.SECURITY_AUTHORIZED).to.equal('true');
  });

  it('identifies this project API surface as REST /api/v1', function () {
    const parsed = new URL(apiUrl);

    expect(parsed.pathname).to.match(/\/api\/v\d+$/);
    expect(endpoints.every((endpoint) => endpoint.apiType === 'REST')).to.equal(true);
  });

  it('maintains an endpoint inventory with methods, paths, auth, params, and categories', function () {
    expect(endpoints.length).to.be.greaterThan(30);

    for (const endpoint of endpoints) {
      expect(endpoint.method).to.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS)$/);
      expect(endpoint.path).to.match(/^\//);
      expect(endpoint).to.have.property('auth');
      expect(endpoint.params).to.be.an('array');
      expect(endpoint.category).to.be.a('string').and.not.be.empty;
    }
  });

  it('writes Markdown endpoint inventory and checklist reports', function () {
    const inventoryPath = writeEndpointInventoryReport();
    const checklistPath = writeChecklistReport();

    expect(fs.existsSync(inventoryPath)).to.equal(true);
    expect(fs.existsSync(checklistPath)).to.equal(true);
  });

  it('detects likely hidden REST endpoints referenced in frontend source', function () {
    const sourceRoot = path.join(__dirname, '../../../demo_maphy_client/src');
    const discovered = new Set();

    function scanFile(filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/['"`]\/?[A-Za-z0-9_/-]+(?:\?[A-Za-z0-9_=&-]+)?['"`]/g) || [];
      for (const match of matches) {
        const value = match.slice(1, -1);
        if (/^(\/)?(api\/v\d+\/)?[A-Za-z0-9_-]+/.test(value) && !value.includes(' ')) {
          discovered.add(value);
        }
      }
    }

    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith('.js')) {
          scanFile(fullPath);
        }
      }
    }

    walk(sourceRoot);
    expect(discovered.size).to.be.greaterThan(10);
  });

  it('health endpoint is reachable and does not expose secrets', async function () {
    const rootUrl = apiUrl.replace(/\/api\/v\d+$/, '');
    const res = await axios.get(`${rootUrl}/health`, { validateStatus: () => true });
    const body = JSON.stringify(res.data);

    expectNoServerError(res, `/health returned ${res.status}`);
    expect(body).to.not.match(/password|secret|token|private/i);
  });

  it('samples documented GET endpoints successfully with authentication', async function () {
    const sample = ['/dashboard', '/hardware', '/tickets', '/users', '/reports/activity'];

    for (const endpoint of sample) {
      const res = await authedClient.get(endpoint, { params: { limit: 1, offset: 0 } });
      expectNoServerError(res, `${endpoint} returned ${res.status}`);
    }
  });
});

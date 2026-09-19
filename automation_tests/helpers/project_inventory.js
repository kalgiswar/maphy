const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const serverRoot = path.join(repoRoot, 'demo_maphy_server');
const clientRoot = path.join(repoRoot, 'demo_maphy_client');

const methodPattern = /router\.(get|post|put|delete|patch|options)\(\s*['"`]([^'"`]+)['"`]/gi;

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
}

function normalizeRoutePath(routePath) {
  if (!routePath || routePath === '/') {
    return '/';
  }

  return `/${routePath}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function joinRoutes(basePath, childPath) {
  const normalizedBase = normalizeRoutePath(basePath);
  const normalizedChild = normalizeRoutePath(childPath);

  if (normalizedChild === '/') {
    return normalizedBase;
  }

  return `${normalizedBase}${normalizedChild}`.replace(/\/+/g, '/');
}

function resolveRouteFile(requirePath) {
  const withoutDot = requirePath.replace(/^\.\//, '');
  const absolute = path.resolve(serverRoot, withoutDot);
  const candidates = [
    absolute,
    `${absolute}.js`,
    path.join(absolute, 'index.js')
  ];

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

function categoryForPath(apiPath) {
  const firstSegment = apiPath.split('/').filter(Boolean)[0] || 'root';
  const categoryMap = {
    accessories: 'Inventory',
    components: 'Inventory',
    consumables: 'Inventory',
    licenses: 'Inventory',
    kits: 'Inventory',
    hardware: 'Assets',
    maintenances: 'Assets',
    dashboard: 'Dashboard',
    reports: 'Reports',
    tickets: 'Tickets',
    users: 'Users',
    companies: 'Settings',
    models: 'Settings',
    manufacturers: 'Settings',
    statuslabels: 'Settings',
    categories: 'Settings',
    depreciations: 'Settings',
    locations: 'Settings',
    departments: 'Settings',
    suppliers: 'Settings',
    customfields: 'Settings',
    customFieldsets: 'Settings',
    customFieldCustomFieldsets: 'Settings',
    admin: 'Admin',
    groups: 'Admin',
    talentGroups: 'Admin',
    ticketIssues: 'Admin',
    severity: 'Admin',
    firms: 'Admin',
    labels: 'Admin',
    licenseNotifications: 'Admin',
    register: 'Registration',
    contactus: 'Public',
    audit: 'Audit',
    scrapSale: 'Scrap Sale',
    workstatus: 'Work Status',
    shorturl: 'Short URL'
  };

  return categoryMap[firstSegment] || firstSegment;
}

function isPublicApiPath(apiPath) {
  return [
    /^\/users\/login$/i,
    /^\/users\/generateotp$/i,
    /^\/users\/password\/update$/i,
    /^\/register\/firms$/i,
    /^\/contactus$/i
  ].some((pattern) => pattern.test(apiPath));
}

function extractParams(apiPath) {
  return [...apiPath.matchAll(/:([A-Za-z0-9_]+)/g)].map((match) => match[1]);
}

function discoverMountedRouteFiles() {
  const appPath = path.join(serverRoot, 'app.js');
  const source = stripComments(fs.readFileSync(appPath, 'utf8'));
  const requireAliases = new Map();
  const aliasPattern = /(?:var|const|let)\s+(\w+)\s*=\s*require\(['"](.+?)['"]\)/g;
  const mounts = [];

  let aliasMatch;
  while ((aliasMatch = aliasPattern.exec(source)) !== null) {
    requireAliases.set(aliasMatch[1], aliasMatch[2]);
  }

  const mountPattern = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*(?:require\(['"](.+?)['"]\)|(\w+))/g;
  let mountMatch;
  while ((mountMatch = mountPattern.exec(source)) !== null) {
    const mountPath = mountMatch[1];
    if (!mountPath.startsWith('/api/v1')) {
      continue;
    }

    const requirePath = mountMatch[2] || requireAliases.get(mountMatch[3]);
    if (!requirePath) {
      continue;
    }

    const routeFile = resolveRouteFile(requirePath);
    if (!routeFile) {
      continue;
    }

    mounts.push({
      mountPath,
      routeFile,
      module: path.relative(serverRoot, routeFile).replace(/\\/g, '/')
    });
  }

  return mounts;
}

function discoverApiEndpoints() {
  const endpoints = [];
  const seen = new Set();

  for (const mount of discoverMountedRouteFiles()) {
    const mountWithoutVersion = normalizeRoutePath(mount.mountPath.replace(/^\/api\/v1\/?/, '/'));
    const source = stripComments(fs.readFileSync(mount.routeFile, 'utf8'));
    let routeMatch;

    methodPattern.lastIndex = 0;
    while ((routeMatch = methodPattern.exec(source)) !== null) {
      const method = routeMatch[1].toUpperCase();
      const apiPath = joinRoutes(mountWithoutVersion, routeMatch[2]);
      const key = `${method} ${apiPath}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      endpoints.push({
        method,
        path: apiPath,
        auth: !isPublicApiPath(apiPath),
        apiType: 'REST',
        category: categoryForPath(apiPath),
        params: extractParams(apiPath),
        body: [],
        module: mount.module
      });
    }
  }

  return endpoints.sort((a, b) => `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`));
}

function materializePath(routePath, fallbackId = '1') {
  const paramValues = {
    assignedPivotId: fallbackId,
    assigned_pivot_id: fallbackId,
    categoryId: fallbackId,
    code: 'notfound',
    id: fallbackId,
    name: 'smoke',
    seatId: fallbackId,
    serialno: 'smoke-serial',
    tagId: 'smoke-tag',
    talentGroupId: fallbackId,
    type: 'Asset',
    urlId: 'notfound'
  };

  return routePath.replace(/:([A-Za-z0-9_]+)/g, (_match, name) => paramValues[name] || fallbackId);
}

function discoverFrontendPages() {
  const appPath = path.join(clientRoot, 'src/App.js');
  const source = stripComments(fs.readFileSync(appPath, 'utf8'));
  const matches = [...source.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)];
  const publicPages = new Set(['/login', '/qrpage', '/assetQR']);
  const seen = new Set(['/']);
  const pages = [{
    path: '/',
    materializedPath: '/',
    auth: true,
    source: 'src/App.js'
  }];

  for (const match of matches) {
    const rawPath = match[1];
    const normalized = normalizeRoutePath(rawPath);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    pages.push({
      path: normalized,
      materializedPath: materializePath(normalized),
      auth: !publicPages.has(normalized),
      source: 'src/App.js'
    });
  }

  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = {
  repoRoot,
  serverRoot,
  clientRoot,
  discoverApiEndpoints,
  discoverFrontendPages,
  discoverMountedRouteFiles,
  materializePath
};

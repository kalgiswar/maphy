const marker = `MAPHY_SECURITY_${Date.now()}`;

const xssPayloads = [
  {
    name: 'script-tag',
    value: `<script>window.__maphySecurityProbe='${marker}'</script>`
  },
  {
    name: 'image-error',
    value: `<img src=x onerror="window.__maphySecurityProbe='${marker}'">`
  },
  {
    name: 'svg-load',
    value: `<svg onload="window.__maphySecurityProbe='${marker}'"></svg>`
  },
  {
    name: 'attribute-breakout',
    value: `" autofocus onfocus="window.__maphySecurityProbe='${marker}'`
  }
];

const sqlPayloads = [
  {
    name: 'boolean-condition',
    value: `' OR '1'='1`
  },
  {
    name: 'comment-breakout',
    value: `admin' --`
  },
  {
    name: 'union-shape-probe',
    value: `' UNION SELECT NULL,NULL,NULL --`
  },
  {
    name: 'time-delay-probe',
    value: `' OR SLEEP(1) --`
  }
];

const noSqlPayloads = [
  {
    name: 'not-equal-object',
    value: { $ne: null }
  },
  {
    name: 'regex-all-object',
    value: { $regex: '.*' }
  }
];

const commandPayloads = [
  {
    name: 'unix-id',
    value: '; id'
  },
  {
    name: 'windows-whoami',
    value: '& whoami'
  },
  {
    name: 'subshell',
    value: '$(whoami)'
  }
];

const xmlPayloads = [
  {
    name: 'xxe-file-probe',
    value: `<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>`
  },
  {
    name: 'entity-expansion-probe',
    value: `<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol1 "&lol;&lol;">]><root>&lol1;</root>`
  }
];

const unsafeSortPayloads = [
  'not_a_real_column',
  'id DESC',
  'id;DROP TABLE users',
  'extractvalue(1,concat(0x7e,user()))',
  '../id'
];

const authPayloads = {
  missing: null,
  malformed: 'Bearer not-a-valid-jwt',
  sqlLikeBearer: `Bearer ' OR '1'='1`,
  knownAgentBypass: 'Bearer MAPHY_AGENT_SECURE_TOKEN_XYZ123'
};

const massAssignmentFields = {
  role: 'admin',
  isAdmin: true,
  permissions: { users: { delete: true, update: true } },
  group_id: 1,
  deleted_at: null
};

module.exports = {
  marker,
  xssPayloads,
  sqlPayloads,
  noSqlPayloads,
  commandPayloads,
  xmlPayloads,
  unsafeSortPayloads,
  authPayloads,
  massAssignmentFields
};

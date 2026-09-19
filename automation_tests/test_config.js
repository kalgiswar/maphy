module.exports = {
  // Target frontend app URL to test
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',

  // Default credentials (used by loginForToken in security_helper — Super Admin)
  credentials: {
    username: process.env.TEST_SUPER_ADMIN_EMAIL || 'demo.maphy@gmail.com',
    password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'demo@123'
  },

  // Role-specific credentials
  roles: {
    superAdmin: {
      email: process.env.TEST_SUPER_ADMIN_EMAIL || 'demo.maphy@gmail.com',
      password: process.env.TEST_SUPER_ADMIN_PASSWORD || 'demo@123'
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'kishoresanthosh0342@gmail.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Kishore@12345'
    },
    manager: {
      email: process.env.TEST_MANAGER_EMAIL || 'cyandumbo1822@gmail.com',
      password: process.env.TEST_MANAGER_PASSWORD || 'Kishore@12345'
    }
  },

  // Selenium webdriver execution config
  headless: process.env.HEADLESS === 'true',

  // Explicit element wait timeout in milliseconds
  timeout: 10000,

  // Axios API request timeout. Keeps broken/hanging endpoints from freezing a suite.
  apiTimeout: parseInt(process.env.TEST_API_TIMEOUT_MS || '15000', 10)
};

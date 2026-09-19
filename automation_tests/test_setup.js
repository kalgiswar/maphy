// test_setup.js – loads environment variables for security tests
const path = require('path');
// Resolve the .env file located at the repository root (one level up from automation_tests)
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

// Optional sanity check – warn if rate‑limit flag is not true
if (process.env.SECURITY_ENABLE_RATE_LIMIT_TESTS !== 'true') {
  console.warn('⚠️  SECURITY_ENABLE_RATE_LIMIT_TESTS is not set to "true" – rate‑limit tests will be skipped');
}

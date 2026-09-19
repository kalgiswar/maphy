# Maphy Security Automation

This folder contains defensive Selenium and API security regression tests for the Maphy application. Run them only against systems you own or have explicit permission to test.

## Quick Commands

```bash
npm run test:security
npm run test:security:api
npm run test:security:ui
npm run test:security:report
npm run test:security:mochawesome
```

The API base URL is resolved in this order:

1. `TEST_API_URL`
2. `demo_maphy_client/.env` `REACT_APP_API_URL`
3. `http://localhost:10000/api/v1`

The UI base URL is resolved from `TEST_BASE_URL` or defaults to `http://localhost:3000`.

Set `SECURITY_AUTHORIZED=true` in approved test runs to document authorization in the scope test.

## Checklist Coverage

| Area | Automation |
|---|---|
| Scope definition | `security_discovery_scope.spec.js` documents authorization flag, API type, base URL, and generated reports |
| API discovery and reconnaissance | Endpoint inventory, frontend route/string scan, API version checks |
| Authentication | Weak/default credential probes, injection login probes, malformed token checks |
| Authorization | Anonymous destructive method checks, agent token boundary checks, optional regular-user BFLA and BOLA tests |
| Input validation | SQL-like, NoSQL-like, command, XML/XXE, and browser XSS probes |
| API parameter manipulation | Invalid ids, unsafe sort/order values, hidden-field/mass-assignment probes |
| Business logic | Optional negative quantity and out-of-sequence workflow checks |
| Rate limiting | Optional login burst test |
| Data exposure | Password/token/secret field checks, stack trace and SQL leakage checks |
| Security misconfiguration | Security headers, CORS, OPTIONS, public debug endpoint checks |
| JWT | Tampered, unsigned `alg:none`, expired, malformed, and no-Bearer token checks |
| GraphQL | GraphQL introspection absence check when GraphQL is not in scope |
| Error handling | Malformed id and not-found response leakage checks |
| Logging/monitoring | Optional audit-log validation |
| Reporting | Mochawesome plus generated Markdown endpoint inventory/checklist reports |

## Optional Environment Variables

Some checks are intentionally skipped unless you provide safe test data.

```bash
SECURITY_AUTHORIZED=true
SECURITY_ENABLE_RATE_LIMIT_TESTS=true
SECURITY_RATE_LIMIT_ATTEMPTS=30
SECURITY_ENABLE_MUTATION_TESTS=true
SECURITY_ENABLE_LOGGING_TESTS=true

TEST_REGULAR_USER_EMAIL=user@example.test
TEST_REGULAR_USER_PASSWORD=password
TEST_ADMIN_USER_ID=1
TEST_BOLA_OTHER_RESOURCE=/users/2
TEST_COMPONENT_ID=1
TEST_ASSET_ID=1
TEST_USER_ID=1
TEST_LOGOUT_ENDPOINT=/users/logout
TEST_JWT_SECRET=maphy_jwt_secret_key_2026_xyz
```

Use mutation and rate-limit tests only against staging/test environments.

## Current Known Findings From Initial Run

The existing API tests found that several endpoints return `500` when `sort` is set to an unknown but syntactically valid column such as `not_a_real_column`.

Affected examples:

- `/hardware`
- `/suppliers`
- `/reports/licenses`
- `/reports/components`
- `/reports/consumables`

Recommended remediation: replace regex-only sort validation with explicit per-endpoint column allowlists and default unknown values to a safe column.

## Notes

- Payloads are intentionally small and non-destructive by default.
- BOLA/BFLA tests require a real lower-privileged account and known cross-user resource IDs.
- Business-logic checks need domain-specific staging records.
- The skipped agent telemetry check documents a high-risk boundary that should be enabled once that endpoint requires a dedicated shared secret or HMAC validation.

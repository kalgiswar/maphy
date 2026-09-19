# Maphy API Pentest Checklist Coverage

Generated: 2026-06-23T12:03:00.632Z

| Checklist Area | Automation Status |
|---|---|
| Scope definition | Documented in SECURITY_TESTING.md; authorization must be confirmed by tester |
| API discovery and reconnaissance | Endpoint inventory helper and discovery tests |
| Authentication testing | Anonymous access, malformed token, failed-login payloads, weak/default credential probes |
| Authorization testing | Anonymous destructive access, agent bypass checks, optional role/BOLA env-driven tests |
| Input validation | SQL-like, NoSQL-like, command, XML, and browser XSS probes |
| Parameter manipulation | Sort, search, id, hidden-field/mass-assignment probes |
| Business logic testing | Optional mutation tests for ticket/resource workflow guards |
| Rate limiting | Optional controlled burst tests with SECURITY_ENABLE_RATE_LIMIT_TESTS=true |
| Data exposure | Password, token, stack trace, and sensitive-key checks |
| Security misconfiguration | Headers, CORS, OPTIONS, debug endpoint checks |
| JWT testing | Tamper, malformed, alg:none, expired-token checks |
| GraphQL testing | GraphQL endpoint absence/introspection checks |
| Error handling | Stack trace and SQL error leakage checks |
| Logging and monitoring | Optional audit-log checks where endpoints expose security events |
| Reporting | Mochawesome plus generated Markdown inventory/checklist reports |

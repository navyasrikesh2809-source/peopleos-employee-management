# Deployment checklist

- [ ] Provision managed PostgreSQL and Redis in private networking.
- [ ] Create separate migration owner and restricted runtime role.
- [ ] Ensure runtime role has no BYPASSRLS and does not own tenant tables.
- [ ] Configure DATABASE_URL and DIRECT_URL in deployment secrets.
- [ ] Configure Redis TLS/authentication.
- [ ] Generate and store DATA_ENCRYPTION_KEY in a secret manager.
- [ ] Set APP_URL to the production HTTPS origin.
- [ ] Run Prisma migrations as a one-off release job.
- [ ] Review RLS policies and grants against every tenant-owned table.
- [ ] Add the SECURITY DEFINER membership bootstrap resolver.
- [ ] Complete invitation email provider and acceptance transaction.
- [ ] Complete and test authentication endpoints before enabling login.
- [ ] Run cross-tenant penetration tests and restore a database backup.
- [ ] Configure structured logs, error reporting, metrics and alerts.
- [ ] Configure domain, TLS, CSP and deployment health checks.

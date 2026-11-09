# PeopleOS — Multi-Tenant Employee Management

A Next.js App Router + TypeScript + Prisma + PostgreSQL + Redis foundation for an organization-based employee management SaaS.

## Included

- Shared-schema PostgreSQL data model with `organization_id` on tenant-owned domain tables.
- PostgreSQL RLS policies for all tenant-owned tables in the initial schema.
- Transaction-local tenant context helper.
- Redis-backed opaque sessions with HTTP-only cookies and database revocation checks.
- Explicit RBAC permission map.
- Tenant-aware employee list/create service and API route.
- Zod validation for employee and leave inputs.
- AES-256-GCM helper for sensitive values.
- Audit logging helper with sensitive-field redaction.
- Health endpoint, error boundaries, Docker Compose and seed data.
- Seed script creates 2 organizations × (1 Owner + 1 Admin + 2 Managers + 5 Employees) = 18 users.

## Important deployment boundary

This is a deployable **foundation**, not a claim that every requested HR workflow is complete. Before exposing it to real users, finish and security-test:
- Email delivery and atomic 48-hour invitation acceptance.
- Full leave request/approval and manager direct-report enforcement.
- Attendance UI and policies.
- Payroll calculation, approval, payslip generation and legal/tax configuration.
- CSV export authorization and audit.
- Login, password reset, email verification and MFA flows.
- Production RLS runtime role provisioning and all composite tenant foreign keys.
- Observability exporter, alerting, backups and disaster recovery.

The login page is intentionally not wired to a public login endpoint. Do not expose an unverified auth flow.

## Requirements

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- npm

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `SEED_PASSWORD` to a strong local-only password.
3. Start infrastructure:

   ```bash
   docker compose up -d postgres redis
   ```

4. Install dependencies and generate Prisma client:

   ```bash
   npm install
   npx prisma generate
   ```

5. Apply schema migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Seed demo data:

   ```bash
   npm run db:seed
   ```

7. Start app:

   ```bash
   npm run dev
   ```

Open http://localhost:3000. Health check: http://localhost:3000/api/health.

## Production database roles and RLS

The migration role must own the schema/tables. The application role must:
- NOT own tenant tables.
- NOT have `BYPASSRLS`.
- Have only required SELECT/INSERT/UPDATE/DELETE grants.
- Have no UPDATE/DELETE/TRUNCATE privileges on `audit_logs`.

Provision roles with your managed database provider or IaC. Do not use the local Docker bootstrap password in production.

The tenant lookup in `requireTenant` is a bootstrap query executed before a tenant context exists. In production, move this lookup into a narrowly scoped `SECURITY DEFINER` PostgreSQL function with a fixed `search_path`, or provide an equally constrained resolver role/function. Do not broadly exempt membership tables from tenant controls.

## Build and deploy

```bash
npm run typecheck
npm run build
npm start
```

For Docker deployment, configure Next standalone output in `next.config.ts` if using the supplied Dockerfile, then build:

```bash
docker build -t peopleos .
```

Set production secrets and database URLs in your deployment platform. Run `prisma migrate deploy` as a release job before rolling out the web service. Do not run migrations from every web replica.

## Security notes

- Use HTTPS in production.
- Configure Redis TLS/authentication and private networking.
- Use a secret manager for encryption and session configuration.
- Rotate encryption keys with a versioned keyring; do not replace the key without a migration plan.
- Add CSRF/origin checks to all cookie-authenticated state-changing endpoints.
- Add login and invitation rate limits at the edge and application layers.
- Ensure all queries run inside `withTenant()` and also include explicit `organizationId` filters.
- Never return salary or bank details in general employee list APIs.
- Test cross-tenant reads/writes with two organizations before launch.

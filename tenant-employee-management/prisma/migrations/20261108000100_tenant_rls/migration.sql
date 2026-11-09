-- Tenant isolation: run migrations as ems_migrator/table owner.
-- Runtime role ems_app must not own these tables and must not have BYPASSRLS.

ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" FORCE ROW LEVEL SECURITY;
CREATE POLICY "memberships_tenant_policy" ON "memberships"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "invitations_tenant_policy" ON "invitations"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "departments" FORCE ROW LEVEL SECURITY;
CREATE POLICY "departments_tenant_policy" ON "departments"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" FORCE ROW LEVEL SECURITY;
CREATE POLICY "employees_tenant_policy" ON "employees"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "employee_bank_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employee_bank_accounts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "employee_bank_accounts_tenant_policy" ON "employee_bank_accounts"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance" FORCE ROW LEVEL SECURITY;
CREATE POLICY "attendance_tenant_policy" ON "attendance"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_requests" FORCE ROW LEVEL SECURITY;
CREATE POLICY "leave_requests_tenant_policy" ON "leave_requests"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "payrolls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payrolls" FORCE ROW LEVEL SECURITY;
CREATE POLICY "payrolls_tenant_policy" ON "payrolls"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "performance_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performance_reviews" FORCE ROW LEVEL SECURITY;
CREATE POLICY "performance_reviews_tenant_policy" ON "performance_reviews"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
CREATE POLICY "notifications_tenant_policy" ON "notifications"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_tenant_policy" ON "audit_logs"
  FOR ALL
  USING (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  )
  WITH CHECK (
    organization_id = NULLIF(
      current_setting('app.current_organization_id', true), ''
    )::uuid
  );

-- Defense-in-depth checks.
ALTER TABLE employees ADD CONSTRAINT employees_salary_nonnegative CHECK (salary >= 0);
ALTER TABLE payrolls ADD CONSTRAINT payroll_amounts_nonnegative
  CHECK (basic_salary >= 0 AND allowances >= 0 AND deductions >= 0 AND gross_salary >= 0 AND net_salary >= 0);
ALTER TABLE leave_requests ADD CONSTRAINT leave_dates_valid CHECK (end_date >= start_date);
ALTER TABLE performance_reviews ADD CONSTRAINT review_rating_valid CHECK (rating BETWEEN 1 AND 5);

-- Prevent runtime role from changing audit history.
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM ems_app;

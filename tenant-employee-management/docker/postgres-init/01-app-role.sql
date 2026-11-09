-- Local development bootstrap only. In production provision these roles
-- through your cloud database/IaC workflow and store credentials in a secret manager.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ems_app') THEN
    CREATE ROLE ems_app LOGIN PASSWORD 'change-me';
  END IF;
END
$$;
GRANT CONNECT ON DATABASE ems TO ems_app;
GRANT USAGE ON SCHEMA public TO ems_app;

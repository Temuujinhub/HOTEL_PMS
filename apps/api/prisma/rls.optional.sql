-- =============================================================================
-- OPTIONAL: PostgreSQL Row-Level Security (defense-in-depth)
-- =============================================================================
-- The application already enforces tenant isolation at the ORM layer (the
-- Prisma tenant-guard extension). This script adds a SECOND, database-enforced
-- layer so that even a raw SQL connection cannot cross tenants.
--
-- TRADE-OFF: with RLS enabled, the application MUST set the tenant for each
-- connection/transaction before querying:
--
--     SET app.current_tenant_id = '<tenant-uuid>';
--
-- That requires running tenant-scoped queries inside a transaction that first
-- issues the SET (or using a per-request connection). With a pooler (PgBouncer
-- in transaction mode) use `SET LOCAL` inside a transaction. Because of this
-- operational coupling, RLS is provided as an opt-in hardening step rather than
-- enabled by default.
--
-- Apply with:  psql "$DATABASE_URL" -f prisma/rls.optional.sql
-- =============================================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'subscriptions','users','properties','room_types','rooms','rate_plans',
    'guests','reservations','folios','folio_items','payments',
    'housekeeping_tasks','audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation ON %I
        USING (
          current_setting('app.current_tenant_id', true) IS NULL
          OR "tenantId"::text = current_setting('app.current_tenant_id', true)
        )
        WITH CHECK (
          current_setting('app.current_tenant_id', true) IS NULL
          OR "tenantId"::text = current_setting('app.current_tenant_id', true)
        );
    $f$, t);
  END LOOP;
END $$;

-- To remove:  DROP POLICY tenant_isolation ON <table>;  ALTER TABLE <table> DISABLE ROW LEVEL SECURITY;

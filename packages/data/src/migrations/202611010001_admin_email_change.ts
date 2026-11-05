import type { Knex } from 'knex';
import { applyAdminIdentityGrants, applyRuntimeGrants } from '../runtime-roles';

const completionFunction = `
CREATE FUNCTION public.complete_admin_user_email_change(p_token_hash text)
RETURNS TABLE (result text, user_id text, sessions_revoked integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, admin
AS $$
DECLARE
  pending admin."userEmailChanges"%ROWTYPE;
  account public.users%ROWTYPE;
  revoked_count integer;
  completed_at timestamptz := clock_timestamp();
BEGIN
  IF p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::text, 0;
    RETURN;
  END IF;

  SELECT * INTO pending
    FROM admin."userEmailChanges"
    WHERE "tokenHash" = p_token_hash
    FOR UPDATE;
  IF NOT FOUND OR pending."consumedAt" IS NOT NULL OR pending."invalidatedAt" IS NOT NULL THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::text, 0;
    RETURN;
  END IF;
  IF pending."expiresAt" <= completed_at THEN
    RETURN QUERY SELECT 'expired'::text, NULL::text, 0;
    RETURN;
  END IF;

  SELECT * INTO account FROM public.users WHERE id = pending."userId" FOR UPDATE;
  IF NOT FOUND OR account."deletionRequestedAt" IS NOT NULL OR
      lower(btrim(account.email)) <> lower(btrim(pending."oldEmail")) THEN
    UPDATE admin."userEmailChanges" SET "invalidatedAt" = completed_at WHERE id = pending.id;
    RETURN QUERY SELECT 'ineligible'::text, pending."userId", 0;
    RETURN;
  END IF;

  BEGIN
    UPDATE public.users SET email = pending."newEmail", "emailVerified" = true, "updatedAt" = completed_at
      WHERE id = pending."userId";
  EXCEPTION WHEN unique_violation THEN
    UPDATE admin."userEmailChanges" SET "invalidatedAt" = completed_at WHERE id = pending.id;
    RETURN QUERY SELECT 'email_taken'::text, pending."userId", 0;
    RETURN;
  END;

  DELETE FROM public.sessions WHERE "userId" = pending."userId";
  GET DIAGNOSTICS revoked_count = ROW_COUNT;
  INSERT INTO public."accountAudit" (
    "userId", action, "actorType", "actorId", reason, details
  ) VALUES (
    pending."userId", 'email.changed', 'staff', pending."requestedBy", pending.reason,
    jsonb_build_object('sessionsRevoked', revoked_count)
  );
  UPDATE admin."userEmailChanges"
    SET "consumedAt" = completed_at, "completedAt" = completed_at, "sessionsRevoked" = revoked_count
    WHERE id = pending.id;
  RETURN QUERY SELECT 'completed'::text, pending."userId", revoked_count;
END;
$$`;

export async function up(db: Knex) {
  await db.schema.withSchema('admin').createTable('userEmailChanges', table => {
    table.uuid('id').primary();
    table.text('tokenHash').notNullable().unique();
    table.text('userId').notNullable();
    table.text('oldEmail').notNullable();
    table.text('newEmail').notNullable();
    table.text('reason').notNullable();
    table.text('requestedBy').notNullable();
    table.text('staffRole').notNullable();
    table.text('requestId').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('consumedAt', { useTz: true });
    table.timestamp('completedAt', { useTz: true });
    table.timestamp('invalidatedAt', { useTz: true });
    table.integer('sessionsRevoked');
    table.check(`"staffRole" = 'super_admin'`);
    table.check('"newEmail" = lower(btrim("newEmail"))');
    table.check('"expiresAt" > "createdAt"');
    table.check('("completedAt" IS NULL) = ("consumedAt" IS NULL)');
    table.check('"sessionsRevoked" IS NULL OR "sessionsRevoked" >= 0');
    table.index(['userId', 'createdAt']);
  });
  await db.raw(`CREATE UNIQUE INDEX user_email_change_one_pending_per_user
    ON admin."userEmailChanges" ("userId")
    WHERE "consumedAt" IS NULL AND "invalidatedAt" IS NULL`);
  await db.raw(`ALTER TABLE public."accountAudit" DROP CONSTRAINT IF EXISTS "accountAudit_action_check"`);
  await db.raw(`ALTER TABLE public."accountAudit"
    ADD CONSTRAINT "accountAudit_action_check"
    CHECK (action IN ('sessions.revoked', 'email.marked_verified', 'email.changed'))`);
  await db.raw(completionFunction);
  await db.raw('REVOKE ALL ON FUNCTION public.complete_admin_user_email_change(text) FROM PUBLIC');
  const roles = await db('pg_roles').where({ rolname: 'salesmora_web' }).first('rolname');
  if (roles) await db.raw('GRANT EXECUTE ON FUNCTION public.complete_admin_user_email_change(text) TO salesmora_web');
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
}

export async function down(db: Knex) {
  await db.raw('REVOKE ALL ON FUNCTION public.complete_admin_user_email_change(text) FROM PUBLIC');
  const roles = await db('pg_roles').where({ rolname: 'salesmora_web' }).first('rolname');
  if (roles) await db.raw('REVOKE ALL ON FUNCTION public.complete_admin_user_email_change(text) FROM salesmora_web');
  await db.raw('DROP FUNCTION public.complete_admin_user_email_change(text)');
  await db.raw(`ALTER TABLE public."accountAudit" DROP CONSTRAINT IF EXISTS "accountAudit_action_check"`);
  await db.raw(`ALTER TABLE public."accountAudit"
    ADD CONSTRAINT "accountAudit_action_check"
    CHECK (action IN ('sessions.revoked', 'email.marked_verified'))`);
  await db.schema.withSchema('admin').dropTable('userEmailChanges');
  await applyRuntimeGrants(db);
  await applyAdminIdentityGrants(db);
}

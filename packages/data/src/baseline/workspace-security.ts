import type { Knex } from 'knex';
import { RUNTIME_GROUP } from '../runtime-roles';

export async function createWorkspaceSecurityGuards(db: Knex) {
  await db.raw(`CREATE FUNCTION suspension_columns_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF (TG_OP = 'INSERT' AND (NEW."suspendedAt" IS NOT NULL OR NEW."suspendedReason" IS NOT NULL)) OR
       (TG_OP = 'UPDATE' AND (NEW."suspendedAt", NEW."suspendedReason") IS DISTINCT FROM (OLD."suspendedAt", OLD."suspendedReason")) THEN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${RUNTIME_GROUP}')
        AND NOT (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
        AND pg_has_role(current_user, '${RUNTIME_GROUP}', 'MEMBER') THEN
        RAISE EXCEPTION 'Suspension state can only be changed by the admin console' USING ERRCODE = '42501';
      END IF;
    END IF;
    RETURN NEW; END $$`);
  for (const table of ['users', 'workspaces']) {
    await db.raw('CREATE TRIGGER suspension_columns_guard BEFORE INSERT OR UPDATE ON ?? FOR EACH ROW EXECUTE FUNCTION suspension_columns_guard()', [table]);
  }

  await db.raw(`CREATE FUNCTION plan_override_columns_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF (TG_OP = 'INSERT' AND num_nonnulls(NEW."planOverride", NEW."planOverrideEndsAt", NEW."planOverrideReason", NEW."planOverrideId") > 0) OR
       (TG_OP = 'UPDATE' AND (NEW."planOverride", NEW."planOverrideEndsAt", NEW."planOverrideReason", NEW."planOverrideId")
         IS DISTINCT FROM (OLD."planOverride", OLD."planOverrideEndsAt", OLD."planOverrideReason", OLD."planOverrideId")) THEN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${RUNTIME_GROUP}')
        AND NOT (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
        AND pg_has_role(current_user, '${RUNTIME_GROUP}', 'MEMBER') THEN
        RAISE EXCEPTION 'Plan overrides can only be changed by the admin console' USING ERRCODE = '42501';
      END IF;
    END IF;
    RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER plan_override_columns_guard BEFORE INSERT OR UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION plan_override_columns_guard()');
}

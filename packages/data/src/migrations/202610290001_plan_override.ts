import type { Knex } from 'knex';
import { RUNTIME_GROUP, applyRuntimeGrants } from '../runtime-roles';

const columns = ['planOverride', 'planOverrideEndsAt', 'planOverrideReason', 'planOverrideId'];

/** Staff-granted plan override. Stripe keeps billing the original plan; the reason is internal. */
export async function up(db: Knex) {
  await db.schema.alterTable('workspaces', t => {
    t.text('planOverride'); t.timestamp('planOverrideEndsAt', { useTz: true }); t.text('planOverrideReason');
    // Identifies one grant, so its expiry is audited exactly once even if the same plan is granted again.
    t.uuid('planOverrideId');
    t.check(`"planOverride" IN ('standard', 'premium')`, [], 'workspaces_plan_override_plan');
    t.check(`num_nulls("planOverride", "planOverrideEndsAt", "planOverrideReason", "planOverrideId") IN (0, 4)`, [], 'workspaces_plan_override_set');
  });
  await db.raw(`CREATE INDEX workspaces_plan_override_ends_idx ON workspaces ("planOverrideEndsAt") WHERE "planOverrideEndsAt" IS NOT NULL`);
  await db.raw(`CREATE UNIQUE INDEX "billingAudit_override_expired_unique" ON "billingAudit" ((details->>'overrideId')) WHERE action = 'plan.override_expired'`);
  // Same rule as suspension: the customer-app roles keep table-level UPDATE on workspaces, so a trigger stops them granting themselves a plan.
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
  await applyRuntimeGrants(db);
}

export async function down(db: Knex) {
  await db.raw('DROP TRIGGER plan_override_columns_guard ON workspaces');
  await db.raw('DROP FUNCTION plan_override_columns_guard()');
  await db.raw('DROP INDEX "billingAudit_override_expired_unique"');
  await db.raw('DROP INDEX workspaces_plan_override_ends_idx');
  await db.schema.alterTable('workspaces', t => {
    t.dropChecks(['workspaces_plan_override_plan', 'workspaces_plan_override_set']);
    t.dropColumns(...columns);
  });
}

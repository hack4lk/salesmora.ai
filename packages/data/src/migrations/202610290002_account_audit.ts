import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

/** Staff changes to a customer's account that have no other audit home (0d). Reasons are internal. */
export async function up(db: Knex) {
  // No foreign keys: evidence outlives the purge of a deleted user.
  await db.schema.createTable('accountAudit', t => {
    t.bigIncrements('id').primary();
    t.text('userId').notNullable(); t.text('action').notNullable();
    t.text('actorType').notNullable(); t.text('actorId').notNullable(); t.text('reason').notNullable();
    t.jsonb('details').notNullable().defaultTo('{}');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check(`"action" IN ('sessions.revoked', 'email.marked_verified')`);
    t.check(`"actorType" IN ('staff', 'system')`);
    t.index(['userId', 'createdAt']);
  });
  await db.raw(`CREATE FUNCTION account_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Account audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER account_audit_immutable BEFORE UPDATE OR DELETE ON "accountAudit" FOR EACH ROW EXECUTE FUNCTION account_audit_immutable()');
  // Default privileges gave the runtime roles full access; accountAudit is staff-only.
  await applyRuntimeGrants(db);
}

export async function down(db: Knex) {
  await db.schema.dropTable('accountAudit');
  await db.raw('DROP FUNCTION account_audit_immutable()');
}

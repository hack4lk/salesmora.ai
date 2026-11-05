import type { Knex } from 'knex';
import { RUNTIME_GROUP, applyRuntimeGrants } from '../runtime-roles';

/** Staff-controlled suspension for users and workspaces. Reasons are internal and never shown to customers. */
export async function up(db: Knex) {
  for (const table of ['users', 'workspaces']) {
    await db.schema.alterTable(table, t => {
      t.timestamp('suspendedAt', { useTz: true });
      t.text('suspendedReason');
      t.check('("suspendedAt" IS NULL) = ("suspendedReason" IS NULL)', [], `${table}_suspension_pair`);
    });
    await db.raw(`CREATE INDEX ?? ON ?? ("suspendedAt") WHERE "suspendedAt" IS NOT NULL`, [`${table}_suspended_idx`, table]);
  }
  // No foreign keys: evidence outlives the purge of a deleted user or workspace.
  await db.schema.createTable('suspensionAudit', t => {
    t.bigIncrements('id').primary();
    t.text('subjectType').notNullable(); t.text('subjectId').notNullable(); t.text('action').notNullable();
    t.text('actorType').notNullable(); t.text('actorId').notNullable(); t.text('reason');
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check(`"subjectType" IN ('user', 'workspace')`); t.check(`"action" IN ('suspended', 'unsuspended')`);
    t.check(`"actorType" IN ('staff', 'system')`);
    t.index(['subjectType', 'subjectId', 'createdAt']);
  });
  await db.raw(`CREATE FUNCTION suspension_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Suspension audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER suspension_audit_immutable BEFORE UPDATE OR DELETE ON "suspensionAudit" FOR EACH ROW EXECUTE FUNCTION suspension_audit_immutable()');
  // Owner notice outbox. Delivered by the worker even while the workspace is suspended.
  await db.schema.createTable('workspaceSuspensionNotices', t => {
    t.uuid('id').primary();
    t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.text('status').notNullable().defaultTo('queued'); t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp('sentAt', { useTz: true });
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.check(`"status" IN ('queued', 'sent', 'failed', 'skipped')`);
    t.index(['status', 'nextAttemptAt']);
  });
  // Customer-app roles keep table-level UPDATE on users and workspaces (Better Auth and settings need it),
  // so a trigger rather than column grants stops them changing suspension state. Superusers are exempt
  // because PostgreSQL treats them as members of every role.
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
  // Default privileges gave the runtime roles full access to the new tables; narrow them and add the admin writes.
  await applyRuntimeGrants(db);
}

export async function down(db: Knex) {
  for (const table of ['users', 'workspaces']) await db.raw('DROP TRIGGER suspension_columns_guard ON ??', [table]);
  await db.raw('DROP FUNCTION suspension_columns_guard()');
  await db.schema.dropTable('workspaceSuspensionNotices');
  await db.schema.dropTable('suspensionAudit');
  await db.raw('DROP FUNCTION suspension_audit_immutable()');
  for (const table of ['users', 'workspaces']) {
    await db.raw('DROP INDEX ??', [`${table}_suspended_idx`]);
    await db.schema.alterTable(table, t => {
      t.dropChecks([`${table}_suspension_pair`]);
      t.dropColumns('suspendedAt', 'suspendedReason');
    });
  }
}

import type { Knex } from 'knex';

export async function createAccountSupportTables(db: Knex) {
  await db.schema.createTable('accountDeletionRequests', table => {
    table.uuid('id').primary();
    table.text('userId').notNullable().unique();
    table.uuid('workspaceId').unique();
    table.text('state').notNullable().defaultTo('pending');
    table.timestamp('requestedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('completedAt', { useTz: true });
    table.timestamp('retryAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.integer('attempts').notNullable().defaultTo(0);
    table.text('lastError');
    table.check("state IN ('pending', 'completed')");
    table.index(['state', 'retryAt']);
  });
  await db.schema.createTable('accountAudit', table => {
    table.bigIncrements('id').primary();
    table.text('userId').notNullable();
    table.text('action').notNullable();
    table.text('actorType').notNullable();
    table.text('actorId').notNullable();
    table.text('reason').notNullable();
    table.jsonb('details').notNullable().defaultTo('{}');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"actorType" IN ('staff', 'system')`);
    table.index(['userId', 'createdAt']);
  });
  await db.raw(`ALTER TABLE "accountAudit" ADD CONSTRAINT "accountAudit_action_check" CHECK (action IN ('sessions.revoked', 'email.marked_verified', 'email.changed', 'workspace.export.downloaded'))`);
  await db.raw(`CREATE FUNCTION account_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Account audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER account_audit_immutable BEFORE UPDATE OR DELETE ON "accountAudit" FOR EACH ROW EXECUTE FUNCTION account_audit_immutable()');
  await db.schema.createTable('suspensionAudit', table => {
    table.bigIncrements('id').primary();
    table.text('subjectType').notNullable();
    table.text('subjectId').notNullable();
    table.text('action').notNullable();
    table.text('actorType').notNullable();
    table.text('actorId').notNullable();
    table.text('reason');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"subjectType" IN ('user', 'workspace')`);
    table.check(`"action" IN ('suspended', 'unsuspended')`);
    table.check(`"actorType" IN ('staff', 'system')`);
    table.index(['subjectType', 'subjectId', 'createdAt']);
  });
  await db.raw(`CREATE FUNCTION suspension_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Suspension audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER suspension_audit_immutable BEFORE UPDATE OR DELETE ON "suspensionAudit" FOR EACH ROW EXECUTE FUNCTION suspension_audit_immutable()');
  await db.schema.createTable('workspaceSuspensionNotices', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('status').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"status" IN ('queued', 'sent', 'failed', 'skipped')`);
    table.index(['status', 'nextAttemptAt']);
  });
  await db.schema.createTable('workspaceOwnershipNotices', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('recipient').notNullable();
    table.text('fromUserId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('toUserId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('status').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`"recipient" IN ('new_owner', 'previous_owner')`);
    table.check(`"status" IN ('queued', 'sent', 'failed', 'skipped')`);
    table.index(['status', 'nextAttemptAt']);
  });
}

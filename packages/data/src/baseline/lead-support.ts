import type { Knex } from 'knex';

export async function createLeadSupportTables(db: Knex) {
  await db.schema.createTable('leadTags', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('leadId').notNullable();
    table.text('tag').notNullable();
    table.primary(['workspaceId', 'leadId', 'tag']);
    table.foreign(['workspaceId', 'leadId']).references(['workspaceId', 'id']).inTable('leads').onDelete('CASCADE');
    table.check('length(tag) BETWEEN 1 AND 50');
  });
  await db.schema.createTable('notificationPreferences', table => {
    table.text('userId').primary().references('id').inTable('users').onDelete('CASCADE');
    table.boolean('leadAssignedEmail').notNullable().defaultTo(true);
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    for (const field of ['visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail']) {
      table.boolean(field).notNullable().defaultTo(true);
    }
  });
  await db.schema.createTable('assignmentNotifications', table => {
    table.uuid('id').primary().references('id').inTable('leadActivity').onDelete('CASCADE');
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('leadId').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('readAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
  });
  await db.schema.createTable('assignmentEmailOutbox', table => {
    table.uuid('id').primary().references('id').inTable('assignmentNotifications').onDelete('CASCADE');
    table.text('status').notNullable().defaultTo('queued');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('nextAttemptAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('sentAt', { useTz: true });
    table.index(['status', 'nextAttemptAt']);
  });
  await db.raw(`ALTER TABLE "assignmentEmailOutbox" ADD CHECK (status IN ('queued','sent','skipped','failed')), ADD CHECK (attempts >= 0 AND attempts <= 5)`);
  await db.schema.createTable('leadDeletionAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.uuid('leadId').notNullable();
    table.integer('leadNumber').notNullable();
    table.text('actorId').notNullable();
    table.text('requestHash').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'leadId']);
  });
  await db.raw(`CREATE FUNCTION lead_deletion_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    RAISE EXCEPTION 'Lead deletion audit records are immutable'; END $$`);
  await db.raw('CREATE TRIGGER lead_deletion_audit_immutable BEFORE UPDATE OR DELETE ON "leadDeletionAudit" FOR EACH ROW EXECUTE FUNCTION lead_deletion_audit_immutable()');
  await db.schema.createTable('leadExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.text('dataset').notNullable().defaultTo('leads');
    table.text('scope').notNullable();
    table.jsonb('filters').notNullable();
    table.integer('count').notNullable();
    table.integer('rowsSent').notNullable().defaultTo(0);
    table.text('outcome').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.index(['workspaceId', 'createdAt']);
    table.check(`scope IN ('workspace','assigned') AND outcome IN ('started','completed','failed','rejected') AND count >= 0 AND "rowsSent" >= 0`);
  });
  await db.raw(`CREATE FUNCTION lead_export_audit_final() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP = 'DELETE' OR OLD.outcome <> 'started' THEN RAISE EXCEPTION 'Final export audit records are immutable'; END IF;
    RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER lead_export_audit_final BEFORE UPDATE OR DELETE ON "leadExportAudit" FOR EACH ROW EXECUTE FUNCTION lead_export_audit_final()');
}

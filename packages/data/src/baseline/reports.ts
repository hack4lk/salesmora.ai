import type { Knex } from 'knex';

export async function createReportTables(db: Knex) {
  await db.schema.createTable('reportExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable();
    table.text('actorId').notNullable();
    table.text('report').notNullable();
    table.text('dataset').notNullable();
    table.text('scope').notNullable();
    table.jsonb('selection').notNullable();
    table.integer('policyRevision').notNullable();
    table.bigInteger('count').notNullable();
    table.bigInteger('rowsSent').notNullable().defaultTo(0);
    table.bigInteger('bytesSent').notNullable().defaultTo(0);
    table.jsonb('limits').notNullable();
    table.timestamp('snapshotAt', { useTz: true }).notNullable();
    table.text('outcome').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true });
    table.jsonb('outputScopes').notNullable().defaultTo('{}');
    table.index(['workspaceId', 'createdAt']);
    table.check(`(report IN ('leads','sources','jobs','team','estimates','activity','financial','overview')
      AND scope IN ('workspace','assigned') OR report = 'calendar' AND scope IN ('workspace','own')) AND
      outcome IN ('started','completed','failed','rejected') AND
      count >= 0 AND "rowsSent" >= 0 AND "bytesSent" >= 0 AND
      (outcome = 'started') = ("finishedAt" IS NULL)`, [], 'report_export_audit_scope_check');
  });
  await db.raw(`CREATE FUNCTION report_export_audit_final() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP = 'DELETE' OR OLD.outcome <> 'started' THEN RAISE EXCEPTION 'Final report export audits are immutable'; END IF;
    IF NEW.id <> OLD.id OR NEW."workspaceId" <> OLD."workspaceId" OR NEW."actorId" <> OLD."actorId" OR
      NEW.report <> OLD.report OR NEW.dataset <> OLD.dataset OR NEW.selection <> OLD.selection OR NEW.limits <> OLD.limits
      THEN RAISE EXCEPTION 'Report export audit identity is immutable'; END IF;
    RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER report_export_audit_final BEFORE UPDATE OR DELETE ON "reportExportAudit"
    FOR EACH ROW EXECUTE FUNCTION report_export_audit_final()`);
  await db.schema.createTable('reportTemplates', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('ownerId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('area').notNullable();
    table.text('name').notNullable();
    table.jsonb('configuration').notNullable();
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.check(`area IN ('overview','leads','sources','calendar','jobs','team','estimates','activity','financial')`);
    table.check('length(btrim(name)) BETWEEN 1 AND 80 AND version > 0');
    table.index(['workspaceId', 'ownerId', 'area']);
  });
  await db.raw('CREATE UNIQUE INDEX report_template_personal_name ON "reportTemplates" ("workspaceId", "ownerId", area, lower(btrim(name)))');
}

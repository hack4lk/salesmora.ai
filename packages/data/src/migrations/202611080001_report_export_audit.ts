import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.createTable('reportExportAudit', table => {
    table.uuid('id').primary(); table.uuid('workspaceId').notNullable(); table.text('actorId').notNullable();
    table.text('report').notNullable(); table.text('dataset').notNullable(); table.text('scope').notNullable();
    table.jsonb('selection').notNullable(); table.integer('policyRevision').notNullable();
    table.bigInteger('count').notNullable(); table.bigInteger('rowsSent').notNullable().defaultTo(0);
    table.bigInteger('bytesSent').notNullable().defaultTo(0); table.jsonb('limits').notNullable();
    table.timestamp('snapshotAt', { useTz: true }).notNullable();
    table.text('outcome').notNullable(); table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.timestamp('finishedAt', { useTz: true }); table.index(['workspaceId', 'createdAt']);
    table.check(`report = 'leads' AND scope IN ('workspace','assigned') AND
      outcome IN ('started','completed','failed','rejected') AND count >= 0 AND "rowsSent" >= 0 AND "bytesSent" >= 0 AND
      (outcome = 'started') = ("finishedAt" IS NULL)`);
  });
  await db.raw(`CREATE FUNCTION report_export_audit_final() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF TG_OP = 'DELETE' OR OLD.outcome <> 'started' THEN RAISE EXCEPTION 'Final report export audits are immutable'; END IF;
    IF NEW.id <> OLD.id OR NEW."workspaceId" <> OLD."workspaceId" OR NEW."actorId" <> OLD."actorId" OR
      NEW.report <> OLD.report OR NEW.dataset <> OLD.dataset OR NEW.selection <> OLD.selection OR NEW.limits <> OLD.limits
      THEN RAISE EXCEPTION 'Report export audit identity is immutable'; END IF;
    RETURN NEW; END $$`);
  await db.raw(`CREATE TRIGGER report_export_audit_final BEFORE UPDATE OR DELETE ON "reportExportAudit"
    FOR EACH ROW EXECUTE FUNCTION report_export_audit_final()`);
}
export async function down(db: Knex) {
  await db.schema.dropTable('reportExportAudit');
  await db.raw('DROP FUNCTION report_export_audit_final()');
}

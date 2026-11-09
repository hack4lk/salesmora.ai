import type { Knex } from 'knex';

const reportAuditCheck = (reports: readonly string[]) => `CHECK (
  report IN (${reports.map(report => `'${report}'`).join(', ')}) AND
  scope IN ('workspace','assigned') AND outcome IN ('started','completed','failed','rejected') AND
  count >= 0 AND "rowsSent" >= 0 AND "bytesSent" >= 0 AND
  (outcome = 'started') = ("finishedAt" IS NULL)
)`;

export async function up(db: Knex) {
  await db.raw(`ALTER TABLE "reportExportAudit"
    ADD COLUMN "outputScopes" jsonb NOT NULL DEFAULT '{}'::jsonb`);
  const result = await db.raw<{ rows: { conname: string }[] }>(`
    SELECT conname FROM pg_constraint
    WHERE conrelid = to_regclass('"reportExportAudit"') AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%leads%'
      AND pg_get_constraintdef(oid) LIKE '%rowsSent%'
  `);
  if (result.rows.length !== 1) throw new Error('Could not identify the existing report-export audit check.');
  await db.raw('ALTER TABLE "reportExportAudit" DROP CONSTRAINT ??', [result.rows[0].conname]);
  await db.raw(`ALTER TABLE "reportExportAudit" ADD CONSTRAINT report_export_audit_scope_check
    ${reportAuditCheck(['leads', 'sources'])}`);
}

export async function down(db: Knex) {
  await db.raw('ALTER TABLE "reportExportAudit" DROP CONSTRAINT report_export_audit_scope_check');
  await db.raw(`ALTER TABLE "reportExportAudit" ADD CONSTRAINT report_export_audit_scope_check
    ${reportAuditCheck(['leads'])}`);
  await db.raw('ALTER TABLE "reportExportAudit" DROP COLUMN "outputScopes"');
}

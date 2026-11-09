import type { Knex } from 'knex';

function check(includeCalendar: boolean) {
  return `CHECK (
    ${includeCalendar
    ? "(report IN ('leads','sources') AND scope IN ('workspace','assigned') OR report = 'calendar' AND scope IN ('workspace','own'))"
    : "report IN ('leads','sources') AND scope IN ('workspace','assigned')"} AND
    outcome IN ('started','completed','failed','rejected') AND
    count >= 0 AND "rowsSent" >= 0 AND "bytesSent" >= 0 AND
    (outcome = 'started') = ("finishedAt" IS NULL)
  )`;
}
export async function up(db: Knex) {
  await db.raw('ALTER TABLE "reportExportAudit" DROP CONSTRAINT report_export_audit_scope_check');
  await db.raw(`ALTER TABLE "reportExportAudit" ADD CONSTRAINT report_export_audit_scope_check ${check(true)}`);
}
export async function down(db: Knex) {
  await db.raw('ALTER TABLE "reportExportAudit" DROP CONSTRAINT report_export_audit_scope_check');
  await db.raw(`ALTER TABLE "reportExportAudit" ADD CONSTRAINT report_export_audit_scope_check ${check(false)}`);
}

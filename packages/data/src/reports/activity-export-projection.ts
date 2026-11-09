import type { Knex } from 'knex';
import { activityReportExportColumns, activityReportExportInputSchema,
  type ActivityReportExportInput, type AuthorizationContext } from '@salesmora/contracts';
import { prepareActivityReportInTransaction } from './activity';

/** Revalidates whole-population native histories under independently narrowed domain export scopes. */
export async function prepareActivityReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: ActivityReportExportInput,
) {
  const input = activityReportExportInputSchema.parse(raw);
  const { report, evidence } = await prepareActivityReportInTransaction(trx, context,
    { ...input.query, page: 1, pageSize: 100 }, 'export');
  const coverage = 'Native authorized parent histories only; omitted domains require their own export authority. Notes and linked-Lead copies are excluded.';
  const included = JSON.stringify(report.includedDomains), omitted = JSON.stringify(report.omittedDomains);
  const common = [report.from, report.to, report.asOf, report.timezone, included, omitted];
  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (input.dataset === 'summary') { yield [...common, report.total]; return; }
    for await (const event of evidence(signal)) {
      yield [...common, event.domain, event.eventId, event.occurredAt, event.action,
        event.actor.key, event.actor.label, event.recordId, event.recordLabel];
    }
  }
  return {
    input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    asOf: report.asOf, today: report.today, timezone: report.timezone,
    includedDomains: report.includedDomains, omittedDomains: report.omittedDomains,
    count: input.dataset === 'summary' ? 1 : report.total, columns: activityReportExportColumns(input), coverage, rows,
  };
}

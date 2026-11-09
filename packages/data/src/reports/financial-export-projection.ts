import type { Knex } from 'knex';
import { financialReportExportColumns, financialReportExportInputSchema, financialEstimateExportInput,
  type AuthorizationContext, type FinancialReportExportInput } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { resolveFinancialReportExportAccess } from './financial-export-access';
import { prepareEstimateReportCSVProjectionInTransaction } from './estimate-export-projection';
import { financialMaterialEvidence, prepareFinancialMaterialsReportInTransaction } from './financial-materials';

/** Project one independently authorized Financial section; missing values remain null. */
export async function prepareFinancialReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: FinancialReportExportInput,
) {
  const input = financialReportExportInputSchema.parse(raw), { query, dataset } = input;
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const access = resolveFinancialReportExportAccess(context);
  const clock = await trx('workspaces').where({ id: context.workspaceId })
    .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string') throw new Error('The Financial export clock is unavailable.');
  if (query.period.to > clock.today) throw new RangeError('Financial periods cannot extend beyond the workspace date.');
  if (query.selected !== 'materials') {
    if (!access.estimates) throw new AuthorizationAccessError();
    const estimate = await prepareEstimateReportCSVProjectionInTransaction(trx, context, financialEstimateExportInput(input),
      { allowHandoff: false });
    async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
      for await (const row of estimate.rows(signal)) {
        const selected = dataset === 'evidence' ? row
          : query.selected === 'accepted' ? row.filter((_, index) => index !== 11)
            : row.filter((_, index) => ![11, 12, 13].includes(index));
        yield [query.selected, ...selected];
      }
    }
    return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
      asOf: estimate.asOf, today: estimate.today, timezone: estimate.timezone, section: query.selected,
      scope: estimate.scope === 'workspace' ? 'workspace' as const : 'assigned' as const, jobScope: null,
      archiveVisibility: estimate.archiveVisibility,
      count: estimate.count, columns: financialReportExportColumns(input),
      coverage: `${estimate.coverage} ${query.selected === 'awaiting' ? 'Current snapshot; the selected historical period does not apply.' : 'Accepted decisions in the selected historical period.'}`,
      rows };
  }
  if (!access.materials) throw new AuthorizationAccessError();
  const prepared = await prepareFinancialMaterialsReportInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'financial-materials', filters: { statuses: [] }, selected: 'all', page: 1, pageSize: 100,
  }, { forceAssigned: access.materials.scope === 'assigned', allowJobLabels: access.materials.jobScope !== null,
    forceAssignedJobLabels: access.materials.jobScope === 'assigned' });
  const { report, source } = prepared;
  if (report.costs.kind !== 'available' || !source) throw new AuthorizationAccessError();
  const materialSource = source;
  const cost = report.costs.coverage;
  const coverage = 'Current non-archived issued/in-progress Work Order materials; missing costs are not zero. Not actual spend.';
  const common = [query.selected, report.asOf, report.timezone, report.scope, coverage];
  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (dataset === 'summary') {
      yield [...common, cost.lineCount, cost.knownCostLines, cost.missingCostLines, cost.knownCostCents];
      return;
    }
    for await (const row of financialMaterialEvidence(trx, materialSource, signal)) {
      yield [...common, row.id, row.workOrderId, row.workOrderLabel, row.jobLabel, row.workOrderStatus,
        row.itemLabel, row.quantity, row.unit, row.status, row.unitCostCents, row.lineCostCents, String(row.changedAfterIssue)];
    }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    asOf: report.asOf, today: report.today, timezone: report.timezone, section: query.selected, scope: report.scope,
    jobScope: access.materials.jobScope, archiveVisibility: report.archiveVisibility,
    count: dataset === 'summary' ? 1 : report.evidenceTotal,
    columns: financialReportExportColumns(input), coverage, rows };
}

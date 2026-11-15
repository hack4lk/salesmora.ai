import type { Knex } from 'knex';
import { estimateReportExportColumns, estimateReportExportInputSchema,
  type AuthorizationContext, type EstimateReportExportInput } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { resolveEstimateReportExportAccess } from './estimate-export-access';
import { estimateDecisionsEvidence, estimateDecisionsSource, readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { estimateCurrentEvidence, estimateCurrentSource, readEstimateCurrentReportInTransaction } from './estimate-current';
import { estimateFirstQuotedEvidence, estimateFirstQuotedSource, readEstimateFirstQuotedReportInTransaction } from './estimate-first-quoted';

type Money = { kind: 'available'; preTaxCents: number; taxCents: number; customerTotalCents: number } |
  { kind: 'unavailable'; explanation: string };
function moneyCells(money: Money) {
  return money.kind === 'available' ? [money.preTaxCents, money.taxCents, money.customerTotalCents, 'verified']
    : [null, null, null, 'unavailable'];
}

/** Reuses native report validation and cursor sources under the narrower export authority. */
export async function prepareEstimateReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: EstimateReportExportInput, options: { allowHandoff?: boolean } = {},
) {
  const input = estimateReportExportInputSchema.parse(raw), { query, dataset } = input;
  const access = resolveEstimateReportExportAccess(context);
  if (!access || query.workspaceId !== context.workspaceId ||
    query.view === 'estimate-current' && query.selected === 'handoff' && !access.handoff) throw new AuthorizationAccessError();
  const handoff = access.handoff && options.allowHandoff !== false;
  if (query.view === 'estimate-current' && query.selected === 'handoff' && !handoff) throw new AuthorizationAccessError();
  const assigned = access.scope === 'assigned_job', paging = { page: 1, pageSize: 100 as const };
  const report = query.view === 'estimate-decisions'
    ? await readEstimateDecisionsReportInTransaction(trx, context, { ...query, ...paging }, assigned)
    : query.view === 'estimate-first-quoted'
      ? await readEstimateFirstQuotedReportInTransaction(trx, context, { ...query, ...paging }, assigned)
      : await readEstimateCurrentReportInTransaction(trx, context, { ...query, ...paging }, assigned, handoff);
  if (report.scope !== access.scope) throw new Error('Estimate export and native read scopes disagree.');
  const clock = await trx('workspaces').where({ id: context.workspaceId })
    .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string') throw new Error('The Estimate export clock is unavailable.');
  const dateBasis = query.view === 'estimate-decisions' ? 'decision-date' as const
    : query.view === 'estimate-first-quoted' ? 'first-issued-date' as const : 'current-snapshot' as const;
  const archiveVisibility = report.view === 'estimate-current' ? 'excluded' as const : report.archiveVisibility;
  const coverage = report.view === 'estimate-first-quoted' && report.coverage.kind === 'partial'
    ? report.coverage.explanation
    : report.view === 'estimate-first-quoted'
      ? 'First-issued Estimate families; issuance evidence is complete.'
    : report.view === 'estimate-current'
      ? `Current issued Estimates. Handoff ${handoff ? 'available' : 'withheld'}.`
      : 'Effective issued Estimate decisions; frozen amounts are explicitly verified.';
  const common = [query.view, dataset, dateBasis, 'period' in query ? query.period.from : null,
    'period' in query ? query.period.to : null, report.asOf, report.timezone, access.scope, archiveVisibility, coverage];
  const count = dataset === 'summary' ? 1 : report.view === 'estimate-first-quoted' ? report.total : report.evidenceTotal;

  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (dataset === 'summary') {
      if (report.view === 'estimate-decisions') yield [...common, report.counts.accepted, report.counts.declined,
        report.money.kind === 'available' ? report.money.preTaxCents : null,
        report.money.kind === 'available' ? report.money.customerTotalCents : null,
        report.money.kind === 'available' ? 'verified' : 'unavailable'];
      else if (report.view === 'estimate-first-quoted') yield [...common, report.total, report.coverage.kind];
      else yield [...common, report.counts.awaiting, report.counts.expired,
        report.handoff.kind === 'available' ? report.handoff.count : null, report.handoff.kind,
        report.awaitingMoney.kind === 'available' ? report.awaitingMoney.preTaxCents : null,
        report.awaitingMoney.kind === 'available' ? report.awaitingMoney.customerTotalCents : null,
        report.awaitingMoney.kind === 'available' ? 'verified' : 'unavailable'];
      return;
    }
    if (query.view === 'estimate-decisions') {
      const { source } = await estimateDecisionsSource(trx, context, { ...query, ...paging }, assigned);
      for await (const row of estimateDecisionsEvidence(trx, context, source, signal)) {
        if (query.selected !== 'decided' && query.selected !== row.outcome) continue;
        yield [...common, row.recordId, row.estimateNumber, row.revision, row.decisionVersion, row.label, row.ownerKey,
          row.parentType, row.outcome, row.decisionDate, row.recordedDate, String(row.archived), ...moneyCells(row.money)];
      }
    } else if (query.view === 'estimate-first-quoted') {
      const source = await estimateFirstQuotedSource(trx, context, { ...query, ...paging }, assigned);
      for await (const row of estimateFirstQuotedEvidence(trx, source, context.workspaceId, signal)) {
        if (row.familyId !== `${context.workspaceId}:${row.estimateNumber}` ||
          row.firstIssuedDate < query.period.from || row.firstIssuedDate > query.period.to ||
          row.firstIssuedRevision > row.currentIssuedRevision || row.currentIssuedDate < row.firstIssuedDate ||
          row.currentIssuedDate > clock.today || archiveVisibility === 'excluded' && row.archived) {
          throw new Error('First-quoted Estimate CSV evidence is inconsistent.');
        }
        yield [...common, row.recordId, row.estimateNumber, row.label, row.ownerKey, row.parentType, row.firstIssuedDate,
          row.firstIssuedRevision, row.firstIssuedVia, row.currentIssuedRevision, row.currentIssuedDate, row.currentStatus,
          String(row.archived)];
      }
    } else {
      const { auth, source, canHandoff } = await estimateCurrentSource(trx, context, { ...query, ...paging }, assigned, handoff);
      for await (const { queue, evidence: row } of estimateCurrentEvidence(trx, context, source, auth.clock.today, canHandoff, signal)) {
        if (queue !== query.selected) continue;
        yield [...common, row.recordId, row.estimateNumber, row.revision, row.label, row.ownerKey, row.parentType,
          row.status, row.issuedDate, row.validUntil, row.status === 'accepted' ? row.decisionDate : null, ...moneyCells(row.money)];
      }
    }
  }
  return {
    input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope: access.scope, handoff, archiveVisibility, asOf: report.asOf, today: clock.today,
    timezone: report.timezone, dateBasis, count, coverage, columns: estimateReportExportColumns(input), rows,
  };
}

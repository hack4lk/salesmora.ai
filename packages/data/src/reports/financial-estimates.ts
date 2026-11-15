import type { Knex } from 'knex';
import { financialEstimatesQuerySchema, financialEstimatesResultSchema,
  type AuthorizationContext, type FinancialEstimatesQuery, type FinancialEstimatesResult } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { readEstimateCurrentReportInTransaction } from './estimate-current';

/** Separate period commitments and current queues; reuse each native reader's single-statement snapshot. */
export async function readFinancialEstimatesReportInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: FinancialEstimatesQuery,
): Promise<FinancialEstimatesResult> {
  const query = financialEstimatesQuerySchema.parse(rawQuery);
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (query.workspaceId !== context.workspaceId || !report.allowed ||
    !authorize(context, { permission: 'reports.financial.read' }).allowed) throw new AuthorizationAccessError();
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select(
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string') throw new Error('The workspace Financial date is unavailable.');
  if (query.period.to > clock.today) throw new RangeError('Financial commitment periods cannot extend beyond business-local today.');
  const base = { workspaceId: query.workspaceId, view: 'financial-estimates' as const,
    from: query.period.from, to: query.period.to, selected: query.selected };
  const estimates = resolveAuthorizedCollectionScope(context, 'estimates.read');
  const assigned = report.scope === 'assigned' || estimates.allowed && estimates.scope === 'assigned_job';
  if (!estimates.allowed || assigned && !report.sourceScopes?.job) {
    return financialEstimatesResultSchema.parse({ ...base, estimates: { kind: 'unavailable', reason: 'permissions',
      explanation: 'Current Estimate read and applicable assigned Job authority are required; commitments and evidence are withheld.' } });
  }
  const common = { workspaceId: query.workspaceId, filters: query.filters, page: query.page, pageSize: query.pageSize };
  const section = query.selected === 'accepted'
    ? { kind: 'accepted' as const, report: await readEstimateDecisionsReportInTransaction(trx, context, {
      ...common, view: 'estimate-decisions', period: query.period, selected: 'accepted',
    }) }
    : { kind: 'awaiting' as const, report: await readEstimateCurrentReportInTransaction(trx, context, {
      ...common, view: 'estimate-current', selected: 'awaiting',
    }) };
  return financialEstimatesResultSchema.parse({ ...base, estimates: section });
}

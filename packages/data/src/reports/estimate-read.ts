import type { Knex } from 'knex';
import { estimateReportQuerySchema, estimateReportReadResultSchema,
  type AuthorizationContext, type EstimateReportQuery, type EstimateReportReadResult } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { estimateReportContext, estimateReportHandoffAllowed } from './estimate-context';
import { estimateReportOwnerSQL } from './estimate-filters';
import { readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { readEstimateFirstQuotedReportInTransaction } from './estimate-first-quoted';
import { readEstimateCurrentReportInTransaction } from './estimate-current';
import { resolveEstimateReportExportAccess } from './estimate-export-access';

/** Native selected-issued-revision facets precede period, member and evidence predicates. */
export async function readEstimateReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: EstimateReportQuery,
): Promise<EstimateReportReadResult> {
  const query = estimateReportQuerySchema.parse(rawQuery);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const auth = await estimateReportContext(trx, context);
  const population = auth.query.clone();
  if (query.view === 'estimate-current' || !auth.includeArchived) population.whereNull('e.archivedAt');
  const facets = await population.clearSelect().clearOrder()
    .distinct(trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`), 'e.parentType') as { ownerKey: string; parentType: 'lead' | 'job' }[];
  const ownerKeys = [...new Set(facets.map(row => row.ownerKey))];
  const memberIds = ownerKeys.filter(key => key !== 'unassigned').map(key => key.slice('member:'.length));
  const members = memberIds.length ? await trx('users').select<{ id: string; name: string }[]>('id', 'name').whereIn('id', memberIds) : [];
  const owners = ownerKeys.map(value => {
    const label = value === 'unassigned' ? 'No current owner / reassignment needed'
      : members.find(member => member.id === value.slice('member:'.length))?.name;
    if (!label) throw new Error('An authorized Estimate report owner label is unavailable.');
    return { value, label };
  }).sort((a, b) => a.label.localeCompare(b.label, 'en') || a.value.localeCompare(b.value, 'en'));
  const parents = (['lead', 'job'] as const).filter(value => facets.some(row => row.parentType === value))
    .map(value => ({ value, label: value === 'lead' ? 'Lead' : 'Job' }));
  const report = query.view === 'estimate-decisions' ? await readEstimateDecisionsReportInTransaction(trx, context, query)
    : query.view === 'estimate-first-quoted' ? await readEstimateFirstQuotedReportInTransaction(trx, context, query)
      : await readEstimateCurrentReportInTransaction(trx, context, query);
  return estimateReportReadResultSchema.parse({
    workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    today: auth.clock.today, query, report,
    authority: { scope: auth.scope, archives: auth.includeArchived ? 'included' : 'excluded',
      money: true, handoff: estimateReportHandoffAllowed(context, auth) },
    exportAccess: resolveEstimateReportExportAccess(context),
    options: { context: query.view === 'estimate-current' ? 'current' : 'period', owners, parents },
  });
}
export async function initialEstimateReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<EstimateReportReadResult> {
  const { clock } = await estimateReportContext(trx, context);
  return readEstimateReportWithAuthorityInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'estimate-decisions', selected: 'accepted',
    period: { from: addCalendarDays(clock.today, -29), to: clock.today },
    filters: { owners: [], parents: [] }, page: 1, pageSize: 25,
  });
}

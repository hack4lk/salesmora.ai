import type { Knex } from 'knex';
import type { AuthorizationContext, EstimateDecisionsResult } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedEstimateQuery } from '../estimates/read';
import { verifiedEstimateFrozenSnapshot } from '../estimates/sharing-paper';

export async function estimateReportContext(trx: Knex.Transaction, context: AuthorizationContext, forceAssigned = false) {
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const domain = resolveAuthorizedCollectionScope(context, 'estimates.read');
  if (!report.allowed || report.resourceKind !== 'report' || !domain.allowed ||
    domain.resourceKind !== 'estimate' || !['workspace', 'assigned_job'].includes(domain.scope)) {
    throw new AuthorizationAccessError();
  }

  const assigned = forceAssigned || report.scope === 'assigned' || domain.scope === 'assigned_job';
  if (assigned && !report.sourceScopes?.job) throw new AuthorizationAccessError();
  const scope = assigned ? 'assigned_job' : 'workspace';
  const includeArchived = authorize(context, { permission: 'estimates.archive',
    resource: { kind: 'estimate', id: context.workspaceId, workspaceId: context.workspaceId, job: null },
  }).allowed;
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
    trx.raw('CURRENT_TIMESTAMP AS "asOf"'),
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
    throw new Error('The workspace clock is unavailable for the Estimate report.');
  }
  const scoped = scopedEstimateQuery(trx, context, scope);
  const query = scoped.clone()
    .whereNotExists(trx('estimates as newer').select(trx.raw('1')).whereRaw(
      `newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber"
       AND newer.revision > e.revision AND (newer."sentAt" IS NOT NULL OR newer."publishedAt" IS NOT NULL)`))
    .where(builder => builder.whereNotNull('e.sentAt').orWhereNotNull('e.publishedAt'));
  return { query, scoped, scope, assigned, includeArchived, clock, report };
}

export function estimateReportHandoffAllowed(
  context: AuthorizationContext, auth: Awaited<ReturnType<typeof estimateReportContext>>,
): boolean {
  const leads = resolveAuthorizedCollectionScope(context, 'leads.read');
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  return !auth.assigned && auth.report.scope === 'workspace' &&
    auth.report.sourceScopes?.lead === 'workspace' && auth.report.sourceScopes?.job === 'workspace' &&
    leads.allowed && leads.scope === 'workspace' && jobs.allowed && jobs.scope === 'workspace';
}

export function estimateReportFrozenMoney(
  content: unknown, contentHash: string | null, number: string, revision: number,
  decision?: { total: string; acceptedTotal?: string | null },
): EstimateDecisionsResult['rows'][number]['money'] {
  const snapshot = contentHash === null ? null : verifiedEstimateFrozenSnapshot(content, contentHash);
  const valid = snapshot && snapshot.content.number === number && snapshot.content.revision === revision &&
    (!decision || String(snapshot.amounts.totalCents) === decision.total &&
      (decision.acceptedTotal === undefined || decision.acceptedTotal === decision.total));
  return valid
    ? { kind: 'available', preTaxCents: snapshot.amounts.subtotalCents - snapshot.amounts.discountCents,
      taxCents: snapshot.amounts.taxCents, customerTotalCents: snapshot.amounts.totalCents }
    : { kind: 'unavailable', explanation: 'The issued snapshot or saved decision amount could not be verified.' };
}

export function addEstimateReportMoney(
  total: EstimateDecisionsResult['money'], value: EstimateDecisionsResult['rows'][number]['money'],
): EstimateDecisionsResult['money'] {
  if (total.kind === 'unavailable') return total;
  if (value.kind === 'unavailable') return value;
  const preTaxCents = total.preTaxCents + value.preTaxCents;
  const customerTotalCents = total.customerTotalCents + value.customerTotalCents;
  return Number.isSafeInteger(preTaxCents) && Number.isSafeInteger(customerTotalCents)
    ? { kind: 'available', preTaxCents, customerTotalCents }
    : { kind: 'unavailable', explanation: 'Frozen quote value exceeds the safe integer range.' };
}

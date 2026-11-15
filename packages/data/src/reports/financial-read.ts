import type { Knex } from 'knex';
import { financialReportQuerySchema, financialReportReadResultSchema, financialReportNativeQueries,
  type AuthorizationContext, type FinancialReportQuery, type FinancialReportReadResult } from '@salesmora/contracts';
import { addCalendarDays, authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readFinancialEstimatesReportInTransaction } from './financial-estimates';
import { readFinancialMaterialsReportInTransaction } from './financial-materials';
import { resolveFinancialReportExportAccess } from './financial-export-access';

function financialAuthority(context: AuthorizationContext) {
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!report.allowed || report.resourceKind !== 'report' ||
    !authorize(context, { permission: 'reports.financial.read' }).allowed) throw new AuthorizationAccessError();
  return report;
}

/** Compose the existing native snapshots sequentially without claiming a cross-section atomic population. */
export async function readFinancialReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: FinancialReportQuery,
): Promise<FinancialReportReadResult> {
  const query = financialReportQuerySchema.parse(rawQuery), authority = financialAuthority(context);
  if (query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const requests = financialReportNativeQueries(query);
  const accepted = await readFinancialEstimatesReportInTransaction(trx, context, requests.accepted);
  const awaiting = await readFinancialEstimatesReportInTransaction(trx, context, requests.awaiting);
  const materials = await readFinancialMaterialsReportInTransaction(trx, context, requests.materials);
  const orders = resolveAuthorizedCollectionScope(context, 'workorders.read');
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  return financialReportReadResultSchema.parse({
    workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    today: materials.today, timezone: materials.timezone, query, reports: { accepted, awaiting, materials },
    exportAccess: resolveFinancialReportExportAccess(context),
    authority: {
      scope: authority.scope, financial: true,
      estimates: accepted.estimates.kind === 'accepted' ? {
        scope: accepted.estimates.report.scope, archives: accepted.estimates.report.archiveVisibility, money: true,
      } : null,
      materials: { scope: materials.scope, read: orders.allowed, costs: materials.costs.kind === 'available',
        jobLabels: jobs.allowed && !!authority.sourceScopes?.job },
    },
  });
}
export async function initialFinancialReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<FinancialReportReadResult> {
  financialAuthority(context);
  const clock = await trx('workspaces').where({ id: context.workspaceId })
    .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string') throw new Error('The workspace Financial clock is unavailable.');
  return readFinancialReportWithAuthorityInTransaction(trx, context, financialReportQuerySchema.parse({
    workspaceId: context.workspaceId, view: 'financial', period: { from: addCalendarDays(clock.today, -29), to: clock.today },
    selected: 'accepted', page: 1, pageSize: 25,
  }));
}

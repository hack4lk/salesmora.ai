import type { Knex } from 'knex';
import { activityReportQuerySchema, activityReportReadResultSchema,
  type ActivityReportQuery, type ActivityReportReadResult, type AuthorizationContext } from '@salesmora/contracts';
import { addCalendarDays, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { readActivityReportInTransaction } from './activity';
import { resolveActivityReportExportScopes } from './activity-export-access';

export async function readActivityReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: ActivityReportQuery,
): Promise<ActivityReportReadResult> {
  const query = activityReportQuerySchema.parse(rawQuery);
  const authority = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (query.workspaceId !== context.workspaceId || !authority.allowed || authority.resourceKind !== 'report') {
    throw new AuthorizationAccessError();
  }
  const report = await readActivityReportInTransaction(trx, context, query);
  const scopes = resolveActivityReportExportScopes(context);
  return activityReportReadResultSchema.parse({
    workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    authority: { scope: authority.scope }, exportScopes: report.includedDomains.flatMap(item => {
      const scope = scopes[item.domain];
      return scope ? [{ domain: item.domain, scope }] : [];
    }), query, report,
  });
}
export async function initialActivityReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<ActivityReportReadResult> {
  const authority = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!authority.allowed || authority.resourceKind !== 'report') throw new AuthorizationAccessError();
  const clock = await trx('workspaces').where({ id: context.workspaceId })
    .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.today !== 'string') throw new Error('The workspace Activity clock is unavailable.');
  return readActivityReportWithAuthorityInTransaction(trx, context, activityReportQuerySchema.parse({
    workspaceId: context.workspaceId, view: 'activity',
    period: { from: addCalendarDays(clock.today, -29), to: clock.today },
    filters: { domains: [], actions: [], actors: [] }, page: 1, pageSize: 25,
  }));
}

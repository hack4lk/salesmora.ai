import type { Knex } from 'knex';
import type { AuthorizationContext, CalendarExportOutputScopes } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';

export async function calendarReportContext(trx: Knex.Transaction, context: AuthorizationContext, workspaceId: string,
  exportScopes?: CalendarExportOutputScopes) {
  if (workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const calendar = resolveAuthorizedCollectionScope(context, 'calendar.read');
  const jobs = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const orders = resolveAuthorizedCollectionScope(context, 'workorders.read');
  if (!report.allowed || !calendar.allowed || !['workspace', 'own_assigned'].includes(calendar.scope) ||
    !jobs.allowed && !orders.allowed) throw new AuthorizationAccessError();
  const own = report.scope === 'assigned' || calendar.scope === 'own_assigned';
  const wide = !own && (jobs.allowed && jobs.scope === 'workspace' &&
    (!exportScopes || exportScopes.jobs.kind === 'available' && exportScopes.jobs.scope === 'workspace') ||
    orders.allowed && orders.scope === 'workspace' &&
    (!exportScopes || exportScopes.workOrders.kind === 'available' && exportScopes.workOrders.scope === 'workspace'));
  const clock = await trx('workspaces').where({ id: context.workspaceId }).select('timezone',
    trx.raw('CURRENT_TIMESTAMP AS "asOf"'),
    trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof clock?.timezone !== 'string' || !(clock.asOf instanceof Date) || typeof clock.today !== 'string') {
    throw new Error('The workspace clock is unavailable for Calendar reporting.');
  }
  return { own, wide, timezone: clock.timezone, today: clock.today, asOf: clock.asOf.toISOString() };
}

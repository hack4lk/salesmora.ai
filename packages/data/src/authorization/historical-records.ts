import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from './store';
import { scopedLeadQuery } from '../leads/query';
import { scopedJobQuery } from '../jobs/query';
import { scopedEstimateQuery } from '../estimates/read';
import { scoped as scopedWorkOrders } from '../work-orders/store';
import { scopedCalendarRecordsQuery } from '../calendar/read';

export type AssistantCapturedRecords = Partial<Record<
  'lead' | 'job' | 'customer' | 'estimate' | 'work_order' | 'capture_source' | 'calendar_visit', readonly string[]
>>;

/** Recheck only captured source IDs, under canonical current tenant/assignment predicates. */
export async function assistantCapturedRecordsAllowed(
  trx: Knex.Transaction, context: AuthorizationContext, records: AssistantCapturedRecords,
) {
  const ids = (kind: keyof AssistantCapturedRecords) => [...new Set(records[kind] ?? [])];
  const complete = async (query: Knex.QueryBuilder, column: string, captured: string[]) => {
    if (!captured.length) return true;
    const rows: { id: string }[] = await query.whereIn(column, captured).distinct({ id: column });
    return rows.length === captured.length;
  };
  try {
    const leads = ids('lead');
    if (leads.length) {
      const { query } = scopedLeadQuery(trx, context);
      if (!authorize(context, { permission: 'leads.archive', resource: {
        kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null,
      } }).allowed) query.whereNull('l.archivedAt');
      if (!await complete(query, 'l.id', leads)) return false;
    }
    if (ids('job').length && !await complete(scopedJobQuery(trx, context).query, 'j.id', ids('job'))) return false;
    if (ids('estimate').length) {
      const scope = resolveAuthorizedCollectionScope(context, 'estimates.read');
      if (!scope.allowed || !['workspace', 'assigned_job'].includes(scope.scope)) return false;
      const query = scopedEstimateQuery(trx, context, scope.scope as 'workspace' | 'assigned_job');
      if (!authorize(context, { permission: 'estimates.archive', resource: {
        kind: 'estimate', id: context.workspaceId, workspaceId: context.workspaceId, job: null,
      } }).allowed) query.whereNull('e.archivedAt');
      if (!await complete(query, 'e.id', ids('estimate'))) return false;
    }
    if (ids('work_order').length &&
      !await complete(scopedWorkOrders(trx, context), 'w.id', ids('work_order'))) return false;
    if (ids('customer').length) {
      const scope = resolveAuthorizedCollectionScope(context, 'customers.read');
      const full = scope.allowed && scope.scope === 'workspace';
      const query = trx('customers as c').where('c.workspaceId', context.workspaceId);
      if (!full) {
        if (!leads.length) return false;
        const { query: related } = scopedLeadQuery(trx, context);
        const links: { id: string; customerId: string; ownerId: string | null }[] = await related
          .whereIn('l.id', leads).whereIn('l.customerId', ids('customer'))
          .select('l.id', 'l.customerId', 'l.ownerId');
        const allowed = links.filter(lead => authorize(context, { permission: 'customers.related.read', resource: {
          kind: 'customer', id: lead.customerId, workspaceId: context.workspaceId,
          related: [{ kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId }],
        } }).allowed);
        if (ids('customer').some(id => !allowed.some(lead => lead.customerId === id))) return false;
      }
      if (!await complete(query, 'c.id', ids('customer'))) return false;
    }
    if (ids('capture_source').length) {
      const scope = resolveAuthorizedCollectionScope(context, 'leadCapture.read');
      if (!scope.allowed || scope.scope !== 'workspace' ||
        !await complete(trx('captureSources').where('workspaceId', context.workspaceId), 'id', ids('capture_source'))) return false;
    }
    if (ids('calendar_visit').length) {
      const visible = scopedCalendarRecordsQuery(trx, context).as('captured_calendar');
      if (!await complete(trx.from(visible), 'visitId', ids('calendar_visit'))) return false;
    }
    return true;
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

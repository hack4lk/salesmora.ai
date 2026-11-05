import 'server-only';
import type { AuditQuery } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';

export const auditCategorySQL = `CASE
  WHEN e.action LIKE 'staff.%' OR e.action LIKE 'audit.viewer.%' THEN 'staff'
  WHEN e.action LIKE 'auth.%' OR e.action LIKE 'admin.auth.%' THEN 'access'
  WHEN e.action LIKE 'impersonation.%' THEN 'viewas'
  WHEN e.action LIKE 'audit.%' OR e.action LIKE 'ops.%' THEN 'operations'
  WHEN e.action LIKE 'user.%' THEN 'users'
  WHEN e.action LIKE 'workspace.%' THEN 'workspaces'
  ELSE 'other' END`;

export function auditQuery(trx: Knex.Transaction, filters: AuditQuery, asOf: Date, throughSequence: string) {
  const start = filters.range === 'today' ? new Date(`${asOf.toISOString().slice(0, 10)}T00:00:00Z`)
    : new Date(asOf.getTime() - (filters.range === 'week' ? 7 : filters.range === 'month' ? 30 : 365) * 86400000);
  const base = trx.withSchema('admin').table('auditEvents as e').leftJoin('staffUsers as u', 'u.id', 'e.staffUserId')
    .where('e.sequence', '<=', throughSequence).whereBetween('e.occurredAt', [start, asOf]);
  if (filters.actor === 'system') base.whereNull('e.staffUserId');
  else if (filters.actor) base.where('e.staffUserId', filters.actor);
  if (filters.category !== 'all') base.whereRaw(`${auditCategorySQL} = ?`, [filters.category]);
  if (filters.query) {
    const search = `%${filters.query.replace(/[\\%_]/g, '\\$&')}%`;
    base.where(function () {
      for (const column of ['e.id', 'e.action', 'e.staffUserId', 'u.name', 'e.targetId', 'e.targetType', 'e.workspaceId', 'e.requestId', 'e.reason']) {
        this.orWhereRaw('?? ILIKE ? ESCAPE \'\\\'', [column, search]);
      }
    });
  }
  return base;
}

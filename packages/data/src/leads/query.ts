import type { Knex } from 'knex';
import type { AuthorizationContext, LeadListQuery } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';

export function scopedLeadQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads as l').where('l.workspaceId', scope.workspaceId);
  if (scope.scope === 'assigned') query.andWhere('l.ownerId', context.userId);
  return { query, scope: scope.scope as 'workspace' | 'assigned' };
}
export async function workspaceTimezone(trx: Knex.Transaction, workspaceId: string) {
  const row = await trx('workspaces').where({ id: workspaceId }).first('timezone');
  try { new Intl.DateTimeFormat('en-US', { timeZone: row.timezone }).format(); return row.timezone as string; } catch { return 'UTC'; }
}
export function filteredLeadQuery(query: Knex.QueryBuilder, input: LeadListQuery, identity: WorkspaceIdentity, zone: string) {
  if (!input.archived) query.whereNull('l.archivedAt');
  if (input.stages.length) query.whereIn('l.stage', input.stages); if (input.sources.length) query.whereIn('l.source', input.sources);
  if (input.ownerIds.length) query.andWhere(function () {
    const ids = input.ownerIds.filter(id => id !== 'unassigned').map(id => id === 'me' ? identity.userId : id);
    if (ids.length) this.whereIn('l.ownerId', ids); if (input.ownerIds.includes('unassigned')) this.orWhereRaw(`NOT EXISTS (SELECT 1 FROM "workspaceMemberships" um WHERE um."workspaceId" = l."workspaceId" AND um."userId" = l."ownerId")`);
  });
  if (input.attention) query.andWhere(function () { this.whereRaw(`NOT EXISTS (SELECT 1 FROM "workspaceMemberships" um WHERE um."workspaceId" = l."workspaceId" AND um."userId" = l."ownerId")`).orWhereRaw(`l."lastActivityAt" < CURRENT_TIMESTAMP - INTERVAL '7 days'`); });
  if (input.q.length >= 2) {
    const like = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`, digits = input.q.replace(/\D/g, '');
    query.andWhere(function () {
      for (const field of ['name', 'email', 'service', 'address']) this.orWhereILike(`l.${field}`, like);
      if (/^[+()\d\s.-]+$/.test(input.q) && digits.length >= 2) this.orWhereRaw(`regexp_replace(l.phone,'[^0-9]','','g') LIKE ?`, [`%${digits}%`]); else this.orWhereILike('l.phone', like);
    });
  }
  if (input.created === 'custom') query.whereRaw(`l."createdAt" >= (?::date::timestamp AT TIME ZONE ?) AND l."createdAt" < ((?::date + 1)::timestamp AT TIME ZONE ?)`, [input.from!, zone, input.to!, zone]);
  else if (input.created !== 'any') query.whereRaw(`l."createdAt" >= ((((CURRENT_TIMESTAMP AT TIME ZONE ?)::date - ?)::timestamp) AT TIME ZONE ?) AND l."createdAt" < ((((CURRENT_TIMESTAMP AT TIME ZONE ?)::date + 1)::timestamp) AT TIME ZONE ?)`, [zone, input.created === '7days' ? 6 : 29, zone, zone, zone]);
  return query;
}

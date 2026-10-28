import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
/** Trusted notification services: constrain Job scope before projection, counts or delivery. */
export function readableNotificationJobs(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const query = trx('jobs as j').where('j.workspaceId', context.workspaceId);
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) return query.whereRaw('false');
  if (scope.scope === 'assigned') query.where(q => q.where('j.primaryOwnerId', context.userId).orWhereExists(
    trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('t."workspaceId"=j."workspaceId" AND t."jobId"=j.id').where('t.userId', context.userId)));
  return query;
}

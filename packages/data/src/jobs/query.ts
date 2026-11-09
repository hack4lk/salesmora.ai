import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';

export type JobScope = 'workspace' | 'assigned';

export function scopedJobQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  forceAssigned = false,
): { query: Knex.QueryBuilder; scope: JobScope } {
  const access = resolveAuthorizedCollectionScope(context, 'jobs.read');
  if (!access.allowed || !['workspace', 'assigned'].includes(access.scope)) {
    throw new AuthorizationAccessError();
  }
  const scope: JobScope = access.scope === 'assigned' || forceAssigned ? 'assigned' : 'workspace';
  const query = trx('jobs as j').where('j.workspaceId', context.workspaceId);
  if (scope === 'assigned') {
    query.andWhere(builder => builder
      .where('j.primaryOwnerId', context.userId)
      .orWhereExists(
        trx('jobTeamMembers as jt')
          .select(trx.raw('1'))
          .whereRaw('jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id')
          .where('jt.userId', context.userId),
      ));
  }
  return { query, scope };
}

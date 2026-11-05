import type { Knex } from 'knex';

/**
 * Background work for a suspended workspace is held, not dropped (decision D5): its rows stay
 * queued and are picked up again after unsuspend. `workspaceColumn` must be table-qualified.
 */
export function withoutSuspendedWorkspaces<T extends Knex.QueryBuilder>(query: T, workspaceColumn: string): T {
  return query.whereNotExists(function () {
    this.select('heldWorkspace.id').from('workspaces as heldWorkspace')
      .whereRaw('"heldWorkspace"."id" = ??', [workspaceColumn]).whereNotNull('heldWorkspace.suspendedAt');
  }) as T;
}

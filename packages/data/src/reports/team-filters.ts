import type { Knex } from 'knex';
import type { AuthorizationContext, TeamReportFilters } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';

export async function validateTeamReportMembers(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  assigned: boolean,
  filters: TeamReportFilters,
): Promise<void> {
  if (filters.members.length === 0) return;
  if (assigned && filters.members.some(id => id !== context.userId)) throw new AuthorizationAccessError();
  const members = await trx('workspaceMemberships').where({ workspaceId: context.workspaceId })
    .whereIn('userId', filters.members).select<{ userId: string }[]>('userId');
  if (members.length !== filters.members.length) throw new AuthorizationAccessError();
}

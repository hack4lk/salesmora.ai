import 'server-only';
import { AuthorizationAccessError, workspaceAIAllowance } from '@salesmora/data';
import { authorizedWorkspace } from '../authorization/permissions';

/** Authorize before touching the ledger; never accept a caller-supplied role. */
export async function readWorkspaceAIUsage(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    if (context.membership.role !== 'owner') throw new AuthorizationAccessError();
    const { rows } = await trx.raw('SELECT clock_timestamp() AS now');
    const now = new Date(rows[0].now);
    const allowance = await workspaceAIAllowance(trx, workspaceId, now);
    const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
    return { context, usage: { usedOrReservedTokens: allowance.usedTokens.toString(), monthlyTokens: String(allowance.monthlyTokens), resetAt } };
  });
}

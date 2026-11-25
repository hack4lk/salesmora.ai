import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, effectiveWorkspacePlan, getWorkspacePlan } from '@salesmora/domain';
import { WorkflowDraftError } from './recipients';

/** One scoped projection; reuse the caller's authorization and workspace write lock. */
export async function readWorkflowCapacity(trx: Knex.Transaction, context: AuthorizationContext) {
  const row = await trx('workspaces as w').leftJoin('workspaceSubscriptions as s', 's.workspaceId', 'w.id')
    .where('w.id', context.workspaceId).first('w.planOverride', 'w.planOverrideEndsAt', 's.plan', 's.status', 's.paidThrough', 's.recoveryUntil',
      trx.raw('statement_timestamp() AS now'),
      trx.raw('(SELECT count(*) FROM workflows f WHERE f."workspaceId"=w.id AND f."deletedAt" IS NULL) AS used'));
  if (!row) throw Error('Workspace unavailable.');
  const plan = effectiveWorkspacePlan(row, row, new Date(row.now)).plan;
  return { plan, limit: getWorkspacePlan(plan).limits.workflows, used: Number(row.used),
    canManageBilling: authorize(context, { permission: 'billing.manage' }).allowed || authorize(context, { permission: 'billing.read' }).allowed };
}

/** Publication already holds the workspace write lock, serializing the final slot. */
export async function assertWorkflowCapacity(trx: Knex.Transaction, context: AuthorizationContext) {
  const capacity = await readWorkflowCapacity(trx, context);
  if (capacity.used >= capacity.limit) {
    const label = { free: 'Free', standard: 'Standard', premium: 'Premium' }[capacity.plan];
    throw new WorkflowDraftError(`${label} includes ${capacity.limit} workflows. Active and paused workflows count toward this limit. Delete a workflow${capacity.plan === 'premium' ? '' : ' or upgrade your plan'} before publishing another.`);
  }
}

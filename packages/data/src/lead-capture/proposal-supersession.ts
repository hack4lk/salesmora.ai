import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { WorkspaceIdentity } from '../authorization/store';
/** Workspace write lock serializes both proposal families; one new review retires older pending intent. */
export async function supersedeCaptureProposals(trx: Knex.Transaction, identity: WorkspaceIdentity, threadId: string, at: Date, family: 'setup' | 'source') {
  const table = family === 'setup' ? 'chatCaptureSetupProposals' : 'chatCaptureSourceProposals', audit = family === 'setup' ? 'chatCaptureSetupAudit' : 'chatCaptureSourceAudit';
  // Setup remains usable while the additive publication/lifecycle migration is pending locally.
  if (family === 'source' && !await trx.schema.hasTable(table))
    return;
  const rows = await trx(table).where({ ...identity, threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: at }).returning('*');
  for (const row of rows)
    await trx(audit).insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, proposalId: row.id, operation: row.payload.input.operation, action: 'superseded', inputHash: row.payload.view.ticket.inputHash });
}

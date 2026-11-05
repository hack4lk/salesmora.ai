import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { LeadInput } from '@salesmora/contracts';
import { assertLeadCapacity } from '../billing/entitlements';
/** Internal admission primitive. Caller establishes authority and holds the workspace write lock.
 * Manual/chat and approved public capture share capacity, numbering, history and admission tracking. */
export async function insertAdmittedLead(trx: Knex.Transaction, input: LeadInput, identity: { workspaceId: string; createdBy: string | null; submissionId: string; submissionHash: string }, ownerId: string | null = null) {
  const createdAt = await assertLeadCapacity(trx, identity.workspaceId, { enforce: identity.createdBy === null });
  const rows = await trx('leads').insert({ ...input, ...identity, ownerId, createdAt, id: randomUUID() }).onConflict(['workspaceId', 'createdBy', 'submissionId']).ignore().returning('id');
  return rows[0]?.id as string | undefined;
}

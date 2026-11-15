import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { supersedeProposals } from '../chat-proposals';
/** Workspace write lock serializes both proposal families; one new review retires older pending intent. */
export async function supersedeCaptureProposals(trx: Knex.Transaction, context: AuthorizationContext, threadId: string, at: Date) {
  await supersedeProposals(trx, context, threadId, 'captureSetup', at.toISOString());
}

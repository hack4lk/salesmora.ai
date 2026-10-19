import type { Knex } from 'knex';

/** Trusted worker operation, never exposed as a browser or model tool. */
export const chatRetentionDays = 90;
const activeStates = ['accepted', 'running'];
function eligible(db: Knex) {
  return db('chatThreads as thread')
    .where('thread.updatedAt', '<', db.raw("CURRENT_TIMESTAMP - interval '90 days'"))
    .whereNotExists(db('chatTurns as turn').select(db.raw('1')).whereRaw('turn."threadId" = thread.id')
      .andWhere(function () {
        this.where('turn.createdAt', '>=', db.raw("CURRENT_TIMESTAMP - interval '90 days'"))
          .orWhere('turn.finishedAt', '>=', db.raw("CURRENT_TIMESTAMP - interval '90 days'"))
          .orWhere(function () { this.whereIn('turn.state', activeStates).where('turn.leaseUntil', '>', db.fn.now()); });
      }));
}

/** One bounded batch; repeated runs are safe. App writes serialize on the workspace row. */
export async function cleanupExpiredChat(db: Knex, batchSize = 100) {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 1000) throw Error('Invalid chat retention batch size');
  const candidates = await eligible(db).orderBy('thread.updatedAt').orderBy('thread.id')
    .limit(batchSize).select('thread.id', 'thread.workspaceId');
  let deletedThreads = 0;
  for (const candidate of candidates) {
    deletedThreads += await db.transaction(async trx => {
      // Chat acceptance, permissions and confirmations acquire this same lock first.
      // Skip busy workspaces; the next scheduled batch can retry them.
      if (!await trx('workspaces').where({ id: candidate.workspaceId }).forUpdate().skipLocked().first('id')) return 0;
      if (!await eligible(trx).where('thread.id', candidate.id).where('thread.workspaceId', candidate.workspaceId).first('thread.id')) return 0;
      const turnIds = trx('chatTurns').where({ threadId: candidate.id, workspaceId: candidate.workspaceId }).select(trx.raw('id::text'));
      for (const table of ['checkpoint_writes', 'checkpoint_blobs', 'checkpoints']) {
        await trx(table).whereIn('thread_id', turnIds.clone()).delete();
      }
      // FK cascades delete turns, messages and draft payloads. Audit/usage have no FK.
      return Number(await trx('chatThreads').where({ id: candidate.id, workspaceId: candidate.workspaceId }).delete());
    });
  }
  return { scannedThreads: candidates.length, deletedThreads };
}

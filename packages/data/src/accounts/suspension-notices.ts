import type { Knex } from 'knex';

export interface WorkspaceSuspensionNoticeMail { id: string; to: string; workspaceName: string }
export interface WorkspaceSuspensionNoticeSummary { sent: number; skipped: number; retryPending: number; failed: number }

const maxAttempts = 5;

/**
 * Sends the Owner notice queued by `suspendWorkspace`. Runs as the worker role, which may only read
 * and update notice rows. Unlike other outboxes this one is not held: it exists to reach the Owner
 * while the workspace is suspended. A notice for a workspace that is no longer suspended is skipped.
 */
export async function processWorkspaceSuspensionNotices(
  db: Knex,
  send: (mail: WorkspaceSuspensionNoticeMail) => Promise<void>,
  limit = 10,
): Promise<WorkspaceSuspensionNoticeSummary> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid suspension notice batch size.');
  const summary: WorkspaceSuspensionNoticeSummary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates: { id: string }[] = await db('workspaceSuspensionNotices').where({ status: 'queued' })
    .where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id');
  for (const candidate of candidates) {
    await db.transaction(async trx => {
      const notice = await trx('workspaceSuspensionNotices').where({ id: candidate.id, status: 'queued' })
        .where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first('id', 'workspaceId', 'attempts');
      if (!notice) return;
      const target = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId')
        .where('w.id', notice.workspaceId).whereNotNull('w.suspendedAt').whereNull('w.deletionRequestedAt')
        .whereNull('u.deletionRequestedAt').first('w.businessName', 'u.email', 'u.emailVerified');
      if (!target?.emailVerified) {
        await trx('workspaceSuspensionNotices').where({ id: notice.id }).update({ status: 'skipped' });
        summary.skipped++;
        return;
      }
      const attempts = notice.attempts + 1;
      try {
        await send({ id: notice.id, to: target.email, workspaceName: target.businessName });
        await trx('workspaceSuspensionNotices').where({ id: notice.id }).update({ status: 'sent', attempts, sentAt: trx.fn.now() });
        summary.sent++;
      } catch {
        const failed = attempts >= maxAttempts;
        summary[failed ? 'failed' : 'retryPending']++;
        await trx('workspaceSuspensionNotices').where({ id: notice.id }).update({
          status: failed ? 'failed' : 'queued', attempts,
          nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)),
        });
      }
    });
  }
  return summary;
}

import type { Knex } from 'knex';
import type { OwnershipNoticeRecipient } from '../email/ownership-transferred';

export interface WorkspaceOwnershipNoticeMail {
  id: string; to: string; recipient: OwnershipNoticeRecipient; workspaceName: string; newOwnerName: string; previousOwnerName: string;
}
export interface WorkspaceOwnershipNoticeSummary { sent: number; skipped: number; retryPending: number; failed: number }

const maxAttempts = 5;

/**
 * Sends the notices queued by `transferWorkspaceOwnership`. Runs as the worker role, which may only read and
 * update notice rows. Like the suspension notice it is not held while the workspace is suspended, because it
 * has no link into the app. A notice is skipped once it is no longer true: the workspace is being deleted,
 * ownership moved again, the previous Owner left, or the recipient can't receive email.
 */
export async function processWorkspaceOwnershipNotices(
  db: Knex,
  send: (mail: WorkspaceOwnershipNoticeMail) => Promise<void>,
  limit = 10,
): Promise<WorkspaceOwnershipNoticeSummary> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid ownership notice batch size.');
  const summary: WorkspaceOwnershipNoticeSummary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates: { id: string }[] = await db('workspaceOwnershipNotices').where({ status: 'queued' })
    .where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id');
  for (const candidate of candidates) {
    await db.transaction(async trx => {
      const notice = await trx('workspaceOwnershipNotices').where({ id: candidate.id, status: 'queued' })
        .where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked()
        .first<{ id: string; workspaceId: string; recipient: OwnershipNoticeRecipient; fromUserId: string; toUserId: string; attempts: number } | undefined>(
          'id', 'workspaceId', 'recipient', 'fromUserId', 'toUserId', 'attempts');
      if (!notice) return;
      const workspace = await trx('workspaces').where({ id: notice.workspaceId, ownerId: notice.toUserId }).whereNull('deletionRequestedAt').first('businessName');
      const people = await trx('users as u').join('workspaceMemberships as m', 'm.userId', 'u.id').where('m.workspaceId', notice.workspaceId)
        .whereIn('u.id', [notice.fromUserId, notice.toUserId])
        .select<{ id: string; name: string; email: string; emailVerified: boolean; deletionRequestedAt: Date | null }[]>('u.id', 'u.name', 'u.email', 'u.emailVerified', 'u.deletionRequestedAt');
      const newOwner = people.find(person => person.id === notice.toUserId);
      const previousOwner = people.find(person => person.id === notice.fromUserId);
      const to = notice.recipient === 'new_owner' ? newOwner : previousOwner;
      if (!workspace || !newOwner || !previousOwner || !to?.emailVerified || to.deletionRequestedAt) {
        await trx('workspaceOwnershipNotices').where({ id: notice.id }).update({ status: 'skipped' });
        summary.skipped++;
        return;
      }
      const attempts = notice.attempts + 1;
      try {
        await send({ id: notice.id, to: to.email, recipient: notice.recipient, workspaceName: workspace.businessName, newOwnerName: newOwner.name, previousOwnerName: previousOwner.name });
        await trx('workspaceOwnershipNotices').where({ id: notice.id }).update({ status: 'sent', attempts, sentAt: trx.fn.now() });
        summary.sent++;
      } catch {
        const failed = attempts >= maxAttempts;
        summary[failed ? 'failed' : 'retryPending']++;
        await trx('workspaceOwnershipNotices').where({ id: notice.id }).update({
          status: failed ? 'failed' : 'queued', attempts,
          nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)),
        });
      }
    });
  }
  return summary;
}

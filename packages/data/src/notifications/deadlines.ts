import { readableNotificationJobs } from './job-access';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { AuthorizationContext, DeadlineNotificationRecord, PermissionId } from '@salesmora/contracts';
import { reminderClock, reminderDeadlineForDate } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { effectiveJobNotificationPolicy } from '../job-notification-settings/policy';

const jobDates = `to_char(j."completionDeadline",'YYYY-MM-DD') AS "completionDeadline"`;
const noticeDates = `to_char(n."completionDeadline",'YYYY-MM-DD') AS "completionDeadline", to_char(n."reminderDate",'YYYY-MM-DD') AS "reminderDate"`;
/** Current Job read scope applies before unread counts, paging, mark-read and email projection. */
export function deadlineNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return readableNotificationJobs(trx, context).join('deadlineNotifications as n', function () {
    this.on('n.jobId', 'j.id').andOn('n.workspaceId', 'j.workspaceId');
  }).where('n.userId', context.userId);
}
export async function readDeadlineNotifications(trx: Knex.Transaction, context: AuthorizationContext, take: number) {
  const query = deadlineNotificationQuery(trx, context);
  const unread = Number((await query.clone().whereNull('n.readAt').count({ count: 'n.id' }).first())?.count ?? 0);
  const rows = await query.select('n.id', 'n.event', 'n.jobId', 'j.jobNumber', 'j.title', 'n.timezone', 'n.createdAt', 'n.readAt', trx.raw(noticeDates))
    .orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
  return { unread, items: rows.map(row => ({
    kind: 'deadline' as const, id: row.id, event: row.event, jobId: row.jobId, jobNumber: `J-${String(row.jobNumber).padStart(4, '0')}`,
    jobTitle: row.title, completionDeadline: row.completionDeadline, reminderDate: row.reminderDate, timezone: row.timezone,
    createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt,
  } satisfies DeadlineNotificationRecord)) };
}
async function recipients(trx: Knex.Transaction, workspaceId: string, job: { id: string; primaryOwnerId: string | null }, extra: string[]) {
  const team = await trx('jobTeamMembers').where({ workspaceId, jobId: job.id }).pluck('userId');
  return new Set<string>([...team, ...extra, ...(job.primaryOwnerId ? [job.primaryOwnerId] : [])]);
}
async function databaseNow(trx: Knex.Transaction) {
  return new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
}
/** Daily occurrences only: no retroactive backlog. Restart catches up after today's send time.
 * Workspace write locks serialize enqueue with policy, entitlement and Job mutations.
 * Unique recipient/Job generation/semantic offset keys survive restarts and offset-ID edits. */
export async function scheduleDeadlineReminders(db: Knex, enabled: readonly PermissionId[]) {
  let created = 0, failed = 0;
  const workspaces = await db('workspaces').whereNull('deletionRequestedAt').select('id', 'ownerId');
  for (const workspace of workspaces) {
    try {
      const count = await withWorkspaceAuthorization(db, { workspaceId: workspace.id, userId: workspace.ownerId }, enabled, true, async (trx, owner) => {
        const { timezone } = await trx('workspaces').where({ id: workspace.id }).first('timezone');
        const now = await databaseNow(trx), clock = reminderClock(now, timezone);
        const policy = await effectiveJobNotificationPolicy(trx, workspace.id);
        if (clock.time < policy.reminders.sendTime) return 0;
        let added = 0;
        for (const offset of policy.reminders.offsets) {
          const deadline = reminderDeadlineForDate(clock.date, offset.relative, offset.days), offsetKey = `${offset.relative}:${offset.days}`;
          const jobs = await trx('jobs as j').where('j.workspaceId', workspace.id).where('j.completionDeadline', deadline)
            .whereNotIn('j.status', ['completed', 'canceled']).select('j.id', 'j.primaryOwnerId', 'j.reminderRevision');
          for (const job of jobs) for (const userId of await recipients(trx, workspace.id, job, policy.reminders.extraRecipientIds)) {
            try {
              added += await withWorkspaceAuthorization(trx, { workspaceId: workspace.id, userId }, owner.enabledPermissions, false, async (nested, context) => {
                if (!await readableNotificationJobs(nested, context).where('j.id', job.id).first('j.id')) return 0;
                const event = offset.relative === 'before' ? 'approaching' : offset.relative === 'after' ? 'overdue' : 'due';
                const row = await nested('deadlineNotifications').insert({
                  id: randomUUID(), workspaceId: workspace.id, jobId: job.id, userId, reminderRevision: job.reminderRevision, offsetKey,
                  completionDeadline: deadline, reminderDate: clock.date, timezone, event, createdAt: now, nextAttemptAt: now,
                }).onConflict(['workspaceId', 'jobId', 'reminderRevision', 'offsetKey', 'userId']).ignore().returning('id');
                return row.length;
              });
            } catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; }
          }
        }
        return added;
      });
      created += count;
    } catch (error) {
      if (!(error instanceof AuthorizationAccessError)) failed++;
    }
  }
  return { created, failed };
}
export type DeadlineReminderMail = {
  id: string; to: string; workspaceId: string; workspaceName: string;
  job: { id: string; number: string; title: string }; completionDeadline: string; reminderDate: string; timezone: string;
};
/** Delivery holds a shared workspace lock and row lock across the provider call, rechecking all current gates.
 * Provider idempotency keys handle a crash after acceptance; SMTP itself cannot guarantee exactly once. */
export async function processDeadlineEmails(db: Knex, enabled: readonly PermissionId[], send: (mail: DeadlineReminderMail) => Promise<void>, limit = 10) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates = await db('deadlineNotifications').where({ emailStatus: 'queued' }).where('nextAttemptAt', '<=', db.fn.now())
    .orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
  for (const candidate of candidates) try {
    await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false, async (trx, context) => {
      const row = await trx('deadlineNotifications as n').where({ id: candidate.id, emailStatus: 'queued' }).where('nextAttemptAt', '<=', trx.fn.now())
        .select('n.*', trx.raw(noticeDates)).forUpdate().skipLocked().first();
      if (!row) return;
      const now = await databaseNow(trx);
      const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('businessName', 'timezone');
      const clock = reminderClock(now, workspace.timezone);
      const policy = await effectiveJobNotificationPolicy(trx, context.workspaceId);
      const job = await readableNotificationJobs(trx, context).where('j.id', row.jobId).select('j.id', 'j.jobNumber', 'j.title', 'j.status', 'j.primaryOwnerId', 'j.reminderRevision', trx.raw(jobDates)).first();
      const user = await trx('users').where({ id: context.userId }).first('email', 'emailVerified').forShare();
      const preference = await trx('notificationPreferences').where({ userId: context.userId }).first('deadlineReminderEmail');
      const offset = policy.reminders.offsets.find(o => `${o.relative}:${o.days}` === row.offsetKey);
      const eligible = job && !['completed', 'canceled'].includes(job.status) && job.reminderRevision === row.reminderRevision
        && job.completionDeadline === row.completionDeadline && row.reminderDate === clock.date && row.timezone === workspace.timezone && offset
        && reminderDeadlineForDate(clock.date, offset.relative, offset.days) === job.completionDeadline
        && (await recipients(trx, context.workspaceId, job, policy.reminders.extraRecipientIds)).has(context.userId);
      if (!eligible || !user?.emailVerified || preference?.deadlineReminderEmail === false || !policy.events[row.event === 'overdue' ? 'overdue' : 'approaching']) {
        await trx('deadlineNotifications').where({ id: row.id }).update({ emailStatus: 'skipped' }); summary.skipped++; return;
      }
      // A later send time may have been saved after enqueue. Keep the row for today's later sweep.
      if (clock.time < policy.reminders.sendTime) return;
      const attempts = row.attempts + 1;
      try {
        await send({ id: row.id, to: user.email, workspaceId: context.workspaceId, workspaceName: workspace.businessName,
          job: { id: job.id, number: `J-${String(job.jobNumber).padStart(4, '0')}`, title: job.title },
          completionDeadline: row.completionDeadline, reminderDate: row.reminderDate, timezone: workspace.timezone });
        await trx('deadlineNotifications').where({ id: row.id }).update({ emailStatus: 'sent', attempts, sentAt: now }); summary.sent++;
      } catch {
        const failed = attempts >= 5; summary[failed ? 'failed' : 'retryPending']++;
        await trx('deadlineNotifications').where({ id: row.id }).update({ emailStatus: failed ? 'failed' : 'queued', attempts, nextAttemptAt: new Date(now.getTime() + 60000 * 2 ** (attempts - 1)) });
      }
    });
  } catch (error) {
    if (!(error instanceof AuthorizationAccessError)) throw error;
    await db('deadlineNotifications').where({ id: candidate.id, emailStatus: 'queued' }).update({ emailStatus: 'skipped' }); summary.skipped++;
  }
  return summary;
}

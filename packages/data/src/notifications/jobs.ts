import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { jobDateSchema, jobStatusSchema, type JobStatus, type AuthorizationContext, type JobNotificationRecord, type JobAssignmentRemovalRecord, type PermissionId } from '@salesmora/contracts';
import { withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { effectiveJobNotificationPolicy } from '../job-notification-settings/policy';
import { readableNotificationJobs } from './job-access';

const deadlineDates = `to_char(n."beforeDeadline",'YYYY-MM-DD') AS "beforeDeadline", to_char(n."afterDeadline",'YYYY-MM-DD') AS "afterDeadline"`;

export function jobNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  // Only proven removals get the membership-only exception. All other events require current Job read.
  return trx('jobNotifications as n').where('n.workspaceId', context.workspaceId).where('n.userId', context.userId)
    .where(q => q.whereExists(readableNotificationJobs(trx, context).select(trx.raw('1')).whereRaw('j.id=n."jobId"'))
      .orWhere({ 'n.event': 'assignment', 'n.assignmentChange': 'removed' }));
}
export async function readJobNotifications(trx: Knex.Transaction, context: AuthorizationContext, take: number) {
  const query = jobNotificationQuery(trx, context);
  const unread = Number((await query.clone().whereNull('n.readAt').count({ count: 'n.id' }).first())?.count ?? 0);
  const rows = await query.select('n.*', trx.raw(deadlineDates)).orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
  const items = await Promise.all(rows.map(async (row): Promise<JobNotificationRecord | JobAssignmentRemovalRecord> => {
    const common = { kind: 'job' as const, id: row.id, createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt };
    const job = await readableNotificationJobs(trx, context).where('j.id', row.jobId).first('j.id', 'j.title', 'j.jobNumber');
    if (!job) {
      if (row.event !== 'assignment' || row.assignmentChange !== 'removed') throw new Error('Unauthorized Job notification projection.');
      return { ...common, event: 'assignment', access: 'ended', change: 'removed', jobNumber: row.jobNumberSnapshot };
    }
    const base = { ...common, actorName: row.actorName, jobId: job.id,
      jobNumber: `J-${String(job.jobNumber).padStart(4, '0')}`, jobTitle: job.title };
    if (row.event === 'deadline') return { ...base, event: 'deadline', before: jobDateSchema.nullable().parse(row.beforeDeadline), after: jobDateSchema.nullable().parse(row.afterDeadline), timezone: row.deadlineTimezone };
    if (row.event === 'assignment') return { ...base, event: 'assignment', access: 'current', change: assignmentChange(row.assignmentChange) };
    return row.event === 'created' ? { ...base, event: 'created' } :
      { ...base, event: 'status', before: jobStatusSchema.parse(row.beforeStatus), after: jobStatusSchema.parse(row.afterStatus) };
  }));
  return { unread, items };
}
type AssignmentChange = 'primary' | 'team' | 'updated' | 'removed';
function assignmentChange(value: unknown): AssignmentChange {
  if (value !== 'primary' && value !== 'team' && value !== 'updated' && value !== 'removed') throw new Error('Invalid assignment event.');
  return value;
}
/** Within the confirmed Job transaction, after owner/team and activity exist.
 * Current read authorization is checked at enqueue and again at every projection/delivery. */
type JobEvent = { event: 'created' } | { event: 'status'; before: JobStatus; after: JobStatus } |
  { event: 'deadline'; before: string | null; after: string | null; timezone: string };
async function enqueueJobEvent(trx: Knex.Transaction, context: AuthorizationContext, jobId: string, operationId: string, change: JobEvent) {
  const job = await trx('jobs').where({ workspaceId: context.workspaceId, id: jobId }).first('primaryOwnerId');
  if (!job) throw new Error('Job notification requires an existing record in this transaction.');
  const team = await trx('jobTeamMembers').where({ workspaceId: context.workspaceId, jobId }).pluck('userId');
  const actor = await trx('users').where({ id: context.userId }).first('name');
  for (const userId of new Set<string>([...team, ...(job.primaryOwnerId ? [job.primaryOwnerId] : [])])) {
    if (userId === context.userId) continue;
    try {
      await withWorkspaceAuthorization(trx, { workspaceId: context.workspaceId, userId }, context.enabledPermissions, false, async (nested, recipient) => {
        if (!await readableNotificationJobs(nested, recipient).where('j.id', jobId).first('j.id')) return;
        await nested('jobNotifications').insert({
          id: randomUUID(), workspaceId: context.workspaceId, jobId, operationId, userId, event: change.event,
          ...(change.event === 'deadline' ? { beforeDeadline: change.before, afterDeadline: change.after, deadlineTimezone: change.timezone } : {}),
          ...(change.event === 'status' ? { beforeStatus: change.before, afterStatus: change.after } : {}),
          actorId: context.userId, actorName: actor?.name ?? '',
        }).onConflict(['workspaceId', 'operationId', 'event', 'userId']).ignore();
      });
    } catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; }
  }
}
export async function notifyJobCreated(trx: Knex.Transaction, context: AuthorizationContext, jobId: string, operationId: string) {
  return enqueueJobEvent(trx, context, jobId, operationId, { event: 'created' });
}
/** Explicit status mutation only; schedule-derived transitions already have combined visit notices. */
export async function notifyJobStatusChanged(trx: Knex.Transaction, context: AuthorizationContext, jobId: string, operationId: string, before: JobStatus, after: JobStatus) {
  if (before === after) return;
  return enqueueJobEvent(trx, context, jobId, operationId, { event: 'status', before: jobStatusSchema.parse(before), after: jobStatusSchema.parse(after) });
}
/** Date snapshots are distinct from reminders and visit schedules, including an explicit reviewed reopen deadline. */
export async function notifyJobDeadlineChanged(trx: Knex.Transaction, context: AuthorizationContext, jobId: string, operationId: string, before: string | null, after: string | null) {
  before = jobDateSchema.nullable().parse(before); after = jobDateSchema.nullable().parse(after);
  if (before === after) return;
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  new Intl.DateTimeFormat('en-US', { timeZone: workspace.timezone }).format();
  return enqueueJobEvent(trx, context, jobId, operationId, { event: 'deadline', before, after, timezone: workspace.timezone });
}
type Assignments = { primaryOwnerId: string | null; teamUserIds: string[] };
/** Before assignments come only from the locked mutation row, never from client-supplied evidence. */
export async function notifyJobAssignmentChanged(trx: Knex.Transaction, context: AuthorizationContext, jobId: string, operationId: string, before: Assignments, after: Assignments) {
  const role = (assignment: Assignments, id: string) => assignment.primaryOwnerId === id ? 'primary' : assignment.teamUserIds.includes(id) ? 'team' : 'none';
  const recipients = new Set([...before.teamUserIds, ...after.teamUserIds, before.primaryOwnerId, after.primaryOwnerId].filter((id): id is string => !!id));
  if ([...recipients].every(id => role(before, id) === role(after, id))) return;
  const job = await trx('jobs').where({ workspaceId: context.workspaceId, id: jobId }).first('jobNumber');
  if (!job) throw new Error('Assignment notice requires an existing Job.');
  const actor = await trx('users').where({ id: context.userId }).first('name');
  for (const userId of recipients) {
    if (userId === context.userId) continue;
    const from = role(before, userId), to = role(after, userId);
    const change: AssignmentChange = to === 'none' ? 'removed' : from === to ? 'updated' : to;
    try {
      await withWorkspaceAuthorization(trx, { workspaceId: context.workspaceId, userId }, context.enabledPermissions, false, async (nested, recipient) => {
        if (change !== 'removed' && !await readableNotificationJobs(nested, recipient).where('j.id', jobId).first('j.id')) return;
        await nested('jobNotifications').insert({ id: randomUUID(), workspaceId: context.workspaceId, jobId, operationId, userId,
          event: 'assignment', assignmentChange: change, beforeAssignment: from, afterAssignment: to,
          jobNumberSnapshot: `J-${String(job.jobNumber).padStart(4, '0')}`, actorId: context.userId, actorName: actor?.name ?? '',
        }).onConflict(['workspaceId', 'operationId', 'event', 'userId']).ignore();
      });
    } catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; }
  }
}
export type JobCreatedMail = {
  id: string; to: string; workspaceId: string; workspaceName: string; actorName: string;
  job: { id: string; number: string; title: string };
};
export type JobMail = (JobCreatedMail & (JobEvent | { event: 'assignment'; access: 'current'; change: AssignmentChange })) |
  (Omit<JobCreatedMail, 'job'> & { event: 'assignment'; access: 'ended'; change: 'removed'; job: { number: string } });
/** Actor exclusion, current assignment/read access, verification and both email settings are rechecked under locks.
 * Stable provider keys cover acceptance/commit crashes; SMTP cannot guarantee exactly-once delivery. */
export async function processJobEmails(db: Knex, enabled: readonly PermissionId[], send: (mail: JobMail) => Promise<void>, limit = 10) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates = await db('jobNotifications').where({ emailStatus: 'queued' }).where('nextAttemptAt', '<=', db.fn.now())
    .orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
  for (const candidate of candidates) try {
    await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false, async (trx, context) => {
      const row = await trx('jobNotifications as n').select('n.*', trx.raw(deadlineDates)).where({ 'n.id': candidate.id, emailStatus: 'queued' }).where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first();
      if (!row) return;
      const now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
      const job = await readableNotificationJobs(trx, context).where('j.id', row.jobId).select('j.id', 'j.jobNumber', 'j.title', 'j.primaryOwnerId').first();
      const onTeam = job && (job.primaryOwnerId === context.userId || !!await trx('jobTeamMembers').where({ workspaceId: context.workspaceId, jobId: job.id, userId: context.userId }).first('userId'));
      const user = await trx('users').where({ id: context.userId }).first('email', 'emailVerified').forShare();
      const preferences = await trx('notificationPreferences').where({ userId: context.userId }).first('jobActivityEmail');
      const policy = await effectiveJobNotificationPolicy(trx, context.workspaceId);
      const removal = row.event === 'assignment' && row.assignmentChange === 'removed';
      if ((!removal && (!job || !onTeam)) || row.actorId === context.userId || !user?.emailVerified || preferences?.jobActivityEmail === false || !policy.events[row.event as 'assignment' | 'status' | 'deadline' | 'created']
        || new Date(row.createdAt).getTime() < now.getTime() - 23 * 60 * 60 * 1000) {
        await trx('jobNotifications').where({ id: row.id }).update({ emailStatus: 'skipped' }); summary.skipped++; return;
      }
      const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('businessName');
      const attempts = row.attempts + 1;
      try {
        const common = { id: row.id, to: user.email, workspaceId: context.workspaceId, workspaceName: workspace.businessName };
        if (row.event === 'assignment' && !job) {
          // Do not pass a raw outbox/Job/actor snapshot into the limited email branch.
          await send({ ...common, actorName: '', event: 'assignment', access: 'ended', change: 'removed', job: { number: row.jobNumberSnapshot } });
        } else {
          if (!job) throw new Error('Missing authorized Job projection.');
          await send({ ...common, actorName: row.actorName, job: { id: job.id, number: `J-${String(job.jobNumber).padStart(4, '0')}`, title: job.title },
            ...(row.event === 'deadline' ? { event: 'deadline' as const, before: jobDateSchema.nullable().parse(row.beforeDeadline), after: jobDateSchema.nullable().parse(row.afterDeadline), timezone: row.deadlineTimezone } : row.event === 'assignment' ? { event: 'assignment' as const, access: 'current' as const, change: assignmentChange(row.assignmentChange) } :
              row.event === 'status' ? { event: 'status' as const, before: jobStatusSchema.parse(row.beforeStatus), after: jobStatusSchema.parse(row.afterStatus) } : { event: 'created' as const }) });
        }
        await trx('jobNotifications').where({ id: row.id }).update({ emailStatus: 'sent', attempts, sentAt: now }); summary.sent++;
      } catch {
        const failed = attempts >= 5; summary[failed ? 'failed' : 'retryPending']++;
        await trx('jobNotifications').where({ id: row.id }).update({ emailStatus: failed ? 'failed' : 'queued', attempts, nextAttemptAt: new Date(now.getTime() + 60000 * 2 ** (attempts - 1)) });
      }
    });
  } catch (error) {
    if (!(error instanceof AuthorizationAccessError)) throw error;
    await db('jobNotifications').where({ id: candidate.id, emailStatus: 'queued' }).update({ emailStatus: 'skipped' }); summary.skipped++;
  }
  return summary;
}

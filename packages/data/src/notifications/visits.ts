import { effectiveJobNotificationPolicy } from '../job-notification-settings/policy';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { AuthorizationContext, CalendarRecordRef, CalendarSchedule, VisitNotificationRecord, PermissionId } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { scoped } from '../work-orders/store';
type Ref = Pick<CalendarRecordRef, 'type' | 'id'>;
type Notice = { id: string; workspaceId: string; userId: string; event: VisitNotificationRecord['event']; actorName: string; before: CalendarSchedule; after: CalendarSchedule; timezone: string; createdAt: Date; readAt: Date | null };
function jobs(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const q = trx('jobs as j').where('j.workspaceId', context.workspaceId);
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) return q.whereRaw('false');
  if (scope.scope === 'assigned') q.where(b => b.where('j.primaryOwnerId', context.userId).orWhereExists(trx('jobTeamMembers as t').select(trx.raw('1')).whereRaw('t."workspaceId"=j."workspaceId" AND t."jobId"=j.id').where('t.userId', context.userId)));
  return q;
}
function orders(trx: Knex.Transaction, context: AuthorizationContext) {
  try { return scoped(trx, context).whereNull('w.archivedAt').whereNot('w.status', 'draft'); }
  catch (e) { if (!(e instanceof AuthorizationAccessError)) throw e; return trx('workOrders as w').whereRaw('false'); }
}
export function canReadVisitNotifications(context: AuthorizationContext) {
  return resolveAuthorizedCollectionScope(context, 'jobs.read').allowed || resolveAuthorizedCollectionScope(context, 'workorders.read').allowed;
}
/** Current resource scope is applied in SQL before unread counts, pagination and mark-read. */
export function visitNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return trx('visitNotifications as n').where({ 'n.workspaceId': context.workspaceId, 'n.userId': context.userId }).whereExists(
    trx('visitNotificationRecords as r').select(trx.raw('1')).whereRaw('r."notificationId"=n.id AND r."workspaceId"=n."workspaceId"').where(q => q
      .whereExists(jobs(trx, context).select(trx.raw('1')).whereRaw('j.id=r."jobId"'))
      .orWhereExists(orders(trx, context).select(trx.raw('1')).whereRaw('w.id=r."workOrderId"'))));
}
async function accessible(trx: Knex.Transaction, context: AuthorizationContext, refs: readonly Ref[]) {
  const records: VisitNotificationRecord['records'] = [];
  for (const ref of refs) {
    const row = ref.type === 'job' ? await jobs(trx, context).where('j.id', ref.id).select('j.id', 'j.title', 'j.jobNumber as number').first()
      : await orders(trx, context).where('w.id', ref.id).select('w.id', 'w.title', 'w.workOrderNumber as number').first();
    if (row) records.push({ type: ref.type, id: row.id, number: `${ref.type === 'job' ? 'J' : 'WO'}-${String(row.number).padStart(4, '0')}`, title: row.title });
  }
  return records.sort((a, b) => a.type.localeCompare(b.type) || a.number.localeCompare(b.number, "en", { numeric: true }) || a.id.localeCompare(b.id));
}
export async function projectVisitNotification(trx: Knex.Transaction, context: AuthorizationContext, row: Notice): Promise<VisitNotificationRecord | null> {
  const refs = await trx('visitNotificationRecords').where({ workspaceId: context.workspaceId, notificationId: row.id });
  const records = await accessible(trx, context, refs.map(r => ({ type: r.jobId ? 'job' : 'work_order', id: r.jobId ?? r.workOrderId })));
  return records.length ? { kind: 'visit', id: row.id, event: row.event, actorName: row.actorName, before: row.before, after: row.after, timezone: row.timezone, records, createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt } : null;
}
/** Called once inside the confirmed command transaction. Failed writes roll notices and outbox state back too. */
export async function notifyVisitChange(trx: Knex.Transaction, context: AuthorizationContext, operationId: string, event: VisitNotificationRecord['event'], refs: readonly Ref[], before: CalendarSchedule, after: CalendarSchedule) {
  if (JSON.stringify(before) === JSON.stringify(after) && !['joined', 'separated'].includes(event)) return;
  const recipients = new Set<string>(); const eligible: Ref[] = [];
  for (const ref of refs) {
    if (ref.type === 'job') {
      const row = await trx('jobs').where({ workspaceId: context.workspaceId, id: ref.id }).first('primaryOwnerId'); if (!row) continue;
      eligible.push(ref); if (row.primaryOwnerId) recipients.add(row.primaryOwnerId);
      (await trx('jobTeamMembers').where({ workspaceId: context.workspaceId, jobId: ref.id }).pluck('userId')).forEach(id => recipients.add(id));
    } else {
      const row = await trx('workOrders').where({ workspaceId: context.workspaceId, id: ref.id }).whereNot('status', 'draft').whereNull('archivedAt').first('primaryAssigneeId'); if (!row) continue;
      eligible.push(ref); if (row.primaryAssigneeId) recipients.add(row.primaryAssigneeId);
      (await trx('workOrderCrew').where({ workspaceId: context.workspaceId, workOrderId: ref.id }).pluck('userId')).forEach(id => recipients.add(id));
    }
  }
  const actor = await trx('users').where({ id: context.userId }).first('name'), workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  for (const userId of recipients) {
    if (userId === context.userId) continue;
    try {
      await withWorkspaceAuthorization(trx, { workspaceId: context.workspaceId, userId }, context.enabledPermissions, false, async (nested, recipient) => {
        const records = await accessible(nested, recipient, eligible); if (!records.length) return;
        const id = randomUUID();
        const inserted = await nested('visitNotifications').insert({ id, workspaceId: context.workspaceId, userId, operationId, event, actorName: actor.name, before: JSON.stringify(before), after: JSON.stringify(after), timezone: workspace.timezone }).onConflict(['workspaceId', 'operationId', 'userId']).ignore().returning('id');
        if (inserted.length) await nested('visitNotificationRecords').insert(records.map(r => ({ workspaceId: context.workspaceId, notificationId: id, [r.type === 'job' ? 'jobId' : 'workOrderId']: r.id })));
      });
    } catch (e) { if (!(e instanceof AuthorizationAccessError)) throw e; }
  }
}
export async function processVisitEmails(db: Knex, enabled: readonly PermissionId[], send: (mail: VisitNotificationRecord & { to: string; workspaceId: string; workspaceName: string }) => Promise<void>, limit = 10) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Invalid delivery batch size');
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates = await db('visitNotifications').where({ emailStatus: 'queued' }).where('nextAttemptAt', '<=', db.fn.now()).orderBy('nextAttemptAt').orderBy('id').limit(limit).select('id', 'workspaceId', 'userId');
  for (const candidate of candidates) try {
    await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false, async (trx, context) => {
      const row = await trx('visitNotifications').where({ id: candidate.id, emailStatus: 'queued' }).where('nextAttemptAt', '<=', trx.fn.now()).forUpdate().skipLocked().first(); if (!row) return;
      const notice = await projectVisitNotification(trx, context, row);
      const user = await trx('users').where({ id: context.userId }).first('email', 'emailVerified');
      const preference = await trx('notificationPreferences').where({ userId: context.userId }).first('visitChangedEmail');
      const policy = await effectiveJobNotificationPolicy(trx, context.workspaceId);
      if (!policy.events.schedule || !notice || !user.emailVerified || preference?.visitChangedEmail === false || new Date(row.createdAt).getTime() < Date.now() - 23 * 60 * 60 * 1000) {
        await trx('visitNotifications').where({ id: row.id }).update({ emailStatus: 'skipped' }); summary.skipped++; return;
      }
      const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('businessName'); const attempts = row.attempts + 1;
      try {
        await send({ ...notice, to: user.email, workspaceId: context.workspaceId, workspaceName: workspace.businessName });
        await trx('visitNotifications').where({ id: row.id }).update({ emailStatus: 'sent', attempts, sentAt: trx.fn.now() }); summary.sent++;
      } catch {
        const failed = attempts >= 5; summary[failed ? 'failed' : 'retryPending']++;
        await trx('visitNotifications').where({ id: row.id }).update({ emailStatus: failed ? 'failed' : 'queued', attempts, nextAttemptAt: new Date(Date.now() + 60000 * 2 ** (attempts - 1)) });
      }
    });
  } catch (e) {
    if (!(e instanceof AuthorizationAccessError)) throw e;
    await db('visitNotifications').where({ id: candidate.id, emailStatus: 'queued' }).update({ emailStatus: 'skipped' }); summary.skipped++;
  }
  return summary;
}

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CreateJobInput } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { createJob, mutateJob, mutateJobInTransaction } from '../jobs/store';
import { saveNotificationPreferences, readNotifications, markNotificationRead } from './store';
import { processJobEmails, type JobMail } from './jobs';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use the isolated local test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), customerId = randomUUID();
const users = { owner: randomUUID(), office: randomUUID(), field: randomUUID(), outsider: randomUUID() };
const enabled = [...permissionIds], identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
let passed = 0;
const check = async (label: string, run: () => Promise<void>) => {
  await db('jobs').where({ workspaceId }).delete();
  await db('jobNotificationSettings').where({ workspaceId }).delete();
  await db('notificationPreferences').whereIn('userId', Object.values(users)).delete();
  await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'free', status: 'active', paidThrough: new Date(Date.now() + 86400000) });
  await run(); console.log('PASS ' + label); passed++;
};
const input = (overrides: Partial<CreateJobInput> = {}): CreateJobInput => ({
  workspaceId, submissionId: randomUUID(), customerId, title: 'Job deadline notification fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner], ...overrides,
});
const notices = () => db('jobNotifications').where({ workspaceId });
const mailbox: JobMail[] = [];
async function deliver() { return processJobEmails(db, enabled, async mail => { if (mail.workspaceId === workspaceId) mailbox.push(mail); }); }
async function eventSetting(created: boolean) {
  await db('jobNotificationSettings').insert({ workspaceId, section: 'events', version: 1,
    values: JSON.stringify({ created, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true }) })
    .onConflict(['workspaceId', 'section']).merge({ values: JSON.stringify({ created, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true }) });
}
async function newJob() {
  const result = await createJob(db, identity(), enabled, input());
  await db('jobNotifications').where({ workspaceId, jobId: result.jobId }).delete();
  return result.jobId;
}
async function deadlineCommand(jobId: string, completionDeadline: string | null) {
  const row = await db('jobs').where({ id: jobId }).first('version');
  return { workspaceId, jobId, expectedVersion: row.version as number, submissionId: randomUUID(), action: 'deadline' as const, completionDeadline };
}
async function deadline(jobId: string, completionDeadline: string | null) {
  return mutateJob(db, identity(), enabled, await deadlineCommand(jobId, completionDeadline));
}
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Deadline change notices ${role}`, email: `${id}@example.test`, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Deadline change notices fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert(['owner', 'office', 'field'].map(role => ({ workspaceId, userId: users[role as keyof typeof users], role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Job notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('added, changed and removed deadlines create recipient-specific history, exclude actor and preserve timezone', async () => {
    const id = await newJob(); await deadline(id, '2026-11-06'); await deadline(id, '2026-11-13'); await deadline(id, null);
    const rows = await notices(); assert.equal(rows.length, 6);
    assert.ok(rows.every(n => n.event === 'deadline' && n.deadlineTimezone === 'America/New_York' && n.userId !== users.owner));
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.unreadCount, 3); assert.equal(result.items.length, 3);
    const changes = result.items.filter(n => n.kind === 'job' && n.event === 'deadline');
    assert.ok(changes.some(n => n.before === null && n.after === '2026-11-06'));
    assert.ok(changes.some(n => n.before === '2026-11-06' && n.after === '2026-11-13'));
    assert.ok(changes.some(n => n.before === '2026-11-13' && n.after === null));
    assert.ok(!JSON.stringify(result).includes('internalNotes'));
  });
  await check('unchanged and unset-to-unset updates do not create notices or reminder generations', async () => {
    const id = await newJob(); const initial = await db('jobs').where({ id }).first('reminderRevision');
    await deadline(id, null); assert.equal((await notices()).length, 0);
    assert.equal((await db('jobs').where({ id }).first()).reminderRevision, initial.reminderRevision);
    await deadline(id, '2026-11-06'); const updated = await db('jobs').where({ id }).first('reminderRevision');
    await deadline(id, '2026-11-06'); assert.equal((await notices()).length, 2);
    assert.equal((await db('jobs').where({ id }).first()).reminderRevision, updated.reminderRevision);
  });
  await check('concurrent confirmations and actor-bound retries cannot duplicate deadline events', async () => {
    const id = await newJob(), change = await deadlineCommand(id, '2026-11-06');
    const result = await Promise.all([mutateJob(db, identity(), enabled, change), mutateJob(db, identity(), enabled, change)]);
    assert.deepEqual(result[0], result[1]); assert.equal((await notices()).length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: id, type: 'deadline' })).length, 1);
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, completionDeadline: '2026-11-13' }));
    await assert.rejects(mutateJob(db, identity('office'), enabled, change));
    assert.equal((await notices()).length, 2);
  });
  await check('stale, invalid, cross-workspace and unauthorized deadline mutations cannot enqueue events', async () => {
    const id = await newJob(), change = await deadlineCommand(id, '2026-11-06');
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, expectedVersion: 999 }));
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, completionDeadline: '2026-02-30' }));
    await assert.rejects(mutateJob(db, { ...identity(), workspaceId: randomUUID() }, enabled, change));
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'jobs.schedule.update' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'jobs.schedule.update' }).delete();
    await assert.rejects(mutateJob(db, identity('field'), enabled, change), AuthorizationAccessError);
    if (grants.length) await db('workspaceRolePolicies').insert(grants);
    assert.equal((await notices()).length, 0);
  });
  await check('transaction rollback restores the deadline, activity, receipt and reminder generation with no notices', async () => {
    const id = await newJob(), change = await deadlineCommand(id, '2026-11-06');
    const before = await db('jobs').where({ id }).first();
    await assert.rejects(withWorkspaceAuthorization(db, identity(), enabled, true, async (trx, context) => {
      await mutateJobInTransaction(trx, context, change); throw Error('Induced rollback');
    }));
    const after = await db('jobs').where({ id }).first();
    assert.equal(after.completionDeadline, before.completionDeadline); assert.equal(after.version, before.version); assert.equal(after.reminderRevision, before.reminderRevision);
    assert.equal((await notices()).length, 0); assert.equal((await db('jobOperations').where({ workspaceId, submissionId: change.submissionId })).length, 0);
  });
  await check('confirmed assistant deadline actions use the same transaction and recipient selection', async () => {
    const id = await newJob(); await mutateJob(db, identity(), enabled, await deadlineCommand(id, '2026-11-06'), 'assistant-confirmed');
    assert.equal((await notices()).length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: id, type: 'deadline' }).first()).source, 'assistant-confirmed');
  });
  await check('reopening emits a deadline event only when its explicitly reviewed deadline changes', async () => {
    for (const closed of ['completed', 'canceled']) {
      const id = await newJob(); await deadline(id, '2026-11-06');
      let row = await db('jobs').where({ id }).first('version');
      await mutateJob(db, identity(), enabled, { workspaceId, jobId: id, expectedVersion: row.version, submissionId: randomUUID(), action: 'status', to: closed, confirmed: true, ...(closed === 'canceled' ? { cancellationReason: 'customer-canceled' } : {}) });
      await assert.rejects(mutateJob(db, identity(), enabled, await deadlineCommand(id, '2026-11-13')));
      await db('jobNotifications').where({ workspaceId, jobId: id }).delete();
      row = await db('jobs').where({ id }).first('version');
      await mutateJob(db, identity(), enabled, { workspaceId, jobId: id, expectedVersion: row.version, submissionId: randomUUID(), action: 'status', to: 'needs-scheduling', confirmed: true, reopenDeadline: null });
      const events = await db('jobNotifications').where({ workspaceId, jobId: id });
      assert.equal(events.filter(n => n.event === 'status').length, 2); assert.equal(events.filter(n => n.event === 'deadline').length, 2);
      const result = await readNotifications(db, identity('field'), enabled);
      assert.ok(result.items.some(n => n.kind === 'job' && n.event === 'deadline' && n.before === '2026-11-06' && n.after === null));
    }
  });
  await check('creation with a deadline and visit scheduling do not duplicate deadline change events', async () => {
    const job = await createJob(db, identity(), enabled, input({ completionDeadline: '2026-11-06' }));
    assert.ok((await notices()).every(n => n.event === 'created'));
    await db('jobNotifications').where({ workspaceId }).delete();
    await mutateJob(db, identity(), enabled, { workspaceId, jobId: job.jobId, expectedVersion: 1, submissionId: randomUUID(), action: 'schedule', scheduledDate: '2026-11-01', arrivalWindow: '09:00-11:00' });
    assert.equal((await notices()).length, 0); await db('visitNotifications').where({ workspaceId }).delete();
  });
  await check('pending emails retain immutable dates/timezone despite later changes and concurrent delivery', async () => {
    const id = await newJob(); await deadline(id, '2026-11-06'); await deadline(id, '2026-11-13');
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'Pacific/Kiritimati' });
    mailbox.length = 0; await Promise.all([deliver(), deliver()]); await deliver();
    assert.equal(mailbox.length, 4); assert.equal(new Set(mailbox.map(m => m.id)).size, 4);
    const events = mailbox.filter((m): m is JobMail & { event: 'deadline' } => m.event === 'deadline');
    assert.equal(events.length, 4); assert.ok(events.every(m => m.timezone === 'America/New_York'));
    assert.equal(events.filter(m => m.before === null && m.after === '2026-11-06').length, 2);
    assert.equal(events.filter(m => m.before === '2026-11-06' && m.after === '2026-11-13').length, 2);
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  });
  await check('workspace deadline-email policy and personal preference are independent from reminder controls and in-app notices', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' }); await eventSetting(true);
    const current = await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).first();
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...current.values, deadline: false }) });
    const id = await newJob(); await deadline(id, '2026-11-06'); mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 1);
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...current.values, deadline: true, approaching: false, overdue: false }) });
    await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, deadlineReminderEmail: true, jobActivityEmail: false });
    await saveNotificationPreferences(db, identity('office'), enabled, { leadAssignedEmail: true, deadlineReminderEmail: false, jobActivityEmail: true });
    await deadline(id, '2026-11-13'); await deliver(); assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.office));
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 2);
  });
  await check('Free and Standard keep fixed deadline-email defaults after Premium settings were disabled', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' }); await eventSetting(true);
    const current = await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).first();
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...current.values, deadline: false }) });
    const id = await newJob(); await deadline(id, '2026-11-06');
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'free' }); mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 2);
    await deadline(id, '2026-11-13'); await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'standard' }); await deliver(); assert.equal(mailbox.length, 4);
  });
  await check('current access constrains counts/paging/read marking and pending delivery after reassignment or membership loss', async () => {
    const id = await newJob(); await deadline(id, '2026-11-06');
    const row = await notices().where({ userId: users.field }).first();
    await assert.rejects(markNotificationRead(db, identity('office'), enabled, row.id), AuthorizationAccessError);
    await markNotificationRead(db, identity('field'), enabled, row.id); assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    await db('jobs').where({ id }).update({ primaryOwnerId: users.owner });
    assert.equal((await readNotifications(db, identity('field'), enabled)).items.length, 0);
    await assert.rejects(markNotificationRead(db, identity('field'), enabled, row.id), AuthorizationAccessError);
    await db('workspaceMemberships').where({ workspaceId, userId: users.office }).delete();
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('workspaceMemberships').insert({ workspaceId, userId: users.office, role: 'office' });
  });
  await check('unverified/deleted users, deleted workspace and expired events suppress delivery', async () => {
    const id = await newJob(); await deadline(id, '2026-11-06');
    await db('users').where({ id: users.field }).update({ emailVerified: false });
    await db('jobNotifications').where({ workspaceId, userId: users.office }).update({ createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('users').where({ id: users.field }).update({ emailVerified: true });
    await deadline(id, '2026-11-13'); await db('users').where({ id: users.field }).update({ deletionRequestedAt: db.fn.now() });
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: db.fn.now() });
    await deliver(); assert.equal(mailbox.length, 0);
    await db('users').where({ id: users.field }).update({ deletionRequestedAt: null });
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });
  await check('delivery retries retain event snapshots and stable IDs with a five-attempt limit', async () => {
    const id = await newJob(); await deadline(id, '2026-11-06'); const notice = await notices().where({ userId: users.field }).first(); const ids: string[] = [];
    for (let attempt = 1; attempt <= 5; attempt++) {
      await db('jobNotifications').where({ id: notice.id }).update({ nextAttemptAt: db.fn.now() });
      await processJobEmails(db, enabled, async mail => { if (mail.id === notice.id) { assert.equal(mail.event, 'deadline'); ids.push(mail.id); throw Error('Private provider failure'); } });
    }
    assert.deepEqual(ids, Array(5).fill(notice.id)); assert.equal((await notices().where({ id: notice.id }).first()).emailStatus, 'failed');
  });
  await check('database constraints reject malformed or unrelated deadline snapshots without rewriting legacy history', async () => {
    const id = await newJob(), base = { id: randomUUID(), workspaceId, jobId: id, operationId: randomUUID(), userId: users.field, actorName: '', event: 'deadline', beforeDeadline: null, afterDeadline: '2026-11-06', deadlineTimezone: 'America/New_York' };
    for (const invalid of [{ afterDeadline: null }, { beforeDeadline: '2026-11-06' }, { afterDeadline: '2026-02-30' }, { deadlineTimezone: null }, { deadlineTimezone: ' ' }, { event: 'created' }, { beforeStatus: 'scheduled' }, { assignmentChange: 'removed' }]) await assert.rejects(db('jobNotifications').insert({ ...base, ...invalid }));
    assert.equal((await notices()).length, 0);
  });
  console.log(`PASS ${passed} Job deadline-change notification database journeys`);
} finally {
  await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

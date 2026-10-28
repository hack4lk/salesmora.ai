import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, notificationPreferencesSchema, saveNotificationPreferencesSchema, type CreateJobInput } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { createJob, createJobInTransaction } from '../jobs/store';
import { readNotificationPreferences, saveNotificationPreferences, readNotifications, markNotificationRead } from './store';
import { processJobEmails, type JobMail, notifyJobCreated } from './jobs';
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
  workspaceId, submissionId: randomUUID(), customerId, title: 'Job creation notification fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner], ...overrides,
});
const notices = () => db('jobNotifications').where({ workspaceId });
const mailbox: JobMail[] = [];
async function deliver() { return processJobEmails(db, enabled, async mail => { if (mail.workspaceId === workspaceId) mailbox.push(mail); }); }
async function eventSetting(created: boolean) {
  await db('jobNotificationSettings').insert({ workspaceId, section: 'events', version: 1,
    values: JSON.stringify({ created, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true }) })
    .onConflict(['workspaceId', 'section']).merge({ values: JSON.stringify({ created, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true }) });
}
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Job notices ${role}`, email: `${id}@example.test`, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Job notices fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert(['owner', 'office', 'field'].map(role => ({ workspaceId, userId: users[role as keyof typeof users], role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Job notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('Job preference defaults on, saves independently and older callers preserve opt-out', async () => {
    assert.equal((await readNotificationPreferences(db, identity('field'), enabled)).jobActivityEmail, true);
    const result = await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, visitChangedEmail: false, deadlineReminderEmail: true, jobActivityEmail: false });
    assert.equal(result.jobActivityEmail, false); assert.equal(result.deadlineReminderEmail, true);
    assert.equal((await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: false })).jobActivityEmail, false);
    assert.equal(notificationPreferencesSchema.parse({ leadAssignedEmail: true }).jobActivityEmail, true);
    assert.equal(saveNotificationPreferencesSchema.safeParse({ workspaceId, leadAssignedEmail: true, jobActivityEmail: 'false' }).success, false);
    await assert.rejects(saveNotificationPreferences(db, identity('outsider'), enabled, { leadAssignedEmail: true, jobActivityEmail: false }), AuthorizationAccessError);
  });
  await check('creation atomically targets current owner/team and skips the actor; exact/concurrent retries do not duplicate', async () => {
    const command = input();
    const results = await Promise.all([createJob(db, identity(), enabled, command), createJob(db, identity(), enabled, command)]);
    assert.equal(results[0].jobId, results[1].jobId);
    const rows = await notices(); assert.equal(rows.length, 2); assert.deepEqual(rows.map(n => n.userId).sort(), [users.field, users.office].sort());
    assert.ok(rows.every(n => n.actorId === users.owner && n.event === 'created'));
    await withWorkspaceAuthorization(db, identity(), enabled, true, (trx, ctx) => notifyJobCreated(trx, ctx, results[0].jobId, command.submissionId));
    assert.equal((await notices()).length, 2);
  });
  await check('creation rollback leaves no Job, activity, operation, calendar record or notification', async () => {
    const command = input();
    await assert.rejects(withWorkspaceAuthorization(db, identity(), enabled, true, async (trx, context) => {
      await createJobInTransaction(trx, context, command); throw Error('Induced rollback');
    }));
    assert.equal((await db('jobs').where({ workspaceId })).length, 0);
    for (const table of ['jobActivity', 'jobOperations', 'jobNotifications', 'calendarVisitRecords'])
      assert.equal((await db(table).where({ workspaceId })).length, 0);
  });
  await check('confirmed assistant creation uses the same recipient path without model delivery privileges', async () => {
    const job = await createJob(db, identity(), enabled, input(), 'assistant-confirmed');
    assert.equal((await notices()).length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: job.jobId }).first()).source, 'assistant-confirmed');
  });
  await check('personal activity opt-out suppresses email only and does not reuse reminder or visit preference', async () => {
    await createJob(db, identity(), enabled, input());
    await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, jobActivityEmail: false });
    await saveNotificationPreferences(db, identity('office'), enabled, { leadAssignedEmail: true, visitChangedEmail: false, deadlineReminderEmail: false });
    mailbox.length = 0; await deliver();
    assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.office));
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 1);
  });
  await check('workspace Premium creation-email opt-out leaves in-app notices on; Free defaults override paid-only settings', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' }); await eventSetting(false);
    await createJob(db, identity(), enabled, input()); mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 1);
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'free' });
    await createJob(db, identity(), enabled, input()); await deliver(); assert.equal(mailbox.length, 2);
  });
  await check('permission-limited recipients receive no enqueued notice; foreign recipients cannot be assigned', async () => {
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).delete();
    await createJob(db, identity(), enabled, input()); assert.equal((await notices()).length, 1);
    await db('workspaceRolePolicies').insert(grants);
    await assert.rejects(createJob(db, identity(), enabled, input({ primaryOwnerId: users.outsider, teamUserIds: [] })));
    assert.equal((await db('jobs').where({ workspaceId })).length, 1);
  });
  await check('current resource scope filters unread counts, pages and mark-read; another recipient cannot mark a notice', async () => {
    const job = await createJob(db, identity(), enabled, input()), field = (await notices()).find(n => n.userId === users.field)!;
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.unreadCount, 1); assert.equal(result.items[0].kind, 'job');
    assert.equal(Object.hasOwn(result.items[0], 'customerName'), false);
    await assert.rejects(markNotificationRead(db, identity('office'), enabled, field.id), AuthorizationAccessError);
    await markNotificationRead(db, identity('field'), enabled, field.id);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    await db('jobs').where({ id: job.jobId }).update({ primaryOwnerId: users.owner });
    assert.equal((await readNotifications(db, identity('field'), enabled)).items.length, 0);
    await assert.rejects(markNotificationRead(db, identity('field'), enabled, field.id), AuthorizationAccessError);
  });
  await check('reassignment after enqueue suppresses mail even when workspace read permission still permits history', async () => {
    const job = await createJob(db, identity(), enabled, input());
    await db('jobTeamMembers').where({ workspaceId, jobId: job.jobId, userId: users.office }).delete();
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.field));
    assert.equal((await readNotifications(db, identity('office'), enabled)).items.length, 1);
  });
  await check('role revocation and removed membership block pending email with no raw payload leak', async () => {
    await createJob(db, identity(), enabled, input());
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).delete();
    await db('workspaceMemberships').where({ workspaceId, userId: users.office }).delete();
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.ok((await notices()).every(n => n.emailStatus === 'skipped'));
    await db('workspaceRolePolicies').insert(grants);
    await db('workspaceMemberships').insert({ workspaceId, userId: users.office, role: 'office' });
  });
  await check('unverified users, disabled Job access and old creation events cannot send email', async () => {
    await createJob(db, identity(), enabled, input());
    await db('users').where({ id: users.field }).update({ emailVerified: false });
    await db('jobNotifications').where({ workspaceId, userId: users.office }).update({ createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('users').where({ id: users.field }).update({ emailVerified: true });
    await createJob(db, identity(), enabled, input());
    await processJobEmails(db, enabled.filter(p => p !== 'jobs.read'), async mail => { mailbox.push(mail); });
    assert.equal(mailbox.length, 0);
  });
  await check('concurrent deliveries use fresh authorized Job projection and cannot resend successful rows', async () => {
    const job = await createJob(db, identity(), enabled, input({ teamUserIds: [] }));
    await db('jobs').where({ id: job.jobId }).update({ title: 'Current visible title' });
    mailbox.length = 0; await Promise.all([deliver(), deliver()]); await deliver();
    assert.equal(mailbox.length, 1); assert.equal(('title' in mailbox[0].job ? mailbox[0].job.title : undefined), 'Current visible title');
    assert.equal((await notices())[0].emailStatus, 'sent');
  });
  await check('failures keep a stable delivery key, exponential backoff and a five-attempt cap', async () => {
    await createJob(db, identity(), enabled, input({ teamUserIds: [] }));
    const id = (await notices())[0].id, keys: string[] = [];
    for (let attempt = 1; attempt <= 5; attempt++) {
      await db('jobNotifications').where({ id }).update({ nextAttemptAt: db.fn.now() });
      await processJobEmails(db, enabled, async mail => { if (mail.workspaceId === workspaceId) { keys.push(mail.id); throw Error('Private provider content'); } });
      const row = (await notices())[0]; assert.equal(row.attempts, attempt);
      assert.ok(new Date(row.nextAttemptAt).getTime() > Date.now());
    }
    assert.deepEqual(keys, Array(5).fill(id)); assert.equal((await notices())[0].emailStatus, 'failed');
    await deliver(); assert.equal((await notices())[0].attempts, 5);
  });
  await check('workspace/user deletion requests suppress pending mail and current reads', async () => {
    await createJob(db, identity(), enabled, input());
    await db('users').where({ id: users.field }).update({ deletionRequestedAt: db.fn.now() });
    await db('workspaceMemberships').where({ workspaceId, userId: users.office }).delete();
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('users').where({ id: users.field }).update({ deletionRequestedAt: null });
    await db('workspaceMemberships').insert({ workspaceId, userId: users.office, role: 'office' });
    await createJob(db, identity(), enabled, input());
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: db.fn.now() });
    await deliver(); assert.equal(mailbox.length, 0);
    await assert.rejects(readNotifications(db, identity('field'), enabled), AuthorizationAccessError);
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });
  await check('invalid delivery batches and cross-workspace notification requests fail closed', async () => {
    for (const limit of [0, 101, 1.5]) await assert.rejects(processJobEmails(db, enabled, async () => {}, limit), RangeError);
    await assert.rejects(readNotifications(db, { userId: users.field, workspaceId: randomUUID() }, enabled), AuthorizationAccessError);
  });
  console.log(`PASS ${passed} Job-created notification database journeys`);
} finally {
  await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

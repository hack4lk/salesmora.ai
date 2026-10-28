import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, notificationPreferencesSchema, saveNotificationPreferencesSchema } from '@salesmora/contracts';
import { reminderClock } from '@salesmora/domain';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { createJob, mutateJob } from '../jobs/store';
import { readNotificationPreferences, saveNotificationPreferences, readNotifications, markNotificationRead } from './store';
import { scheduleDeadlineReminders, processDeadlineEmails, type DeadlineReminderMail } from './deadlines';
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
  await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] });
  await run(); console.log('PASS ' + label); passed++;
};
async function setting(section: string, values: unknown) {
  await db('jobNotificationSettings').insert({ workspaceId, section, values: JSON.stringify(values), version: 1 }).onConflict(['workspaceId', 'section']).merge({ values: JSON.stringify(values) });
}
async function premium() {
  await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' });
}
const dates = (await db.raw("SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD') AS today, to_char(clock_timestamp() AT TIME ZONE 'UTC' + interval '1 day','YYYY-MM-DD') AS tomorrow, to_char(clock_timestamp() AT TIME ZONE 'UTC' - interval '1 day','YYYY-MM-DD') AS yesterday")).rows[0];
async function job(deadline = dates.today, primaryOwnerId = users.owner, teamUserIds = [users.field]) {
  const id = (await createJob(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), customerId, title: 'Private fixture title', completionDeadline: deadline, primaryOwnerId, teamUserIds })).jobId;
  // This suite isolates reminder counts; creation events have their own rehearsal.
  await db('jobNotifications').where({ workspaceId, jobId: id }).delete();
  return id;
}
async function notices(jobId?: string) {
  const q = db('deadlineNotifications').where({ workspaceId });
  return jobId ? q.where({ jobId }) : q;
}
async function mutate(jobId: string, action: 'deadline' | 'status', values: Record<string, unknown>) {
  const row = await db('jobs').where({ id: jobId }).first('version');
  return mutateJob(db, identity(), enabled, { workspaceId, jobId, expectedVersion: row.version, submissionId: randomUUID(), action, ...values });
}
const mailbox: DeadlineReminderMail[] = [];
async function deliver() { return processDeadlineEmails(db, enabled, async mail => { if (mail.workspaceId === workspaceId) mailbox.push(mail); }); }
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Reminder ${role}`, email: `${id}@example.test`, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Reminder fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert(['owner', 'office', 'field'].map(role => ({ workspaceId, userId: users[role as keyof typeof users], role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Reminder customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('personal reminder default, independent opt-out, omitted-field preservation and strict writes', async () => {
    assert.equal((await readNotificationPreferences(db, identity('field'), enabled)).deadlineReminderEmail, true);
    const saved = await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, visitChangedEmail: true, deadlineReminderEmail: false });
    assert.equal(saved.deadlineReminderEmail, false); assert.equal(saved.visitChangedEmail, true);
    assert.equal((await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: false })).deadlineReminderEmail, false);
    assert.equal(notificationPreferencesSchema.parse({ leadAssignedEmail: true }).deadlineReminderEmail, true);
    assert.equal(saveNotificationPreferencesSchema.safeParse({ workspaceId, leadAssignedEmail: true, deadlineReminderEmail: 'false' }).success, false);
    await assert.rejects(readNotificationPreferences(db, identity('outsider'), enabled), AuthorizationAccessError);
  });
  await check('due notices deduplicate owner/team and concurrent sweeps; unrelated Jobs and past dates omitted', async () => {
    const id = await job(); await job(dates.yesterday); await job(dates.tomorrow);
    await Promise.all([scheduleDeadlineReminders(db, enabled), scheduleDeadlineReminders(db, enabled)]);
    assert.equal((await notices()).length, 2);
    assert.equal((await notices(id)).length, 2);
    assert.equal(new Set((await notices()).map(n => n.userId)).size, 2);
  });
  await check('personal opt-out suppresses email only; counts and mark-read stay authorized', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, deadlineReminderEmail: false });
    const n = (await notices(id)).find(n => n.userId === users.field)!;
    mailbox.length = 0; await deliver(); assert.equal(mailbox.filter(m => m.job.id === id).length, 1);
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.unreadCount, 1); assert.equal(result.items[0].kind, 'deadline');
    await markNotificationRead(db, identity('field'), enabled, n.id);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    await assert.rejects(markNotificationRead(db, identity('office'), enabled, n.id), AuthorizationAccessError);
  });
  await check('completion/removal stop queued email immediately and preserve notice history', async () => {
    for (const action of ['status', 'deadline'] as const) {
      const id = await job(); await scheduleDeadlineReminders(db, enabled);
      if (action === 'status') await mutate(id, action, { to: 'completed', confirmed: true, note: 'Fixture complete' });
      else await mutate(id, action, { completionDeadline: null });
      assert.ok((await notices(id)).every(n => n.emailStatus === 'skipped'));
      assert.equal((await notices(id)).length, 2);
    }
  });
  await check('deadline changes replan a new generation; unrelated edits cannot resend', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await mutate(id, 'deadline', { completionDeadline: dates.tomorrow });
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 2);
    await mutate(id, 'deadline', { completionDeadline: dates.today });
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 4);
    await db('jobs').where({ id }).update({ title: 'Renamed fixture' });
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 4);
    assert.equal((await db('jobs').where({ id }).first()).reminderRevision, 2);
  });
  await check('closed Jobs require reviewed reopen deadline, then receive a fresh generation', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await mutate(id, 'status', { to: 'completed', confirmed: true, note: 'Fixture close' });
    await assert.rejects(mutate(id, 'status', { to: 'needs-scheduling', note: 'Invalid reopen' }));
    await mutate(id, 'status', { to: 'needs-scheduling', confirmed: true, reopenDeadline: dates.today, note: 'Reviewed reopen' });
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 4);
  });
  await check('reassignment and current read permission revoke pending delivery and hidden counts', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await db('jobTeamMembers').where({ workspaceId, jobId: id, userId: users.field }).delete();
    mailbox.length = 0; await deliver(); assert.ok(!mailbox.some(m => m.to.includes(users.field)));
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    assert.equal((await readNotifications(db, identity('field'), enabled)).items.length, 0);
    const fieldRow = (await notices(id)).find(n => n.userId === users.field);
    await assert.rejects(markNotificationRead(db, identity('field'), enabled, fieldRow.id), AuthorizationAccessError);
    await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.read' }).delete();
    await assert.rejects(readNotifications(db, identity('outsider'), enabled), AuthorizationAccessError);
    await db('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'jobs.read', scope: 'workspace' });
  });
  await check('Premium offsets and deduplicated extra recipients require current per-Job read access', async () => {
    await premium();
    await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'before', relative: 'before', days: 1 }, { id: 'after', relative: 'after', days: 1 }], extraRecipientIds: [users.owner, users.field, users.office, users.outsider] });
    await job(dates.tomorrow); await job(dates.yesterday); await job();
    await scheduleDeadlineReminders(db, enabled);
    const rows = await notices(); assert.equal(rows.length, 6); assert.ok(!rows.some(n => n.userId === users.outsider));
    assert.equal(rows.filter(n => n.event === 'approaching').length, 3); assert.equal(rows.filter(n => n.event === 'overdue').length, 3);
  });
  await check('downgrade rechecks queued Premium timing and extra-recipient access; fixed due reminder remains', async () => {
    await premium();
    await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'before', relative: 'before', days: 1 }], extraRecipientIds: [users.office] });
    const id = await job(dates.tomorrow); await scheduleDeadlineReminders(db, enabled);
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'free' });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0); assert.ok((await notices(id)).every(n => n.emailStatus === 'skipped'));
    await job(); await scheduleDeadlineReminders(db, enabled); assert.equal((await notices()).filter(n => n.event === 'due').length, 2);
  });
  await check('workspace email-event opt-out never disables in-app reminders and offset renames do not duplicate', async () => {
    await premium();
    await setting('events', { created: true, status: true, assignment: true, schedule: true, deadline: true, approaching: false, overdue: false });
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'renamed', relative: 'on', days: 0 }], extraRecipientIds: [] });
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 2);
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity(), enabled)).unreadCount, 1);
  });
  await check('unverified users and disabled features cannot receive email or create visible unauthorized notices', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await db('users').where({ id: users.field }).update({ emailVerified: false });
    mailbox.length = 0; await processDeadlineEmails(db, enabled.filter(p => p !== 'jobs.read'), async mail => { mailbox.push(mail); });
    assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity(), enabled.filter(p => p !== 'jobs.read'))).unreadCount, 0);
    assert.ok((await notices(id)).every(n => n.emailStatus === 'skipped'));
    await db('users').where({ id: users.field }).update({ emailVerified: true });
  });
  await check('stale local dates and changed timezone expire pending email instead of sending a backlog', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await db('deadlineNotifications').where({ workspaceId, jobId: id }).update({ reminderDate: dates.yesterday });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('deadlineNotifications').where({ workspaceId }).delete();
    await scheduleDeadlineReminders(db, enabled); await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
    await deliver(); assert.equal(mailbox.length, 0);
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'UTC' });
  });
  await check('failed provider calls retry with stable IDs, backoff and a five-attempt cap', async () => {
    const id = await job(dates.today, users.owner, []); await scheduleDeadlineReminders(db, enabled);
    const original = (await notices(id))[0].id, attempts: string[] = [];
    for (let i = 0; i < 5; i++) {
      await db('deadlineNotifications').where({ workspaceId }).update({ nextAttemptAt: db.fn.now() });
      await processDeadlineEmails(db, enabled, async mail => { if (mail.workspaceId === workspaceId) { attempts.push(mail.id); throw Error('Private provider payload'); } });
    }
    assert.deepEqual(attempts, Array(5).fill(original));
    const row = (await notices(id))[0]; assert.equal(row.attempts, 5); assert.equal(row.emailStatus, 'failed');
    await deliver(); assert.equal((await notices(id))[0].attempts, 5);
  });
  await check('concurrent delivery, successful retries and fresh Job projection cannot duplicate sends', async () => {
    const id = await job(dates.today, users.owner, []); await scheduleDeadlineReminders(db, enabled);
    await db('jobs').where({ id }).update({ title: 'Current authorized title' });
    mailbox.length = 0; await Promise.all([deliver(), deliver()]); await deliver();
    const sent = mailbox.filter(m => m.job.id === id); assert.equal(sent.length, 1); assert.equal(sent[0].job.title, 'Current authorized title');
    assert.equal((await notices(id))[0].emailStatus, 'sent');
  });
  await check('send-time changes wait until eligible without consuming delivery attempts', async () => {
    const now = new Date((await db.raw('SELECT clock_timestamp() AS now')).rows[0].now);
    const timezone = now.getUTCHours() >= 12 ? 'Etc/GMT+12' : 'UTC';
    const day = reminderClock(now, timezone).date;
    await db('workspaces').where({ id: workspaceId }).update({ timezone });
    await setting('reminders', { sendTime: '23:59', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] });
    const id = await job(day, users.owner, []);
    await scheduleDeadlineReminders(db, enabled); assert.equal((await notices(id)).length, 0);
    await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] });
    await scheduleDeadlineReminders(db, enabled);
    await setting('reminders', { sendTime: '23:59', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await notices(id))[0].attempts, 0); assert.equal((await notices(id))[0].emailStatus, 'queued');
    await setting('reminders', { sendTime: '00:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] });
    await deliver(); assert.equal(mailbox.filter(m => m.job.id === id).length, 1);
    await db('workspaces').where({ id: workspaceId }).update({ timezone: 'UTC' });
  });
  await check('revoked role grants and removed membership block queued mail and current notification reads', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).delete();
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    mailbox.length = 0; await deliver(); assert.ok(!mailbox.some(m => m.to.includes(users.field)));
    await db('workspaceRolePolicies').insert(grants);
    await db('deadlineNotifications').where({ workspaceId, jobId: id }).delete();
    await scheduleDeadlineReminders(db, enabled);
    await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
    mailbox.length = 0; await deliver(); assert.ok(!mailbox.some(m => m.to.includes(users.field)));
    await assert.rejects(readNotifications(db, identity('field'), enabled), AuthorizationAccessError);
    await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  });
  await check('workspace deletion requests suppress new occurrences and stop pending email', async () => {
    const id = await job(); await scheduleDeadlineReminders(db, enabled);
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: db.fn.now() });
    mailbox.length = 0; await deliver(); await scheduleDeadlineReminders(db, enabled);
    assert.equal(mailbox.length, 0); assert.ok((await notices(id)).every(n => n.emailStatus === 'skipped'));
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });
  await check('invalid batch limits and cross-workspace read attempts fail closed', async () => {
    for (const limit of [0, 101, 1.5]) await assert.rejects(processDeadlineEmails(db, enabled, async () => {}, limit), RangeError);
    await assert.rejects(readNotifications(db, { userId: users.field, workspaceId: randomUUID() }, enabled), AuthorizationAccessError);
  });
  console.log(`PASS ${passed} deadline reminder database journeys`);
} finally {
  await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete(); await db('workspaces').where({ id: workspaceId }).delete();
  await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

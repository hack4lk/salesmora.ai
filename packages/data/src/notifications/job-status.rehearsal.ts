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
  workspaceId, submissionId: randomUUID(), customerId, title: 'Job status notification fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner], ...overrides,
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
async function command(jobId: string, to: string, extra: Record<string, unknown> = {}) {
  const row = await db('jobs').where({ id: jobId }).first('version');
  return { workspaceId, jobId, expectedVersion: row.version, submissionId: randomUUID(), action: 'status', to, ...extra };
}
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Status notices ${role}`, email: `${id}@example.test`, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Status notices fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert(['owner', 'office', 'field'].map(role => ({ workspaceId, userId: users[role as keyof typeof users], role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Job notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('status changes create one authorized notice per recipient, skip the actor and retain private notes only in activity', async () => {
    const id = await newJob(), change = await command(id, 'in-progress', { note: 'PRIVATE progress note' });
    await mutateJob(db, identity(), enabled, change);
    const rows = await notices(); assert.equal(rows.length, 2);
    assert.ok(rows.every(n => n.event === 'status' && n.beforeStatus === 'needs-scheduling' && n.afterStatus === 'in-progress' && n.userId !== users.owner));
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.unreadCount, 1);
    const item = result.items[0]; assert.equal(item.kind, 'job');
    if (item.kind !== 'job' || item.event !== 'status') throw Error('Status projection missing');
    assert.equal(item.before, 'needs-scheduling'); assert.equal(item.after, 'in-progress');
    assert.ok(!JSON.stringify(result).includes('PRIVATE'));
  });
  await check('concurrent confirmations and exact actor-bound retries do not duplicate status activity or notices', async () => {
    const id = await newJob(), change = await command(id, 'in-progress');
    const results = await Promise.all([mutateJob(db, identity(), enabled, change), mutateJob(db, identity(), enabled, change)]);
    assert.deepEqual(results[0], results[1]); assert.equal((await notices()).length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: id, type: 'status' })).length, 1);
    await assert.rejects(mutateJob(db, identity('office'), enabled, change));
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, to: 'waiting', waitingReason: 'customer' }));
    assert.equal((await notices()).length, 2);
  });
  await check('completion, cancellation and both reopen paths keep immutable snapshots and enforce confirmation/deadline review', async () => {
    for (const closed of ['completed', 'canceled']) {
      const id = await newJob();
      await mutateJob(db, identity(), enabled, await command(id, closed, { confirmed: true, ...(closed === 'canceled' ? { cancellationReason: 'customer-canceled' } : {}) }));
      await assert.rejects(mutateJob(db, identity(), enabled, await command(id, 'needs-scheduling', { confirmed: true })));
      await mutateJob(db, identity(), enabled, await command(id, 'needs-scheduling', { confirmed: true, reopenDeadline: null }));
      const rows = await db('jobNotifications').where({ workspaceId, jobId: id });
      assert.equal(rows.length, 4);
      assert.equal(rows.filter(n => n.afterStatus === closed).length, 2);
      assert.equal(rows.filter(n => n.beforeStatus === closed && n.afterStatus === 'needs-scheduling').length, 2);
    }
  });
  await check('failed and stale transitions and revoked mutation permission cannot enqueue notices', async () => {
    const id = await newJob();
    for (const change of [await command(id, 'needs-scheduling'), await command(id, 'completed'), await command(id, 'canceled'), await command(id, 'waiting'), { ...await command(id, 'in-progress'), expectedVersion: 999 }])
      await assert.rejects(mutateJob(db, identity(), enabled, change));
    assert.equal((await notices()).length, 0);
    const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'jobs.status.update' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'jobs.status.update' }).delete();
    await assert.rejects(mutateJob(db, identity('field'), enabled, await command(id, 'in-progress')), AuthorizationAccessError);
    if (grant.length) await db('workspaceRolePolicies').insert(grant);
    await assert.rejects(mutateJob(db, { ...identity(), workspaceId: randomUUID() }, enabled, await command(id, 'in-progress')), AuthorizationAccessError);
    assert.equal((await notices()).length, 0);
  });
  await check('rollback includes status, activity, receipt, reminders/calendar lifecycle and notification rows', async () => {
    const id = await newJob(), change = await command(id, 'completed', { confirmed: true });
    const before = await db('jobs').where({ id }).first();
    await assert.rejects(withWorkspaceAuthorization(db, identity(), enabled, true, async (trx, context) => {
      await mutateJobInTransaction(trx, context, change as Parameters<typeof mutateJobInTransaction>[2]); throw Error('Induced rollback');
    }));
    const after = await db('jobs').where({ id }).first();
    assert.equal(after.status, before.status); assert.equal(after.version, before.version); assert.equal(after.reminderRevision, before.reminderRevision);
    assert.equal((await notices()).length, 0);
    assert.equal((await db('jobOperations').where({ workspaceId, submissionId: change.submissionId })).length, 0);
  });
  await check('confirmed assistant status changes use the same transaction and recipient rules', async () => {
    const id = await newJob();
    await mutateJob(db, identity(), enabled, await command(id, 'in-progress'), 'assistant-confirmed');
    assert.equal((await notices()).length, 2);
    assert.equal((await db('jobActivity').where({ workspaceId, jobId: id, type: 'status' }).first()).source, 'assistant-confirmed');
  });
  await check('schedule-derived transitions produce combined visit notices without an extra status email', async () => {
    const id = await newJob();
    await mutateJob(db, identity(), enabled, { workspaceId, jobId: id, expectedVersion: 1, submissionId: randomUUID(), action: 'schedule', scheduledDate: '2026-11-10', arrivalWindow: '09:00-11:00' });
    assert.equal((await notices()).length, 0);
    assert.equal((await db('visitNotifications').where({ workspaceId })).length, 2);
    await db('visitNotifications').where({ workspaceId }).delete();
  });
  await check('workspace status-email policy is independent of creation; personal opt-out leaves in-app status notices on', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' });
    await eventSetting(true);
    const values = { created: true, status: false, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true };
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify(values) });
    const id = await newJob(); await mutateJob(db, identity(), enabled, await command(id, 'in-progress'));
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 1);
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...values, status: true, created: false }) });
    await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, jobActivityEmail: false });
    await mutateJob(db, identity(), enabled, await command(id, 'waiting', { waitingReason: 'customer' }));
    await deliver(); assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.office));
    assert.equal(mailbox[0].event, 'status');
  });
  await check('Free/Standard use fixed event defaults after paid expiration or downgrade', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' }); await eventSetting(false);
    const row = await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).first();
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...row.values, status: false }) });
    const id = await newJob(); await mutateJob(db, identity(), enabled, await command(id, 'in-progress'));
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'standard' });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 2);
  });
  await check('later transitions cannot rewrite email snapshots; concurrent delivery uses one stable event ID', async () => {
    const id = await newJob();
    await mutateJob(db, identity(), enabled, await command(id, 'in-progress'));
    await mutateJob(db, identity(), enabled, await command(id, 'waiting', { waitingReason: 'materials' }));
    mailbox.length = 0; await Promise.all([deliver(), deliver()]); await deliver();
    assert.equal(mailbox.length, 4); assert.equal(new Set(mailbox.map(m => m.id)).size, 4);
    const statuses = mailbox.filter((m): m is JobMail & { event: 'status' } => m.event === 'status');
    assert.equal(statuses.filter(m => m.before === 'needs-scheduling' && m.after === 'in-progress').length, 2);
    assert.equal(statuses.filter(m => m.before === 'in-progress' && m.after === 'waiting').length, 2);
  });
  await check('current assignment/read scope applies before counts, paging, mark-read and pending email', async () => {
    const id = await newJob(); await mutateJob(db, identity(), enabled, await command(id, 'in-progress'));
    const field = (await notices()).find(n => n.userId === users.field)!;
    await assert.rejects(markNotificationRead(db, identity('office'), enabled, field.id), AuthorizationAccessError);
    await markNotificationRead(db, identity('field'), enabled, field.id);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    await db('jobs').where({ id }).update({ primaryOwnerId: users.owner });
    assert.equal((await readNotifications(db, identity('field'), enabled)).items.length, 0);
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.office));
  });
  await check('database constraints reject malformed snapshots and missing status values without changing retained creation history', async () => {
    const id = await newJob();
    const base = { id: randomUUID(), workspaceId, jobId: id, operationId: randomUUID(), userId: users.field, actorId: users.owner, actorName: 'Fixture' };
    for (const snapshot of [
      { event: 'status', beforeStatus: 'waiting', afterStatus: 'waiting' },
      { event: 'status', beforeStatus: 'unknown', afterStatus: 'completed' },
      { event: 'status', beforeStatus: 'completed', afterStatus: 'canceled' },
      { event: 'status', beforeStatus: null, afterStatus: 'completed' },
      { event: 'created', beforeStatus: 'scheduled', afterStatus: 'in-progress' },
    ]) await assert.rejects(db('jobNotifications').insert({ ...base, ...snapshot }));
    assert.equal((await notices()).length, 0);
  });
  console.log(`PASS ${passed} Job status notification database journeys`);
} finally {
  await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

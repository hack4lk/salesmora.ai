import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CreateJobInput } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { createJob, readJob, mutateJob, mutateJobInTransaction } from '../jobs/store';
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
  workspaceId, submissionId: randomUUID(), customerId, title: 'Job assignment notification fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner], ...overrides,
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
async function assignmentCommand(jobId: string, primaryOwnerId: string | null, teamUserIds: string[]) {
  const row = await db('jobs').where({ id: jobId }).first('version');
  return { workspaceId, jobId, expectedVersion: row.version as number, submissionId: randomUUID(), action: 'assign' as const, primaryOwnerId, teamUserIds };
}
async function assign(jobId: string, primaryOwnerId: string | null, teamUserIds: string[]) {
  return mutateJob(db, identity(), enabled, await assignmentCommand(jobId, primaryOwnerId, teamUserIds));
}
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Assignment notices ${role}`, email: `${id}@example.test`, emailVerified: true, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Assignment notices fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'UTC' });
    await trx('workspaceMemberships').insert(['owner', 'office', 'field'].map(role => ({ workspaceId, userId: users[role as keyof typeof users], role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('customers').insert({ id: customerId, workspaceId, name: 'Job notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await check('primary replacement sends a final removal plus a new primary assignment, and no actor notice', async () => {
    const id = await newJob(); await assign(id, users.office, []);
    const rows = await notices(); assert.equal(rows.length, 2);
    assert.equal(rows.find(n => n.userId === users.field).assignmentChange, 'removed');
    assert.equal(rows.find(n => n.userId === users.office).assignmentChange, 'primary');
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.unreadCount, 1); assert.equal(result.items.length, 1);
    const item = result.items[0];
    assert.deepEqual(Object.keys(item).sort(), ['access','change','createdAt','event','id','jobNumber','kind','read'].sort());
    assert.equal(item.kind === 'job' && item.event === 'assignment' && item.access, 'ended');
    const serialized = JSON.stringify(result);
    for (const secret of [id, 'Job assignment notification fixture', 'Assignment notices owner', 'actorName', 'jobTitle', 'jobId']) assert.ok(!serialized.includes(secret));
    await assert.rejects(readJob(db, identity('field'), enabled, id));
    await markNotificationRead(db, identity('field'), enabled, item.id);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 0);
    await assert.rejects(markNotificationRead(db, identity('office'), enabled, item.id), AuthorizationAccessError);
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 2);
    const removed = mailbox.find(m => m.to.includes(users.field))!;
    assert.equal(removed.event === 'assignment' && removed.access, 'ended');
    assert.equal(removed.actorName, ''); assert.deepEqual(Object.keys(removed.job), ['number']);
  });
  await check('team addition/removal and retained recipients use distinct events without leaking a roster', async () => {
    const id = await newJob(); await assign(id, users.field, []);
    let result = await readNotifications(db, identity('office'), enabled);
    const removed = result.items[0]; assert.equal(removed.kind === 'job' && removed.event === 'assignment' && removed.access, 'current');
    mailbox.length = 0; await deliver();
    assert.equal(mailbox.find(m => m.to.includes(users.office))?.event, 'assignment');
    const removal = mailbox.find(m => m.to.includes(users.office))!;
    assert.equal(removal.event === 'assignment' && removal.change, 'removed');
    await db('jobNotifications').where({ workspaceId }).delete();
    await assign(id, users.field, [users.office]);
    const rows = await notices(); assert.equal(rows.length, 2);
    assert.equal(rows.find(n => n.userId === users.office).assignmentChange, 'team');
    assert.equal(rows.find(n => n.userId === users.field).assignmentChange, 'updated');
    result = await readNotifications(db, identity('field'), enabled);
    assert.ok(!JSON.stringify(result).includes('teamUserIds'));
  });
  await check('unchanged assignments and team reordering do not enqueue events', async () => {
    const id = await newJob(); await assign(id, users.field, [users.owner, users.office]);
    assert.equal((await notices()).length, 0);
  });
  await check('concurrent confirmations and actor-bound retries cannot duplicate assignment notices', async () => {
    const id = await newJob(), change = await assignmentCommand(id, users.office, []);
    const results = await Promise.all([mutateJob(db, identity(), enabled, change), mutateJob(db, identity(), enabled, change)]);
    assert.deepEqual(results[0], results[1]); assert.equal((await notices()).length, 2);
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, primaryOwnerId: users.owner }));
    await assert.rejects(mutateJob(db, identity('office'), enabled, change));
    assert.equal((await notices()).length, 2);
  });
  await check('rollback and stale/unauthorized changes never leave a final removal notice', async () => {
    const id = await newJob(), change = await assignmentCommand(id, users.office, []);
    await assert.rejects(withWorkspaceAuthorization(db, identity(), enabled, true, async (trx, context) => {
      await mutateJobInTransaction(trx, context, change); throw Error('Induced rollback');
    }));
    assert.equal((await notices()).length, 0);
    assert.equal((await db('jobs').where({ id }).first()).primaryOwnerId, users.field);
    await assert.rejects(mutateJob(db, identity('field'), enabled, change));
    await assert.rejects(mutateJob(db, identity(), enabled, { ...change, expectedVersion: 999 }));
    assert.equal((await notices()).length, 0);
  });
  await check('ordinary creation/status events disappear on removal while the final notice remains markable', async () => {
    const created = await createJob(db, identity(), enabled, input()), id = created.jobId;
    await mutateJob(db, identity(), enabled, { workspaceId, jobId: id, expectedVersion: 1, submissionId: randomUUID(), action: 'status', to: 'in-progress' });
    const old = await notices().where({ userId: users.field, event: 'created' }).first();
    await assign(id, users.office, []);
    const result = await readNotifications(db, identity('field'), enabled);
    assert.equal(result.items.length, 1); assert.equal(result.unreadCount, 1);
    await assert.rejects(markNotificationRead(db, identity('field'), enabled, old.id), AuthorizationAccessError);
    mailbox.length = 0; await deliver(); assert.equal(mailbox.filter(m => m.to.includes(users.field)).length, 1);
  });
  await check('membership removal and user/workspace deletion suppress even the minimal exception', async () => {
    const id = await newJob(); await assign(id, users.office, []);
    await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
    await assert.rejects(readNotifications(db, identity('field'), enabled), AuthorizationAccessError);
    mailbox.length = 0; await deliver(); assert.ok(!mailbox.some(m => m.to.includes(users.field)));
    await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
    await assign(id, users.field, []); await assign(id, users.office, []);
    await db('users').where({ id: users.field }).update({ deletionRequestedAt: db.fn.now() });
    await deliver(); assert.ok(!mailbox.some(m => m.to.includes(users.field)));
    await db('users').where({ id: users.field }).update({ deletionRequestedAt: null });
    await assign(id, users.field, []); await assign(id, users.office, []);
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: db.fn.now() });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    await db('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });
  await check('personal opt-out and Premium assignment rule suppress mail only; Free defaults ignore retained Premium rules', async () => {
    const id = await newJob(); await assign(id, users.office, []);
    await saveNotificationPreferences(db, identity('field'), enabled, { leadAssignedEmail: true, jobActivityEmail: false });
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium' });
    await eventSetting(true);
    const row = await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).first();
    await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).update({ values: JSON.stringify({ ...row.values, assignment: false }) });
    mailbox.length = 0; await deliver(); assert.equal(mailbox.length, 0);
    assert.equal((await readNotifications(db, identity('field'), enabled)).unreadCount, 1);
    await assign(id, users.field, []);
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'standard' });
    await deliver(); assert.equal(mailbox.length, 1); assert.ok(mailbox[0].to.includes(users.office));
  });
  await check('re-add before delivery uses current authorized content for historical removal, never falsely claims access ended', async () => {
    const id = await newJob(); await assign(id, users.office, []); await assign(id, users.field, []);
    mailbox.length = 0; await deliver();
    const field = mailbox.filter(m => m.to.includes(users.field)); assert.equal(field.length, 2);
    assert.ok(field.every(m => m.event === 'assignment' && m.access === 'current'));
    const result = await readNotifications(db, identity('field'), enabled);
    assert.ok(result.items.every(n => n.kind === 'job' && n.event === 'assignment' && n.access === 'current'));
  });
  await check('revoked Job read exposes only a final removal, while old events and subsequent assignments remain inaccessible', async () => {
    const id = await newJob(); await assign(id, users.office, []);
    const result = await readNotifications(db, identity('office'), enabled.filter(p => p !== 'jobs.read'));
    assert.equal(result.items.length, 0);
    const field = await readNotifications(db, identity('field'), enabled.filter(p => p !== 'jobs.read'));
    assert.equal(field.items.length, 1); assert.equal(field.items[0].kind === 'job' && field.items[0].event === 'assignment' && field.items[0].access, 'ended');
  });
  await check('removal mail retries retain a stable key and sanitize after permissions change', async () => {
    const id = await newJob(); await assign(id, users.office, []);
    const row = await notices().where({ userId: users.field }).first();
    const ids: string[] = [];
    for (let attempt = 1; attempt <= 5; attempt++) {
      await db('jobNotifications').where({ id: row.id }).update({ nextAttemptAt: db.fn.now() });
      await processJobEmails(db, enabled, async mail => { if (mail.id === row.id) { ids.push(mail.id); assert.deepEqual(Object.keys(mail.job), ['number']); throw Error('Private provider failure'); } });
    }
    assert.deepEqual(ids, Array(5).fill(row.id)); assert.equal((await notices().where({ id: row.id }).first()).emailStatus, 'failed');
  });
  await check('schema rejects false removal evidence and legacy events carrying assignment snapshots', async () => {
    const id = await newJob();
    const base = { id: randomUUID(), workspaceId, jobId: id, operationId: randomUUID(), userId: users.field, event: 'assignment', assignmentChange: 'removed', beforeAssignment: 'primary', afterAssignment: 'none', jobNumberSnapshot: 'J-0001', actorName: '' };
    for (const invalid of [{ beforeAssignment: 'none' }, { afterAssignment: 'team' }, { jobNumberSnapshot: null }, { jobNumberSnapshot: 'private title' }, { assignmentChange: 'unknown' }, { event: 'created' }, { beforeStatus: 'scheduled' }])
      await assert.rejects(db('jobNotifications').insert({ ...base, ...invalid }));
    assert.equal((await notices()).length, 0);
  });
  console.log(`PASS ${passed} Job assignment notification database journeys`);
} finally {
  await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

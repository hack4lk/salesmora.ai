import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { readJobNotificationSettings as read, saveJobNotificationSettings as save, JobNotificationSettingsConflict as Conflict, JobNotificationSettingsInvalid as Invalid } from './store';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['127.0.0.1', 'localhost'].includes(new URL(connection).hostname)) throw Error('Use the local isolated test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), users = { owner: randomUUID(), admin: randomUUID(), field: randomUUID() };
const identity = (role: keyof typeof users = 'owner') => ({ workspaceId, userId: users[role] });
const enabled = [...permissionIds];
let passed = 0;
const check = async (label: string, run: () => Promise<void>) => { await run(); console.log('PASS ' + label); passed++; };
const command = async () => ({ workspaceId, submissionId: randomUUID(), section: 'deadline' as const, revision: (await read(db, identity(), enabled)).deadline.revision, values: { mode: 'relative' as const, days: 14, count: 'business' as const } });
try {
  await db.transaction(async trx => {
    await trx('users').insert(Object.entries(users).map(([role, id]) => ({ id, name: `Settings ${role}`, email: `${id}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Job settings fixture', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert(Object.entries(users).map(([role, userId]) => ({ workspaceId, userId, role })));
    await initializeWorkspacePolicy(trx, identity());
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
  });
  await check('read returns unset/due-date defaults without creating settings or audit rows', async () => {
    const result = await read(db, identity(), enabled); assert.equal(result.activation, 'reminders-active'); assert.equal(result.plan, 'free'); assert.deepEqual(result.deadline.values, { mode: 'unset' }); assert.equal(result.reminders.values.offsets[0].relative, 'on'); assert.equal((await db('jobNotificationSettings').where({ workspaceId })).length, 0);
  });
  await check('Field is denied even with forged business grants and wrong workspace identity is rejected', async () => {
    await db('workspaceRolePolicies').insert(['settings.business.read', 'settings.business.update'].map(permission => ({ workspaceId, role: 'field', permission, scope: 'enabled' })));
    await assert.rejects(read(db, identity('field'), enabled), AuthorizationAccessError);
    await assert.rejects(save(db, identity('field'), enabled, await command()), AuthorizationAccessError);
    await assert.rejects(save(db, identity(), enabled, { ...await command(), workspaceId: randomUUID() }), AuthorizationAccessError);
  });
  await check('save and exact retry commit one row and one actor-bound audit receipt', async () => {
    const input = await command(), result = await save(db, identity(), enabled, input);
    assert.equal(result.deadline.revision, '1'); assert.equal(result.reminders.revision, '0');
    assert.deepEqual(await save(db, identity(), enabled, input), result);
    assert.equal((await db('jobNotificationSettingsAudit').where({ workspaceId })).length, 1);
    await assert.rejects(save(db, identity('admin'), enabled, input), Conflict);
    await assert.rejects(save(db, identity(), enabled, { ...input, values: { ...input.values, days: 15 } }), Conflict);
  });
  await check('competing section saves serialize and stale reviews cannot overwrite', async () => {
    const a = await command(), b = { ...a, submissionId: randomUUID(), values: { ...a.values, days: 20 } };
    const results = await Promise.allSettled([save(db, identity(), enabled, a), save(db, identity(), enabled, b)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal(results.filter(r => r.status === 'rejected' && r.reason instanceof Conflict).length, 1);
  });
  await check('Free/Standard cannot forge Premium event rules or extra reminder recipients', async () => {
    const current = await read(db, identity(), enabled);
    await assert.rejects(save(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), section: 'events', revision: '0', values: current.events.values }), Invalid);
    await assert.rejects(save(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), section: 'reminders', revision: '0', values: { ...current.reminders.values, extraRecipientIds: [users.admin] } }), Invalid);
  });
  await check('Free send time is editable without affecting another section revision', async () => {
    const previous = await read(db, identity(), enabled);
    const result = await save(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), section: 'reminders', revision: '0', values: { ...previous.reminders.values, sendTime: '10:00' } });
    assert.equal(result.reminders.values.sendTime, '10:00'); assert.deepEqual(result.deadline, previous.deadline);
  });
  await check('current paid entitlement and current teammate membership gate Premium saves', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium', status: 'active', paidThrough: new Date(Date.now() + 86400000) });
    const current = await read(db, identity(), enabled);
    await assert.rejects(save(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), section: 'reminders', revision: current.reminders.revision, values: { ...current.reminders.values, extraRecipientIds: [randomUUID()] } }), Invalid);
    const result = await save(db, identity('admin'), enabled, { workspaceId, submissionId: randomUUID(), section: 'reminders', revision: current.reminders.revision, values: { ...current.reminders.values, offsets: [{ id: 'before', relative: 'before', days: 365 }, ...current.reminders.values.offsets], extraRecipientIds: [users.admin] } });
    assert.equal(result.reminders.values.offsets.length, 2);
    await save(db, identity(), enabled, { workspaceId, submissionId: randomUUID(), section: 'events', revision: current.events.revision, values: { ...current.events.values, status: false } });
  });
  await check('downgrade applies fixed effective policy and paid expiration never grants Premium', async () => {
    await db('workspaceSubscriptions').where({ workspaceId }).update({ paidThrough: new Date(Date.now() - 1000) });
    const result = await read(db, identity(), enabled); assert.equal(result.plan, 'free'); assert.equal(result.reminders.values.offsets.length, 1); assert.equal(result.reminders.values.extraRecipientIds.length, 0); assert.equal(result.events.values.status, true);
    assert.equal((await db('jobNotificationSettings').where({ workspaceId, section: 'events' }).first()).values.status, false);
  });
  await check('current permission revocation is honored for both read and retry', async () => {
    const input = await command(); await save(db, identity('admin'), enabled, input);
    await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'settings.business.update' }).delete();
    assert.equal((await read(db, identity('admin'), enabled)).canManage, false);
    await assert.rejects(save(db, identity('admin'), enabled, input), AuthorizationAccessError);
    await assert.rejects(read(db, identity(), enabled.filter(p => p !== 'settings.business.read')), AuthorizationAccessError);
  });
  await check('settings and audit roll back together; no Job or notification is created', async () => {
    const before = await read(db, identity(), enabled), audits = (await db('jobNotificationSettingsAudit').where({ workspaceId })).length;
    await assert.rejects(db.transaction(async trx => { await save(trx, identity(), enabled, { ...await command(), values: { mode: 'unset' } }); throw Error('induced rollback'); }));
    assert.deepEqual(await read(db, identity(), enabled), before); assert.equal((await db('jobNotificationSettingsAudit').where({ workspaceId })).length, audits);
    for (const table of ['jobs', 'visitNotifications']) assert.equal((await db(table).where({ workspaceId })).length, 0);
  });
  console.log(`PASS ${passed} Job settings database journeys`);
} finally {
  await db('workspaceSubscriptions').where({ workspaceId }).delete(); await db('workspaces').where({ id: workspaceId }).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await db.destroy();
}

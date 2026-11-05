import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { SuspensionError, suspendUser, suspendWorkspace, unsuspendUser, unsuspendWorkspace, type SuspensionActor } from './suspension';

// Runs the suspension use cases as the admin app role and proves the customer-app roles can't change suspension state.
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  return Object.assign(new URL(ownerURL), { username, password }).toString();
};
const owner = createDatabase(ownerURL);
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
const web = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.web, process.env.DB_WEB_PASSWORD));
const worker = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.worker, process.env.DB_WORKER_PASSWORD));
const denied = (error: { code?: string }) => error.code === '42501';

const suffix = randomUUID().slice(0, 8);
const ownerId = `suspension-owner-${suffix}`, memberId = `suspension-member-${suffix}`;
const workspaceId = randomUUID(), threadId = randomUUID();
const staff: SuspensionActor = { type: 'staff', id: `staff-${suffix}` };
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const auditRows = (subjectId: string) => owner('suspensionAudit').where({ subjectId }).orderBy('id').select('action', 'actorType', 'actorId', 'reason');

async function seed() {
  const now = new Date();
  await owner('users').insert([ownerId, memberId].map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId, businessName: 'Fictional suspension workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert([{ workspaceId, userId: ownerId, role: 'owner' }, { workspaceId, userId: memberId, role: 'office' }]);
    await initializeWorkspacePolicy(trx, { userId: ownerId, workspaceId });
  });
  const expiresAt = new Date(Date.now() + 3600000);
  await owner('sessions').insert([ownerId, memberId, memberId].map(userId => ({ id: randomUUID(), token: randomUUID(), userId, expiresAt, createdAt: now, updatedAt: now })));
  await owner('chatThreads').insert({ id: threadId, workspaceId, userId: memberId });
  await owner('chatTurns').insert({ id: randomUUID(), threadId, workspaceId, userId: memberId, clientTurnId: randomUUID(), requestHash: 'x', surfaceKey: 'x', state: 'running', leaseUntil: expiresAt });
}

async function cleanup() {
  await owner.transaction(async trx => {
    await trx('workspaceSuspensionNotices').where({ workspaceId }).delete();
    await trx('chatThreads').where({ workspaceId }).delete();
    await trx('workspaceRolePolicies').where({ workspaceId }).delete();
    await trx('workspacePolicies').where({ workspaceId }).delete();
    await trx('workspaceMemberships').where({ workspaceId }).delete();
    await trx('workspaces').where({ id: workspaceId }).delete();
    await trx('users').whereIn('id', [ownerId, memberId]).delete();
  });
}

try {
  await seed();

  await check('suspending a user revokes every session, cancels active chat and audits', async () => {
    assert.deepEqual(await suspendUser(admin, { userId: memberId, reason: '  Reported abuse  ', actor: staff }), { changed: true });
    const user = await owner('users').where({ id: memberId }).first('suspendedAt', 'suspendedReason');
    assert.ok(user.suspendedAt);
    assert.equal(user.suspendedReason, 'Reported abuse');
    assert.equal(Number((await owner('sessions').where({ userId: memberId }).count({ n: '*' }))[0].n), 0);
    assert.equal(Number((await owner('sessions').where({ userId: ownerId }).count({ n: '*' }))[0].n), 1, 'other users keep their sessions');
    assert.equal((await owner('chatTurns').where({ threadId }).first('state')).state, 'cancelled');
    assert.deepEqual(await auditRows(memberId), [{ action: 'suspended', actorType: 'staff', actorId: staff.id, reason: 'Reported abuse' }]);
  });
  await check('suspending a user twice is a no-op without a second audit row', async () => {
    assert.deepEqual(await suspendUser(admin, { userId: memberId, reason: 'Repeated suspension request', actor: staff }), { changed: false });
    assert.equal((await auditRows(memberId)).length, 1);
    assert.equal((await owner('users').where({ id: memberId }).first('suspendedReason')).suspendedReason, 'Reported abuse');
  });
  await check('unsuspending a user clears the columns and audits once', async () => {
    assert.deepEqual(await unsuspendUser(admin, { userId: memberId, reason: 'Reviewed recovery request', actor: staff }), { changed: true });
    assert.deepEqual(await unsuspendUser(admin, { userId: memberId, reason: 'Repeated recovery request', actor: staff }), { changed: false });
    assert.deepEqual(await owner('users').where({ id: memberId }).first('suspendedAt', 'suspendedReason'), { suspendedAt: null, suspendedReason: null });
    assert.deepEqual(await auditRows(memberId), [
      { action: 'suspended', actorType: 'staff', actorId: staff.id, reason: 'Reported abuse' },
      { action: 'unsuspended', actorType: 'staff', actorId: staff.id, reason: 'Reviewed recovery request' },
    ]);
  });
  await check('invalid input is rejected before any change', async () => {
    await assert.rejects(suspendUser(admin, { userId: memberId, reason: '   ', actor: staff }), RangeError);
    await assert.rejects(suspendUser(admin, { userId: memberId, reason: 'x', actor: { type: 'staff', id: ' ' } }), SuspensionError);
    await assert.rejects(suspendUser(admin, { userId: 'missing-user', reason: 'Unknown customer suspension test', actor: staff }), SuspensionError);
    await assert.rejects(suspendWorkspace(admin, {
      workspaceId: randomUUID(),
      reason: 'Unknown workspace suspension test',
      actor: staff,
    }), SuspensionError);
    assert.equal((await owner('users').where({ id: memberId }).first('suspendedAt')).suspendedAt, null);
  });
  await check('the database rejects a suspension without a reason', async () => {
    await assert.rejects(owner('users').where({ id: memberId }).update({ suspendedAt: new Date() }), (error: { code?: string }) => error.code === '23514');
  });
  await check('suspending a workspace queues one Owner notice and audits', async () => {
    assert.deepEqual(await suspendWorkspace(admin, { workspaceId, reason: 'Unpaid chargeback', actor: staff }), { changed: true });
    assert.deepEqual(await suspendWorkspace(admin, { workspaceId, reason: 'Repeated suspension request', actor: staff }), { changed: false });
    assert.ok((await owner('workspaces').where({ id: workspaceId }).first('suspendedAt')).suspendedAt);
    assert.deepEqual(await owner('workspaceSuspensionNotices').where({ workspaceId }).select('status'), [{ status: 'queued' }]);
    assert.deepEqual(await auditRows(workspaceId), [{ action: 'suspended', actorType: 'staff', actorId: staff.id, reason: 'Unpaid chargeback' }]);
    assert.equal(Number((await owner('sessions').where({ userId: ownerId }).count({ n: '*' }))[0].n), 1, 'members keep their sessions');
  });
  await check('unsuspending a workspace skips an unsent notice', async () => {
    const reason = 'Support reviewed the reported issue';
    assert.deepEqual(await unsuspendWorkspace(admin, { workspaceId, reason, actor: { type: 'system', id: 'rehearsal' } }), { changed: true });
    assert.deepEqual(await owner('workspaceSuspensionNotices').where({ workspaceId }).select('status'), [{ status: 'skipped' }]);
    assert.deepEqual(await auditRows(workspaceId), [
      { action: 'suspended', actorType: 'staff', actorId: staff.id, reason: 'Unpaid chargeback' },
      { action: 'unsuspended', actorType: 'system', actorId: 'rehearsal', reason },
    ]);
  });
  await check('a deleting workspace or user cannot be suspended', async () => {
    await owner('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
    await owner('users').where({ id: memberId }).update({ deletionRequestedAt: new Date() });
    await assert.rejects(suspendWorkspace(admin, { workspaceId, reason: 'Deletion pending blocks suspension', actor: staff }), /being deleted/);
    await assert.rejects(suspendUser(admin, { userId: memberId, reason: 'Deletion pending blocks suspension', actor: staff }), /being deleted/);
    await owner('workspaces').where({ id: workspaceId }).update({
      suspendedAt: new Date(),
      suspendedReason: 'A prior suspension remains recorded',
    });
    await assert.rejects(unsuspendWorkspace(admin, {
      workspaceId,
      reason: 'Deletion pending blocks restoration',
      actor: staff,
    }), /being deleted/);
  });
  await check('audit rows are immutable, even for the admin app and the owner', async () => {
    await assert.rejects(admin('suspensionAudit').where({ subjectId: workspaceId }).delete(), denied);
    await assert.rejects(owner('suspensionAudit').where({ subjectId: workspaceId }).delete(), /immutable/);
    await assert.rejects(owner('suspensionAudit').where({ subjectId: workspaceId }).update({ reason: 'edited' }), /immutable/);
  });
  await check('web and worker roles cannot change suspension state', async () => {
    for (const db of [web, worker]) {
      await assert.rejects(db('users').where({ id: ownerId }).update({ suspendedAt: new Date(), suspendedReason: 'forged' }), denied);
      await assert.rejects(db('workspaces').where({ id: workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'forged' }), denied);
      await assert.rejects(suspendUser(db, { userId: ownerId, reason: 'forged suspension attempt', actor: staff }), denied);
    }
    await owner('users').where({ id: ownerId }).update({ suspendedAt: new Date(), suspendedReason: 'owner set' });
    try {
      await assert.rejects(web('users').where({ id: ownerId }).update({ suspendedAt: null, suspendedReason: null }), denied, 'web cannot unsuspend');
    } finally {
      await owner('users').where({ id: ownerId }).update({ suspendedAt: null, suspendedReason: null });
    }
    // Ordinary profile updates still work for the customer app.
    assert.equal(await web('users').where({ id: ownerId }).update({ name: 'Renamed owner' }), 1);
  });
  await check('web and worker roles cannot write audit rows or create notices', async () => {
    for (const db of [web, worker]) {
      await assert.rejects(db('suspensionAudit').insert({ subjectType: 'user', subjectId: ownerId, action: 'unsuspended', actorType: 'staff', actorId: 'forged' }), denied);
      await assert.rejects(db('workspaceSuspensionNotices').insert({ id: randomUUID(), workspaceId }), denied);
    }
    await assert.rejects(web('workspaceSuspensionNotices').select('id'), denied);
    await assert.rejects(web('suspensionAudit').select('id'), denied);
    assert.equal(await worker('workspaceSuspensionNotices').where({ workspaceId }).update({ status: 'skipped' }), 1, 'worker can update notice status');
  });
  await check('the admin app can only write the suspension columns', async () => {
    await assert.rejects(admin('users').where({ id: ownerId }).update({ name: 'x' }), denied);
    await assert.rejects(admin('workspaces').where({ id: workspaceId }).update({ businessName: 'x' }), denied);
    // Removing members (0d b) and changing roles for ownership transfer (0d c) are granted; adding members is not.
    await assert.rejects(admin('workspaceMemberships').insert({ workspaceId, userId: ownerId, role: 'admin' }), denied);
  });
  console.log(`Suspension rehearsal passed (${passed} checks).`);
} finally {
  await cleanup().catch(error => console.error('Cleanup failed:', error.message));
  await Promise.all([owner.destroy(), admin.destroy(), web.destroy(), worker.destroy()]);
}

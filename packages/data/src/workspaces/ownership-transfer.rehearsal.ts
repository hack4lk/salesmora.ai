import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { authorize } from '@salesmora/domain';
import { initializeWorkspacePolicy, loadWorkspaceAuthorization } from '../authorization/store';
import { createDatabase } from '../database';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { processWorkspaceOwnershipNotices, type WorkspaceOwnershipNoticeMail } from './ownership-notices';
import { TeamActionError, transferWorkspaceOwnership, type TeamActor } from './team-actions';

// Runs the ownership transfer as the admin app role and delivers its notices as the worker role.
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
const users = { owner: `own-owner-${suffix}`, admin: `own-admin-${suffix}`, office: `own-office-${suffix}`, unverified: `own-unverified-${suffix}`,
  deleting: `own-deleting-${suffix}`, suspended: `own-suspended-${suffix}`, otherOwner: `own-other-${suffix}`, outsider: `own-outsider-${suffix}` };
const workspaceId = randomUUID(), otherWorkspaceId = randomUUID();
const staff: TeamActor = { type: 'staff', id: `staff-${suffix}` };
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const staffAudit = () => owner('authorizationAudit').where({ workspaceId, actorId: staff.id }).orderBy('id').select('action', 'beforeRevision', 'afterRevision', 'afterPolicy');
const roles = async () => Object.fromEntries((await owner('workspaceMemberships').where({ workspaceId }).select('userId', 'role')).map(row => [row.userId, row.role]));
const ownerId = async () => (await owner('workspaces').where({ id: workspaceId }).first('ownerId')).ownerId as string;
const notices = () => owner('workspaceOwnershipNotices').where({ workspaceId }).orderBy('createdAt').orderBy('recipient').select('recipient', 'fromUserId', 'toUserId', 'status', 'attempts');
const can = async (userId: string, permission: 'billing.manage' | 'ownership.transfer') =>
  authorize(await loadWorkspaceAuthorization(owner, { userId, workspaceId }, [permission]), { permission }).allowed;

async function seed() {
  const now = new Date();
  await owner('users').insert(Object.values(users).map(id => ({ id, name: `Name ${id}`, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now,
    emailVerified: id !== users.unverified, deletionRequestedAt: id === users.deleting ? now : null })));
  await owner('users').where({ id: users.suspended }).update({ suspendedAt: now, suspendedReason: 'Rehearsal' });
  await owner.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: users.owner, businessName: 'Fictional ownership workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert([users.owner, users.admin, users.office, users.unverified, users.deleting, users.suspended, users.otherOwner]
      .map(userId => ({ workspaceId, userId, role: userId === users.owner ? 'owner' : userId === users.admin ? 'admin' : 'office' })));
    await initializeWorkspacePolicy(trx, { userId: users.owner, workspaceId });
    await trx('workspaces').insert({ id: otherWorkspaceId, ownerId: users.otherOwner, businessName: 'Fictional other workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId: otherWorkspaceId, userId: users.otherOwner, role: 'owner' });
    await initializeWorkspacePolicy(trx, { userId: users.otherOwner, workspaceId: otherWorkspaceId });
  });
}

async function cleanup() {
  // Audit rows are immutable evidence and stay behind, like the other rehearsals.
  await owner.transaction(async trx => {
    for (const id of [workspaceId, otherWorkspaceId]) {
      await trx('workspaceOwnershipNotices').where({ workspaceId: id }).delete();
      await trx('workspaceRolePolicies').where({ workspaceId: id }).delete();
      await trx('workspacePolicies').where({ workspaceId: id }).delete();
      await trx('workspaceMemberships').where({ workspaceId: id }).delete();
      await trx('workspaces').where({ id }).delete();
    }
    await trx('users').whereIn('id', Object.values(users)).delete();
  });
}

try {
  await seed();
  const transfer = (newOwnerUserId: string, reason = 'Owner asked support to hand over') => transferWorkspaceOwnership(admin, { workspaceId, newOwnerUserId, reason, actor: staff });

  await check('invalid input is refused before any change', async () => {
    await assert.rejects(transferWorkspaceOwnership(admin, { workspaceId, newOwnerUserId: users.admin, reason: '   ', actor: staff }), RangeError);
    await assert.rejects(transferWorkspaceOwnership(admin, { workspaceId, newOwnerUserId: users.admin, reason: 'x', actor: { type: 'staff', id: ' ' } }), TeamActionError);
    await assert.rejects(transferWorkspaceOwnership(admin, { workspaceId: randomUUID(), newOwnerUserId: users.admin, reason: 'x', actor: staff }), /Workspace not found/);
  });

  await check('the new Owner must be an eligible member', async () => {
    await assert.rejects(transfer(users.owner), /already the Owner/);
    await assert.rejects(transfer(users.outsider), /not a member/);
    await assert.rejects(transfer(users.unverified), /verify their email/);
    await assert.rejects(transfer(users.deleting), /being deleted/);
    await assert.rejects(transfer(users.suspended), /suspended/);
    await assert.rejects(transfer(users.otherOwner), /already owns another workspace/);
    assert.equal(await ownerId(), users.owner);
    assert.deepEqual(await staffAudit(), []);
    assert.deepEqual(await notices(), []);
  });

  await check('a workspace being deleted is refused', async () => {
    await owner('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
    await assert.rejects(transfer(users.admin), /being deleted/);
    await owner('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });

  await check('the database refuses a workspace without exactly one matching Owner', async () => {
    await assert.rejects(owner.transaction(async trx => { await trx('workspaces').where({ id: workspaceId }).update({ ownerId: users.office }); }), /exactly one matching Owner/);
    await assert.rejects(owner.transaction(async trx => { await trx('workspaceMemberships').where({ workspaceId, userId: users.office }).update({ role: 'owner' }); }), /exactly one matching Owner/);
    assert.equal(await ownerId(), users.owner);
  });

  await check('a suspended workspace can change Owner; the swap is atomic, audited and queues both notices', async () => {
    await owner('workspaces').where({ id: workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'Rehearsal' });
    const policy = await owner('workspacePolicies').where({ workspaceId }).first('revision');
    assert.deepEqual(await transfer(users.office, '  Owner left the business  '), { previousOwnerUserId: users.owner });
    await owner('workspaces').where({ id: workspaceId }).update({ suspendedAt: null, suspendedReason: null });
    assert.equal(await ownerId(), users.office);
    const after = await roles();
    assert.deepEqual([after[users.office], after[users.owner], after[users.admin]], ['owner', 'admin', 'admin']);
    assert.equal(Object.values(after).filter(role => role === 'owner').length, 1);
    assert.equal((await owner('workspacePolicies').where({ workspaceId }).first('revision')).revision, policy.revision);
    assert.deepEqual(await staffAudit(), [{ action: 'ownership.transferred', beforeRevision: policy.revision, afterRevision: policy.revision,
      afterPolicy: { actorType: 'staff', reason: 'Owner left the business', from: { userId: users.owner, role: 'admin' }, to: { userId: users.office, previousRole: 'office' } } }]);
    assert.deepEqual(await notices(), [
      { recipient: 'new_owner', fromUserId: users.owner, toUserId: users.office, status: 'queued', attempts: 0 },
      { recipient: 'previous_owner', fromUserId: users.owner, toUserId: users.office, status: 'queued', attempts: 0 },
    ]);
  });

  await check('the new Owner gets owner-only permissions and the previous Owner loses them', async () => {
    assert.deepEqual([await can(users.office, 'billing.manage'), await can(users.office, 'ownership.transfer')], [true, true]);
    assert.deepEqual([await can(users.owner, 'billing.manage'), await can(users.owner, 'ownership.transfer')], [false, false]);
  });

  await check('a failed send is retried later with backoff', async () => {
    const summary = await processWorkspaceOwnershipNotices(worker, async () => { throw new Error('SMTP down'); });
    assert.deepEqual(summary, { sent: 0, skipped: 0, retryPending: 2, failed: 0 });
    const rows = await owner('workspaceOwnershipNotices').where({ workspaceId }).select('status', 'attempts', 'nextAttemptAt');
    for (const row of rows) {
      assert.deepEqual([row.status, row.attempts], ['queued', 1]);
      assert.ok(new Date(row.nextAttemptAt).getTime() > Date.now());
    }
  });

  await check('notices that are no longer true are skipped; current ones go to the right person with the right copy', async () => {
    // Transfer back before the first notices are delivered: those now describe the wrong Owner.
    await transfer(users.owner, 'Transferred to the wrong person');
    await owner('workspaceOwnershipNotices').where({ workspaceId }).update({ nextAttemptAt: new Date(Date.now() - 1000) });
    const mail: WorkspaceOwnershipNoticeMail[] = [];
    assert.deepEqual(await processWorkspaceOwnershipNotices(worker, async message => { mail.push(message); }), { sent: 2, skipped: 2, retryPending: 0, failed: 0 });
    const strip = (message: WorkspaceOwnershipNoticeMail) => ({ ...message, id: undefined });
    const names = { workspaceName: 'Fictional ownership workspace', newOwnerName: `Name ${users.owner}`, previousOwnerName: `Name ${users.office}` };
    assert.deepEqual(mail.map(strip).sort((a, b) => a.recipient.localeCompare(b.recipient)), [
      { to: `${users.owner}@example.test`, recipient: 'new_owner', ...names, id: undefined },
      { to: `${users.office}@example.test`, recipient: 'previous_owner', ...names, id: undefined },
    ]);
    assert.deepEqual((await notices()).map(row => row.status), ['skipped', 'skipped', 'sent', 'sent']);
    assert.deepEqual(await processWorkspaceOwnershipNotices(worker, async message => { mail.push(message); }), { sent: 0, skipped: 0, retryPending: 0, failed: 0 });
    assert.equal((await staffAudit()).length, 2);
  });

  await check('a notice to a previous Owner who has since left is skipped', async () => {
    await transfer(users.admin, 'Second hand-over');
    await owner('workspaceMemberships').where({ workspaceId, userId: users.owner }).delete();
    const mail: WorkspaceOwnershipNoticeMail[] = [];
    assert.deepEqual(await processWorkspaceOwnershipNotices(worker, async message => { mail.push(message); }), { sent: 0, skipped: 2, retryPending: 0, failed: 0 });
    assert.deepEqual(mail, []);
  });

  await check('only the admin app can queue notices; the customer app cannot read them', async () => {
    const row = { id: randomUUID(), workspaceId, recipient: 'new_owner', fromUserId: users.owner, toUserId: users.admin };
    await assert.rejects(web('workspaceOwnershipNotices').insert(row), denied);
    await assert.rejects(web('workspaceOwnershipNotices').select('id'), denied);
    await assert.rejects(worker('workspaceOwnershipNotices').insert(row), denied);
    await assert.rejects(admin('workspaceOwnershipNotices').where({ workspaceId }).update({ status: 'sent' }), denied);
  });

  await check('the admin app can change only the granted columns', async () => {
    await assert.rejects(admin('workspaces').where({ id: workspaceId }).update({ businessName: 'Forged' }), denied);
    await assert.rejects(admin('workspaceMemberships').insert({ workspaceId, userId: users.outsider, role: 'admin' }), denied);
    await assert.rejects(admin('workspacePolicies').where({ workspaceId }).update({ revision: 99 }), denied);
    await assert.rejects(admin('workspaceRolePolicies').where({ workspaceId }).delete(), denied);
  });

  console.log(`Ownership transfer rehearsal passed: ${passed} checks.`);
} finally {
  await cleanup().catch(error => console.error('Cleanup failed:', error.message));
  await Promise.all([owner, admin, web, worker].map(db => db.destroy()));
}

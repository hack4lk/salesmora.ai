import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { AccountActionError, markEmailVerified, revokeUserSessions, type AccountActor } from './account-actions';

// Runs the account use cases as the admin app role and proves the customer-app roles can't touch the audit.
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
const userId = `account-user-${suffix}`, otherId = `account-other-${suffix}`, deletingId = `account-deleting-${suffix}`;
const staff: AccountActor = { type: 'staff', id: `staff-${suffix}` };
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const auditRows = (id: string) => owner('accountAudit').where({ userId: id }).orderBy('id').select('action', 'actorType', 'actorId', 'reason', 'details');
const sessionIds = async (id: string) => (await owner('sessions').where({ userId: id }).orderBy('id').pluck('id')) as string[];

async function addSessions(id: string, names: string[]) {
  const now = new Date();
  await owner('sessions').insert(names.map(name => ({ id: `${name}-${suffix}`, userId: id, token: randomUUID(), expiresAt: new Date(Date.now() + 86_400_000), createdAt: now, updatedAt: now })));
}

async function seed() {
  const now = new Date();
  await owner('users').insert([userId, otherId, deletingId].map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now,
    deletionRequestedAt: id === deletingId ? now : null })));
}

async function cleanup() {
  // Audit rows are immutable evidence and stay behind, like the other rehearsals.
  await owner('users').whereIn('id', [userId, otherId, deletingId]).delete();
}

try {
  await seed();

  await check('revoking selected sessions ignores another user\'s session and audits the revoked IDs', async () => {
    await addSessions(userId, ['laptop', 'phone', 'tablet']);
    await addSessions(otherId, ['other']);
    const result = await revokeUserSessions(admin, { userId, sessionIds: [`phone-${suffix}`, `other-${suffix}`], reason: '  Lost phone  ', actor: staff });
    assert.equal(result.revoked, 1);
    assert.deepEqual(await sessionIds(userId), [`laptop-${suffix}`, `tablet-${suffix}`]);
    assert.deepEqual(await sessionIds(otherId), [`other-${suffix}`]);
    assert.deepEqual(await auditRows(userId), [{ action: 'sessions.revoked', actorType: 'staff', actorId: staff.id, reason: 'Lost phone',
      details: { scope: 'selected', sessionIds: [`phone-${suffix}`] } }]);
  });

  await check('revoking all sessions signs the user out everywhere', async () => {
    assert.equal((await revokeUserSessions(admin, { userId, reason: 'Account compromised', actor: staff })).revoked, 2);
    assert.deepEqual(await sessionIds(userId), []);
    assert.deepEqual((await auditRows(userId)).at(-1)?.details, { scope: 'all', sessionIds: [`laptop-${suffix}`, `tablet-${suffix}`] });
  });

  await check('revoking when nothing matches writes no audit row', async () => {
    assert.equal((await revokeUserSessions(admin, { userId, reason: 'Again', actor: staff })).revoked, 0);
    assert.equal((await auditRows(userId)).length, 2);
  });

  await check('invalid input is refused before any change', async () => {
    await assert.rejects(revokeUserSessions(admin, { userId, reason: '   ', actor: staff }), RangeError);
    await assert.rejects(revokeUserSessions(admin, { userId, sessionIds: [], reason: 'x', actor: staff }), AccountActionError);
    await assert.rejects(revokeUserSessions(admin, { userId, reason: 'x', actor: { type: 'staff', id: '' } }), AccountActionError);
    await assert.rejects(revokeUserSessions(admin, { userId: `missing-${suffix}`, reason: 'x', actor: staff }), AccountActionError);
    await assert.rejects(markEmailVerified(admin, { userId: `missing-${suffix}`, reason: 'x', actor: staff }), AccountActionError);
  });

  await check('marking an email verified audits once and repeating is a no-op', async () => {
    assert.deepEqual(await markEmailVerified(admin, { userId, reason: 'Confirmed by phone', actor: staff }), { changed: true });
    assert.equal((await owner('users').where({ id: userId }).first('emailVerified')).emailVerified, true);
    assert.deepEqual(await markEmailVerified(admin, { userId, reason: 'Confirmed by phone', actor: staff }), { changed: false });
    const rows = (await auditRows(userId)).filter(row => row.action === 'email.marked_verified');
    assert.deepEqual(rows, [{ action: 'email.marked_verified', actorType: 'staff', actorId: staff.id, reason: 'Confirmed by phone', details: {} }]);
  });

  await check('a user being deleted cannot be marked verified', async () => {
    await assert.rejects(markEmailVerified(admin, { userId: deletingId, reason: 'x', actor: staff }), /being deleted/);
  });

  await check('the admin app can change only the granted user columns', async () => {
    await assert.rejects(admin('users').where({ id: otherId }).update({ name: 'Changed' }), denied);
    await assert.rejects(admin('users').where({ id: otherId }).update({ email: 'changed@example.test' }), denied);
  });

  await check('the customer-app roles cannot read or write the account audit', async () => {
    for (const role of [web, worker]) {
      await assert.rejects(role('accountAudit').select('id').limit(1), denied);
      await assert.rejects(role('accountAudit').insert({ userId, action: 'email.marked_verified', actorType: 'staff', actorId: 'forged', reason: 'forged' }), denied);
    }
  });

  await check('account audit rows cannot be changed or deleted', async () => {
    await assert.rejects(admin('accountAudit').where({ userId }).delete(), denied);
    await assert.rejects(owner('accountAudit').where({ userId }).delete(), /immutable/);
    await assert.rejects(owner('accountAudit').where({ userId }).update({ reason: 'edited' }), /immutable/);
  });

  console.log(`Account actions rehearsal passed: ${passed} checks.`);
} finally {
  await cleanup();
  await Promise.all([owner, admin, web, worker].map(db => db.destroy()));
}

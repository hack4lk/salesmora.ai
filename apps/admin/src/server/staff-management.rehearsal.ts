import assert from 'node:assert/strict';
import { createHash, createHmac, createSign, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { symmetricEncrypt, makeSignature } from 'better-auth/crypto';
import { createDatabase } from '@salesmora/data/database';
import { verifyAdminAuditChain } from '@salesmora/data/admin-audit';
import type { StaffActionInput, StaffRoleId } from '@salesmora/contracts';
import { NextRequest } from 'next/server';
import { generateStaffTotpSecret } from './staff-totp';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) || !process.env.DB_ADMIN_APP_PASSWORD) {
  throw new Error('Use an isolated local test database and provision DB_ADMIN_APP_PASSWORD.');
}
const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app';
adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;
process.env.ADMIN_DATABASE_URL = adminURL.href;
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
process.env.EMAIL_PROVIDER = 'mailpit';
const owner = createDatabase(ownerURL);
const { auth } = await import('./auth');
const context = await auth.$context;
const { createStaffManagementService, StaffManagementError, staffManagementDatabase } = await import('./staff-management');
const { GET, POST } = await import('../app/api/admin/staff/route');
const prefix = `staff-${randomUUID()}`;
const password = `Rehearsal-only-${randomUUID()}`;
const users: string[] = [];
const recipients: string[] = [];
const messages: { to: string; text: string; idempotencyKey?: string }[] = [];
let failDelivery = false;
const service = createStaffManagementService(staffManagementDatabase, async message => {
  if (failDelivery) throw new Error('Simulated delivery outage');
  messages.push(message);
  return { providerMessageId: randomUUID() };
});

async function seed(role: StaffRoleId) {
  const userId = randomUUID();
  users.push(userId);
  const email = `${prefix}-${users.length}@karpukcreative.com`;
  const sessionId = randomUUID();
  const token = randomUUID();
  const now = new Date();
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, email, name: `Staff rehearsal ${role}`, emailVerified: true, twoFactorEnabled: true, createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffAccounts').insert({
    id: randomUUID(), userId, accountId: userId, providerId: 'credential',
    password: await context.password.hash(password), createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role, grantedAt: now });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + 3600000),
  });
  const credentialID = randomBytes(32).toString('base64url');
  const keys = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = keys.publicKey.export({ format: 'jwk' });
  assert.ok(jwk.x && jwk.y);
  const cose = isoCBOR.encode(new Map<number, number | Buffer>([
    [1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, 'base64url')], [-3, Buffer.from(jwk.y, 'base64url')],
  ]));
  await owner.withSchema('admin').table('staffPasskeys').insert({
    id: randomUUID(), userId, credentialID, publicKey: Buffer.from(cose).toString('base64'),
    counter: 0, deviceType: 'singleDevice', backedUp: false,
  });
  let counter = 0;
  return {
    identity: { userId, sessionId, accessEmail: email },
    cookie: `${context.authCookies.sessionToken.name}=${token}.${await makeSignature(token, context.secret)}`,
    assertion(challenge: string, uv = true): AuthenticationResponseJSON {
      const clientDataJSON = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge, origin: process.env.ADMIN_AUTH_URL, crossOrigin: false }));
      const count = Buffer.alloc(4);
      count.writeUInt32BE(++counter);
      const authenticatorData = Buffer.concat([createHash('sha256').update('localhost').digest(), Buffer.from([uv ? 5 : 1]), count]);
      const signature = createSign('SHA256').update(authenticatorData).update(createHash('sha256').update(clientDataJSON).digest()).end().sign(keys.privateKey);
      return {
        id: credentialID, rawId: credentialID, type: 'public-key', clientExtensionResults: {},
        response: { clientDataJSON: clientDataJSON.toString('base64url'), authenticatorData: authenticatorData.toString('base64url'), signature: signature.toString('base64url') },
      };
    },
  };
}
type Fixture = Awaited<ReturnType<typeof seed>>;
const email = () => { const value = `${prefix}-recipient-${recipients.length}@karpukcreative.com`; recipients.push(value); return value; };
const invite = (recipient = email(), role: StaffRoleId = 'support'): StaffActionInput => ({
  action: { kind: 'invite', email: recipient, role }, reason: 'Staff integration rehearsal', decision: 'approve',
});
const reject = async (operation: Promise<unknown>, status: number) => assert.rejects(operation, (error: unknown) =>
  error instanceof StaffManagementError && error.status === status);
async function verified(user: Fixture, input: StaffActionInput) {
  const start = await service.start(user.identity, input, password);
  await service.verifyFactor(user.identity, start.token, { method: 'passkey', response: user.assertion(start.options.challenge) });
  return start;
}
async function request(user: Fixture | null, operation?: unknown, overrides: Record<string, string> = {}) {
  const headers = new Headers({ origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json', ...overrides });
  if (user) { headers.set('cookie', user.cookie); headers.set('x-admin-access-email', user.identity.accessEmail); }
  const req = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/staff`, {
    method: operation === undefined ? 'GET' : 'POST', headers,
    ...(operation === undefined ? {} : { body: JSON.stringify(operation) }),
  });
  return operation === undefined ? GET(req) : POST(req);
}

try {
  for (const table of ['approvalRequests', 'staffActionChallenges', 'staffFactorUses', 'staffInvitationDeliveries']) {
    const privileges = await owner.raw<{ rows: { allowed: boolean }[] }>(
      'SELECT has_table_privilege(?, ?, ?) AS allowed', ['salesmora_web', `admin."${table}"`, 'SELECT,INSERT,UPDATE,DELETE'],
    );
    assert.equal(privileges.rows[0].allowed, false, `customer runtime must not access ${table}`);
  }
  const [first, second, support, billing, limited] = await Promise.all([
    seed('super_admin'), seed('super_admin'), seed('support'), seed('billing'), seed('super_admin'),
  ]);
  assert.equal((await request(null)).status, 401);
  assert.equal((await request(first, {}, { origin: 'https://foreign.example' })).status, 403);
  assert.equal((await request(support)).status, 403);
  assert.equal((await request(billing)).status, 403);
  assert.equal((await request(first, { operation: 'start', password, input: { action: { kind: 'invite', role: 'support', email: 'person@example.com' } } })).status, 400);
  const invalidHeaders = new Headers({ origin: process.env.ADMIN_AUTH_URL!, cookie: first.cookie, 'x-admin-access-email': first.identity.accessEmail, 'content-type': 'application/json' });
  assert.equal((await POST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/staff`, { method: 'POST', headers: invalidHeaders, body: '{invalid' }))).status, 400);
  assert.equal((await POST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/staff`, { method: 'POST', headers: invalidHeaders, body: JSON.stringify({ padding: 'x'.repeat(17000) }) }))).status, 413);
  const listing = await request(first);
  assert.equal(listing.status, 200);
  const listingText = await listing.text();
  assert.equal(listingText.includes('publicKey'), false);
  assert.equal(listingText.includes('password'), false);
  assert.equal(listingText.includes(first.cookie), false);
  await reject(service.snapshot({ ...first.identity, accessEmail: second.identity.accessEmail }), 401);
  await reject(service.start(support.identity, invite(), password), 403);
  await reject(service.start(first.identity, { ...invite(), action: { kind: 'invite', role: 'owner', email: email() } }, password), 400);
  await reject(service.start(first.identity, { ...invite(), action: { kind: 'invite', role: 'support', email: 'person@example.com' } }, password), 400);
  await reject(service.start(first.identity, invite(), 'incorrect-password'), 401);
  console.log('PASS API identity, origin, role permissions, safe read model and input validation');

  const input = invite();
  const started = await service.start(first.identity, input, password);
  await reject(service.commit(first.identity, started.token), 403);
  const otherSessionId = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: otherSessionId, userId: first.identity.userId, token: randomUUID(), createdAt: new Date(), updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  });
  await reject(service.verifyFactor({ ...first.identity, sessionId: otherSessionId }, started.token, {
    method: 'passkey', response: first.assertion(started.options.challenge),
  }), 401);
  await reject(service.verifyFactor(second.identity, started.token, { method: 'passkey', response: second.assertion(started.options.challenge) }), 401);
  await reject(service.verifyFactor(first.identity, started.token, { method: 'passkey', response: first.assertion(started.options.challenge, false) }), 401);
  const signed = first.assertion(started.options.challenge);
  await service.verifyFactor(first.identity, started.token, { method: 'passkey', response: signed });
  await reject(service.verifyFactor(first.identity, started.token, { method: 'passkey', response: signed }), 409);
  const issued = await service.commit(first.identity, started.token);
  assert.equal(issued.delivery, 'sent');
  assert.ok(issued.invitationId);
  await reject(service.commit(first.identity, started.token), 401);
  const invitationRow = await owner.withSchema('admin').table('staffInvitations').where({ id: issued.invitationId }).first();
  const token = new URL(messages.at(-1)!.text.split(': ').at(-1)!).searchParams.get('token')!;
  assert.notEqual(invitationRow.tokenHash, token);
  assert.equal(new Date(invitationRow.expiresAt).getTime() - new Date(invitationRow.createdAt).getTime(), 86400000);
  assert.equal((await owner.withSchema('admin').table('staffUsers').where({ email: invitationRow.email }).first()), undefined);
  assert.ok(await owner.withSchema('admin').table('auditEvents').where({ action: 'staff.invitation.created', targetId: issued.invitationId }).first());
  await reject(service.start(first.identity, { ...input, reason: 'Different action' }, password).then(async start => {
    await service.verifyFactor(first.identity, start.token, { method: 'passkey', response: first.assertion(start.options.challenge) });
    await service.commit(first.identity, start.token);
  }), 409);
  console.log('PASS password plus UV passkey, single-use verification, token hashing, 24-hour invitation and audit');

  const expiring = await verified(first, invite());
  await owner.withSchema('admin').table('staffActionChallenges').where({ sessionId: first.identity.sessionId }).update({ expiresAt: new Date(Date.now() - 1) });
  await reject(service.commit(first.identity, expiring.token), 401);
  const roleChanged = await verified(first, invite());
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: first.identity.userId }).update({ revokedAt: new Date() });
  await reject(service.commit(first.identity, roleChanged.token), 403);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: first.identity.userId }).update({ revokedAt: null });
  const sessionChanged = await verified(first, invite());
  await owner.withSchema('admin').table('staffSessions').where({ id: first.identity.sessionId }).update({ expiresAt: new Date(Date.now() - 1) });
  await reject(service.commit(first.identity, sessionChanged.token), 401);
  await owner.withSchema('admin').table('staffSessions').where({ id: first.identity.sessionId }).update({ expiresAt: new Date(Date.now() + 3600000) });
  console.log('PASS verification expiry and current role/session rechecks at mutation');
  await owner.withSchema('admin').table('staffRateLimits').where({ key: `staff-actions:${first.identity.userId}` }).delete();
  const beforeDeadline = await verified(first, invite());
  const beforeRow = await owner.withSchema('admin').table('staffActionChallenges').where({ sessionId: first.identity.sessionId }).orderBy('createdAt', 'desc').first();
  const actualNow = Date.now;
  try {
    Date.now = () => new Date(beforeRow.expiresAt).getTime() - 1;
    await service.commit(first.identity, beforeDeadline.token);
  } finally { Date.now = actualNow; }
  const atDeadline = await verified(first, invite());
  const atRow = await owner.withSchema('admin').table('staffActionChallenges').where({ sessionId: first.identity.sessionId }).orderBy('createdAt', 'desc').first();
  try {
    Date.now = () => new Date(atRow.expiresAt).getTime();
    await reject(service.commit(first.identity, atDeadline.token), 401);
  } finally { Date.now = actualNow; }
  console.log('PASS server-side five-minute verification boundary (one millisecond before and exact expiry)');

  const superEmail = email();
  const superRequest = await verified(first, invite(superEmail, 'super_admin'));
  const requested = await service.commit(first.identity, superRequest.token);
  assert.equal(requested.invitationId, null);
  assert.equal(await owner.withSchema('admin').table('staffInvitations').where({ email: superEmail }).first(), undefined);
  const approval = await owner.withSchema('admin').table('approvalRequests').where({ email: superEmail }).first();
  assert.equal((await owner.withSchema('admin').table('auditEvents').where({ action: 'staff.super_admin.approval_requested', targetId: approval.id }).first()).targetType, 'staff_approval');
  assert.equal(new Date(approval.expiresAt).getTime() - new Date(approval.createdAt).getTime(), 300000);
  const decision: StaffActionInput = { action: { kind: 'approval', requestId: approval.id }, reason: 'Independent review', decision: 'approve' };
  await reject(service.start(first.identity, decision, password), 403);
  const approved = await verified(second, decision);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: first.identity.userId }).update({ revokedAt: new Date() });
  await reject(service.commit(second.identity, approved.token), 409);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: first.identity.userId }).update({ revokedAt: null });
  const granted = await service.commit(second.identity, approved.token);
  assert.ok(granted.invitationId);
  assert.equal((await owner.withSchema('admin').table('staffInvitations').where({ id: granted.invitationId }).first()).role, 'super_admin');
  assert.equal((await owner.withSchema('admin').table('auditEvents').where({ action: 'staff.invitation.created', targetId: granted.invitationId }).first()).targetType, 'staff_invitation');
  assert.equal((await owner.withSchema('admin').table('auditEvents').where({ action: 'staff.super_admin.approved', targetId: approval.id }).first()).after.invitationId, granted.invitationId);
  assert.equal(await owner.withSchema('admin').table('staffUsers').where({ email: superEmail }).first(), undefined);
  await reject(service.start(second.identity, decision, password), 409);
  console.log('PASS second-person approval, requester-role recheck and no invitation/access before approval');

  const rejectedEmail = email();
  await service.commit(first.identity, (await verified(first, invite(rejectedEmail, 'super_admin'))).token);
  const toReject = await owner.withSchema('admin').table('approvalRequests').where({ email: rejectedEmail }).first();
  await service.commit(second.identity, (await verified(second, { ...decision, action: { kind: 'approval', requestId: toReject.id }, decision: 'reject' })).token);
  assert.equal(await owner.withSchema('admin').table('staffInvitations').where({ email: rejectedEmail }).first(), undefined);
  const expiredEmail = email();
  await service.commit(first.identity, (await verified(first, invite(expiredEmail, 'super_admin'))).token);
  const toExpire = await owner.withSchema('admin').table('approvalRequests').where({ email: expiredEmail }).first();
  const expiryDecision = await verified(second, { ...decision, action: { kind: 'approval', requestId: toExpire.id } });
  await owner.withSchema('admin').table('approvalRequests').where({ id: toExpire.id }).update({ expiresAt: new Date(Date.now() - 1), createdAt: new Date(Date.now() - 300001) });
  await reject(service.commit(second.identity, expiryDecision.token), 409);
  console.log('PASS rejection and expired approval cannot issue invitations');
  await owner.withSchema('admin').table('staffRateLimits').whereIn('key', [first, second].map(user => `staff-actions:${user.identity.userId}`)).delete();

  const raceEmail = email();
  await service.commit(first.identity, (await verified(first, invite(raceEmail, 'super_admin'))).token);
  const raceRequest = await owner.withSchema('admin').table('approvalRequests').where({ email: raceEmail }).first();
  const raceInput: StaffActionInput = { ...decision, action: { kind: 'approval', requestId: raceRequest.id } };
  const [approverOne, approverTwo] = await Promise.all([verified(second, raceInput), verified(limited, raceInput)]);
  const race = await Promise.allSettled([service.commit(second.identity, approverOne.token), service.commit(limited.identity, approverTwo.token)]);
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await owner.withSchema('admin').table('staffInvitations').where({ email: raceEmail })).length, 1);
  console.log('PASS concurrent approval decisions issue only one invitation');

  const concurrentEmail = email();
  const concurrentInput = invite(concurrentEmail);
  const [left, right] = await Promise.all([verified(first, concurrentInput), verified(second, concurrentInput)]);
  const concurrent = await Promise.allSettled([service.commit(first.identity, left.token), service.commit(second.identity, right.token)]);
  assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await owner.withSchema('admin').table('staffInvitations').where({ email: concurrentEmail })).length, 1);
  console.log('PASS concurrent duplicate invitations serialize without double issue');

  failDelivery = true;
  const failedInput = invite();
  const failedDelivery = await service.commit(first.identity, (await verified(first, failedInput)).token);
  assert.equal(failedDelivery.delivery, 'failed');
  const outbox = await owner.withSchema('admin').table('staffInvitationDeliveries').where({ invitationId: failedDelivery.invitationId }).first();
  assert.ok(outbox.encryptedToken);
  assert.equal(outbox.status, 'failed');
  failDelivery = false;
  assert.equal(await service.dispatch(first.identity, failedDelivery.invitationId!), 'sent');
  assert.equal((await owner.withSchema('admin').table('staffInvitationDeliveries').where({ id: outbox.id }).first()).encryptedToken, null);
  const beforeRetry = messages.length;
  assert.equal(await service.dispatch(first.identity, failedDelivery.invitationId!), 'sent');
  assert.equal(messages.length, beforeRetry);
  const revokeInput: StaffActionInput = { action: { kind: 'revoke', invitationId: failedDelivery.invitationId! }, reason: 'Revoke unused invitation', decision: 'approve' };
  await service.commit(first.identity, (await verified(first, revokeInput)).token);
  await reject(service.dispatch(first.identity, failedDelivery.invitationId!), 409);
  await reject(service.start(first.identity, revokeInput, password), 409);
  console.log('PASS durable failed email, retry idempotency and revocation');

  const liveRecipient = email();
  const liveStartResponse = await request(first, { operation: 'start', password, input: invite(liveRecipient) });
  assert.equal(liveStartResponse.status, 200);
  const liveStart = await liveStartResponse.json() as { token: string; options: { challenge: string } };
  assert.equal((await request(first, { operation: 'factor', token: liveStart.token, method: 'passkey', response: first.assertion(liveStart.options.challenge) })).status, 200);
  const realCommit = await request(first, { operation: 'commit', token: liveStart.token });
  assert.equal(realCommit.status, 200);
  const liveIssued = await realCommit.json() as { invitationId: string; delivery: string };
  assert.equal(liveIssued.delivery, 'sent', 'API integration must deliver through the existing local Mailpit transport');
  assert.equal((await request(first, { operation: 'commit', token: liveStart.token })).status, 401);
  console.log('PASS complete HTTP workflow and actual local Mailpit email delivery');

  const secret = generateStaffTotpSecret();
  await owner.withSchema('admin').table('staffTwoFactors').insert({
    id: randomUUID(), userId: second.identity.userId,
    secret: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: secret }),
    backupCodes: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: '[]' }), verified: true,
  });
  function code() {
    const bytes = Buffer.alloc(8);
    bytes.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
    const digest = createHmac('sha1', Buffer.from(secret)).update(bytes).digest();
    return ((digest.readUInt32BE(digest.at(-1)! & 15) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
  }
  const totpStart = await service.start(second.identity, invite(), password);
  const currentCode = code();
  await service.verifyFactor(second.identity, totpStart.token, { method: 'totp', code: currentCode });
  await service.commit(second.identity, totpStart.token);
  const reusedTotp = await service.start(second.identity, invite(), password);
  await reject(service.verifyFactor(second.identity, reusedTotp.token, { method: 'totp', code: currentCode }), 401);
  const invalidFactor = await service.start(limited.identity, invite(), password);
  for (let attempt = 0; attempt < 5; attempt++) {
    await reject(service.verifyFactor(limited.identity, invalidFactor.token, { method: 'totp', code: '000000' }), 401);
  }
  await reject(service.verifyFactor(limited.identity, invalidFactor.token, { method: 'passkey', response: limited.assertion(invalidFactor.options.challenge) }), 401);
  await owner.withSchema('admin').table('staffRateLimits').where({ key: `staff-actions:${limited.identity.userId}` }).update({ count: 30 });
  await reject(service.start(limited.identity, invite(), password), 429);
  console.log('PASS TOTP verification/replay protection and bounded challenge/global attempts');

  await owner.withSchema('admin').table('staffRateLimits').whereIn('key', users.map(id => `staff-actions:${id}`)).delete();
  const lifecycle = (kind: 'disable' | 'enable' | 'role_change', user: Fixture, expectedVersion: number, role: StaffRoleId = 'billing'): StaffActionInput => ({
    action: kind === 'role_change' ? { kind, userId: user.identity.userId, expectedVersion, role }
      : { kind, userId: user.identity.userId, expectedVersion },
    reason: 'Reviewed staff lifecycle change', decision: 'approve',
  });
  const mutate = async (input: StaffActionInput, reviewer = first) => service.commit(reviewer.identity, (await verified(reviewer, input)).token);
  const userRow = (user: Fixture) => owner.withSchema('admin').table('staffUsers').where({ id: user.identity.userId }).first();
  const roleRow = (user: Fixture) => owner.withSchema('admin').table('staffRoleAssignments').where({ userId: user.identity.userId }).whereNull('revokedAt').first();
  const signIn = (user: Fixture) => auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth/sign-in/email`, {
    method: 'POST', headers: { origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json', 'x-admin-access-email': user.identity.accessEmail },
    body: JSON.stringify({ email: user.identity.accessEmail, password }),
  }));
  await owner.withSchema('admin').table('staffRateLimits').whereIn('key', [
    'no-trusted-ip|/sign-in/email', 'no-trusted-ip|/passkey/generate-authenticate-options', 'no-trusted-ip|/passkey/verify-authentication',
  ]).delete();
  const pendingSignIn = await signIn(support);
  assert.equal(pendingSignIn.status, 200);
  assert.equal((await pendingSignIn.json()).twoFactorRedirect, true);
  const factorName = context.createAuthCookie('two_factor').name;
  const factorValue = pendingSignIn.headers.get('set-cookie')?.match(new RegExp(`${factorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;,]*)`))?.[1];
  assert.ok(factorValue);
  const pendingValue = await owner.withSchema('admin').table('staffVerifications').where({ value: support.identity.userId }).first();
  assert.ok(pendingValue, 'password challenge exists before disable');
  await reject(service.start(first.identity, lifecycle('disable', first, 0), password), 403);
  await reject(service.start(first.identity, lifecycle('role_change', first, 0, 'support'), password), 403);
  await reject(service.start(billing.identity, lifecycle('disable', support, 0), password), 403);
  const sentBeforeAccountChanges = messages.length;
  assert.equal((await mutate(lifecycle('disable', support, 0))).event, 'staff.account.disabled');
  assert.ok((await userRow(support)).disabledAt);
  assert.equal((await roleRow(support)).role, 'support');
  const retainedFactors = await owner.withSchema('admin').table('staffPasskeys').where({ userId: support.identity.userId }).select('id');
  assert.equal(retainedFactors.length, 1);
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId: support.identity.userId })).length, 0);
  assert.equal((await owner.withSchema('admin').table('staffVerifications').where({ value: support.identity.userId })).length, 0);
  assert.equal((await request(support)).status, 401);
  assert.equal((await signIn(support)).status, 401, 'disabled staff cannot start a password sign-in');
  await assert.rejects(owner.withSchema('admin').table('staffSessions').insert({
    id: randomUUID(), userId: support.identity.userId, token: randomUUID(), createdAt: new Date(), updatedAt: new Date(), expiresAt: new Date(Date.now() + 3600000),
  }), (error: { code?: string }) => error.code === '42501', 'database rejects a raced session insertion while disabled');
  await reject(service.start(first.identity, lifecycle('enable', support, 0), password), 409);
  assert.equal((await mutate(lifecycle('enable', support, 1))).event, 'staff.account.enabled');
  assert.equal((await userRow(support)).disabledAt, null);
  assert.equal((await roleRow(support)).role, 'support');
  assert.equal((await request(support)).status, 401, 're-enable never restores old sessions');
  const staleFactor = await auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth/passkey/generate-authenticate-options`, {
    headers: { cookie: `${factorName}=${factorValue}`, 'x-admin-access-email': support.identity.accessEmail },
  }));
  // Even if options can be generated without a pending password, assertion completion must fail.
  if (staleFactor.ok) {
    const options = await staleFactor.json() as { challenge: string };
    const passkeyCookie = staleFactor.headers.get('set-cookie')?.match(/sm_admin\.sm_admin_passkey_challenge=([^;,]*)/)?.[1];
    const staleResponse = await auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth/passkey/verify-authentication`, {
      method: 'POST', headers: { origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json', cookie: `${factorName}=${factorValue}; sm_admin.sm_admin_passkey_challenge=${passkeyCookie}` },
      body: JSON.stringify({ response: support.assertion(options.challenge) }),
    }));
    assert.equal(staleResponse.ok, false, 'a pre-disable factor cannot complete after re-enable');
  }
  const freshSignIn = await signIn(support);
  assert.equal(freshSignIn.status, 200, 're-enabled staff can start a fresh sign-in');
  const freshFactorValue = freshSignIn.headers.get('set-cookie')?.match(new RegExp(`${factorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;,]*)`))?.[1];
  assert.ok(freshFactorValue);
  const freshOptionsResponse = await auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth/passkey/generate-authenticate-options`, {
    headers: { cookie: `${factorName}=${freshFactorValue}` },
  }));
  assert.equal(freshOptionsResponse.status, 200);
  const freshOptions = await freshOptionsResponse.json() as { challenge: string };
  const freshPasskeyCookie = freshOptionsResponse.headers.get('set-cookie')?.match(/sm_admin\.sm_admin_passkey_challenge=([^;,]*)/)?.[1];
  assert.ok(freshPasskeyCookie);
  const freshCompletion = await auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth/passkey/verify-authentication`, {
    method: 'POST', headers: { origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json',
      cookie: `${factorName}=${freshFactorValue}; sm_admin.sm_admin_passkey_challenge=${freshPasskeyCookie}` },
    body: JSON.stringify({ response: support.assertion(freshOptions.challenge) }),
  }));
  assert.equal(freshCompletion.status, 200, 're-enabled staff can complete a fresh password-plus-passkey sign-in');
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId: support.identity.userId })).length, 1);
  await assert.rejects(owner.withSchema('admin').table('staffSessions').insert({
    id: randomUUID(), userId: support.identity.userId, token: randomUUID(), createdAt: new Date(0), updatedAt: new Date(), expiresAt: new Date(Date.now() + 3600000),
  }), (error: { code?: string }) => error.code === '42501', 'a pre-change session timestamp cannot be inserted after re-enable');
  console.log('PASS disable/re-enable retains role and factors, rejects old sessions/challenges and blocks disabled sign-in');

  const staleChange = await verified(first, lifecycle('disable', support, 2));
  for (let index = 0; index < 2; index++) {
    await owner.withSchema('admin').table('staffSessions').insert({
      id: randomUUID(), userId: support.identity.userId, token: randomUUID(), createdAt: new Date(), updatedAt: new Date(), expiresAt: new Date(Date.now() + 3600000),
    });
  }
  const lifecycleStartResponse = await request(second, { operation: 'start', password, input: lifecycle('role_change', support, 2, 'billing') });
  assert.equal(lifecycleStartResponse.status, 200);
  const lifecycleStart = await lifecycleStartResponse.json() as { token: string; options: { challenge: string } };
  assert.equal((await request(second, { operation: 'factor', token: lifecycleStart.token, method: 'passkey', response: second.assertion(lifecycleStart.options.challenge) })).status, 200);
  const lifecycleCommit = await request(second, { operation: 'commit', token: lifecycleStart.token });
  assert.equal(lifecycleCommit.status, 200);
  assert.equal((await lifecycleCommit.json()).event, 'staff.account.role_changed');
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId: support.identity.userId })).length, 0, 'every target session is revoked on role change');
  await reject(service.commit(first.identity, staleChange.token), 409);
  assert.equal((await roleRow(support)).role, 'billing');
  assert.equal((await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: support.identity.userId })).length, 2, 'role history is retained');
  const promotion = await mutate(lifecycle('role_change', support, 3, 'super_admin'));
  assert.equal(promotion.event, 'staff.super_admin.approval_requested');
  assert.equal((await roleRow(support)).role, 'billing', 'requesting promotion does not grant access');
  let accountRequest = await owner.withSchema('admin').table('approvalRequests').where({ accountUserId: support.identity.userId, status: 'pending' }).first();
  const accountDecision = (id: string, decision: 'approve' | 'reject' = 'approve'): StaffActionInput => ({
    action: { kind: 'approval', requestId: id }, reason: 'Independent account change review', decision,
  });
  await reject(service.start(first.identity, accountDecision(accountRequest.id), password), 403);
  await mutate(accountDecision(accountRequest.id, 'reject'), second);
  assert.equal((await roleRow(support)).role, 'billing');
  await mutate(lifecycle('role_change', support, 3, 'super_admin'));
  accountRequest = await owner.withSchema('admin').table('approvalRequests').where({ accountUserId: support.identity.userId, status: 'pending' }).first();
  const [approveOne, approveTwo] = await Promise.all([verified(second, accountDecision(accountRequest.id)), verified(limited, accountDecision(accountRequest.id))]);
  const accountRace = await Promise.allSettled([service.commit(second.identity, approveOne.token), service.commit(limited.identity, approveTwo.token)]);
  assert.equal(accountRace.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await roleRow(support)).role, 'super_admin');
  assert.equal((await userRow(support)).accessVersion, 4);
  await mutate(lifecycle('disable', support, 4));
  await mutate(lifecycle('enable', support, 5));
  assert.ok((await userRow(support)).disabledAt, 'Super Admin restore stays disabled pending approval');
  accountRequest = await owner.withSchema('admin').table('approvalRequests').where({ accountUserId: support.identity.userId, status: 'pending' }).first();
  await mutate(accountDecision(accountRequest.id), second);
  assert.equal((await userRow(support)).disabledAt, null);
  assert.equal((await userRow(support)).accessVersion, 6);
  assert.equal(messages.length, sentBeforeAccountChanges, 'account approvals never email an invitation');
  const accountAudit = await owner.withSchema('admin').table('auditEvents').where({ targetId: support.identity.userId, action: 'staff.account.role_changed' }).first();
  assert.equal(accountAudit.targetType, 'staff_user');
  console.log('PASS version-bound role history, independent account approval/rejection, concurrent decisions and Super Admin restoration');

  await owner.withSchema('admin').table('staffRateLimits').whereIn('key', users.map(id => `staff-actions:${id}`)).delete();
  await mutate(lifecycle('role_change', support, 6, 'support'));
  await mutate(lifecycle('role_change', support, 7, 'super_admin'));
  const expiringAccountRequest = await owner.withSchema('admin').table('approvalRequests').where({ accountUserId: support.identity.userId, status: 'pending' }).first();
  const expiringAccountDecision = await verified(second, accountDecision(expiringAccountRequest.id));
  await owner.withSchema('admin').table('approvalRequests').where({ id: expiringAccountRequest.id })
    .update({ createdAt: new Date(Date.now() - 300001), expiresAt: new Date(Date.now() - 1) });
  await reject(service.commit(second.identity, expiringAccountDecision.token), 409);
  assert.equal((await roleRow(support)).role, 'support');
  await mutate(lifecycle('role_change', support, 7, 'super_admin'));
  const staleAccountRequest = await owner.withSchema('admin').table('approvalRequests')
    .where({ accountUserId: support.identity.userId, status: 'pending' }).where('expiresAt', '>', new Date()).first();
  const staleAccountDecision = await verified(second, accountDecision(staleAccountRequest.id));
  await mutate(lifecycle('role_change', support, 7, 'billing'));
  await reject(service.commit(second.identity, staleAccountDecision.token), 409);
  await mutate(lifecycle('role_change', support, 8, 'super_admin'));
  const freshRequest = await owner.withSchema('admin').table('approvalRequests')
    .where({ accountUserId: support.identity.userId, accountVersion: 8, status: 'pending' }).first();
  assert.ok(freshRequest, 'an obsolete pending request must not block a fresh version-bound review');
  await mutate(accountDecision(freshRequest.id, 'reject'), second);
  const readResponse = await request(first);
  assert.equal(readResponse.status, 200);
  const read = await readResponse.json();
  assert.equal(read.staff.find((member: { id: string }) => member.id === support.identity.userId).version, 8);
  assert.equal(read.approvals.find((approval: { id: string }) => approval.id === staleAccountRequest.id).accountChange.kind, 'role_change');
  console.log('PASS expired and stale account approvals cannot mutate access; HTTP lifecycle and snapshot contracts match');
  await mutate(lifecycle('role_change', limited, 0, 'billing'));
  const [disableSecond, demoteFirst] = await Promise.all([
    verified(first, lifecycle('disable', second, 0)), verified(second, lifecycle('role_change', first, 0, 'support')),
  ]);
  const crossChanges = await Promise.allSettled([service.commit(first.identity, disableSecond.token), service.commit(second.identity, demoteFirst.token)]);
  assert.equal(crossChanges.filter(result => result.status === 'fulfilled').length, 1);
  const remaining = await owner.withSchema('admin').table('staffRoleAssignments as r')
    .join('staffUsers as u', 'u.id', 'r.userId').where({ 'r.role': 'super_admin' }).whereNull('r.revokedAt').whereNull('u.disabledAt').count('* as count').first();
  assert.ok(Number(remaining?.count) >= 1, 'concurrent cross-account changes must leave an active Super Admin');
  console.log('PASS concurrent cross-admin disable/demotion preserves an active administrator without deadlock');
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  const audit = await owner.withSchema('admin').table('auditEvents').whereIn('staffUserId', users).select('before', 'after', 'reason');
  assert.equal(JSON.stringify(audit).includes(token), false);
  console.log('Staff management database/API rehearsal passed; audit chain remains valid.');
} finally {
  await owner.withSchema('admin').table('staffInvitations').whereIn('email', recipients).delete();
  await owner.withSchema('admin').table('approvalRequests').whereIn('requestedBy', users).delete();
  await owner.withSchema('admin').table('staffInvitations').whereIn('invitedBy', users).delete();
  await owner.withSchema('admin').table('staffRateLimits').whereIn('key', users.map(id => `staff-actions:${id}`)).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', users).delete();
  await Promise.all([owner.destroy(), staffManagementDatabase.destroy()]);
  await context.options.database?.end?.();
}

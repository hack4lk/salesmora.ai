import assert from 'node:assert/strict';
import { createHash, createHmac, createSign, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import type { StaffRoleId } from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { NextRequest } from 'next/server';

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
process.env.ADMIN_WORKSPACE_EXPORTS_ENABLED = 'true';

const owner = createDatabase(ownerURL);
const prefix = `workspace-export-${randomUUID()}`;
const password = `Rehearsal-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const requestIds: string[] = [];
const workspaceId = randomUUID();
const ownerId = randomUUID();
const ownerEmail = `${prefix}@example.test`;
const failureFunction = 'admin.workspace_export_rehearsal_failure';
let failureTriggerInstalled = false;

const { auth } = await import('./auth');
const authContext = await auth.$context;
const { adminDataRequestsDatabase } = await import('./admin-data-requests');
const { adminWorkspaceExports } = await import('./admin-workspace-exports');
const { GET, POST } = await import('../app/api/admin/data-requests/exports/route');

async function seedStaff(role: StaffRoleId, factors: { passkey?: boolean; totp?: boolean } = {}) {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const token = randomUUID();
  const email = `${prefix}-${role}-${userId}@karpukcreative.com`;
  staffIds.push(userId);
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, name: `${prefix} ${role}`, email, emailVerified: true, createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffAccounts').insert({
    id: randomUUID(), userId, accountId: userId, providerId: 'credential',
    password: await authContext.password.hash(password), createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  let credentialId: string | null = null;
  let privateKey: ReturnType<typeof generateKeyPairSync>['privateKey'] | null = null;
  if (factors.passkey) {
    credentialId = randomBytes(32).toString('base64url');
    const keys = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    privateKey = keys.privateKey;
    const jwk = keys.publicKey.export({ format: 'jwk' });
    assert.ok(jwk.x && jwk.y);
    const cose = isoCBOR.encode(new Map<number, number | Buffer>([
      [1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, 'base64url')], [-3, Buffer.from(jwk.y, 'base64url')],
    ]));
    await owner.withSchema('admin').table('staffPasskeys').insert({
      id: randomUUID(), userId, credentialID: credentialId, publicKey: Buffer.from(cose).toString('base64'),
      counter: 0, deviceType: 'singleDevice', backedUp: false,
    });
  }
  let totpSecret: string | null = null;
  if (factors.totp) {
    totpSecret = randomBytes(20).toString('hex');
    await owner.withSchema('admin').table('staffTwoFactors').insert({
      id: randomUUID(), userId,
      secret: await symmetricEncrypt({ key: authContext.secret, data: totpSecret }),
      backupCodes: await symmetricEncrypt({ key: authContext.secret, data: '[]' }),
      verified: true,
    });
  }

  let counter = 0;
  return {
    identity: { userId, sessionId, accessEmail: email },
    cookie: `${authContext.authCookies.sessionToken.name}=${token}.${await makeSignature(token, authContext.secret)}`,
    totpCode() {
      assert.ok(totpSecret);
      const time = Buffer.alloc(8);
      time.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
      const digest = createHmac('sha1', Buffer.from(totpSecret)).update(time).digest();
      return ((digest.readUInt32BE(digest[digest.length - 1] & 15) & 0x7fffffff) % 1_000_000)
        .toString().padStart(6, '0');
    },
    assertion(challenge: string): AuthenticationResponseJSON {
      assert.ok(credentialId && privateKey);
      const clientDataJSON = Buffer.from(JSON.stringify({
        type: 'webauthn.get', challenge, origin: process.env.ADMIN_AUTH_URL, crossOrigin: false,
      }));
      const count = Buffer.alloc(4);
      count.writeUInt32BE(++counter);
      const authenticatorData = Buffer.concat([
        createHash('sha256').update('localhost').digest(),
        Buffer.from([5]),
        count,
      ]);
      const signature = createSign('SHA256')
        .update(authenticatorData)
        .update(createHash('sha256').update(clientDataJSON).digest())
        .end()
        .sign(privateKey);
      return {
        id: credentialId,
        rawId: credentialId,
        type: 'public-key',
        clientExtensionResults: {},
        response: {
          clientDataJSON: clientDataJSON.toString('base64url'),
          authenticatorData: authenticatorData.toString('base64url'),
          signature: signature.toString('base64url'),
        },
      };
    },
  };
}

type StaffFixture = Awaited<ReturnType<typeof seedStaff>>;

async function anotherSession(staff: StaffFixture): Promise<StaffFixture> {
  const sessionId = randomUUID();
  const token = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId,
    userId: staff.identity.userId,
    token,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return {
    ...staff,
    identity: { ...staff.identity, sessionId },
    cookie: `${authContext.authCookies.sessionToken.name}=${token}.${await makeSignature(token, authContext.secret)}`,
  };
}

async function request(staff: StaffFixture | null, body?: unknown, overrides: Record<string, string> = {}) {
  const headers = new Headers({
    origin: process.env.ADMIN_AUTH_URL!,
    'content-type': 'application/json',
    ...overrides,
  });
  if (staff) {
    headers.set('cookie', staff.cookie);
    headers.set('x-admin-access-email', staff.identity.accessEmail);
  }
  const req = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/data-requests/exports`, {
    method: body === undefined ? 'GET' : 'POST',
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return body === undefined ? GET(req) : POST(req);
}

async function start(staff: StaffFixture, method: 'totp' | 'passkey' = 'passkey') {
  const response = await request(staff, {
    operation: 'start',
    workspaceId,
    reason: 'Customer requested an account data export.',
    password,
    method,
  });
  assert.equal(response.status, 200);
  const value = await response.json() as { token: string; options?: { challenge: string } };
  assert.match(value.token, /^[\w-]{43}$/);
  if (method === 'passkey') assert.ok(value.options?.challenge);
  return value;
}

async function postFactor(staff: StaffFixture, token: string, method: 'totp', code: string): Promise<Response>;
async function postFactor(staff: StaffFixture, token: string, method: 'passkey', code: string): Promise<Response>;
async function postFactor(staff: StaffFixture, token: string, method: 'totp' | 'passkey', code: string) {
  const body = method === 'totp'
    ? { operation: 'factor', token, method, code }
    : { operation: 'factor', token, method, response: staff.assertion(code) };
  return request(staff, body);
}

async function createOwnerWorkspace() {
  await owner('users').insert({
    id: ownerId,
    name: `${prefix} workspace owner`,
    email: ownerEmail,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'workspace-export-rehearsal',
    termsAcceptedAt: now,
  });
  await owner.transaction(async trx => {
    await trx('workspaces').insert({
      id: workspaceId,
      ownerId,
      businessName: `${prefix} workspace`,
      businessType: 'test',
      postalCode: '',
      serviceRange: '',
      createdAt: now,
    });
    await trx('workspaceMemberships').insert({ workspaceId, userId: ownerId, role: 'owner' });
    await trx('workspacePolicies').insert({ workspaceId });
  });
}

try {
  await createOwnerWorkspace();

  const privileges = await owner.raw<{
    rows: [{ can_select: boolean; can_insert: boolean; can_update: boolean; can_delete: boolean }];
  }>(`SELECT
    has_table_privilege('salesmora_admin_app', 'admin."workspaceExportRequests"', 'SELECT') AS can_select,
    has_table_privilege('salesmora_admin_app', 'admin."workspaceExportRequests"', 'INSERT') AS can_insert,
    has_table_privilege('salesmora_admin_app', 'admin."workspaceExportRequests"', 'UPDATE') AS can_update,
    has_table_privilege('salesmora_admin_app', 'admin."workspaceExportRequests"', 'DELETE') AS can_delete`);
  assert.deepEqual(privileges.rows[0], { can_select: true, can_insert: true, can_update: false, can_delete: false });

  const superAdmin = await seedStaff('super_admin', { passkey: true, totp: true });
  const support = await seedStaff('support', { passkey: true });
  const billing = await seedStaff('billing', { passkey: true });
  const wrongPassword = await request(superAdmin, {
    operation: 'start', workspaceId, reason: 'Customer requested an account data export.',
    password: `${password}-wrong`, method: 'passkey',
  });
  assert.equal(wrongPassword.status, 401);
  assert.equal((await request(null)).status, 401);
  assert.equal((await request(billing)).status, 403);
  assert.equal((await request(superAdmin, { operation: 'start' })).status, 400);
  assert.equal((await request(superAdmin, { operation: 'commit', token: 'x'.repeat(43) }, { origin: 'https://foreign.example' })).status, 403);
  assert.equal((await request(superAdmin, { padding: 'x'.repeat(17_000) })).status, 413);
  assert.deepEqual(await (await request(support)).json(), { methods: ['passkey'] });

  const passkeyStart = await start(support);
  const passkeyVerified = await postFactor(support, passkeyStart.token, 'passkey', passkeyStart.options!.challenge);
  assert.equal(passkeyVerified.status, 200);
  const commitResponse = await request(support, { operation: 'commit', token: passkeyStart.token });
  assert.equal(commitResponse.status, 200);
  assert.equal(commitResponse.headers.get('cache-control'), 'no-store');
  const record = await commitResponse.json() as { id: string; workspaceId: string; workspaceName: string; ownerName: string; maskedOwnerEmail: string; state: string };
  requestIds.push(record.id);
  assert.equal(record.workspaceId, workspaceId);
  assert.equal(record.workspaceName, `${prefix} workspace`);
  assert.equal(record.ownerName, `${prefix} workspace owner`);
  assert.equal(record.maskedOwnerEmail, `${prefix.slice(0, 2)}••••@example.test`);
  assert.equal(record.state, 'queued');
  assert(!JSON.stringify(record).includes(ownerEmail));
  assert.equal((await owner.withSchema('admin').table('workspaceExportRequests').where({ id: record.id }).first())?.state, 'queued');
  const stored = await owner.withSchema('admin').table('workspaceExportRequests').where({ id: record.id }).first<{ maskedOwnerEmail: string }>('maskedOwnerEmail');
  assert.equal(stored?.maskedOwnerEmail, record.maskedOwnerEmail);
  const queue = await adminWorkspaceExports.read(support.identity);
  assert.equal(queue.role, 'support');
  assert.equal(queue.exports[0]?.id, record.id);
  assert.equal(queue.exports[0]?.notificationStatus, 'pending');
  assert(queue.workspaces.some(workspace => workspace.id === workspaceId));
  assert(!JSON.stringify(queue).includes(ownerEmail));
  assert.equal((await request(support, { operation: 'commit', token: passkeyStart.token })).status, 401);

  const totpStart = await start(superAdmin, 'totp');
  const goodCode = superAdmin.totpCode();
  const wrongCode = goodCode === '000000' ? '000001' : '000000';
  assert.equal((await postFactor(superAdmin, totpStart.token, 'totp', wrongCode)).status, 401);
  const attempt = await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: invitationTokenHash(totpStart.token) }).first<{ attempts: number }>('attempts');
  assert.equal(attempt?.attempts, 1);
  assert.equal((await postFactor(superAdmin, totpStart.token, 'totp', goodCode)).status, 200);
  const totpCommit = await request(superAdmin, { operation: 'commit', token: totpStart.token });
  assert.equal(totpCommit.status, 200);
  const totpRecord = await totpCommit.json() as { id: string };
  requestIds.push(totpRecord.id);
  const replay = await start(superAdmin, 'totp');
  assert.equal((await postFactor(superAdmin, replay.token, 'totp', goodCode)).status, 401);
  assert.equal((await request(superAdmin, { operation: 'commit', token: replay.token })).status, 401);

  const exhausted = await start(superAdmin, 'totp');
  let invalidCodes = 0;
  for (let value = 0; invalidCodes < 5; value++) {
    const code = String(value).padStart(6, '0');
    if (code === goodCode) continue;
    assert.equal((await postFactor(superAdmin, exhausted.token, 'totp', code)).status, 401);
    invalidCodes++;
  }
  const exhaustedChallenge = await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: invitationTokenHash(exhausted.token) }).first<{ attempts: number }>('attempts');
  assert.equal(exhaustedChallenge?.attempts, 5);
  assert.equal((await postFactor(superAdmin, exhausted.token, 'totp', superAdmin.totpCode())).status, 401);

  const expired = await start(superAdmin);
  await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: invitationTokenHash(expired.token) }).update({ expiresAt: new Date(Date.now() - 1) });
  assert.equal((await postFactor(superAdmin, expired.token, 'passkey', expired.options!.challenge)).status, 401);

  const sessionBound = await start(superAdmin);
  const alternateSession = await anotherSession(superAdmin);
  assert.equal((await postFactor(alternateSession, sessionBound.token, 'passkey', sessionBound.options!.challenge)).status, 401);
  assert.equal((await postFactor(superAdmin, sessionBound.token, 'passkey', sessionBound.options!.challenge)).status, 200);
  const sessionBoundCommit = await request(superAdmin, { operation: 'commit', token: sessionBound.token });
  assert.equal(sessionBoundCommit.status, 200);
  requestIds.push((await sessionBoundCommit.json() as { id: string }).id);

  await owner('users').where({ id: ownerId }).update({ emailVerified: false });
  assert.equal((await request(superAdmin, {
    operation: 'start', workspaceId, reason: 'Customer requested an account data export.',
    password, method: 'passkey',
  })).status, 409);
  await owner('users').where({ id: ownerId }).update({ emailVerified: true });

  const ownerUnavailable = await start(superAdmin);
  assert.equal((await postFactor(superAdmin, ownerUnavailable.token, 'passkey', ownerUnavailable.options!.challenge)).status, 200);
  await owner('users').where({ id: ownerId }).update({ deletionRequestedAt: new Date() });
  assert.equal((await request(superAdmin, { operation: 'commit', token: ownerUnavailable.token })).status, 409);
  await owner('users').where({ id: ownerId }).update({ deletionRequestedAt: null });

  const rollbackStart = await start(superAdmin);
  assert.equal((await postFactor(superAdmin, rollbackStart.token, 'passkey', rollbackStart.options!.challenge)).status, 200);
  await owner.raw(`CREATE FUNCTION ${failureFunction}() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.action = 'data.requests.export.requested' THEN RAISE EXCEPTION 'Rehearsal export audit append failure'; END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER workspace_export_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
    FOR EACH ROW EXECUTE FUNCTION ${failureFunction}()`);
  failureTriggerInstalled = true;
  const failedCommit = await request(superAdmin, { operation: 'commit', token: rollbackStart.token });
  assert.equal(failedCommit.status, 503);
  assert.equal(failedCommit.headers.get('cache-control'), 'no-store');
  const afterRollback = await owner.withSchema('admin').table('workspaceExportRequests').where({ workspaceId }).count<{ count: string }[]>('* as count');
  assert.equal(Number(afterRollback[0].count), requestIds.length);
  const unconsumed = await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: invitationTokenHash(rollbackStart.token) }).first<{ consumedAt: Date | null }>('consumedAt');
  assert.equal(unconsumed?.consumedAt, null);
  await owner.raw('DROP TRIGGER workspace_export_rehearsal_failure ON admin."auditEvents"');
  await owner.raw(`DROP FUNCTION ${failureFunction}()`);
  failureTriggerInstalled = false;

  const denied = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.identity.userId, action: 'data.requests.export.access_denied' }).first();
  assert.ok(denied);
  const requestAudit = await owner.withSchema('admin').table('auditEvents')
    .where({ targetId: record.id, action: 'data.requests.export.requested' }).first<{ after: { state: string; factor: string }; reason: string }>();
  assert.equal(requestAudit?.after.state, 'queued');
  assert.equal(requestAudit?.after.factor, 'passkey');
  assert.equal(requestAudit?.reason, 'Customer requested an account data export.');
  console.log('PASS export API enforces independent staff sessions, password + TOTP/passkey step-up, role and Owner eligibility, one-time challenges, atomic persistence/audit, PII masking, and least-privilege grants');
} finally {
  if (failureTriggerInstalled) {
    await owner.raw('DROP TRIGGER IF EXISTS workspace_export_rehearsal_failure ON admin."auditEvents"');
    await owner.raw(`DROP FUNCTION IF EXISTS ${failureFunction}()`);
  }
  await owner.withSchema('admin').table('workspaceExportRequests').whereIn('id', requestIds).delete();
  await owner('workspaces').where({ id: workspaceId }).delete();
  await owner('users').where({ id: ownerId }).delete();
  for (const userId of staffIds) {
    await owner.withSchema('admin').table('staffRateLimits').where({ key: `staff-actions:${userId}` }).delete();
  }
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await adminDataRequestsDatabase.destroy();
  await owner.destroy();
  await authContext.options.database?.end?.();
}

console.log('Admin workspace-export persistence/API rehearsal passed; append-only fictional audit events remain.');

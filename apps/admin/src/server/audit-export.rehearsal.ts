import assert from 'node:assert/strict';
import { createHash, createHmac, createSign, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent, verifyAdminAuditChain } from '@salesmora/data/admin-audit';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import type { AuditExportInput, StaffRoleId } from '@salesmora/contracts';
import { NextRequest } from 'next/server';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) || !process.env.DB_ADMIN_APP_PASSWORD) {
  throw new Error('Use an isolated local test database and provision DB_ADMIN_APP_PASSWORD.');
}
const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app'; adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;
process.env.ADMIN_DATABASE_URL = adminURL.href;
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
const owner = createDatabase(ownerURL);
const { auth } = await import('./auth');
const context = await auth.$context;
const { auditViewer, createAuditViewerService, auditViewerDatabase, AuditViewerError } = await import('./audit-viewer');
const { createStaffManagementService, staffManagementDatabase } = await import('./staff-management');
const { GET, POST } = await import('../app/api/admin/audit/export/route');
const service = createAuditViewerService(auditViewerDatabase);
const users: string[] = [];
const prefix = `audit-export-${randomUUID()}`;
const password = `Rehearsal-${randomUUID()}`;
const now = new Date();
async function seed(role: StaffRoleId) {
  const userId = randomUUID(); users.push(userId);
  const email = `${prefix}-${users.length}@karpukcreative.com`;
  const sessionId = randomUUID(); const token = randomUUID();
  await owner.withSchema('admin').table('staffUsers').insert({ id: userId, name: prefix, email, emailVerified: true, createdAt: now, updatedAt: now });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffAccounts').insert({ id: randomUUID(), userId, accountId: userId, providerId: 'credential',
    password: await context.password.hash(password), createdAt: now, updatedAt: now });
  await owner.withSchema('admin').table('staffSessions').insert({ id: sessionId, userId, token, createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + 3600000) });
  const credentialID = randomBytes(32).toString('base64url');
  const keys = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = keys.publicKey.export({ format: 'jwk' });
  assert.ok(jwk.x && jwk.y);
  const cose = isoCBOR.encode(new Map<number, number | Buffer>([
    [1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, 'base64url')], [-3, Buffer.from(jwk.y, 'base64url')],
  ]));
  await owner.withSchema('admin').table('staffPasskeys').insert({ id: randomUUID(), userId, credentialID,
    publicKey: Buffer.from(cose).toString('base64'), counter: 0, deviceType: 'singleDevice', backedUp: false });
  let counter = 0;
  return {
    identity: { userId, sessionId, accessEmail: email },
    cookie: `${context.authCookies.sessionToken.name}=${token}.${await makeSignature(token, context.secret)}`,
    assertion(challenge: string, uv = true): AuthenticationResponseJSON {
      const clientDataJSON = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge, origin: process.env.ADMIN_AUTH_URL, crossOrigin: false }));
      const count = Buffer.alloc(4); count.writeUInt32BE(++counter);
      const authenticatorData = Buffer.concat([createHash('sha256').update('localhost').digest(), Buffer.from([uv ? 5 : 1]), count]);
      const signature = createSign('SHA256').update(authenticatorData).update(createHash('sha256').update(clientDataJSON).digest()).end().sign(keys.privateKey);
      return { id: credentialID, rawId: credentialID, type: 'public-key', clientExtensionResults: {},
        response: { clientDataJSON: clientDataJSON.toString('base64url'), authenticatorData: authenticatorData.toString('base64url'), signature: signature.toString('base64url') } };
    },
  };
}
type Fixture = Awaited<ReturnType<typeof seed>>;
async function request(user: Fixture | null, body?: unknown, overrides: Record<string, string> = {}) {
  const headers = new Headers({ origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json', ...overrides });
  if (user) { headers.set('cookie', user.cookie); headers.set('x-admin-access-email', user.identity.accessEmail); }
  const req = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit/export`, {
    method: body === undefined ? 'GET' : 'POST', headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return body === undefined ? GET(req) : POST(req);
}
const rejected = (operation: Promise<unknown>, status: number) => assert.rejects(operation, (error: unknown) =>
  error instanceof AuditViewerError && error.status === status);
async function verified(user: Fixture, input: AuditExportInput, api = service) {
  const start = await api.startExport(user.identity, input, password);
  assert.ok(start.token && start.options);
  await api.verifyExportFactor(user.identity, start.token, { method: 'passkey', response: user.assertion(start.options.challenge) });
  return start.token;
}
async function inputFor(query: string, api = service): Promise<AuditExportInput> {
  const result = await api.read(admin.identity, { query });
  return { snapshot: { filters: { query, actor: '', category: 'all', range: 'week' }, count: result.total,
    asOf: result.asOf, throughSequence: result.throughSequence }, reason: 'Audit export rehearsal' };
}
const admin = await seed('super_admin');
try {
  const [second, support, billing, limited] = await Promise.all([seed('super_admin'), seed('support'), seed('billing'), seed('super_admin')]);
  assert.equal((await request(null)).status, 401);
  for (const denied of [support, billing]) {
    for (const body of [undefined, { operation: 'commit', token: 't'.repeat(43) }]) {
      const before = await owner.withSchema('admin').table('auditEvents').where({ staffUserId: denied.identity.userId }).count<{ count: string }[]>('* as count');
      const response = await request(denied, body);
      assert.equal(response.status, 403);
      const after = await owner.withSchema('admin').table('auditEvents').where({ staffUserId: denied.identity.userId, action: 'audit.viewer.access_denied' }).count<{ count: string }[]>('* as count');
      assert.equal(Number(after[0].count), Number(before[0].count) + 1);
    }
  }
  assert.equal((await request(admin, { operation: 'commit', token: 't'.repeat(43) }, { origin: 'https://foreign.example' })).status, 403);
  assert.equal((await request(admin, { operation: 'commit', token: 't'.repeat(43), verified: true })).status, 400);
  assert.equal((await request(admin, { padding: 'x'.repeat(17_000) })).status, 413);
  assert.equal((await request(admin, {}, { 'content-type': 'text/plain' })).status, 415);
  assert.deepEqual(await (await request(admin)).json(), { methods: ['passkey'] });
  const headers = new Headers({ cookie: admin.cookie, 'x-admin-access-email': admin.identity.accessEmail, origin: process.env.ADMIN_AUTH_URL!, 'content-type': 'application/json' });
  assert.equal((await POST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit/export`, { method: 'POST', headers, body: '{invalid' }))).status, 400);
  assert.equal((await GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit/export?token=forbidden`, { headers }))).status, 400);
  assert.equal((await GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit/export`, { headers: { cookie: admin.cookie } }))).status, 401);
  await rejected(service.exportMethods({ ...admin.identity, accessEmail: second.identity.accessEmail }), 401);
  console.log('PASS isolated identity, durable denied exports, Origin, JSON/body/operation limits and registered-factor discovery');

  await auditViewerDatabase.transaction(async trx => {
    for (let index = 0; index < 7; index++) await appendAdminAuditEvent(trx, {
      staffUserId: admin.identity.userId, staffRole: 'super_admin', action: 'audit.export.rehearsal',
      targetType: 'rehearsal', targetId: `${prefix}-evidence-${index}`, reason: index === 0 ? '=HYPERLINK("https://example.invalid","unsafe")' : prefix,
      userAgent: 'Agent "quoted", full\nsecond line', before: { role: 'support' }, after: { role: 'billing' },
      ipAddress: '2001:db8::42', occurredAt: now,
    });
  });
  const input = await inputFor(`${prefix}-evidence`);
  assert.equal(input.snapshot.count, 7);
  await rejected(service.startExport(admin.identity, input, 'wrong-password'), 401);
  const start = await service.startExport(admin.identity, input, password);
  assert.ok(start.token && start.options);
  await rejected(service.commitExport(admin.identity, start.token), 401);
  await rejected(service.verifyExportFactor(second.identity, start.token, { method: 'passkey', response: second.assertion(start.options.challenge) }), 401);
  await rejected(service.verifyExportFactor(admin.identity, start.token, { method: 'passkey', response: admin.assertion(start.options.challenge, false) }), 401);
  await service.verifyExportFactor(admin.identity, start.token, { method: 'passkey', response: admin.assertion(start.options.challenge) });
  await rejected(service.verifyExportFactor(admin.identity, start.token, { method: 'passkey', response: admin.assertion(start.options.challenge) }), 409);
  const later = await auditViewerDatabase.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: admin.identity.userId, staffRole: 'super_admin', action: 'audit.export.rehearsal',
    targetType: 'rehearsal', targetId: `${prefix}-evidence-later`, occurredAt: now,
  }));
  const response = await request(admin, { operation: 'commit', token: start.token }, { 'user-agent': 'Export rehearsal', 'x-forwarded-for': '203.0.113.1' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(response.headers.get('content-disposition')!, /^attachment; filename="salesmora-admin-audit-\d{4}-\d\d-\d\d.csv"$/);
  assert.equal(response.headers.get('x-export-count'), '7');
  const csv = await response.text();
  assert.ok(csv.startsWith('"sequence","event_id","occurred_at_utc"'));
  assert.ok(csv.includes(`"'=HYPERLINK(""https://example.invalid"",""unsafe"")"`));
  assert.ok(csv.includes('"Agent ""quoted"", full\nsecond line"'));
  assert.ok(csv.includes('"{""role"":""support""}"'));
  assert.ok(csv.includes('"2001:db8::42"'));
  assert.equal(csv.includes(later.id), false);
  const digest = createHash('sha256').update(csv).digest('hex');
  assert.equal(response.headers.get('x-export-sha256'), digest);
  const event = await owner.withSchema('admin').table('auditEvents').where({ id: response.headers.get('x-audit-event-id') }).first();
  assert.equal(event.action, 'staff.audit_export');
  assert.equal(event.reason, input.reason);
  assert.equal(event.after.count, 7);
  assert.equal(event.after.sha256, digest);
  assert.equal(event.after.factor, 'passkey');
  assert.equal(event.after.delivery, 'prepared_for_download');
  assert.equal(event.ipAddress, null);
  assert.equal(event.userAgent, 'Export rehearsal');
  assert.deepEqual(event.after.filters, input.snapshot.filters);
  await rejected(service.commitExport(admin.identity, start.token), 401);
  const concurrent = await verified(admin, await inputFor(`${prefix}-evidence`));
  const outcomes = await Promise.allSettled([service.commitExport(admin.identity, concurrent), service.commitExport(admin.identity, concurrent)]);
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
  console.log('PASS real password/UV-passkey, complete multi-page CSV, formulas/quotes/newlines, evidence, snapshot exclusion, checksum, durable audit and one-use concurrency');

  const fresh = await inputFor(`${prefix}-evidence`);
  const sessionToken = await verified(admin, fresh);
  const otherSessionId = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: otherSessionId, userId: admin.identity.userId, token: randomUUID(), createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + 3600000),
  });
  await rejected(service.commitExport({ ...admin.identity, sessionId: otherSessionId }, sessionToken), 401);
  await owner.withSchema('admin').table('staffUsers').where({ id: admin.identity.userId }).update({ disabledAt: new Date() });
  await rejected(service.commitExport(admin.identity, sessionToken), 401);
  await owner.withSchema('admin').table('staffUsers').where({ id: admin.identity.userId }).update({ disabledAt: null });
  await owner.withSchema('admin').table('staffSessions').where({ id: admin.identity.sessionId }).update({ expiresAt: new Date(Date.now() - 1) });
  await rejected(service.commitExport(admin.identity, sessionToken), 401);
  await owner.withSchema('admin').table('staffSessions').where({ id: admin.identity.sessionId }).update({ expiresAt: new Date(Date.now() + 3600000) });
  const old = await verified(admin, fresh);
  await owner.withSchema('admin').table('staffActionChallenges').where({ id: invitationTokenHash(old) }).update({ expiresAt: new Date(Date.now() - 1) });
  await rejected(service.commitExport(admin.identity, old), 401);
  const roleToken = await verified(admin, fresh);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: admin.identity.userId }).update({ role: 'support' });
  await rejected(service.commitExport(admin.identity, roleToken), 403);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: admin.identity.userId }).update({ role: 'super_admin' });
  await rejected(service.startExport(admin.identity, { ...fresh, snapshot: { ...fresh.snapshot, count: fresh.snapshot.count - 1 } }, password), 409);
  await rejected(service.startExport(admin.identity, { ...fresh, snapshot: { ...fresh.snapshot, count: 50_001 } }, password), 400);
  const staff = createStaffManagementService(staffManagementDatabase);
  await assert.rejects(staff.commit(admin.identity, roleToken), /another action/);
  const staffToken = await staff.start(admin.identity, { action: { kind: 'invite', role: 'support', email: `${prefix}@karpukcreative.com` }, reason: 'Purpose isolation', decision: 'approve' }, password);
  await rejected(service.commitExport(admin.identity, staffToken.token), 401);
  const failedFactor = await service.startExport(second.identity, fresh, password);
  assert.ok(failedFactor.token);
  for (let attempt = 0; attempt < 5; attempt++) await rejected(service.verifyExportFactor(second.identity, failedFactor.token, { method: 'totp', code: '000000' }), 401);
  const challenge = await owner.withSchema('admin').table('staffActionChallenges').where({ id: invitationTokenHash(failedFactor.token) }).first();
  assert.equal(challenge.attempts, 5);
  for (let attempt = 0; attempt < 30; attempt++) await rejected(service.startExport(limited.identity, fresh, 'wrong'), 401);
  await rejected(service.startExport(limited.identity, fresh, password), 429);

  const secret = randomBytes(20).toString('hex');
  await owner.withSchema('admin').table('staffTwoFactors').insert({
    id: randomUUID(), userId: second.identity.userId, secret: await symmetricEncrypt({ key: context.secret, data: secret }),
    backupCodes: await symmetricEncrypt({ key: context.secret, data: '[]' }), verified: true,
  });
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const mac = createHmac('sha1', Buffer.from(secret)).update(counter).digest();
  const code = ((mac.readUInt32BE(mac[mac.length - 1] & 15) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
  const totpStart = await service.startExport(second.identity, fresh, password);
  assert.ok(totpStart.token);
  await service.verifyExportFactor(second.identity, totpStart.token, { method: 'totp', code });
  const totpExport = await service.commitExport(second.identity, totpStart.token);
  const totpEvent = await owner.withSchema('admin').table('auditEvents').where({ id: totpExport.eventId }).first();
  assert.equal(totpEvent.after.factor, 'totp');
  const replay = await service.startExport(second.identity, fresh, password);
  assert.ok(replay.token);
  await rejected(service.verifyExportFactor(second.identity, replay.token, { method: 'totp', code }), 401);
  console.log('PASS expired verification, authoritative role, strict counts, action-purpose binding, persisted attempt/rate limits and TOTP replay rejection');

  await owner.transaction(async trx => {
    const api = createAuditViewerService(trx);
    const token = await verified(admin, fresh, api);
    await trx.raw(`CREATE FUNCTION admin.audit_export_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN IF NEW.action = 'staff.audit_export' THEN RAISE EXCEPTION 'Rehearsal audit append failure'; END IF; RETURN NEW; END $$`);
    await trx.raw(`CREATE TRIGGER audit_export_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
      FOR EACH ROW EXECUTE FUNCTION admin.audit_export_rehearsal_failure()`);
    await assert.rejects(api.commitExport(admin.identity, token), /Rehearsal audit append failure/);
    const challenge = await trx.withSchema('admin').table('staffActionChallenges').where({ id: invitationTokenHash(token) }).first();
    assert.equal(challenge.consumedAt, null, 'failed audit append must roll back token consumption and never return CSV');
    await trx.rollback();
  });
  const originalCommit = auditViewer.commitExport;
  auditViewer.commitExport = async () => { throw new Error('Rehearsal database unavailable'); };
  try {
    const failure = await request(admin, { operation: 'commit', token: 't'.repeat(43) });
    assert.equal(failure.status, 503);
    assert.equal(failure.headers.get('cache-control'), 'no-store');
    assert.equal(failure.headers.has('content-disposition'), false);
    assert.match((await failure.json()).error, /No file was released/);
  } finally { auditViewer.commitExport = originalCommit; }
  console.log('PASS disabled/expired/cross-session rejection, audit-append rollback and explicit no-file HTTP 503');

  // Synthetic bulk evidence is isolated in a rolled-back owner transaction, never left in the append-only chain.
  await owner.transaction(async trx => {
    const bulkPrefix = `${prefix}-bulk`;
    await trx.raw(`INSERT INTO admin."auditEvents"
      (id, "occurredAt", "staffRole", action, "targetType", "targetId", "requestId", hash)
      SELECT ? || n, ?, 'bootstrap', 'audit.export.bulk_rehearsal', 'rehearsal', ? || n, ? || n,
        md5(? || n) || md5(? || n) FROM generate_series(1, 50001) AS n`,
    [bulkPrefix, now, bulkPrefix, bulkPrefix, bulkPrefix, bulkPrefix]);
    const api = createAuditViewerService(trx);
    const bulk = await inputFor(bulkPrefix, api);
    assert.equal(bulk.snapshot.count, 50_001);
    await rejected(api.startExport(admin.identity, bulk, password), 400);
    await rejected(api.startExport(admin.identity, { ...bulk, snapshot: { ...bulk.snapshot, count: 50_000 } }, password), 409);
    // Remove one synthetic fixture only inside this owner transaction; the whole test is rolled back.
    await trx.withSchema('admin').table('auditEvents').where({ targetId: `${bulkPrefix}50001` }).delete();
    const exact = await inputFor(bulkPrefix, api);
    assert.equal(exact.snapshot.count, 50_000);
    const token = await verified(admin, exact, api);
    const result = await api.commitExport(admin.identity, token);
    assert.equal(result.count, 50_000);
    assert.equal(result.csv.split('\r\n').length, 50_002);
    assert.ok(result.csv.includes(`${bulkPrefix}50000`));
    await trx.rollback();
  });
  await owner.transaction(async trx => {
    const api = createAuditViewerService(trx);
    await appendAdminAuditEvent(trx, { staffUserId: admin.identity.userId, staffRole: 'super_admin', action: 'audit.export.size_rehearsal',
      targetType: 'rehearsal', targetId: `${prefix}-oversize`, after: { evidence: 'x'.repeat(33 * 1024 * 1024) } });
    const oversized = await inputFor(`${prefix}-oversize`, api);
    const token = await verified(admin, oversized, api);
    await rejected(api.commitExport(admin.identity, token), 409);
    assert.equal(await trx.withSchema('admin').table('auditEvents').where({ targetId: invitationTokenHash(token), action: 'staff.audit_export' }).first(), undefined);
    await trx.rollback();
  });
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  console.log('PASS real 50,000/50,001 result boundaries, no silent truncation, 32 MiB refusal and persistent chain integrity');
  console.log('Audit export database/API rehearsal passed; fictional audited preparations remain.');
} finally {
  for (const userId of users) await owner.withSchema('admin').table('staffRateLimits').where({ key: `staff-actions:${userId}` }).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', users).delete();
  await Promise.all([owner.destroy(), auditViewerDatabase.destroy(), staffManagementDatabase.destroy()]);
  await context.options.database?.end?.();
}

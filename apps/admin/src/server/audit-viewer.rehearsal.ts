import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature } from 'better-auth/crypto';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent, verifyAdminAuditChain } from '@salesmora/data/admin-audit';
import {
  auditArchiveHealthSchema, auditPageSchema, auditRetainedCheckpointSchema, auditVerificationSchema,
  retainedAuditAnchor, type StaffRoleId,
} from '@salesmora/contracts';
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
const { createAuditViewerService, auditViewerDatabase, AuditViewerError } = await import('./audit-viewer');
const { GET, POST } = await import('../app/api/admin/audit/route');
const { GET: archiveHealthGET } = await import('../app/api/admin/audit/archive-health/route');
const service = createAuditViewerService(auditViewerDatabase);
const users: string[] = [];
const archiveLedgerId = randomUUID();
const archiveCopyId = randomUUID();
const archiveNextCopyId = randomUUID();
const prefix = `audit-${randomUUID()}`;
const now = new Date();
const nowMs = now.getTime();
async function seed(role: StaffRoleId) {
  const userId = randomUUID(); users.push(userId);
  const email = `${prefix}-${role}@karpukcreative.com`;
  const sessionId = randomUUID(); const token = randomUUID();
  await owner.withSchema('admin').table('staffUsers').insert({ id: userId, name: `${prefix} ${role}`, email, createdAt: now, updatedAt: now });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now, expiresAt: new Date(nowMs + 3600000),
  });
  return {
    identity: { userId, sessionId, accessEmail: email },
    token,
    cookie: `${context.authCookies.sessionToken.name}=${token}.${await makeSignature(token, context.secret)}`,
  };
}
type Fixture = Awaited<ReturnType<typeof seed>>;
async function request(user: Fixture | null, query = '', method: 'GET' | 'POST' = 'GET', overrides: Record<string, string> = {}, body?: string) {
  const headers = new Headers({ origin: process.env.ADMIN_AUTH_URL!, ...overrides });
  if (user) { headers.set('cookie', user.cookie); headers.set('x-admin-access-email', user.identity.accessEmail); }
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit${query ? `?${query}` : ''}`, { method, headers, ...(body ? { body } : {}) });
  return method === 'POST' ? POST(request) : GET(request);
}
async function requestArchiveHealth(user: Fixture | null, query = '') {
  const headers = new Headers({ origin: process.env.ADMIN_AUTH_URL! });
  if (user) { headers.set('cookie', user.cookie); headers.set('x-admin-access-email', user.identity.accessEmail); }
  return archiveHealthGET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit/archive-health${query}`, { headers }));
}
const rejected = (operation: Promise<unknown>, status: number) => assert.rejects(operation, (error: unknown) =>
  error instanceof AuditViewerError && error.status === status);

try {
  const [superAdmin, support, billing] = await Promise.all([seed('super_admin'), seed('support'), seed('billing')]);
  assert.equal((await request(null)).status, 401);
  for (const denied of [support, billing]) {
    for (const method of ['GET', 'POST'] as const) {
      const before = await owner.withSchema('admin').table('auditEvents').where({ staffUserId: denied.identity.userId, action: 'audit.viewer.access_denied' }).select('id');
      const response = await request(denied, '', method, { 'user-agent': 'Audit rehearsal browser', 'x-forwarded-for': '203.0.113.99' });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal('events' in await response.json(), false);
      const after = await owner.withSchema('admin').table('auditEvents').where({ staffUserId: denied.identity.userId, action: 'audit.viewer.access_denied' }).select('id', 'after', 'userAgent', 'ipAddress');
      assert.equal(after.length, before.length + 1, 'denial commits even though HTTP response is 403');
      assert.equal(after.at(-1)?.userAgent, 'Audit rehearsal browser');
      assert.equal(after.at(-1)?.ipAddress, null, 'untrusted forwarded IP headers are not recorded as verified evidence');
    }
  }
  assert.equal((await request(superAdmin, '', 'POST', { origin: 'https://foreign.example' })).status, 403);
  assert.equal((await request(superAdmin, '', 'POST', {}, '{"operation":"read"}')).status, 400);
  for (const query of ['page=-1', 'page=1.5', 'page=1000001', 'query=a&query=b', 'role=super_admin', 'range=all', 'asOf=invalid', `query=${'x'.repeat(255)}`]) {
    assert.equal((await request(superAdmin, query)).status, 400, query);
  }
  await rejected(service.read({ ...superAdmin.identity, accessEmail: support.identity.accessEmail }, {}), 401);
  const missingAccess = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit`, { headers: { cookie: superAdmin.cookie } });
  assert.equal((await GET(missingAccess)).status, 401);
  const customerCookie = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/audit`, {
    headers: { cookie: 'better-auth.session_token=customer-only', 'x-admin-access-email': superAdmin.identity.accessEmail },
  });
  assert.equal((await GET(customerCookie)).status, 401);
  assert.equal((await requestArchiveHealth(null)).status, 401);
  assert.equal((await requestArchiveHealth(superAdmin, '?unexpected=true')).status, 400);
  const deniedBefore = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'audit.viewer.access_denied' }).count<{ count: string }[]>('* AS count');
  const deniedArchive = await requestArchiveHealth(support, '',);
  assert.equal(deniedArchive.status, 403);
  assert.equal(deniedArchive.headers.get('cache-control'), 'no-store');
  const deniedAfter = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'audit.viewer.access_denied' }).count<{ count: string }[]>('* AS count');
  assert.equal(Number(deniedAfter[0].count), Number(deniedBefore[0].count) + 1);
  const unconfigured = await requestArchiveHealth(superAdmin);
  assert.equal(unconfigured.status, 200);
  assert.equal(auditArchiveHealthSchema.parse(await unconfigured.json()).state, 'unconfigured');
  await owner.withSchema('admin').table('staffUsers').where({ id: superAdmin.identity.userId }).update({ disabledAt: new Date() });
  assert.equal((await request(superAdmin)).status, 401);
  await owner.withSchema('admin').table('staffUsers').where({ id: superAdmin.identity.userId }).update({ disabledAt: null });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: superAdmin.identity.sessionId, userId: superAdmin.identity.userId, token: superAdmin.token,
    createdAt: now, updatedAt: now, expiresAt: new Date(nowMs + 3600000),
  });
  await owner.withSchema('admin').table('staffSessions').where({ id: superAdmin.identity.sessionId }).update({ expiresAt: new Date(nowMs - 1) });
  await rejected(service.verify(superAdmin.identity), 401);
  await owner.withSchema('admin').table('staffSessions').where({ id: superAdmin.identity.sessionId }).update({ expiresAt: new Date(nowMs + 3600000) });
  console.log('PASS Super Admin boundary, durable denied reads/verifications, Access/session/disabled checks and HTTP input/origin limits');

  const archiveTarget = { accountId: 'a'.repeat(32), bucket: 'audit-fixture', jurisdiction: 'default' as const };
  const archiveCheckpoint = {
    version: 1 as const, format: 'salesmora.admin-audit.ndjson' as const, ledgerId: archiveLedgerId,
    previousCheckpoint: null, firstSequence: '1', throughSequence: '1', eventCount: 1,
    byteLength: 100, sha256: 'b'.repeat(64), headHash: 'c'.repeat(64),
  };
  const archiveCheckpointSHA256 = createHash('sha256')
    .update(`${JSON.stringify(archiveCheckpoint)}\n`).digest('hex');
  const retained = auditRetainedCheckpointSchema.parse({
    version: 1, target: archiveTarget,
    scope: { ledgerId: archiveLedgerId, throughSequence: '1', previousCheckpoint: null },
    checkpoint: archiveCheckpoint, checkpointSHA256: archiveCheckpointSHA256,
  });
  const objectKey = `admin-audit/v1/${archiveLedgerId}/segments/${archiveCheckpoint.sha256}.ndjson`;
  const checkpointKey = `admin-audit/v1/${archiveLedgerId}/checkpoints/${archiveCheckpointSHA256}.json`;
  const checkedAt = new Date(nowMs + 1000).toISOString();
  const evidence = {
    state: 'snapshot_checked' as const, target: archiveTarget, objectKey, checkpointKey,
    checkpointSHA256: archiveCheckpointSHA256, objectSHA256: archiveCheckpoint.sha256,
    throughSequence: '1', headHash: archiveCheckpoint.headHash, eventCount: 1, checkedAt,
    locks: [objectKey, checkpointKey].map(key => ({
      key, ruleId: 'fictional-year-rule', uploadedAt: now.toISOString(), checkedAt, protectedUntil: null,
    })),
  };
  await owner.withSchema('admin').table('auditArchiveCopies').insert({
    id: archiveCopyId, ledgerId: archiveLedgerId, throughSequence: '1',
    scope: retained.scope, target: archiveTarget, state: 'copied', attempts: 1,
    checkpoint: archiveCheckpoint, checkpointSHA256: archiveCheckpointSHA256, copyEvidence: evidence,
    updatedAt: now,
  });
  await owner.withSchema('admin').table('auditArchiveCopyAttempts').insert({
    id: randomUUID(), copyId: archiveCopyId, attempt: 1, state: 'copied',
    startedAt: now, finishedAt: now,
  });
  await owner.withSchema('admin').table('auditArchiveChecks').insert({
    id: randomUUID(), copyId: archiveCopyId, state: 'accepted', retained, evidence, checkedAt,
  });
  const acceptedArchiveResponse = await requestArchiveHealth(superAdmin);
  assert.equal(acceptedArchiveResponse.status, 200);
  const acceptedArchive = auditArchiveHealthSchema.parse(await acceptedArchiveResponse.json());
  assert.equal(acceptedArchive.state, 'reported');
  if (acceptedArchive.state !== 'reported') throw new Error('Expected an archive status report.');
  assert.equal(acceptedArchive.latestCopy.latestCheck?.state, 'accepted');
  assert.equal(acceptedArchive.latestAccepted?.retained.checkpoint.eventCount, 1);
  assert.equal(acceptedArchiveResponse.headers.get('cache-control'), 'no-store');
  await owner.withSchema('admin').table('auditArchiveChecks').insert({
    id: randomUUID(), copyId: archiveCopyId, state: 'failed', failureCode: 'lock_insufficient',
    checkedAt: new Date(nowMs + 2000),
  });
  const failedRecheck = auditArchiveHealthSchema.parse(await (await requestArchiveHealth(superAdmin)).json());
  assert.equal(failedRecheck.state, 'reported');
  if (failedRecheck.state !== 'reported') throw new Error('Expected an archive status report.');
  assert.equal(failedRecheck.latestCopy.latestCheck?.state, 'failed');
  assert.equal(failedRecheck.latestAccepted?.retained.scope.throughSequence, '1',
    'latest independent acceptance remains visible when a later recheck fails');
  await owner.withSchema('admin').table('auditArchiveCopies').insert({
    id: archiveNextCopyId, ledgerId: archiveLedgerId, throughSequence: '2',
    scope: { ledgerId: archiveLedgerId, throughSequence: '2', previousCheckpoint: retainedAuditAnchor(retained) },
    target: archiveTarget, state: 'pending', attempts: 0,
  });
  const nextScopeReport = auditArchiveHealthSchema.parse(await (await requestArchiveHealth(superAdmin)).json());
  assert.equal(nextScopeReport.state, 'reported');
  if (nextScopeReport.state !== 'reported') throw new Error('Expected an archive status report.');
  assert.equal(nextScopeReport.latestCopy.scope.previousCheckpoint?.throughSequence, '1');
  assert.equal(nextScopeReport.latestAccepted?.retained.scope.throughSequence, '1');
  console.log('PASS archive health no-store API, Super Admin-only authorization, persisted accepted/failed verifier evidence, and no-operation GET behavior');

  const fixtureEvents: { id: string; sequence: string | number; hash: string }[] = [];
  await auditViewerDatabase.transaction(async trx => {
    for (let index = 0; index < 512; index++) {
      fixtureEvents.push(await appendAdminAuditEvent(trx, {
        staffUserId: index === 3 ? null : superAdmin.identity.userId, staffRole: index === 3 ? 'bootstrap' : 'super_admin',
        action: index === 3 ? 'audit.r2_export.failed' : index === 2 ? 'impersonation.page_view' : index === 1 ? 'staff.account.role_changed' : 'audit.rehearsal.viewer',
        targetType: 'audit_rehearsal', targetId: `${prefix}-${index}`, workspaceId: index === 2 ? `${prefix}-workspace` : null,
        reason: prefix, requestId: `${prefix}-request-${index}`,
        ipAddress: '2001:db8:85a3:0000:0000:8a2e:0370:7334',
        userAgent: 'Mozilla/5.0 (Audit rehearsal) full user agent',
        before: index === 1 ? { role: 'support' } : null, after: { role: 'billing', fixture: true },
        occurredAt: new Date(index === 510 ? nowMs - 7 * 86400000 : index === 511 ? nowMs - 7 * 86400000 - 1 : nowMs),
      }));
    }
    await appendAdminAuditEvent(trx, {
      staffUserId: superAdmin.identity.userId, staffRole: 'super_admin', action: 'audit.rehearsal.literal',
      targetType: 'audit_rehearsal', targetId: `${prefix}%_\\literal`, reason: 'literal wildcard test', occurredAt: now,
    });
  });
  const query = { query: prefix, asOf: now.toISOString() };
  const page = await service.read(superAdmin.identity, query);
  auditPageSchema.parse(page);
  assert.equal(page.total, 512, '510 recent, exact seven-day boundary and literal event; older event excluded');
  assert.equal(page.events.length, 5);
  const next = await service.read(superAdmin.identity, { ...query, throughSequence: page.throughSequence, page: 1 });
  assert.equal(next.events.some(event => page.events.some(previous => previous.id === event.id)), false);
  const allIds = new Set([...page.events, ...next.events].map(event => event.id));
  assert.equal(allIds.size, 10, 'same-timestamp events have deterministic sequence ordering');
  const tooFar = await service.read(superAdmin.identity, { ...query, page: 1000000 });
  assert.equal(tooFar.page, 102); assert.equal(tooFar.events.length, 2);
  assert.equal((await service.read(superAdmin.identity, { ...query, range: 'month' })).total, 513);
  assert.equal((await service.read(superAdmin.identity, { ...query, range: 'today' })).total, 511);
  assert.equal((await service.read(superAdmin.identity, { ...query, actor: 'system' })).total, 1);
  assert.equal((await service.read(superAdmin.identity, { ...query, category: 'viewas' })).total, 1);
  const exactId = await service.read(superAdmin.identity, { query: fixtureEvents[1].id, asOf: now.toISOString() });
  assert.equal(exactId.total, 1, 'event-ID deep links resolve an authoritative event');
  const byStaff = await service.read(superAdmin.identity, { ...query, actor: superAdmin.identity.userId });
  assert.equal(byStaff.total, 511);
  assert.ok(page.actors.some(actor => actor.id === superAdmin.identity.userId));
  const byRequest = await service.read(superAdmin.identity, { query: `${prefix}-request-1`, asOf: now.toISOString(), category: 'staff' });
  assert.equal(byRequest.total, 1);
  assert.deepEqual(byRequest.events[0].before, { role: 'support' });
  assert.equal(byRequest.events[0].ipAddress, '2001:db8:85a3:0000:0000:8a2e:0370:7334');
  assert.equal(byRequest.events[0].userAgent, 'Mozilla/5.0 (Audit rehearsal) full user agent');
  assert.equal((await service.read(superAdmin.identity, { query: `${prefix}%_\\literal`, asOf: now.toISOString() })).total, 1);
  const workspace = await service.read(superAdmin.identity, { query: `${prefix}-workspace`, asOf: now.toISOString() });
  assert.equal(workspace.total, 1);
  const readResponse = await request(superAdmin, new URLSearchParams({ query: `${prefix}-workspace`, asOf: now.toISOString() }).toString());
  assert.equal(readResponse.status, 200);
  assert.equal(auditPageSchema.parse(await readResponse.json()).events[0].id, workspace.events[0].id);
  await auditViewerDatabase.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: superAdmin.identity.userId, staffRole: 'super_admin', action: 'audit.rehearsal.later',
    targetType: 'audit_rehearsal', targetId: `${prefix}-later`, reason: prefix, occurredAt: now,
  }));
  assert.equal((await service.read(superAdmin.identity, { ...query, throughSequence: page.throughSequence })).total, page.total, 'captured high-water excludes later/backdated appends');
  assert.equal((await service.read(superAdmin.identity, query)).total, page.total + 1, 'fresh read picks up new appends');
  console.log('PASS literal search, exact date boundaries, category/staff/workspace/request filters, JSON/full IP/UA, stable bounded pagination and refresh');

  const verification = auditVerificationSchema.parse(await (await request(superAdmin, '', 'POST')).json());
  assert.equal(verification.state, 'intact');
  assert.ok(verification.checked > 500, 'verification crosses multiple batches and is not constrained by visible filters');
  assert.equal(verification.throughSequence, (await verifyAdminAuditChain(owner)).throughSequence);
  for (const tampered of [fixtureEvents[1], fixtureEvents[511]]) {
    await owner.transaction(async trx => {
      await trx.withSchema('admin').table('auditEvents').where({ id: tampered.id }).update({ after: { role: 'tampered' } });
      const broken = await createAuditViewerService(trx).verify(superAdmin.identity);
      assert.equal(broken.state, 'broken');
      if (broken.state === 'broken') assert.equal(broken.sequence, String(tampered.sequence));
      await trx.rollback();
    });
  }
  assert.equal((await verifyAdminAuditChain(owner)).valid, true, 'tamper test is rolled back; persistent chain stays valid');
  await assert.rejects(verifyAdminAuditChain(owner, Date.now() - 1), /timed out/, 'an expired verification budget must not produce an intact result');
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: superAdmin.identity.userId }).update({ role: 'support' });
  assert.equal((await request(superAdmin)).status, 403, 'role is authoritative on every read');
  assert.equal((await request(superAdmin, '', 'POST')).status, 403, 'role is authoritative on every verification');
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: superAdmin.identity.userId }).update({ revokedAt: new Date() });
  assert.equal((await request(superAdmin)).status, 403, 'a staff identity without an active role cannot read the log');
  console.log('PASS whole-chain batched verification, real tamper detection and current-role enforcement');
  console.log('Audit viewer database/API rehearsal passed; append-only fictional events remain.');
} finally {
  await owner.withSchema('admin').table('auditArchiveChecks').whereIn('copyId', [archiveCopyId, archiveNextCopyId]).delete();
  await owner.withSchema('admin').table('auditArchiveCopyAttempts').whereIn('copyId', [archiveCopyId, archiveNextCopyId]).delete();
  await owner.withSchema('admin').table('auditArchiveCopies').whereIn('id', [archiveCopyId, archiveNextCopyId]).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', users).delete();
  await Promise.all([owner.destroy(), auditViewerDatabase.destroy()]);
  await context.options.database?.end?.();
}

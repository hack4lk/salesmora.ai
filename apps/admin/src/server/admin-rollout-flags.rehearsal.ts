import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature } from 'better-auth/crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '@salesmora/data/database';
import { isRolloutFlagEnabled } from '@salesmora/data';
import { adminRolloutFlagsResponseSchema, type AdminRolloutFlag } from '@salesmora/contracts';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) {
  throw new Error('Use an isolated local test database.');
}
function runtimeURL(username: string, password: string | undefined) {
  if (!password) throw new Error(`Provision the password for ${username} before running this rehearsal.`);
  const url = new URL(ownerURL!);
  url.username = username;
  url.password = password;
  return url.href;
}
process.env.ADMIN_DATABASE_URL = runtimeURL('salesmora_admin_app', process.env.DB_ADMIN_APP_PASSWORD);
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
const owner = createDatabase(ownerURL);
const web = createDatabase(runtimeURL('salesmora_web', process.env.DB_WEB_PASSWORD));
const worker = createDatabase(runtimeURL('salesmora_worker', process.env.DB_WORKER_PASSWORD));
const prefix = `rollout-${randomUUID()}`;
const staffIds: string[] = [];

async function seedStaff(role: 'super_admin' | 'support' | 'billing') {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const token = randomUUID();
  const email = `${prefix}-${role}@karpukcreative.com`;
  const now = new Date();
  staffIds.push(userId);
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, name: `${prefix} ${role}`, email, createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return { userId, sessionId, token, email };
}
type Staff = Awaited<ReturnType<typeof seedStaff>>;
const { auth } = await import('./auth');
const authContext = await auth.$context;
const { GET, POST } = await import('../app/api/admin/rollout-flags/route');
const { createAdminFeatureFlagsService } = await import('./admin-feature-flags');

async function request(staff: Staff | null, body?: unknown, overrides?: Record<string, string>) {
  const headers = new Headers({ 'user-agent': 'Rollout flag rehearsal' });
  if (staff) {
    headers.set('cookie', `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`);
    headers.set('x-admin-access-email', staff.email);
  }
  if (body !== undefined) {
    headers.set('origin', process.env.ADMIN_AUTH_URL!);
    headers.set('content-type', 'application/json');
  }
  for (const [key, value] of Object.entries(overrides ?? {})) headers.set(key, value);
  const input = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/rollout-flags`, {
    method: body === undefined ? 'GET' : 'POST',
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return body === undefined ? GET(input) : POST(input);
}

async function successful(staff: Staff, body?: unknown) {
  const response = await request(staff, body);
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return adminRolloutFlagsResponseSchema.parse(await response.json()).flags;
}

try {
  const superAdmin = await seedStaff('super_admin');
  const support = await seedStaff('support');
  const billing = await seedStaff('billing');
  const flag: AdminRolloutFlag = { key: `${prefix}.original`, description: 'Temporary rollout for rehearsal.', enabled: false };
  assert.equal((await request(null)).status, 401);
  await successful(superAdmin);
  for (const denied of [support, billing]) {
    assert.equal((await request(denied)).status, 403);
    assert.equal((await request(denied, { operation: 'create', flag })).status, 403);
  }
  assert.equal((await request(superAdmin, { operation: 'create', flag }, { origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await request(superAdmin, { operation: 'create', flag }, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await request(superAdmin, { operation: 'create', flag: { ...flag, key: 'Invalid key' } })).status, 400);
  assert.equal((await request(superAdmin, { operation: 'create', flag: { ...flag, description: ' ' } })).status, 400);
  assert.equal((await request(superAdmin, { operation: 'create', flag: { ...flag, enabled: 'yes' } })).status, 400);
  assert.equal((await request(superAdmin, { padding: 'x'.repeat(16_384) })).status, 413);

  assert.equal(await isRolloutFlagEnabled(web, flag.key), false);
  let flags = await successful(superAdmin, { operation: 'create', flag });
  assert.deepEqual(flags.find(row => row.key === flag.key), flag);
  assert.equal((await request(superAdmin, { operation: 'create', flag })).status, 409);
  assert.equal(await isRolloutFlagEnabled(worker, flag.key), false);
  const enabled = { ...flag, enabled: true };
  flags = await successful(superAdmin, { operation: 'update', originalKey: flag.key, flag: enabled, expected: flag });
  assert.deepEqual(flags.find(row => row.key === flag.key), enabled);
  assert.equal(await isRolloutFlagEnabled(web, flag.key), true);
  assert.equal(await isRolloutFlagEnabled(worker, flag.key), true);
  assert.equal((await request(superAdmin, {
    operation: 'update', originalKey: flag.key, flag, expected: flag,
  })).status, 409, 'Stale edits cannot silently turn off a changed flag.');
  assert.equal((await request(superAdmin, { operation: 'delete', key: flag.key, expected: flag })).status, 409);

  const renamed = { ...enabled, key: `${prefix}.renamed`, description: 'Updated rollout description.' };
  await successful(superAdmin, { operation: 'update', originalKey: flag.key, flag: renamed, expected: enabled });
  assert.equal(await isRolloutFlagEnabled(web, flag.key), false);
  assert.equal(await isRolloutFlagEnabled(web, renamed.key), true);
  await successful(superAdmin, { operation: 'create', flag });
  assert.equal((await request(superAdmin, {
    operation: 'update', originalKey: renamed.key, flag: { ...renamed, key: flag.key }, expected: renamed,
  })).status, 409, 'Renaming cannot overwrite another flag.');
  await successful(superAdmin, { operation: 'delete', key: renamed.key, expected: renamed });
  assert.equal(await isRolloutFlagEnabled(web, renamed.key), false);
  assert.equal((await request(superAdmin, { operation: 'delete', key: renamed.key, expected: renamed })).status, 409);

  const events = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: superAdmin.userId, targetType: 'rollout_flag' }).select('action', 'before', 'after');
  assert(events.some(event => event.action === 'rollout_flags.created' && event.after.key === flag.key));
  assert(events.some(event => event.action === 'rollout_flags.updated' && event.before.enabled === false && event.after.enabled === true));
  assert(events.some(event => event.action === 'rollout_flags.deleted' && event.before.key === renamed.key && event.after === null));
  for (const staff of [support, billing]) {
    assert.ok(await owner.withSchema('admin').table('auditEvents')
      .where({ staffUserId: staff.userId, action: 'feature_flags.access_denied' }).first());
  }

  const service = createAdminFeatureFlagsService(owner);
  const actor = { userId: superAdmin.userId, sessionId: superAdmin.sessionId, accessEmail: superAdmin.email };
  const rolledBackKey = `${prefix}.rollback`;
  const rollback = new Error('Deliberate rollback of rollout and audit.');
  await assert.rejects(owner.transaction(async trx => {
    await createAdminFeatureFlagsService(trx).mutateRollout(actor, {
      operation: 'create', flag: { ...flag, key: rolledBackKey },
    });
    assert.ok(await trx.withSchema('admin').table('rolloutFlags').where({ key: rolledBackKey }).first());
    assert.ok(await trx.withSchema('admin').table('auditEvents')
      .where({ staffUserId: actor.userId, targetId: rolledBackKey, action: 'rollout_flags.created' }).first());
    throw rollback;
  }), error => error === rollback);
  assert.equal(await owner.withSchema('admin').table('rolloutFlags').where({ key: rolledBackKey }).first(), undefined);
  assert.equal(await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: actor.userId, targetId: rolledBackKey }).first(), undefined);
  await assert.rejects(service.readRollouts({ ...actor, accessEmail: 'someone-else@karpukcreative.com' }),
    (error: { status?: number }) => error.status === 401);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: actor.userId }).update({ revokedAt: new Date() });
  await assert.rejects(service.mutateRollout(actor, { operation: 'delete', key: flag.key, expected: flag }),
    (error: { status?: number }) => error.status === 403);
  await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: actor.userId }).update({ revokedAt: null });
  await owner.withSchema('admin').table('staffUsers').where({ id: actor.userId }).update({ disabledAt: new Date() });
  await assert.rejects(service.readRollouts(actor), (error: { status?: number }) => error.status === 401);
  await owner.withSchema('admin').table('staffUsers').where({ id: actor.userId }).update({ disabledAt: null });
  await owner.withSchema('admin').table('staffSessions').where({ id: actor.sessionId })
    .update({ expiresAt: new Date(Date.now() - 1000) });
  await assert.rejects(service.readRollouts(actor), (error: { status?: number }) => error.status === 401);
  await assert.rejects(isRolloutFlagEnabled(web, 'Invalid key'), /Invalid/);

  for (const runtime of [web, worker]) {
    for (const statement of [
      'SELECT * FROM admin."rolloutFlags"',
      'UPDATE admin."rolloutFlags" SET enabled = true',
      'INSERT INTO admin."rolloutFlags" (key) VALUES (\'forged\')',
      'DELETE FROM admin."rolloutFlags"',
    ]) await assert.rejects(runtime.raw(statement), (error: { code?: string }) => error.code === '42501');
  }
  console.log('PASS rollout CRUD, toggle, rename, stale/duplicate conflicts, validation, origin, roles/session, atomic audit rollback, runtime reads and least privilege.');
} finally {
  await owner.withSchema('admin').table('rolloutFlags').whereIn('updatedBy', staffIds).delete();
  if (staffIds.length) await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await Promise.all([owner.destroy(), web.destroy(), worker.destroy()]);
}

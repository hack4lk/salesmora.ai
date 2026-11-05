import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '@salesmora/data/database';
import { defaultMonthlyAITokens } from '@salesmora/data';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
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

const owner = createDatabase(ownerURL);
const prefix = `platform-settings-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const settingIds: string[] = [];
const totpSecret = randomUUID().replaceAll('-', '').repeat(2);
const usedTotpSteps = new Map<string, Set<number>>();

async function seedStaff(role: 'super_admin' | 'billing') {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const token = randomUUID();
  const email = `${prefix}-${role}-${userId}@karpukcreative.com`;
  staffIds.push(userId);
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, name: `${prefix} ${role}`, email, createdAt: now, updatedAt: now,
  });
  await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  if (role === 'super_admin') {
    await owner.withSchema('admin').table('staffTwoFactors').insert({
      id: randomUUID(),
      userId,
      secret: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: totpSecret }),
      backupCodes: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: '[]' }),
      verified: true,
    });
  }
  return { token, email, userId, sessionId };
}

function totpCode(step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', Buffer.from(totpSecret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

async function nextTotpCode(userId: string) {
  const usedSteps = usedTotpSteps.get(userId) ?? new Set<number>();
  const currentStep = Math.floor(Date.now() / 30_000);
  const step = [currentStep, currentStep - 1, currentStep + 1].find(candidate => !usedSteps.has(candidate));
  if (step === undefined) throw new Error('Wait for a new TOTP step before continuing the rehearsal.');
  usedSteps.add(step);
  usedTotpSteps.set(userId, usedSteps);
  return totpCode(step);
}

const { auth } = await import('./auth');
const authContext = await auth.$context;
const { GET, POST } = await import('../app/api/admin/settings/ai-budget/route');
const headers = async (staff: Awaited<ReturnType<typeof seedStaff>> | null, post = false) => {
  const values = new Headers({ 'user-agent': 'Platform settings rehearsal' });
  if (post) {
    values.set('content-type', 'application/json');
    values.set('origin', process.env.ADMIN_AUTH_URL!);
  }
  if (staff) {
    values.set('cookie', `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`);
    values.set('x-admin-access-email', staff.email);
  }
  return values;
};
async function get(staff: Awaited<ReturnType<typeof seedStaff>> | null) {
  return GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/settings/ai-budget`, {
    headers: await headers(staff),
  }));
}
async function post(staff: Awaited<ReturnType<typeof seedStaff>>, body: unknown) {
  return POST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/settings/ai-budget`, {
    method: 'POST',
    headers: await headers(staff, true),
    body: JSON.stringify(body),
  }));
}
async function changeDefault(
  staff: Awaited<ReturnType<typeof seedStaff>>,
  monthlyTokens: number | null,
  expectedVersion: number,
  reason: string,
) {
  const start = await post(staff, { operation: 'start', monthlyTokens, expectedVersion, reason });
  assert.equal(start.status, 200);
  const challenge = await start.json() as { token: string };
  const factor = await post(staff, {
    operation: 'factor',
    token: challenge.token,
    method: 'totp',
    code: await nextTotpCode(staff.userId),
  });
  const factorResponse = await factor.json();
  assert.equal(factor.status, 200, JSON.stringify(factorResponse));
  assert.deepEqual(factorResponse, { verified: true });
  const commit = await post(staff, { operation: 'commit', token: challenge.token });
  assert.equal(commit.status, 200);
  return commit.json() as Promise<{ changed: true; version: number; monthlyTokens: number | null }>;
}

try {
  const superAdmin = await seedStaff('super_admin');
  const billing = await seedStaff('billing');
  const baselineResponse = await get(superAdmin);
  assert.equal(baselineResponse.status, 200);
  assert.equal(baselineResponse.headers.get('cache-control'), 'no-store');
  const baseline = await baselineResponse.json() as {
    defaultMonthlyAITokens: number; source: string; version: number; methods: string[];
  };
  assert.equal(baseline.source === 'environment' || baseline.source === 'admin', true);
  assert(baseline.methods.includes('totp'));
  assert.equal((await get(billing)).status, 403);
  assert.equal((await get(null)).status, 401);

  const first = await changeDefault(superAdmin, 1234, baseline.version, 'Temporary test allowance update');
  assert.deepEqual(first, { changed: true, version: baseline.version + 1, monthlyTokens: 1234 });
  const currentResponse = await get(superAdmin);
  const current = await currentResponse.json() as {
    defaultMonthlyAITokens: number; source: string; version: number; history: Array<{ reason: string; actorName: string }>;
  };
  assert.equal(current.defaultMonthlyAITokens, 1234);
  assert.equal(current.source, 'admin');
  assert.equal(current.version, first.version);
  assert.equal(current.history[0].reason, 'Temporary test allowance update');
  assert(current.history[0].actorName.includes('super_admin'));
  const runtime = await owner.raw<{ rows: { monthlyTokens: string | null }[] }>(
    'SELECT public.get_default_monthly_ai_tokens()::text AS "monthlyTokens"',
  );
  assert.equal(runtime.rows[0].monthlyTokens, '1234');
  settingIds.push(...(await owner.withSchema('admin').table('systemSettingVersions').where({
    key: 'default_monthly_ai_tokens',
  }).where({ createdBy: superAdmin.userId }).pluck('id')));

  const stale = await post(superAdmin, {
    operation: 'start',
    monthlyTokens: 9000,
    expectedVersion: baseline.version,
    reason: 'Stale version must not overwrite current',
  });
  assert.equal(stale.status, 409);

  const reset = await changeDefault(superAdmin, null, first.version, 'Restore environment default after test');
  assert.deepEqual(reset, { changed: true, version: first.version + 1, monthlyTokens: null });
  const restored = await get(superAdmin);
  const restoredValue = await restored.json() as { defaultMonthlyAITokens: number; source: string; version: number };
  assert.equal(restoredValue.defaultMonthlyAITokens, defaultMonthlyAITokens());
  assert.equal(restoredValue.source, 'environment');
  assert.equal(restoredValue.version, reset.version);

  const denied = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.userId, action: 'platform_settings.access_denied' }).first();
  assert.ok(denied, 'Denied role must be recorded before returning 403.');

  console.log('PASS platform default budget access, TOTP step-up, version conflicts, audit history, runtime bridge and environment reset.');
} finally {
  if (settingIds.length) await owner.withSchema('admin').table('systemSettingVersions').whereIn('id', settingIds).delete();
  await owner.withSchema('admin').table('systemSettingVersions').where({ key: 'default_monthly_ai_tokens' })
    .whereIn('createdBy', staffIds).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await owner.destroy();
}

import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '@salesmora/data/database';

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
const prefix = `feature-flags-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const workspaceId = randomUUID();
const totpSecret = randomUUID().replaceAll('-', '').repeat(2);
const usedTotpSteps = new Set<number>();
const savedGlobal = await owner.withSchema('admin').table('featureFlags').where({ id: 'chat.enabled' }).first();
const savedPlanOverride = await owner.withSchema('admin').table('featureFlagOverrides')
  .where({ flagId: 'chat.enabled', targetType: 'plan', targetId: 'premium' }).first();

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

async function nextTotpCode() {
  for (;;) {
    const currentStep = Math.floor(Date.now() / 30_000);
    const step = [currentStep, currentStep - 1, currentStep + 1]
      .find(candidate => !usedTotpSteps.has(candidate));
    if (step !== undefined) {
      usedTotpSteps.add(step);
      return totpCode(step);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

const { auth } = await import('./auth');
const authContext = await auth.$context;
const { GET, POST } = await import('../app/api/admin/flags/route');
const headers = async (staff: Awaited<ReturnType<typeof seedStaff>> | null, post = false) => {
  const values = new Headers({ 'user-agent': 'Feature flags rehearsal' });
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
  return GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/flags`, {
    headers: await headers(staff),
  }));
}

async function post(staff: Awaited<ReturnType<typeof seedStaff>>, body: unknown) {
  return POST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/flags`, {
    method: 'POST',
    headers: await headers(staff, true),
    body: JSON.stringify(body),
  }));
}

async function change(
  staff: Awaited<ReturnType<typeof seedStaff>>,
  target: { type: 'global' } | { type: 'plan'; planId: 'premium' } | { type: 'workspace'; workspaceId: string },
  enabled: boolean | null,
  reason: string,
) {
  const start = await post(staff, {
    operation: 'start',
    flagId: 'chat.enabled',
    target,
    enabled,
    expiresAt: null,
    reason,
  });
  assert.equal(start.status, 200, await start.clone().text());
  const challenge = await start.json() as { token: string };
  const factor = await post(staff, {
    operation: 'factor',
    token: challenge.token,
    method: 'totp',
    code: await nextTotpCode(),
  });
  assert.equal(factor.status, 200, await factor.clone().text());
  assert.deepEqual(await factor.json(), { verified: true });
  const commit = await post(staff, { operation: 'commit', token: challenge.token });
  assert.equal(commit.status, 200, await commit.clone().text());
  return commit.json() as Promise<{ changed: true; flagId: string; target: unknown; enabled: boolean | null }>;
}

try {
  const superAdmin = await seedStaff('super_admin');
  const billing = await seedStaff('billing');

  const baselineResponse = await get(superAdmin);
  assert.equal(baselineResponse.status, 200);
  assert.equal(baselineResponse.headers.get('cache-control'), 'no-store');
  const baseline = await baselineResponse.json() as {
    methods: string[];
    flags: Array<{ id: string; global: { enabled: boolean }; overrides: Array<{ target: { type: string; planId?: string }; enabled: boolean }> }>;
    history: Array<{ action: string; reason: string; actorName: string }>;
  };
  assert.deepEqual(baseline.methods, ['totp']);
  assert.equal(baseline.flags.length, 2);
  assert.equal((await get(null)).status, 401);
  assert.equal((await get(billing)).status, 403);

  const invalidExpiry = await post(superAdmin, {
    operation: 'start',
    flagId: 'chat.enabled',
    target: { type: 'global' },
    enabled: false,
    expiresAt: new Date(Date.now() - 60_000).toISOString(),
    reason: 'Reject an already expired override',
  });
  assert.equal(invalidExpiry.status, 400);

  const planChange = await change(superAdmin, { type: 'plan', planId: 'premium' }, false, 'Disable chat for premium QA');
  assert.equal(planChange.enabled, false);
  const planRuntime = await owner.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_feature_enabled(?, ?, NULL) AS enabled', ['chat.enabled', 'premium'],
  );
  assert.equal(planRuntime.rows[0].enabled, false);

  const workspaceChange = await change(superAdmin, { type: 'workspace', workspaceId }, true, 'Keep QA workspace enabled');
  assert.equal(workspaceChange.enabled, true);
  const workspaceRuntime = await owner.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_feature_enabled(?, ?, ?) AS enabled', ['chat.enabled', 'premium', workspaceId],
  );
  assert.equal(workspaceRuntime.rows[0].enabled, true);

  await change(superAdmin, { type: 'workspace', workspaceId }, null, 'Remove temporary workspace override');
  const restoredWorkspaceRuntime = await owner.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_feature_enabled(?, ?, ?) AS enabled', ['chat.enabled', 'premium', workspaceId],
  );
  assert.equal(restoredWorkspaceRuntime.rows[0].enabled, false);

  await change(superAdmin, { type: 'plan', planId: 'premium' }, null, 'Remove temporary plan override');
  const clearedPlanRuntime = await owner.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_feature_enabled(?, ?, NULL) AS enabled', ['chat.enabled', 'premium'],
  );
  assert.equal(clearedPlanRuntime.rows[0].enabled, savedGlobal.enabled);

  await change(superAdmin, { type: 'global' }, !savedGlobal.enabled, 'Temporarily verify global flag changes');
  const globalRuntime = await owner.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_feature_enabled(?, NULL, NULL) AS enabled', ['chat.enabled'],
  );
  assert.equal(globalRuntime.rows[0].enabled, !savedGlobal.enabled);
  await change(superAdmin, { type: 'global' }, savedGlobal.enabled, 'Restore global flag after rehearsal');

  const current = await get(superAdmin);
  const response = await current.json() as typeof baseline;
  assert.equal(response.flags.find(flag => flag.id === 'chat.enabled')?.global.enabled, savedGlobal.enabled);
  assert(response.history.some(item => item.reason === 'Disable chat for premium QA' && item.actorName.includes('super_admin')));
  const denied = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.userId, action: 'feature_flags.access_denied' }).first();
  assert.ok(denied, 'Denied role must be recorded before returning 403.');

  console.log('PASS feature flag Admin access, step-up, plan/workspace/global changes, runtime evaluation, clearing, expiry validation and audit.');
} finally {
  await owner.withSchema('admin').table('featureFlagOverrides')
    .where({ flagId: 'chat.enabled', targetType: 'workspace', targetId: workspaceId }).delete();
  await owner.withSchema('admin').table('featureFlagOverrides')
    .where({ flagId: 'chat.enabled', targetType: 'plan', targetId: 'premium' }).delete();
  if (savedPlanOverride) await owner.withSchema('admin').table('featureFlagOverrides').insert(savedPlanOverride);
  if (savedGlobal) await owner.withSchema('admin').table('featureFlags').where({ id: 'chat.enabled' }).update({
    enabled: savedGlobal.enabled,
    expiresAt: savedGlobal.expiresAt,
    updatedBy: savedGlobal.updatedBy,
    updatedAt: savedGlobal.updatedAt,
  });
  if (staffIds.length) {
    await owner.withSchema('admin').table('staffRateLimits').whereIn('key', staffIds.map(id => `staff-actions:${id}`)).delete();
    await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  }
  await owner.destroy();
}

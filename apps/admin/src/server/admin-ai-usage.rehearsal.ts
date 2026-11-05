import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { makeSignature } from 'better-auth/crypto';
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
const prefix = `ai-usage-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const callIds = [randomUUID(), randomUUID(), randomUUID()];
const pricingIds = [randomUUID(), randomUUID()];

async function seedStaff(role: 'super_admin' | 'billing' | 'support') {
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
  return { identity: { userId, sessionId, accessEmail: email }, token, email };
}

const { auth } = await import('./auth');
const authContext = await auth.$context;
const { GET } = await import('../app/api/admin/ai-usage/route');
const headers = async (staff: Awaited<ReturnType<typeof seedStaff>> | null) => {
  const values = new Headers({ 'user-agent': 'AI usage rehearsal' });
  if (staff) {
    values.set('cookie', `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`);
    values.set('x-admin-access-email', staff.email);
  }
  return values;
};
async function request(staff: Awaited<ReturnType<typeof seedStaff>> | null, query = '') {
  return GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/ai-usage${query}`, { headers: await headers(staff) }));
}

try {
  const superAdmin = await seedStaff('super_admin');
  const billing = await seedStaff('billing');
  const support = await seedStaff('support');
  const baselineResponse = await request(superAdmin);
  assert.equal(baselineResponse.status, 200);
  const baseline = await baselineResponse.json();
  await owner.withSchema('admin').table('aiModelPricing').insert([
    {
      id: pricingIds[0], model: 'rehearsal-model', inputUsdPerMillion: '1.000000',
      cachedInputUsdPerMillion: '0.500000', outputUsdPerMillion: '2.000000',
      source: 'Fictional test rate', effectiveFrom: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      createdBy: superAdmin.identity.userId,
    },
    {
      id: pricingIds[1], model: 'rehearsal-model', inputUsdPerMillion: '3.000000',
      cachedInputUsdPerMillion: '1.500000', outputUsdPerMillion: '4.000000',
      source: 'Fictional updated test rate', effectiveFrom: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      createdBy: superAdmin.identity.userId,
    },
  ]);
  await owner('aiUsageCalls').insert([
    {
      id: callIds[0], workspaceId: null, model: 'rehearsal-model', phase: 'answer', outcome: 'completed',
      inputTokens: 1000, outputTokens: 500, totalTokens: 1500, cachedInputTokens: 200, reasoningTokens: 0,
      startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), finishedAt: now,
    },
    {
      id: callIds[1], workspaceId: null, model: 'rehearsal-model', phase: 'planning', outcome: 'completed',
      inputTokens: 1000, outputTokens: 500, totalTokens: 1500, cachedInputTokens: 200, reasoningTokens: 0,
      startedAt: now, finishedAt: now,
    },
    {
      id: callIds[2], workspaceId: null, model: 'unpriced-model', phase: 'answer', outcome: 'failed',
      reservationTokens: 500, startedAt: now,
    },
  ]);

  const authorized = await request(superAdmin);
  assert.equal(authorized.status, 200);
  assert.equal(authorized.headers.get('cache-control'), 'no-store');
  const report = await authorized.json();
  assert.equal(report.period, '30d');
  assert.equal(report.summary.calls - baseline.summary.calls, 3);
  assert.equal(report.summary.completedCalls - baseline.summary.completedCalls, 2);
  assert.equal(report.summary.failedCalls - baseline.summary.failedCalls, 1);
  assert.equal(report.summary.unknownUsageCalls - baseline.summary.unknownUsageCalls, 1);
  assert.equal(BigInt(report.summary.totalTokens) - BigInt(baseline.summary.totalTokens), 3000n);
  assert.equal(report.summary.estimatedCostUsd, null, 'Do not represent incomplete cost coverage as a total estimate.');
  const beforeAnswer = baseline.byFeature.find((entry: { feature: string }) => entry.feature === 'answer')?.calls ?? 0;
  assert.equal(report.byFeature.find((entry: { feature: string }) => entry.feature === 'answer').calls - beforeAnswer, 2);
  assert.equal(report.byModel.find((entry: { model: string }) => entry.model === 'rehearsal-model').estimatedCostUsd, '0.006600',
    'Historical calls must use the price version effective at their start time.');
  assert.equal(report.byModel.find((entry: { model: string }) => entry.model === 'unpriced-model').estimatedCostUsd, null);
  assert.equal((await request(billing, '?period=7d')).status, 200);
  assert.equal((await request(support)).status, 403);
  assert.equal((await request(null)).status, 401);
  assert.equal((await request(superAdmin, '?period=bad')).status, 400);
  assert.equal((await request(superAdmin, '?period=7d&period=30d')).status, 400);
  const denied = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'ai_usage.access_denied' }).first();
  assert.ok(denied, 'Denied role must be recorded before returning 403.');

  const oldRateRows = await owner.raw(
    `SELECT "inputUsdPerMillion"::text AS input FROM admin."aiModelPricing"
      WHERE model = ? AND "effectiveFrom" <= ? ORDER BY "effectiveFrom" DESC LIMIT 1`,
    ['rehearsal-model', new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)],
  );
  const newRateRows = await owner.raw(
    `SELECT "inputUsdPerMillion"::text AS input FROM admin."aiModelPricing"
      WHERE model = ? AND "effectiveFrom" <= ? ORDER BY "effectiveFrom" DESC LIMIT 1`,
    ['rehearsal-model', now],
  );
  assert.equal(oldRateRows.rows[0].input, '1.000000');
  assert.equal(newRateRows.rows[0].input, '3.000000');

  console.log('PASS AI usage role/session checks, audited denial, daily/model/feature aggregation, no-store responses, incomplete-cost handling, and effective-dated pricing versions.');
} finally {
  await owner('aiUsageCalls').whereIn('id', callIds).delete();
  await owner.withSchema('admin').table('aiModelPricing').whereIn('id', pricingIds).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await owner.destroy();
}

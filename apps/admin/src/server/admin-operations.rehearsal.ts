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
const redis = new URL(process.env.REDIS_URL ?? 'redis://127.0.0.1:56379');
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) || !process.env.DB_ADMIN_APP_PASSWORD ||
  redis.protocol !== 'redis:' || !['localhost', '127.0.0.1'].includes(redis.hostname) || redis.port !== '56379' ||
  redis.username || redis.password || (redis.pathname && redis.pathname !== '/')) {
  throw new Error('Use the isolated local test database, local Redis, and provision DB_ADMIN_APP_PASSWORD.');
}
const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app';
adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;
process.env.ADMIN_DATABASE_URL = adminURL.href;
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
process.env.DATABASE_URL = ownerURL;
process.env.WORKER_QUEUE_NAME = 'help-ingestion-test';

const owner = createDatabase(ownerURL);
const prefix = `operations-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];

async function seedStaff(role: 'super_admin' | 'support' | 'billing') {
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
  return { token, email, userId };
}

const { auth } = await import('./auth');
const authContext = await auth.$context;
const { GET } = await import('../app/api/admin/operations/route');
const headers = async (staff: Awaited<ReturnType<typeof seedStaff>> | null) => {
  const values = new Headers({ 'user-agent': 'Admin operations rehearsal' });
  if (staff) {
    values.set('cookie', `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`);
    values.set('x-admin-access-email', staff.email);
  }
  return values;
};
async function request(staff: Awaited<ReturnType<typeof seedStaff>> | null) {
  return GET(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/operations`, { headers: await headers(staff) }));
}

try {
  const support = await seedStaff('support');
  const billing = await seedStaff('billing');
  const baseline = await request(support);
  assert.equal(baseline.status, 200);
  const report = await baseline.json();
  assert.equal(baseline.headers.get('cache-control'), 'no-store');
  assert.equal(report.queues.length, 2);
  assert(report.queues.every((queue: { counts: Record<string, number> }) =>
    ['waiting', 'active', 'delayed', 'failed', 'completed'].every(state =>
      Number.isSafeInteger(queue.counts[state]) && queue.counts[state] >= 0)));
  assert(report.outboxes.some((outbox: { name: string }) => outbox.name === 'Estimate delivery'));
  assert(!JSON.stringify(report).includes('failedReason'));
  assert(!JSON.stringify(report).includes('recipient'));
  assert.equal((await request(billing)).status, 403);
  assert.equal((await request(null)).status, 401);
  const denied = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.userId, action: 'operations.access_denied' }).first();
  assert.ok(denied, 'Denied role must be recorded before returning 403.');

  console.log('PASS operations role/session checks, local queue counts, outbox status aggregation, redacted response, no-store headers, and audited denial.');
} finally {
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await owner.destroy();
}

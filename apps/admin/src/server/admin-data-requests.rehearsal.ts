import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { makeSignature } from 'better-auth/crypto';
import type { StaffRoleId } from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
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

const owner = createDatabase(ownerURL);
const prefix = `data-requests-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const requestIds = Array.from({ length: 22 }, () => randomUUID());
const userIds = Array.from({ length: 22 }, () => randomUUID());
const workspaceId = randomUUID();

async function seedStaff(role: StaffRoleId, expired = false) {
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
    expiresAt: new Date(expired ? Date.now() - 1000 : Date.now() + 60 * 60 * 1000),
  });
  return {
    identity: { userId, sessionId, accessEmail: email },
    cookie: `${sessionTokenCookieName}=${token}.${await makeSignature(token, authSecret)}`,
  };
}

let sessionTokenCookieName = '';
let authSecret = '';

function requestHeaders(staff: Awaited<ReturnType<typeof seedStaff>> | null) {
  const headers = new Headers({ 'user-agent': 'Data Requests rehearsal' });
  if (staff) {
    headers.set('cookie', staff.cookie);
    headers.set('x-admin-access-email', staff.identity.accessEmail);
  }
  return headers;
}

async function readQueue(
  get: (request: NextRequest) => Promise<Response>,
  staff: Awaited<ReturnType<typeof seedStaff>> | null,
  query = '',
) {
  return get(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/data-requests${query}`, {
    headers: requestHeaders(staff),
  }));
}

const { auth } = await import('./auth');
const authContext = await auth.$context;
sessionTokenCookieName = authContext.authCookies.sessionToken.name;
authSecret = authContext.secret;
const { adminDataRequestsDatabase } = await import('./admin-data-requests');
const { GET } = await import('../app/api/admin/data-requests/route');
const ownerRows = () => owner('accountDeletionRequests').whereIn('id', requestIds)
  .orderBy('id').select('id', 'state', 'requestedAt', 'completedAt', 'retryAt', 'attempts', 'lastError');

try {
  const baselineAll = Number((await owner('accountDeletionRequests').count<{ count: string }[]>({ count: '*' }))[0]?.count ?? 0);
  const baselinePending = Number((await owner('accountDeletionRequests').where({ state: 'pending' })
    .count<{ count: string }[]>({ count: '*' }))[0]?.count ?? 0);
  const baselineRetry = Number((await owner('accountDeletionRequests')
    .where({ state: 'pending', lastError: 'retry_required' })
    .count<{ count: string }[]>({ count: '*' }))[0]?.count ?? 0);
  const baselineCompleted = Number((await owner('accountDeletionRequests').where({ state: 'completed' })
    .count<{ count: string }[]>({ count: '*' }))[0]?.count ?? 0);
  await owner('users').insert(userIds.slice(0, 2).map((id, index) => ({
    id,
    name: `${prefix} customer ${index}`,
    email: `${prefix}-${index}@example.test`,
    emailVerified: true,
    deletionRequestedAt: now,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'data-requests-rehearsal',
    termsAcceptedAt: now,
  })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert({
      id: workspaceId,
      ownerId: userIds[0],
      businessName: `${prefix} workspace`,
      businessType: 'test',
      postalCode: '',
      serviceRange: '',
      deletionRequestedAt: now,
      createdAt: now,
    });
    await trx('workspaceMemberships').insert({ workspaceId, userId: userIds[0], role: 'owner' });
    await trx('workspacePolicies').insert({ workspaceId });
  });
  await owner('accountDeletionRequests').insert(requestIds.map((id, index) => ({
    id,
    userId: userIds[index],
    workspaceId: index === 0 ? workspaceId : index === 3 ? randomUUID() : null,
    state: index < 3 ? 'pending' : 'completed',
    requestedAt: new Date(Date.UTC(2100, 0, 1) - index * 1000),
    completedAt: index < 3 ? null : new Date(now.getTime() - index * 1000 + 500),
    retryAt: new Date(now.getTime() + 60_000),
    attempts: index === 0 ? 3 : 0,
    lastError: index === 0 ? 'retry_required' : index === 2 ? 'unexpected_marker' : null,
  })));

  const superAdmin = await seedStaff('super_admin');
  const support = await seedStaff('support');
  const billing = await seedStaff('billing');
  const expired = await seedStaff('super_admin', true);
  const before = await ownerRows();

  const superResponse = await readQueue(GET, superAdmin);
  assert.equal(superResponse.status, 200);
  assert.equal(superResponse.headers.get('cache-control'), 'no-store');
  const all = await superResponse.json() as {
    role: string;
    requests: Array<{ id: string; customerName: string; maskedEmail: string; workspaceName: string | null; lastError: string | null }>;
    total: number;
    allRequestsTotal: number;
    page: number;
    pageSize: number;
    retryScheduledTotal: number;
  };
  assert.equal(all.role, 'super_admin');
  assert.equal(all.total, baselineAll + 22);
  assert.equal(all.allRequestsTotal, baselineAll + 22);
  assert.equal(all.pageSize, 20);
  assert.equal(all.retryScheduledTotal, baselineRetry + 1);
  assert.equal(all.requests.length, 20);
  assert(all.requests.some(request => request.id === requestIds[0] &&
    request.maskedEmail === `${prefix.slice(0, 2)}••••@example.test`));
  assert(!JSON.stringify(all).includes(`${prefix}-0@example.test`));

  const retryResponse = await readQueue(GET, support, '?filter=retry');
  assert.equal(retryResponse.status, 200);
  const retry = await retryResponse.json() as typeof all;
  assert.equal(retry.role, 'support');
  assert.equal(retry.total, baselineRetry + 1);
  assert.equal(retry.requests[0].id, requestIds[0]);
  assert.equal(retry.requests[0].lastError, 'retry_required');

  const pendingResponse = await readQueue(GET, support, '?filter=pending');
  assert.equal(pendingResponse.status, 200);
  const pending = await pendingResponse.json() as typeof all;
  assert.equal(pending.total, baselinePending + 3);
  assert.equal(pending.requests.find(request => request.id === requestIds[2])?.lastError, null);

  const completedResponse = await readQueue(GET, superAdmin, '?filter=completed');
  assert.equal(completedResponse.status, 200);
  const completed = await completedResponse.json() as typeof all;
  assert.equal(completed.total, baselineCompleted + 19);
  assert.equal(completed.requests.find(request => request.id === requestIds[3])?.customerName, 'Account record purged');
  assert.equal(completed.requests.find(request => request.id === requestIds[3])?.maskedEmail, 'Unavailable after purge');
  assert.equal(completed.requests.find(request => request.id === requestIds[3])?.workspaceName, 'Workspace record purged');

  const secondPageResponse = await readQueue(GET, superAdmin, '?page=1');
  assert.equal(secondPageResponse.status, 200);
  const secondPage = await secondPageResponse.json() as typeof all;
  assert.equal(secondPage.page, 1);
  assert(secondPage.requests.some(request => request.id === requestIds[20]));
  assert(secondPage.requests.some(request => request.id === requestIds[21]));

  assert.equal((await readQueue(GET, billing)).status, 403);
  assert.equal((await readQueue(GET, expired)).status, 401);
  assert.equal((await readQueue(GET, null)).status, 401);
  assert.equal((await readQueue(GET, superAdmin, '?filter=invalid')).status, 400);
  assert.equal((await readQueue(GET, superAdmin, '?filter=all&filter=pending')).status, 400);

  const audit = await owner.withSchema('admin').table('auditEvents')
    .whereIn('staffUserId', [superAdmin.identity.userId, support.identity.userId, billing.identity.userId])
    .select<{ staffUserId: string; action: string; targetType: string }[]>('staffUserId', 'action', 'targetType');
  assert(audit.some(event => event.staffUserId === superAdmin.identity.userId &&
    event.action === 'data.requests.deletion_queue.read'));
  assert(audit.some(event => event.staffUserId === support.identity.userId &&
    event.action === 'data.requests.deletion_queue.read'));
  assert(audit.some(event => event.staffUserId === billing.identity.userId &&
    event.action === 'data.requests.access_denied'));
  assert.deepEqual(await ownerRows(), before);
  console.log('PASS Data Requests enforces admin sessions and RBAC, masks purged identities, filters retry markers, paginates, audits reads, and performs no mutations');
} finally {
  await owner('accountDeletionRequests').whereIn('id', requestIds).delete();
  await owner('workspaces').where({ id: workspaceId }).delete();
  await owner('users').whereIn('id', userIds.slice(0, 2)).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await adminDataRequestsDatabase.destroy();
  await owner.destroy();
  await authContext.options.database?.end?.();
}

console.log('Admin data-request rehearsal passed; append-only fictional audit events remain.');

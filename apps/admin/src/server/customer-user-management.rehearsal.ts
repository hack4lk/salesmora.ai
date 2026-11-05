import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import type { StaffRoleId } from '@salesmora/contracts';
import {
  adminCustomerUserDetailSchema,
  adminCustomerUserSessionsResponseSchema,
  adminCustomerUserPasswordResetResultSchema,
  adminCustomerUserEmailVerificationResendResultSchema,
  adminCustomerUserEmailVerificationResultSchema,
  adminUserEmailVerificationStartSchema,
  adminUserEmailChangeStartSchema,
  adminCustomerUserEmailChangeResultSchema,
  adminCustomerUserPiiRevealResultSchema,
  adminCustomerUserStaffActionsResponseSchema,
  adminUserDirectoryResponseSchema,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import {
  verifyAdminEmailVerificationRequest,
} from '@salesmora/data/admin-email-verification-signature';
import {
  verifyAdminEmailChangeDelivery,
} from '@salesmora/data/admin-email-change-signature';
import { getAdminCustomerUserStatus } from '../components/admin-user-management/admin-user-management.data';
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
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.ADMIN_EMAIL_VERIFICATION_SECRET = randomUUID() + randomUUID();
process.env.ADMIN_EMAIL_CHANGE_SECRET = randomUUID() + randomUUID();

const owner = createDatabase(ownerURL);
const { auth } = await import('./auth');
const context = await auth.$context;
const { customerUserManagement, customerUserManagementDatabase } = await import('./customer-user-management');
const { POST: directoryPOST } = await import('../app/api/admin/users/route');
const { GET: profileGET } = await import('../app/api/admin/users/[userId]/route');
const { GET: suspensionGET, POST: suspensionPOST } = await import('../app/api/admin/users/[userId]/suspension/route');
const { GET: sessionsGET, POST: sessionsPOST } = await import('../app/api/admin/users/[userId]/sessions/route');
const { POST: piiPOST } = await import('../app/api/admin/users/[userId]/pii/route');
const { GET: staffActionsGET } = await import('../app/api/admin/users/[userId]/staff-actions/route');
const { POST: passwordResetPOST } = await import('../app/api/admin/users/[userId]/password-reset/route');
const {
  GET: emailVerificationGET,
  POST: emailVerificationPOST,
} = await import('../app/api/admin/users/[userId]/email-verification/route');
const {
  GET: emailChangeGET,
  POST: emailChangePOST,
} = await import('../app/api/admin/users/[userId]/email-change/route');
const { staffTotpMatchingStep } = await import('./staff-totp');
const adminDb = customerUserManagementDatabase;
const prefix = `customer-users-${randomUUID()}`;
const now = new Date();
const staffIds: string[] = [];
const customerIds = Array.from({ length: 4 }, () => `customer-${randomUUID()}`);
const workspaceIds = Array.from({ length: 4 }, () => randomUUID());
const customerEmails = customerIds.map((id, index) => `${prefix}-${index}@example.test`);

async function seedStaff(role?: StaffRoleId) {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const token = randomUUID();
  const email = `${prefix}-${role ?? 'unassigned'}-${userId}@karpukcreative.com`;
  staffIds.push(userId);
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, name: `${prefix} ${role ?? 'unassigned'}`, email, createdAt: now, updatedAt: now,
  });
  if (role) await owner.withSchema('admin').table('staffRoleAssignments').insert({ id: randomUUID(), userId, role });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 3600000),
  });
  return {
    identity: { userId, sessionId, accessEmail: email },
    cookie: `${context.authCookies.sessionToken.name}=${token}.${await makeSignature(token, context.secret)}`,
  };
}

async function passwordReset(staff: Awaited<ReturnType<typeof seedStaff>> | null, userId: string, input: unknown, origin?: string, query = '') {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/password-reset${query}`, {
    method: 'POST',
    headers: requestHeaders(staff, origin),
    body: JSON.stringify(input),
  });
  return passwordResetPOST(request, { params: Promise.resolve({ userId }) });
}

async function emailVerification(
  staff: Awaited<ReturnType<typeof seedStaff>> | null,
  userId: string,
  input?: unknown,
  origin?: string,
  query = '',
) {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/email-verification${query}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: requestHeaders(staff, origin),
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const params = { params: Promise.resolve({ userId }) };
  return input === undefined ? emailVerificationGET(request, params) : emailVerificationPOST(request, params);
}

async function emailChange(
  staff: Awaited<ReturnType<typeof seedStaff>> | null,
  userId: string,
  input?: unknown,
  origin?: string,
  query = '',
) {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/email-change${query}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: requestHeaders(staff, origin),
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const params = { params: Promise.resolve({ userId }) };
  return input === undefined ? emailChangeGET(request, params) : emailChangePOST(request, params);
}

async function seedCustomers() {
  await owner('users').insert(customerIds.map((id, index) => ({
    id, name: `${prefix} customer ${index}`, email: customerEmails[index], emailVerified: index !== 1,
    suspendedAt: index === 2 ? now : null, suspendedReason: index === 2 ? 'Test suspension' : null,
    deletionRequestedAt: index === 3 ? now : null,
    createdAt: now, updatedAt: now, termsVersion: 'rehearsal', termsAcceptedAt: now,
  })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert(workspaceIds.map((id, index) => ({
      id, ownerId: customerIds[index], businessName: `${prefix} workspace ${index}`,
      businessType: 'test', postalCode: '', serviceRange: '', createdAt: now,
    })));
    await trx('workspaceMemberships').insert([
      ...workspaceIds.map((workspaceId, index) => ({
        workspaceId, userId: customerIds[index], role: 'owner',
      })),
      { workspaceId: workspaceIds[1], userId: customerIds[0], role: 'office' },
    ]);
    await trx('workspacePolicies').insert(workspaceIds.map(workspaceId => ({ workspaceId })));
    await trx('accounts').insert([
      {
        id: randomUUID(), userId: customerIds[0], accountId: `sensitive-account-${randomUUID()}`,
        providerId: 'credential', password: `sensitive-password-${randomUUID()}`, createdAt: now, updatedAt: now,
      },
      {
        id: randomUUID(), userId: customerIds[0], accountId: `sensitive-google-account-${randomUUID()}`,
        providerId: 'google', accessToken: `sensitive-access-token-${randomUUID()}`, createdAt: now, updatedAt: now,
      },
      {
        id: randomUUID(), userId: customerIds[1], accountId: `sensitive-social-account-${randomUUID()}`,
        providerId: 'google', accessToken: `sensitive-social-token-${randomUUID()}`, createdAt: now, updatedAt: now,
      },
    ]);
    await trx('sessions').insert([
      {
        id: randomUUID(), userId: customerIds[0], token: `sensitive-session-token-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 3600000), createdAt: now, updatedAt: now,
        ipAddress: '73.162.48.201',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      },
      {
        id: randomUUID(), userId: customerIds[0], token: `sensitive-session-token-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(now.getTime() - 1000), updatedAt: new Date(now.getTime() - 1000),
        ipAddress: '2001:db8:abcd:1234:5678:9abc:def0:1234',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1',
      },
      {
        id: randomUUID(), userId: customerIds[1], token: `sensitive-session-token-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 3600000), createdAt: now, updatedAt: now,
        ipAddress: '::ffff:192.0.2.45',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      },
      ...Array.from({ length: 22 }, (_, index) => ({
        id: randomUUID(), userId: customerIds[2], token: `sensitive-session-token-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(now.getTime() - index * 1000), updatedAt: new Date(now.getTime() - index * 1000),
        ipAddress: '198.51.100.27',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      })),
    ]);
    await trx('notificationPreferences').insert({
      userId: customerIds[0],
      leadAssignedEmail: false,
      visitChangedEmail: true,
      estimateEmail: false,
      deadlineReminderEmail: true,
      jobActivityEmail: false,
    });
  });
}

function requestHeaders(staff: Awaited<ReturnType<typeof seedStaff>> | null, origin = process.env.ADMIN_AUTH_URL!) {
  const headers = new Headers({ origin, 'content-type': 'application/json', 'user-agent': 'Customer user rehearsal' });
  if (staff) {
    headers.set('cookie', staff.cookie);
    headers.set('x-admin-access-email', staff.identity.accessEmail);
  }
  return headers;
}

async function directory(staff: Awaited<ReturnType<typeof seedStaff>> | null, input: unknown, origin?: string) {
  return directoryPOST(new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users`, {
    method: 'POST', headers: requestHeaders(staff, origin), body: JSON.stringify(input),
  }));
}

async function profile(staff: Awaited<ReturnType<typeof seedStaff>> | null, userId: string) {
  return profileGET(
    new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}`, { headers: requestHeaders(staff) }),
    { params: Promise.resolve({ userId }) },
  );
}

async function suspension(staff: Awaited<ReturnType<typeof seedStaff>> | null, userId: string, input?: unknown, origin?: string) {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/suspension`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: requestHeaders(staff, origin),
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const params = { params: Promise.resolve({ userId }) };
  return input === undefined ? suspensionGET(request, params) : suspensionPOST(request, params);
}

async function sessions(staff: Awaited<ReturnType<typeof seedStaff>> | null, userId: string, input?: unknown, origin?: string, query = '') {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/sessions${query}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: requestHeaders(staff, origin),
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const params = { params: Promise.resolve({ userId }) };
  return input === undefined ? sessionsGET(request, params) : sessionsPOST(request, params);
}

async function pii(staff: Awaited<ReturnType<typeof seedStaff>> | null, userId: string, input: unknown, origin?: string) {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/pii`, {
    method: 'POST',
    headers: requestHeaders(staff, origin),
    body: JSON.stringify(input),
  });
  return piiPOST(request, { params: Promise.resolve({ userId }) });
}

async function staffActions(
  staff: Awaited<ReturnType<typeof seedStaff>> | null,
  userId: string,
  query = '',
  origin = process.env.ADMIN_AUTH_URL!,
) {
  const request = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${encodeURIComponent(userId)}/staff-actions${query}`, {
    headers: requestHeaders(staff, origin),
  });
  return staffActionsGET(request, { params: Promise.resolve({ userId }) });
}

async function enrollTotp(staff: Awaited<ReturnType<typeof seedStaff>>) {
  const secret = randomUUID().replaceAll('-', '').repeat(2);
  await owner.withSchema('admin').table('staffTwoFactors').insert({
    id: randomUUID(),
    userId: staff.identity.userId,
    secret: await symmetricEncrypt({ key: context.secret, data: secret }),
    backupCodes: await symmetricEncrypt({ key: context.secret, data: '[]' }),
    verified: true,
  });
  return secret;
}

function totpCode(secret: string, now = Date.now()) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const mac = createHmac('sha1', Buffer.from(secret)).update(counter).digest();
  return ((mac.readUInt32BE(mac[mac.length - 1] & 15) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
}

function wrongTotpCode(secret: string) {
  for (let value = 0; value < 1_000_000; value++) {
    const candidate = value.toString().padStart(6, '0');
    if (staffTotpMatchingStep(secret, candidate) === null) return candidate;
  }
  throw new Error('Could not generate an invalid TOTP rehearsal code.');
}

async function completeSuspension(
  staff: Awaited<ReturnType<typeof seedStaff>>,
  userId: string,
  action: 'suspend' | 'unsuspend',
  reason: string,
  secret: string,
) {
  const started = await suspension(staff, userId, { operation: 'start', userId, action, reason });
  assert.equal(started.status, 200);
  const { token } = await started.json() as { token: string };
  const factor = await suspension(staff, userId, { operation: 'factor', token, method: 'totp', code: totpCode(secret) });
  assert.equal(factor.status, 200);
  const committed = await suspension(staff, userId, { operation: 'commit', token });
  assert.equal(committed.status, 200);
  return { token, result: await committed.json() };
}

try {
  const baselineUserCount = Number((await owner('users').count<{ count: string }[]>('* as count'))[0].count);
  await seedCustomers();
  const [superAdmin, support, supportForRollback, supportWithoutFactor, billing, unassigned, verificationStaff, emailChangeStaff] = await Promise.all([
    seedStaff('super_admin'), seedStaff('support'), seedStaff('support'), seedStaff('support'),
    seedStaff('billing'), seedStaff(), seedStaff('support'), seedStaff('super_admin'),
  ]);
  const [superAdminSecret, supportSecret, rollbackSecret, verificationSecret, emailChangeSecret] = await Promise.all([
    enrollTotp(superAdmin), enrollTotp(support), enrollTotp(supportForRollback), enrollTotp(verificationStaff), enrollTotp(emailChangeStaff),
  ]);

  assert.equal((await directory(null, {})).status, 401);
  for (const staff of [superAdmin, support, billing]) {
    const response = await directory(staff, {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const parsed = adminUserDirectoryResponseSchema.parse(await response.json());
    assert.equal(parsed.total, baselineUserCount + customerIds.length);
    assert.equal(parsed.pageSize, 20);
  }
  console.log('PASS current Super Admin, Support, and Billing roles can read the paginated directory');

  const byEmail = adminUserDirectoryResponseSchema.parse(await (await directory(support, {
    query: customerEmails[0], status: 'all', page: 0,
  })).json());
  assert.equal(byEmail.total, 1);
  assert.equal(byEmail.users[0].maskedEmail, `${customerEmails[0].slice(0, 2)}••••@example.test`);
  assert.equal(JSON.stringify(byEmail).includes(customerEmails[0]), false);
  assert.equal('email' in byEmail.users[0], false);

  const byWorkspace = adminUserDirectoryResponseSchema.parse(await (await directory(support, {
    query: `${prefix} workspace 1`, status: 'all', page: 0,
  })).json());
  assert.equal(byWorkspace.total, 2, 'workspace search finds its owner and members');
  const byId = adminUserDirectoryResponseSchema.parse(await (await directory(support, {
    query: customerIds[0], status: 'all', page: 0,
  })).json());
  assert.equal(byId.total, 1);
  const wildcard = adminUserDirectoryResponseSchema.parse(await (await directory(support, {
    query: '%', status: 'all', page: 0,
  })).json());
  assert.equal(wildcard.total, 0, 'LIKE wildcards are escaped and treated literally');
  console.log('PASS email, ID, and workspace search return only masked customer data');

  for (const [status, index] of [['active', 0], ['unverified', 1], ['suspended', 2], ['deletion_pending', 3]] as const) {
    const result = adminUserDirectoryResponseSchema.parse(await (await directory(support, { status })).json());
    assert.ok(result.users.some(user => user.id === customerIds[index]));
    assert.ok(result.users.every(user => getAdminCustomerUserStatus(user) === status));
  }
  console.log('PASS active, unverified, suspended, and deletion-pending filters');

  const details = adminCustomerUserDetailSchema.parse(await (await profile(support, customerIds[0])).json());
  assert.equal(details.permissions?.canSuspend, true);
  assert.equal(details.permissions?.canRevealPii, true);
  assert.equal(details.permissions?.canReadRelatedAudit, true);
  assert.equal(details.user.memberships.length, 2);
  assert.deepEqual(details.user.memberships.map(item => item.role).sort(), ['Member', 'Owner']);
  assert.equal(details.supplemental.authMethods.join(', '), 'Password, Google');
  assert.equal(details.supplemental.totalSessions, 2);
  assert.deepEqual(details.supplemental.sessions.map(session => session.maskedIp), [
    '73.162.x.x', '2001:db8:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx',
  ]);
  assert.deepEqual(details.supplemental.sessions.map(session => session.device), [
    'Chrome on macOS', 'Safari on iOS',
  ]);
  assert.deepEqual(details.supplemental.notificationPreferences, {
    leadAssignedEmail: false,
    visitChangedEmail: true,
    estimateEmail: false,
    deadlineReminderEmail: true,
    jobActivityEmail: false,
  });
  const detailJSON = JSON.stringify(details);
  for (const secret of [
    customerEmails[0], '73.162.48.201', '2001:db8:abcd:1234:5678:9abc:def0:1234',
    'sensitive-account-', 'sensitive-google-account-', 'sensitive-password-',
    'sensitive-access-token-', 'sensitive-session-token-', 'Mozilla/5.0',
  ]) assert.equal(detailJSON.includes(secret), false, `profile must not expose ${secret}`);
  const defaultPreferences = adminCustomerUserDetailSchema.parse(await (await profile(support, customerIds[1])).json());
  assert.equal(defaultPreferences.supplemental.notificationPreferencesRecorded, false);
  assert.equal(defaultPreferences.supplemental.sessions[0].maskedIp, '0:0:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx');
  assert.equal(JSON.stringify(defaultPreferences).includes('192.0.2.45'), false);
  assert.deepEqual(defaultPreferences.supplemental.notificationPreferences, {
    leadAssignedEmail: true,
    visitChangedEmail: true,
    estimateEmail: true,
    deadlineReminderEmail: true,
    jobActivityEmail: true,
  });
  assert.equal((await profile(support, `missing-${randomUUID()}`)).status, 404);
  const billingDetails = adminCustomerUserDetailSchema.parse(await (await profile(billing, customerIds[0])).json());
  assert.equal(billingDetails.permissions?.canSuspend, false);
  assert.equal(billingDetails.permissions?.canRevokeSessions, false);
  assert.equal(details.permissions?.canRequestPasswordReset, true);
  assert.equal(billingDetails.permissions?.canRequestPasswordReset, false);
  assert.equal(details.permissions?.canManageEmailVerification, true);
  assert.equal(billingDetails.permissions?.canManageEmailVerification, false);
  assert.equal(billingDetails.permissions?.canRevealPii, true);
  assert.equal(billingDetails.permissions?.canReadRelatedAudit, true);
  assert.equal('id' in billingDetails.supplemental.sessions[0], false);
  assert.equal((await sessions(billing, customerIds[0])).status, 403);
  console.log('PASS read-only profile details include memberships and safe supplemental data without secrets');

  for (const staff of [superAdmin, support, billing]) {
    const emailResponse = await pii(staff, customerIds[0], {
      field: 'email',
      reason: 'Reviewed customer identity request',
    });
    assert.equal(emailResponse.status, 200);
    assert.equal(emailResponse.headers.get('cache-control'), 'no-store');
    assert.deepEqual(adminCustomerUserPiiRevealResultSchema.parse(await emailResponse.json()), {
      field: 'email',
      value: customerEmails[0],
    });
    const ipResponse = await pii(staff, customerIds[0], {
      field: 'session_ips',
      reason: 'Reviewed customer sign-in activity',
    });
    assert.equal(ipResponse.status, 200);
    const revealedIps = adminCustomerUserPiiRevealResultSchema.parse(await ipResponse.json());
    assert.equal(revealedIps.field, 'session_ips');
    if (revealedIps.field === 'session_ips') {
      assert.deepEqual(revealedIps.sessions.map(session => session.ipAddress), [
        '73.162.48.201', '2001:db8:abcd:1234:5678:9abc:def0:1234',
      ]);
      assert.equal(JSON.stringify(revealedIps).includes('sensitive-session-token-'), false);
    }
  }
  const revealEvents = await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'customer.user.pii.revealed', targetType: 'customer_user', targetId: customerIds[0] })
    .orderBy('sequence')
    .select<{ staffRole: string; reason: string; after: Record<string, unknown> }[]>('staffRole', 'reason', 'after');
  assert.deepEqual(revealEvents.map(event => event.staffRole), [
    'super_admin', 'super_admin', 'support', 'support', 'billing', 'billing',
  ]);
  assert.ok(revealEvents.every(event => event.reason.length >= 10 && typeof event.after.field === 'string'));
  assert.equal(JSON.stringify(revealEvents).includes(customerEmails[0]), false);
  assert.equal(JSON.stringify(revealEvents).includes('73.162.48.201'), false);
  console.log('PASS every staff role can reason-reveal only the requested PII, with redacted audit events committed first');

  assert.equal((await pii(support, customerIds[0], { field: 'email', reason: 'short' })).status, 400);
  assert.equal((await pii(support, customerIds[0], {
    field: 'email', reason: 'Valid reveal reason', extra: 'rejected',
  })).status, 400);
  assert.equal((await pii(support, customerIds[0], {
    field: 'email', reason: 'Valid reveal reason',
  }, 'https://foreign.example')).status, 403);
  const deniedReveal = await pii(unassigned, customerIds[0], {
    field: 'email', reason: 'Reviewed customer identity request',
  });
  assert.equal(deniedReveal.status, 403);
  assert.equal(await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: unassigned.identity.userId, action: 'customer.users.access_denied', targetType: 'customer_user', targetId: customerIds[0] })
    .first('id') !== undefined, true);
  console.log('PASS malformed, cross-origin, and unauthorized privacy-reveal requests are rejected and role denials are targeted in audit');

  const beforeFailedReveal = Number((await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'customer.user.pii.revealed', targetType: 'customer_user', targetId: customerIds[1] })
    .count<{ count: string }[]>('* as count'))[0].count);
  await owner.raw(`CREATE FUNCTION admin.customer_pii_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.action = 'customer.user.pii.revealed' AND NEW."targetId" = '${customerIds[1]}' THEN
        RAISE EXCEPTION 'Rehearsal admin audit append failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER customer_pii_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
    FOR EACH ROW EXECUTE FUNCTION admin.customer_pii_rehearsal_failure()`);
  try {
    const failedReveal = await pii(support, customerIds[1], {
      field: 'email', reason: 'Reviewed customer identity request',
    });
    assert.equal(failedReveal.status, 503);
    assert.equal(JSON.stringify(await failedReveal.json()).includes(customerEmails[1]), false);
  } finally {
    await owner.raw('DROP TRIGGER customer_pii_rehearsal_failure ON admin."auditEvents"');
    await owner.raw('DROP FUNCTION admin.customer_pii_rehearsal_failure()');
  }
  assert.equal(Number((await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'customer.user.pii.revealed', targetType: 'customer_user', targetId: customerIds[1] })
    .count<{ count: string }[]>('* as count'))[0].count), beforeFailedReveal);
  console.log('PASS a failed hash-chained audit append prevents sensitive data from being returned');

  const staffHistory = adminCustomerUserStaffActionsResponseSchema.parse(await (await staffActions(support, customerIds[0])).json());
  assert.equal(staffHistory.actions.some(action => action.action === 'customer.user.pii.revealed'), true);
  assert.equal(staffHistory.actions.some(action => action.reason === 'Reviewed customer identity request'), true);
  assert.equal(JSON.stringify(staffHistory).includes(customerEmails[0]), false);
  assert.equal(JSON.stringify(staffHistory).includes('73.162.48.201'), false);
  assert.equal((await staffActions(billing, customerIds[0], '?unexpected=1')).status, 400);
  assert.equal((await staffActions(billing, customerIds[0], '', 'https://foreign.example')).status, 403);
  assert.equal((await staffActions(unassigned, customerIds[0])).status, 403);
  await owner.transaction(async trx => {
    for (let index = 0; index < 52; index++) {
      await appendAdminAuditEvent(trx, {
        staffUserId: support.identity.userId,
        staffRole: 'support',
        action: 'customer.user.rehearsal.action',
        targetType: 'customer_user',
        targetId: customerIds[0],
        reason: `Pagination fixture ${index}`,
      });
    }
    await appendAdminAuditEvent(trx, {
      staffUserId: support.identity.userId,
      staffRole: 'support',
      action: 'customer.user.foreign.fixture',
      targetType: 'customer_user',
      targetId: customerIds[1],
    });
  });
  const firstHistoryPage = adminCustomerUserStaffActionsResponseSchema.parse(
    await (await staffActions(billing, customerIds[0])).json(),
  );
  assert.equal(firstHistoryPage.actions.length, 50);
  assert.ok(firstHistoryPage.nextCursor);
  assert.equal(firstHistoryPage.actions.some(action => action.action === 'customer.user.foreign.fixture'), false);
  const secondHistoryPage = adminCustomerUserStaffActionsResponseSchema.parse(
    await (await staffActions(billing, customerIds[0], `?cursor=${firstHistoryPage.nextCursor}`)).json(),
  );
  assert.ok(secondHistoryPage.actions.length > 0 && secondHistoryPage.actions.length <= 50);
  assert.equal(secondHistoryPage.nextCursor, null);
  assert.equal(new Set([...firstHistoryPage.actions, ...secondHistoryPage.actions].map(action => action.sequence)).size,
    firstHistoryPage.actions.length + secondHistoryPage.actions.length);
  console.log('PASS every authorized role can read redacted related history with complete cursor pagination');

  const originalFetch = globalThis.fetch;
  const authRequests: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    authRequests.push({ url: String(input), init: init ?? {} });
    return Response.json({ status: true, message: 'If this email exists in our system, check your email for the reset link' });
  };
  try {
    for (const staff of [support, superAdmin]) {
      const request = await passwordReset(staff, customerIds[0], {
        userId: customerIds[0], reason: 'Customer cannot access their account',
      });
      assert.equal(request.status, 200);
      assert.equal(request.headers.get('cache-control'), 'no-store');
      assert.deepEqual(adminCustomerUserPasswordResetResultSchema.parse(await request.json()), { requested: true });
    }
    assert.equal(authRequests.length, 2);
    for (const { url, init } of authRequests) {
      assert.equal(url, 'http://localhost:3000/api/auth/request-password-reset');
      assert.equal(init.method, 'POST');
      assert.equal(new Headers(init.headers).get('origin'), 'http://localhost:3000');
      assert.deepEqual(JSON.parse(String(init.body)), {
        email: customerEmails[0],
        redirectTo: 'http://localhost:3000/reset-password',
      });
    }
    const resetEvents = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'customer.user.password_reset.requested', targetId: customerIds[0] })
      .select<{ reason: string; after: Record<string, unknown> }[]>('reason', 'after');
    assert.equal(resetEvents.length, 2);
    assert.deepEqual(resetEvents.map(event => [event.reason, event.after.authMethod]), [
      ['Customer cannot access their account', 'password'],
      ['Customer cannot access their account', 'password'],
    ]);
    assert.equal(JSON.stringify(resetEvents).includes(customerEmails[0]), false);
    assert.equal(JSON.stringify(await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Customer cannot access their account',
    })).includes(customerEmails[0]), false);
    assert.equal((await owner('sessions').where({ userId: customerIds[0] })
      .count<{ count: string }[]>('* as count'))[0].count, '2');
    console.log('PASS Super Admin and Support request password resets through customer auth with a reasoned audit and no PII response');

    assert.equal((await passwordReset(billing, customerIds[0], {
      userId: customerIds[0], reason: 'Billing role should not reset passwords',
    })).status, 403);
    assert.equal(authRequests.length, 3, 'Billing denial must not contact customer authentication');
    assert.equal((await passwordReset(support, customerIds[1], {
      userId: customerIds[1], reason: 'Social-only account has no password method',
    })).status, 409);
    assert.equal((await passwordReset(support, customerIds[3], {
      userId: customerIds[3], reason: 'Deletion pending should prevent password reset',
    })).status, 409);
    assert.equal(authRequests.length, 3, 'ineligible accounts must not contact customer authentication');
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'short',
    })).status, 400);
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[1], reason: 'Mismatched target should be rejected',
    })).status, 400);
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Foreign origin should be rejected',
    }, 'https://foreign.example')).status, 403);
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Query strings should not be accepted',
    }, undefined, '?unexpected=true')).status, 400);
    const missingResetContentTypeHeaders = requestHeaders(support);
    missingResetContentTypeHeaders.delete('content-type');
    const missingResetContentType = await passwordResetPOST(new NextRequest(
      `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[0]}/password-reset`,
      { method: 'POST', headers: missingResetContentTypeHeaders, body: JSON.stringify({
        userId: customerIds[0], reason: 'Missing content type request',
      }) },
    ), { params: Promise.resolve({ userId: customerIds[0] }) });
    assert.equal(missingResetContentType.status, 415);
    const oversizedResetBody = await passwordResetPOST(new NextRequest(
      `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[0]}/password-reset`,
      { method: 'POST', headers: requestHeaders(support), body: 'x'.repeat(9000) },
    ), { params: Promise.resolve({ userId: customerIds[0] }) });
    assert.equal(oversizedResetBody.status, 413);

    globalThis.fetch = async () => Response.json({ status: false }, { status: 200 });
    const invalidAuthResult = await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Customer requests another reset',
    });
    assert.equal(invalidAuthResult.status, 503);
    assert.equal(JSON.stringify(await invalidAuthResult.json()).includes(customerEmails[0]), false);
    globalThis.fetch = async () => Response.json({ message: 'Rate limited' }, { status: 429 });
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Customer reset request is rate limited',
    })).status, 429);

    globalThis.fetch = async () => { throw new TypeError('Simulated auth network failure'); };
    const networkFailure = await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Customer reset network failure test',
    });
    assert.equal(networkFailure.status, 503);
    assert.equal(JSON.stringify(await networkFailure.json()).includes(customerEmails[0]), false);

    const configuredAuthUrl = process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_URL = 'ftp://invalid.example';
    let invalidConfigurationCalls = 0;
    globalThis.fetch = async () => {
      invalidConfigurationCalls++;
      return Response.json({ status: true });
    };
    assert.equal((await passwordReset(support, customerIds[0], {
      userId: customerIds[0], reason: 'Invalid authentication URL test',
    })).status, 503);
    assert.equal(invalidConfigurationCalls, 0);
    process.env.BETTER_AUTH_URL = configuredAuthUrl;

    let auditFailureFetchCalls = 0;
    globalThis.fetch = async () => {
      auditFailureFetchCalls++;
      return Response.json({ status: true });
    };
    await owner.raw(`CREATE FUNCTION admin.customer_password_reset_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.action = 'customer.user.password_reset.requested' AND NEW."targetId" = '${customerIds[0]}' THEN
          RAISE EXCEPTION 'Rehearsal password-reset audit append failure';
        END IF;
        RETURN NEW;
      END $$`);
    await owner.raw(`CREATE TRIGGER customer_password_reset_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
      FOR EACH ROW EXECUTE FUNCTION admin.customer_password_reset_rehearsal_failure()`);
    try {
      assert.equal((await passwordReset(support, customerIds[0], {
        userId: customerIds[0], reason: 'Audit failure must block reset dispatch',
      })).status, 503);
    } finally {
      await owner.raw('DROP TRIGGER customer_password_reset_rehearsal_failure ON admin."auditEvents"');
      await owner.raw('DROP FUNCTION admin.customer_password_reset_rehearsal_failure()');
    }
    assert.equal(auditFailureFetchCalls, 0, 'a failed audit append must block external reset dispatch');
    console.log('PASS password-reset authorization, provider and deletion checks, strict request validation, and upstream errors');
  } finally {
    globalThis.fetch = originalFetch;
  }

  const emailVerificationMethods = await emailVerification(verificationStaff, customerIds[1]);
  assert.equal(emailVerificationMethods.status, 200);
  assert.deepEqual((await emailVerificationMethods.json()).methods, ['totp']);
  const noEmailVerificationFactors = await emailVerification(supportWithoutFactor, customerIds[1]);
  assert.equal(noEmailVerificationFactors.status, 200);
  assert.deepEqual((await noEmailVerificationFactors.json()).methods, []);
  assert.equal((await emailVerification(billing, customerIds[1])).status, 403);
  assert.equal((await emailVerification(supportWithoutFactor, customerIds[1], {
    operation: 'start', userId: customerIds[1], reason: 'No enrolled factor should block verification',
  })).status, 409);
  assert.equal((await emailVerification(verificationStaff, customerIds[3], {
    operation: 'start', userId: customerIds[3], reason: 'Deletion-pending account cannot be verified',
  })).status, 409);

  const bridgeRequests: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    bridgeRequests.push({ url: String(input), init: init ?? {} });
    return Response.json({ status: true });
  };
  try {
    const resendReason = 'Customer requested another verification email';
    const resend = await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: resendReason,
    });
    assert.equal(resend.status, 200);
    assert.deepEqual(adminCustomerUserEmailVerificationResendResultSchema.parse(await resend.json()), { requested: true });
    assert.equal(bridgeRequests.length, 1);
    const bridgeRequest = bridgeRequests[0];
    assert.equal(bridgeRequest.url, 'http://localhost:3000/api/auth/send-verification-email');
    assert.equal(bridgeRequest.init.method, 'POST');
    const signedHeaders = new Headers(bridgeRequest.init.headers);
    assert.equal(signedHeaders.get('origin'), 'http://localhost:3000');
    const callbackURL = 'http://localhost:3000/verify-email';
    const payload = JSON.parse(String(bridgeRequest.init.body)) as { email: string; callbackURL: string };
    assert.deepEqual(payload, { email: customerEmails[1], callbackURL });
    assert.equal(verifyAdminEmailVerificationRequest(
      process.env.ADMIN_EMAIL_VERIFICATION_SECRET, signedHeaders, payload.email, callbackURL,
    ), true);
    assert.equal(JSON.stringify(await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: resendReason,
    })).includes(customerEmails[1]), false);
    assert.equal((await emailVerification(verificationStaff, customerIds[0], {
      operation: 'resend', userId: customerIds[0], reason: 'Already verified email should not be resent',
    })).status, 409);
    assert.equal((await emailVerification(verificationStaff, customerIds[3], {
      operation: 'resend', userId: customerIds[3], reason: 'Deletion-pending email should not be resent',
    })).status, 409);
    assert.equal((await emailVerification(billing, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Billing cannot resend verification email',
    })).status, 403);
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'short',
    })).status, 400);
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[0], reason: 'Mismatched email-verification target',
    })).status, 400);
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Foreign-origin verification request',
    }, 'https://foreign.example')).status, 403);
    assert.equal((await emailVerification(verificationStaff, customerIds[1], undefined, undefined, '?unexpected=true')).status, 400);
    assert.equal(bridgeRequests.length, 2, 'only eligible, authorized requests may reach customer authentication');

    const missingEmailContentTypeHeaders = requestHeaders(verificationStaff);
    missingEmailContentTypeHeaders.delete('content-type');
    const missingEmailContentType = await emailVerificationPOST(new NextRequest(
      `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[1]}/email-verification`,
      { method: 'POST', headers: missingEmailContentTypeHeaders, body: JSON.stringify({
        operation: 'resend', userId: customerIds[1], reason: 'Missing content type request',
      }) },
    ), { params: Promise.resolve({ userId: customerIds[1] }) });
    assert.equal(missingEmailContentType.status, 415);
    const oversizedEmailBody = await emailVerificationPOST(new NextRequest(
      `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[1]}/email-verification`,
      { method: 'POST', headers: requestHeaders(verificationStaff), body: 'x'.repeat(17_000) },
    ), { params: Promise.resolve({ userId: customerIds[1] }) });
    assert.equal(oversizedEmailBody.status, 413);

    const secret = process.env.ADMIN_EMAIL_VERIFICATION_SECRET;
    delete process.env.ADMIN_EMAIL_VERIFICATION_SECRET;
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Signing secret should be required',
    })).status, 503);
    process.env.ADMIN_EMAIL_VERIFICATION_SECRET = secret;

    globalThis.fetch = async () => Response.json({ status: false });
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Invalid authentication response',
    })).status, 503);
    globalThis.fetch = async () => Response.json({ error: 'Rate limited' }, { status: 429 });
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Rate-limited verification request',
    })).status, 429);
    globalThis.fetch = async () => { throw new TypeError('Simulated auth network failure'); };
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'resend', userId: customerIds[1], reason: 'Network-failed verification request',
    })).status, 503);

    let auditFailureDispatches = 0;
    globalThis.fetch = async () => {
      auditFailureDispatches++;
      return Response.json({ status: true });
    };
    await owner.raw(`CREATE FUNCTION admin.customer_email_resend_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.action = 'customer.user.email_verification.resent' AND NEW."targetId" = '${customerIds[1]}' THEN
          RAISE EXCEPTION 'Rehearsal email-resend audit append failure';
        END IF;
        RETURN NEW;
      END $$`);
    await owner.raw(`CREATE TRIGGER customer_email_resend_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
      FOR EACH ROW EXECUTE FUNCTION admin.customer_email_resend_rehearsal_failure()`);
    try {
      assert.equal((await emailVerification(verificationStaff, customerIds[1], {
        operation: 'resend', userId: customerIds[1], reason: 'Audit failure must block email dispatch',
      })).status, 503);
    } finally {
      await owner.raw('DROP TRIGGER customer_email_resend_rehearsal_failure ON admin."auditEvents"');
      await owner.raw('DROP FUNCTION admin.customer_email_resend_rehearsal_failure()');
    }
    assert.equal(auditFailureDispatches, 0, 'a failed audit append must block external verification-email dispatch');
    const resendEvents = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'customer.user.email_verification.resent', targetId: customerIds[1] })
      .orderBy('sequence').select<{ reason: string; after: Record<string, unknown> }[]>('reason', 'after');
    assert.equal(resendEvents.length, 6);
    assert.deepEqual(resendEvents.slice(0, 2).map(event => event.reason), [resendReason, resendReason]);
    assert.ok(resendEvents.every(event => event.after.requested === true));
    assert.equal(JSON.stringify(resendEvents).includes(customerEmails[1]), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log('PASS email-resend role and status checks, signed bridge, bounded requests, and audit-before-dispatch');

  const verificationStartResponse = await emailVerification(verificationStaff, customerIds[1], {
    operation: 'start', userId: customerIds[1], reason: 'Confirmed control from verified support reply',
  });
  assert.equal(verificationStartResponse.status, 200);
  const verificationStart = adminUserEmailVerificationStartSchema.parse(await verificationStartResponse.json());
  assert.deepEqual(verificationStart.methods, ['totp']);
  const alternateSessionId = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: alternateSessionId, userId: verificationStaff.identity.userId, token: randomUUID(),
    createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 3_600_000),
  });
  try {
    await assert.rejects(
      customerUserManagement.commitEmailVerified(
        { ...verificationStaff.identity, sessionId: alternateSessionId }, verificationStart.token,
      ),
      (error: unknown) => error instanceof Error && 'status' in error && error.status === 409,
    );
  } finally {
    await owner.withSchema('admin').table('staffSessions').where({ id: alternateSessionId }).delete();
  }
  const invalidVerificationFactor = await emailVerification(verificationStaff, customerIds[1], {
    operation: 'factor', token: verificationStart.token, method: 'totp', code: wrongTotpCode(verificationSecret),
  });
  assert.equal(invalidVerificationFactor.status, 422);
  assert.deepEqual(await invalidVerificationFactor.json(), {
    error: 'Second-factor verification failed or the code was already used.',
  });
  const validVerificationFactor = await emailVerification(verificationStaff, customerIds[1], {
    operation: 'factor', token: verificationStart.token, method: 'totp', code: totpCode(verificationSecret),
  });
  assert.equal(validVerificationFactor.status, 200);
  assert.deepEqual(await validVerificationFactor.json(), { verified: true });
  await owner('users').where({ id: customerIds[1] }).update({ deletionRequestedAt: now });
  assert.equal((await emailVerification(verificationStaff, customerIds[1], {
    operation: 'commit', token: verificationStart.token,
  })).status, 409, 'pending deletion is rechecked at commit');
  await owner('users').where({ id: customerIds[1] }).update({ deletionRequestedAt: null });
  await owner.raw(`CREATE FUNCTION admin.customer_email_mark_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.action = 'customer.user.email_verified' AND NEW."targetId" = '${customerIds[1]}' THEN
        RAISE EXCEPTION 'Rehearsal email-verification audit append failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER customer_email_mark_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
    FOR EACH ROW EXECUTE FUNCTION admin.customer_email_mark_rehearsal_failure()`);
  try {
    assert.equal((await emailVerification(verificationStaff, customerIds[1], {
      operation: 'commit', token: verificationStart.token,
    })).status, 503);
  } finally {
    await owner.raw('DROP TRIGGER customer_email_mark_rehearsal_failure ON admin."auditEvents"');
    await owner.raw('DROP FUNCTION admin.customer_email_mark_rehearsal_failure()');
  }
  assert.equal((await owner('users').where({ id: customerIds[1] }).first('emailVerified')).emailVerified, false,
    'email verification rolls back when the admin audit event cannot be appended');
  assert.equal(Number((await owner('accountAudit').where({
    userId: customerIds[1], action: 'email.marked_verified',
  }).count<{ count: string }[]>('* as count'))[0].count), 0);
  const verificationChallengeId = (await import('@salesmora/data/invitation-tokens')).invitationTokenHash(verificationStart.token);
  assert.equal((await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: verificationChallengeId }).first('consumedAt')).consumedAt, null);
  const verifiedResponse = await emailVerification(verificationStaff, customerIds[1], {
    operation: 'commit', token: verificationStart.token,
  });
  assert.equal(verifiedResponse.status, 200);
  assert.deepEqual(adminCustomerUserEmailVerificationResultSchema.parse(await verifiedResponse.json()), { changed: true });
  assert.equal((await owner('users').where({ id: customerIds[1] }).first('emailVerified')).emailVerified, true);
  const emailAccountAudit = await owner('accountAudit').where({
    userId: customerIds[1], action: 'email.marked_verified',
  }).first<{ actorType: string; actorId: string; reason: string }>('actorType', 'actorId', 'reason');
  assert.deepEqual(emailAccountAudit, {
    actorType: 'staff',
    actorId: verificationStaff.identity.userId,
    reason: 'Confirmed control from verified support reply',
  });
  const emailAdminAudit = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: verificationStaff.identity.userId, action: 'customer.user.email_verified', targetId: customerIds[1] })
    .first<{ reason: string; before: Record<string, unknown>; after: Record<string, unknown> }>('reason', 'before', 'after');
  assert.deepEqual(emailAdminAudit, {
    reason: 'Confirmed control from verified support reply',
    before: { emailVerified: false },
    after: { emailVerified: true },
  });
  assert.equal((await emailVerification(verificationStaff, customerIds[1], {
    operation: 'commit', token: verificationStart.token,
  })).status, 409, 'the step-up challenge is single-use');
  assert.equal((await emailVerification(verificationStaff, customerIds[1], {
    operation: 'start', userId: customerIds[1], reason: 'Already verified email cannot be marked again',
  })).status, 409);
  console.log('PASS email-verification step-up, challenge binding, status revalidation, and atomic account/admin audit');

  const newCustomerEmail = `new-${prefix}@new.example.test`;
  assert.equal((await emailChange(support, customerIds[0], {
    operation: 'start', userId: customerIds[0], email: newCustomerEmail, reason: 'Customer requested an email change',
  })).status, 403, 'Support cannot change customer email');
  const billingEmailChangeProfile = adminCustomerUserDetailSchema.parse(
    await (await profile(billing, customerIds[0])).json(),
  );
  assert.equal(billingEmailChangeProfile.permissions?.canChangeEmail, false);
  assert.equal(billingEmailChangeProfile.pendingEmailChange, null);
  assert.equal((await emailChange(emailChangeStaff, customerIds[3], {
    operation: 'start', userId: customerIds[3], email: newCustomerEmail, reason: 'Deletion-pending account change',
  })).status, 409);
  assert.equal((await emailChange(emailChangeStaff, customerIds[0], {
    operation: 'start', userId: customerIds[0], email: customerEmails[1], reason: 'Address is already in use',
  })).status, 409);
  const emailChangeMethodsResponse = await emailChange(emailChangeStaff, customerIds[0]);
  assert.equal(emailChangeMethodsResponse.status, 200);
  assert.deepEqual(await emailChangeMethodsResponse.json(), { methods: ['totp'] });
  const emailChangeStartResponse = await emailChange(emailChangeStaff, customerIds[0], {
    operation: 'start',
    userId: customerIds[0],
    email: newCustomerEmail,
    reason: 'Customer requested an email change',
  });
  assert.equal(emailChangeStartResponse.status, 200);
  const emailChangeStart = adminUserEmailChangeStartSchema.parse(await emailChangeStartResponse.json());
  assert.deepEqual(emailChangeStart.methods, ['totp']);
  assert.equal((await emailChange(emailChangeStaff, customerIds[0], {
    operation: 'factor', token: emailChangeStart.token, method: 'totp', code: wrongTotpCode(emailChangeSecret),
  })).status, 422);
  const emailChangeFactor = await emailChange(emailChangeStaff, customerIds[0], {
    operation: 'factor', token: emailChangeStart.token, method: 'totp', code: totpCode(emailChangeSecret),
  });
  assert.equal(emailChangeFactor.status, 200);
  assert.deepEqual(await emailChangeFactor.json(), { verified: true });

  const originalEmailChangeFetch = globalThis.fetch;
  let deliveredEmailChange: Record<string, unknown> | undefined;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), `${process.env.BETTER_AUTH_URL}/api/auth/admin-email-change`);
    const payload = JSON.parse(String(init?.body)) as {
      requestId: string; oldEmail: string; newEmail: string; token: string; callbackURL: string;
    };
    assert.equal(verifyAdminEmailChangeDelivery(
      process.env.ADMIN_EMAIL_CHANGE_SECRET, new Headers(init?.headers), payload,
    ), true);
    assert.equal(payload.oldEmail, customerEmails[0]);
    assert.equal(payload.newEmail, newCustomerEmail);
    assert.equal(new URL(payload.callbackURL).pathname, '/change-email/confirm');
    const auditEvent = await owner.withSchema('admin').table('auditEvents')
      .where({ requestId: payload.requestId, action: 'customer.user.email_change.requested' }).first('sequence');
    assert.ok(auditEvent, 'the admin audit event must commit before email dispatch');
    deliveredEmailChange = payload;
    return Response.json({ status: true });
  };
  let emailChangeCommit: Response;
  try {
    emailChangeCommit = await emailChange(emailChangeStaff, customerIds[0], {
      operation: 'commit', token: emailChangeStart.token,
    });
  } finally {
    globalThis.fetch = originalEmailChangeFetch;
  }
  assert.equal(emailChangeCommit.status, 200);
  const emailChangeResult = adminCustomerUserEmailChangeResultSchema.parse(await emailChangeCommit.json());
  assert.equal(emailChangeResult.requested, true);
  assert.equal(emailChangeResult.maskedNewEmail, `${newCustomerEmail.slice(0, 2)}••••@new.example.test`);
  assert.equal(JSON.stringify(emailChangeResult).includes(newCustomerEmail), false);
  assert.ok(deliveredEmailChange);
  const pendingRequest = await owner.withSchema('admin').table('userEmailChanges')
    .where({ userId: customerIds[0] }).whereNull('consumedAt').whereNull('invalidatedAt')
    .first<{ tokenHash: string; oldEmail: string; newEmail: string; reason: string; expiresAt: Date }>(
      'tokenHash', 'oldEmail', 'newEmail', 'reason', 'expiresAt',
    );
  assert.equal(pendingRequest?.oldEmail, customerEmails[0]);
  assert.equal(pendingRequest?.newEmail, newCustomerEmail);
  assert.equal(pendingRequest?.reason, 'Customer requested an email change');
  assert.equal(pendingRequest?.tokenHash.length, 64);
  assert.ok(pendingRequest?.expiresAt.getTime() > Date.now());
  const afterRequest = await owner('users').where({ id: customerIds[0] }).first('email', 'emailVerified');
  assert.equal(afterRequest?.email, customerEmails[0], 'the current address stays active until verification');
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[0] }).count<{ count: string }[]>('* as count'))[0].count), 2);
  assert.equal(Number((await owner('accountAudit').where({
    userId: customerIds[0], action: 'email.changed',
  }).count<{ count: string }[]>('* as count'))[0].count), 0);
  const superAdminEmailChangeProfile = adminCustomerUserDetailSchema.parse(
    await (await profile(emailChangeStaff, customerIds[0])).json(),
  );
  assert.equal(superAdminEmailChangeProfile.permissions?.canChangeEmail, true);
  assert.equal(superAdminEmailChangeProfile.pendingEmailChange?.maskedNewEmail, emailChangeResult.maskedNewEmail);
  assert.equal(JSON.stringify(superAdminEmailChangeProfile).includes(newCustomerEmail), false);
  assert.equal((await emailChange(emailChangeStaff, customerIds[0], {
    operation: 'commit', token: emailChangeStart.token,
  })).status, 409, 'the passkey/TOTP challenge is single-use');
  console.log('PASS Super Admin-only email-change step-up, audit-before-dispatch, masked pending state, and unchanged account before verification');

  const supportSessions = adminCustomerUserSessionsResponseSchema.parse(await (await sessions(support, customerIds[2])).json());
  assert.equal(supportSessions.totalSessions, 22);
  assert.equal(supportSessions.sessions.length, 20, 'session access list is bounded');
  assert.equal(supportSessions.sessions[0].maskedIp, '198.51.x.x');
  assert.equal(JSON.stringify(supportSessions).includes('198.51.100.27'), false);
  assert.equal(JSON.stringify(supportSessions).includes('Mozilla/5.0'), false);
  const sessionDetail = adminCustomerUserDetailSchema.parse(await (await profile(support, customerIds[2])).json());
  assert.equal(sessionDetail.permissions?.canRevokeSessions, true);
  assert.equal(sessionDetail.supplemental.totalSessions, 22);
  assert.equal(JSON.stringify(sessionDetail).includes(supportSessions.sessions[0].id), false,
    'session IDs are excluded from the general profile response');
  assert.equal((await sessions(superAdmin, customerIds[0])).status, 200);
  const billingSessionDenialsBefore = Number((await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.identity.userId, action: 'customer.users.access_denied' })
    .count<{ count: string }[]>('* as count'))[0].count);
  assert.equal((await sessions(billing, customerIds[0])).status, 403);
  const billingSessionDenialsAfter = Number((await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: billing.identity.userId, action: 'customer.users.access_denied' })
    .count<{ count: string }[]>('* as count'))[0].count);
  assert.equal(billingSessionDenialsAfter, billingSessionDenialsBefore + 1);
  assert.equal((await sessions(support, customerIds[0], { scope: 'all', userId: customerIds[0], reason: 'Wrong origin request' },
    'https://foreign.example')).status, 403);
  assert.equal((await sessions(support, customerIds[0], undefined, undefined, '?unexpected=1')).status, 400);
  assert.equal((await sessions(support, customerIds[2], {
    scope: 'all', userId: customerIds[0], reason: 'Target binding check',
  })).status, 400);
  assert.equal((await sessions(support, customerIds[2], {
    scope: 'all', userId: customerIds[2], reason: 'short',
  })).status, 400);
  const sessionHeaders = requestHeaders(support);
  sessionHeaders.delete('content-type');
  const missingSessionContentType = await sessionsPOST(new NextRequest(
    `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[2]}/sessions`,
    { method: 'POST', headers: sessionHeaders, body: JSON.stringify({ scope: 'all', userId: customerIds[2], reason: 'Missing content type' }) },
  ), { params: Promise.resolve({ userId: customerIds[2] }) });
  assert.equal(missingSessionContentType.status, 415);
  const selectedSessionId = supportSessions.sessions[0].id;
  const selectedRevocation = await sessions(support, customerIds[2], {
    scope: 'selected', userId: customerIds[2], sessionIds: [selectedSessionId], reason: 'Reviewed selected session',
  });
  assert.equal(selectedRevocation.status, 200);
  assert.deepEqual(await selectedRevocation.json(), { revoked: 1 });
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[2] }).count<{ count: string }[]>('* as count'))[0].count), 21);
  const selectedAccountAudit = await owner('accountAudit').where({ userId: customerIds[2], action: 'sessions.revoked' })
    .first<{ actorType: string; actorId: string; reason: string; details: { scope: string; sessionIds: string[] } }>(
      'actorType', 'actorId', 'reason', 'details',
    );
  assert.equal(selectedAccountAudit?.actorType, 'staff');
  assert.equal(selectedAccountAudit?.actorId, support.identity.userId);
  assert.equal(selectedAccountAudit?.reason, 'Reviewed selected session');
  assert.equal(selectedAccountAudit?.details.scope, 'selected');
  assert.deepEqual(selectedAccountAudit?.details.sessionIds, [selectedSessionId]);
  const allSessionsBefore = adminCustomerUserSessionsResponseSchema.parse(await (await sessions(support, customerIds[2])).json());
  assert.equal(allSessionsBefore.totalSessions, 21);
  assert.equal(allSessionsBefore.sessions.length, 20);
  const allRevocation = await sessions(support, customerIds[2], {
    scope: 'all', userId: customerIds[2], reason: 'Reviewed sign-out across devices',
  });
  assert.equal(allRevocation.status, 200);
  assert.deepEqual(await allRevocation.json(), { revoked: 21 }, 'all revocation includes sessions beyond the displayed list');
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[2] }).count<{ count: string }[]>('* as count'))[0].count), 0);
  const sessionEvents = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'customer.user.sessions_revoked', targetId: customerIds[2] })
    .orderBy('sequence').select<{ reason: string; after: Record<string, unknown> }[]>('reason', 'after');
  assert.deepEqual(sessionEvents.map(event => [event.reason, event.after.scope, event.after.revoked]), [
    ['Reviewed selected session', 'selected', 1],
    ['Reviewed sign-out across devices', 'all', 21],
  ]);
  const foreignSessionId = adminCustomerUserSessionsResponseSchema.parse(await (await sessions(support, customerIds[1])).json())
    .sessions[0].id;
  const foreignSessionAttempt = await sessions(support, customerIds[0], {
    scope: 'selected', userId: customerIds[0], sessionIds: [foreignSessionId], reason: 'Cross-user session check',
  });
  assert.equal(foreignSessionAttempt.status, 200);
  assert.deepEqual(await foreignSessionAttempt.json(), { revoked: 0 });
  const superAdminRevocation = await sessions(superAdmin, customerIds[1], {
    scope: 'selected', userId: customerIds[1], sessionIds: [foreignSessionId], reason: 'Super Admin session review',
  });
  assert.equal(superAdminRevocation.status, 200);
  assert.deepEqual(await superAdminRevocation.json(), { revoked: 1 });
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[0] }).count<{ count: string }[]>('* as count'))[0].count), 2,
    'an unknown or cross-user session ID is ignored');
  console.log('PASS session listing and revocation enforce role boundaries, bounded privacy, target binding, and dual reasoned audit');

  await owner.raw(`CREATE FUNCTION admin.customer_sessions_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.action = 'customer.user.sessions_revoked' AND NEW."targetId" = '${customerIds[0]}' THEN
        RAISE EXCEPTION 'Rehearsal admin audit append failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER customer_sessions_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
    FOR EACH ROW EXECUTE FUNCTION admin.customer_sessions_rehearsal_failure()`);
  try {
    const failedRevocation = await sessions(supportForRollback, customerIds[0], {
      scope: 'all', userId: customerIds[0], reason: 'Audit rollback rehearsal',
    });
    assert.equal(failedRevocation.status, 503);
  } finally {
    await owner.raw('DROP TRIGGER customer_sessions_rehearsal_failure ON admin."auditEvents"');
    await owner.raw('DROP FUNCTION admin.customer_sessions_rehearsal_failure()');
  }
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[0] }).count<{ count: string }[]>('* as count'))[0].count), 2,
    'session deletion rolls back when the admin audit event cannot be appended');
  assert.equal(Number((await owner('accountAudit').where({ userId: customerIds[0], action: 'sessions.revoked' })
    .count<{ count: string }[]>('* as count'))[0].count), 0,
  'account audit insert rolls back with session deletion');
  console.log('PASS failed admin audit append atomically rolls back session deletion and account audit');

  for (const input of [
    { query: 'x'.repeat(255) }, { status: 'unknown' }, { page: -1 }, { extra: 'unexpected' },
  ]) assert.equal((await directory(support, input)).status, 400);
  assert.equal((await directory(support, {}, 'https://foreign.example')).status, 403);
  assert.equal((await directory(support, {}, process.env.ADMIN_AUTH_URL!)).status, 200);
  const missingTypeHeaders = requestHeaders(support);
  missingTypeHeaders.delete('content-type');
  const missingType = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users`, {
    method: 'POST', headers: missingTypeHeaders, body: '{}',
  });
  assert.equal((await directoryPOST(missingType)).status, 415);

  const deniedBefore = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: unassigned.identity.userId, action: 'customer.users.access_denied' }).count<{ count: string }[]>('* as count');
  assert.equal((await directory(unassigned, {})).status, 403);
  const deniedAfter = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: unassigned.identity.userId, action: 'customer.users.access_denied' })
    .count<{ count: string }[]>('* as count');
  assert.equal(Number(deniedAfter[0].count), Number(deniedBefore[0].count) + 1);
  console.log('PASS malformed inputs are rejected and role denials are audited before the 403 response');

  const readEvents = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'customer.users.directory.read' })
    .where('after', '@>', JSON.stringify({ queryProvided: true }))
    .select<{ after: Record<string, unknown> }[]>('after');
  assert.ok(readEvents.length >= 1);
  assert.equal(JSON.stringify(readEvents).includes(customerEmails[0]), false, 'raw search terms are not stored in audit evidence');
  console.log('PASS each authorized read is audited without persisting the raw search term');

  const methods = await suspension(support, customerIds[0]);
  assert.equal(methods.status, 200);
  assert.deepEqual((await methods.json()).methods, ['totp']);
  const noFactorMethods = await suspension(supportWithoutFactor, customerIds[0]);
  assert.equal(noFactorMethods.status, 200);
  assert.deepEqual((await noFactorMethods.json()).methods, []);
  assert.equal((await suspension(billing, customerIds[0])).status, 403);
  assert.equal((await suspension(supportWithoutFactor, customerIds[0], {
    operation: 'start', userId: customerIds[0], action: 'suspend', reason: 'Reviewed access request',
  })).status, 409);
  assert.equal((await suspension(support, customerIds[3], {
    operation: 'start', userId: customerIds[3], action: 'suspend', reason: 'Reviewed access request',
  })).status, 409);
  assert.equal((await suspension(support, customerIds[0], {
    operation: 'start', userId: customerIds[0], action: 'suspend', reason: 'Reviewed access request',
  }, 'https://foreign.example')).status, 403);
  const oversized = new NextRequest(`${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[0]}/suspension`, {
    method: 'POST',
    headers: requestHeaders(support),
    body: 'x'.repeat(17_000),
  });
  assert.equal((await suspensionPOST(oversized, { params: Promise.resolve({ userId: customerIds[0] }) })).status, 413);
  const invalidMethods = await suspensionGET(new NextRequest(
    `${process.env.ADMIN_AUTH_URL}/api/admin/users/${customerIds[0]}/suspension?unexpected=1`,
    { headers: requestHeaders(support) },
  ), { params: Promise.resolve({ userId: customerIds[0] }) });
  assert.equal(invalidMethods.status, 400);
  console.log('PASS suspension authorization, unavailable factors, deletion holds, origin, query, and body-size guards');

  const suspendStarted = await suspension(support, customerIds[0], {
    operation: 'start', userId: customerIds[0], action: 'suspend', reason: 'Verified support review',
  });
  assert.equal(suspendStarted.status, 200);
  const suspendToken = (await suspendStarted.json() as { token: string }).token;
  await assert.rejects(
    customerUserManagement.commitSuspension({ ...support.identity, sessionId: randomUUID() }, suspendToken),
    (error: unknown) => error instanceof Error && 'status' in error && error.status === 401,
  );
  const invalidFactor = await suspension(support, customerIds[0], {
    operation: 'factor', token: suspendToken, method: 'totp', code: wrongTotpCode(supportSecret),
  });
  assert.equal(invalidFactor.status, 422);
  assert.deepEqual(await invalidFactor.json(), { error: 'Second-factor verification failed or the code was already used.' });
  const validFactor = await suspension(support, customerIds[0], {
    operation: 'factor', token: suspendToken, method: 'totp', code: totpCode(supportSecret),
  });
  assert.equal(validFactor.status, 200);
  assert.deepEqual(await validFactor.json(), { verified: true });
  const suspended = await suspension(support, customerIds[0], { operation: 'commit', token: suspendToken });
  assert.equal(suspended.status, 200);
  assert.deepEqual(await suspended.json(), {
    action: 'suspend', changed: true, suspendedAt: (await owner('users').where({ id: customerIds[0] }).first('suspendedAt')).suspendedAt.toISOString(),
  });
  assert.equal(Number((await owner('sessions').where({ userId: customerIds[0] }).count<{ count: string }[]>('* as count'))[0].count), 0);
  const suspendedHistory = await owner('suspensionAudit').where({ subjectType: 'user', subjectId: customerIds[0] })
    .orderBy('id').select<{ action: string; reason: string }[]>('action', 'reason');
  assert.deepEqual(suspendedHistory, [{ action: 'suspended', reason: 'Verified support review' }]);
  const suspendEvent = await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: support.identity.userId, action: 'customer.user.suspended', targetId: customerIds[0] })
    .first<{ reason: string; after: Record<string, unknown> }>('reason', 'after');
  assert.equal(suspendEvent?.reason, 'Verified support review');
  assert.equal(suspendEvent?.after.sessionsRevoked, true);
  console.log('PASS challenge/session binding, invalid and valid TOTP, atomic suspension, session revocation, and dual audit records');

  const replayStart = await suspension(support, customerIds[1], {
    operation: 'start', userId: customerIds[1], action: 'suspend', reason: 'Replay protection review',
  });
  assert.equal(replayStart.status, 200);
  const replayToken = (await replayStart.json() as { token: string }).token;
  const replayFactor = await suspension(support, customerIds[1], {
    operation: 'factor', token: replayToken, method: 'totp', code: totpCode(supportSecret),
  });
  assert.equal(replayFactor.status, 422, 'one TOTP step cannot authorize two staff actions');
  console.log('PASS TOTP replay rejection across distinct action challenges');

  const unsuspended = await completeSuspension(
    superAdmin, customerIds[2], 'unsuspend', 'Customer access restored after review', superAdminSecret,
  );
  assert.deepEqual(unsuspended.result, { action: 'unsuspend', changed: true, suspendedAt: null });
  const unsuspendHistory = await owner('suspensionAudit').where({ subjectType: 'user', subjectId: customerIds[2] })
    .orderBy('id').select<{ action: string; reason: string }[]>('action', 'reason');
  assert.deepEqual(unsuspendHistory, [{ action: 'unsuspended', reason: 'Customer access restored after review' }]);
  assert.equal(await owner('users').where({ id: customerIds[2], suspendedReason: null }).first('id') !== undefined, true);
  assert.equal(await owner.withSchema('admin').table('auditEvents')
    .where({ staffUserId: superAdmin.identity.userId, action: 'customer.user.unsuspended', targetId: customerIds[2] })
    .where({ reason: 'Customer access restored after review' }).first('id') !== undefined, true);
  console.log('PASS Super Admin unsuspension preserves the reason in both audit ledgers');

  const rollbackStarted = await suspension(supportForRollback, customerIds[1], {
    operation: 'start', userId: customerIds[1], action: 'suspend', reason: 'Atomic audit rollback test',
  });
  assert.equal(rollbackStarted.status, 200);
  const rollbackToken = (await rollbackStarted.json() as { token: string }).token;
  const rollbackFactor = await suspension(supportForRollback, customerIds[1], {
    operation: 'factor', token: rollbackToken, method: 'totp', code: totpCode(rollbackSecret),
  });
  assert.equal(rollbackFactor.status, 200);
  await owner.raw(`CREATE FUNCTION admin.customer_suspension_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW.action = 'customer.user.suspended' AND NEW."targetId" = '${customerIds[1]}' THEN
        RAISE EXCEPTION 'Rehearsal admin audit append failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER customer_suspension_rehearsal_failure BEFORE INSERT ON admin."auditEvents"
    FOR EACH ROW EXECUTE FUNCTION admin.customer_suspension_rehearsal_failure()`);
  try {
    assert.equal((await suspension(supportForRollback, customerIds[1], { operation: 'commit', token: rollbackToken })).status, 503);
  } finally {
    await owner.raw('DROP TRIGGER customer_suspension_rehearsal_failure ON admin."auditEvents"');
    await owner.raw('DROP FUNCTION admin.customer_suspension_rehearsal_failure()');
  }
  assert.equal((await owner('users').where({ id: customerIds[1] }).first('suspendedAt')).suspendedAt, null);
  const rollbackChallenge = await owner.withSchema('admin').table('staffActionChallenges')
    .where({ id: (await import('@salesmora/data/invitation-tokens')).invitationTokenHash(rollbackToken) }).first();
  assert.equal(rollbackChallenge.consumedAt, null);
  const rollbackCommit = await suspension(supportForRollback, customerIds[1], { operation: 'commit', token: rollbackToken });
  assert.equal(rollbackCommit.status, 200);
  assert.equal((await owner('users').where({ id: customerIds[1] }).first('suspendedAt')).suspendedAt instanceof Date, true);
  console.log('PASS admin audit failure rolls back the suspension and challenge consumption; retry succeeds atomically');
} finally {
  await owner('workspaces').whereIn('id', workspaceIds).delete();
  await owner('users').whereIn('id', customerIds).delete();
  await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
  await Promise.all([owner.destroy(), adminDb.destroy()]);
  await context.options.database?.end?.();
}

console.log('Customer user management rehearsal passed; append-only fictional audit events remain.');

import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { symmetricDecrypt } from 'better-auth/crypto';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import { createDatabase } from '@salesmora/data/database';
import { verifyAdminAuditChain } from '@salesmora/data/admin-audit';
import { newInvitationToken } from '@salesmora/data/invitation-tokens';
import { staffTotpAuthenticatorSecret, staffTotpMatches } from './staff-totp';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) ||
  ownerURL === process.env.DATABASE_URL) {
  throw Error('Use the isolated local test database.');
}
if (!process.env.DB_ADMIN_APP_PASSWORD) throw Error('Set DB_ADMIN_APP_PASSWORD and run pnpm db:roles:test.');

const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app';
adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;
process.env.ADMIN_DATABASE_URL = adminURL.toString();
const rehearsalAuthSecret = randomUUID() + randomUUID();
process.env.ADMIN_AUTH_SECRET = rehearsalAuthSecret;
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';

const owner = createDatabase(ownerURL);
const emailPrefix = `staff-enrollment-${randomUUID()}`;
const totpEmail = `${emailPrefix}-totp@karpukcreative.com`;
const passkeyEmail = `${emailPrefix}-passkey@karpukcreative.com`;
const expiredEmail = `${emailPrefix}-expired@karpukcreative.com`;
const accessEmail = totpEmail;
const now = new Date();

async function seedInvitation(email: string, expiresAt = new Date(Date.now() + 60 * 60 * 1000)) {
  const { token, tokenHash } = newInvitationToken();
  const id = randomUUID();
  await owner.withSchema('admin').table('staffInvitations').insert({
    id,
    email,
    role: 'super_admin',
    tokenHash,
    invitedBy: null,
    createdAt: new Date(Math.min(now.getTime(), expiresAt.getTime() - 1000)),
    expiresAt,
  });
  const storedInvitation = await owner.withSchema('admin').table('staffInvitations').where({ id }).first('tokenHash');
  assert.equal(storedInvitation.tokenHash, tokenHash);
  assert.notEqual(storedInvitation.tokenHash, token, 'only a hash of the invitation token is stored');
  return { id, token };
}

function invalidTotpCode(secret: string) {
  for (let candidate = 0; candidate < 1_000_000; candidate++) {
    const code = candidate.toString().padStart(6, '0');
    if (!staffTotpMatches(secret, code)) return code;
  }
  throw new Error('Could not generate an invalid TOTP test code.');
}

function base64url(value: Uint8Array) {
  return Buffer.from(value).toString('base64url');
}

function registrationResponse(challenge: string, userVerified: boolean) {
  const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jwk = publicKey.export({ format: 'jwk' });
  assert.ok(jwk.x && jwk.y);
  const credentialID = randomBytes(32);
  const credentialIDString = base64url(credentialID);
  const cosePublicKey = isoCBOR.encode(new Map<number, number | Buffer>([
    [1, 2],
    [3, -7],
    [-1, 1],
    [-2, Buffer.from(jwk.x, 'base64url')],
    [-3, Buffer.from(jwk.y, 'base64url')],
  ]));
  const authenticatorData = Buffer.concat([
    createHash('sha256').update('localhost').digest(),
    Buffer.from([userVerified ? 0x45 : 0x05]),
    Buffer.from([0, 0, 0, 0]),
    Buffer.alloc(16),
    Buffer.from([credentialID.length >> 8, credentialID.length & 255]),
    credentialID,
    Buffer.from(cosePublicKey),
  ]);
  const attestationObject = isoCBOR.encode(new Map<string | number, string | Buffer | Map<string, never>>([
    ['fmt', 'none'],
    ['attStmt', new Map<string, never>()],
    ['authData', authenticatorData],
  ]));
  const clientDataJSON = Buffer.from(JSON.stringify({
    type: 'webauthn.create',
    challenge,
    origin: process.env.ADMIN_AUTH_URL,
    crossOrigin: false,
  }));
  return {
    id: credentialIDString,
    rawId: credentialIDString,
    type: 'public-key' as const,
    response: {
      clientDataJSON: base64url(clientDataJSON),
      attestationObject: base64url(attestationObject),
      transports: ['internal' as const],
    },
    clientExtensionResults: {},
  };
}

try {
  const [{ beginStaffEnrollment, completeStaffPasskeyEnrollment, completeStaffTotpEnrollment }, { auth }] =
    await Promise.all([import('./staff-enrollment'), import('./auth')]);
  const totpInvitation = await seedInvitation(totpEmail);
  const passkeyInvitation = await seedInvitation(passkeyEmail);
  const expiredInvitation = await seedInvitation(expiredEmail, new Date(Date.now() - 1000));

  await assert.rejects(
    beginStaffEnrollment({
      token: totpInvitation.token,
      name: 'Legacy identity rejection',
      password: `Enrollment-${randomUUID()}-Password`,
      factor: 'totp',
      accessEmail: 'admin@salesmora.ai',
    }),
    /verified @karpukcreative.com staff email/,
  );
  assert.equal(await owner.withSchema('admin').table('staffEnrollments').where({ invitationId: totpInvitation.id }).first(), undefined);

  await assert.rejects(
    beginStaffEnrollment({
      token: totpInvitation.token,
      name: 'TOTP Rehearsal',
      password: `Enrollment-${randomUUID()}-Password`,
      factor: 'totp',
      accessEmail: `other-${emailPrefix}@karpukcreative.com`,
    }),
    /different verified staff identity/,
  );
  assert.equal(await owner.withSchema('admin').table('staffEnrollments').where({ invitationId: totpInvitation.id }).first(), undefined);

  await assert.rejects(
    beginStaffEnrollment({
      token: expiredInvitation.token,
      name: 'Expired Rehearsal',
      password: `Enrollment-${randomUUID()}-Password`,
      factor: 'totp',
      accessEmail: expiredEmail,
    }),
    /invalid or expired/,
  );

  const totpStart = await beginStaffEnrollment({
    token: totpInvitation.token,
    name: 'TOTP Rehearsal',
    password: `Enrollment-${randomUUID()}-Password`,
    factor: 'totp',
    accessEmail,
  });
  assert.ok(totpStart.totpURI?.startsWith('otpauth://totp/'));
  const totpPending = await owner.withSchema('admin').table('staffEnrollments')
    .where({ invitationId: totpInvitation.id }).first('state', 'tokenHash');
  assert.notEqual(totpPending.tokenHash, totpStart.enrollmentCookie, 'only a hash of the enrollment cookie is stored');
  const totpState = JSON.parse(await symmetricDecrypt({
    key: rehearsalAuthSecret,
    data: totpPending.state,
  })) as { userId: string; totpSecret: string };
  assert.equal(
    new URL(totpStart.totpURI!).searchParams.get('secret'),
    staffTotpAuthenticatorSecret(totpState.totpSecret),
    'authenticator URI must contain the base32-encoded UTF-8 key Better Auth verifies',
  );
  assert.equal(totpPending.state.includes(totpState.totpSecret), false, 'pending factor material is encrypted at rest');
  assert.equal(await owner.withSchema('admin').table('staffUsers').where({ id: totpState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('staffSessions').where({ userId: totpState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: totpState.userId }).first('id'), undefined);

  await assert.rejects(
    completeStaffTotpEnrollment({
      enrollmentCookie: totpStart.enrollmentCookie,
      code: invalidTotpCode(totpState.totpSecret),
      accessEmail,
    }),
    /invalid/,
  );
  assert.equal((await owner.withSchema('admin').table('staffEnrollments').where({ invitationId: totpInvitation.id }).first('failedAttempts')).failedAttempts, 1);
  assert.equal(await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'staff.enrollment.completed', targetId: totpState.userId }).first('id'), undefined);
  const totpCode = (await auth.api.generateTOTP({ body: { secret: totpState.totpSecret } })).code;
  assert.ok(staffTotpMatches(totpState.totpSecret, totpCode), 'enrollment verifier must match Better Auth TOTP');
  const totpCompleted = await completeStaffTotpEnrollment({
    enrollmentCookie: totpStart.enrollmentCookie,
    code: totpCode,
    accessEmail,
    auditContext: {
      requestId: 'totp-enrollment-request',
      ipAddress: '192.0.2.10',
      userAgent: 'Enrollment rehearsal',
    },
  });
  assert.equal(totpCompleted.backupCodes.length, 10);
  const totpFactor = await owner.withSchema('admin').table('staffTwoFactors')
    .where({ userId: totpState.userId }).first('secret', 'backupCodes');
  assert.notEqual(totpFactor.secret, totpState.totpSecret, 'TOTP secret is encrypted at rest');
  assert.notEqual(totpFactor.backupCodes, JSON.stringify(totpCompleted.backupCodes), 'recovery codes are encrypted at rest');
  assert.equal((await owner.withSchema('admin').table('staffUsers').where({ id: totpState.userId }).first('twoFactorEnabled'))?.twoFactorEnabled, true);
  assert.equal((await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: totpState.userId, revokedAt: null }).first('role'))?.role, 'super_admin');
  assert.equal(await owner.withSchema('admin').table('staffTwoFactors').where({ userId: totpState.userId, verified: true }).first('id') !== undefined, true);
  assert.equal(await owner.withSchema('admin').table('staffSessions').where({ userId: totpState.userId }).first('id'), undefined);
  assert.ok((await owner.withSchema('admin').table('staffInvitations').where({ id: totpInvitation.id }).first('acceptedAt')).acceptedAt);
  assert.equal(await owner.withSchema('admin').table('staffEnrollments').where({ invitationId: totpInvitation.id }).first('id'), undefined);
  const totpAuditEvent = await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'staff.enrollment.completed', targetId: totpState.userId })
    .first('staffRole', 'after', 'requestId', 'ipAddress', 'userAgent');
  assert.equal(totpAuditEvent.staffRole, 'super_admin');
  assert.deepEqual(totpAuditEvent.after, { role: 'super_admin', secondFactor: 'totp' });
  assert.equal(totpAuditEvent.requestId, 'totp-enrollment-request');
  assert.equal(totpAuditEvent.ipAddress, '192.0.2.10');
  assert.equal(totpAuditEvent.userAgent, 'Enrollment rehearsal');
  await assert.rejects(
    completeStaffTotpEnrollment({
      enrollmentCookie: totpStart.enrollmentCookie,
      code: totpCode,
      accessEmail,
    }),
    /expired/,
  );

  const passkeyStart = await beginStaffEnrollment({
    token: passkeyInvitation.token,
    name: 'Passkey Rehearsal',
    password: `Enrollment-${randomUUID()}-Password`,
    factor: 'passkey',
    accessEmail: passkeyEmail,
  });
  assert.ok(passkeyStart.passkeyOptions);
  const passkeyPending = await owner.withSchema('admin').table('staffEnrollments')
    .where({ invitationId: passkeyInvitation.id }).first('state');
  const passkeyState = JSON.parse(await symmetricDecrypt({
    key: rehearsalAuthSecret,
    data: passkeyPending.state,
  })) as { userId: string; challenge: string };
  assert.equal(await owner.withSchema('admin').table('staffUsers').where({ id: passkeyState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('staffSessions').where({ userId: passkeyState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: passkeyState.userId }).first('id'), undefined);
  await assert.rejects(
    completeStaffPasskeyEnrollment({
      enrollmentCookie: passkeyStart.enrollmentCookie,
      response: registrationResponse(passkeyState.challenge, false),
      accessEmail: passkeyEmail,
    }),
    /Passkey verification failed/,
  );
  assert.equal((await owner.withSchema('admin').table('staffEnrollments').where({ invitationId: passkeyInvitation.id }).first('failedAttempts')).failedAttempts, 1);
  assert.equal(await owner.withSchema('admin').table('staffUsers').where({ id: passkeyState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: passkeyState.userId }).first('id'), undefined);
  assert.equal(await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'staff.enrollment.completed', targetId: passkeyState.userId }).first('id'), undefined);
  const passkeyCompleted = await completeStaffPasskeyEnrollment({
    enrollmentCookie: passkeyStart.enrollmentCookie,
    response: registrationResponse(passkeyState.challenge, true),
    accessEmail: passkeyEmail,
  });
  assert.equal(passkeyCompleted.backupCodes.length, 10);
  assert.equal(await owner.withSchema('admin').table('staffPasskeys').where({ userId: passkeyState.userId }).first('id') !== undefined, true);
  assert.equal((await owner.withSchema('admin').table('staffRoleAssignments').where({ userId: passkeyState.userId, revokedAt: null }).first('role'))?.role, 'super_admin');
  assert.equal(await owner.withSchema('admin').table('staffSessions').where({ userId: passkeyState.userId }).first('id'), undefined);
  assert.ok((await owner.withSchema('admin').table('staffInvitations').where({ id: passkeyInvitation.id }).first('acceptedAt')).acceptedAt);
  const passkeyAuditEvent = await owner.withSchema('admin').table('auditEvents')
    .where({ action: 'staff.enrollment.completed', targetId: passkeyState.userId }).first('staffRole', 'after');
  assert.equal(passkeyAuditEvent.staffRole, 'super_admin');
  assert.deepEqual(passkeyAuditEvent.after, { role: 'super_admin', secondFactor: 'passkey' });
  await assert.rejects(
    completeStaffPasskeyEnrollment({
      enrollmentCookie: passkeyStart.enrollmentCookie,
      response: registrationResponse(passkeyState.challenge, true),
      accessEmail: passkeyEmail,
    }),
    /expired/,
  );
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  console.log('Staff enrollment rehearsal passed.');
} finally {
  try {
    await owner.withSchema('admin').table('staffInvitations').whereIn('email', [totpEmail, passkeyEmail, expiredEmail]).delete();
    await owner.withSchema('admin').table('staffUsers').whereIn('email', [totpEmail, passkeyEmail]).delete();
  } finally {
    const adminPool = (globalThis as typeof globalThis & {
      salesmoraAdminAuthPool?: { end: () => Promise<void> };
    }).salesmoraAdminAuthPool;
    await Promise.all([owner.destroy(), ...(adminPool ? [adminPool.end()] : [])]);
  }
}

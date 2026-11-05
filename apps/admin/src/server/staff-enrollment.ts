import 'server-only';
import { randomBytes, randomInt, randomUUID } from 'node:crypto';
import { staffEmailSchema, staffEmailDomain, type StaffRoleId } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';
import { appendAdminAuditEvent, type AdminAuditEventInput } from '@salesmora/data/admin-audit';
import { createDatabase } from '@salesmora/data/database';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { getAdminAuthConfiguration } from './auth-config';
import { auth } from './auth';
import { generateStaffTotpSecret, staffTotpAuthenticatorSecret, staffTotpMatches } from './staff-totp';

const configuration = getAdminAuthConfiguration();
const enrollmentDatabase = createDatabase(configuration.databaseUrl);
const ENROLLMENT_LIFETIME_MS = 10 * 60 * 1000;
const MAX_ENROLLMENT_ATTEMPTS = 5;
const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class StaffEnrollmentError extends Error {
  constructor(message: string, readonly status: number = 400) {
    super(message);
  }
}

interface EnrollmentState {
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  factor: 'passkey' | 'totp';
  challenge?: string;
  totpSecret?: string;
}

interface StaffEnrollment {
  id: string;
  invitationId: string;
  tokenHash: string;
  factor: 'passkey' | 'totp';
  state: string;
  failedAttempts: number;
  expiresAt: Date;
}

type EnrollmentAuditContext = Pick<AdminAuditEventInput, 'requestId' | 'ipAddress' | 'userAgent'>;

function isEnrollmentState(value: unknown): value is EnrollmentState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return typeof state.userId === 'string' && typeof state.email === 'string' &&
    typeof state.name === 'string' && typeof state.passwordHash === 'string' &&
    (state.factor === 'passkey' || state.factor === 'totp') &&
    (state.factor !== 'passkey' || typeof state.challenge === 'string') &&
    (state.factor !== 'totp' || typeof state.totpSecret === 'string');
}

function staffEmail(value: string) {
  const parsed = staffEmailSchema.safeParse(value);
  if (!parsed.success) throw new StaffEnrollmentError(`Use your verified @${staffEmailDomain} staff email.`, 403);
  return parsed.data;
}

function backupCodes() {
  return Array.from({ length: 10 }, () => {
    const part = () => Array.from({ length: 5 }, () => BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)]).join('');
    return `${part()}-${part()}`;
  });
}

function enrollmentCookieHash(value: string) {
  return invitationTokenHash(value);
}

async function loadEnrollment(trx: Knex.Transaction, cookie: string) {
  const enrollment = await trx.withSchema('admin').table('staffEnrollments')
    .where({ tokenHash: enrollmentCookieHash(cookie) })
    .forUpdate()
    .first() as StaffEnrollment | undefined;
  if (!enrollment || new Date(enrollment.expiresAt).getTime() <= Date.now()) {
    throw new StaffEnrollmentError('This enrollment has expired. Open your invitation link again.', 401);
  }
  if (enrollment.failedAttempts >= MAX_ENROLLMENT_ATTEMPTS) {
    throw new StaffEnrollmentError('Too many enrollment attempts. Open your invitation link again.', 429);
  }
  let state: unknown;
  try {
    state = JSON.parse(await symmetricDecrypt({
      key: configuration.secret,
      data: enrollment.state,
    }));
  } catch {
    throw new Error('Stored staff enrollment state is invalid.');
  }
  if (!isEnrollmentState(state) || state.factor !== enrollment.factor) {
    throw new Error('Stored staff enrollment state is invalid.');
  }
  return { enrollment, state };
}

async function createStaffAccount(
  trx: Knex.Transaction,
  invitation: { id: string; email: string; role: StaffRoleId; acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date },
  state: EnrollmentState,
  factor: {
    kind: 'totp';
    secret: string;
    backupCodes: string[];
  } | {
    kind: 'passkey';
    registration: NonNullable<Awaited<ReturnType<typeof verifyRegistrationResponse>>['registrationInfo']>;
    response: RegistrationResponseJSON;
    backupCodes: string[];
  },
  auditContext: EnrollmentAuditContext = {},
) {
  const now = new Date();
  const invitationRow = await trx.withSchema('admin').table('staffInvitations')
    .where({ id: invitation.id })
    .forUpdate()
    .first();
  if (!invitationRow || invitationRow.acceptedAt || invitationRow.revokedAt ||
    new Date(invitationRow.expiresAt).getTime() <= now.getTime() ||
    invitationRow.email.toLowerCase() !== state.email || invitationRow.role !== invitation.role) {
    throw new StaffEnrollmentError('This invitation is invalid or expired.', 401);
  }

  const [user] = await trx.withSchema('admin').table('staffUsers').insert({
    id: state.userId,
    name: state.name,
    email: state.email,
    emailVerified: true,
    twoFactorEnabled: true,
    createdAt: now,
    updatedAt: now,
  }).returning(['id']);
  await trx.withSchema('admin').table('staffAccounts').insert({
    id: randomUUID(),
    userId: state.userId,
    accountId: state.userId,
    providerId: 'credential',
    password: state.passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  const codes = factor.backupCodes;
  const encryptedCodes = await symmetricEncrypt({
    key: configuration.secret,
    data: JSON.stringify(codes),
  });
  if (factor.kind === 'totp') {
    await trx.withSchema('admin').table('staffTwoFactors').insert({
      id: randomUUID(),
      userId: state.userId,
      secret: await symmetricEncrypt({ key: configuration.secret, data: factor.secret }),
      backupCodes: encryptedCodes,
      verified: true,
    });
  } else {
    const { credential } = factor.registration;
    await trx.withSchema('admin').table('staffPasskeys').insert({
      id: randomUUID(),
      userId: state.userId,
      name: 'Enrollment passkey',
      publicKey: Buffer.from(credential.publicKey).toString('base64'),
      credentialID: credential.id,
      counter: credential.counter,
      deviceType: factor.registration.credentialDeviceType,
      backedUp: factor.registration.credentialBackedUp,
      transports: factor.response.response.transports?.join(',') ?? '',
      createdAt: now,
      aaguid: factor.registration.aaguid,
    });
    await trx.withSchema('admin').table('staffTwoFactors').insert({
      id: randomUUID(),
      userId: state.userId,
      secret: await symmetricEncrypt({ key: configuration.secret, data: randomBytes(32).toString('hex') }),
      backupCodes: encryptedCodes,
      verified: false,
    });
  }

  await trx.withSchema('admin').table('staffRoleAssignments').insert({
    id: randomUUID(),
    userId: state.userId,
    role: invitation.role,
    grantedBy: invitationRow.invitedBy,
    grantedAt: now,
  });
  await trx.withSchema('admin').table('staffInvitations').where({ id: invitation.id }).update({ acceptedAt: now });
  await trx.withSchema('admin').table('staffEnrollments').where({ invitationId: invitation.id }).delete();
  await appendAdminAuditEvent(trx, {
    staffUserId: state.userId,
    staffRole: invitation.role,
    action: 'staff.enrollment.completed',
    targetType: 'staff_user',
    targetId: state.userId,
    after: { role: invitation.role, secondFactor: factor.kind },
    ...auditContext,
  });
  return { userId: user.id as string, backupCodes: codes };
}

function createEnrollmentCookie() {
  return randomBytes(32).toString('base64url');
}

export async function beginStaffEnrollment(input: {
  token: string;
  name: string;
  password: string;
  factor: 'passkey' | 'totp';
  accessEmail: string;
}) {
  const email = staffEmail(input.accessEmail);
  if (!input.token || input.token.length > 512) throw new StaffEnrollmentError('This invitation is invalid or expired.', 401);
  if (input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new StaffEnrollmentError('Enter your name using 2 to 120 characters.');
  }
  if (input.password.length < 14 || input.password.length > 128) {
    throw new StaffEnrollmentError('Choose a password between 14 and 128 characters.');
  }
  if (input.factor !== 'passkey' && input.factor !== 'totp') throw new StaffEnrollmentError('Choose a supported second factor.');

  const now = new Date();
  const passwordHash = await (await auth.$context).password.hash(input.password);
  const userId = randomUUID();
  const enrollmentCookie = createEnrollmentCookie();
  const factor = input.factor;
  const totpSecret = factor === 'totp' ? generateStaffTotpSecret() : undefined;
  const passkeyOptions = factor === 'passkey' ? await generateRegistrationOptions({
    rpName: 'SalesMora Admin',
    rpID: configuration.rpID,
    userID: new TextEncoder().encode(userId),
    userName: email,
    userDisplayName: input.name.trim(),
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    attestationType: 'none',
  }) : undefined;
  const expiresAt = new Date(now.getTime() + ENROLLMENT_LIFETIME_MS);
  const state: EnrollmentState = {
    userId,
    email,
    name: input.name.trim(),
    passwordHash,
    factor,
    ...(factor === 'passkey' && passkeyOptions ? { challenge: passkeyOptions.challenge } : {}),
    ...(totpSecret ? { totpSecret } : {}),
  };

  const response = await enrollmentDatabase.transaction(async trx => {
    const invitation = await trx.withSchema('admin').table('staffInvitations')
      .where({ tokenHash: invitationTokenHash(input.token) })
      .forUpdate()
      .first();
    if (!invitation || invitation.acceptedAt || invitation.revokedAt ||
      new Date(invitation.expiresAt).getTime() <= now.getTime()) {
      throw new StaffEnrollmentError('This invitation is invalid or expired.', 401);
    }
    if (invitation.email.toLowerCase() !== email) {
      throw new StaffEnrollmentError('This invitation belongs to a different verified staff identity.', 403);
    }
    if (await trx.withSchema('admin').table('staffUsers').whereRaw('lower("email") = ?', [email]).first('id')) {
      throw new StaffEnrollmentError('A staff account already exists for this invitation.', 409);
    }
    await trx.withSchema('admin').table('staffEnrollments').where({ invitationId: invitation.id }).delete();
    const pendingExpiresAt = new Date(Math.min(expiresAt.getTime(), new Date(invitation.expiresAt).getTime()));
    await trx.withSchema('admin').table('staffEnrollments').insert({
      id: randomUUID(),
      invitationId: invitation.id,
      tokenHash: enrollmentCookieHash(enrollmentCookie),
      factor,
      state: await symmetricEncrypt({
        key: configuration.secret,
        data: JSON.stringify(state),
      }),
      expiresAt: pendingExpiresAt,
      createdAt: now,
    });
    return {
      email,
      factor,
      expiresAt: pendingExpiresAt,
      ...(passkeyOptions ? { passkeyOptions } : {}),
      ...(totpSecret ? {
        totpURI: `otpauth://totp/${encodeURIComponent(`SalesMora Admin:${email}`)}?secret=${staffTotpAuthenticatorSecret(totpSecret)}&issuer=${encodeURIComponent('SalesMora Admin')}&algorithm=SHA1&digits=6&period=30`,
      } : {}),
    };
  });
  return { ...response, enrollmentCookie };
}

export async function completeStaffTotpEnrollment(input: {
  enrollmentCookie: string;
  code: string;
  accessEmail: string;
  auditContext?: EnrollmentAuditContext;
}) {
  const email = staffEmail(input.accessEmail);
  const normalizedCode = input.code.replace(/\s/g, '');
  if (!input.enrollmentCookie) throw new StaffEnrollmentError('Enrollment expired. Open your invitation link again.', 401);

  const completion = await enrollmentDatabase.transaction(async trx => {
    const { enrollment, state } = await loadEnrollment(trx, input.enrollmentCookie);
    if (state.factor !== 'totp' || state.email !== email || !state.totpSecret) {
      throw new StaffEnrollmentError('This enrollment does not match your verified identity.', 403);
    }
    const invitation = await trx.withSchema('admin').table('staffInvitations')
      .where({ id: enrollment.invitationId }).first();
    if (!invitation) throw new StaffEnrollmentError('This invitation is invalid or expired.', 401);
    if (!staffTotpMatches(state.totpSecret, normalizedCode)) {
      await trx.withSchema('admin').table('staffEnrollments')
        .where({ id: enrollment.id }).increment('failedAttempts', 1);
      return { invalid: true as const };
    }
    const result = await createStaffAccount(trx, invitation, state, {
      kind: 'totp',
      secret: state.totpSecret,
      backupCodes: backupCodes(),
    }, input.auditContext);
    return { result };
  });
  if ('invalid' in completion) throw new StaffEnrollmentError('That authenticator code is invalid. Try again.');
  return completion.result;
}

export async function completeStaffPasskeyEnrollment(input: {
  enrollmentCookie: string;
  response: RegistrationResponseJSON;
  accessEmail: string;
  auditContext?: EnrollmentAuditContext;
}) {
  const email = staffEmail(input.accessEmail);
  if (!input.enrollmentCookie) throw new StaffEnrollmentError('Enrollment expired. Open your invitation link again.', 401);

  const pending = await enrollmentDatabase.transaction(async trx => {
    const { enrollment, state } = await loadEnrollment(trx, input.enrollmentCookie);
    if (state.factor !== 'passkey' || state.email !== email || !state.challenge) {
      throw new StaffEnrollmentError('This enrollment does not match your verified identity.', 403);
    }
    const invitation = await trx.withSchema('admin').table('staffInvitations')
      .where({ id: enrollment.invitationId }).first();
    if (!invitation) throw new StaffEnrollmentError('This invitation is invalid or expired.', 401);
    return { enrollment, state, invitation };
  });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: pending.state.challenge!,
      expectedOrigin: configuration.baseURL,
      expectedRPID: configuration.rpID,
      requireUserVerification: true,
    });
  } catch {
    await enrollmentDatabase.withSchema('admin').table('staffEnrollments')
      .where({ id: pending.enrollment.id })
      .where('failedAttempts', '<', MAX_ENROLLMENT_ATTEMPTS)
      .increment('failedAttempts', 1);
    throw new StaffEnrollmentError('Passkey verification failed. Try again or restart enrollment.');
  }
  if (!verification.verified || !verification.registrationInfo?.userVerified) {
    await enrollmentDatabase.withSchema('admin').table('staffEnrollments')
      .where({ id: pending.enrollment.id })
      .where('failedAttempts', '<', MAX_ENROLLMENT_ATTEMPTS)
      .increment('failedAttempts', 1);
    throw new StaffEnrollmentError('Passkey verification failed. User verification is required.');
  }

  return enrollmentDatabase.transaction(async trx => {
    const { state } = await loadEnrollment(trx, input.enrollmentCookie);
    if (state.email !== email || state.factor !== 'passkey') {
      throw new StaffEnrollmentError('This enrollment does not match your verified identity.', 403);
    }
    const result = await createStaffAccount(trx, pending.invitation, state, {
      kind: 'passkey',
      registration: verification.registrationInfo!,
      response: input.response,
      backupCodes: backupCodes(),
    }, input.auditContext);
    return result;
  });
}

import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import {
  adminCustomerUserIdSchema,
  adminCustomerUserDetailSchema,
  adminUserSuspensionOperationSchema,
  adminUserSuspensionMethodsSchema,
  adminUserSuspensionResultSchema,
  adminCustomerUserSessionsResponseSchema,
  adminCustomerUserSessionRevocationOperationSchema,
  adminCustomerUserSessionRevocationResultSchema,
  adminCustomerUserPasswordResetOperationSchema,
  adminCustomerUserPasswordResetResultSchema,
  adminCustomerUserEmailVerificationResendResultSchema,
  adminCustomerUserEmailVerificationResultSchema,
  adminCustomerUserEmailVerificationVerifiedSchema,
  adminUserEmailVerificationOperationSchema,
  adminUserEmailVerificationMethodsSchema,
  adminUserEmailVerificationStartSchema,
  adminUserEmailChangeOperationSchema,
  adminUserEmailChangeMethodsSchema,
  adminUserEmailChangeStartSchema,
  adminCustomerUserEmailChangeVerifiedSchema,
  adminCustomerUserEmailChangeResultSchema,
  adminCustomerUserPendingEmailChangeSchema,
  adminCustomerUserPiiRevealOperationSchema,
  adminCustomerUserPiiRevealResultSchema,
  adminCustomerUserStaffActionsQuerySchema,
  adminCustomerUserStaffActionsResponseSchema,
  adminEmailChangeDeliverySchema,
  adminUserDirectoryQuerySchema,
  adminUserDirectoryResponseSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminCustomerUserDetail,
  type AdminUserDirectoryResponse,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import {
  adminEmailVerificationSignatureHeaders,
  signAdminEmailVerificationRequest,
} from '@salesmora/data/admin-email-verification-signature';
import {
  adminEmailChangeSignatureHeaders,
  adminEmailChangeTokenHash,
  signAdminEmailChangeDelivery,
} from '@salesmora/data/admin-email-change-signature';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import {
  readAdminCustomerUserDetail,
  readAdminCustomerUserActionTarget,
  readAdminCustomerUserPii,
  readAdminCustomerUserSessions,
  readAdminUserDirectory,
} from '@salesmora/data/admin-user-management';
import { suspendUser, unsuspendUser } from '@salesmora/data/accounts/suspension';
import { markEmailVerified, revokeUserSessions } from '@salesmora/data/accounts/account-actions';
import type { Knex } from '@salesmora/data/database';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

export const customerUserManagementDatabase = createDatabase(getAdminAuthConfiguration().databaseUrl);

export class CustomerUserManagementError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface CustomerUserManagementIdentity {
  userId: string;
  sessionId: string;
  accessEmail: string;
}

interface CustomerUserManagementContext {
  userAgent?: string | null;
}

type Denial = { denied: 401 | 403 };
type Success<T> = { denied: false; value: T };
type UserSuspensionChallenge = {
  id: string;
  input: { kind: 'customer_user_suspension'; userId: string; action: 'suspend' | 'unsuspend'; reason: string };
  challenge: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  attempts: number;
};
type UserEmailVerificationChallenge = {
  id: string;
  input: { kind: 'customer_user_email_verification'; userId: string; reason: string };
  challenge: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  attempts: number;
};
type UserEmailChangeChallenge = {
  id: string;
  input: { kind: 'customer_user_email_change'; userId: string; oldEmail: string; newEmail: string; reason: string };
  challenge: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  attempts: number;
};
type UserActionChallenge = UserSuspensionChallenge | UserEmailVerificationChallenge | UserEmailChangeChallenge;
type UserActionChallengeKind = UserActionChallenge['input']['kind'];
const actionLifetime = 5 * 60 * 1000;
const emailChangeLifetime = 60 * 60 * 1000;

async function submitCustomerPasswordReset(email: string) {
  const configuredUrl = process.env.BETTER_AUTH_URL;
  if (!configuredUrl) throw new CustomerUserManagementError('Customer authentication is not configured.', 503);

  let baseUrl: URL;
  try { baseUrl = new URL(configuredUrl); }
  catch { throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503); }
  const isLocalHttp = baseUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname);
  if ((!isLocalHttp && baseUrl.protocol !== 'https:') || baseUrl.username || baseUrl.password ||
    (baseUrl.pathname !== '/' && baseUrl.pathname !== '') || baseUrl.search || baseUrl.hash) {
    throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503);
  }

  let response: Response;
  try {
    response = await fetch(new URL('/api/auth/request-password-reset', baseUrl.origin), {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: baseUrl.origin },
      body: JSON.stringify({ email, redirectTo: new URL('/reset-password', baseUrl.origin).href }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Admin customer password-reset request could not reach customer authentication.',
      error instanceof Error ? error.name : 'Unknown error');
    throw new CustomerUserManagementError('Customer authentication is temporarily unavailable.', 503);
  }
  if (response.status === 429) {
    throw new CustomerUserManagementError('Password-reset requests are temporarily rate-limited. Try again later.', 429);
  }
  if (!response.ok) throw new CustomerUserManagementError('Customer authentication could not process the reset request.', 503);

  let result: unknown;
  try { result = await response.json(); }
  catch { throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503); }
  if (!result || typeof result !== 'object' || !('status' in result) || result.status !== true) {
    throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503);
  }
}

async function submitCustomerVerificationEmail(email: string) {
  const configuredUrl = process.env.BETTER_AUTH_URL;
  const secret = process.env.ADMIN_EMAIL_VERIFICATION_SECRET;
  if (!configuredUrl) throw new CustomerUserManagementError('Customer authentication is not configured.', 503);
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new CustomerUserManagementError('Admin email-verification signing is not configured.', 503);
  }

  let baseUrl: URL;
  try { baseUrl = new URL(configuredUrl); }
  catch { throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503); }
  const isLocalHttp = baseUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname);
  if ((!isLocalHttp && baseUrl.protocol !== 'https:') || baseUrl.username || baseUrl.password ||
    (baseUrl.pathname !== '/' && baseUrl.pathname !== '') || baseUrl.search || baseUrl.hash) {
    throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503);
  }

  const origin = baseUrl.origin;
  const callbackURL = new URL('/verify-email', origin).href;
  const normalizedEmail = email.trim().toLowerCase();
  const signature = signAdminEmailVerificationRequest(secret, normalizedEmail, callbackURL);
  let response: Response;
  try {
    response = await fetch(new URL('/api/auth/send-verification-email', origin), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin,
        [adminEmailVerificationSignatureHeaders.timestamp]: signature.timestamp,
        [adminEmailVerificationSignatureHeaders.nonce]: signature.nonce,
        [adminEmailVerificationSignatureHeaders.signature]: signature.signature,
      },
      body: JSON.stringify({ email: normalizedEmail, callbackURL }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Admin verification-email request could not reach customer authentication.',
      error instanceof Error ? error.name : 'Unknown error');
    throw new CustomerUserManagementError('Customer authentication is temporarily unavailable.', 503);
  }
  if (response.status === 429) {
    throw new CustomerUserManagementError('Verification-email requests are temporarily rate-limited. Try again later.', 429);
  }
  if (!response.ok) throw new CustomerUserManagementError('Customer authentication could not process the verification-email request.', 503);

  let result: unknown;
  try { result = await response.json(); }
  catch { throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503); }
  if (!result || typeof result !== 'object' || !('status' in result) || result.status !== true) {
    throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503);
  }
}

async function submitCustomerEmailChange(delivery: {
  requestId: string;
  oldEmail: string;
  newEmail: string;
  token: string;
}) {
  const configuredUrl = process.env.BETTER_AUTH_URL;
  const secret = process.env.ADMIN_EMAIL_CHANGE_SECRET;
  if (!configuredUrl) throw new CustomerUserManagementError('Customer authentication is not configured.', 503);
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new CustomerUserManagementError('Admin email-change signing is not configured.', 503);
  }

  let baseUrl: URL;
  try { baseUrl = new URL(configuredUrl); }
  catch { throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503); }
  const isLocalHttp = baseUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname);
  if ((!isLocalHttp && baseUrl.protocol !== 'https:') || baseUrl.username || baseUrl.password ||
    (baseUrl.pathname !== '/' && baseUrl.pathname !== '') || baseUrl.search || baseUrl.hash) {
    throw new CustomerUserManagementError('Customer authentication is not configured correctly.', 503);
  }

  const origin = baseUrl.origin;
  const callback = new URL('/change-email/confirm', origin);
  callback.searchParams.set('token', delivery.token);
  const payload = adminEmailChangeDeliverySchema.parse({
    requestId: delivery.requestId,
    oldEmail: delivery.oldEmail,
    newEmail: delivery.newEmail,
    token: delivery.token,
    callbackURL: callback.href,
  });
  const signature = signAdminEmailChangeDelivery(secret, payload);
  let response: Response;
  try {
    response = await fetch(new URL('/api/auth/admin-email-change', origin), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin,
        [adminEmailChangeSignatureHeaders.timestamp]: signature.timestamp,
        [adminEmailChangeSignatureHeaders.nonce]: signature.nonce,
        [adminEmailChangeSignatureHeaders.signature]: signature.signature,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Admin email-change request could not reach customer authentication.',
      error instanceof Error ? error.name : 'Unknown error');
    throw new CustomerUserManagementError('Customer authentication is temporarily unavailable.', 503);
  }
  if (!response.ok) throw new CustomerUserManagementError('Customer authentication could not deliver the email-change request.', 503);
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503); }
  if (!result || typeof result !== 'object' || !('status' in result) || result.status !== true) {
    throw new CustomerUserManagementError('Customer authentication returned an invalid response.', 503);
  }
}

function maskEmail(email: string) {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) throw new Error('Customer email is malformed.');
  return `${email.slice(0, Math.min(2, separator))}••••@${email.slice(separator + 1)}`;
}

export function createCustomerUserManagementService(db: Knex) {
  async function authorized<T>(
    identity: CustomerUserManagementIdentity,
    context: CustomerUserManagementContext,
    permission: 'admin.users.read' | 'admin.users.suspend' | 'admin.users.sessions.revoke' |
      'admin.users.password.reset' | 'admin.users.email.verify' | 'admin.users.email.change' |
      'admin.users.pii.reveal' | 'admin.audit.related.read',
    callback: (trx: Knex.Transaction, role: 'super_admin' | 'support' | 'billing') => Promise<T>,
    deniedTarget?: { targetType: string; targetId: string },
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '10s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }

      const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes(permission)) {
        const readPermission = permission === 'admin.users.read';
        const suspendPermission = permission === 'admin.users.suspend';
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'customer.users.access_denied',
          targetType: deniedTarget?.targetType ?? (readPermission ? 'customer_user_directory' : 'customer_user'),
          targetId: deniedTarget?.targetId ?? (readPermission ? 'read' : suspendPermission ? 'suspension'
            : permission === 'admin.users.sessions.revoke' ? 'session_revocation'
              : permission === 'admin.users.password.reset' ? 'password_reset'
              : permission === 'admin.users.email.verify' ? 'email_verification' : 'email_change'),
          after: { permission, assignedRole: role.success ? role.data : null },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }

      const value = await callback(trx, role.data);
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new CustomerUserManagementError('Your admin session expired during the request. Sign in again.', 401);
      }
      return { denied: false as const, value };
    }) as Denial | Success<T>;

    if (result.denied) {
      throw new CustomerUserManagementError(
        result.denied === 401 ? 'Sign in with your verified staff identity.'
          : permission === 'admin.users.read' ? 'Your current role cannot read customer users.'
            : permission === 'admin.users.suspend' ? 'Your current role cannot manage customer account access.'
              : permission === 'admin.users.sessions.revoke' ? 'Your current role cannot revoke customer sessions.'
                : permission === 'admin.users.password.reset' ? 'Your current role cannot request customer password resets.'
                  : permission === 'admin.users.email.verify' ? 'Your current role cannot manage customer email verification.'
                    : permission === 'admin.users.email.change' ? 'Your current role cannot change customer email addresses.'
                      : permission === 'admin.users.pii.reveal' ? 'Your current role cannot reveal customer personal information.'
                        : 'Your current role cannot read related staff actions.',
        result.denied,
      );
    }
    return result.value;
  }

  async function revealPii(
    identity: CustomerUserManagementIdentity,
    inputUserId: unknown,
    input: unknown,
    context: CustomerUserManagementContext = {},
  ) {
    const parsedId = adminCustomerUserIdSchema.safeParse(inputUserId);
    const operation = adminCustomerUserPiiRevealOperationSchema.safeParse(input);
    if (!parsedId.success || !operation.success) throw new CustomerUserManagementError('Invalid customer privacy reveal request.');
    return authorized(identity, context, 'admin.users.pii.reveal', async (trx, role) => {
      const exists = await trx('users').where({ id: parsedId.data }).forShare().first('id');
      if (!exists) throw new CustomerUserManagementError('Customer user not found.', 404);
      const result = adminCustomerUserPiiRevealResultSchema.parse(
        await readAdminCustomerUserPii(trx, parsedId.data, operation.data.field),
      );
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.pii.revealed',
        targetType: 'customer_user',
        targetId: parsedId.data,
        reason: operation.data.reason,
        after: {
          field: operation.data.field,
          ...(result.field === 'session_ips' ? { sessionCount: result.sessions.length } : {}),
        },
        userAgent: context.userAgent,
      });
      return result;
    }, { targetType: 'customer_user', targetId: parsedId.data });
  }

  async function readRelatedStaffActions(
    identity: CustomerUserManagementIdentity,
    inputUserId: unknown,
    input: unknown,
    context: CustomerUserManagementContext = {},
  ) {
    const parsedId = adminCustomerUserIdSchema.safeParse(inputUserId);
    const query = adminCustomerUserStaffActionsQuerySchema.safeParse(input);
    if (!parsedId.success || !query.success) throw new CustomerUserManagementError('Invalid related staff-action query.');
    return authorized(identity, context, 'admin.audit.related.read', async trx => {
      const exists = await trx('users').where({ id: parsedId.data }).first('id');
      if (!exists) throw new CustomerUserManagementError('Customer user not found.', 404);
      const eventsQuery = trx.withSchema('admin').table('auditEvents as e')
        .leftJoin('staffUsers as u', 'u.id', 'e.staffUserId')
        .where({ 'e.targetType': 'customer_user', 'e.targetId': parsedId.data })
        .orderBy('e.sequence', 'desc')
        .limit(51);
      if (query.data.cursor) eventsQuery.where('e.sequence', '<', query.data.cursor);
      const events = await eventsQuery.select<{
        sequence: string;
        occurredAt: Date | string;
        staffUserId: string | null;
        staffRole: 'super_admin' | 'support' | 'billing' | 'bootstrap';
        action: string;
        reason: string | null;
        actorName: string | null;
      }[]>([
        'e.sequence', 'e.occurredAt', 'e.staffUserId', 'e.staffRole', 'e.action', 'e.reason', 'u.name as actorName',
      ]);
      const hasMore = events.length > 50;
      const page = events.slice(0, 50);
      return adminCustomerUserStaffActionsResponseSchema.parse({
        actions: page.map(event => ({
          sequence: String(event.sequence),
          occurredAt: new Date(event.occurredAt).toISOString(),
          actorName: event.actorName ?? (event.staffUserId ? 'Staff member (unavailable)' : 'System'),
          actorRole: event.staffUserId === null
            ? event.staffRole === 'bootstrap' ? 'bootstrap' : 'system'
            : event.staffRole,
          action: event.action,
          reason: event.reason,
        })),
        nextCursor: hasMore ? String(page.at(-1)!.sequence) : null,
      });
    }, { targetType: 'customer_user', targetId: parsedId.data });
  }

  async function readDirectory(identity: CustomerUserManagementIdentity, input: unknown, context: CustomerUserManagementContext = {}): Promise<AdminUserDirectoryResponse> {
    const parsed = adminUserDirectoryQuerySchema.safeParse(input);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid customer user filters.');
    return authorized(identity, context, 'admin.users.read', async (trx, role) => {
      const result = adminUserDirectoryResponseSchema.parse(await readAdminUserDirectory(trx, parsed.data));
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.users.directory.read',
        targetType: 'customer_user_directory',
        targetId: 'list',
        after: {
          queryProvided: parsed.data.query.length > 0,
          status: parsed.data.status,
          page: result.page,
          pageSize: result.pageSize,
          resultCount: result.users.length,
          total: result.total,
        },
        userAgent: context.userAgent,
      });
      return result;
    });
  }

  async function readProfile(identity: CustomerUserManagementIdentity, inputUserId: unknown, context: CustomerUserManagementContext = {}): Promise<AdminCustomerUserDetail | null> {
    const parsedId = adminCustomerUserIdSchema.safeParse(inputUserId);
    if (!parsedId.success) throw new CustomerUserManagementError('Invalid customer user ID.');
    return authorized(identity, context, 'admin.users.read', async (trx, role) => {
      const rawDetail = await readAdminCustomerUserDetail(trx, parsedId.data);
      const canChangeEmail = staffRolePermissions[role].includes('admin.users.email.change');
      const pendingRow = canChangeEmail ? await trx.withSchema('admin').table('userEmailChanges')
        .where({ userId: parsedId.data }).whereNull('consumedAt').whereNull('invalidatedAt')
        .where('expiresAt', '>', trx.fn.now()).orderBy('createdAt', 'desc')
        .first<{ newEmail: string; expiresAt: Date }>('newEmail', 'expiresAt') : undefined;
      const detail = rawDetail === null ? null : adminCustomerUserDetailSchema.parse({
        ...rawDetail,
        pendingEmailChange: pendingRow ? adminCustomerUserPendingEmailChangeSchema.parse({
          maskedNewEmail: maskEmail(pendingRow.newEmail),
          expiresAt: pendingRow.expiresAt.toISOString(),
        }) : null,
        permissions: {
          canSuspend: staffRolePermissions[role].includes('admin.users.suspend'),
          canRevokeSessions: staffRolePermissions[role].includes('admin.users.sessions.revoke'),
          canRequestPasswordReset: staffRolePermissions[role].includes('admin.users.password.reset'),
          canManageEmailVerification: staffRolePermissions[role].includes('admin.users.email.verify'),
          canChangeEmail,
          canRevealPii: staffRolePermissions[role].includes('admin.users.pii.reveal'),
          canReadRelatedAudit: staffRolePermissions[role].includes('admin.audit.related.read'),
        },
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.profile.read',
        targetType: 'customer_user',
        targetId: parsedId.data,
        after: {
          found: detail !== null,
          membershipCount: detail?.user.memberships.length ?? 0,
          authMethodCount: detail?.supplemental.authMethods.length ?? 0,
          sessionCount: detail?.supplemental.totalSessions ?? 0,
          notificationPreferencesRecorded: detail?.supplemental.notificationPreferencesRecorded ?? false,
        },
        userAgent: context.userAgent,
      });
      return detail;
    });
  }

  async function readSessions(identity: CustomerUserManagementIdentity, inputUserId: unknown, context: CustomerUserManagementContext = {}) {
    const parsedId = adminCustomerUserIdSchema.safeParse(inputUserId);
    if (!parsedId.success) throw new CustomerUserManagementError('Invalid customer user ID.');
    return authorized(identity, context, 'admin.users.sessions.revoke', async (trx, role) => {
      const result = adminCustomerUserSessionsResponseSchema.parse(await readAdminCustomerUserSessions(trx, parsedId.data));
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.sessions.read',
        targetType: 'customer_user',
        targetId: parsedId.data,
        after: { sessionCount: result.sessions.length, totalSessions: result.totalSessions },
        userAgent: context.userAgent,
      });
      return result;
    });
  }

  async function revokeSessions(identity: CustomerUserManagementIdentity, input: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminCustomerUserSessionRevocationOperationSchema.safeParse(input);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid customer session-revocation request.');
    return authorized(identity, context, 'admin.users.sessions.revoke', async (trx, role) => {
      const { userId, reason, scope } = parsed.data;
      const result = await revokeUserSessions(trx, {
        userId,
        ...(scope === 'selected' ? { sessionIds: parsed.data.sessionIds } : {}),
        reason,
        actor: { type: 'staff', id: identity.userId },
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.sessions_revoked',
        targetType: 'customer_user',
        targetId: userId,
        reason,
        after: { scope, revoked: result.revoked },
        userAgent: context.userAgent,
      });
      return adminCustomerUserSessionRevocationResultSchema.parse(result);
    });
  }

  async function requestPasswordReset(identity: CustomerUserManagementIdentity, input: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminCustomerUserPasswordResetOperationSchema.safeParse(input);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid password-reset request.');
    const target = await authorized(identity, context, 'admin.users.password.reset', async (trx, role) => {
      const { userId, reason } = parsed.data;
      const resetTarget = await readAdminCustomerUserActionTarget(trx, userId);
      if (!resetTarget) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (resetTarget.deletionPending) {
        throw new CustomerUserManagementError('A user with a pending deletion cannot receive a password reset.', 409);
      }
      if (!resetTarget.hasPassword) {
        throw new CustomerUserManagementError('This customer does not have password sign-in enabled.', 409);
      }
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.password_reset.requested',
        targetType: 'customer_user',
        targetId: userId,
        reason,
        after: { authMethod: 'password' },
        userAgent: context.userAgent,
      });
      return resetTarget;
    });
    await submitCustomerPasswordReset(target.email);
    return adminCustomerUserPasswordResetResultSchema.parse({ requested: true });
  }

  async function resendVerificationEmail(identity: CustomerUserManagementIdentity, value: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminUserEmailVerificationOperationSchema.safeParse(value);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid verification-email request.');
    if (parsed.data.operation !== 'resend') throw new CustomerUserManagementError('Invalid verification-email request.');
    const input = parsed.data;
    const target = await authorized(identity, context, 'admin.users.email.verify', async (trx, role) => {
      const { userId, reason } = input;
      const actionTarget = await readAdminCustomerUserActionTarget(trx, userId);
      if (!actionTarget) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (actionTarget.deletionPending) {
        throw new CustomerUserManagementError('A user with a pending deletion cannot receive a verification email.', 409);
      }
      if (actionTarget.emailVerified) {
        throw new CustomerUserManagementError('This customer email is already verified.', 409);
      }
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.email_verification.resent',
        targetType: 'customer_user',
        targetId: userId,
        reason,
        after: { requested: true },
        userAgent: context.userAgent,
      });
      return actionTarget;
    });
    await submitCustomerVerificationEmail(target.email);
    return adminCustomerUserEmailVerificationResendResultSchema.parse({ requested: true });
  }

  async function rateLimit(trx: Knex.Transaction, identity: CustomerUserManagementIdentity) {
    const key = `staff-actions:${identity.userId}`;
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new CustomerUserManagementError('Too many admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key, key, count, lastRequest: count === 1 ? now : row!.lastRequest,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function targetForAction(trx: Knex.Transaction, userId: string, action: 'suspend' | 'unsuspend') {
    const user = await trx('users').where({ id: userId }).forUpdate()
      .first<{ suspendedAt: Date | null; deletionRequestedAt: Date | null }>('suspendedAt', 'deletionRequestedAt');
    if (!user) throw new CustomerUserManagementError('Customer user not found.', 404);
    if (user.deletionRequestedAt) throw new CustomerUserManagementError('A user with a pending deletion cannot be suspended or unsuspended.', 409);
    if (action === 'suspend' ? user.suspendedAt !== null : user.suspendedAt === null) {
      throw new CustomerUserManagementError('The customer account status changed. Refresh the profile before trying again.', 409);
    }
    return user;
  }

  async function challenge<K extends UserActionChallengeKind>(
    trx: Knex.Transaction,
    identity: CustomerUserManagementIdentity,
    token: string,
    expectedKind: K,
  ): Promise<Extract<UserActionChallenge, { input: { kind: K } }>> {
    if (!/^[\w-]{43}$/.test(token)) throw new CustomerUserManagementError('Invalid account-access verification.', 401);
    const row = await trx.withSchema('admin').table('staffActionChallenges').where({
      id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId,
    }).forUpdate().first<UserActionChallenge>();
    if (!row || row.input.kind !== expectedKind || row.consumedAt ||
      row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new CustomerUserManagementError('Account-access verification expired or was already used. Start again.', 409);
    }
    return row as Extract<UserActionChallenge, { input: { kind: K } }>;
  }

  async function actionMethods(trx: Knex.Transaction, userId: string) {
    const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId }).first('id');
    const totp = await trx.withSchema('admin').table('staffTwoFactors').where({ userId, verified: true }).first('id');
    const methods: ('passkey' | 'totp')[] = [];
    if (keys) methods.push('passkey');
    if (totp) methods.push('totp');
    return methods;
  }

  async function suspensionMethods(identity: CustomerUserManagementIdentity, context: CustomerUserManagementContext = {}) {
    return authorized(identity, context, 'admin.users.suspend', async trx => {
      return adminUserSuspensionMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) });
    });
  }

  async function emailVerificationMethods(identity: CustomerUserManagementIdentity, context: CustomerUserManagementContext = {}) {
    return authorized(identity, context, 'admin.users.email.verify', async trx => (
      adminUserEmailVerificationMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ));
  }

  async function emailChangeMethods(identity: CustomerUserManagementIdentity, context: CustomerUserManagementContext = {}) {
    return authorized(identity, context, 'admin.users.email.change', async trx => (
      adminUserEmailChangeMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ));
  }

  async function startEmailChange(identity: CustomerUserManagementIdentity, value: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminUserEmailChangeOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new CustomerUserManagementError('Invalid customer email-change request.');
    }
    const input = parsed.data;
    return authorized(identity, context, 'admin.users.email.change', async trx => {
      await rateLimit(trx, identity);
      const target = await readAdminCustomerUserActionTarget(trx, input.userId);
      if (!target) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (target.deletionPending) throw new CustomerUserManagementError('Email changes are unavailable while deletion is pending.', 409);
      if (target.email.trim().toLowerCase() === input.email) {
        throw new CustomerUserManagementError('The new address must differ from the current email address.', 400);
      }
      const duplicate = await trx('users').whereRaw('lower(email) = ?', [input.email]).whereNot({ id: input.userId }).first('id');
      if (duplicate) throw new CustomerUserManagementError('That email address is already in use.', 409);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) throw new CustomerUserManagementError('Enroll a passkey or authenticator app before changing a customer email.', 409);
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: keys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'customer_user_email_change',
          userId: input.userId,
          oldEmail: target.email.trim().toLowerCase(),
          newEmail: input.email,
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminUserEmailChangeStartSchema.parse({ token, options, methods });
    });
  }

  async function verifyEmailChangeFactor(
    identity: CustomerUserManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: CustomerUserManagementContext = {},
  ) {
    const result = await authorized(identity, context, 'admin.users.email.change', async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'customer_user_email_change');
      if (row.verifiedAt) throw new CustomerUserManagementError('This email-change step-up is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Email-change step-up expired. Start a new review.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    });
    if ('error' in result && typeof result.error === 'string') throw new CustomerUserManagementError(result.error, 422);
    return adminCustomerUserEmailChangeVerifiedSchema.parse(result);
  }

  async function startSuspension(identity: CustomerUserManagementIdentity, value: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminUserSuspensionOperationSchema.safeParse(value);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid account-access request.');
    if (parsed.data.operation !== 'start') throw new CustomerUserManagementError('Invalid account-access request.');
    const input = parsed.data;
    const result = await authorized(identity, context, 'admin.users.suspend', async trx => {
      await rateLimit(trx, identity);
      await targetForAction(trx, input.userId, input.action);
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId }).select<{ credentialID: string }[]>('credentialID');
      const methods = await actionMethods(trx, identity.userId);
      if (methods.length === 0) throw new CustomerUserManagementError('Enroll a passkey or authenticator app before changing customer access.', 409);
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID, userVerification: 'required',
        allowCredentials: keys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: { kind: 'customer_user_suspension', userId: input.userId, action: input.action, reason: input.reason },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return { token, options };
    });
    return result;
  }

  async function verifySuspensionFactor(identity: CustomerUserManagementIdentity, token: string, factor: AdminActionFactor, context: CustomerUserManagementContext = {}) {
    const result = await authorized(identity, context, 'admin.users.suspend', async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'customer_user_suspension');
      if (row.verifiedAt) throw new CustomerUserManagementError('This account-access verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Account-access verification expired. Start a new review.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    });
    if ('error' in result && typeof result.error === 'string') throw new CustomerUserManagementError(result.error, 422);
    return result;
  }

  async function commitSuspension(identity: CustomerUserManagementIdentity, token: string, context: CustomerUserManagementContext = {}) {
    return authorized(identity, context, 'admin.users.suspend', async (trx, role) => {
      const row = await challenge(trx, identity, token, 'customer_user_suspension');
      if (!row.verifiedAt) throw new CustomerUserManagementError('Verify your second factor before confirming this account action.', 409);
      const user = await targetForAction(trx, row.input.userId, row.input.action);
      const actor = { type: 'staff' as const, id: identity.userId };
      const result = row.input.action === 'suspend'
        ? await suspendUser(trx, { userId: row.input.userId, reason: row.input.reason, actor })
        : await unsuspendUser(trx, { userId: row.input.userId, reason: row.input.reason, actor });
      if (!result.changed) throw new CustomerUserManagementError('The customer account status changed. Refresh the profile before trying again.', 409);
      const after = await trx('users').where({ id: row.input.userId }).first<{ suspendedAt: Date | null }>('suspendedAt');
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: row.input.action === 'suspend' ? 'customer.user.suspended' : 'customer.user.unsuspended',
        targetType: 'customer_user',
        targetId: row.input.userId,
        reason: row.input.reason,
        before: { suspendedAt: user.suspendedAt?.toISOString() ?? null },
        after: { suspendedAt: after?.suspendedAt?.toISOString() ?? null, sessionsRevoked: row.input.action === 'suspend' },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminUserSuspensionResultSchema.parse({
        action: row.input.action,
        changed: true,
        suspendedAt: after?.suspendedAt?.toISOString() ?? null,
      });
    });
  }

  async function startEmailVerification(identity: CustomerUserManagementIdentity, value: unknown, context: CustomerUserManagementContext = {}) {
    const parsed = adminUserEmailVerificationOperationSchema.safeParse(value);
    if (!parsed.success) throw new CustomerUserManagementError('Invalid email-verification request.');
    if (parsed.data.operation !== 'start') throw new CustomerUserManagementError('Invalid email-verification request.');
    const input = parsed.data;
    return authorized(identity, context, 'admin.users.email.verify', async trx => {
      await rateLimit(trx, identity);
      const target = await readAdminCustomerUserActionTarget(trx, input.userId);
      if (!target) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (target.deletionPending) throw new CustomerUserManagementError('Email verification is unavailable while deletion is pending.', 409);
      if (target.emailVerified) throw new CustomerUserManagementError('This customer email is already verified.', 409);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) throw new CustomerUserManagementError('Enroll a passkey or authenticator app before marking an email verified.', 409);
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: keys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: { kind: 'customer_user_email_verification', userId: input.userId, reason: input.reason },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminUserEmailVerificationStartSchema.parse({ token, options, methods });
    });
  }

  async function verifyEmailVerificationFactor(
    identity: CustomerUserManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: CustomerUserManagementContext = {},
  ) {
    const result = await authorized(identity, context, 'admin.users.email.verify', async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'customer_user_email_verification');
      if (row.verifiedAt) throw new CustomerUserManagementError('This email-verification step-up is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) return { error: 'Email-verification step-up expired. Start a new review.' };
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    });
    if ('error' in result && typeof result.error === 'string') throw new CustomerUserManagementError(result.error, 422);
    return adminCustomerUserEmailVerificationVerifiedSchema.parse(result);
  }

  async function commitEmailVerified(identity: CustomerUserManagementIdentity, token: string, context: CustomerUserManagementContext = {}) {
    return authorized(identity, context, 'admin.users.email.verify', async (trx, role) => {
      const row = await challenge(trx, identity, token, 'customer_user_email_verification');
      if (!row.verifiedAt) throw new CustomerUserManagementError('Verify your second factor before marking the email verified.', 409);
      const target = await trx('users').where({ id: row.input.userId }).forUpdate()
        .first<{ emailVerified: boolean; deletionRequestedAt: Date | null }>('emailVerified', 'deletionRequestedAt');
      if (!target) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (target.deletionRequestedAt) {
        throw new CustomerUserManagementError('Email verification is unavailable while deletion is pending.', 409);
      }
      if (target.emailVerified) {
        throw new CustomerUserManagementError('The customer email status changed. Refresh the profile before trying again.', 409);
      }
      const result = await markEmailVerified(trx, {
        userId: row.input.userId,
        reason: row.input.reason,
        actor: { type: 'staff', id: identity.userId },
      });
      if (!result.changed) throw new CustomerUserManagementError('The customer email status changed. Refresh the profile before trying again.', 409);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.email_verified',
        targetType: 'customer_user',
        targetId: row.input.userId,
        reason: row.input.reason,
        before: { emailVerified: false },
        after: { emailVerified: true },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminCustomerUserEmailVerificationResultSchema.parse({ changed: true });
    });
  }

  async function commitEmailChange(identity: CustomerUserManagementIdentity, token: string, context: CustomerUserManagementContext = {}) {
    const delivery = await authorized(identity, context, 'admin.users.email.change', async (trx, role) => {
      const row = await challenge(trx, identity, token, 'customer_user_email_change');
      if (!row.verifiedAt) throw new CustomerUserManagementError('Verify your second factor before requesting an email change.', 409);
      if (role !== 'super_admin') throw new CustomerUserManagementError('Only Super Admin can change customer email addresses.', 403);
      const target = await trx('users').where({ id: row.input.userId }).forUpdate()
        .first<{ email: string; emailVerified: boolean; deletionRequestedAt: Date | null }>(
          'email', 'emailVerified', 'deletionRequestedAt',
        );
      if (!target) throw new CustomerUserManagementError('Customer user not found.', 404);
      if (target.deletionRequestedAt) throw new CustomerUserManagementError('Email changes are unavailable while deletion is pending.', 409);
      if (target.email.trim().toLowerCase() !== row.input.oldEmail ||
          target.email.trim().toLowerCase() === row.input.newEmail) {
        throw new CustomerUserManagementError('The customer email changed. Refresh the profile before trying again.', 409);
      }
      const duplicate = await trx('users').whereRaw('lower(email) = ?', [row.input.newEmail])
        .whereNot({ id: row.input.userId }).first('id');
      if (duplicate) throw new CustomerUserManagementError('That email address is already in use.', 409);

      const now = new Date();
      const requestId = randomUUID();
      const expiresAt = new Date(now.getTime() + emailChangeLifetime);
      const emailToken = randomBytes(32).toString('base64url');
      await trx.withSchema('admin').table('userEmailChanges')
        .where({ userId: row.input.userId }).whereNull('consumedAt').whereNull('invalidatedAt')
        .update({ invalidatedAt: now });
      await trx.withSchema('admin').table('userEmailChanges').insert({
        id: requestId,
        tokenHash: adminEmailChangeTokenHash(emailToken),
        userId: row.input.userId,
        oldEmail: target.email,
        newEmail: row.input.newEmail,
        reason: row.input.reason,
        requestedBy: identity.userId,
        staffRole: role,
        requestId,
        createdAt: now,
        expiresAt,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'customer.user.email_change.requested',
        targetType: 'customer_user',
        targetId: row.input.userId,
        reason: row.input.reason,
        requestId,
        before: { emailVerified: target.emailVerified },
        after: { verificationRequired: true, expiresAt: expiresAt.toISOString() },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: now });
      return {
        requestId,
        oldEmail: target.email,
        newEmail: row.input.newEmail,
        token: emailToken,
        expiresAt,
      };
    });
    await submitCustomerEmailChange(delivery);
    return adminCustomerUserEmailChangeResultSchema.parse({
      requested: true,
      maskedNewEmail: maskEmail(delivery.newEmail),
      expiresAt: delivery.expiresAt.toISOString(),
    });
  }

  return {
    readDirectory, readProfile, revealPii, readRelatedStaffActions, readSessions, revokeSessions, requestPasswordReset,
    resendVerificationEmail, emailVerificationMethods, startEmailVerification,
    verifyEmailVerificationFactor, commitEmailVerified,
    emailChangeMethods, startEmailChange, verifyEmailChangeFactor, commitEmailChange,
    suspensionMethods, startSuspension, verifySuspensionFactor, commitSuspension,
  };
}

export const customerUserManagement = createCustomerUserManagementService(customerUserManagementDatabase);

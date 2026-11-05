import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import {
  adminWorkspaceExportMethodsResponseSchema,
  adminWorkspaceExportChallengeInputSchema,
  adminWorkspaceExportOperationSchema,
  adminWorkspaceExportRequestRecordSchema,
  adminWorkspaceExportsResponseSchema,
  adminWorkspaceExportStartResponseSchema,
  adminWorkspaceExportVerifiedResponseSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminWorkspaceExportRequestRecord,
  type AdminWorkspaceExportsResponse,
} from '@salesmora/contracts';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import type { Knex } from '@salesmora/data/database';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { auth } from './auth';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { AdminDataRequestsError, adminDataRequestsDatabase, type AdminDataRequestsIdentity } from './admin-data-requests';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

const challengeKind = 'workspace_data_export';
const challengeLifetime = 5 * 60 * 1000;

interface AdminWorkspaceExportContext {
  userAgent?: string | null;
}

interface ExportChallengeInput {
  kind: typeof challengeKind;
  workspaceId: string;
  reason: string;
  method: 'totp' | 'passkey';
}

interface ExportChallenge {
  id: string;
  input: ExportChallengeInput;
  challenge: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  attempts: number;
}

interface WorkspaceExportTarget {
  id: string;
  businessName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

function maskEmail(email: string) {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) throw new Error('Workspace Owner email is malformed.');
  return `${email.slice(0, Math.min(2, separator))}••••@${email.slice(separator + 1)}`;
}

function isoDate(value: Date | string | null) {
  return value === null ? null : new Date(value).toISOString();
}

function exportRequestRecord(row: {
  id: string;
  workspaceId: string;
  workspaceName: string;
  ownerName: string;
  maskedOwnerEmail: string;
  requestedByName: string;
  requestedByRole: 'super_admin' | 'support';
  reason: string;
  state: 'queued' | 'generating' | 'ready' | 'expired' | 'failed';
  requestedAt: Date | string;
  expiresAt: Date | string | null;
  csvCount: number | null;
  fileMetadataCount: number | null;
  downloadedAt: Date | string | null;
  notificationStatus: 'pending' | 'sent' | 'failed';
  notificationAttempts: number;
  notificationSentAt: Date | string | null;
}): AdminWorkspaceExportRequestRecord {
  return adminWorkspaceExportRequestRecordSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    workspaceName: row.workspaceName,
    ownerName: row.ownerName,
    maskedOwnerEmail: row.maskedOwnerEmail,
    requestedByName: row.requestedByName,
    requestedByRole: row.requestedByRole,
    reason: row.reason,
    state: row.state,
    notificationStatus: row.notificationStatus,
    notificationAttempts: row.notificationAttempts,
    notificationSentAt: isoDate(row.notificationSentAt),
    requestedAt: isoDate(row.requestedAt),
    expiresAt: isoDate(row.expiresAt),
    csvCount: row.csvCount,
    fileMetadataCount: row.fileMetadataCount,
    downloadedAt: isoDate(row.downloadedAt),
  });
}

export function createAdminWorkspaceExportService(db: Knex) {
  async function authorized<T>(
    identity: AdminDataRequestsIdentity,
    context: AdminWorkspaceExportContext,
    callback: (
      trx: Knex.Transaction,
      role: 'super_admin' | 'support',
      staffName: string,
    ) => Promise<T>,
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '10s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers')
        .where({ id: identity.userId }).forShare()
        .first<{ email: string; name: string; disabledAt: Date | null }>('email', 'name', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions')
        .where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }

      const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes('admin.data.requests.export') ||
        (role.data !== 'super_admin' && role.data !== 'support')) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'data.requests.export.access_denied',
          targetType: 'workspace_export_request',
          targetId: 'step_up',
          after: { permission: 'admin.data.requests.export', assignedRole: role.success ? role.data : null },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }

      const value = await callback(trx, role.data, staff.name);
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminDataRequestsError('Your admin session expired during the request. Sign in again.', 401);
      }
      return { denied: false as const, value };
    });

    if (result.denied) {
      throw new AdminDataRequestsError(
        result.denied === 401
          ? 'Sign in with your verified staff identity.'
          : 'Your current role cannot request workspace exports.',
        result.denied,
      );
    }
    return result.value;
  }

  async function rateLimit(trx: Knex.Transaction, identity: AdminDataRequestsIdentity) {
    const key = `staff-actions:${identity.userId}`;
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new AdminDataRequestsError('Too many admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key,
      key,
      count,
      lastRequest: count === 1 ? now : row?.lastRequest ?? now,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function activeFactorMethods(trx: Knex.Transaction, userId: string) {
    const keys = await trx.withSchema('admin').table('staffPasskeys')
      .where({ userId }).select<{ credentialID: string }[]>('credentialID');
    const totp = await trx.withSchema('admin').table('staffTwoFactors')
      .where({ userId, verified: true }).first('id');
    return { keys, methods: [
      ...(keys.length ? ['passkey' as const] : []),
      ...(totp ? ['totp' as const] : []),
    ] };
  }

  async function workspaceTarget(trx: Knex.Transaction, workspaceId: string): Promise<WorkspaceExportTarget> {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{ id: string; businessName: string; ownerId: string; deletionRequestedAt: Date | null; suspendedAt: Date | null }>(
        'id', 'businessName', 'ownerId', 'deletionRequestedAt', 'suspendedAt',
      );
    if (!workspace || workspace.deletionRequestedAt || workspace.suspendedAt) {
      throw new AdminDataRequestsError('The workspace is unavailable for export.', 409);
    }
    const owner = await trx('users').where({ id: workspace.ownerId }).forUpdate()
      .first<{ name: string; email: string; emailVerified: boolean; deletionRequestedAt: Date | null }>(
        'name', 'email', 'emailVerified', 'deletionRequestedAt',
      );
    if (!owner || !owner.emailVerified || owner.deletionRequestedAt) {
      throw new AdminDataRequestsError('The workspace does not have a currently verified, eligible Owner.', 409);
    }
    const ownerMembership = await trx('workspaceMemberships')
      .where({ workspaceId: workspace.id, userId: workspace.ownerId, role: 'owner' }).first('workspaceId');
    if (!ownerMembership) {
      throw new AdminDataRequestsError('The workspace does not have a currently verified, eligible Owner.', 409);
    }
    return {
      id: workspace.id,
      businessName: workspace.businessName,
      ownerId: workspace.ownerId,
      ownerName: owner.name,
      ownerEmail: owner.email,
    };
  }

  async function methods(identity: AdminDataRequestsIdentity, context: AdminWorkspaceExportContext = {}) {
    return authorized(identity, context, async trx => {
      const { methods: availableMethods } = await activeFactorMethods(trx, identity.userId);
      return adminWorkspaceExportMethodsResponseSchema.parse({ methods: availableMethods });
    });
  }

  async function start(
    identity: AdminDataRequestsIdentity,
    value: unknown,
    context: AdminWorkspaceExportContext = {},
  ) {
    const parsed = adminWorkspaceExportOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new AdminDataRequestsError('Invalid workspace export request.');
    }
    const input = parsed.data;
    const result = await authorized(identity, context, async (trx) => {
      if (process.env.ADMIN_WORKSPACE_EXPORTS_ENABLED !== 'true') {
        throw new AdminDataRequestsError('Workspace export processing is disabled until private storage and the export key are configured.', 503);
      }
      await rateLimit(trx, identity);
      const account = await trx.withSchema('admin').table('staffAccounts')
        .where({ userId: identity.userId, providerId: 'credential' })
        .first<{ password: string }>('password');
      if (!account?.password || !await (await auth.$context).password.verify({
        password: input.password,
        hash: account.password,
      })) {
        return { error: 'Staff password verification failed.' };
      }
      const { keys, methods: availableMethods } = await activeFactorMethods(trx, identity.userId);
      if (!availableMethods.includes(input.method)) {
        return { error: 'That second factor is not enrolled for this staff account.' };
      }
      const target = await workspaceTarget(trx, input.workspaceId);
      const options = input.method === 'passkey' ? await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: keys.map(key => ({ id: key.credentialID })),
      }) : undefined;
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt')
        .whereRaw('"input"->>\'kind\' = ?', [challengeKind])
        .update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: challengeKind,
          workspaceId: target.id,
          reason: input.reason,
          method: input.method,
        } satisfies ExportChallengeInput,
        challenge: options?.challenge ?? randomBytes(32).toString('base64url'),
        createdAt: now,
        expiresAt: new Date(now.getTime() + challengeLifetime),
      });
      return { token, ...(options ? { options } : {}) };
    });
    if ('error' in result && typeof result.error === 'string') {
      throw new AdminDataRequestsError(result.error, 401);
    }
    return adminWorkspaceExportStartResponseSchema.parse(result);
  }

  async function challenge(
    trx: Knex.Transaction,
    identity: AdminDataRequestsIdentity,
    token: string,
  ): Promise<ExportChallenge> {
    if (!/^[\w-]{43}$/.test(token)) throw new AdminDataRequestsError('Invalid workspace export verification.', 401);
    const row = await trx.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId })
      .forUpdate().first<Omit<ExportChallenge, 'input'> & { input: unknown }>();
    if (!row || row.consumedAt || row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new AdminDataRequestsError('Workspace export verification expired or was already used. Start again.', 401);
    }
    const parsedInput = adminWorkspaceExportChallengeInputSchema.safeParse(row.input);
    if (!parsedInput.success) {
      throw new AdminDataRequestsError('Invalid workspace export verification.', 401);
    }
    return { ...row, input: parsedInput.data };
  }

  async function verifyFactor(
    identity: AdminDataRequestsIdentity,
    value: unknown,
    context: AdminWorkspaceExportContext = {},
  ) {
    const parsed = adminWorkspaceExportOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'factor') {
      throw new AdminDataRequestsError('Invalid workspace export verification.');
    }
    const input = parsed.data;
    const factor: AdminActionFactor = input.method === 'totp'
      ? { method: input.method, code: input.code }
      : { method: input.method, response: input.response satisfies AuthenticationResponseJSON };
    const result = await authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, input.token);
      if (row.verifiedAt) throw new AdminDataRequestsError('Workspace export verification is already complete.', 409);
      if (row.input.method !== input.method) throw new AdminDataRequestsError('The selected second factor does not match this review.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Workspace export verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id })
        .update({ verifiedAt: new Date() });
      return { verified: true as const };
    });
    if ('error' in result && typeof result.error === 'string') {
      throw new AdminDataRequestsError(result.error, 401);
    }
    return adminWorkspaceExportVerifiedResponseSchema.parse(result);
  }

  async function commit(
    identity: AdminDataRequestsIdentity,
    value: unknown,
    context: AdminWorkspaceExportContext = {},
  ): Promise<AdminWorkspaceExportRequestRecord> {
    const parsed = adminWorkspaceExportOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'commit') {
      throw new AdminDataRequestsError('Invalid workspace export confirmation.');
    }
    const input = parsed.data;
    return authorized(identity, context, async (trx, role, staffName) => {
      if (process.env.ADMIN_WORKSPACE_EXPORTS_ENABLED !== 'true') {
        throw new AdminDataRequestsError('Workspace export processing is disabled until private storage and the export key are configured.', 503);
      }
      const row = await challenge(trx, identity, input.token);
      if (!row.verifiedAt) throw new AdminDataRequestsError('Verify your second factor before requesting an export.', 401);
      const target = await workspaceTarget(trx, row.input.workspaceId);
      if (row.expiresAt.getTime() <= Date.now()) {
        throw new AdminDataRequestsError('Workspace export verification expired. Start a new review.', 401);
      }
      const id = randomUUID();
      const requestedAt = new Date();
      const requestValues = {
        id,
        workspaceId: target.id,
        workspaceName: target.businessName,
        ownerUserId: target.ownerId,
        ownerName: target.ownerName,
        maskedOwnerEmail: maskEmail(target.ownerEmail),
        requestedBy: identity.userId,
        requestedByName: staffName,
        requestedByRole: role,
        reason: row.input.reason,
        state: 'queued' as const,
        notificationStatus: 'pending' as const,
        notificationAttempts: 0,
        notificationSentAt: null,
        requestedAt,
        updatedAt: requestedAt,
        expiresAt: null,
        csvCount: null,
        fileMetadataCount: null,
        downloadedAt: null,
      };
      await trx.withSchema('admin').table('workspaceExportRequests').insert(requestValues);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'data.requests.export.requested',
        targetType: 'workspace_export_request',
        targetId: id,
        workspaceId: target.id,
        reason: row.input.reason,
        after: { state: 'queued', factor: row.input.method },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ id: row.id }).update({ consumedAt: new Date() });
      return exportRequestRecord(requestValues);
    });
  }

  async function read(
    identity: AdminDataRequestsIdentity,
    context: AdminWorkspaceExportContext = {},
  ): Promise<AdminWorkspaceExportsResponse> {
    return authorized(identity, context, async (trx, role) => {
      const requestRows = await trx.withSchema('admin').table('workspaceExportRequests')
        .orderBy('requestedAt', 'desc').orderBy('id', 'desc').limit(50)
        .select([
          'id', 'workspaceId', 'workspaceName', 'ownerName', 'maskedOwnerEmail',
          'requestedByName', 'requestedByRole', 'reason', 'state', 'notificationStatus',
          'notificationAttempts', 'notificationSentAt', 'requestedAt', 'expiresAt',
          'csvCount', 'fileMetadataCount', 'downloadedAt',
        ]);
      const workspaceRows = await trx('workspaces as w')
        .join('users as u', 'u.id', 'w.ownerId')
        .join('workspaceMemberships as m', function joinOwner() {
          this.on('m.workspaceId', 'w.id').andOn('m.userId', 'u.id');
        })
        .where('m.role', 'owner')
        .where('u.emailVerified', true)
        .whereNull('u.deletionRequestedAt')
        .whereNull('u.suspendedAt')
        .whereNull('w.deletionRequestedAt')
        .whereNull('w.suspendedAt')
        .orderBy('w.businessName', 'asc').orderBy('w.id', 'asc').limit(1000)
        .select<{ id: string; name: string; ownerName: string; ownerEmail: string }[]>([
          'w.id', 'w.businessName as name', 'u.name as ownerName', 'u.email as ownerEmail',
        ]);
      const { methods } = await activeFactorMethods(trx, identity.userId);
      const response = adminWorkspaceExportsResponseSchema.parse({
        role,
        enabled: process.env.ADMIN_WORKSPACE_EXPORTS_ENABLED === 'true',
        exports: requestRows.map(row => exportRequestRecord(row)),
        workspaces: workspaceRows.map(row => ({
          id: row.id,
          name: row.name,
          ownerName: row.ownerName,
          maskedOwnerEmail: maskEmail(row.ownerEmail),
        })),
        methods,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'data.requests.export_queue.read',
        targetType: 'workspace_export_request',
        targetId: 'list',
        after: { resultCount: response.exports.length, eligibleWorkspaceCount: response.workspaces.length },
        userAgent: context.userAgent,
      });
      return response;
    });
  }

  return { methods, start, verifyFactor, commit, read };
}

export const adminWorkspaceExports = createAdminWorkspaceExportService(adminDataRequestsDatabase);

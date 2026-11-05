import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import {
  staffActionInputSchema, staffRoleIdSchema, staffRolePermissions,
  type StaffActionInput, type StaffManagementSnapshot, type StaffRoleId,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import type { Knex } from '@salesmora/data';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';
import { sendEmail } from '@salesmora/data/email/transport';
import { generateAuthenticationOptions, type AuthenticationResponseJSON } from '@simplewebauthn/server';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { auth } from './auth';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';
import { verifyAdminActionFactor } from './admin-action-factor';

const configuration = getAdminAuthConfiguration();
export const staffManagementDatabase = createDatabase(configuration.databaseUrl);
const WINDOW_MS = 5 * 60 * 1000;
const INVITATION_MS = 24 * 60 * 60 * 1000;

export class StaffManagementError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface StaffActor {
  userId: string;
  sessionId: string;
  accessEmail: string;
}
interface Approval {
  id: string; email: string; requestedBy: string; reason: string; status: 'pending' | 'approved' | 'rejected'; expiresAt: Date;
  accountUserId: string | null; accountKind: 'enable' | 'role_change' | null; accountRole: StaffRoleId | null; accountVersion: number | null;
}
type AccountAction = Extract<StaffActionInput['action'], { userId: string }>;
interface StaffTarget { id: string; email: string; disabledAt: Date | null; accessVersion: number; role: StaffRoleId }
interface Invitation {
  id: string; email: string; role: StaffRoleId; expiresAt: Date; acceptedAt: Date | null; revokedAt: Date | null;
}
interface Challenge {
  id: string; userId: string; sessionId: string; input: StaffActionInput; challenge: string;
  createdAt: Date; expiresAt: Date; verifiedAt: Date | null; consumedAt: Date | null; attempts: number;
}
type AuditContext = { requestId?: string; userAgent?: string | null };
type Failure = { error: string };
const failed = (error: string): Failure => ({ error });

export function createStaffManagementService(
  db: Knex,
  deliver: typeof sendEmail = sendEmail,
) {
  async function actor(trx: Knex.Transaction, identity: StaffActor, permission: 'admin.staff.read' | 'admin.staff.invite' | 'admin.staff.super-admin.grant' | 'admin.staff.disable' | 'admin.staff.role.change' = 'admin.staff.invite') {
    // Staff administration is low-volume; one lock prevents actor/target lock inversions and last-admin races.
    await trx.raw("SELECT pg_advisory_xact_lock(hashtextextended('admin:staff-access', 0))");
    const user = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare().first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
    const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId })
      .forShare().first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
    if (!user || user.disabledAt || user.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
      session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
      throw new StaffManagementError('Your admin session has expired or does not match your Access identity.', 401);
    }
    const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
    const parsed = staffRoleIdSchema.safeParse(assignment?.role);
    if (!parsed.success || !staffRolePermissions[parsed.data].includes(permission)) {
      throw new StaffManagementError('Your current role does not permit staff administration.', 403);
    }
    return parsed.data;
  }

  async function rateLimit(identity: StaffActor) {
    await db.transaction(async trx => {
      await actor(trx, identity);
      const key = `staff-actions:${identity.userId}`;
      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
      const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
        .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
      const now = Date.now();
      if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
        throw new StaffManagementError('Too many staff verification attempts. Try again in 15 minutes.', 429);
      }
      const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
      await trx.withSchema('admin').table('staffRateLimits').insert({
        id: key, key, count, lastRequest: count === 1 ? now : row!.lastRequest,
      }).onConflict('key').merge(['count', 'lastRequest']);
    });
  }

  async function audit(trx: Knex.Transaction, identity: StaffActor, role: StaffRoleId, action: string,
    targetId: string, input: StaffActionInput, context: AuditContext = {}, details: Record<string, unknown> = {}) {
    await appendAdminAuditEvent(trx, {
      staffUserId: identity.userId, staffRole: role, action, targetType: action.startsWith('staff.account.') ? 'staff_user' : action.startsWith('staff.super_admin.') ? 'staff_approval' : 'staff_invitation',
      targetId, reason: input.reason, after: { ...input.action, decision: input.decision, ...details }, ...context,
    });
  }

  async function accountTarget(trx: Knex.Transaction, identity: StaffActor, action: AccountAction) {
    await actor(trx, identity, action.kind === 'role_change' ? 'admin.staff.role.change' : 'admin.staff.disable');
    if (action.userId === identity.userId) throw new StaffManagementError('You cannot change your own staff access.', 403);
    const user = await trx.withSchema('admin').table('staffUsers').where({ id: action.userId })
      .forUpdate().first<{ id: string; email: string; disabledAt: Date | null; accessVersion: number }>();
    const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: action.userId }).whereNull('revokedAt').forUpdate().first<{ role: string }>();
    const parsed = staffRoleIdSchema.safeParse(assignment?.role);
    if (!user || !parsed.success || user.accessVersion !== action.expectedVersion) {
      throw new StaffManagementError('The staff account changed. Refresh and review it again.', 409);
    }
    if (action.kind === 'enable' ? !user.disabledAt : Boolean(user.disabledAt)) {
      throw new StaffManagementError('The staff account status changed. Refresh and review it again.', 409);
    }
    if (action.kind === 'role_change' && action.role === parsed.data) throw new StaffManagementError('Choose a different staff role.', 409);
    if ((action.kind === 'enable' && parsed.data === 'super_admin') || (action.kind === 'role_change' && action.role === 'super_admin')) {
      await actor(trx, identity, 'admin.staff.super-admin.grant');
    }
    if (parsed.data === 'super_admin' && (action.kind === 'disable' || (action.kind === 'role_change' && action.role !== 'super_admin'))) {
      const active = await trx.withSchema('admin').table('staffRoleAssignments as r')
        .join('staffUsers as u', 'u.id', 'r.userId').where({ 'r.role': 'super_admin' }).whereNull('r.revokedAt').whereNull('u.disabledAt').count<{ count: string }[]>('* as count');
      if (Number(active[0].count) <= 1) throw new StaffManagementError('The last active Super Admin cannot be disabled or demoted.', 409);
    }
    return { ...user, role: parsed.data };
  }

  function approvalAction(request: Approval): AccountAction | null {
    if (!request.accountUserId || !request.accountKind || request.accountVersion === null) return null;
    return request.accountKind === 'enable'
      ? { kind: 'enable', userId: request.accountUserId, expectedVersion: request.accountVersion }
      : { kind: 'role_change', userId: request.accountUserId, role: 'super_admin', expectedVersion: request.accountVersion };
  }

  async function applyAccount(trx: Knex.Transaction, identity: StaffActor, action: AccountAction, target: StaffTarget) {
    const now = new Date();
    if (action.kind === 'role_change') {
      await trx.withSchema('admin').table('staffRoleAssignments').where({ userId: target.id }).whereNull('revokedAt').update({ revokedAt: now });
      await trx.withSchema('admin').table('staffRoleAssignments').insert({
        id: randomUUID(), userId: target.id, role: action.role, grantedBy: identity.userId, grantedAt: now,
      });
    }
    await trx.withSchema('admin').table('staffUsers').where({ id: target.id }).update({
      disabledAt: action.kind === 'disable' ? now : null, accessChangedAt: now, accessVersion: target.accessVersion + 1, updatedAt: now,
    });
    await trx.withSchema('admin').table('staffSessions').where({ userId: target.id }).delete();
    await trx.withSchema('admin').table('staffVerifications').where({ value: target.id }).delete();
  }

  async function eligible(trx: Knex.Transaction, identity: StaffActor, input: StaffActionInput) {
    const action = input.action;
    await actor(trx, identity);
    if (action.kind === 'disable' || action.kind === 'enable' || action.kind === 'role_change') {
      if (input.decision !== 'approve') throw new StaffManagementError('Invalid account change decision.');
      await accountTarget(trx, identity, action);
      return;
    }
    if (action.kind === 'invite') {
      if (input.decision !== 'approve') throw new StaffManagementError('Invalid invitation decision.');
      if (action.role === 'super_admin') await actor(trx, identity, 'admin.staff.super-admin.grant');
      return;
    }
    if (action.kind === 'revoke') {
      const invitation = await trx.withSchema('admin').table('staffInvitations').where({ id: action.invitationId }).forUpdate().first<Invitation>();
      if (!invitation || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt.getTime() <= Date.now()) {
        throw new StaffManagementError('This invitation is no longer pending.', 409);
      }
      return;
    }
    await actor(trx, identity, 'admin.staff.super-admin.grant');
    const approval = await trx.withSchema('admin').table('approvalRequests').where({ id: action.requestId }).forUpdate().first<Approval>();
    if (!approval || approval.status !== 'pending' || approval.expiresAt.getTime() <= Date.now()) {
      throw new StaffManagementError('This approval request is expired or already decided.', 409);
    }
    if (approval.requestedBy === identity.userId) throw new StaffManagementError('A different authorized staff member must decide this request.', 403);
    const requester = await trx.withSchema('admin').table('staffUsers').where({ id: approval.requestedBy }).first<{ disabledAt: Date | null }>();
    if (!requester || requester.disabledAt) throw new StaffManagementError('The requester is no longer authorized. Create a new request.', 409);
    const requesterRole = await trx.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: approval.requestedBy }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
    const parsed = staffRoleIdSchema.safeParse(requesterRole?.role);
    if (!parsed.success || !staffRolePermissions[parsed.data].includes('admin.staff.super-admin.grant')) {
      throw new StaffManagementError('The requester is no longer authorized. Create a new request.', 409);
    }
    const account = approvalAction(approval);
    if (account) await accountTarget(trx, identity, account);
  }

  async function challenge(trx: Knex.Transaction, identity: StaffActor, token: string) {
    await actor(trx, identity);
    const row = await trx.withSchema('admin').table('staffActionChallenges').where({
      id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId,
    }).forUpdate().first<Challenge>();
    if (!row || row.consumedAt || row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new StaffManagementError('Verification expired or was already used. Start again.', 401);
    }
    const parsed = staffActionInputSchema.safeParse(row.input);
    if (!parsed.success) throw new StaffManagementError('This verification belongs to another action. Start again.', 401);
    row.input = parsed.data;
    await eligible(trx, identity, row.input);
    return row;
  }

  async function start(identity: StaffActor, inputValue: unknown, password: string) {
    const parsed = staffActionInputSchema.safeParse(inputValue);
    if (!parsed.success || !password || password.length > 128) throw new StaffManagementError('Invalid staff access request.');
    await rateLimit(identity);
    const result = await db.transaction(async trx => {
      await eligible(trx, identity, parsed.data);
      const account = await trx.withSchema('admin').table('staffAccounts')
        .where({ userId: identity.userId, providerId: 'credential' }).first<{ password: string }>('password');
      if (!account?.password || !await (await auth.$context).password.verify({ password, hash: account.password })) {
        return failed('Password verification failed.');
      }
      const keys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId }).select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: configuration.rpID, userVerification: 'required',
        allowCredentials: keys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token), userId: identity.userId, sessionId: identity.sessionId,
        input: parsed.data, challenge: options.challenge, createdAt: now, expiresAt: new Date(now.getTime() + WINDOW_MS),
      });
      return { token, options };
    });
    if ('error' in result) throw new StaffManagementError(result.error, 401);
    return result;
  }

  async function verifyFactor(identity: StaffActor, token: string, factor:
    { method: 'totp'; code: string } | { method: 'passkey'; response: AuthenticationResponseJSON }) {
    await rateLimit(identity);
    const result = await db.transaction(async trx => {
      const row = await challenge(trx, identity, token);
      if (row.verifiedAt) throw new StaffManagementError('This verification challenge has already been completed.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      const verified = await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor);
      if (!verified) return failed('Second-factor verification failed or the code was already used.');
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    });
    if ('error' in result) throw new StaffManagementError(result.error, 401);
    return result;
  }

  async function availableEmail(trx: Knex.Transaction, email: string) {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`admin:staff-email:${email}`]);
    if (await trx.withSchema('admin').table('staffUsers').whereRaw('lower(email) = ?', [email]).first('id') ||
      await trx.withSchema('admin').table('staffInvitations').where({ email }).whereNull('acceptedAt').whereNull('revokedAt').where('expiresAt', '>', new Date()).first('id')) {
      throw new StaffManagementError('A staff account or active invitation already exists for this email.', 409);
    }
  }

  async function invitation(trx: Knex.Transaction, identity: StaffActor, email: string, role: StaffRoleId) {
    await availableEmail(trx, email);
    const id = randomUUID();
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    await trx.withSchema('admin').table('staffInvitations').insert({
      id, email, role, invitedBy: identity.userId, tokenHash: invitationTokenHash(token),
      createdAt: now, expiresAt: new Date(now.getTime() + INVITATION_MS),
    });
    await trx.withSchema('admin').table('staffInvitationDeliveries').insert({
      id: randomUUID(), invitationId: id, encryptedToken: await symmetricEncrypt({ key: configuration.secret, data: token }),
    });
    return id;
  }

  async function commit(identity: StaffActor, token: string, context: AuditContext = {}) {
    const result = await db.transaction(async trx => {
      const row = await challenge(trx, identity, token);
      if (!row.verifiedAt) throw new StaffManagementError('Verify your password and second factor before confirming.', 403);
      const role = await actor(trx, identity);
      const { action } = row.input;
      let invitationId: string | null = null;
      let targetId: string;
      let event: string;
      let approvalExpiresAt: Date | null = null;
      let details: Record<string, unknown> = {};
      if (action.kind === 'disable' || action.kind === 'enable' || action.kind === 'role_change') {
        const target = await accountTarget(trx, identity, action);
        details = { userId: target.id, previousRole: target.role, previousDisabled: Boolean(target.disabledAt), previousVersion: target.accessVersion };
        if (action.kind !== 'disable' && (action.kind === 'role_change' ? action.role : target.role) === 'super_admin') {
          const pending = await trx.withSchema('admin').table('approvalRequests').where({ accountUserId: target.id, accountVersion: target.accessVersion, status: 'pending' })
            .where('expiresAt', '>', new Date()).first('id');
          if (pending) throw new StaffManagementError('An approval request is already pending for this account.', 409);
          targetId = randomUUID();
          const now = new Date();
          await trx.withSchema('admin').table('approvalRequests').insert({
            id: targetId, email: target.email, requestedBy: identity.userId, reason: row.input.reason,
            createdAt: now, expiresAt: new Date(now.getTime() + WINDOW_MS), accountUserId: target.id,
            accountKind: action.kind, accountRole: target.role, accountVersion: target.accessVersion,
          });
          event = 'staff.super_admin.approval_requested';
        } else {
          await applyAccount(trx, identity, action, target);
          details = { ...details, role: action.kind === 'role_change' ? action.role : target.role, disabled: action.kind === 'disable', version: target.accessVersion + 1 };
          targetId = target.id;
          event = `staff.account.${action.kind === 'disable' ? 'disabled' : action.kind === 'enable' ? 'enabled' : 'role_changed'}`;
        }
      } else if (action.kind === 'invite' && action.role === 'super_admin') {
        await availableEmail(trx, action.email);
        const pending = await trx.withSchema('admin').table('approvalRequests').where({ email: action.email, status: 'pending' })
          .where('expiresAt', '>', new Date()).first('id');
        if (pending) throw new StaffManagementError('An approval request is already pending for this email.', 409);
        targetId = randomUUID();
        const now = new Date();
        await trx.withSchema('admin').table('approvalRequests').insert({
          id: targetId, email: action.email, requestedBy: identity.userId, reason: row.input.reason,
          createdAt: now, expiresAt: new Date(now.getTime() + WINDOW_MS),
        });
        event = 'staff.super_admin.approval_requested';
      } else if (action.kind === 'invite') {
        targetId = invitationId = await invitation(trx, identity, action.email, action.role);
        event = 'staff.invitation.created';
      } else if (action.kind === 'revoke') {
        targetId = action.invitationId;
        await trx.withSchema('admin').table('staffInvitations').where({ id: targetId }).update({ revokedAt: new Date() });
        await trx.withSchema('admin').table('staffInvitationDeliveries').where({ invitationId: targetId }).update({ encryptedToken: null });
        event = 'staff.invitation.revoked';
      } else {
        targetId = action.requestId;
        const request = await trx.withSchema('admin').table('approvalRequests').where({ id: targetId }).first<Approval>();
        if (!request) throw new StaffManagementError('Approval request not found.', 404);
        approvalExpiresAt = request.expiresAt;
        const account = approvalAction(request);
        if (account) details = { userId: account.userId, kind: account.kind, previousRole: request.accountRole, previousVersion: request.accountVersion };
        if (row.input.decision === 'approve') {
          if (account) {
            const target = await accountTarget(trx, identity, account);
            await applyAccount(trx, identity, account, target);
            await audit(trx, identity, role, account.kind === 'enable' ? 'staff.account.enabled' : 'staff.account.role_changed', target.id,
              row.input, context, { requestId: request.id, previousRole: target.role, role: 'super_admin', previousVersion: target.accessVersion });
          } else invitationId = await invitation(trx, identity, request.email, 'super_admin');
        }
        await trx.withSchema('admin').table('approvalRequests').where({ id: targetId }).update({
          status: row.input.decision === 'approve' ? 'approved' : 'rejected', decidedBy: identity.userId, decidedAt: new Date(),
        });
        event = `staff.super_admin.${row.input.decision === 'approve' ? 'approved' : 'rejected'}`;
        if (invitationId) await audit(trx, identity, role, 'staff.invitation.created', invitationId, row.input, context);
      }
      // Recheck the deadline after awaited work, not only when the transaction started.
      if (row.expiresAt.getTime() <= Date.now() || (approvalExpiresAt && approvalExpiresAt.getTime() <= Date.now())) {
        throw new StaffManagementError('Verification or approval expired. Start again.', 401);
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      await audit(trx, identity, role, event, targetId, row.input, context, { ...details, ...(invitationId ? { invitationId } : {}) });
      if (row.expiresAt.getTime() <= Date.now() || (approvalExpiresAt && approvalExpiresAt.getTime() <= Date.now())) {
        throw new StaffManagementError('Verification or approval expired. Start again.', 401);
      }
      return { invitationId, event };
    });
    const delivery = result.invitationId ? await dispatch(identity, result.invitationId) : null;
    return { ...result, delivery };
  }

  async function dispatch(identity: StaffActor, invitationId: string) {
    return db.transaction(async trx => {
      const role = await actor(trx, identity);
      const invite = await trx.withSchema('admin').table('staffInvitations').where({ id: invitationId }).forUpdate().first<Invitation>();
      const delivery = await trx.withSchema('admin').table('staffInvitationDeliveries').where({ invitationId }).forUpdate()
        .first<{ id: string; encryptedToken: string | null; status: string; attempts: number }>();
      if (!invite || !delivery || invite.revokedAt || invite.acceptedAt || invite.expiresAt.getTime() <= Date.now()) {
        throw new StaffManagementError('This invitation cannot be delivered.', 409);
      }
      if (delivery.status === 'sent') return 'sent' as const;
      if (!delivery.encryptedToken) throw new Error('Pending staff invitation has no encrypted delivery token.');
      if (delivery.attempts >= 5) throw new StaffManagementError('Email retry limit reached. Revoke this invitation and create another.', 409);
      const token = await symmetricDecrypt({ key: configuration.secret, data: delivery.encryptedToken });
      const url = new URL('/enroll', configuration.baseURL);
      url.searchParams.set('token', token);
      let sent = false;
      try {
        await deliver({
          to: invite.email, subject: 'Your SalesMora admin invitation',
          text: `You have been invited to SalesMora Admin. Complete password and second-factor enrollment within 24 hours: ${url.href}`,
          html: `<p>You have been invited to SalesMora Admin.</p><p>Complete password and second-factor enrollment within 24 hours.</p><p><a href="${url.href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Accept staff invitation</a></p>`,
          idempotencyKey: `admin-invitation-${delivery.id}`,
        }, configuration.baseURL);
        sent = true;
      } catch {
        console.error('Staff invitation delivery failed.', { invitationId });
      }
      await trx.withSchema('admin').table('staffInvitationDeliveries').where({ id: delivery.id }).update({
        status: sent ? 'sent' : 'failed', attempts: delivery.attempts + 1,
        ...(sent ? { sentAt: new Date(), encryptedToken: null } : {}),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId, staffRole: role, action: `staff.invitation.delivery_${sent ? 'sent' : 'failed'}`,
        targetType: 'staff_invitation', targetId: invitationId,
      });
      return sent ? 'sent' as const : 'failed' as const;
    });
  }

  async function snapshot(identity: StaffActor): Promise<StaffManagementSnapshot> {
    return db.transaction(async trx => {
      const role = await actor(trx, identity, 'admin.staff.read');
      const users = await trx.raw<{ rows: { id: string; name: string; email: string; role: string | null; disabledAt: Date | null; accessVersion: number; passkey: boolean; totp: boolean; lastActive: Date | null }[] }>(`
        SELECT u.id, u.name, u.email, u."disabledAt", u."accessVersion", r.role,
          EXISTS(SELECT 1 FROM admin."staffPasskeys" k WHERE k."userId" = u.id) AS passkey,
          EXISTS(SELECT 1 FROM admin."staffTwoFactors" f WHERE f."userId" = u.id AND f.verified) AS totp,
          (SELECT max(s."updatedAt") FROM admin."staffSessions" s WHERE s."userId" = u.id) AS "lastActive"
        FROM admin."staffUsers" u LEFT JOIN admin."staffRoleAssignments" r ON r."userId" = u.id AND r."revokedAt" IS NULL ORDER BY u."createdAt" DESC`);
      const invites = await trx.withSchema('admin').table('staffInvitations as i')
        .leftJoin('staffInvitationDeliveries as d', 'd.invitationId', 'i.id')
        .orderBy('i.createdAt', 'desc').select<(Invitation & { delivery: 'pending' | 'sent' | 'failed' | null })[]>('i.id', 'i.email', 'i.role', 'i.expiresAt', 'i.acceptedAt', 'i.revokedAt', 'd.status as delivery');
      const requests = await trx.withSchema('admin').table('approvalRequests as a')
        .join('staffUsers as u', 'u.id', 'a.requestedBy').orderBy('a.createdAt', 'desc')
        .select<(Approval & { name: string })[]>('a.id', 'a.email', 'a.requestedBy', 'a.status', 'a.expiresAt', 'a.accountUserId', 'a.accountKind', 'a.accountRole', 'a.accountVersion', 'u.name');
      const current = users.rows.find(user => user.id === identity.userId);
      return {
        reviewer: { id: identity.userId, role },
        methods: [...(current?.passkey ? ['passkey' as const] : []), ...(current?.totp ? ['totp' as const] : [])],
        staff: users.rows.map(user => ({
          id: user.id, name: user.name, email: user.email, role: user.role === null ? null : staffRoleIdSchema.parse(user.role),
          disabled: Boolean(user.disabledAt), version: user.accessVersion,
          factors: [...(user.passkey ? ['Passkey'] : []), ...(user.totp ? ['Authenticator'] : [])], lastActive: user.lastActive?.toISOString() ?? null,
        })),
        invitations: invites.map(invite => ({
          id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt.toISOString(), delivery: invite.delivery,
          status: invite.acceptedAt ? 'accepted' : invite.revokedAt ? 'revoked' : invite.expiresAt.getTime() <= Date.now() ? 'expired' : 'pending',
        })),
        approvals: requests.map(request => ({
          id: request.id, email: request.email, requestedBy: { id: request.requestedBy, name: request.name },
          expiresAt: request.expiresAt.toISOString(),
          accountChange: request.accountUserId && request.accountKind && request.accountRole
            ? { kind: request.accountKind, userId: request.accountUserId, currentRole: request.accountRole } : null,
          status: request.status === 'pending' && request.expiresAt.getTime() <= Date.now() ? 'expired' : request.status,
        })),
      };
    });
  }

  return { start, verifyFactor, commit, dispatch, snapshot };
}

export const staffManagement = createStaffManagementService(staffManagementDatabase);

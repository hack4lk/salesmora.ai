import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { staffEmailSchema, staffEmailDomain } from '@salesmora/contracts';
import { appendAdminAuditEvent } from './admin-audit';
import { newInvitationToken } from './workspaces/invitation-tokens';

export const ADMIN_INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT = 2;

export class AdminInvitationError extends Error {}

function normalizeStaffEmail(value: string) {
  const parsed = staffEmailSchema.safeParse(value);
  if (!parsed.success) {
    throw new AdminInvitationError(`A staff invitation requires a @${staffEmailDomain} email address.`);
  }
  return parsed.data;
}

export async function createBootstrapSuperAdminInvitation(
  db: Knex,
  input: { email: string; now?: Date },
) {
  const email = normalizeStaffEmail(input.email);
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new AdminInvitationError('Invalid invitation timestamp.');
  const expiresAt = new Date(now.getTime() + ADMIN_INVITATION_LIFETIME_MS);

  return db.transaction(async trx => {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', ['admin:bootstrap:super-admin']);
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`admin:staff-email:${email}`]);

    const activeRoles = await trx.raw<{ rows: { email: string }[] }>(`
      SELECT lower(staff."email") AS email
      FROM admin."staffRoleAssignments" AS assignment
      JOIN admin."staffUsers" AS staff ON staff."id" = assignment."userId"
      WHERE assignment."role" = 'super_admin'
        AND assignment."revokedAt" IS NULL
    `);
    const activeSuperAdmins = new Set(activeRoles.rows.map(row => row.email));
    const bootstrapInvitations = await trx.withSchema('admin')
      .table('staffInvitations')
      .whereNull('invitedBy')
      .andWhere({ role: 'super_admin' })
      .select<{ email: string }[]>('email');
    const bootstrapEmails = new Set(bootstrapInvitations.map(invitation => invitation.email.toLowerCase()));
    const pendingSuperAdminInvitations = await trx.withSchema('admin')
      .table('staffInvitations')
      .where({ role: 'super_admin' })
      .whereNull('acceptedAt')
      .whereNull('revokedAt')
      .where('expiresAt', '>', now)
      .select<{ email: string }[]>('email');
    const liveSuperAdminEmails = new Set([
      ...activeSuperAdmins,
      ...pendingSuperAdminInvitations.map(invitation => invitation.email.toLowerCase()),
    ]);

    const existingStaff = await trx.withSchema('admin').table('staffUsers')
      .whereRaw('lower("email") = ?', [email])
      .first('id');
    if (existingStaff) throw new AdminInvitationError('A staff account already exists for this email.');

    const priorInvitations = await trx.withSchema('admin').table('staffInvitations')
      .whereRaw('lower("email") = ?', [email])
      .select('acceptedAt', 'revokedAt', 'expiresAt');
    if (priorInvitations.some(invitation => invitation.acceptedAt)) {
      throw new AdminInvitationError('An invitation for this email has already been accepted.');
    }
    if (priorInvitations.some(invitation =>
      !invitation.revokedAt && new Date(invitation.expiresAt).getTime() > now.getTime())) {
      throw new AdminInvitationError('An active invitation already exists for this email.');
    }
    if (liveSuperAdminEmails.size >= ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT && !liveSuperAdminEmails.has(email)) {
      throw new AdminInvitationError('Two Super Admins are already active or invited.');
    }
    if (bootstrapEmails.size >= ADMIN_BOOTSTRAP_SUPER_ADMIN_LIMIT && !bootstrapEmails.has(email)) {
      throw new AdminInvitationError('The initial Super Admin bootstrap limit has been reached.');
    }

    const { token, tokenHash } = newInvitationToken();
    const invitationId = randomUUID();
    await trx.withSchema('admin').table('staffInvitations').insert({
      id: invitationId,
      email,
      role: 'super_admin',
      tokenHash,
      invitedBy: null,
      createdAt: now,
      expiresAt,
    });
    await appendAdminAuditEvent(trx, {
      staffUserId: null,
      staffRole: 'bootstrap',
      action: 'staff.bootstrap_invitation.created',
      targetType: 'staff_invitation',
      targetId: invitationId,
      after: { role: 'super_admin', expiresAt: expiresAt.toISOString() },
    });
    return { id: invitationId, token, expiresAt };
  });
}

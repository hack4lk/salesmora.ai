import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import type { WorkspaceRole } from '@salesmora/contracts';
import { authorize, normalizeStaffReason } from '@salesmora/domain';
import type { SuspensionActor } from '../accounts/suspension';
import { AuthorizationAccessError, loadWorkspaceAuthorization } from '../authorization/store';
import { PlanCapacityError, assertSeatCapacity } from '../billing/entitlements';
import type { TeamInvitationEmailInput } from '../email/team-invitation';
import { invitationLifetimeMs, invitationURL, newInvitationToken, openInvitationStatuses } from './invitation-tokens';

/** Staff IDs come from the admin console session, never from customer input. */
export type TeamActor = SuspensionActor;
export class TeamActionError extends Error {}
/** Each app sends with its own transport and logo; the template is shared. */
export type SendTeamInvitation = (to: string, input: TeamInvitationEmailInput) => Promise<void>;
export type QueueTeamInvitation = (
  trx: Knex.Transaction,
  delivery: { invitationId: string; tokenHash: string; to: string; input: TeamInvitationEmailInput },
) => Promise<string>;

const resendCooldownMs = 60_000;
const supportName = 'SalesMora support';

function checkActor(actor: TeamActor) {
  if (!actor || !['staff', 'system'].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
    throw new TeamActionError('A valid actor is required.');
  }
}

async function lockWorkspace(trx: Knex.Transaction, workspaceId: string) {
  const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
    .first<{ ownerId: string; businessName: string; suspendedAt: Date | null; deletionRequestedAt: Date | null } | undefined>('ownerId', 'businessName', 'suspendedAt', 'deletionRequestedAt');
  if (!workspace) throw new TeamActionError('Workspace not found.');
  if (workspace.deletionRequestedAt) throw new TeamActionError('This workspace is being deleted.');
  return workspace;
}

async function lockInvitation(trx: Knex.Transaction, invitationId: string) {
  // Workspace first, then the invitation: the same order as invitation acceptance.
  const candidate = await trx('workspaceInvitations').where({ id: invitationId }).first<{ workspaceId: string } | undefined>('workspaceId');
  if (!candidate) throw new TeamActionError('Invitation not found.');
  const workspace = await lockWorkspace(trx, candidate.workspaceId);
  const invitation = await trx('workspaceInvitations').where({ id: invitationId, workspaceId: candidate.workspaceId }).forUpdate()
    .first<{ id: string; workspaceId: string; email: string; role: Exclude<WorkspaceRole, 'owner'>; status: string; inviterId: string | null; lastAttemptAt: Date | null }>();
  if (!invitation) throw new TeamActionError('Invitation not found.');
  return { workspace, invitation };
}

async function audit(trx: Knex.Transaction, workspaceId: string, action: string, actor: TeamActor, details: Record<string, unknown>) {
  const policy = await trx('workspacePolicies').where({ workspaceId }).first<{ revision: number }>('revision');
  await trx('authorizationAudit').insert({ workspaceId, actorId: actor.id, action, beforeRevision: policy.revision, afterRevision: policy.revision,
    afterPolicy: JSON.stringify({ actorType: actor.type, ...details }) });
}

/**
 * Removes a member (W7). Refuses the Owner. Their leads become unassigned, with a lead activity
 * entry each; jobs and work orders clear the assignee through their foreign keys.
 * Pass a transaction as `db` to commit extra rows (such as the admin audit event) atomically.
 */
export async function removeWorkspaceMember(db: Knex, input: { workspaceId: string; userId: string; reason: string; actor: TeamActor }): Promise<{ unassignedLeads: number }> {
  checkActor(input.actor);
  const reason = normalizeStaffReason(input.reason);
  return db.transaction(async trx => {
    // The workspace lock serializes membership changes (the authorization_lock trigger takes it too).
    await lockWorkspace(trx, input.workspaceId);
    const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': input.workspaceId, 'm.userId': input.userId })
      .first<{ role: WorkspaceRole; name: string } | undefined>('m.role', 'u.name');
    if (!member) throw new TeamActionError('This person is not a member of the workspace.');
    if (member.role === 'owner') throw new TeamActionError('The Owner cannot be removed. Transfer ownership first.');
    const leads = await trx('leads').where({ workspaceId: input.workspaceId, ownerId: input.userId }).orderBy('id').forUpdate()
      .select<{ id: string; version: number; ownerName: string | null }[]>('id', 'version', 'ownerName');
    const now = new Date();
    for (const lead of leads) {
      await trx('leads').where({ id: lead.id }).update({ ownerId: null, ownerName: null, version: lead.version + 1, updatedAt: now, lastActivityAt: now });
      await trx('leadActivity').insert({ id: randomUUID(), workspaceId: input.workspaceId, leadId: lead.id, actorId: null, actorName: supportName, actorType: 'system', type: 'assigned',
        changes: JSON.stringify({ from: lead.ownerName ?? member.name, to: null, ownerId: null, toVersion: lead.version + 1 }), createdAt: now });
    }
    await trx('workspaceMemberships').where({ workspaceId: input.workspaceId, userId: input.userId }).delete();
    await audit(trx, input.workspaceId, 'member.removed', input.actor, { reason, member: { userId: input.userId, role: member.role }, unassignedLeads: leads.length });
    return { unassignedLeads: leads.length };
  });
}

/**
 * Sends an open invitation again on the Owner's behalf (W7) with a new link; the previous link stops working.
 * The rules match normal delivery: the Owner's email must be verified, the inviter must still be allowed to
 * invite this role, and the workspace needs a free seat. An app can queue encrypted delivery in the same
 * transaction and dispatch it after commit; the ordinary send path still rolls back on delivery failure.
 */
export async function resendWorkspaceInvitation(
  db: Knex,
  input: {
    invitationId: string;
    reason: string;
    actor: TeamActor;
    appURL: string;
    sendEmail?: SendTeamInvitation;
    queueEmail?: QueueTeamInvitation;
  },
): Promise<{ expiresAt: Date; deliveryId?: string }> {
  checkActor(input.actor);
  if (Boolean(input.sendEmail) === Boolean(input.queueEmail)) {
    throw new TeamActionError('Choose exactly one invitation delivery strategy.');
  }
  const reason = normalizeStaffReason(input.reason);
  return db.transaction(async trx => {
    const { workspace, invitation } = await lockInvitation(trx, input.invitationId);
    if (workspace.suspendedAt) throw new TeamActionError('This workspace is suspended.');
    if (!(openInvitationStatuses as readonly string[]).includes(invitation.status)) throw new TeamActionError(`This invitation was already ${invitation.status}.`);
    if (invitation.lastAttemptAt && Date.now() - new Date(invitation.lastAttemptAt).getTime() < resendCooldownMs) throw new TeamActionError('This invitation was sent less than a minute ago.');
    const owner = await trx('users').where({ id: workspace.ownerId }).first<{ name: string; emailVerified: boolean; deletionRequestedAt: Date | null }>('name', 'emailVerified', 'deletionRequestedAt');
    if (!owner.emailVerified || owner.deletionRequestedAt) throw new TeamActionError('The Owner must verify their email first.');
    if (!invitation.inviterId || !await inviterAllowed(trx, invitation.inviterId, invitation.workspaceId, invitation.role)) {
      throw new TeamActionError('The person who sent this invitation can no longer invite this role.');
    }
    try { await assertSeatCapacity(trx, invitation.workspaceId, 1, invitation.id); }
    catch (error) { if (error instanceof PlanCapacityError) throw new TeamActionError('The workspace has no free seat on its plan.'); throw error; }
    const { token, tokenHash } = newInvitationToken();
    const expiresAt = new Date(Date.now() + invitationLifetimeMs);
    await trx('workspaceInvitations').where({ id: invitation.id }).update({ status: 'sent', tokenHash, expiresAt, sentAt: trx.fn.now(), lastAttemptAt: trx.fn.now(),
      deliveryAttempts: trx.raw('"deliveryAttempts" + 1') });
    await audit(trx, invitation.workspaceId, 'invitation.resent', input.actor, { reason, invitation: { id: invitation.id, role: invitation.role, previousStatus: invitation.status } });
    const emailInput = { url: invitationURL(input.appURL, token), inviterName: owner.name, workspaceName: workspace.businessName, role: invitation.role };
    if (input.queueEmail) {
      const deliveryId = await input.queueEmail(trx, {
        invitationId: invitation.id,
        tokenHash,
        to: invitation.email,
        input: emailInput,
      });
      return { expiresAt, deliveryId };
    }
    // Last, so a failed send rolls everything back and the previous link keeps working.
    if (input.sendEmail) {
      await input.sendEmail(invitation.email, emailInput);
      return { expiresAt };
    }
    throw new TeamActionError('Invitation delivery is not configured.');
  });
}

async function inviterAllowed(trx: Knex.Transaction, inviterId: string, workspaceId: string, role: Exclude<WorkspaceRole, 'owner'>) {
  try {
    const context = await loadWorkspaceAuthorization(trx, { userId: inviterId, workspaceId }, ['team.invite']);
    return authorize(context, { permission: 'team.invite', targetRole: role }).allowed;
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

/** Cancels an open invitation (W7). The link then shows "revoked". Repeating it is a no-op. */
export async function revokeWorkspaceInvitation(db: Knex, input: { invitationId: string; reason: string; actor: TeamActor }): Promise<{ changed: boolean }> {
  checkActor(input.actor);
  const reason = normalizeStaffReason(input.reason);
  return db.transaction(async trx => {
    const { invitation } = await lockInvitation(trx, input.invitationId);
    if (invitation.status === 'revoked') return { changed: false };
    if (invitation.status === 'accepted') throw new TeamActionError('This invitation was already accepted. Remove the member instead.');
    await trx('workspaceInvitations').where({ id: invitation.id }).update({ status: 'revoked' });
    await audit(trx, invitation.workspaceId, 'invitation.revoked', input.actor, { reason, invitation: { id: invitation.id, role: invitation.role, previousStatus: invitation.status } });
    return { changed: true };
  });
}

/**
 * Transfers ownership to another member (W8). The new Owner must be a verified, active member who owns no other
 * workspace; the previous Owner stays as an Admin. Both are notified through the ownership notice outbox.
 * The deferred `authorization_owner_invariant` trigger checks "exactly one matching Owner" at commit.
 */
export async function transferWorkspaceOwnership(db: Knex, input: { workspaceId: string; newOwnerUserId: string; reason: string; actor: TeamActor }): Promise<{ previousOwnerUserId: string }> {
  checkActor(input.actor);
  const reason = normalizeStaffReason(input.reason);
  return db.transaction(async trx => {
    const workspace = await lockWorkspace(trx, input.workspaceId);
    if (workspace.ownerId === input.newOwnerUserId) throw new TeamActionError('This person is already the Owner.');
    const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': input.workspaceId, 'm.userId': input.newOwnerUserId })
      .first<{ role: WorkspaceRole; emailVerified: boolean; deletionRequestedAt: Date | null; suspendedAt: Date | null } | undefined>('m.role', 'u.emailVerified', 'u.deletionRequestedAt', 'u.suspendedAt');
    if (!member) throw new TeamActionError('This person is not a member of the workspace.');
    if (!member.emailVerified) throw new TeamActionError('The new Owner must verify their email first.');
    if (member.deletionRequestedAt) throw new TeamActionError('This person\'s account is being deleted.');
    if (member.suspendedAt) throw new TeamActionError('This person\'s account is suspended.');
    if (await trx('workspaces').where({ ownerId: input.newOwnerUserId }).first('id')) throw new TeamActionError('This person already owns another workspace.');
    const previousOwnerUserId = workspace.ownerId;
    await trx('workspaceMemberships').where({ workspaceId: input.workspaceId, userId: previousOwnerUserId }).update({ role: 'admin' });
    await trx('workspaceMemberships').where({ workspaceId: input.workspaceId, userId: input.newOwnerUserId }).update({ role: 'owner' });
    await trx('workspaces').where({ id: input.workspaceId }).update({ ownerId: input.newOwnerUserId });
    const notice = { workspaceId: input.workspaceId, fromUserId: previousOwnerUserId, toUserId: input.newOwnerUserId };
    await trx('workspaceOwnershipNotices').insert([{ id: randomUUID(), recipient: 'new_owner', ...notice }, { id: randomUUID(), recipient: 'previous_owner', ...notice }]);
    await audit(trx, input.workspaceId, 'ownership.transferred', input.actor, { reason, from: { userId: previousOwnerUserId, role: 'admin' },
      to: { userId: input.newOwnerUserId, previousRole: member.role } });
    return { previousOwnerUserId };
  });
}

import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { PlanCapacityError, assertSeatCapacity, AuthorizationAccessError, loadWorkspaceAuthorization } from '@salesmora/data';
import { authorize } from '@salesmora/domain';
import { authorizedWorkspace, enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
import { sendInvitationEmail } from '../email/send-invitation';
import type { InvitationSummary, InvitationUnavailable } from '../../features/auth/invitation-acceptance/invitation-acceptance';
export const validInvitationToken = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
interface InvitationRow {
  id: string; workspaceId: string; email: string; role: 'admin' | 'office' | 'field'; inviterId: string | null; status: string;
  tokenHash: string | null; expiresAt: Date | null; acceptedBy: string | null;
}
export async function deliverOwnerInvitations(ownerId: string, sendEmail = sendInvitationEmail) {
  const db = database();
  const rows = await db('workspaceInvitations as i').join('workspaces as w','i.workspaceId','w.id').where('w.ownerId',ownerId).whereIn('i.status',['queued','pending_verification']).select('i.id', 'i.workspaceId');
  let sent = 0;
  for (const { id, workspaceId } of rows) {
    const delivered = await authorizedWorkspace(ownerId, workspaceId, true, async (trx) => {
      // Serialize local SMTP delivery, including simultaneous verification/create/retry calls.
      const invite = await trx<InvitationRow>('workspaceInvitations').where({ id }).forUpdate().first();
      if (!invite || !['queued','pending_verification'].includes(invite.status)) return false;
      const workspace = await trx('workspaces').where({id:invite.workspaceId,ownerId}).first();
      const owner = await trx('users').where({id:ownerId,emailVerified:true}).first();
      if (!workspace || !owner) return false;
      try{await assertSeatCapacity(trx,workspaceId,0);}
      catch(error){if(error instanceof PlanCapacityError)return false;throw error;}
      const attempt = await trx('workspaceInvitations').where({id}).where(builder => builder.whereNull('lastAttemptAt').orWhere('lastAttemptAt','<',new Date(Date.now()-60000))).update({status:'queued',lastAttemptAt:new Date(),deliveryAttempts:trx.raw('"deliveryAttempts" + 1')});
      if (!attempt) return false;
      if (!invite.inviterId) return false;
      let inviter;
      try { inviter = await loadWorkspaceAuthorization(trx, { userId: invite.inviterId, workspaceId }, enabledPermissions); }
      catch (error) { if (error instanceof AuthorizationAccessError) return false; throw error; }
      if (!authorize(inviter, { permission: 'team.invite', targetRole: invite.role }).allowed) return false;
      const token = randomBytes(32).toString('hex');
      const baseURL = process.env.BETTER_AUTH_URL!;
      const url = new URL('/accept-invitation',baseURL); url.searchParams.set('token',token);
      try {
        await sendEmail(invite.email,{url:url.href,inviterName:owner.name,workspaceName:workspace.businessName,role:invite.role},baseURL);
      } catch {
        // Keep the invitation queued for an explicit owner retry. Never log the link or recipient.
        console.error('Invitation email delivery failed. Check the configured email service.');
        return false;
      }
      await trx('workspaceInvitations').where({id}).update({status:'sent',tokenHash:hash(token),expiresAt:new Date(Date.now()+7*86400000),sentAt:new Date()});
      return true;
    });
    if (delivered) sent++;
  }
  return sent;
}
export async function safelyDeliverOwnerInvitations(ownerId: string) {
  try { return await deliverOwnerInvitations(ownerId); }
  catch { console.error('Invitation queue processing failed. Pending invitations can be retried from Home.'); return 0; }
}
export type InvitationView = { availability: 'ready' | 'accepted'; invitation: InvitationSummary; workspaceId: string } | { availability: InvitationUnavailable };
export async function getInvitation(token: unknown, userId?: string): Promise<InvitationView> {
  if (!validInvitationToken(token)) return {availability:'invalid'};
  const db = database();
  const row = await db<InvitationRow>('workspaceInvitations').where({tokenHash:hash(token)}).first();
  if (!row) return {availability:'invalid'};
  if (row.status === 'revoked') return {availability:'revoked'};
  if (row.status === 'accepted' && row.acceptedBy !== userId) return {availability:'revoked'};
  if (row.status !== 'accepted' && (!row.expiresAt || new Date(row.expiresAt).getTime()<=Date.now())) return {availability:'expired'};
  if (!['sent','accepted'].includes(row.status)) return {availability:'invalid'};
  const workspace = await db('workspaces').where({id:row.workspaceId}).first();
  if (!workspace || workspace.deletionRequestedAt) return {availability:'invalid'};
  if (row.status === 'accepted' && !await db('workspaceMemberships').where({workspaceId:row.workspaceId,userId}).first()) return {availability:'revoked'};
  const owner = await db('users').where({id:workspace.ownerId}).first();
  return {availability:row.status === 'accepted'?'accepted':'ready',workspaceId:row.workspaceId,invitation:{id:row.id,workspaceName:workspace.businessName,inviterName:owner.name,email:row.email,role:row.role,expiresAt:new Date(row.expiresAt!).toISOString()}};
}
export async function acceptInvitation(token: string, userId: string) {
  return database().transaction(async trx => {
    const candidate = await trx<InvitationRow>('workspaceInvitations').where({ tokenHash: hash(token) }).first();
    if (!candidate || !await trx('workspaces').where({ id: candidate.workspaceId }).forUpdate().first()) return { ok: false as const, reason: 'invalid' as const };
    const user = await trx('users').where({id:userId}).forUpdate().first();
    if (!user || user.deletionRequestedAt) return {ok:false as const,reason:'wrong-account' as const};
    const row = await trx<InvitationRow>('workspaceInvitations').where({tokenHash:hash(token)}).forUpdate().first();
    if (!row || row.workspaceId !== candidate.workspaceId) return {ok:false as const,reason:'invalid' as const};
    if (row.email.toLowerCase() !== user.email.toLowerCase()) return {ok:false as const,reason:'wrong-account' as const};
    if (row.status === 'accepted') {
      const member = await trx('workspaceMemberships').where({workspaceId:row.workspaceId,userId}).first();
      return row.acceptedBy === userId && member ? {ok:true as const,workspaceId:row.workspaceId} : {ok:false as const,reason:'revoked' as const};
    }
    if (row.status === 'revoked') return {ok:false as const,reason:'revoked' as const};
    if (row.status !== 'sent') return {ok:false as const,reason:'invalid' as const};
    if (!row.expiresAt || new Date(row.expiresAt).getTime()<=Date.now()) return {ok:false as const,reason:'expired' as const};
    if (!row.inviterId) return { ok: false as const, reason: 'revoked' as const };
    let context;
    try { context = await loadWorkspaceAuthorization(trx, { userId: row.inviterId, workspaceId: row.workspaceId }, enabledPermissions); }
    catch (error) { if (error instanceof AuthorizationAccessError) return { ok: false as const, reason: 'revoked' as const }; throw error; }
    if (!authorize(context, { permission: 'team.invite', targetRole: row.role }).allowed) return { ok: false as const, reason: 'revoked' as const };
    const existingMember=await trx('workspaceMemberships').where({workspaceId:row.workspaceId,userId}).first();
    if(!existingMember)await assertSeatCapacity(trx,row.workspaceId,1,row.id);
    // Existing membership is retained; an invitation cannot overwrite or elevate it.
    const inserted = await trx('workspaceMemberships').insert({workspaceId:row.workspaceId,userId,role:row.role}).onConflict(['workspaceId','userId']).ignore().returning('userId');
    if (inserted.length) await trx('authorizationAudit').insert({ workspaceId: row.workspaceId, actorId: userId, action: 'invitation.accepted', beforeRevision: context.policy.revision, afterRevision: context.policy.revision,
      beforePolicy: JSON.stringify(context.policy), afterPolicy: JSON.stringify({ ...context.policy, acceptedInvitation: { id: row.id, inviterId: row.inviterId, role: row.role, userId } }) });
    await trx('workspaceInvitations').where({id:row.id}).update({status:'accepted',acceptedAt:new Date(),acceptedBy:userId});
    // Possession of this addressed invitation plus the matching account proves the email.
    await trx('users').where({id:userId}).update({emailVerified:true,onboardingStatus:'complete',updatedAt:new Date()});
    return {ok:true as const,workspaceId:row.workspaceId};
  });
}
export async function allowInvitationAttempt(userId: string) {
  const now = Date.now();
  const rows = await database()('rateLimits').insert({id:randomBytes(16).toString('hex'),key:`invitation-accept:${userId}`,count:1,lastRequest:now}).onConflict('key').merge({
    count:database().raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count + 1 END',[now-60000]),
    lastRequest:database().raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END',[now-60000,now]),
  }).returning('count');
  return rows[0].count<=10;
}

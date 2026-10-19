import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { leadChatTurnEvidenceAllowed } from '@salesmora/data';
import { AuthorizationAccessError } from '@salesmora/data';
import { leadSchema, leadDraftReviewSchema, type AuthorizationContext, type LeadInput, type LeadDraftReview } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { createLeadInTransaction, LeadOwnerError } from '../leads/store';
import { chatAccessHash } from './access-hash';
import type { ChatIdentity } from './store';
import { ChatActionConflict } from './action-errors';
export { ChatActionConflict } from './action-errors';
import { visibleDeleteDraft } from './delete-actions';
import { resolveExportDraft, visibleExportDraft } from './export-actions';
import { resolveArchiveDraft, visibleArchiveDraft } from './archive-actions';
import { resolveNoteDraft, visibleNoteDraft } from './note-actions';
import { resolveAssignmentDraft, visibleAssignmentDraft } from './assignment-actions';
import { resolveUpdateDraft, visibleUpdateDraft } from './update-actions';
import { resolveStageDraft, visibleStageDraft } from './stage-actions';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function allowed(context: AuthorizationContext, id: string) {
  return authorize(context, { permission: 'assistant.use' }).allowed && authorize(context, { permission: 'leads.create' }).allowed &&
    authorize(context, { permission: 'leads.assign', resource: { kind: 'lead', id, workspaceId: context.workspaceId, ownerId: null } }).allowed;
}
async function ownerSnapshot(trx: Knex.Transaction, workspaceId: string, ownerId: string) {
  if (!ownerId) return null;
  // PostgreSQL tuple version detects membership replacement/changes without a new role schema.
  const owner = await trx('workspaceMemberships').join('users', 'users.id', 'workspaceMemberships.userId')
    .where({ 'workspaceMemberships.workspaceId': workspaceId, 'workspaceMemberships.userId': ownerId })
    .select('users.name', 'workspaceMemberships.role', trx.raw('"workspaceMemberships".xmin::text AS "membershipVersion"')).first();
  if (!owner) throw new LeadOwnerError();
  return { name: String(owner.name), role: owner.role, membershipVersion: String(owner.membershipVersion) };
}
interface DraftRow extends ChatIdentity { id: string; turnId: string; threadId: string; inputHash: string; accessHash: string; state: LeadDraftReview['state']; expiresAt: Date | string; lead: LeadInput; ownerSnapshot: { name: string; role: string; membershipVersion: string } | null; leadId?: string }
function review(row: DraftRow): LeadDraftReview {
  return leadDraftReviewSchema.parse({ id: row.id, inputHash: row.inputHash, state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state,
    expiresAt: new Date(row.expiresAt).toISOString(), lead: row.lead, ownerName: row.ownerSnapshot?.name ?? '', ...(row.leadId ? { leadId: row.leadId } : {}) });
}
async function audit(trx: Knex.Transaction, row: DraftRow, action: string, leadId?: string) {
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, draftId: row.id, inputHash: row.inputHash, action, actionType: 'actionType' in row ? row.actionType : 'lead.create', leadId: leadId ?? null });
}
/** Persist a proposal only. No business record is created in this path. */
export async function proposeLeadDraft(identity: ChatIdentity, turnId: string, input: LeadInput, signal: AbortSignal) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, 'create').allowed || !allowed(context, turnId) || turn.accessHash !== chatAccessHash(context) || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const lead = leadSchema.parse(input); const snapshot = await ownerSnapshot(trx, identity.workspaceId, lead.ownerId);
    const previous = await trx('chatActionDrafts').where({ turnId }).first();
    if (previous) { if (previous.inputHash !== hash(lead)) throw new ChatActionConflict(); return review(previous); }
    const old = await trx('chatActionDrafts').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: trx.fn.now() }).returning('*');
    for (const row of old) await audit(trx, row, 'draft.superseded');
    const [row] = await trx('chatActionDrafts').insert({ ...identity, id: randomUUID(), turnId, threadId: turn.threadId, lead,
      inputHash: hash(lead), accessHash: chatAccessHash(context), ownerSnapshot: snapshot, expiresAt: new Date(Date.now() + 15 * 60_000) }).returning('*');
    await audit(trx, row, 'draft.proposed'); signal.throwIfAborted();
    return review(row);
  });
}
/** Return private proposal data only while the original authority remains current. */
export async function visibleTurnDraft(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row = await trx('chatActionDrafts').where({ workspaceId: context.workspaceId, userId: context.userId, turnId }).first();
  if (row?.actionType === 'lead.delete') return visibleDeleteDraft(trx, context, row);
  if (row?.actionType === 'lead.export') return visibleExportDraft(trx, context, row);
  if (row?.actionType === 'lead.archive') return visibleArchiveDraft(trx, context, row);
  if (row?.actionType === 'lead.note') return visibleNoteDraft(trx, context, row);
  if (row?.actionType === 'lead.assign') return visibleAssignmentDraft(trx, context, row);
  if (row?.actionType === 'lead.update') return visibleUpdateDraft(trx, context, row);
  if (row?.actionType === 'lead.stage') return visibleStageDraft(trx, context, row);
  if (!allowed(context, turnId)) return undefined;
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: turnId }).first();
  return row && turn && row.accessHash === chatAccessHash(context) && await leadChatTurnEvidenceAllowed(trx, context, turn) ? review(row) : undefined;
}
/** Explicit browser decision; approval, domain mutation and audit commit atomically. */
export async function resolveLeadDraft(identity: ChatIdentity, draftId: string, inputHash: string, decision: 'confirm' | 'cancel') {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    const row = await trx('chatActionDrafts').where({ ...identity, id: draftId }).forUpdate().first();
    if (row?.actionType === 'lead.delete') throw new ChatActionConflict();
    if (row?.actionType === 'lead.export') return resolveExportDraft(trx, context, row, inputHash, decision);
    if (row?.actionType === 'lead.archive') return resolveArchiveDraft(trx, context, row, inputHash, decision);
    if (row?.actionType === 'lead.note') return resolveNoteDraft(trx, context, row, inputHash, decision);
    if (row?.actionType === 'lead.assign') return resolveAssignmentDraft(trx, context, row, inputHash, decision);
    if (row?.actionType === 'lead.update') return resolveUpdateDraft(trx, context, row, inputHash, decision);
    if (row?.actionType === 'lead.stage') return resolveStageDraft(trx, context, row, inputHash, decision);
    if (!row || !allowed(context, draftId) || row.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
    const turn = await trx('chatTurns').where({ ...identity, id: row.turnId }).first();
    if (!turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (row.inputHash !== inputHash || hash(leadSchema.parse(row.lead)) !== row.inputHash) throw new ChatActionConflict();
    if ((row.state === 'confirmed' && decision === 'confirm') || (row.state === 'cancelled' && decision === 'cancel')) return review(row);
    if (row.state !== 'pending' || new Date(row.expiresAt).getTime() <= Date.now() || turn?.state !== 'completed') throw new ChatActionConflict();
    if (await trx('chatTurns').where({ ...identity, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
    if (decision === 'cancel') {
      await trx('chatActionDrafts').where({ id: row.id }).update({ state: 'cancelled', resolvedAt: trx.fn.now() });
      await audit(trx, row, 'draft.cancelled'); return review({ ...row, state: 'cancelled' });
    }
    const owner = await ownerSnapshot(trx, identity.workspaceId, row.lead.ownerId);
    if (owner?.name !== row.ownerSnapshot?.name || owner?.role !== row.ownerSnapshot?.role || owner?.membershipVersion !== row.ownerSnapshot?.membershipVersion) throw new ChatActionConflict();
    const result = await createLeadInTransaction(trx, context, identity.userId, identity.workspaceId, row.id, row.lead);
    await trx('chatActionDrafts').where({ id: row.id }).update({ state: 'confirmed', leadId: result.id, resolvedAt: trx.fn.now() });
    await audit(trx, row, 'draft.confirmed', result.id);
    return review({ ...row, state: 'confirmed', leadId: result.id });
  });
}

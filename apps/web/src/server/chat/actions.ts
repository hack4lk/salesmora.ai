import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { leadChatTurnEvidenceAllowed, leadProposalStorage } from '@salesmora/data';
import { AuthorizationAccessError } from '@salesmora/data';
import { leadSchema, leadDraftReviewSchema, type AuthorizationContext, type LeadInput, type LeadDraftReview } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { createLeadInTransaction, LeadOwnerError } from '../leads/store';
import { chatAccessHash } from './access-hash';
import { validateTurnEvidenceInTransaction, type ChatIdentity } from './store';
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
interface DraftRow extends ChatIdentity { id: string; turnId: string; threadId: string; inputHash: string; accessHash: string; state: LeadDraftReview['state']; expiresAt: Date | string; lead: LeadInput; ownerSnapshot?: { name: string; role: string; membershipVersion: string } | null; leadId?: string | null }
function review(row: DraftRow): LeadDraftReview {
  return leadDraftReviewSchema.parse({ id: row.id, inputHash: row.inputHash, state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state,
    expiresAt: new Date(row.expiresAt).toISOString(), lead: row.lead, ownerName: row.ownerSnapshot?.name ?? '', ...(row.leadId ? { leadId: row.leadId } : {}) });
}
/** Persist a proposal only. No business record is created in this path. */
export async function proposeLeadDraft(identity: ChatIdentity, turnId: string, input: LeadInput, signal: AbortSignal, db?: Knex) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await validateTurnEvidenceInTransaction(trx, context, turnId);
    if (!authorizeLeadOperation(context, turn.surfaceKey, 'create').allowed || !allowed(context, turnId) || turn.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const lead = leadSchema.parse(input); const snapshot = await ownerSnapshot(trx, identity.workspaceId, lead.ownerId);
    const previous = await leadProposalStorage.read(trx, context, { turnId });
    if (previous) { if (previous.actionType !== 'lead.create' || previous.inputHash !== hash(lead)) throw new ChatActionConflict(); return review(previous); }
    await leadProposalStorage.supersede(trx, context, turn.threadId);
    const row = await leadProposalStorage.insert(trx, context, { id: randomUUID(), turnId, threadId: turn.threadId, lead,
      actionType: 'lead.create', capability: 'leads.create',
      inputHash: hash(lead), accessHash: chatAccessHash(context), ownerSnapshot: snapshot, expiresAt: new Date(Date.now() + 15 * 60_000) });
    signal.throwIfAborted();
    return review(row);
  }, db);
}
/** Return private proposal data only while the original authority remains current. */
export async function visibleTurnDraft(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row = await leadProposalStorage.read(trx, context, { turnId });
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
    const row = await leadProposalStorage.read(trx, context, { id: draftId }, true);
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
      await leadProposalStorage.save(trx, context, row, 'cancelled');
      return review({ ...row, state: 'cancelled' });
    }
    const owner = await ownerSnapshot(trx, identity.workspaceId, row.lead.ownerId);
    if (owner?.name !== row.ownerSnapshot?.name || owner?.role !== row.ownerSnapshot?.role || owner?.membershipVersion !== row.ownerSnapshot?.membershipVersion) throw new ChatActionConflict();
    const result = await createLeadInTransaction(trx, context, identity.userId, identity.workspaceId, row.id, row.lead);
    await leadProposalStorage.save(trx, context, row, 'confirmed', { leadId: result.id });
    return review({ ...row, state: 'confirmed', leadId: result.id });
  });
}

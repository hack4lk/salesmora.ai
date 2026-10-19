import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { AuthorizationAccessError, deleteLeadInTransaction, leadChatTurnEvidenceAllowed, LeadDeleteConfirmationError } from '@salesmora/data';
import { leadDeleteDraftPayloadSchema, leadDeleteDraftReviewSchema, type AuthorizationContext, type LeadDeleteDraftInput, type LeadDeleteDraftPayload } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { chatAccessHash } from './access-hash';
import { ChatActionConflict } from './action-errors';
import type { ChatIdentity } from './store';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
interface DeleteRow extends ChatIdentity {
  id: string; turnId: string; threadId: string; inputHash: string; accessHash: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; expiresAt: Date | string; deletePayload: LeadDeleteDraftPayload;
}
function canDelete(context: AuthorizationContext, id: string) {
  const read = resolveAuthorizedCollectionScope(context, 'leads.read');
  return read.allowed && read.scope === 'workspace' && authorize(context, { permission: 'assistant.use' }).allowed &&
    authorize(context, { permission: 'leads.delete', resource: { kind: 'lead', id, workspaceId: context.workspaceId, ownerId: null } }).allowed;
}
function review(row: DeleteRow) {
  const payload = leadDeleteDraftPayloadSchema.parse(row.deletePayload);
  return leadDeleteDraftReviewSchema.parse({ actionType: 'lead.delete', id: row.id, inputHash: row.inputHash,
    expiresAt: new Date(row.expiresAt).toISOString(), state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state,
    lead: { ...payload.lead, name: payload.kind === 'proposal' ? payload.lead.name : '' },
    ...(payload.kind === 'proposal' ? { stage: payload.stage, archived: payload.archived } : {}) });
}
async function audit(trx: Knex.Transaction, row: DeleteRow, action: string) {
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, draftId: row.id,
    inputHash: row.inputHash, action, actionType: 'lead.delete', leadId: row.deletePayload.lead.id });
}
async function validReceipt(trx: Knex.Transaction, context: AuthorizationContext, row: DeleteRow) {
  const payload = leadDeleteDraftPayloadSchema.parse(row.deletePayload);
  if (row.state !== 'confirmed' || payload.kind !== 'receipt' || !canDelete(context, payload.lead.id) || row.accessHash !== chatAccessHash(context)) return false;
  const domain = await trx('leadDeletionAudit').where({ id: row.id, workspaceId: row.workspaceId, actorId: row.userId, leadId: payload.lead.id }).first();
  const approval = await trx('chatActionAudit').where({ draftId: row.id, workspaceId: row.workspaceId, actorId: row.userId, inputHash: row.inputHash, actionType: 'lead.delete', action: 'draft.confirmed' }).first('id');
  return !!domain && !!approval && `LD-${String(domain.leadNumber).padStart(4, '0')}` === payload.lead.number &&
    domain.requestHash === hash([payload.lead.id, payload.expectedVersion, payload.lead.number]);
}
export async function proposeDeleteDraft(identity: ChatIdentity, turnId: string, input: LeadDeleteDraftInput, signal: AbortSignal) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, 'delete').allowed || turn.accessHash !== chatAccessHash(context) ||
      !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const ref = input.leadRef || (turn.surfaceKey === 'lead.detail' ? turn.pageContext?.recordRefs?.[0]?.id : undefined);
    if (!ref) return { type: 'lead-delete-target-required', saved: false };
    if (!canDelete(context, turnId)) throw new AuthorizationAccessError();
    const query = trx('leads').where({ workspaceId: identity.workspaceId });
    if (/^LD-\d{1,12}$/i.test(ref)) query.andWhere('leadNumber', ref.slice(3).replace(/^0+(?=\d)/, ''));
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('id', ref);
    else return { type: 'lead-delete-target-required', saved: false };
    const lead = await query.first('id', 'leadNumber', 'name', 'version', 'stage', 'archivedAt');
    if (!lead || !canDelete(context, lead.id)) throw new AuthorizationAccessError();
    if (lead.stage === 'won') return { type: 'lead-delete-won-not-allowed', saved: false };
    const payload = leadDeleteDraftPayloadSchema.parse({ kind: 'proposal', lead: { id: lead.id, number: `LD-${String(lead.leadNumber).padStart(4, '0')}`, name: String(lead.name).slice(0, 200) }, expectedVersion: lead.version, stage: lead.stage, archived: !!lead.archivedAt });
    const prior = await trx('chatActionDrafts').where({ turnId }).first();
    if (prior) { if (prior.actionType !== 'lead.delete' || prior.inputHash !== hash(payload)) throw new ChatActionConflict(); return { action: review(prior) }; }
    const evidence = new Map<string, { id: string; version: number }>(turn.leadEvidence.map((source: { id: string; version: number }) => [source.id, source]));
    evidence.set(lead.id, { ...evidence.get(lead.id), id: lead.id, version: lead.version });
    if (evidence.size > 50) throw new ChatActionConflict();
    await trx('chatTurns').where({ id: turnId }).update({ leadEvidence: JSON.stringify([...evidence.values()]) });
    const old = await trx('chatActionDrafts').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: trx.fn.now() }).returning('*');
    for (const row of old) await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, draftId: row.id, inputHash: row.inputHash, action: 'draft.superseded', actionType: row.actionType });
    const [row] = await trx('chatActionDrafts').insert({ ...identity, id: randomUUID(), turnId, threadId: turn.threadId, capability: 'leads.delete', actionType: 'lead.delete',
      lead: {}, deletePayload: payload, inputHash: hash(payload), accessHash: chatAccessHash(context), expiresAt: new Date(Date.now() + 900000) }).returning('*');
    await audit(trx, row, 'draft.proposed'); signal.throwIfAborted(); return { action: review(row) };
  });
}
export async function visibleDeleteDraft(trx: Knex.Transaction, context: AuthorizationContext, row: DeleteRow) {
  const payload = leadDeleteDraftPayloadSchema.parse(row.deletePayload);
  if (payload.kind === 'receipt') return await validReceipt(trx, context, row) ? review(row) : undefined;
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: row.turnId }).first();
  if (!canDelete(context, payload.lead.id) || row.accessHash !== chatAccessHash(context) || !turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) return undefined;
  return review(row);
}
/** Only this non-content receipt may be displayed when deleted-source evidence forbids the old answer. */
export async function visibleDeletionReceipt(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row = await trx('chatActionDrafts').where({ workspaceId: context.workspaceId, userId: context.userId, turnId, actionType: 'lead.delete', state: 'confirmed' }).first();
  return row && await validReceipt(trx, context, row) ? review(row) : undefined;
}
export async function resolveDeleteDraft(identity: ChatIdentity, draftId: string, inputHash: string, decision: 'confirm' | 'cancel', typedConfirmation: string) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    const row: DeleteRow | undefined = await trx('chatActionDrafts').where({ ...identity, id: draftId, actionType: 'lead.delete' }).forUpdate().first();
    if (!row || !canDelete(context, row.deletePayload.lead.id) || row.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
    const payload = leadDeleteDraftPayloadSchema.parse(row.deletePayload);
    if (row.inputHash !== inputHash) throw new ChatActionConflict();
    if (decision === 'confirm' ? typedConfirmation !== payload.lead.number : typedConfirmation !== '') throw new LeadDeleteConfirmationError();
    if (payload.kind === 'receipt') {
      if (decision !== 'confirm' || !await validReceipt(trx, context, row)) throw new ChatActionConflict();
      return review(row);
    }
    if (hash(payload) !== inputHash) throw new ChatActionConflict();
    const turn = await trx('chatTurns').where({ ...identity, id: row.turnId }).first();
    if (!turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (row.state === 'cancelled' && decision === 'cancel') return review(row);
    const lead = await trx('leads').where({ workspaceId: identity.workspaceId, id: payload.lead.id }).first('version', 'stage', 'archivedAt');
    if (!lead || lead.version !== payload.expectedVersion || lead.stage !== payload.stage || !!lead.archivedAt !== payload.archived) throw new ChatActionConflict();
    if (row.state !== 'pending' || new Date(row.expiresAt).getTime() <= Date.now() || turn.state !== 'completed') throw new ChatActionConflict();
    if (await trx('chatTurns').where({ ...identity, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
    if (decision === 'cancel') {
      await trx('chatActionDrafts').where({ id: row.id }).update({ state: 'cancelled', resolvedAt: trx.fn.now() });
      await audit(trx, row, 'draft.cancelled'); return review({ ...row, state: 'cancelled' });
    }
    await deleteLeadInTransaction(trx, context, { workspaceId: identity.workspaceId, leadId: payload.lead.id, submissionId: row.id, expectedVersion: payload.expectedVersion, typedConfirmation });
    // The domain use case removes ALL lead-containing drafts, including this proposal.
    // Reinsert only a minimal receipt; keep deleted-source evidence on the turn so old CRM text stays restricted.
    const receipt = leadDeleteDraftPayloadSchema.parse({ kind: 'receipt', lead: { id: payload.lead.id, number: payload.lead.number }, expectedVersion: payload.expectedVersion });
    const [saved] = await trx('chatActionDrafts').insert({ ...identity, id: row.id, turnId: row.turnId, threadId: row.threadId,
      capability: 'leads.delete', actionType: 'lead.delete', lead: {}, deletePayload: receipt, inputHash: row.inputHash, accessHash: row.accessHash,
      state: 'confirmed', expiresAt: row.expiresAt, resolvedAt: trx.fn.now() }).returning('*');
    await audit(trx, saved, 'draft.confirmed');
    return review(saved);
  });
}

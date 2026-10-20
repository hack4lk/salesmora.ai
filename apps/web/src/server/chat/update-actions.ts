import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { AuthorizationAccessError, leadChatTurnEvidenceAllowed, updateLeadInTransaction, moveLeadStageInTransaction, leadOrigin } from '@salesmora/data';
import { leadUpdateDraftPayloadSchema, leadUpdateDraftReviewSchema, leadEditValuesSchema, leadEditableFields, type AuthorizationContext, type LeadUpdateDraftInput, type LeadUpdateWithStageDraftInput, type LeadUpdateDraftPayload } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { chatAccessHash } from './access-hash';
import { ChatActionConflict } from './action-errors';
import type { ChatIdentity } from './store';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
interface UpdateRow extends ChatIdentity {
  id: string; turnId: string; threadId: string; inputHash: string; accessHash: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; expiresAt: Date | string; updatePayload: LeadUpdateDraftPayload;
}
function review(row: UpdateRow) {
  const parsed = leadUpdateDraftPayloadSchema.parse(row.updatePayload);
  const payload = { lead: parsed.lead, changes: parsed.changes, ...(parsed.stage ? { stage: parsed.stage } : {}) };
  return leadUpdateDraftReviewSchema.parse({ actionType: 'lead.update', id: row.id, inputHash: row.inputHash,
    expiresAt: new Date(row.expiresAt).toISOString(), state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state, ...payload });
}
async function audit(trx: Knex.Transaction, row: UpdateRow, action: string) {
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, draftId: row.id,
    inputHash: row.inputHash, action, actionType: 'lead.update', leadId: row.updatePayload.lead.id });
}
async function leadQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: context.workspaceId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', context.userId);
  // Return an object so the async function does not execute/then-assimilate the query builder.
  return { query };
}
// A compound request can have no effective ordinary edits; it still requires update permission.
function canEdit(context: AuthorizationContext, lead: { id: string; ownerId: string | null }, fields: readonly string[], stage = false) {
  return authorize(context, { permission: 'assistant.use' }).allowed && authorize(context, { permission: 'leads.update', fields: [...(fields.length ? fields : leadEditableFields)],
    resource: { kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed && (!stage || authorize(context, { permission: 'leads.stage.update',
    resource: { kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed);
}
export async function proposeUpdateDraft(identity: ChatIdentity, turnId: string, input: LeadUpdateDraftInput | LeadUpdateWithStageDraftInput, signal: AbortSignal) {
  const stageInput = 'stage' in input ? input.stage : undefined;
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, stageInput ? 'update_with_stage' : 'update').allowed ||
      turn.accessHash !== chatAccessHash(context) || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const ref = input.leadRef || (turn.surfaceKey === 'lead.detail' ? turn.pageContext?.recordRefs?.[0]?.id : undefined);
    if (!ref) return { type: 'lead-update-target-required', saved: false };
    const { query } = await leadQuery(trx, context);
    if (/^LD-\d{1,12}$/i.test(ref)) query.andWhere('leadNumber', ref.slice(3).replace(/^0+(?=\d)/, ''));
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('id', ref);
    else return { type: 'lead-update-target-required', saved: false };
    const lead = await query.first('id', 'leadNumber', 'ownerId', 'version', 'archivedAt', 'stage', ...leadEditableFields);
    if (!lead || !canEdit(context, lead, input.changes.map(change => change.field), !!stageInput)) throw new AuthorizationAccessError();
    if (lead.archivedAt) return { type: 'lead-update-archived', saved: false };
    const parsed = leadEditValuesSchema.safeParse({ ...Object.fromEntries(leadEditableFields.map(field => [field, lead[field]])), ...Object.fromEntries(input.changes.map(change => [change.field, change.value])) });
    if (!parsed.success) return { type: 'lead-update-invalid', fields: parsed.error.issues.map(issue => String(issue.path[0])), saved: false };
    const changes = leadEditableFields.filter(field => input.changes.some(change => change.field === field) && parsed.data[field] !== lead[field])
      .map(field => ({ field, before: String(lead[field]), after: String(parsed.data[field]) }));
    const stage = stageInput && stageInput.to !== lead.stage ? { from: lead.stage, to: stageInput.to, ...(stageInput.to === 'lost' && stageInput.reason ? { reason: stageInput.reason } : {}) } : undefined;
    if (!changes.length && !stage) return { type: 'lead-update-unchanged', saved: false };
    if (changes.some(change => change.field === 'source')) {
      const creation = await trx('leadActivity').where({ id: lead.id, workspaceId: identity.workspaceId, type: 'created' }).first('changes');
      if (leadOrigin(creation?.changes) !== 'manual') return { type: 'lead-update-source-locked', saved: false };
    }
    const payload = leadUpdateDraftPayloadSchema.parse({ lead: { id: lead.id, number: `LD-${String(lead.leadNumber).padStart(4, '0')}`, name: String(lead.name).slice(0, 200) }, expectedVersion: lead.version, changes, ...(stage ? { stage } : {}) });
    // Keep the exact review within the stream frame budget; never truncate a reviewed value.
    if (JSON.stringify(payload).length > 48000) return { type: 'lead-update-too-large', saved: false, nextStep: 'Use the manual lead editor for this change.' };
    const prior = await trx('chatActionDrafts').where({ turnId }).first();
    if (prior) { if (prior.actionType !== 'lead.update' || prior.inputHash !== hash(payload)) throw new ChatActionConflict(); return { action: review(prior) }; }
    const evidence = new Map<string, { id: string; version: number }>(turn.leadEvidence.map((source: { id: string; version: number }) => [source.id, source]));
    evidence.set(lead.id, { ...evidence.get(lead.id), id: lead.id, version: lead.version });
    if (evidence.size > 50) throw new ChatActionConflict();
    await trx('chatTurns').where({ id: turnId }).update({ leadEvidence: JSON.stringify([...evidence.values()]) });
    const old = await trx('chatActionDrafts').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: trx.fn.now() }).returning('*');
    for (const row of old) await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, draftId: row.id, inputHash: row.inputHash, action: 'draft.superseded', actionType: row.actionType });
    const [row] = await trx('chatActionDrafts').insert({ ...identity, id: randomUUID(), turnId, threadId: turn.threadId, capability: 'leads.update', actionType: 'lead.update',
      lead: {}, updatePayload: payload, inputHash: hash(payload), accessHash: chatAccessHash(context), expiresAt: new Date(Date.now() + 900000) }).returning('*');
    await audit(trx, row, 'draft.proposed'); signal.throwIfAborted(); return { action: review(row) };
  });
}
export async function visibleUpdateDraft(trx: Knex.Transaction, context: AuthorizationContext, row: UpdateRow) {
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: row.updatePayload.lead.id }).first('id', 'ownerId');
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: row.turnId }).first();
  if (!lead || !canEdit(context, lead, row.updatePayload.changes.map(change => change.field), !!row.updatePayload.stage) || row.accessHash !== chatAccessHash(context) || !turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) return undefined;
  return review(row);
}
export async function resolveUpdateDraft(trx: Knex.Transaction, context: AuthorizationContext, row: UpdateRow, inputHash: string, decision: 'confirm' | 'cancel') {
  const payload = leadUpdateDraftPayloadSchema.parse(row.updatePayload);
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: payload.lead.id }).first('id', 'ownerId', 'version', 'archivedAt', 'stage', ...leadEditableFields);
  if (!lead || !canEdit(context, lead, row.updatePayload.changes.map(change => change.field), !!row.updatePayload.stage) || row.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
  if (row.inputHash !== inputHash || hash(payload) !== inputHash) throw new ChatActionConflict();
  const turn = await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, id: row.turnId }).first();
  if (!turn) throw new AuthorizationAccessError();
  if (row.state === 'pending' && (lead.version !== payload.expectedVersion || lead.archivedAt)) throw new ChatActionConflict();
  if (!await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
  if ((row.state === 'confirmed' && decision === 'confirm') || (row.state === 'cancelled' && decision === 'cancel')) return review(row);
  if (row.state !== 'pending' || new Date(row.expiresAt).getTime() <= Date.now() || turn.state !== 'completed') throw new ChatActionConflict();
  if (await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
  if (decision === 'confirm') {
    const values = leadEditValuesSchema.parse({ ...Object.fromEntries(leadEditableFields.map(field => [field, lead[field]])), ...Object.fromEntries(payload.changes.map(change => [change.field, change.after])) });
    let version = payload.expectedVersion;
    if (payload.changes.length) {
      const result = await updateLeadInTransaction(trx, context, { workspaceId: row.workspaceId, leadId: payload.lead.id,
        submissionId: row.id, expectedVersion: payload.expectedVersion, values }, 'assistant-confirmed', payload.changes.map(change => change.field));
      version = result.version;
    }
    if (payload.stage) {
      const result = await moveLeadStageInTransaction(trx, context, { workspaceId: row.workspaceId, leadId: payload.lead.id,
        submissionId: randomUUID(), expectedVersion: version, to: payload.stage.to, reason: payload.stage.reason }, 'assistant-confirmed');
      version = result.version;
    }
    // Keep this proposal's confirmed receipt visible after its own authorized mutation.
    await trx('chatTurns').where({ id: row.turnId }).update({ leadEvidence: JSON.stringify(turn.leadEvidence.map((source: { id: string; version: number }) => source.id === payload.lead.id ? { ...source, version } : source)) });
  }
  const state = decision === 'confirm' ? 'confirmed' : 'cancelled';
  await trx('chatActionDrafts').where({ id: row.id }).update({ state, resolvedAt: trx.fn.now() });
  await audit(trx, row, `draft.${state}`);
  return review({ ...row, state });
}

import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { AuthorizationAccessError, leadChatTurnEvidenceAllowed, moveLeadStageInTransaction } from '@salesmora/data';
import { leadStageDraftPayloadSchema, leadStageDraftReviewSchema, type AuthorizationContext, type LeadStageDraftInput, type LeadStageDraftPayload } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { chatAccessHash } from './access-hash';
import { ChatActionConflict } from './action-errors';
import type { ChatIdentity } from './store';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
interface StageRow extends ChatIdentity {
  id: string; turnId: string; threadId: string; inputHash: string; accessHash: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; expiresAt: Date | string; stagePayload: LeadStageDraftPayload;
}
function review(row: StageRow) {
  const parsed = leadStageDraftPayloadSchema.parse(row.stagePayload);
  const payload = { lead: parsed.lead, from: parsed.from, to: parsed.to, ...(parsed.reason ? { reason: parsed.reason } : {}) };
  return leadStageDraftReviewSchema.parse({ actionType: 'lead.stage', id: row.id, inputHash: row.inputHash,
    expiresAt: new Date(row.expiresAt).toISOString(), state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state, ...payload });
}
async function audit(trx: Knex.Transaction, row: StageRow, action: string) {
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, draftId: row.id,
    inputHash: row.inputHash, action, actionType: 'lead.stage', leadId: row.stagePayload.lead.id });
}
async function leadQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: context.workspaceId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', context.userId);
  // Return an object so the async function does not execute/then-assimilate the query builder.
  return { query };
}
function canMove(context: AuthorizationContext, lead: { id: string; ownerId: string | null }) {
  return authorize(context, { permission: 'assistant.use' }).allowed && authorize(context, { permission: 'leads.stage.update',
    resource: { kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed;
}
export async function proposeStageDraft(identity: ChatIdentity, turnId: string, input: LeadStageDraftInput, signal: AbortSignal) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, 'change_stage').allowed ||
      turn.accessHash !== chatAccessHash(context) || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const ref = input.leadRef || (turn.surfaceKey === 'lead.detail' ? turn.pageContext?.recordRefs?.[0]?.id : undefined);
    if (!ref) return { type: 'lead-stage-target-required', saved: false };
    const { query } = await leadQuery(trx, context);
    if (/^LD-\d{1,12}$/i.test(ref)) query.andWhere('leadNumber', ref.slice(3).replace(/^0+(?=\d)/, ''));
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('id', ref);
    else return { type: 'lead-stage-target-required', saved: false };
    const lead = await query.first('id', 'leadNumber', 'name', 'ownerId', 'stage', 'version', 'archivedAt');
    if (!lead || !canMove(context, lead)) throw new AuthorizationAccessError();
    if (lead.archivedAt) return { type: 'lead-stage-archived', saved: false };
    if (lead.stage === input.to) return { type: 'lead-stage-unchanged', saved: false };
    const payload = leadStageDraftPayloadSchema.parse({ lead: { id: lead.id, number: `LD-${String(lead.leadNumber).padStart(4, '0')}`, name: String(lead.name).slice(0, 200) },
      expectedVersion: lead.version, from: lead.stage, to: input.to, ...(input.to === 'lost' && input.reason ? { reason: input.reason } : {}) });
    const prior = await trx('chatActionDrafts').where({ turnId }).first();
    if (prior) { if (prior.actionType !== 'lead.stage' || prior.inputHash !== hash(payload)) throw new ChatActionConflict(); return { action: review(prior) }; }
    const evidence = new Map<string, { id: string; version: number }>(turn.leadEvidence.map((source: { id: string; version: number }) => [source.id, source]));
    evidence.set(lead.id, { ...evidence.get(lead.id), id: lead.id, version: lead.version });
    if (evidence.size > 50) throw new ChatActionConflict();
    await trx('chatTurns').where({ id: turnId }).update({ leadEvidence: JSON.stringify([...evidence.values()]) });
    const old = await trx('chatActionDrafts').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: trx.fn.now() }).returning('*');
    for (const row of old) await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, draftId: row.id, inputHash: row.inputHash, action: 'draft.superseded', actionType: row.actionType });
    const [row] = await trx('chatActionDrafts').insert({ ...identity, id: randomUUID(), turnId, threadId: turn.threadId, capability: 'leads.stage.update', actionType: 'lead.stage',
      lead: {}, stagePayload: payload, inputHash: hash(payload), accessHash: chatAccessHash(context), expiresAt: new Date(Date.now() + 900000) }).returning('*');
    await audit(trx, row, 'draft.proposed'); signal.throwIfAborted(); return { action: review(row) };
  });
}
export async function visibleStageDraft(trx: Knex.Transaction, context: AuthorizationContext, row: StageRow) {
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: row.stagePayload.lead.id }).first('id', 'ownerId');
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: row.turnId }).first();
  if (!lead || !canMove(context, lead) || row.accessHash !== chatAccessHash(context) || !turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) return undefined;
  return review(row);
}
export async function resolveStageDraft(trx: Knex.Transaction, context: AuthorizationContext, row: StageRow, inputHash: string, decision: 'confirm' | 'cancel') {
  const payload = leadStageDraftPayloadSchema.parse(row.stagePayload);
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: payload.lead.id }).first('id', 'ownerId', 'version', 'archivedAt');
  if (!lead || !canMove(context, lead) || row.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
  if (row.inputHash !== inputHash || hash(payload) !== inputHash) throw new ChatActionConflict();
  const turn = await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, id: row.turnId }).first();
  if (!turn) throw new AuthorizationAccessError();
  if (row.state === 'pending' && (lead.version !== payload.expectedVersion || lead.archivedAt)) throw new ChatActionConflict();
  if (!await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
  if ((row.state === 'confirmed' && decision === 'confirm') || (row.state === 'cancelled' && decision === 'cancel')) return review(row);
  if (row.state !== 'pending' || new Date(row.expiresAt).getTime() <= Date.now() || turn.state !== 'completed') throw new ChatActionConflict();
  if (await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
  if (decision === 'confirm') {
    const result = await moveLeadStageInTransaction(trx, context, { workspaceId: row.workspaceId, leadId: payload.lead.id,
      submissionId: row.id, expectedVersion: payload.expectedVersion, to: payload.to, ...(payload.reason ? { reason: payload.reason } : {}) }, 'assistant-confirmed');
    // Keep this proposal's confirmed receipt visible after its own authorized mutation.
    await trx('chatTurns').where({ id: row.turnId }).update({ leadEvidence: JSON.stringify(turn.leadEvidence.map((source: { id: string; version: number }) => source.id === payload.lead.id ? { ...source, version: result.version } : source)) });
  }
  const state = decision === 'confirm' ? 'confirmed' : 'cancelled';
  await trx('chatActionDrafts').where({ id: row.id }).update({ state, resolvedAt: trx.fn.now() });
  await audit(trx, row, `draft.${state}`);
  return review({ ...row, state });
}

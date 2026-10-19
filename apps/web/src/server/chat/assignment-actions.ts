import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { AuthorizationAccessError, leadChatTurnEvidenceAllowed, assignLeadInTransaction, leadOwnerStamp } from '@salesmora/data';
import { leadAssignmentDraftPayloadSchema, leadAssignmentDraftReviewSchema, type AuthorizationContext, type LeadAssignmentDraftInput, type LeadAssignmentDraftPayload } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { authorizedWorkspace } from '../authorization/permissions';
import { chatAccessHash } from './access-hash';
import { ChatActionConflict } from './action-errors';
import type { ChatIdentity } from './store';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
interface AssignmentRow extends ChatIdentity {
  id: string; turnId: string; threadId: string; inputHash: string; accessHash: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; expiresAt: Date | string; assignmentPayload: LeadAssignmentDraftPayload;
}
function review(row: AssignmentRow) {
  const parsed = leadAssignmentDraftPayloadSchema.parse(row.assignmentPayload);
  const payload = { lead: parsed.lead, from: parsed.from, to: parsed.to };
  return leadAssignmentDraftReviewSchema.parse({ actionType: 'lead.assign', id: row.id, inputHash: row.inputHash,
    expiresAt: new Date(row.expiresAt).toISOString(), state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state, ...payload });
}
async function audit(trx: Knex.Transaction, row: AssignmentRow, action: string) {
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, draftId: row.id,
    inputHash: row.inputHash, action, actionType: 'lead.assign', leadId: row.assignmentPayload.lead.id });
}
async function leadQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leads.read');
  if (!scope.allowed || !['workspace', 'assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const query = trx('leads').where({ workspaceId: context.workspaceId });
  if (scope.scope === 'assigned') query.andWhere('ownerId', context.userId);
  // Return an object so the async function does not execute/then-assimilate the query builder.
  return { query };
}
function canAssign(context: AuthorizationContext, lead: { id: string; ownerId: string | null }) {
  return authorize(context, { permission: 'assistant.use' }).allowed && authorize(context, { permission: 'leads.assign',
    resource: { kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed;
}

async function teammateSnapshot(trx: Knex.Transaction, context: AuthorizationContext, id: string, lock = false) {
  const query = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
    .where({ 'm.workspaceId': context.workspaceId, 'm.userId': id }).whereNull('u.deletionRequestedAt')
    .select('u.name', 'm.role', trx.raw('m.xmin::text AS "membershipVersion"'));
  const member = await (lock ? query.forShare('m', 'u') : query).first();
  return member ? { name: String(member.name).slice(0, 200), role: member.role, membershipVersion: String(member.membershipVersion) } : null;
}
async function resolveTeammate(trx: Knex.Transaction, context: AuthorizationContext, input: LeadAssignmentDraftInput) {
  if (input.assignment.kind === 'unassign') return { to: null, snapshot: null };
  let id = context.userId;
  if (input.assignment.kind === 'teammate') {
    const ref = input.assignment.teammateRef;
    const query = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
      .where({ 'm.workspaceId': context.workspaceId }).whereNull('u.deletionRequestedAt');
    query.andWhere(group => group.where('u.id', ref).orWhereRaw('lower(u.name) = lower(?)', [ref]).orWhereRaw('lower(u.email) = lower(?)', [ref]));
    const matches = await query.select('u.id').limit(2);
    // No roster or candidate emails disclosed; ask for an exact workspace email when ambiguous.
    if (matches.length !== 1) return { type: matches.length ? 'lead-assignment-teammate-ambiguous' : 'lead-assignment-teammate-not-found', saved: false };
    id = matches[0].id;
  }
  const snapshot = await teammateSnapshot(trx, context, id);
  if (!snapshot) return { type: 'lead-assignment-teammate-not-found', saved: false };
  return { to: { id, name: snapshot.name }, snapshot };
}
async function targetStillCurrent(trx: Knex.Transaction, context: AuthorizationContext, payload: LeadAssignmentDraftPayload, lock = false) {
  if (!payload.to) return payload.targetSnapshot === null;
  const current = await teammateSnapshot(trx, context, payload.to.id, lock);
  return !!current && current.name === payload.targetSnapshot?.name && current.role === payload.targetSnapshot.role && current.membershipVersion === payload.targetSnapshot.membershipVersion && current.name === payload.to.name;
}

export async function proposeAssignmentDraft(identity: ChatIdentity, turnId: string, input: LeadAssignmentDraftInput, signal: AbortSignal) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, 'assign').allowed ||
      turn.accessHash !== chatAccessHash(context) || !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const ref = input.leadRef || (turn.surfaceKey === 'lead.detail' ? turn.pageContext?.recordRefs?.[0]?.id : undefined);
    if (!ref) return { type: 'lead-assignment-target-required', saved: false };
    const { query } = await leadQuery(trx, context);
    if (/^LD-\d{1,12}$/i.test(ref)) query.andWhere('leadNumber', ref.slice(3).replace(/^0+(?=\d)/, ''));
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref)) query.andWhere('id', ref);
    else return { type: 'lead-assignment-target-required', saved: false };
    const lead = await query.first('id', 'leadNumber', 'name', 'ownerId', 'ownerName', 'version', 'archivedAt');
    if (!lead || !canAssign(context, lead)) throw new AuthorizationAccessError();
    if (lead.archivedAt) return { type: 'lead-assignment-archived', saved: false };
    const target = await resolveTeammate(trx, context, input);
    if ('type' in target) return target;
    if ((lead.ownerId ?? null) === (target.to?.id ?? null)) return { type: 'lead-assignment-unchanged', saved: false };
    const former = lead.ownerId ? await trx('users').where({ id: lead.ownerId }).first('name') : undefined;
    const payload = leadAssignmentDraftPayloadSchema.parse({ lead: { id: lead.id, number: `LD-${String(lead.leadNumber).padStart(4, '0')}`, name: String(lead.name).slice(0, 200) },
      expectedVersion: lead.version, from: lead.ownerId ? { id: lead.ownerId, name: String(former?.name ?? lead.ownerName ?? '').slice(0, 200) } : null, to: target.to, targetSnapshot: target.snapshot });
    const prior = await trx('chatActionDrafts').where({ turnId }).first();
    if (prior) { if (prior.actionType !== 'lead.assign' || prior.inputHash !== hash(payload)) throw new ChatActionConflict(); return { action: review(prior) }; }
    const evidence = new Map<string, { id: string; version: number }>(turn.leadEvidence.map((source: { id: string; version: number }) => [source.id, source]));
    evidence.set(lead.id, { ...evidence.get(lead.id), id: lead.id, version: lead.version });
    if (evidence.size > 50) throw new ChatActionConflict();
    await trx('chatTurns').where({ id: turnId }).update({ leadEvidence: JSON.stringify([...evidence.values()]) });
    const old = await trx('chatActionDrafts').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: trx.fn.now() }).returning('*');
    for (const row of old) await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, draftId: row.id, inputHash: row.inputHash, action: 'draft.superseded', actionType: row.actionType });
    const [row] = await trx('chatActionDrafts').insert({ ...identity, id: randomUUID(), turnId, threadId: turn.threadId, capability: 'leads.assign', actionType: 'lead.assign',
      lead: {}, assignmentPayload: payload, inputHash: hash(payload), accessHash: chatAccessHash(context), expiresAt: new Date(Date.now() + 900000) }).returning('*');
    await audit(trx, row, 'draft.proposed'); signal.throwIfAborted(); return { action: review(row) };
  });
}
export async function visibleAssignmentDraft(trx: Knex.Transaction, context: AuthorizationContext, row: AssignmentRow) {
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: row.assignmentPayload.lead.id }).first('id', 'ownerId');
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: row.turnId }).first();
  if (!lead || !canAssign(context, lead) || row.accessHash !== chatAccessHash(context) || !turn || !await leadChatTurnEvidenceAllowed(trx, context, turn)) return undefined;
  if (row.state === 'pending' && !await targetStillCurrent(trx, context, row.assignmentPayload)) return undefined;
  return review(row);
}
export async function resolveAssignmentDraft(trx: Knex.Transaction, context: AuthorizationContext, row: AssignmentRow, inputHash: string, decision: 'confirm' | 'cancel') {
  const payload = leadAssignmentDraftPayloadSchema.parse(row.assignmentPayload);
  const { query } = await leadQuery(trx, context);
  const lead = await query.where({ id: payload.lead.id }).first('id', 'ownerId', 'version', 'archivedAt');
  if (!lead || !canAssign(context, lead) || row.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
  if (row.inputHash !== inputHash || hash(payload) !== inputHash) throw new ChatActionConflict();
  const turn = await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, id: row.turnId }).first();
  if (!turn) throw new AuthorizationAccessError();
  if (row.state === 'pending' && (lead.version !== payload.expectedVersion || lead.archivedAt)) throw new ChatActionConflict();
  if (!await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
  if ((row.state === 'confirmed' && decision === 'confirm') || (row.state === 'cancelled' && decision === 'cancel')) return review(row);
  if (row.state !== 'pending' || new Date(row.expiresAt).getTime() <= Date.now() || turn.state !== 'completed') throw new ChatActionConflict();
  if (await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
  if (decision === 'confirm') {
    if (!await targetStillCurrent(trx, context, payload, true)) throw new ChatActionConflict();
    const result = await assignLeadInTransaction(trx, context, { workspaceId: row.workspaceId, leadId: payload.lead.id,
      submissionId: row.id, expectedVersion: payload.expectedVersion, ownerId: payload.to?.id ?? null }, 'assistant-confirmed');
    // Keep this proposal's confirmed receipt visible after its own authorized mutation.
    await trx('chatTurns').where({ id: row.turnId }).update({ leadEvidence: JSON.stringify(turn.leadEvidence.map((source: { id: string; version: number; ownerStamp?: string }) => source.id === payload.lead.id ? { ...source, version: result.version, ...(source.ownerStamp ? { ownerStamp: leadOwnerStamp(payload.to ? { ...payload.to, former: false } : null) } : {}) } : source)) });
  }
  const state = decision === 'confirm' ? 'confirmed' : 'cancelled';
  await trx('chatActionDrafts').where({ id: row.id }).update({ state, resolvedAt: trx.fn.now() });
  await audit(trx, row, `draft.${state}`);
  return review({ ...row, state });
}

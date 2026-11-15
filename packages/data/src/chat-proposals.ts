import { createHash, randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { Knex } from 'knex';
import { z } from 'zod';
import {
  chatProposalSchema, chatProposalFamilySchema, chatProposalStateSchema, chatProposalAuditDetailsSchema,
  proposalSupersession, type ChatProposal, type ChatProposalFamily, type ChatProposalAuditDetails,
  type AuthorizationContext,
} from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError } from './authorization/store';
import { canonicalProposalStorageInitialized } from './proposal-storage-authority';

const canonicalStorage = new AsyncLocalStorage<true>();
/** Explicit rehearsal override; deployment selection follows committed authority at process startup. */
export function withCanonicalProposalStorage<T>(run: () => Promise<T>) {
  return canonicalStorage.run(true, run);
}
export const usesCanonicalProposalStorage = () => canonicalStorage.getStore() === true || canonicalProposalStorageInitialized();

export class ChatProposalConflictError extends Error {
  constructor() { super('The proposal changed or can no longer be resolved.'); }
}
const owned = (context: AuthorizationContext) => ({ workspaceId: context.workspaceId, userId: context.userId });
const bindingSchema = z.object({ family: chatProposalFamilySchema, id: z.uuid() });
const timestamp = z.union([z.date(), z.iso.datetime()]).transform(value =>
  value instanceof Date ? value.toISOString() : value);
const persisted = z.object({
  family: chatProposalFamilySchema, id: z.uuid(), workspaceId: z.uuid(), userId: z.string().min(1),
  threadId: z.uuid(), turnId: z.uuid(), state: chatProposalStateSchema,
  payloadVersion: z.number().int().positive(), payload: z.unknown(), inputHash: z.string(),
  requestId: z.uuid().nullable(), expiresAt: timestamp, createdAt: timestamp, resolvedAt: timestamp.nullable(),
}).strict();
function boundary(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!trx.isTransaction) throw new Error('Proposal repository requires an existing transaction.');
  if (!authorize(context, { permission: 'assistant.use' }).allowed) throw new AuthorizationAccessError();
}

/** Validate storage without rewriting signed input or comparing it with current business records. */
export function parseChatProposal(raw: unknown): ChatProposal {
  const proposal = chatProposalSchema.parse(persisted.parse(raw));
  let binding: { id: string; inputHash: string; expiresAt: string } | undefined;
  let workspaceId: string | undefined;
  switch (proposal.family) {
    case 'action': break;
    case 'customer':
      binding = proposal.payload.review;
      if (proposal.payload.payload.kind === 'export') workspaceId = proposal.payload.payload.input.query.workspaceId;
      else if (proposal.payload.payload.kind !== 'deleted') workspaceId = proposal.payload.payload.input.workspaceId;
      break;
    case 'workOrder':
    case 'material':
      binding = proposal.payload.review;
      workspaceId = 'workspaceId' in proposal.payload.payload.input
        ? proposal.payload.payload.input.workspaceId : proposal.payload.payload.input.query.workspaceId;
      break;
    case 'estimateDraft': binding = proposal.payload.view.draft; break;
    case 'calendar':
      binding = proposal.payload.draft;
      workspaceId = proposal.payload.command.workspaceId;
      break;
    case 'captureSetup':
    case 'captureSource':
      binding = { ...proposal.payload.view.ticket, id: proposal.payload.view.ticket.proposalId };
      workspaceId = proposal.payload.view.ticket.workspaceId;
      if (proposal.payload.turnId !== proposal.turnId || proposal.payload.threadId !== proposal.threadId)
        throw new Error('Stored Capture proposal source binding is invalid.');
      break;
    default: binding = proposal.payload.ticket;
  }
  if (binding && (binding.id !== proposal.id || binding.inputHash !== proposal.inputHash ||
    Date.parse(binding.expiresAt) !== Date.parse(proposal.expiresAt)))
    throw new Error('Stored proposal projection does not match its original binding.');
  if (workspaceId !== undefined && workspaceId !== proposal.workspaceId)
    throw new Error('Stored proposal workspace binding is invalid.');
  return proposal;
}
function serialized(proposal: ChatProposal) {
  return { ...proposal, payload: JSON.stringify(proposal.payload) };
}
export function leadProposalAuditDetails(payload: Extract<ChatProposal, { family: 'action' }>['payload']) {
  let leadId: string | null = null;
  switch (payload.actionType) {
    case 'lead.create': leadId = payload.leadId ?? null; break;
    case 'lead.stage': leadId = payload.stagePayload.lead.id; break;
    case 'lead.update': leadId = payload.updatePayload.lead.id; break;
    case 'lead.assign': leadId = payload.assignmentPayload.lead.id; break;
    case 'lead.note': leadId = payload.notePayload.lead.id; break;
    case 'lead.archive': leadId = payload.archivePayload.lead.id; break;
    case 'lead.delete': leadId = payload.deletePayload.lead.id; break;
    case 'lead.export': break;
  }
  return { actionType: payload.actionType, leadId };
}
function auditDetails(proposal: ChatProposal): ChatProposalAuditDetails {
  switch (proposal.family) {
    case 'action': return leadProposalAuditDetails(proposal.payload);
    case 'captureSetup':
    case 'captureSource': return { operation: proposal.payload.input.operation };
    default: return {};
  }
}
function auditEvent(proposal: ChatProposal, state: 'proposed' | 'confirmed' | 'cancelled' | 'superseded') {
  if (proposal.family === 'action') return `draft.${state}`;
  if (state === 'proposed' && (proposal.family === 'captureSetup' || proposal.family === 'captureSource')) return 'prepared';
  return state;
}
async function appendAudits(trx: Knex.Transaction, context: AuthorizationContext, proposals: readonly ChatProposal[],
  state: 'proposed' | 'confirmed' | 'cancelled' | 'superseded', at: string) {
  if (!proposals.length) return;
  await trx('chatProposalAudit').insert(proposals.map(proposal => ({
    id: randomUUID(), family: proposal.family, proposalId: proposal.id,
    workspaceId: context.workspaceId, actorId: context.userId, action: auditEvent(proposal, state),
    inputHash: proposal.inputHash, details: JSON.stringify(chatProposalAuditDetailsSchema.parse(auditDetails(proposal))),
    createdAt: at,
  })));
}

/** Caller holds the workspace write lock; domains retain fresh review/confirmation access checks. */
export async function readOwnedProposal(trx: Knex.Transaction, context: AuthorizationContext,
  rawBinding: { family: ChatProposalFamily; id: string }, lock = false) {
  boundary(trx, context);
  const binding = bindingSchema.parse(rawBinding);
  return readInTransaction(trx, context, binding, lock);
}
async function readInTransaction(trx: Knex.Transaction, context: AuthorizationContext,
  binding: { family: ChatProposalFamily; id: string }, lock: boolean) {
  const query = trx('chatProposals').where({ ...owned(context), ...binding });
  if (lock) query.forUpdate();
  const row: unknown = await query.first();
  if (!row) throw new AuthorizationAccessError();
  return parseChatProposal(row);
}

/** Optional latest owned lookup for native visibility/evidence readers. */
export async function findOwnedProposal(trx: Knex.Transaction, context: AuthorizationContext,
  family: ChatProposalFamily | readonly ChatProposalFamily[], selector: { id: string } | { turnId: string }, lock = false) {
  boundary(trx, context);
  const families = z.array(chatProposalFamilySchema).min(1).parse(typeof family === 'string' ? [family] : family);
  const filter = z.union([
    z.object({ id: z.uuid() }).strict(), z.object({ turnId: z.uuid() }).strict(),
  ]).parse(selector);
  const query = trx('chatProposals').where({ ...owned(context), ...filter }).whereIn('family', families)
    .orderBy('createdAt', 'desc').orderBy('id', 'desc');
  if (lock) query.forUpdate();
  const row: unknown = await query.first();
  return row ? parseChatProposal(row) : undefined;
}

/** Capture replay lookup only; returning a row does not authorize replaying its domain operation. */
export async function readProposalRequest(trx: Knex.Transaction, context: AuthorizationContext,
  family: 'captureSetup' | 'captureSource', requestId: string) {
  boundary(trx, context);
  const input = z.object({ family: z.enum(['captureSetup', 'captureSource']), requestId: z.uuid() }).parse({ family, requestId });
  const row: unknown = await trx('chatProposals').where({ ...owned(context), ...input }).first();
  return row ? parseChatProposal(row) : undefined;
}

function supersededPayload(proposal: ChatProposal): ChatProposal['payload'] {
  switch (proposal.family) {
    case 'calendar': return { ...proposal.payload, draft: { ...proposal.payload.draft, state: 'superseded' } };
    default: return proposal.payload;
  }
}

/** Preserve directional replacement and return original rows for domain-specific evidence pruning. */
export async function supersedeProposals(trx: Knex.Transaction, context: AuthorizationContext,
  threadId: string, family: ChatProposalFamily, at: string) {
  boundary(trx, context);
  z.uuid().parse(threadId); z.iso.datetime().parse(at);
  chatProposalFamilySchema.parse(family);
  return trx.transaction(savepoint => supersedeInTransaction(savepoint, context, threadId, family, at));
}

async function supersedeInTransaction(trx: Knex.Transaction, context: AuthorizationContext,
  threadId: string, family: ChatProposalFamily, at: string) {
  const families = proposalSupersession[family];
  const rows: unknown[] = await trx('chatProposals').where({ ...owned(context), threadId, state: 'pending' })
    .whereIn('family', [...families]).orderBy('family').orderBy('id').forUpdate();
  const proposals = rows.map(parseChatProposal);
  if (!proposals.length) return [];
  await trx('chatProposals').where({ ...owned(context), threadId, state: 'pending' })
    .whereIn('family', [...families]).update({ state: 'superseded', resolvedAt: at });
  for (const proposal of proposals) {
    const payload = supersededPayload(proposal);
    if (payload !== proposal.payload)
      await trx('chatProposals').where({ ...owned(context), family: proposal.family, id: proposal.id })
        .update({ payload: JSON.stringify(payload) });
  }
  await appendAudits(trx, context, proposals, 'superseded', at);
  return proposals;
}

function pendingProposal(context: AuthorizationContext, raw: unknown) {
  const proposal = parseChatProposal(raw);
  if (proposal.workspaceId !== context.workspaceId || proposal.userId !== context.userId)
    throw new AuthorizationAccessError();
  if (proposal.state !== 'pending' || proposal.resolvedAt !== null) throw new ChatProposalConflictError();
  return proposal;
}
async function insertInTransaction(trx: Knex.Transaction, context: AuthorizationContext, proposal: ChatProposal) {
  await trx('chatProposals').insert(serialized(proposal));
  await appendAudits(trx, context, [proposal], 'proposed', proposal.createdAt);
  return proposal;
}

/** Insert a validated pending proposal and lifecycle event atomically, without executing domain work. */
export async function createProposal(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  boundary(trx, context);
  const proposal = pendingProposal(context, raw);
  return trx.transaction(savepoint => insertInTransaction(savepoint, context, proposal));
}

/** Replace pending siblings and insert as one unit; pruning runs inside the same transaction. */
export async function replaceProposal(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
  prune?: (replaced: readonly ChatProposal[], transaction: Knex.Transaction) => Promise<void>) {
  boundary(trx, context);
  const proposal = pendingProposal(context, raw);
  return trx.transaction(async savepoint => {
    const replaced = await supersedeInTransaction(savepoint, context, proposal.threadId, proposal.family, proposal.createdAt);
    if (prune) await prune(replaced, savepoint);
    return insertInTransaction(savepoint, context, proposal);
  });
}

/** Domain callback validates binding/version/expiry/replay and executes its command on this savepoint. */
export async function resolveProposal(trx: Knex.Transaction, context: AuthorizationContext,
  binding: { family: ChatProposalFamily; id: string }, at: string,
  execute: (proposal: ChatProposal, transaction: Knex.Transaction) => Promise<ChatProposal>) {
  boundary(trx, context); z.iso.datetime().parse(at);
  const key = bindingSchema.parse(binding);
  return trx.transaction(async savepoint => {
    const original = await readInTransaction(savepoint, context, key, true);
    if (original.state !== 'pending') throw new ChatProposalConflictError();
    const next = parseChatProposal(await execute(original, savepoint));
    return saveResolutionInTransaction(savepoint, context, original, next, at);
  });
}

/** Native handlers already hold the proposal lock and execute business work in their outer write transaction. */
export async function saveProposalResolution(trx: Knex.Transaction, context: AuthorizationContext,
  original: ChatProposal, raw: unknown, at: string) {
  boundary(trx, context); z.iso.datetime().parse(at);
  if (original.workspaceId !== context.workspaceId || original.userId !== context.userId)
    throw new AuthorizationAccessError();
  const next = parseChatProposal(raw);
  return trx.transaction(savepoint => saveResolutionInTransaction(savepoint, context, original, next, at));
}
async function saveResolutionInTransaction(trx: Knex.Transaction, context: AuthorizationContext,
  original: ChatProposal, next: ChatProposal, at: string) {
  if (original.state !== 'pending') throw new ChatProposalConflictError();
  if (next.family !== original.family || next.id !== original.id || next.workspaceId !== original.workspaceId ||
      next.userId !== original.userId || next.threadId !== original.threadId || next.turnId !== original.turnId ||
      next.payloadVersion !== original.payloadVersion || next.inputHash !== original.inputHash ||
      next.requestId !== original.requestId || Date.parse(next.createdAt) !== Date.parse(original.createdAt) ||
      Date.parse(next.expiresAt) !== Date.parse(original.expiresAt) ||
      !['confirmed', 'cancelled'].includes(next.state) ||
      (next.family === 'estimateConversion' && next.state === 'confirmed'))
      throw new ChatProposalConflictError();
  const saved = await trx('chatProposals').where({ ...owned(context), family: original.family, id: original.id, state: 'pending' })
    .update({ state: next.state, payload: JSON.stringify(next.payload), resolvedAt: at }).returning('*');
  if (saved.length !== 1) throw new ChatProposalConflictError();
  await appendAudits(trx, context, [next], next.state === 'confirmed' ? 'confirmed' : 'cancelled', at);
  return parseChatProposal(saved[0]);
}

/** Native Lead deletion erases its locked proposal; restore only the minimal, audited receipt. */
export async function restoreDeletedLeadProposal(trx: Knex.Transaction, context: AuthorizationContext,
  original: ChatProposal, payload: unknown, at: string) {
  boundary(trx, context); z.iso.datetime().parse(at);
  if (original.workspaceId !== context.workspaceId || original.userId !== context.userId)
    throw new AuthorizationAccessError();
  const next = parseChatProposal({ ...original, payload, state: 'confirmed', resolvedAt: at });
  if (original.family !== 'action' || original.state !== 'pending' || original.payload.actionType !== 'lead.delete' ||
    original.payload.deletePayload.kind !== 'proposal' || next.family !== 'action' ||
    next.payload.actionType !== 'lead.delete' || next.payload.deletePayload.kind !== 'receipt')
    throw new ChatProposalConflictError();
  const before = original.payload.deletePayload, receipt = next.payload.deletePayload;
  if (receipt.lead.id !== before.lead.id || receipt.lead.number !== before.lead.number ||
    receipt.expectedVersion !== before.expectedVersion || next.payload.accessHash !== original.payload.accessHash ||
    Object.keys(next.payload).some(key => !['actionType', 'capability', 'lead', 'accessHash', 'deletePayload'].includes(key)))
    throw new ChatProposalConflictError();
  return trx.transaction(async savepoint => {
    const requestHash = createHash('sha256').update(JSON.stringify([receipt.lead.id, receipt.expectedVersion, receipt.lead.number])).digest('hex');
    const { rows } = await savepoint.raw<{ rows: { id: string }[] }>(`
      INSERT INTO "chatProposals" (family,id,"workspaceId","userId","threadId","turnId",
        "payloadVersion",state,"requestId","inputHash",payload,"expiresAt","createdAt","resolvedAt")
      SELECT 'action',?::uuid,?::uuid,?::text,?::uuid,?::uuid,1,'confirmed',NULL,?::text,
        ?::jsonb,?::timestamptz,?::timestamptz,?::timestamptz
      FROM "leadDeletionAudit" WHERE id=? AND "workspaceId"=? AND "actorId"=? AND "leadId"=? AND "requestHash"=?
      RETURNING id`, [
      next.id, next.workspaceId, next.userId, next.threadId, next.turnId, next.inputHash,
      JSON.stringify(next.payload), next.expiresAt, next.createdAt, at,
      original.id, context.workspaceId, context.userId, receipt.lead.id, requestHash,
    ]);
    if (rows.length !== 1) throw new ChatProposalConflictError();
    await appendAudits(savepoint, context, [next], 'confirmed', at);
    return next;
  });
}

/** Conversion review is a pending-state audit event, never a business confirmation. */
export async function recordProposalReview(trx: Knex.Transaction, context: AuthorizationContext,
  binding: { family: 'estimateConversion'; id: string }, at: string,
  validate: (proposal: ChatProposal, transaction: Knex.Transaction) => Promise<void>) {
  boundary(trx, context); z.iso.datetime().parse(at);
  if (binding.family !== 'estimateConversion') throw new ChatProposalConflictError();
  const key = bindingSchema.parse(binding);
  return trx.transaction(async savepoint => {
    const proposal = await readInTransaction(savepoint, context, key, true);
    if (proposal.state !== 'pending') throw new ChatProposalConflictError();
    await validate(proposal, savepoint);
    await appendReviewInTransaction(savepoint, context, proposal, at);
    return proposal;
  });
}

/** Native Conversion validation already holds this proposal's lock in the supplied write transaction. */
export async function recordLockedProposalReview(trx: Knex.Transaction, context: AuthorizationContext,
  proposal: ChatProposal, at: string) {
  boundary(trx, context); z.iso.datetime().parse(at);
  if (proposal.workspaceId !== context.workspaceId || proposal.userId !== context.userId)
    throw new AuthorizationAccessError();
  return trx.transaction(savepoint => appendReviewInTransaction(savepoint, context, proposal, at));
}
async function appendReviewInTransaction(trx: Knex.Transaction, context: AuthorizationContext,
  proposal: ChatProposal, at: string) {
  if (proposal.family !== 'estimateConversion' || proposal.state !== 'pending') throw new ChatProposalConflictError();
  const { rows } = await trx.raw<{ rows: { id: string }[] }>(`
    INSERT INTO "chatProposalAudit" (id, family, "proposalId", "workspaceId", "actorId", action, "inputHash", details, "createdAt")
    SELECT ?::uuid, family, id, "workspaceId", ?::text, 'review-opened', "inputHash", '{}'::jsonb, ?::timestamptz
    FROM "chatProposals" WHERE "workspaceId"=? AND "userId"=? AND family=? AND id=? AND "inputHash"=? AND state='pending'
    RETURNING id`, [randomUUID(), context.userId, at, context.workspaceId, context.userId, proposal.family, proposal.id, proposal.inputHash]);
  if (rows.length !== 1) throw new ChatProposalConflictError();
}

/** Recorded states only; modern plain turns skip discovery and unknown legacy turns remain discoverable. */
export async function readProposalHistory(trx: Knex.Transaction, context: AuthorizationContext, turnIds: readonly string[],
  metadata?: ReadonlyMap<string, unknown>) {
  boundary(trx, context);
  const ids = z.array(z.uuid()).max(50).parse(turnIds);
  const declared = new Map<string, ChatProposalFamily[]>();
  for (const id of ids) {
    const value = metadata?.get(id);
    if (value != null) declared.set(id, z.array(chatProposalFamilySchema).parse(value));
  }
  const selected = ids.filter(id => !declared.has(id) || declared.get(id)!.length);
  if (!selected.length) return [];
  const rows: unknown[] = await trx('chatProposals').where(owned(context)).whereIn('turnId', selected)
    .andWhere(query => {
      for (const id of selected) query.orWhere(branch => {
        branch.where('turnId', id);
        if (declared.has(id)) branch.whereIn('family', declared.get(id)!);
      });
    }).distinctOn('turnId', 'family').select('turnId', 'family', 'state', 'payloadVersion')
    .orderBy('turnId').orderBy('family').orderBy('createdAt', 'desc').orderBy('id', 'desc');
  return z.array(z.object({
    turnId: z.uuid(), family: chatProposalFamilySchema, state: chatProposalStateSchema, payloadVersion: z.literal(1),
  }).strict()).parse(rows).map(({ turnId, family, state }) => ({ turnId, family, state }));
}

/** Bounded completed-source provenance for inherited evidence, in one owned proposal query. */
export async function readProposalEvidence(trx: Knex.Transaction, context: AuthorizationContext, threadId: string,
  requests: readonly { family: ChatProposalFamily; ids?: readonly string[]; turnIds?: readonly string[] }[]) {
  boundary(trx, context);
  const input = z.object({
    threadId: z.uuid(),
    requests: z.array(z.object({ family: chatProposalFamilySchema,
      ids: z.array(z.uuid()).max(50).optional(), turnIds: z.array(z.uuid()).max(50).optional() }).strict()).max(15),
  }).parse({ threadId, requests });
  const selected = input.requests.filter(request => request.ids?.length || request.turnIds?.length);
  if (!selected.length) return [];
  const rows: unknown[] = await trx('chatProposals as p').join('chatTurns as t', function () {
    this.on('t.id', 'p.turnId').andOn('t.workspaceId', 'p.workspaceId')
      .andOn('t.userId', 'p.userId').andOn('t.threadId', 'p.threadId');
  }).where({ 'p.workspaceId': context.workspaceId, 'p.userId': context.userId, 'p.threadId': threadId, 't.state': 'completed' })
    .andWhere(query => {
      for (const request of selected) query.orWhere(branch => {
        branch.where('p.family', request.family).andWhere(selector => {
          if (request.ids?.length) selector.orWhereIn('p.id', request.ids);
          if (request.turnIds?.length) selector.orWhereIn('p.turnId', request.turnIds);
        });
      });
    }).select('p.*');
  return rows.map(parseChatProposal);
}

import type { Knex } from 'knex';
import { z } from 'zod';
import {
  leadActionProposalPayloadSchema, customerProposalStoredSchema, workOrderProposalStoredSchema, materialProposalStoredSchema,
  type AuthorizationContext, type ChatProposal, type ChatProposalFamily,
} from '@salesmora/contracts';
import {
  createProposal, findOwnedProposal, readProposalRequest, saveProposalResolution, recordLockedProposalReview,
  supersedeProposals, replaceProposal, restoreDeletedLeadProposal,
} from './chat-proposals';
import { admittedChatTurn, stageAdmittedChatTurn } from './chat-request';

async function rememberProposalFamily(trx: Knex.Transaction, context: AuthorizationContext, turnId: string, family: ChatProposalFamily) {
  const identity = owned(context), turn = admittedChatTurn(identity, turnId);
  if (turn && turn.proposalFamilies != null) {
    if (turn.proposalFamilies.includes(family)) return;
    stageAdmittedChatTurn(identity, turnId, { proposalFamilies: [...turn.proposalFamilies, family] });
    return;
  }
  // Unknown historical metadata must not become a falsely complete family list.
  await trx('chatTurns').where({ ...identity, id: turnId }).whereNotNull('proposalFamilies')
    .whereRaw('NOT ("proposalFamilies" @> ?::jsonb)', [JSON.stringify([family])])
    .update({ proposalFamilies: trx.raw('"proposalFamilies" || ?::jsonb', [JSON.stringify([family])]) });
}

const timestamp = z.union([z.date(), z.iso.datetime()]).transform(value =>
  value instanceof Date ? value.toISOString() : value);
const routingSchema = z.object({
  id: z.uuid(), workspaceId: z.uuid(), userId: z.string().min(1), threadId: z.uuid(), turnId: z.uuid(),
  state: z.enum(['pending', 'confirmed', 'cancelled', 'superseded']),
  createdAt: timestamp, resolvedAt: timestamp.nullable(),
});
const owned = (context: AuthorizationContext) => ({ workspaceId: context.workspaceId, userId: context.userId });
// Keep original signed bindings and held locks off native/public row shapes.
const originals = new WeakMap<object, { proposal: ChatProposal; locked: boolean; transaction: Knex.Transaction }>();
const ticketBindingSchema = z.object({
  id: z.uuid(), inputHash: z.string(), createdAt: timestamp, expiresAt: timestamp,
});
const bindingSchema = z.union([
  z.object({ ticket: ticketBindingSchema }), z.object({ view: z.object({ draft: ticketBindingSchema }) }),
  z.object({ draft: ticketBindingSchema }),
  z.object({ view: z.object({ ticket: ticketBindingSchema.omit({ id: true }).extend({ proposalId: z.uuid() }) }) }),
]);
export function proposalStoredBinding(payload: unknown) {
  const parsed = bindingSchema.parse(payload);
  if ('ticket' in parsed) return parsed.ticket;
  if ('draft' in parsed) return parsed.draft;
  if ('draft' in parsed.view) return parsed.view.draft;
  return { ...parsed.view.ticket, id: parsed.view.ticket.proposalId };
}

type LeadPayload = z.infer<typeof leadActionProposalPayloadSchema>;
type LeadAction = LeadPayload['actionType'];
const leadRouting = routingSchema.extend({ inputHash: z.string(), expiresAt: timestamp });
type LeadRow = z.infer<typeof leadRouting> & LeadPayload;
export function leadStoredPayload(raw: unknown) {
  const columns = z.record(z.string(), z.unknown()).parse(raw);
  const payload = Object.fromEntries(
    ['actionType', 'capability', 'lead', 'accessHash', 'ownerSnapshot', 'leadId',
      'stagePayload', 'updatePayload', 'assignmentPayload', 'notePayload', 'archivePayload', 'exportPayload', 'deletePayload']
      .filter(key => columns[key] !== undefined).map(key => [key, columns[key]]),
  );
  return payload;
}
function leadPayload(raw: unknown) { return leadActionProposalPayloadSchema.parse(leadStoredPayload(raw)); }
const bindingFor = proposalStoredBinding;
/** Flat-column Lead codec; shares canonical repository, scope and exact-transaction lock handles. */
export const leadProposalStorage = {
  async read(trx: Knex.Transaction, context: AuthorizationContext, selector: { id: string } | { turnId: string }, lock = false): Promise<LeadRow | undefined> {
    const proposal = await findOwnedProposal(trx, context, 'action', selector, lock);
    if (!proposal) return undefined;
    if (proposal.family !== 'action') throw new Error('Expected a Lead proposal.');
    const row = { ...leadRouting.parse(proposal), ...proposal.payload };
    originals.set(row, { proposal, locked: lock, transaction: trx });
    return row;
  },
  async supersede(trx: Knex.Transaction, context: AuthorizationContext, threadId: string) {
    await supersedeProposals(trx, context, threadId, 'action', new Date().toISOString());
  },
  async insert<T extends { id: string; turnId: string; threadId: string; inputHash: string; expiresAt: Date | string; actionType: LeadAction }>(
    trx: Knex.Transaction, context: AuthorizationContext, columns: T,
  ) {
    const payload = leadPayload(columns), createdAt = new Date().toISOString();
    await createProposal(trx, context, {
      ...owned(context), id: columns.id, family: 'action', turnId: columns.turnId, threadId: columns.threadId,
      inputHash: columns.inputHash, expiresAt: timestamp.parse(columns.expiresAt), createdAt, resolvedAt: null,
      state: 'pending', payloadVersion: 1, requestId: null, payload,
    });
    await rememberProposalFamily(trx, context, columns.turnId, 'action');
    return { ...columns, ...owned(context), createdAt, resolvedAt: null, state: 'pending' as const };
  },
  async save(trx: Knex.Transaction, context: AuthorizationContext, row: { id: string; inputHash: string },
    state: 'confirmed' | 'cancelled', changes: { leadId?: string } = {}) {
    const original = lockedProposal(row, trx, 'action');
    if (original.family !== 'action') throw new Error('Expected a Lead proposal.');
    const payload = leadPayload({ ...original.payload, ...changes });
    await saveProposalResolution(trx, context, original, { ...original, state, payload }, new Date().toISOString());
  },
  async restoreDeletionReceipt(trx: Knex.Transaction, context: AuthorizationContext,
    row: { id: string; inputHash: string; turnId: string; threadId: string; accessHash: string; expiresAt: Date | string }, receipt: unknown) {
    const payload = leadPayload({ actionType: 'lead.delete', capability: 'leads.delete', lead: {}, accessHash: row.accessHash, deletePayload: receipt });
    const original = lockedProposal(row, trx, 'action');
    await restoreDeletedLeadProposal(trx, context, original, payload, new Date().toISOString());
  },
  async hasDeletionConfirmation(trx: Knex.Transaction, context: AuthorizationContext, row: { id: string; inputHash: string }) {
    return !!await trx('chatProposalAudit').where({
      workspaceId: context.workspaceId, actorId: context.userId, inputHash: row.inputHash,
      family: 'action', proposalId: row.id, action: 'draft.confirmed',
    }).first('id');
  },
};
function lockedProposal(row: object, trx: Knex.Transaction, family: ChatProposalFamily) {
  const original = originals.get(row);
  if (!original?.locked || original.transaction !== trx || original.proposal.family !== family || trx.isCompleted())
    throw new Error('Proposal resolution requires its proposal lock in this active transaction.');
  return original.proposal;
}

const columnRouting = routingSchema.omit({ state: true }).extend({
  inputHash: z.string(), expiresAt: timestamp, state: z.enum(['pending', 'confirmed', 'canceled', 'superseded']),
});
const columnEnvelope = z.object({ payload: z.unknown(), review: z.unknown(), accessHash: z.string(), customerStamp: z.string().optional() });
const columnShape = z.object({ payload: z.unknown(), review: z.object({ id: z.uuid(), inputHash: z.string(), expiresAt: timestamp }) });
function reviewedProposalStorage<S extends z.ZodType<z.output<typeof columnEnvelope>>>(
  families: readonly ('customer' | 'workOrder' | 'material')[], schema: S,
) {
  function familyFor(envelope: unknown) {
    if (families[0] === 'customer') return 'customer' as const;
    const kind = z.object({ payload: z.object({ kind: z.string() }) }).parse(envelope).payload.kind;
    return kind === 'material' || kind === 'material-export' ? 'material' as const : 'workOrder' as const;
  }
  return {
    async read(trx: Knex.Transaction, context: AuthorizationContext, selector: { id: string } | { turnId: string }, lock = false) {
      const proposal = await findOwnedProposal(trx, context, families, selector, lock);
      if (!proposal) return undefined;
      const envelope = schema.parse(structuredClone(proposal.payload));
      const row = { ...columnRouting.parse({ ...proposal, state: proposal.state === 'cancelled' ? 'canceled' : proposal.state }), ...envelope };
      originals.set(row, { proposal, locked: lock, transaction: trx });
      return row;
    },
    async insert(trx: Knex.Transaction, context: AuthorizationContext, turn: { id: string; threadId: string }, raw: unknown) {
      const envelope = schema.parse(raw), { review } = columnShape.parse(envelope);
      const family = familyFor(envelope);
      await replaceProposal(trx, context, {
        ...owned(context), family, id: review.id, turnId: turn.id, threadId: turn.threadId,
        inputHash: review.inputHash, expiresAt: review.expiresAt, createdAt: new Date().toISOString(),
        state: 'pending', resolvedAt: null, payloadVersion: 1, requestId: null, payload: envelope,
      });
      await rememberProposalFamily(trx, context, turn.id, family);
    },
    async save(trx: Knex.Transaction, context: AuthorizationContext, row: { id: string }, review: unknown,
      state: 'confirmed' | 'canceled', deleted = false) {
      const held = originals.get(row);
      if (!held || !families.some(family => family === held.proposal.family)) throw new Error('Expected an owned reviewed proposal handle.');
      const original = lockedProposal(row, trx, held.proposal.family);
      const envelope = schema.parse({ ...columnEnvelope.parse(original.payload), review, ...(deleted ? { payload: { kind: 'deleted' } } : {}) });
      await saveProposalResolution(trx, context, original, { ...original, payload: envelope, state: state === 'canceled' ? 'cancelled' : state }, new Date().toISOString());
    },
    async eraseOtherCustomerCopies(trx: Knex.Transaction, context: AuthorizationContext, keepId: string) {
      if (families[0] !== 'customer') throw new Error('Only Customer deletion erases Customer proposal copies.');
      await trx('chatProposals').where({ workspaceId: context.workspaceId, family: 'customer' }).whereNot({ id: keepId }).delete();
    },
  };
}
export const customerProposalStorage = reviewedProposalStorage(['customer'], customerProposalStoredSchema);
export const workOrderProposalStorage = reviewedProposalStorage(['workOrder', 'material'],
  z.union([workOrderProposalStoredSchema, materialProposalStoredSchema]));

export function proposalStorage<S extends z.ZodType>(family: ChatProposalFamily, schema: S) {
  const capture = family === 'captureSetup' || family === 'captureSource';
  return {
    async read(trx: Knex.Transaction, context: AuthorizationContext, selector: { id: string } | { turnId: string } | { requestId: string }, lock = false) {
      let proposal: ChatProposal | undefined;
      if ('requestId' in selector) {
        if ((family !== 'captureSetup' && family !== 'captureSource') || lock)
          throw new Error('Request lookup is only supported for Capture replay without locking.');
        proposal = await readProposalRequest(trx, context, family, selector.requestId);
      } else proposal = await findOwnedProposal(trx, context, family, selector, lock);
      if (!proposal) return undefined;
      const row = { ...routingSchema.parse(proposal), payload: schema.parse(proposal.payload) };
      originals.set(row, { proposal, locked: lock, transaction: trx });
      return row;
    },
    async insert(trx: Knex.Transaction, context: AuthorizationContext, turn: { id: string; threadId: string }, payload: z.output<S>, requestId: string | null = null) {
      const binding = bindingFor(payload);
      if (capture !== (requestId !== null)) throw new Error('Only Capture proposal insertion requires a request identity.');
      await createProposal(trx, context, {
        ...owned(context), family, id: binding.id, inputHash: binding.inputHash,
        createdAt: binding.createdAt, expiresAt: binding.expiresAt, threadId: turn.threadId, turnId: turn.id,
        payloadVersion: 1, state: 'pending', requestId, resolvedAt: null, payload,
      });
      await rememberProposalFamily(trx, context, turn.id, family);
    },
    async save(trx: Knex.Transaction, context: AuthorizationContext, row: { id: string; payload: z.output<S> },
      payload: z.output<S>, state: 'confirmed' | 'cancelled', at?: Date) {
      const original = lockedProposal(row, trx, family);
      await saveProposalResolution(trx, context, original, {
        ...original, payload, state,
      }, (at ?? new Date()).toISOString());
    },
    async review(trx: Knex.Transaction, context: AuthorizationContext, row: { id: string; payload: z.output<S> }) {
      if (family !== 'estimateConversion') throw new Error('Only Conversion persists a pending review event.');
      await recordLockedProposalReview(trx, context, lockedProposal(row, trx, family), new Date().toISOString());
    },
    async hasConfirmation(trx: Knex.Transaction, context: AuthorizationContext, id: string, inputHash: string) {
      return !!await trx('chatProposalAudit').where({
        workspaceId: context.workspaceId, actorId: context.userId, proposalId: id, action: 'confirmed', inputHash,
        family,
      }).first('id');
    },
  };
}

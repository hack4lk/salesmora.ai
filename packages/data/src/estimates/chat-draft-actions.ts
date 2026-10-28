import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema, estimateDraftActionChatBindingSchema, estimateDraftActionChatDecisionSchema, estimateDraftActionChatProposeSchema,
  estimateDraftActionChatReviewSchema, estimateDraftActionChatStoredSchema, estimateDraftActionChatViewSchema,
  type AuthorizationContext, type EstimateDraftActionChatStored, type EstimateDraftActionChatTicket,
  type EstimateDraftActionChatView, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import {
  duplicateEstimateInTransaction, reviseEstimateInTransaction, readEstimateDraftActionReviewInTransaction,
  readEstimateEditorInTransaction, EstimateDraftConflictError, EstimateDraftValidationError,
} from "./drafts";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority, estimateProposalDigest as digest, estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn, resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateDraftActionChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string; state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateDraftActionChatStored;
};
const conflict = () => new EstimateDraftConflictError("This Draft action changed or expired. Request a fresh review.");
const operation = (ticket: EstimateDraftActionChatTicket) => ticket.actionType === "estimate.revise" ? "revise" : "duplicate";
export function estimateDraftActionChatBinding(ticket: EstimateDraftActionChatTicket): Binding {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
    estimateId: ticket.source.id, expectedVersion: ticket.source.version,
  };
}
function inputHash(payload: EstimateDraftActionChatStored) {
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  return digest({ ticket, review: payload.review, stamp: payload.stamp });
}
async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateDraftActionAudit").insert({
    id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId,
    proposalId: row.id, action, inputHash: row.payload.ticket.inputHash,
  });
}
function publicView(payload: EstimateDraftActionChatStored, state = payload.ticket.state): EstimateDraftActionChatView {
  return estimateDraftActionChatViewSchema.parse({
    ticket: { ...payload.ticket, state }, review: payload.review, receipt: payload.receipt,
  });
}
async function checkedPayload(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateDraftActionChatStoredSchema.parse(row.payload);
  if (payload.ticket.id !== row.id ||
      (payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending")) ||
      payload.ticket.reviewHash !== digest(payload.review) || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  return payload;
}
function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateDraftActionChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateDraftActionChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  const review = await readEstimateDraftActionReviewInTransaction(trx, context, operation(payload.ticket), payload.ticket.source.id);
  if (payload.stamp !== await estimateChatStamp(trx, context) ||
      digest(review) !== digest({ source: payload.ticket.source, plan: payload.ticket.plan, ...payload.review })) throw conflict();
  return payload;
}
async function checkedResult(trx: Knex.Transaction, context: AuthorizationContext, payload: EstimateDraftActionChatStored) {
  const { receipt, ticket } = payload;
  if (!receipt) throw conflict();
  const { source, plan, ...review } = await readEstimateDraftActionReviewInTransaction(trx, context, operation(ticket), ticket.source.id);
  if (payload.resultStamp !== await estimateChatStamp(trx, context) || digest(source) !== digest(ticket.source) ||
      digest(estimateDraftActionChatReviewSchema.parse(review)) !== digest(payload.review) ||
      (operation(ticket) === "revise" && plan.existingDraft?.id !== receipt.id)) throw conflict();
  const seed = await readEstimateEditorInTransaction(trx, context, receipt.id);
  const saved = seed.estimate;
  const lineage = await trx("estimates").where({ workspaceId: context.workspaceId, id: receipt.id }).first("sourceEstimateId");
  if (!saved || saved.id !== receipt.id || saved.number !== receipt.number || saved.revision !== receipt.revision ||
      saved.version !== receipt.version || saved.updatedAt !== receipt.updatedAt || saved.status !== "draft" || saved.archived ||
      saved.parent.id !== payload.review.parent.id || saved.parent.type !== payload.review.parent.type ||
      digest(saved.values) !== digest(payload.review.values) ||
      !lineage || lineage.sourceEstimateId !== (operation(ticket) === "revise" ? ticket.source.id : null)) throw conflict();
}
async function visible(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  if (row.state === "confirmed") {
    await checkedResult(trx, context, payload);
    return publicView(payload);
  }
  await current(trx, context, row);
  return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
export async function proposeEstimateChatDraftAction(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateDraftActionChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const authorizationVersion = await authority(trx, context);
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
      ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null : null);
    let estimateId = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    if (request.operation === "revise" && ref?.toUpperCase().startsWith("EST-")) {
      const latest = await trx("estimates").where({ workspaceId: context.workspaceId, id: estimateId }).first("status", "sourceEstimateId");
      if (latest?.status === "draft" && latest.sourceEstimateId) estimateId = latest.sourceEstimateId;
    }
    const prepared = await readEstimateDraftActionReviewInTransaction(trx, context, request.operation, estimateId);
    const { source, plan, ...review } = prepared;
    const now = new Date();
    const ticket: EstimateDraftActionChatTicket = {
      id: randomUUID(), actionType: request.operation === "revise" ? "estimate.revise" : "estimate.duplicate",
      inputHash: "0".repeat(64), reviewHash: digest(review), authorizationVersion,
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString(),
      state: "pending", source, plan,
    };
    const payload: EstimateDraftActionChatStored = {
      ticket, review, receipt: null, stamp: await estimateChatStamp(trx, context), resultStamp: null,
    };
    ticket.inputHash = inputHash(payload);
    const stored = estimateDraftActionChatStoredSchema.parse(payload);
    await supersedeEstimateProposals(trx, context, turn);
    const [row] = await trx("chatEstimateDraftActions").insert({
      ...owned(context), id: ticket.id, turnId: turn.id, threadId: turn.threadId,
      payload: JSON.stringify(stored), createdAt: trx.raw("clock_timestamp()"),
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
    signal.throwIfAborted();
    return stored.ticket;
  });
}
export async function visibleEstimateChatDraftAction(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDraftActions").where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return undefined;
  try { return await visible(trx, context, row); }
  catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError || error instanceof EstimateDraftValidationError) return undefined;
    throw error;
  }
}
export async function readEstimateChatDraftAction(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
) {
  const binding = estimateDraftActionChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDraftActions").where({ ...identity, id: binding.proposalId }).first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) throw new AuthorizationAccessError();
    return visible(trx, context, row);
  });
}
export async function operateEstimateChatDraftAction(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, decision: "confirm" | "cancel" | "open",
) {
  const binding = estimateDraftActionChatBindingSchema.parse(raw);
  decision = estimateDraftActionChatDecisionSchema.shape.decision.parse(decision);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDraftActions").where({ ...identity, id: binding.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) throw new AuthorizationAccessError();
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
      const view = await visible(trx, context, row);
      return { view, ...(decision === "open" && view.receipt ? { href: `/estimates/${view.receipt.id}?workspace=${context.workspaceId}` } : {}) };
    }
    if (row.state !== "pending" || decision === "open") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "confirm") {
      const command = {
        workspaceId: context.workspaceId, estimateId: payload.ticket.source.id,
        expectedVersion: payload.ticket.source.version, submissionId: row.id,
      };
      const receipt = operation(payload.ticket) === "revise"
        ? await reviseEstimateInTransaction(trx, context, { ...command, snapshotHash: payload.review.snapshotHash }, "assistant-confirmed")
        : await duplicateEstimateInTransaction(trx, context, command, "assistant-confirmed");
      payload.receipt = { ...receipt, reused: payload.ticket.plan.kind === "reuse" };
      payload.resultStamp = await estimateChatStamp(trx, context);
      await checkedResult(trx, context, payload);
    }
    payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
    const stored = estimateDraftActionChatStoredSchema.parse(payload);
    await trx("chatEstimateDraftActions").where({ id: row.id }).update({
      state: stored.ticket.state, payload: JSON.stringify(stored), resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, stored.ticket.state);
    return { view: publicView(stored) };
  });
}
export async function estimateDraftActionChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDraftActions").where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return true;
  try {
    await visible(trx, context, row);
    return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError || error instanceof EstimateDraftValidationError) return false;
    throw error;
  }
}

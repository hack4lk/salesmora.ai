import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema, estimateDecisionChatBindingSchema, estimateDecisionChatCommand,
  estimateDecisionChatProposeSchema, estimateDecisionChatStoredSchema, estimateDecisionChatViewSchema,
  type AuthorizationContext, type EstimateDecisionChatInput, type EstimateDecisionChatStored,
  type EstimateDecisionChatTicket, type EstimateDecisionChatView, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError, readEstimateParentInTransaction } from "./drafts";
import { readEstimateDecisionReviewInTransaction, recordEstimateDecisionInTransaction } from "./decisions";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority, estimateProposalDigest as digest, estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn, resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateDecisionChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string; state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateDecisionChatStored;
};
const conflict = () => new EstimateDraftConflictError("This decision proposal changed or expired. Request a fresh review.");
export function estimateDecisionChatBinding(ticket: EstimateDecisionChatTicket): Binding {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version, snapshotHash: ticket.snapshotHash,
  };
}
function inputHash(payload: EstimateDecisionChatStored) {
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  return digest({ ticket, review: payload.review, value: payload.value, stamp: payload.stamp });
}
async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateDecisionAudit").insert({
    id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId,
    proposalId: row.id, action, inputHash: row.payload.ticket.inputHash,
  });
}
async function reviewFor(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
  const decision = await readEstimateDecisionReviewInTransaction(trx, context, estimateId);
  const row = await trx<{
    id: string; workspaceId: string; parentType: "lead" | "job"; leadId: string | null; jobId: string | null;
  }>("estimates")
    .where({ workspaceId: context.workspaceId, id: estimateId })
    .first("parentType", "leadId", "jobId");
  if (!row) throw new AuthorizationAccessError();
  const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
  if (!parentId) throw new AuthorizationAccessError();
  await readEstimateParentInTransaction(trx, context, row.parentType, parentId);
  const parent = await trx(row.parentType === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: parentId }).first("version");
  if (!parent) throw new AuthorizationAccessError();
  return {
    snapshotHash: decision.snapshotHash,
    review: {
      estimate: decision.estimate, today: decision.today, timezone: decision.timezone,
      canDecide: decision.canDecide, canCorrectDecision: decision.canCorrectDecision,
      parent: { type: row.parentType, id: parentId, version: Number(parent.version) },
    },
  };
}
async function prepare(
  trx: Knex.Transaction, context: AuthorizationContext, estimateId: string, request: EstimateDecisionChatInput,
): Promise<EstimateDecisionChatStored> {
  const { review, snapshotHash } = await reviewFor(trx, context, estimateId);
  const mode = request.operation === "decision" ? "record" : "correct";
  if (!review.canDecide || (mode === "correct" && !review.canCorrectDecision)) throw new AuthorizationAccessError();
  const saved = review.estimate, decision = saved.decision;
  const estimate = {
    id: saved.id, version: saved.version, number: saved.number, revision: saved.revision,
    name: saved.name, status: saved.status, archived: saved.archived, totalCents: saved.totalCents,
  };
  if (estimate.archived || (mode === "record"
    ? !["sent", "published"].includes(estimate.status) || decision !== null
    : !["accepted", "declined"].includes(estimate.status) || decision === null)) {
    throw new EstimateDraftValidationError(mode === "record"
      ? "Only an active Sent or Published Estimate can receive a decision."
      : "Only an active Accepted or Declined Estimate with a saved decision can be corrected.");
  }
  if (mode === "record" && request.reason !== null) {
    throw new EstimateDraftValidationError("A correction reason is only supported when correcting a saved decision.");
  }
  const previous = mode === "correct" ? decision : null;
  const now = new Date();
  const ticket: EstimateDecisionChatTicket = {
    id: randomUUID(), actionType: "estimate.decision", mode, inputHash: "0".repeat(64),
    authorizationVersion: await authority(trx, context), createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 900000).toISOString(), state: "pending", estimate, snapshotHash,
  };
  const fields: EstimateDecisionChatStored["value"] = {
    estimateId, expectedVersion: estimate.version,
    outcome: request.outcome ?? previous?.outcome ?? "",
    decisionDate: request.decisionDate ?? previous?.decisionDate ?? "",
    channel: request.channel ?? previous?.channel ?? "",
    note: request.note ?? previous?.note ?? "", reason: request.reason ?? "",
  };
  const payload: EstimateDecisionChatStored = {
    ticket, review, value: fields, canConfirm: !!estimateDecisionChatCommand({ ticket, review, value: fields }, context.workspaceId),
    receipt: null, stamp: await estimateChatStamp(trx, context),
  };
  ticket.inputHash = inputHash(payload);
  return estimateDecisionChatStoredSchema.parse(payload);
}
function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateDecisionChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateDecisionChatBinding(row.payload.ticket))) throw conflict();
}
function publicView(payload: EstimateDecisionChatStored, state = payload.ticket.state): EstimateDecisionChatView {
  return estimateDecisionChatViewSchema.parse({
    ticket: { ...payload.ticket, state }, review: payload.review, value: payload.value,
    canConfirm: payload.canConfirm, receipt: payload.receipt,
  });
}
async function checkedPayload(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateDecisionChatStoredSchema.parse(row.payload);
  if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  return payload;
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  if (payload.stamp !== await estimateChatStamp(trx, context)) throw conflict();
  const current = await reviewFor(trx, context, payload.ticket.estimate.id);
  if (current.snapshotHash !== payload.ticket.snapshotHash || digest(current.review) !== digest(payload.review)) throw conflict();
  return payload;
}
async function visible(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  if (row.state === "confirmed") {
    const receipt = payload.receipt;
    if (!receipt) throw conflict();
    const { review, snapshotHash } = await reviewFor(trx, context, receipt.estimateId);
    if (review.estimate.archived || review.estimate.version !== receipt.version ||
        review.estimate.decision?.id !== receipt.decisionId || review.estimate.status !== receipt.status ||
        snapshotHash !== payload.ticket.snapshotHash || digest(review.parent) !== digest(payload.review.parent)) throw conflict();
    return publicView(payload, "confirmed");
  }
  await current(trx, context, row);
  return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
}
export async function proposeEstimateChatDecision(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateDecisionChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
      ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null : null);
    const estimateId = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    const payload = await prepare(trx, context, estimateId, request);
    await supersedeEstimateProposals(trx, context, turn);
    const [row] = await trx("chatEstimateDecisions").insert({
      ...owned(context), id: payload.ticket.id, turnId: turn.id, threadId: turn.threadId,
      payload: JSON.stringify(payload), createdAt: trx.raw("clock_timestamp()"),
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
    signal.throwIfAborted();
    return payload.ticket;
  });
}
export async function visibleEstimateChatDecision(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDecisions").where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return undefined;
  try { return await visible(trx, context, row); }
  catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError) return undefined;
    throw error;
  }
}
export async function readEstimateChatDecision(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
) {
  const binding = estimateDecisionChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDecisions").where({ ...identity, id: binding.proposalId }).first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    await activeTurn(trx, context, row.turnId, true);
    return visible(trx, context, row);
  });
}
export async function operateEstimateChatDecision(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
  decision: "confirm" | "cancel" | "open",
) {
  const binding = estimateDecisionChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDecisions").where({ ...identity, id: binding.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    await activeTurn(trx, context, row.turnId, true);
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
      const view = await visible(trx, context, row);
      return { view, ...(decision === "open" ? { href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}` } : {}) };
    }
    if (row.state !== "pending" || decision === "open") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "confirm") {
      const command = estimateDecisionChatCommand(payload, context.workspaceId);
      if (!payload.canConfirm || !command) {
        throw new EstimateDraftValidationError("Provide the missing outcome, absolute date, channel or correction reason and request a fresh review before confirming.");
      }
      payload.receipt = await recordEstimateDecisionInTransaction(trx, context, command, "assistant-confirmed");
    }
    payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
    await trx("chatEstimateDecisions").where({ id: row.id }).update({
      state: payload.ticket.state, payload: JSON.stringify(payload), resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, payload.ticket.state);
    return { view: publicView(payload) };
  });
}
export async function estimateDecisionChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateDecisions").where({ ...owned(context), turnId }).orderBy("createdAt", "desc").first();
  if (!row) return true;
  try {
    const payload = await checkedPayload(trx, context, row);
    return row.state !== "pending" || Date.parse(payload.ticket.expiresAt) > Date.now();
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError) return false;
    throw error;
  }
}

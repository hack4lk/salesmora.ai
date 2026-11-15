import { randomUUID } from "node:crypto";
import { estimateProposalStorage } from "./proposal-storage";
import type { Knex } from "knex";
import {
  chatPageContextSchema, estimateVoidChatBindingSchema, estimateVoidChatDecisionSchema, estimateVoidChatProposeSchema,
  estimateVoidChatStoredSchema, estimateVoidChatViewSchema,
  type AuthorizationContext, type EstimateVoidChatStored, type EstimateVoidChatTicket, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError, loadEstimateLifecycleContext, readEstimateParentInTransaction } from "./drafts";
import { voidEstimateInTransaction } from "./lifecycle";
import { verifiedEstimateFrozenSnapshot } from "./sharing-paper";
import { estimateChatStamp } from "./chat-evidence";
import { rememberEstimateProposalEvidence } from "./chat-proposals";
import {
  estimateProposalAuthority as authority, estimateProposalDigest as digest, estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn, resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateVoidChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string; state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateVoidChatStored;
};
const conflict = () => new EstimateDraftConflictError("This Void proposal changed or expired. Request a fresh review.");
export function estimateVoidChatBinding(ticket: EstimateVoidChatTicket): Binding {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash, snapshotHash: ticket.snapshotHash,
    estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
  };
}
function inputHash(payload: EstimateVoidChatStored) {
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  return digest({ ticket, review: payload.review, canConfirm: payload.canConfirm, stamp: payload.stamp });
}
async function reviewFor(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
  const loaded = await loadEstimateLifecycleContext(trx, context, estimateId);
  const { row } = loaded;
  if (!loaded.canVoid) throw new AuthorizationAccessError();
  const frozen = await trx<{ workspaceId: string; estimateId: string; content: unknown; contentHash: string }>("estimate_snapshots")
    .where({ workspaceId: context.workspaceId, estimateId }).first();
  const snapshot = frozen && verifiedEstimateFrozenSnapshot(frozen.content, frozen.contentHash);
  const number = `EST-${String(row.estimateNumber).padStart(4, "0")}`;
  if (!snapshot || snapshot.content.number !== number || snapshot.content.revision !== row.revision) {
    throw new EstimateDraftValidationError("The frozen Estimate is unavailable. Reload before withdrawing it.");
  }
  const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
  if (!parentId) throw new AuthorizationAccessError();
  const { parent } = await readEstimateParentInTransaction(trx, context, row.parentType, parentId);
  const savedParent = await trx(row.parentType === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: parentId }).first("version");
  if (!savedParent) throw new AuthorizationAccessError();
  return {
    row, status: loaded.status, snapshotHash: frozen.contentHash,
    estimate: {
      id: row.id, version: row.version, number, revision: row.revision,
      name: snapshot.content.name, status: loaded.status, archived: row.archivedAt !== null,
    },
    review: {
      recipientName: snapshot.content.recipientName, totalCents: snapshot.amounts.totalCents,
      parent: { type: parent.type, id: parent.id, version: Number(savedParent.version), number: parent.number, name: parent.name },
      today: loaded.today, timezone: loaded.timezone,
    },
  };
}
function publicView(payload: EstimateVoidChatStored, state = payload.ticket.state) {
  return estimateVoidChatViewSchema.parse({
    ticket: { ...payload.ticket, state }, review: payload.review, canConfirm: payload.canConfirm, receipt: payload.receipt,
  });
}
async function checkedPayload(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateVoidChatStoredSchema.parse(row.payload);
  if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload) ||
      payload.ticket.reviewHash !== digest(payload.review) ||
      (payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending"))) throw conflict();
  if (!await trx("chatTurns").where({ ...owned(context), id: row.turnId, threadId: row.threadId }).first("id")) {
    throw new AuthorizationAccessError();
  }
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  return payload;
}
function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateVoidChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateVoidChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  const next = await reviewFor(trx, context, payload.ticket.estimate.id);
  if (payload.stamp !== await estimateChatStamp(trx, context) || next.snapshotHash !== payload.ticket.snapshotHash ||
      digest(next.estimate) !== digest(payload.ticket.estimate) ||
      digest({ ...next.review, reason: payload.review.reason }) !== payload.ticket.reviewHash) throw conflict();
  return payload;
}
async function checkedResult(trx: Knex.Transaction, context: AuthorizationContext, payload: EstimateVoidChatStored) {
  const { receipt, ticket } = payload;
  if (!receipt) throw conflict();
  const next = await reviewFor(trx, context, ticket.estimate.id);
  if (payload.resultStamp !== await estimateChatStamp(trx, context) || next.snapshotHash !== ticket.snapshotHash ||
      digest(next.estimate) !== digest({ ...ticket.estimate, status: "void", version: receipt.version }) ||
      digest({ ...next.review, reason: payload.review.reason }) !== ticket.reviewHash ||
      next.row.voidReason !== payload.review.reason || next.row.updatedAt.toISOString() !== receipt.updatedAt) throw conflict();
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
export async function proposeEstimateChatVoid(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateVoidChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const authorizationVersion = await authority(trx, context);
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
      ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null : null);
    const estimateId = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    const prepared = await reviewFor(trx, context, estimateId);
    if (prepared.estimate.archived || !["sent", "published"].includes(prepared.status)) {
      throw new EstimateDraftValidationError("Only an active Sent or Published Estimate can be withdrawn.");
    }
    if (request.reason !== null) {
      const message = await trx("chatMessages").where({ turnId, role: "user" }).first("text");
      if (!message || !message.text.includes(request.reason)) {
        throw new EstimateDraftValidationError("Quote a withdrawal reason supplied in the current user message, or request the missing reason.");
      }
    }
    const now = new Date();
    const review = { ...prepared.review, reason: request.reason ?? "" };
    const ticket = estimateVoidChatViewSchema.shape.ticket.parse({
      id: randomUUID(), actionType: "estimate.void", inputHash: "0".repeat(64), reviewHash: digest(review),
      authorizationVersion, snapshotHash: prepared.snapshotHash, state: "pending",
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString(), estimate: prepared.estimate,
    });
    const payload: EstimateVoidChatStored = {
      ticket, review, canConfirm: review.reason.length > 0, receipt: null,
      stamp: await estimateChatStamp(trx, context), resultStamp: null,
    };
    ticket.inputHash = inputHash(payload);
    const stored = estimateVoidChatStoredSchema.parse(payload);
    await supersedeEstimateProposals(trx, context, turn);
    await estimateProposalStorage.estimateVoid.insert(trx, context, turn, stored);
    await rememberEstimateProposalEvidence(trx, context, turn.id, payload.stamp, 'estimateVoidEvidence');
    signal.throwIfAborted();
    return ticket;
  });
}
export async function visibleEstimateChatVoid(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row = await estimateProposalStorage.estimateVoid.read(trx, context, { turnId });
  if (!row) return undefined;
  try { return await visible(trx, context, row); }
  catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError || error instanceof EstimateDraftValidationError) return undefined;
    throw error;
  }
}
export async function readEstimateChatVoid(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
) {
  const binding = estimateVoidChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row = await estimateProposalStorage.estimateVoid.read(trx, context, { id: binding.proposalId });
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) throw new AuthorizationAccessError();
    return visible(trx, context, row);
  });
}
export async function operateEstimateChatVoid(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, decision: "confirm" | "cancel" | "open",
) {
  const binding = estimateVoidChatBindingSchema.parse(raw);
  decision = estimateVoidChatDecisionSchema.shape.decision.parse(decision);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row = await estimateProposalStorage.estimateVoid.read(trx, context, { id: binding.proposalId }, true);
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) throw new AuthorizationAccessError();
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
      const view = await visible(trx, context, row);
      return { view, ...(decision === "open" ? { href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}` } : {}) };
    }
    if (row.state !== "pending" || decision === "open") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "confirm") {
      if (!payload.canConfirm) throw new EstimateDraftValidationError("Provide a withdrawal reason and request a fresh review before confirming.");
      payload.receipt = await voidEstimateInTransaction(trx, context, {
        workspaceId: context.workspaceId, estimateId: payload.ticket.estimate.id,
        expectedVersion: payload.ticket.estimate.version, submissionId: row.id, reason: payload.review.reason,
      }, "assistant-confirmed");
      payload.resultStamp = await estimateChatStamp(trx, context);
      await checkedResult(trx, context, payload);
    }
    const state = decision === "confirm" ? "confirmed" : "cancelled";
    payload.ticket.state = state;
    const stored = estimateVoidChatStoredSchema.parse(payload);
    await estimateProposalStorage.estimateVoid.save(trx, context, row, stored, state);
    return { view: publicView(stored) };
  });
}
export async function estimateVoidChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row = await estimateProposalStorage.estimateVoid.read(trx, context, { turnId });
  if (!row) return true;
  try {
    await visible(trx, context, row);
    return row.state !== "superseded" && (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError || error instanceof EstimateDraftValidationError) return false;
    throw error;
  }
}

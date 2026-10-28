import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema, estimateArchiveChatBindingSchema, estimateArchiveChatDecisionSchema, estimateArchiveChatProposeSchema,
  estimateArchiveChatStoredSchema, estimateArchiveChatViewSchema,
  type AuthorizationContext, type EstimateArchiveChatStored, type EstimateArchiveChatTicket, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError, loadEstimateLifecycleContext, readEstimateParentInTransaction } from "./drafts";
import { setEstimateArchivedInTransaction } from "./lifecycle";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority, estimateProposalDigest as digest, estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn, resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateArchiveChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string; state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateArchiveChatStored;
};
const conflict = () => new EstimateDraftConflictError("This Archive/Restore proposal changed or expired. Request a fresh review.");
const operation = (ticket: EstimateArchiveChatTicket) => ticket.actionType === "estimate.archive" ? "archive" : "restore";
export function estimateArchiveChatBinding(ticket: EstimateArchiveChatTicket): Binding {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
    estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
  };
}
function inputHash(payload: EstimateArchiveChatStored) {
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  return digest({ ticket, review: payload.review, stamp: payload.stamp });
}
async function audit(trx: Knex.Transaction, row: Row, action: "proposed" | Row["state"]) {
  await trx("chatEstimateArchiveAudit").insert({
    id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId,
    proposalId: row.id, action, inputHash: row.payload.ticket.inputHash,
  });
}
async function reviewFor(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
  const loaded = await loadEstimateLifecycleContext(trx, context, estimateId);
  const { row } = loaded;
  if (!loaded.canArchive) throw new AuthorizationAccessError();
  const parentId = row.parentType === "lead" ? row.leadId : row.jobId;
  if (!parentId) throw new AuthorizationAccessError();
  const { parent } = await readEstimateParentInTransaction(trx, context, row.parentType, parentId);
  const savedParent = await trx(row.parentType === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: parentId }).first("version");
  if (!savedParent) throw new AuthorizationAccessError();
  return {
    row,
    estimate: {
      id: row.id, version: row.version, number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
      revision: row.revision, name: row.name, status: loaded.status, archived: row.archivedAt !== null,
    },
    review: {
      recipientName: row.recipientName,
      parent: { type: parent.type, id: parent.id, version: Number(savedParent.version), number: parent.number, name: parent.name },
      today: loaded.today, timezone: loaded.timezone,
    },
  };
}
function publicView(payload: EstimateArchiveChatStored, state = payload.ticket.state) {
  return estimateArchiveChatViewSchema.parse({
    ticket: { ...payload.ticket, state }, review: payload.review, receipt: payload.receipt,
  });
}
async function checkedPayload(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateArchiveChatStoredSchema.parse(row.payload);
  if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload) ||
      payload.ticket.reviewHash !== digest(payload.review) ||
      (payload.ticket.state !== row.state && !(row.state === "superseded" && payload.ticket.state === "pending"))) throw conflict();
  if (!await trx("chatTurns").where({ ...owned(context), id: row.turnId, threadId: row.threadId, state: "completed" }).first("id")) {
    throw new AuthorizationAccessError();
  }
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  return payload;
}
function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateArchiveChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateArchiveChatBinding(row.payload.ticket))) throw conflict();
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  const next = await reviewFor(trx, context, payload.ticket.estimate.id);
  if (payload.stamp !== await estimateChatStamp(trx, context) ||
      digest(next.estimate) !== digest(payload.ticket.estimate) || digest(next.review) !== payload.ticket.reviewHash) throw conflict();
  return payload;
}
async function checkedResult(trx: Knex.Transaction, context: AuthorizationContext, payload: EstimateArchiveChatStored) {
  const { receipt, ticket } = payload;
  if (!receipt) throw conflict();
  const next = await reviewFor(trx, context, ticket.estimate.id);
  if (payload.resultStamp !== await estimateChatStamp(trx, context) ||
      digest(next.estimate) !== digest({ ...ticket.estimate, archived: receipt.archived, version: receipt.version }) ||
      digest(next.review) !== ticket.reviewHash || next.row.updatedAt.toISOString() !== receipt.updatedAt ||
      (receipt.archived ? next.row.archivedBy !== context.userId : next.row.archivedBy !== null)) throw conflict();
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
export async function proposeEstimateChatArchive(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateArchiveChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const authorizationVersion = await authority(trx, context);
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
      ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null : null);
    const estimateId = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    const prepared = await reviewFor(trx, context, estimateId);
    if (request.operation === "archive"
      ? prepared.estimate.archived || !["declined", "expired", "superseded", "void"].includes(prepared.estimate.status)
      : !prepared.estimate.archived) {
      throw new EstimateDraftValidationError(request.operation === "archive"
        ? "Only an unarchived Declined, Expired, Superseded or Void estimate can be archived."
        : "Only an archived estimate can be restored.");
    }
    const now = new Date();
    const ticket = estimateArchiveChatViewSchema.shape.ticket.parse({
      id: randomUUID(), actionType: request.operation === "archive" ? "estimate.archive" : "estimate.restore",
      inputHash: "0".repeat(64), reviewHash: digest(prepared.review), authorizationVersion, state: "pending",
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString(), estimate: prepared.estimate,
    });
    const payload: EstimateArchiveChatStored = {
      ticket, review: prepared.review, receipt: null, stamp: await estimateChatStamp(trx, context), resultStamp: null,
    };
    ticket.inputHash = inputHash(payload);
    const stored = estimateArchiveChatStoredSchema.parse(payload);
    await supersedeEstimateProposals(trx, context, turn, estimateId);
    const [row] = await trx("chatEstimateArchives").insert({
      ...owned(context), id: ticket.id, turnId: turn.id, threadId: turn.threadId,
      payload: JSON.stringify(stored), createdAt: trx.raw("clock_timestamp()"),
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
    signal.throwIfAborted();
    return ticket;
  });
}
export async function visibleEstimateChatArchive(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateArchives").where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return undefined;
  try { return await visible(trx, context, row); }
  catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError || error instanceof EstimateDraftValidationError) return undefined;
    throw error;
  }
}
export async function readEstimateChatArchive(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
) {
  const binding = estimateArchiveChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateArchives").where({ ...identity, id: binding.proposalId }).first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) throw new AuthorizationAccessError();
    return visible(trx, context, row);
  });
}
export async function operateEstimateChatArchive(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, decision: "confirm" | "cancel" | "open",
) {
  const binding = estimateArchiveChatBindingSchema.parse(raw);
  decision = estimateArchiveChatDecisionSchema.shape.decision.parse(decision);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateArchives").where({ ...identity, id: binding.proposalId }).forUpdate().first();
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
      payload.receipt = await setEstimateArchivedInTransaction(trx, context, {
        workspaceId: context.workspaceId, estimateId: payload.ticket.estimate.id,
        expectedVersion: payload.ticket.estimate.version, submissionId: row.id, mode: operation(payload.ticket),
      }, "assistant-confirmed");
      payload.resultStamp = await estimateChatStamp(trx, context);
      await checkedResult(trx, context, payload);
    }
    const state = decision === "confirm" ? "confirmed" : "cancelled";
    payload.ticket.state = state;
    const stored = estimateArchiveChatStoredSchema.parse(payload);
    await trx("chatEstimateArchives").where({ id: row.id }).update({
      state, payload: JSON.stringify(stored), resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, state);
    return { view: publicView(stored) };
  });
}
export async function estimateArchiveChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateArchives").where({ ...owned(context), turnId })
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

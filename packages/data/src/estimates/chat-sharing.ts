import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema, estimateEmailDestinationSchema,
  estimateShareChatBindingSchema, estimateShareChatProposeSchema, estimateShareChatStoredSchema,
  estimateShareChatViewSchema,
  type AuthorizationContext, type EstimateShareChatStored, type EstimateShareChatTicket,
  type EstimateShareChatView, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError } from "./drafts";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority, estimateProposalDigest as digest, estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn, resolveEstimateProposalId, supersedeEstimateProposals,
} from "./chat-proposals";
import { estimateSnapshotHash } from "./sharing-paper";
import { readEstimateSharingReviewInTransaction, shareEstimateInTransaction } from "./sharing";

type Binding = ReturnType<typeof estimateShareChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string; turnId: string; threadId: string; state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateShareChatStored;
};
const conflict = () => new EstimateDraftConflictError("This sharing proposal changed or expired. Request a fresh review.");
export function estimateShareChatBinding(ticket: EstimateShareChatTicket): Binding {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version, snapshotHash: ticket.snapshotHash,
  };
}
function inputHash(payload: EstimateShareChatStored) {
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  return digest({ ticket, review: payload.review, stamp: payload.stamp });
}
async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateShareAudit").insert({
    id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId,
    proposalId: row.id, action, inputHash: row.payload.ticket.inputHash,
  });
}
async function reviewFor(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const sharing = await readEstimateSharingReviewInTransaction(trx, context, id);
  const record = sharing.estimate.parent;
  if (!record.href) throw new AuthorizationAccessError();
  const parent = await trx(record.type === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: record.id }).first("version");
  if (!parent) throw new AuthorizationAccessError();
  return { sharing, parent: { type: record.type, id: record.id, version: Number(parent.version) } };
}
async function prepare(
  trx: Knex.Transaction, context: AuthorizationContext, id: string, mode: "send" | "publish" | "resend", email?: string,
): Promise<EstimateShareChatStored> {
  const { sharing, parent } = await reviewFor(trx, context, id);
  if (!sharing.canSend) throw new AuthorizationAccessError();
  const estimate = sharing.estimate;
  if (estimate.archived || (mode === "resend" ? estimate.status !== "sent" : estimate.status !== "draft")) {
    throw new EstimateDraftValidationError("Send and Publish require a saved unarchived Draft. Resend requires an active Sent Estimate.");
  }
  if (mode === "resend" && (sharing.delivery.link.state !== "active" ||
      ["not-sent", "queued"].includes(sharing.delivery.email.state))) {
    throw new EstimateDraftValidationError("Wait for the queued email to finish. Only active Sent Estimates without queued mail can be resent.");
  }
  const paper = mode === "resend" ? sharing.paper : sharing.draftPaper;
  if (!paper || !sharing.snapshotHash || sharing.issues.length) {
    throw new EstimateDraftValidationError(sharing.issues.join(" ") || "Complete the saved customer paper in the editor before sharing.");
  }
  const recipientEmail = email ?? (mode === "resend" && sharing.delivery.email.state !== "not-sent"
    ? sharing.delivery.email.recipientEmail : estimate.values.details.recipientEmail);
  if (mode !== "publish" && !estimateEmailDestinationSchema.safeParse({ recipientEmail, subject: sharing.subject }).success) {
    throw new EstimateDraftValidationError("Review and save a valid email destination before sending.");
  }
  const now = new Date();
  const ticket: EstimateShareChatTicket = {
    id: randomUUID(), actionType: `estimate.${mode}`, inputHash: "0".repeat(64),
    authorizationVersion: await authority(trx, context), createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 900000).toISOString(), state: "pending",
    estimate: {
      id, version: estimate.version, number: estimate.number, revision: estimate.revision,
      name: paper.content.name, status: estimate.status, archived: estimate.archived,
      totalCents: paper.amounts.totalCents, validUntil: paper.content.validUntil,
    },
    snapshotHash: sharing.snapshotHash, requiresDialog: mode !== "send" || sharing.revision !== null,
  };
  const payload: EstimateShareChatStored = {
    ticket, receipt: null, stamp: await estimateChatStamp(trx, context),
    review: {
      today: sharing.today, parent, recipientName: paper.content.recipientName, recipientEmail,
      subject: sharing.subject, snapshot: { formatVersion: 1, content: paper.content, amounts: paper.amounts },
      revision: mode === "resend" ? null : sharing.revision, delivery: sharing.delivery,
    },
  };
  ticket.inputHash = inputHash(payload);
  return estimateShareChatStoredSchema.parse(payload);
}
async function insert(
  trx: Knex.Transaction, context: AuthorizationContext, turn: { id: string; threadId: string }, payload: EstimateShareChatStored,
) {
  await supersedeEstimateProposals(trx, context, turn);
  const [row] = await trx("chatEstimateShares").insert({
    ...owned(context), id: payload.ticket.id, turnId: turn.id, threadId: turn.threadId,
    payload: JSON.stringify(payload), createdAt: trx.raw("clock_timestamp()"),
  }).returning("*");
  await audit(trx, row, "proposed");
  await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
  return payload;
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = estimateShareChatStoredSchema.parse(row.payload);
  if (payload.ticket.id !== row.id || payload.ticket.inputHash !== inputHash(payload)) throw conflict();
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) throw new AuthorizationAccessError();
  if (payload.stamp !== await estimateChatStamp(trx, context)) throw conflict();
  const { sharing, parent } = await reviewFor(trx, context, payload.ticket.estimate.id);
  if (sharing.estimate.version !== payload.ticket.estimate.version ||
      sharing.snapshotHash !== payload.ticket.snapshotHash || digest(parent) !== digest(payload.review.parent) ||
      estimateSnapshotHash(payload.review.snapshot) !== payload.ticket.snapshotHash) throw conflict();
  return payload;
}
function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateShareChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateShareChatBinding(row.payload.ticket))) throw conflict();
}
function publicView(payload: EstimateShareChatStored, state = payload.ticket.state): EstimateShareChatView {
  return estimateShareChatViewSchema.parse({
    ticket: { ...payload.ticket, state }, review: payload.review, receipt: payload.receipt,
  });
}
export async function proposeEstimateChatShare(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal,
) {
  const { request } = estimateShareChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
      ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null : null);
    const id = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    const payload = await prepare(trx, context, id, request.operation);
    await insert(trx, context, turn, payload);
    signal.throwIfAborted();
    return payload.ticket;
  });
}
export async function visibleEstimateChatShare(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateShares").where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc").orderBy("id", "desc").first();
  if (!row) return undefined;
  try {
    const payload = estimateShareChatStoredSchema.parse(row.payload);
    if (row.state === "confirmed") {
      if (payload.ticket.authorizationVersion !== await authority(trx, context) ||
          payload.ticket.inputHash !== inputHash(payload) || !payload.receipt) return undefined;
      const { sharing } = await reviewFor(trx, context, payload.receipt.estimateId);
      if (sharing.estimate.version !== payload.receipt.version || sharing.snapshotHash !== payload.receipt.snapshotHash) return undefined;
      return publicView(payload, "confirmed");
    }
    await current(trx, context, row);
    return publicView(payload, row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now() ? "expired" : row.state);
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError) return undefined;
    throw error;
  }
}
export async function readEstimateChatShare(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const binding = estimateShareChatBindingSchema.parse(raw);
    const row: Row | undefined = await trx("chatEstimateShares").where({ ...identity, id: binding.proposalId }).first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    await activeTurn(trx, context, row.turnId, true);
    const view = await visibleEstimateChatShare(trx, context, row.turnId);
    if (!view || view.ticket.id !== row.id) throw new AuthorizationAccessError();
    return view;
  });
}
export async function operateEstimateChatShare(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
  decision: "confirm" | "cancel" | "open", paymentLinkReviewed: boolean,
) {
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const binding = estimateShareChatBindingSchema.parse(raw);
    const row: Row | undefined = await trx("chatEstimateShares").where({ ...identity, id: binding.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    await activeTurn(trx, context, row.turnId, true);
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel") && !(decision === "open" && row.state === "confirmed")) throw conflict();
      const view = await visibleEstimateChatShare(trx, context, row.turnId);
      if (!view || view.ticket.id !== row.id) throw new AuthorizationAccessError();
      return { view, ...(decision === "open" ? { href: `/estimates/${view.ticket.estimate.id}?workspace=${context.workspaceId}` } : {}) };
    }
    if (row.state !== "pending" || decision === "open") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "confirm") {
      const revision = payload.review.revision;
      const receipt = await shareEstimateInTransaction(trx, context, {
        workspaceId: context.workspaceId, estimateId: payload.ticket.estimate.id,
        expectedVersion: payload.ticket.estimate.version, submissionId: row.id, snapshotHash: payload.ticket.snapshotHash,
        mode: payload.ticket.actionType.slice("estimate.".length),
        ...(payload.ticket.actionType !== "estimate.publish"
          ? { recipientEmail: payload.review.recipientEmail, subject: payload.review.subject } : {}),
        ...(revision ? { revisionReview: { sourceEstimateId: revision.sourceEstimateId, sourceVersion: revision.sourceVersion, paymentLinkReviewed } } : {}),
      }, "assistant-confirmed");
      payload.receipt = receipt;
    }
    payload.ticket.state = decision === "confirm" ? "confirmed" : "cancelled";
    await trx("chatEstimateShares").where({ id: row.id }).update({
      state: payload.ticket.state, payload: JSON.stringify(payload), resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, payload.ticket.state);
    return { view: publicView(payload) };
  });
}
export async function refreshEstimateChatShareRecipient(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, email: string,
) {
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const binding = estimateShareChatBindingSchema.parse(raw);
    const row: Row | undefined = await trx("chatEstimateShares").where({ ...identity, id: binding.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    const turn = await activeTurn(trx, context, row.turnId, true);
    const payload = await current(trx, context, row);
    if (row.state !== "pending" || payload.ticket.actionType !== "estimate.resend" || Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    const next = await prepare(trx, context, payload.ticket.estimate.id, "resend", email);
    return publicView(await insert(trx, context, turn, next));
  });
}
export async function estimateShareChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx("chatEstimateShares").where({ ...owned(context), turnId }).orderBy("createdAt", "desc").first();
  if (!row) return true;
  try {
    const payload = estimateShareChatStoredSchema.parse(row.payload);
    return payload.ticket.authorizationVersion === await authority(trx, context) &&
      (row.state !== "pending" || Date.parse(payload.ticket.expiresAt) > Date.now());
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

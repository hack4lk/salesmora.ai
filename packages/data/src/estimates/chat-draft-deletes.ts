import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema,
  estimateDraftDeleteChatBindingSchema,
  estimateDraftDeleteChatDecisionSchema,
  estimateDraftDeleteChatProposeSchema,
  estimateDraftDeleteChatStoredSchema,
  estimateDraftDeleteChatViewSchema,
  type AuthorizationContext,
  type EstimateDraftDeleteChatStored,
  type EstimateDraftDeleteChatTicket,
  type PermissionId,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import {
  deleteEstimateDraftInTransaction,
  readEstimateDraftDeletionReviewInTransaction,
  EstimateDraftConflictError,
  EstimateDraftValidationError,
} from "./drafts";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority,
  estimateProposalDigest as digest,
  estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn,
  resolveEstimateProposalId,
  supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateDraftDeleteChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string;
  turnId: string;
  threadId: string;
  state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateDraftDeleteChatStored;
};

const conflict = () => new EstimateDraftConflictError(
  "This Draft deletion proposal changed or expired. Request a fresh review.",
);

export function estimateDraftDeleteChatBinding(ticket: EstimateDraftDeleteChatTicket): Binding {
  return {
    proposalId: ticket.id,
    actionType: ticket.actionType,
    inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion,
    reviewHash: ticket.reviewHash,
    estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version,
  };
}

function inputHash(payload: EstimateDraftDeleteChatStored) {
  const ticket = Object.fromEntries(
    Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"),
  );
  return digest({ ticket, review: payload.review, stamp: payload.stamp });
}

async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateDraftDeleteAudit").insert({
    id: randomUUID(),
    workspaceId: row.workspaceId,
    actorId: row.userId,
    proposalId: row.id,
    action,
    inputHash: row.payload.ticket.inputHash,
  });
}

function publicView(payload: EstimateDraftDeleteChatStored, state = payload.ticket.state) {
  return estimateDraftDeleteChatViewSchema.parse({
    ticket: { ...payload.ticket, state },
    review: payload.review,
    receipt: payload.receipt,
  });
}

async function checkedPayload(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: Row,
) {
  const payload = estimateDraftDeleteChatStoredSchema.parse(row.payload);
  if (
    payload.ticket.id !== row.id ||
    payload.ticket.reviewHash !== digest(payload.review) ||
    payload.ticket.inputHash !== inputHash(payload) ||
    (payload.ticket.state !== row.state &&
      !(row.state === "superseded" && payload.ticket.state === "pending"))
  ) {
    throw conflict();
  }
  if (!await trx("chatTurns").where({
    ...owned(context),
    id: row.turnId,
    threadId: row.threadId,
    state: "completed",
  }).first("id")) {
    throw new AuthorizationAccessError();
  }
  if (payload.ticket.authorizationVersion !== await authority(trx, context)) {
    throw new AuthorizationAccessError();
  }
  return payload;
}

function checkedBinding(row: Row, raw: unknown) {
  const binding = estimateDraftDeleteChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateDraftDeleteChatBinding(row.payload.ticket))) {
    throw conflict();
  }
}

async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  const currentReview = await readEstimateDraftDeletionReviewInTransaction(
    trx,
    context,
    payload.ticket.estimate.id,
  );
  if (
    payload.stamp !== await estimateChatStamp(trx, context) ||
    digest(currentReview.estimate) !== digest(payload.ticket.estimate) ||
    digest(currentReview.review) !== payload.ticket.reviewHash
  ) {
    throw conflict();
  }
  return payload;
}

async function checkedResult(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  payload: EstimateDraftDeleteChatStored,
) {
  const { receipt, ticket } = payload;
  if (!receipt ||
      payload.resultStamp !== await estimateChatStamp(trx, context) ||
      await trx("estimates").where({
        workspaceId: context.workspaceId,
        id: ticket.estimate.id,
      }).first("id") ||
      !await trx("chatEstimateDraftDeleteAudit").where({
        workspaceId: context.workspaceId,
        actorId: context.userId,
        proposalId: ticket.id,
        action: "confirmed",
        inputHash: ticket.inputHash,
      }).first("id")) {
    throw conflict();
  }
}

async function visible(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = await checkedPayload(trx, context, row);
  if (row.state === "confirmed") {
    await checkedResult(trx, context, payload);
    return publicView(payload);
  }
  await current(trx, context, row);
  return publicView(
    payload,
    row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now()
      ? "expired"
      : row.state,
  );
}

export async function proposeEstimateChatDraftDelete(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  turnId: string,
  raw: unknown,
  signal: AbortSignal,
) {
  const { request } = estimateDraftDeleteChatProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const authorizationVersion = await authority(trx, context);
    const turn = await activeTurn(trx, context, turnId);
    const page = chatPageContextSchema.parse(turn.pageContext);
    const ref = request.estimateRef ?? (
      ["estimate.detail", "estimate.editor"].includes(turn.surfaceKey)
        ? page.recordRefs?.find(record => record.type === "estimate")?.id ?? null
        : null
    );
    const estimateId = await resolveEstimateProposalId(trx, context.workspaceId, ref);
    const prepared = await readEstimateDraftDeletionReviewInTransaction(trx, context, estimateId);
    const now = new Date();
    const ticket = estimateDraftDeleteChatViewSchema.shape.ticket.parse({
      id: randomUUID(),
      actionType: "estimate.delete-draft",
      inputHash: "0".repeat(64),
      authorizationVersion,
      reviewHash: digest(prepared.review),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 900000).toISOString(),
      state: "pending",
      estimate: prepared.estimate,
    });
    const payload: EstimateDraftDeleteChatStored = {
      ticket,
      review: prepared.review,
      receipt: null,
      stamp: await estimateChatStamp(trx, context),
      resultStamp: null,
    };
    ticket.inputHash = inputHash(payload);
    const stored = estimateDraftDeleteChatStoredSchema.parse(payload);
    await supersedeEstimateProposals(trx, context, turn);
    const [row] = await trx("chatEstimateDraftDeletes").insert({
      ...owned(context),
      id: ticket.id,
      turnId: turn.id,
      threadId: turn.threadId,
      payload: JSON.stringify(stored),
      createdAt: trx.raw("clock_timestamp()"),
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({ id: turn.id }).update({ estimateStamp: payload.stamp });
    signal.throwIfAborted();
    return ticket;
  });
}

export async function visibleEstimateChatDraftDelete(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  turnId: string,
) {
  const row: Row | undefined = await trx("chatEstimateDraftDeletes")
    .where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc")
    .orderBy("id", "desc")
    .first();
  if (!row) return undefined;
  try {
    return await visible(trx, context, row);
  } catch (error) {
    if (
      error instanceof AuthorizationAccessError ||
      error instanceof EstimateDraftConflictError ||
      error instanceof EstimateDraftValidationError
    ) {
      return undefined;
    }
    throw error;
  }
}

export async function readEstimateChatDraftDelete(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const binding = estimateDraftDeleteChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDraftDeletes")
      .where({ ...identity, id: binding.proposalId })
      .first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) {
      throw new AuthorizationAccessError();
    }
    return visible(trx, context, row);
  });
}

export async function operateEstimateChatDraftDelete(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = estimateDraftDeleteChatDecisionSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const { request: binding, decision, typedConfirmation } = input;
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateDraftDeletes")
      .where({ ...identity, id: binding.proposalId })
      .forUpdate()
      .first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) {
      throw new AuthorizationAccessError();
    }
    if (row.state === "confirmed" || row.state === "cancelled") {
      if (decision !== (row.state === "confirmed" ? "confirm" : "cancel")) {
        throw conflict();
      }
      const view = await visible(trx, context, row);
      if (row.state === "confirmed" && typedConfirmation !== view.ticket.estimate.number) {
        throw conflict();
      }
      return { view };
    }
    if (row.state !== "pending") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "confirm") {
      payload.receipt = await deleteEstimateDraftInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        estimateId: payload.ticket.estimate.id,
        expectedVersion: payload.ticket.estimate.version,
        typedConfirmation,
      });
      payload.resultStamp = await estimateChatStamp(trx, context);
    }
    const state = decision === "confirm" ? "confirmed" : "cancelled";
    payload.ticket.state = state;
    const stored = estimateDraftDeleteChatStoredSchema.parse(payload);
    await trx("chatEstimateDraftDeletes").where({ id: row.id }).update({
      state,
      payload: JSON.stringify(stored),
      resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, state);
    if (state === "confirmed") await checkedResult(trx, context, stored);
    return { view: publicView(stored) };
  });
}

export async function estimateDraftDeleteChatEvidenceAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  turnId: string,
) {
  const row: Row | undefined = await trx("chatEstimateDraftDeletes")
    .where({ ...owned(context), turnId })
    .orderBy("createdAt", "desc")
    .orderBy("id", "desc")
    .first();
  if (!row) return true;
  try {
    await visible(trx, context, row);
    return row.state !== "superseded" &&
      (row.state !== "pending" || Date.parse(row.payload.ticket.expiresAt) > Date.now());
  } catch (error) {
    if (
      error instanceof AuthorizationAccessError ||
      error instanceof EstimateDraftConflictError ||
      error instanceof EstimateDraftValidationError
    ) {
      return false;
    }
    throw error;
  }
}

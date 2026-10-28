import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  chatPageContextSchema,
  estimateConversionChatBindingSchema,
  estimateConversionChatDecisionSchema,
  estimateConversionChatProposeSchema,
  estimateConversionChatStoredSchema,
  estimateConversionChatViewSchema,
  type AuthorizationContext,
  type EstimateConversionChatStored,
  type EstimateConversionChatTicket,
  type PermissionId,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import {
  EstimateDraftConflictError,
  EstimateDraftValidationError,
} from "./drafts";
import { readEstimateConversionReviewInTransaction } from "./conversion";
import { estimateChatStamp } from "./chat-evidence";
import {
  estimateProposalAuthority as authority,
  estimateProposalDigest as digest,
  estimateProposalIdentity as owned,
  estimateProposalTurn as activeTurn,
  resolveEstimateProposalId,
  supersedeEstimateProposals,
} from "./chat-proposals";

type Binding = ReturnType<typeof estimateConversionChatBindingSchema.parse>;
type Row = WorkspaceIdentity & {
  id: string;
  turnId: string;
  threadId: string;
  state: "pending" | "confirmed" | "cancelled" | "superseded";
  payload: EstimateConversionChatStored;
};

const conflict = () => new EstimateDraftConflictError(
  "This Estimate conversion review changed or expired. Request a fresh review.",
);

export function estimateConversionChatBinding(ticket: EstimateConversionChatTicket): Binding {
  return {
    proposalId: ticket.id,
    actionType: ticket.actionType,
    inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion,
    estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version,
    snapshotHash: ticket.estimate.snapshotHash,
    sourceLeadId: ticket.estimate.parentId,
  };
}

function inputHash(payload: EstimateConversionChatStored) {
  const ticket = Object.fromEntries(
    Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"),
  );
  return digest({ ticket, review: payload.review, stamp: payload.stamp });
}

async function audit(trx: Knex.Transaction, row: Row, action: string) {
  await trx("chatEstimateConversionAudit").insert({
    id: randomUUID(),
    workspaceId: row.workspaceId,
    actorId: row.userId,
    proposalId: row.id,
    action,
    inputHash: row.payload.ticket.inputHash,
  });
}

function publicView(payload: EstimateConversionChatStored, state = payload.ticket.state) {
  return estimateConversionChatViewSchema.parse({
    ticket: { ...payload.ticket, state },
    review: payload.review,
  });
}

async function checkedPayload(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: Row,
) {
  const payload = estimateConversionChatStoredSchema.parse(row.payload);
  if (
    payload.ticket.id !== row.id ||
    payload.ticket.state !== row.state &&
      !(row.state === "superseded" && payload.ticket.state === "pending") ||
    payload.ticket.inputHash !== inputHash(payload)
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
  const binding = estimateConversionChatBindingSchema.parse(raw);
  if (digest(binding) !== digest(estimateConversionChatBinding(row.payload.ticket))) {
    throw conflict();
  }
}

async function current(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: Row,
) {
  const payload = await checkedPayload(trx, context, row);
  const review = await readEstimateConversionReviewInTransaction(
    trx,
    context,
    payload.ticket.estimate.id,
  );
  if (
    payload.stamp !== await estimateChatStamp(trx, context) ||
    digest(review) !== digest(payload.review)
  ) {
    throw conflict();
  }
  return payload;
}

async function visible(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: Row,
) {
  const payload = await current(trx, context, row);
  return publicView(
    payload,
    row.state === "pending" && Date.parse(payload.ticket.expiresAt) <= Date.now()
      ? "expired"
      : row.state,
  );
}

export async function proposeEstimateChatConversion(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  turnId: string,
  raw: unknown,
  signal: AbortSignal,
) {
  const { request } = estimateConversionChatProposeSchema.parse(raw);
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
    const review = await readEstimateConversionReviewInTransaction(trx, context, estimateId);
    const now = new Date();
    const ticket: EstimateConversionChatTicket = {
      id: randomUUID(),
      actionType: "estimate.convert",
      inputHash: "0".repeat(64),
      authorizationVersion,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 900000).toISOString(),
      state: "pending",
      estimate: review.estimate,
      customer: review.customer,
    };
    const payload: EstimateConversionChatStored = {
      ticket,
      review,
      stamp: await estimateChatStamp(trx, context),
    };
    ticket.inputHash = inputHash(payload);
    const stored = estimateConversionChatStoredSchema.parse(payload);
    await supersedeEstimateProposals(trx, context, turn);
    const [row] = await trx("chatEstimateConversions").insert({
      ...owned(context),
      id: ticket.id,
      turnId: turn.id,
      threadId: turn.threadId,
      payload: JSON.stringify(stored),
      createdAt: trx.raw("clock_timestamp()"),
    }).returning("*");
    await audit(trx, row, "proposed");
    await trx("chatTurns").where({ id: turn.id }).update({
      estimateStamp: payload.stamp,
    });
    signal.throwIfAborted();
    return ticket;
  });
}

export async function visibleEstimateChatConversion(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  turnId: string,
) {
  const row: Row | undefined = await trx("chatEstimateConversions")
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

export async function readEstimateChatConversion(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const binding = estimateConversionChatBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateConversions")
      .where({ ...identity, id: binding.proposalId })
      .first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) {
      throw new AuthorizationAccessError();
    }
    return { view: await visible(trx, context, row) };
  });
}

function canOpenConversionReview(payload: EstimateConversionChatStored) {
  const { review } = payload;
  return review.capabilities.read &&
    review.canCreateJob &&
    review.estimate.status === "accepted" &&
    !review.estimate.archived &&
    review.estimate.parentType === "lead" &&
    !review.estimate.convertedJobExists &&
    !review.estimate.sourceLeadHasJob &&
    !review.estimate.sourceLeadArchived &&
    review.customer.state !== "unavailable";
}

export async function operateEstimateChatConversion(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = estimateConversionChatDecisionSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const { request: binding, decision } = input;
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx("chatEstimateConversions")
      .where({ ...identity, id: binding.proposalId })
      .forUpdate()
      .first();
    if (!row) throw new AuthorizationAccessError();
    checkedBinding(row, binding);
    if ((await activeTurn(trx, context, row.turnId, true)).threadId !== row.threadId) {
      throw new AuthorizationAccessError();
    }
    if (row.state === "cancelled") {
      if (decision !== "cancel") throw conflict();
      return { view: await visible(trx, context, row) };
    }
    if (row.state !== "pending") throw conflict();
    const payload = await current(trx, context, row);
    if (Date.parse(payload.ticket.expiresAt) <= Date.now()) throw conflict();
    if (decision === "review") {
      if (!canOpenConversionReview(payload)) throw conflict();
      await audit(trx, row, "review-opened");
      return { view: publicView(payload) };
    }
    payload.ticket.state = "cancelled";
    const stored = estimateConversionChatStoredSchema.parse(payload);
    await trx("chatEstimateConversions").where({ id: row.id }).update({
      state: "cancelled",
      payload: JSON.stringify(stored),
      resolvedAt: trx.fn.now(),
    });
    await audit(trx, row, "cancelled");
    return { view: publicView(stored) };
  });
}

export async function estimateConversionChatEvidenceAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  turnId: string,
) {
  const row: Row | undefined = await trx("chatEstimateConversions")
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

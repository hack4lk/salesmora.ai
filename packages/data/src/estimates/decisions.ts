import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateDecisionCommandSchema, estimateIdSchema, estimateRecordedDecisionSchema,
  type AuthorizationContext, type EstimateDecisionReceipt, type EstimateDecisionReview, type PermissionId,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError, loadEstimateLifecycleContext } from "./drafts";
import { verifiedEstimateFrozenSnapshot } from "./sharing-paper";
import { stopEstimateDeliveries } from "./delivery";
import { notifyEstimateRecipients } from "../notifications/estimates";

async function decisionContext(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
  const loaded = await loadEstimateLifecycleContext(trx, context, estimateId);
  const frozen = await trx<{ id: string; workspaceId: string; estimateId: string; content: unknown; contentHash: string }>("estimate_snapshots")
    .where({ workspaceId: context.workspaceId, estimateId }).first();
  const snapshot = frozen && verifiedEstimateFrozenSnapshot(frozen.content, frozen.contentHash);
  if (!frozen || !snapshot ||
      snapshot.content.number !== `EST-${String(loaded.row.estimateNumber).padStart(4, "0")}` ||
      snapshot.content.revision !== loaded.row.revision) {
    throw new EstimateDraftValidationError("The frozen estimate is unavailable. Reload before recording a decision.");
  }
  const previous = await trx("estimate_decisions").where({ workspaceId: context.workspaceId, estimateId })
    .orderBy("estimateVersion", "desc")
    .select("*", trx.raw(`to_char("decisionDate", 'YYYY-MM-DD') AS "decisionDate"`)).first();
  const decision = previous ? { id: previous.id as string, ...estimateRecordedDecisionSchema.parse({
    outcome: previous.outcome, decisionDate: previous.decisionDate, channel: previous.channel, note: previous.note,
  }) } : null;
  if (decision && ((decision.outcome !== loaded.status && loaded.status !== "superseded") || previous.estimateVersion > loaded.row.version ||
      previous.snapshotId !== frozen.id || Number(previous.snapshotTotalCents) !== snapshot.amounts.totalCents)) {
    throw new EstimateDraftValidationError("The saved decision does not match this estimate. Reload before confirming.");
  }
  return { ...loaded, frozen, snapshot, decision };
}

async function convertedJob(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
  const job = await trx("jobs").where({ workspaceId: context.workspaceId, acceptedEstimateId: estimateId }).first();
  if (!job) return null;
  const team = await trx("jobTeamMembers").where({ workspaceId: context.workspaceId, jobId: job.id }).pluck("userId");
  if (!authorize(context, { permission: "jobs.read", resource: {
    kind: "job", id: job.id, workspaceId: context.workspaceId, ownerId: job.primaryOwnerId, teamUserIds: team,
  } }).allowed) return null;
  return {
    number: `J-${String(job.jobNumber).padStart(4, "0")}`,
    href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
  };
}

function canConvertToJob(
  context: AuthorizationContext,
  lead: { id: string; ownerId: string | null },
) {
  const customerScope = resolveAuthorizedCollectionScope(context, "customers.read");
  const resource = {
    kind: "job" as const,
    id: context.workspaceId,
    workspaceId: context.workspaceId,
    ownerId: context.userId,
    teamUserIds: [],
  };
  return authorize(context, { permission: "jobs.create" }).allowed
    && authorize(context, { permission: "jobs.assign", resource }).allowed
    && resolveAuthorizedCollectionScope(context, "jobs.read").allowed
    && customerScope.allowed && customerScope.scope === "workspace"
    && authorize(context, {
      permission: "leads.read",
      resource: { kind: "lead", id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId },
    }).allowed;
}

export async function readEstimateDecisionReview(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], estimateId: string,
): Promise<EstimateDecisionReview> {
  estimateIdSchema.parse(estimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) =>
    readEstimateDecisionReviewInTransaction(trx, context, estimateId));
}

/** Callers must hold the workspace authorization transaction. */
export async function readEstimateDecisionReviewInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, estimateId: string,
): Promise<EstimateDecisionReview> {
  estimateIdSchema.parse(estimateId);
  const { row, status, timezone, today, canDecide, canCorrectDecision, frozen, snapshot, decision } =
    await decisionContext(trx, context, estimateId);
  const convertedJobExists = !!(await trx("jobs")
    .where({ workspaceId: context.workspaceId, acceptedEstimateId: estimateId })
    .first("id"));
  const lead = row.parentType === "lead" && row.leadId
    ? await trx("leads").where({ workspaceId: context.workspaceId, id: row.leadId })
      .first("id", "ownerId", "archivedAt")
    : undefined;
  const sourceLeadHasJob = !!lead && !!(await trx("jobs")
    .where({ workspaceId: context.workspaceId, sourceLeadId: lead.id })
    .first("id"));
  return {
    estimate: {
      id: row.id, number: `EST-${String(row.estimateNumber).padStart(4, "0")}`, revision: row.revision,
      version: row.version, name: snapshot.content.name, recipientName: snapshot.content.recipientName,
      totalCents: snapshot.amounts.totalCents, status, archived: row.archivedAt !== null, decision,
    },
    snapshotHash: frozen.contentHash, timezone, today, canDecide, canCorrectDecision,
    canConvertToJob: status === "accepted" && !row.archivedAt && row.parentType === "lead" &&
      !!lead && !lead.archivedAt && !convertedJobExists && !sourceLeadHasJob && canConvertToJob(context, lead),
    convertedJob: await convertedJob(trx, context, estimateId),
  };
}

export async function recordEstimateDecision(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateDecisionReceipt> {
  const input = estimateDecisionCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    recordEstimateDecisionInTransaction(trx, context, input));
}

/** Callers must hold the exclusive workspace authorization transaction. */
export async function recordEstimateDecisionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
  source: "ui" | "assistant-confirmed" = "ui",
): Promise<EstimateDecisionReceipt> {
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  const input = estimateDecisionCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const { row, status, canDecide, canCorrectDecision, today, timezone, frozen, snapshot, decision } =
    await decisionContext(trx, context, input.estimateId);
  if (!canDecide || (input.mode === "correct" && !canCorrectDecision)) throw new AuthorizationAccessError();
  const inputHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const prior = await trx("estimate_operation_receipts").where({
    workspaceId: identity.workspaceId, submissionId: input.submissionId,
  }).first();
  if (prior) {
    if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId ||
        prior.operation !== "decision" || prior.inputHash !== inputHash || prior.version !== row.version ||
        !decision || decision.outcome !== input.outcome || input.snapshotHash !== frozen.contentHash) {
      throw new EstimateDraftConflictError("This confirmation was already used or the recorded decision changed. Reload and review.");
    }
    return { estimateId: row.id, decisionId: decision.id, status: decision.outcome, version: row.version, updatedAt: row.updatedAt.toISOString() };
  }
  if (row.version !== input.expectedVersion || input.snapshotHash !== frozen.contentHash ||
      input.expectedDecisionId !== (decision?.id ?? null)) throw new EstimateDraftConflictError();
  if (row.archivedAt || (input.mode === "record"
    ? !["sent", "published"].includes(status) || !!decision
    : !["accepted", "declined"].includes(status) || !decision)) {
    throw new EstimateDraftValidationError(input.mode === "record"
      ? "Only an active Sent or Published estimate can receive a decision."
      : "Only an active Accepted or Declined estimate with a saved decision can be corrected.");
  }
  if (input.decisionDate > today) throw new EstimateDraftValidationError("The decision date cannot be later than today in the workspace timezone.");
  const decisionId = randomUUID();
  const version = row.version + 1;
  await trx("estimate_decisions").insert({
    id: decisionId, workspaceId: identity.workspaceId, estimateId: row.id, snapshotId: frozen.id,
    previousDecisionId: decision?.id ?? null, estimateVersion: version,
    outcome: input.outcome, decisionDate: input.decisionDate, channel: input.channel,
    note: input.note, reason: input.mode === "correct" ? input.reason : null,
    snapshotTotalCents: snapshot.amounts.totalCents, actorId: identity.userId,
  });
  const [updated] = await trx("estimates").where({ workspaceId: identity.workspaceId, id: row.id, version: input.expectedVersion })
    .update({
      status: input.outcome, decidedAt: trx.raw("(?::date)::timestamp AT TIME ZONE ?", [input.decisionDate, timezone]),
      decidedBy: identity.userId, decisionChannel: input.channel, decisionNote: input.note,
      acceptedTotalCents: input.outcome === "accepted" ? snapshot.amounts.totalCents : null,
      version, updatedAt: trx.fn.now(),
    }).returning(["updatedAt"]);
  if (!updated) throw new EstimateDraftConflictError();
  await stopEstimateDeliveries(trx, identity.workspaceId, row.id);
  const actor = await trx("users").where({ id: identity.userId }).first("name");
  await trx("estimate_activity").insert({
    id: randomUUID(), workspaceId: identity.workspaceId, estimateId: row.id,
    actorId: identity.userId, actorName: actor.name, source,
    type: input.mode === "record" ? "decision-recorded" : "decision-corrected",
    changes: JSON.stringify({
      status: { before: status, after: input.outcome },
      decision: { outcome: input.outcome, decisionDate: input.decisionDate, channel: input.channel, note: input.note },
      ...(input.mode === "correct" ? { reason: input.reason } : {}),
    }),
  });
  await notifyEstimateRecipients(trx, {
    workspaceId: identity.workspaceId,
    estimateId: row.id,
    event: "decision_recorded",
    dedupeKey: `estimate:${row.id}:decision:${decisionId}`,
    actorId: identity.userId,
  }, context.enabledPermissions);
  await trx("estimate_operation_receipts").insert({
    workspaceId: identity.workspaceId, submissionId: input.submissionId, actorId: identity.userId,
    operation: "decision", inputHash, estimateId: row.id, version,
  });
  return { estimateId: row.id, decisionId, status: input.outcome, version, updatedAt: updated.updatedAt.toISOString() };
}

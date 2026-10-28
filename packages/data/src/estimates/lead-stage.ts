import { createHash } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateLeadStageCommandSchema, estimateLeadStageQuerySchema, estimateLeadStageReviewSchema,
  type AuthorizationContext, type EstimateLeadStageQuery, type EstimateLeadStageReceipt,
  type EstimateLeadStageReview, type PermissionId,
} from "@salesmora/contracts";
import { authorize, getEstimateLeadStageTarget } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { LeadStageConflictError, moveLeadStageInTransaction } from "../leads/stage";
import { EstimateDraftConflictError, loadEstimateLifecycleContext } from "./drafts";

const changed = "The estimate or lead changed. Reload details and review the current records before confirming.";

async function reviewInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, input: EstimateLeadStageQuery,
): Promise<EstimateLeadStageReview> {
  const { row, status } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
  if (row.parentType !== "lead" || !row.leadId) throw new AuthorizationAccessError();
  const lead = await trx("leads").where({ workspaceId: context.workspaceId, id: row.leadId }).first();
  const resource = lead && { kind: "lead" as const, id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId };
  if (!lead || !resource || !authorize(context, { permission: "leads.read", resource }).allowed) {
    throw new AuthorizationAccessError();
  }
  const source = await trx("estimate_operation_receipts").where({
    workspaceId: context.workspaceId, estimateId: row.id, submissionId: input.sourceSubmissionId, actorId: context.userId,
  }).first();
  if (!source || source.version !== input.expectedEstimateVersion || row.version !== input.expectedEstimateVersion) {
    throw new EstimateDraftConflictError(changed);
  }
  let event: EstimateLeadStageReview["event"];
  if (source.operation === "send") {
    event = { kind: "send" };
  } else if (source.operation === "decision") {
    const decision = await trx("estimate_decisions").where({
      workspaceId: context.workspaceId, estimateId: row.id, estimateVersion: source.version,
    }).first("outcome", "previousDecisionId");
    if (!decision || decision.outcome !== "declined") throw new EstimateDraftConflictError(changed);
    const previous = decision.previousDecisionId ? await trx("estimate_decisions").where({
      workspaceId: context.workspaceId, estimateId: row.id, id: decision.previousDecisionId,
    }).first("outcome") : null;
    if (decision.previousDecisionId && !previous) throw new EstimateDraftConflictError(changed);
    event = { kind: "decision", outcome: "declined", previousOutcome: previous?.outcome ?? null };
  } else {
    throw new EstimateDraftConflictError(changed);
  }
  const result = estimateLeadStageReviewSchema.parse({
    estimate: {
      id: row.id, number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
      revision: row.revision, version: row.version, status, archived: !!row.archivedAt,
    },
    event,
    lead: {
      id: lead.id, number: `LD-${String(lead.leadNumber).padStart(4, "0")}`, name: lead.name,
      version: lead.version, stage: lead.stage, archived: !!lead.archivedAt,
      canMove: authorize(context, { permission: "leads.stage.update", resource }).allowed,
    },
    target: null,
  });
  result.target = getEstimateLeadStageTarget({
    ...result.estimate, event, parentType: "lead", canRead: true, lead: result.lead,
  });
  return result;
}

export async function readEstimateLeadStageReview(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateLeadStageReview> {
  const input = estimateLeadStageQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) => reviewInTransaction(trx, context, input));
}

/** Context validation and the existing lead mutation commit under the same workspace lock. */
export async function confirmEstimateLeadStage(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateLeadStageReceipt> {
  const input = estimateLeadStageCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const review = await reviewInTransaction(trx, context, input);
    if (review.lead.id !== input.leadId || !review.lead.canMove) throw new AuthorizationAccessError();
    const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("leadActivity").where({ workspaceId: identity.workspaceId, id: input.submissionId }).first();
    if (prior) {
      if (prior.leadId !== input.leadId || prior.actorId !== identity.userId || prior.type !== "stage" ||
          prior.changes.estimateSuggestion?.requestHash !== requestHash) throw new EstimateDraftConflictError(changed);
    } else if (review.lead.version !== input.expectedLeadVersion || review.target !== input.to) {
      throw new EstimateDraftConflictError(changed);
    }
    let result: { version: number };
    try {
      result = await moveLeadStageInTransaction(trx, context, {
        workspaceId: identity.workspaceId, leadId: input.leadId, submissionId: input.submissionId,
        expectedVersion: input.expectedLeadVersion, to: input.to, reason: input.reason,
      });
    } catch (error) {
      if (error instanceof LeadStageConflictError) throw new EstimateDraftConflictError(changed);
      throw error;
    }
    if (!prior) {
      const activity = await trx("leadActivity").where({ workspaceId: identity.workspaceId, id: input.submissionId }).first("changes");
      await trx("leadActivity").where({ workspaceId: identity.workspaceId, id: input.submissionId }).update({
        changes: JSON.stringify({
          ...activity.changes,
          estimateSuggestion: { estimateId: input.estimateId, sourceSubmissionId: input.sourceSubmissionId, requestHash },
        }),
      });
    }
    return { estimateId: input.estimateId, leadId: input.leadId, submissionId: input.submissionId, version: result.version };
  });
}

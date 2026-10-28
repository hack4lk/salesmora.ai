import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateArchiveEvidenceSchema, estimateChatEstimateRefSchema, estimateConversionEvidenceSchema,
  estimateDecisionEvidenceSchema, estimateDraftActionEvidenceSchema, estimateDraftDeleteEvidenceSchema,
  estimateVoidEvidenceSchema, type AuthorizationContext,
} from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import { AuthorizationAccessError, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError } from "./drafts";

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  return value && typeof value === "object"
    ? Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonical(entry)]))
    : value;
}
export const estimateProposalDigest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
export const estimateProposalIdentity = (context: AuthorizationContext): WorkspaceIdentity =>
  ({ userId: context.userId, workspaceId: context.workspaceId });

export async function estimateProposalAuthority(trx: Knex.Transaction, context: AuthorizationContext) {
  if (!authorize(context, { permission: "assistant.use" }).allowed) throw new AuthorizationAccessError();
  const row = await trx("workspaceMemberships").where(estimateProposalIdentity(context))
    .select(trx.raw("xmin::text AS version")).first();
  if (!row) throw new AuthorizationAccessError();
  return estimateProposalDigest([{ ...context, policy: { ...context.policy, grants: [...context.policy.grants]
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))) },
  enabledPermissions: [...context.enabledPermissions].sort() }, row.version]);
}
export async function estimateProposalTurn(trx: Knex.Transaction, context: AuthorizationContext, turnId: string, completed = false) {
  const turn = await trx("chatTurns").where({ ...estimateProposalIdentity(context), id: turnId })
    .first("id", "threadId", "state", "leaseUntil", "surfaceKey", "pageContext");
  if (!turn || !["home", "estimates.list", "estimate.detail", "estimate.editor", "lead.detail", "customer.detail"].includes(turn.surfaceKey)) {
    throw new AuthorizationAccessError();
  }
  if (completed ? turn.state !== "completed" : !["accepted", "running"].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) {
    throw new EstimateDraftConflictError("The conversation must finish before using this proposal.");
  }
  return turn;
}
export async function resolveEstimateProposalId(trx: Knex.Transaction, workspaceId: string, ref: string | null) {
  if (!ref || !estimateChatEstimateRefSchema.safeParse(ref).success) {
    throw new EstimateDraftValidationError("Provide one exact Estimate number or ID.");
  }
  const numbered = ref.toUpperCase().startsWith("EST-");
  const number = Number(ref.slice(4));
  if (numbered && (number <= 0 || number > 2147483647)) throw new EstimateDraftValidationError("Use a supported exact Estimate number.");
  const row = await trx("estimates").where({ workspaceId })
    .where(numbered ? { estimateNumber: number } : { id: ref }).orderBy("revision", "desc").first("id");
  if (!row) throw new AuthorizationAccessError();
  return row.id as string;
}
export async function supersedeEstimateProposals(
  trx: Knex.Transaction, context: AuthorizationContext, turn: { id: string; threadId: string },
  replacingArchiveEstimateId?: string,
) {
  const replacedDecisions = new Set<string>(), replacedDraftActions = new Set<string>(),
    replacedVoids = new Set<string>(), replacedArchives = new Set<string>(),
    replacedDraftDeletes = new Set<string>(), replacedConversions = new Set<string>();
  for (const [table, audit, kind] of [
    ["chatEstimateDrafts", "chatEstimateDraftAudit", "draft"],
    ["chatEstimateShares", "chatEstimateShareAudit", "share"],
    ["chatEstimateDecisions", "chatEstimateDecisionAudit", "decision"],
    ["chatEstimateDraftActions", "chatEstimateDraftActionAudit", "draft-action"],
    ["chatEstimateVoids", "chatEstimateVoidAudit", "void"],
    ["chatEstimateArchives", "chatEstimateArchiveAudit", "archive"],
    ["chatEstimateDraftDeletes", "chatEstimateDraftDeleteAudit", "draft-delete"],
    ["chatEstimateConversions", "chatEstimateConversionAudit", "conversion"],
  ] as const) {
    const older = await trx(table).where({ ...estimateProposalIdentity(context), threadId: turn.threadId, state: "pending" })
      .update({ state: "superseded", resolvedAt: trx.fn.now() }).returning(["id", "turnId", "payload"]);
    for (const row of older) {
      if (kind === "decision") replacedDecisions.add(row.turnId);
      if (kind === "draft-action") replacedDraftActions.add(row.turnId);
      if (kind === "void") replacedVoids.add(row.turnId);
      if (kind === "archive") replacedArchives.add(row.turnId);
      if (kind === "draft-delete") replacedDraftDeletes.add(row.turnId);
      if (kind === "conversion") replacedConversions.add(row.turnId);
    }
    for (const row of older) await trx(audit).insert({
      id: randomUUID(), workspaceId: context.workspaceId, actorId: context.userId,
      proposalId: row.id, action: "superseded",
      inputHash: kind === "draft" ? row.payload.view.draft.inputHash : row.payload.ticket.inputHash,
    });
  }
  if (replacedDecisions.size || replacedDraftActions.size || replacedVoids.size ||
      replacedArchives.size || replacedDraftDeletes.size || replacedConversions.size ||
      replacingArchiveEstimateId) {
    const current = await trx("chatTurns").where({
      ...estimateProposalIdentity(context), id: turn.id, threadId: turn.threadId,
    }).first("estimateDecisionEvidence", "estimateDraftActionEvidence", "estimateVoidEvidence",
      "estimateArchiveEvidence", "estimateDraftDeleteEvidence", "estimateConversionEvidence");
    if (!current) throw new AuthorizationAccessError();
    const archiveEvidence = estimateArchiveEvidenceSchema.parse(current.estimateArchiveEvidence ?? []);
    const sameEstimateArchiveEvidence = replacingArchiveEstimateId && archiveEvidence.length
      ? new Set((await trx("chatEstimateArchives").where({
        ...estimateProposalIdentity(context), threadId: turn.threadId,
      }).whereIn("turnId", archiveEvidence).select("turnId", "payload"))
        .filter(row => row.payload.ticket.estimate.id === replacingArchiveEstimateId)
        .map(row => row.turnId))
      : new Set<string>();
    // The new authorized intent replaces only its own inherited pending sources, never other turns or confirmed receipts.
    await trx("chatTurns").where({ id: turn.id }).update({
      estimateDecisionEvidence: JSON.stringify(estimateDecisionEvidenceSchema.parse(current.estimateDecisionEvidence ?? [])
        .filter(id => !replacedDecisions.has(id))),
      estimateDraftActionEvidence: JSON.stringify(estimateDraftActionEvidenceSchema.parse(current.estimateDraftActionEvidence ?? [])
        .filter(id => !replacedDraftActions.has(id))),
      estimateVoidEvidence: JSON.stringify(estimateVoidEvidenceSchema.parse(current.estimateVoidEvidence ?? [])
        .filter(id => !replacedVoids.has(id))),
      estimateArchiveEvidence: JSON.stringify(estimateArchiveEvidenceSchema.parse(current.estimateArchiveEvidence ?? [])
        .filter(id => !replacedArchives.has(id) && !sameEstimateArchiveEvidence.has(id))),
      estimateDraftDeleteEvidence: JSON.stringify(estimateDraftDeleteEvidenceSchema.parse(current.estimateDraftDeleteEvidence ?? [])
        .filter(id => !replacedDraftDeletes.has(id))),
      estimateConversionEvidence: JSON.stringify(estimateConversionEvidenceSchema.parse(current.estimateConversionEvidence ?? [])
        .filter(id => !replacedConversions.has(id))),
    });
  }
}

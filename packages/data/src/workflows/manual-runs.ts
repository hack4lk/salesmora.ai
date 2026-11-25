import { matchingWorkflowVisits, deliverWorkflowVisits, reviewedWorkflowVisitsSchema } from "./visits";
import { generateWorkflowBriefing, saveWorkflowBriefing } from "./briefings";
import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { z } from "zod";
import { workflowBriefingSnapshotSchema, workflowDefinitionSchema, workflowRunConfirmSchema, workflowRunPreviewSchema, workflowRunRequestSchema,
  workflowRunResultSchema, type AuthorizationContext, type PermissionId, type WorkflowDefinition } from "@salesmora/contracts";
import { isVisitWorkflow, canRunWorkflow } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { WorkflowConflictError } from "./store";
import { deliverWorkflowReminders, workflowEstimateEligibility, workflowParticipantsEligible, unassignedLeadEligibility, workflowRecordKind } from "./execution";

async function runnable(trx: Knex.Transaction, context: AuthorizationContext, input: { id: string; version: number; workspaceId: string }) {
  if (input.workspaceId !== context.workspaceId || !(canRunWorkflow(context) || canRunWorkflow(context, "unassigned_lead") || canRunWorkflow(context, "unassigned_visit"))) throw new AuthorizationAccessError();
  const row = await trx("workflows").where({ workspaceId: context.workspaceId, id: input.id }).whereNull("deletedAt")
    .first<{ status: string; version: number; definition: unknown; publisherId: string | null }>("status", "version", "definition", "publisherId");
  if (!row) throw new AuthorizationAccessError();
  if (row.status !== "active" || row.version !== input.version) throw new WorkflowConflictError();
  const parsed = workflowDefinitionSchema.safeParse(row.definition);
  if (!parsed.success || !canRunWorkflow(context, parsed.data.kind) || !row.publisherId || !await workflowParticipantsEligible(trx, context, parsed.data, row.publisherId)) {
    throw new AuthorizationAccessError();
  }
  return parsed.data;
}

function matchingRecords(trx: Knex.Transaction, context: AuthorizationContext, workflowId: string, definition: WorkflowDefinition) {
  if (isVisitWorkflow(definition)) return matchingWorkflowVisits(trx, context, workflowId, definition);
  if (definition.kind === "unassigned_lead") return trx("leads as e")
    .where("e.workspaceId", context.workspaceId).whereRaw(unassignedLeadEligibility.replaceAll("l.", "e."))
    .whereNotExists(trx("workflowSteps as s").select(trx.raw("1"))
      .where({ "s.workspaceId": context.workspaceId, "s.workflowId": workflowId })
      .whereRaw('s."leadId" = e.id').whereIn("s.status", ["completed", "canceled"]))
    .whereNotExists(trx("leadWorkflowNotifications as n").select(trx.raw("1"))
      .where({ "n.workspaceId": context.workspaceId, "n.workflowId": workflowId }).whereRaw('n."leadId" = e.id'));
  return trx("estimates as e").where("e.workspaceId", context.workspaceId).whereRaw(workflowEstimateEligibility(definition))
    .whereNotExists(trx("workflowSteps as s").select(trx.raw("1"))
      .where({ "s.workspaceId": context.workspaceId, "s.workflowId": workflowId })
      .whereRaw('s."estimateId" = e.id').whereIn("s.status", ["completed", "canceled"]))
    .whereNotExists(trx("estimateNotifications as n").select(trx.raw("1"))
      .where({ "n.workspaceId": context.workspaceId }).whereRaw('n."estimateId" = e.id')
      .whereRaw('n."dedupeKey" = ? || e.id::text', [`workflow:${workflowId}:`]));
}

export async function previewWorkflowRun(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowRunRequestSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const definition = await runnable(trx, context, input);
    if (definition.kind === "weekly_briefing") {
      const briefing = await generateWorkflowBriefing(trx, context, definition.timezone);
      const id = randomUUID();
      await trx("workflowManualRuns").insert({ id, workspaceId: context.workspaceId, workflowId: input.id,
        actorId: context.userId, version: input.version, recordKind: "briefing", recordIds: "[]",
        briefingSnapshot: JSON.stringify(briefing), expiresAt: new Date(Date.now() + 5 * 60_000) });
      return workflowRunPreviewSchema.parse({ id, matchedCount: 1, briefing,
        actionSummary: `Send this briefing to ${definition.recipientName}? The Monday schedule stays the same.` });
    }
    if (isVisitWorkflow(definition)) {
      const records = await matchingWorkflowVisits(trx, context, input.id, definition).orderBy("e.scheduledDate").orderBy("e.id").limit(100)
        .select("e.id", trx.raw(`to_char(e."scheduledDate",'YYYY-MM-DD') AS date`));
      const id = randomUUID();
      await trx("workflowManualRuns").insert({ id, workspaceId: context.workspaceId, workflowId: input.id, actorId: context.userId,
        version: input.version, recordKind: "visit", recordIds: JSON.stringify(records.map(row => row.id)), reviewedVisits: JSON.stringify(records),
        expiresAt: new Date(Date.now() + 5 * 60_000) });
      return workflowRunPreviewSchema.parse({ id, matchedCount: records.length,
        actionSummary: `Send ${definition.recipientName} reminders for ${records.length} upcoming ${definition.kind === "visit_materials" ? "visit" : "unassigned visit"}${records.length === 1 ? "" : "s"}${definition.kind === "visit_materials" ? " with materials marked Needed or Ordered" : ""}?` });
    }
    // A bounded snapshot is persisted so confirmation cannot silently expand to new records.
    const records = await matchingRecords(trx, context, input.id, definition).orderBy(definition.kind === "unassigned_lead" ? "e.createdAt" : "e.decidedAt").orderBy("e.id")
      .limit(100).select<{ id: string }[]>("e.id");
    const id = randomUUID();
    await trx("workflowManualRuns").insert({ id, workspaceId: context.workspaceId, workflowId: input.id,
      actorId: context.userId, version: input.version, recordKind: workflowRecordKind(definition), recordIds: JSON.stringify(records.map(row => row.id)),
      expiresAt: new Date(Date.now() + 5 * 60_000) });
    return workflowRunPreviewSchema.parse({ id, matchedCount: records.length,
      actionSummary: `Send ${definition.recipientName} reminders for ${records.length} ${definition.kind === "unassigned_lead" ? `unassigned lead${records.length === 1 ? "" : "s"}` : `${definition.kind === "estimate_follow_up" ? "sent" : "approved"} estimate${records.length === 1 ? "" : "s"} ${definition.kind === "estimate_follow_up" ? "without a recorded decision" : "without a visit"}`}?` });
  });
}

export async function confirmWorkflowRun(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowRunConfirmSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const definition = await runnable(trx, context, input);
    const review = await trx("workflowManualRuns").where({ id: input.previewId, workspaceId: context.workspaceId,
      workflowId: input.id, actorId: context.userId, version: input.version })
      .first<{ recordIds: unknown; recordKind: string; briefingSnapshot: unknown; reviewedVisits: unknown; expiresAt: Date; result: unknown }>("recordIds", "recordKind", "briefingSnapshot", "reviewedVisits", "expiresAt", "result");
    if (!review || review.recordKind !== workflowRecordKind(definition)) throw new AuthorizationAccessError();
    if (review.result) return workflowRunResultSchema.parse(review.result);
    if (review.expiresAt.getTime() <= Date.now()) throw new WorkflowConflictError();
    if (definition.kind === "weekly_briefing") {
      const snapshot = workflowBriefingSnapshotSchema.parse(review.briefingSnapshot);
      await trx("workflowSteps").insert({ id: input.previewId, workspaceId: context.workspaceId, workflowId: input.id,
        recordKind: "briefing", origin: "manual", status: "running", dueAt: trx.fn.now() });
      const completedCount = await saveWorkflowBriefing(trx, context, input.id, input.previewId, definition, snapshot);
      const pending = await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId: input.id }).whereIn("status", ["queued", "held"]).count({ count: "*" }).first();
      const result = workflowRunResultSchema.parse({ completedCount, skippedCount: 0, pendingCount: Number(pending?.count ?? 0) });
      await trx("workflowManualRuns").where({ id: input.previewId, workspaceId: context.workspaceId }).update({ result: JSON.stringify(result), completedAt: trx.fn.now() });
      return result;
    }
    if (isVisitWorkflow(definition)) {
      const reviewed = reviewedWorkflowVisitsSchema.parse(review.reviewedVisits);
      const records = reviewed.length ? await matchingWorkflowVisits(trx, context, input.id, definition).whereIn("e.id", reviewed.map(row => row.id))
        .select("e.id", trx.raw(`to_char(e."scheduledDate",'YYYY-MM-DD') AS date`)) : [];
      const unchanged = records.filter(row => reviewed.some(before => before.id === row.id && before.date === row.date));
      let completedCount = 0;
      if (unchanged.length) {
        const steps = await trx("workflowSteps").insert(unchanged.map(row => ({ id: randomUUID(), workspaceId: context.workspaceId, workflowId: input.id,
          recordKind: "visit", origin: "manual", visitId: row.id, visitDate: row.date, status: "running", dueAt: trx.fn.now() })))
          .onConflict(["workflowId", "visitId", "visitDate"]).merge(["visitId"])
          .returning(["id", "visitId", trx.raw(`to_char("visitDate",'YYYY-MM-DD') AS "visitDate"`)]);
        completedCount = await deliverWorkflowVisits(trx, context, input.id, definition, steps);
      }
      const pending = await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId: input.id }).whereIn("status", ["queued", "held"]).count({ count: "*" }).first();
      const result = workflowRunResultSchema.parse({ completedCount, skippedCount: reviewed.length - completedCount, pendingCount: Number(pending?.count ?? 0) });
      await trx("workflowManualRuns").where({ id: input.previewId, workspaceId: context.workspaceId }).update({ result: JSON.stringify(result), completedAt: trx.fn.now() });
      return result;
    }
    const ids = z.array(z.uuid()).max(100).parse(review.recordIds);
    const records = ids.length ? await matchingRecords(trx, context, input.id, definition).whereIn("e.id", ids).select<{ id: string }[]>("e.id") : [];
    let completedCount = 0;
    if (records.length) {
      // Existing queued steps are completed now. Their normal schedule is never changed.
      const recordKey = definition.kind === "unassigned_lead" ? "leadId" : "estimateId";
      const steps = await trx("workflowSteps").insert(records.map(row => ({ id: randomUUID(),
        workspaceId: context.workspaceId, workflowId: input.id, recordKind: workflowRecordKind(definition), [recordKey]: row.id, dueAt: trx.fn.now(), status: "queued" })))
        .onConflict(["workflowId", recordKey]).merge([recordKey])
        .returning<{ id: string; estimateId?: string; leadId?: string }[]>(["id", recordKey]);
      completedCount = await deliverWorkflowReminders(trx, context, input.id, definition, steps);
    }
    const pending = await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId: input.id })
      .whereIn("status", ["queued", "held"]).count({ count: "*" }).first();
    const result = workflowRunResultSchema.parse({ completedCount, skippedCount: ids.length - completedCount, pendingCount: Number(pending?.count ?? 0) });
    await trx("workflowManualRuns").where({ id: input.previewId, workspaceId: context.workspaceId })
      .update({ result: JSON.stringify(result), completedAt: trx.fn.now() });
    return result;
  });
}

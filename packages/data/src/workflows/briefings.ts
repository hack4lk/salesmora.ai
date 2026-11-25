import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { estimateCurrentQuerySchema, workflowBriefingSchema, workflowBriefingSnapshotSchema,
  type AuthorizationContext, type WorkflowDefinition, type WorkflowBriefingSnapshot } from "@salesmora/contracts";
import { canReadWorkflowRecords } from "@salesmora/domain";
import { AuthorizationAccessError } from "../authorization/store";
import { scopedLeadQuery } from "../leads/query";
import { scopedJobQuery } from "../jobs/query";
import { filteredCalendarReportRecords } from "../reports/calendar-filters";
import { estimateCurrentSource } from "../reports/estimate-current";
import { leadInactivityPredicate, openLeadReportStages } from "../reports/leads";
import { activeJobReportStatuses } from "../reports/jobs";

/** Only aggregate counts are fetched. All four sources share one SQL statement snapshot. */
export async function generateWorkflowBriefing(trx: Knex.Transaction, context: AuthorizationContext, timezone: string) {
  if (!canReadWorkflowRecords(context, "weekly_briefing")) throw new AuthorizationAccessError();
  const leads = scopedLeadQuery(trx, context).query.whereNull("l.archivedAt")
    .whereIn("l.stage", openLeadReportStages).whereRaw(leadInactivityPredicate).count({ count: "*" }).toSQL();
  const jobs = scopedJobQuery(trx, context).query.whereIn("j.status", activeJobReportStatuses)
    .whereRaw(`j."completionDeadline" BETWEEN (CURRENT_TIMESTAMP AT TIME ZONE ?)::date AND (CURRENT_TIMESTAMP AT TIME ZONE ?)::date + 7`, [timezone, timezone])
    .count({ count: "*" }).toSQL();
  const { source } = await estimateCurrentSource(trx, context,
    estimateCurrentQuerySchema.parse({ workspaceId: context.workspaceId, view: "estimate-current", selected: "awaiting", page: 1, pageSize: 25 }), false, false);
  const estimates = source.clearSelect().clearOrder().where(builder => builder.whereNull("e.validUntil")
    .orWhereRaw(`e."validUntil" >= (CURRENT_TIMESTAMP AT TIME ZONE ?)::date`, [timezone])).countDistinct({ count: "e.id" }).toSQL();
  const calendar = await filteredCalendarReportRecords(trx, context, false, { participants: [], recordTypes: [] }, "unscheduled");
  const result = await trx.raw(`SELECT CURRENT_TIMESTAMP AS "generatedAt",
    (${leads.sql}) AS "inactiveLeads", (${estimates.sql}) AS "awaitingEstimates",
    (SELECT count(*) FROM (${calendar.sql}) v WHERE v.type = 'job') AS "unscheduledJobs",
    (${jobs.sql}) AS "dueSoonJobs"`, [...leads.bindings, ...estimates.bindings, ...calendar.bindings, ...jobs.bindings]);
  const row = result.rows[0];
  return workflowBriefingSnapshotSchema.parse({ generatedAt: row.generatedAt.toISOString(), timezone,
    counts: Object.fromEntries(["inactiveLeads", "awaitingEstimates", "unscheduledJobs", "dueSoonJobs"].map(key => [key, Number(row[key])])) });
}

/** A saved snapshot is never recalculated for delivery or when opened later. */
export async function saveWorkflowBriefing(trx: Knex.Transaction, context: AuthorizationContext,
  workflowId: string, stepId: string, definition: WorkflowDefinition, snapshot: WorkflowBriefingSnapshot) {
  await trx("workflowBriefings").insert({ id: stepId, workspaceId: context.workspaceId, workflowId,
    userId: definition.recipientId, snapshot: JSON.stringify(snapshot) }).onConflict("id").ignore();
  const notices = await trx("workflowBriefingNotifications").insert({ id: randomUUID(), workspaceId: context.workspaceId,
    workflowId, briefingId: stepId, userId: definition.recipientId, inApp: definition.notifications?.inApp ?? true,
    emailStatus: definition.notifications?.email ? "queued" : "skipped" })
    .onConflict(["workspaceId", "briefingId", "userId"]).ignore().returning("id");
  await trx("workflowSteps").where({ id: stepId, workspaceId: context.workspaceId }).update({ status: "completed" });
  return notices.length;
}

export function workflowBriefingQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const query = trx("workflowBriefings as b").where({ "b.workspaceId": context.workspaceId, "b.userId": context.userId });
  if (!canReadWorkflowRecords(context, "weekly_briefing")) query.whereRaw("false");
  return query;
}

export async function readWorkflowBriefingInTransaction(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const row = await workflowBriefingQuery(trx, context).where("b.id", id).first("b.snapshot");
  if (!row) throw new AuthorizationAccessError();
  return workflowBriefingSchema.parse({ ...workflowBriefingSnapshotSchema.parse(row.snapshot), id, workspaceId: context.workspaceId });
}

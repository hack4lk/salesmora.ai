import { processCustomerScheduleChange } from './customer-schedule-changes';
import { processPostJob } from './post-job';
import { processAssignedLeadCold } from './assigned-lead-cold';
import { processCustomerVisit, type CustomerVisitTransport } from './customer-visits';
import { processAnnualReview } from "./annual-service";
import {processCompletionHandoffStep} from "./completion-handoff";
import {processServiceDueStep} from "./service-due";
import {processCancellationStep} from "./cancellation";
import { processRoutineBookingStep } from "./booking";
import { deliverWorkflowVisits, initializeWorkflowVisits, matchingWorkflowVisits } from "./visits";
import { generateWorkflowBriefing, saveWorkflowBriefing } from "./briefings";
import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { permissionIds, workflowDefinitionSchema, type PermissionId, type AuthorizationContext, type WorkflowDefinition, type WorkspaceRole } from "@salesmora/contracts";
import { isVisitWorkflow, canSelectWorkflowWorker,canPublishWorkflow, canReadWorkflowRecords } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization } from "../authorization/store";

/** Shared by scheduled and manually confirmed execution. All queries use the estimate alias e. */
export const unscheduledEstimateEligibility = `
  e.status = 'accepted' AND e."archivedAt" IS NULL AND e."supersededById" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM jobs j WHERE j."workspaceId" = e."workspaceId"
      AND (j."acceptedEstimateId" = e.id OR j.id = e."jobId")
      AND (j."scheduledDate" IS NOT NULL OR j.status IN ('completed','canceled'))
  )
  AND NOT EXISTS (
    SELECT 1 FROM jobs j JOIN "calendarVisitRecords" r ON r."workspaceId" = j."workspaceId" AND r."jobId" = j.id
      JOIN "calendarVisits" v ON v."workspaceId" = r."workspaceId" AND v.id = r."visitId"
    WHERE j."workspaceId" = e."workspaceId" AND (j."acceptedEstimateId" = e.id OR j.id = e."jobId")
      AND r."endedAt" IS NULL AND v."scheduledDate" IS NOT NULL
  )`;

/** Successful transport acceptance starts the follow-up clock; queuing/resends do not reset it. */
export const firstSuccessfulEstimateSend = `(SELECT min(d."sentAt") FROM estimate_deliveries d
  WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id AND d.status = 'sent')`;
export const estimateFollowUpEligibility = `
  e.status = 'sent' AND e."archivedAt" IS NULL AND e."supersededById" IS NULL
  AND (e."validUntil" IS NULL OR e."validUntil" >= (now() AT TIME ZONE
    (SELECT w.timezone FROM workspaces w WHERE w.id = e."workspaceId"))::date)
  AND ${firstSuccessfulEstimateSend} IS NOT NULL`;

/** Lead alias l, shared by scheduled/manual execution and the email recheck. */
export const unassignedLeadEligibility = `l."ownerId" IS NULL AND l."archivedAt" IS NULL AND l.stage NOT IN ('won','lost')`;
export function workflowRecordKind(definition: WorkflowDefinition) { return isVisitWorkflow(definition) ? "visit" as const : definition.kind === "weekly_briefing" ? "briefing" as const : definition.kind === "unassigned_lead" ? "lead" as const : "estimate" as const; }

export function workflowEstimateEligibility(definition: WorkflowDefinition) {
  switch (definition.kind) {
    case "unscheduled_estimate": return unscheduledEstimateEligibility;
    case "estimate_follow_up": return estimateFollowUpEligibility;
    default: throw new Error("Unsupported workflow recipe.");
  }
}
export function workflowNotificationEvent(definition: WorkflowDefinition) {
  switch (definition.kind) {
    case "unscheduled_estimate": return "needs_scheduling" as const;
    case "estimate_follow_up": return "awaiting_decision" as const;
    default: throw new Error("Unsupported workflow recipe.");
  }
}

export async function workflowParticipantsEligible(trx: Knex.Transaction, context: AuthorizationContext,
  definition: WorkflowDefinition, publisherId: string) {
  if(definition.kind==='lead_routing')return false; // Routing has its own dynamic owner checks at admission.
  const people = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId).whereIn("m.userId", [publisherId, definition.recipientId].filter((id):id is string=>!!id))
    .whereNull("u.deletionRequestedAt").whereNull("u.suspendedAt").select<{ userId: string; role: WorkspaceRole }[]>("m.userId", "m.role");
  const publisher = people.find(person => person.userId === publisherId);
  const recipient = people.find(person => person.userId === definition.recipientId);
  if (!publisher || !recipient) return false;
  const forPerson = (person: { userId: string; role: WorkspaceRole }) => ({ ...context, userId: person.userId,
    membership: { ...person, workspaceId: context.workspaceId } });
  return (definition.kind!=='routine_booking'||definition.assignmentMode!=='qualified_if_unassigned'||canSelectWorkflowWorker(forPerson(publisher))) && canPublishWorkflow(forPerson(publisher), definition.kind) && canReadWorkflowRecords(forPerson(recipient), definition.kind);
}

export async function deliverWorkflowReminders(trx: Knex.Transaction, context: AuthorizationContext,
  workflowId: string, definition: WorkflowDefinition, steps: readonly { id: string; estimateId?: string; leadId?: string }[]) {
  if (!steps.length) return 0;
  const notices = definition.kind === "unassigned_lead"
    ? await trx("leadWorkflowNotifications").insert(steps.map(step => ({
      id: randomUUID(), workspaceId: context.workspaceId, workflowId, leadId: step.leadId, userId: definition.recipientId,
      inApp: definition.notifications?.inApp ?? true, emailStatus: definition.notifications?.email ? "queued" : "skipped",
    }))).onConflict().ignore().returning("id")
    : await trx("estimateNotifications").insert(steps.map(step => ({
      id: randomUUID(), workspaceId: context.workspaceId, estimateId: step.estimateId, userId: definition.recipientId,
      event: workflowNotificationEvent(definition), dedupeKey: `workflow:${workflowId}:${step.estimateId}`, workflowId,
      inApp: definition.notifications?.inApp ?? true,
      emailStatus: definition.notifications?.email ? "queued" : "skipped",
    }))).onConflict(["workspaceId", "dedupeKey", "userId"]).ignore().returning("id");
  await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId })
    .whereIn("id", steps.map(step => step.id)).update({ status: "completed" });
  return notices.length;
}

/** Execute one persisted schedule. Database state, not the queue payload, owns every decision. */
export async function processWorkflowStep(db: Knex, workspaceId: string, stepId: string, enabled: readonly PermissionId[] = permissionIds, customerTransport?: CustomerVisitTransport) {
  const candidate = await db("workflowSteps as s").join("workflows as w", function () {
    this.on("w.workspaceId", "s.workspaceId").andOn("w.id", "s.workflowId");
  }).where({ "s.id": stepId, "s.workspaceId": workspaceId, "s.status": "queued" }).first<{ publisherId: string | null; recordKind: string; expired: boolean }>("w.publisherId", "s.recordKind", db.raw(`CASE WHEN s."recordKind" = 'briefing' AND s.origin = 'scheduled'
    THEN clock_timestamp() >= s."dueAt" + interval '3 hours' WHEN s."recordKind" = 'visit' THEN s."visitDate" <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date ELSE false END AS expired`));
  if (!candidate) return { delivered: 0, deferred: false };
  if (!candidate.publisherId) {
    await db("workflowSteps").where({ id: stepId, workspaceId, status: "queued" }).update({ status: "canceled" });
    return { delivered: 0, deferred: false };
  }
  if(candidate.recordKind==='schedule_change')return processCustomerScheduleChange(db,workspaceId,stepId,candidate.publisherId,enabled,customerTransport);
  if(candidate.recordKind==='post_job')return processPostJob(db,workspaceId,stepId,candidate.publisherId,enabled,customerTransport);
  if(['cold_lead','cold_lead_init'].includes(candidate.recordKind))return processAssignedLeadCold(db,workspaceId,stepId,candidate.publisherId,enabled);
  if(['customer_visit','customer_visit_init'].includes(candidate.recordKind))return processCustomerVisit(db,workspaceId,stepId,candidate.publisherId,enabled,customerTransport);
  if(candidate.recordKind==='handoff')return processCompletionHandoffStep(db,workspaceId,stepId,candidate.publisherId,enabled);
  if(candidate.recordKind==='annual_review')return processAnnualReview(db,workspaceId,stepId,candidate.publisherId,enabled);
  if (["service_due","service_due_init"].includes(candidate.recordKind)) return processServiceDueStep(db,workspaceId,stepId,candidate.publisherId,enabled);
  if (candidate.recordKind === "cancellation") return processCancellationStep(db,workspaceId,stepId,candidate.publisherId,enabled);
  if (candidate.recordKind === "booking") return processRoutineBookingStep(db,workspaceId,stepId,candidate.publisherId,enabled);
  if (candidate.recordKind === "visit_init") {
    await initializeWorkflowVisits(db, workspaceId, stepId, enabled);
    return { delivered: 0, deferred: false };
  }
  // Expire an occurrence even when its publisher has lost access. This advances only an active schedule.
  // The workspace lock serializes lifecycle changes; no report data is accessed here.
  const expired = candidate.expired && await db.transaction<boolean>(async trx => {
    await trx("workspaces").where({ id: workspaceId }).forUpdate().first("id");
    const updated = await trx("workflowSteps as s").where({ "s.id": stepId, "s.workspaceId": workspaceId, "s.status": "queued", "s.origin": "scheduled" })
      .whereExists(trx("workflows as w").select(trx.raw("1")).whereRaw('w.id = s."workflowId" AND w."workspaceId" = s."workspaceId"')
        .where("w.status", "active").whereRaw(`(s."recordKind" = 'visit' AND s."visitDate" <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date) OR (s."recordKind" = 'briefing' AND clock_timestamp() >= s."dueAt" + interval '3 hours')`))
      .update({ status: "skipped" });
    return Number(updated) > 0;
  });
  if (expired) return { delivered: 0, deferred: false };
  try {
    return await withWorkspaceAuthorization(db, { userId: candidate.publisherId, workspaceId }, enabled, true, async (trx, context) => {
      const step = await trx("workflowSteps as s").join("workflows as w", function () {
        this.on("w.workspaceId", "s.workspaceId").andOn("w.id", "s.workflowId");
      }).where({ "s.id": stepId, "s.workspaceId": workspaceId, "s.status": "queued", "w.status": "active" })
        .where("s.dueAt", "<=", trx.fn.now()).first<{ id: string; workflowId: string; estimateId: string | null; leadId: string | null; visitId: string | null; visitDate: Date | string | null; definition: unknown; publisherId: string | null; expired: boolean }>(
          "s.id", "s.workflowId", "w.publisherId", "s.estimateId", "s.leadId", "s.visitId", trx.raw(`to_char(s."visitDate",'YYYY-MM-DD') AS "visitDate"`), "w.definition", trx.raw(`CASE WHEN s."recordKind" = 'briefing' AND s.origin = 'scheduled'
            THEN clock_timestamp() >= s."dueAt" + interval '3 hours' WHEN s."recordKind" = 'visit' THEN s."visitDate" <= (clock_timestamp() AT TIME ZONE (w.definition->>'timezone'))::date ELSE false END AS expired`));
      if (!step || step.publisherId !== candidate.publisherId) return { delivered: 0, deferred: true };
      if (step.expired) {
        await trx("workflowSteps").where({ id: stepId, workspaceId }).update({ status: "skipped" });
        return { delivered: 0, deferred: false };
      }
      const definition = workflowDefinitionSchema.parse(step.definition);
      if (!canPublishWorkflow(context, definition.kind) ||
          !await workflowParticipantsEligible(trx, context, definition, candidate.publisherId!)) return { delivered: 0, deferred: true };
      if (definition.kind === "weekly_briefing") {
        const snapshot = await generateWorkflowBriefing(trx, context, definition.timezone);
        return { delivered: await saveWorkflowBriefing(trx, context, step.workflowId, step.id, definition, snapshot), deferred: false };
      }
      if (isVisitWorkflow(definition)) {
        const record = await matchingWorkflowVisits(trx, context, step.workflowId, definition).where("e.id", step.visitId)
          .whereRaw('e."scheduledDate" = ?::date', [step.visitDate]).first("e.id");
        if (!record) {
          await trx("workflowSteps").where({ id: stepId, workspaceId }).update({ status: "skipped" });
          return { delivered: 0, deferred: false };
        }
        return { delivered: await deliverWorkflowVisits(trx, context, step.workflowId, definition,
          [{ id: step.id, visitId: step.visitId!, visitDate: String(step.visitDate) }]), deferred: false };
      }
      const record = definition.kind === "unassigned_lead"
        ? await trx("leads as l").where({ "l.workspaceId": workspaceId, "l.id": step.leadId }).whereRaw(unassignedLeadEligibility).first("l.id")
        : await trx("estimates as e").where({ "e.workspaceId": workspaceId, "e.id": step.estimateId }).whereRaw(workflowEstimateEligibility(definition)).first("e.id");
      if (!record) {
        await trx("workflowSteps").where({ id: stepId, workspaceId }).update({ status: "skipped" });
        return { delivered: 0, deferred: false };
      }
      const delivered = await deliverWorkflowReminders(trx, context, step.workflowId, definition,
        [{ id: step.id, ...(step.leadId ? { leadId: step.leadId } : {}), ...(step.estimateId ? { estimateId: step.estimateId } : {}) }]);
      return { delivered, deferred: false };
    });
  } catch (error) {
    // Access/workspace holds keep durable work recoverable without a minute-by-minute workflow scan.
    if (error instanceof AuthorizationAccessError) return { delivered: 0, deferred: true };
    throw error;
  }
}

/** Bounded due-step drain for rehearsals/maintenance. Production uses individually queued step IDs. */
export async function processWorkflowReminders(db: Knex, enabled: readonly PermissionId[] = permissionIds) {
  const due = await db("workflowSteps as s").join("workflows as w", function () {
    this.on("w.workspaceId", "s.workspaceId").andOn("w.id", "s.workflowId");
  }).where({ "s.status": "queued", "w.status": "active" }).where("s.dueAt", "<=", db.fn.now())
    .orderBy("s.dueAt").orderBy("s.id").limit(100).select<{ id: string; workspaceId: string }[]>("s.id", "s.workspaceId");
  let delivered = 0, failed = 0;
  for (const step of due) {
    try { delivered += (await processWorkflowStep(db, step.workspaceId, step.id, enabled)).delivered; }
    catch { failed++; }
  }
  return { delivered, failed };
}

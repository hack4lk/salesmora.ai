import { assertScheduleChange } from './customer-schedule-changes';
import { assertPostJob } from './post-job';
import { assertCustomerVisit } from './customer-visits';
import { assertAnnualReview } from "./annual-service";
import { readWorkflowCapacity } from "./capacity";
import {assertServiceDue} from "./service-due";
import {assertCancellation} from "./cancellation";
import { assertRoutineBooking } from "./booking";
import { assertRoutingAvailable, routingPolicy, routingSource } from "./routing";
import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { workflowCommandSchema, workflowListQuerySchema, workflowListSchema, workflowReceiptSchema,
  workflowDefinitionSchema, type AuthorizationContext, type PermissionId, type Workflow, } from "@salesmora/contracts";
import { authorize, canRunWorkflow, canEditWorkflow, workflowRuleDescription } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";

export class WorkflowConflictError extends Error {
  constructor() { super("This workflow changed. Refresh and try again."); }
}

export function workflowAccess(context: AuthorizationContext) {
  return {
    read: authorize(context, { permission: "workflows.read" }).allowed,
    manage: authorize(context, { permission: "workflows.manage" }).allowed,
  };
}

export async function readWorkflowsInTransaction(trx: Knex.Transaction, context: AuthorizationContext, id?: string) {
  const query = workflowListQuerySchema.parse({ workspaceId: context.workspaceId });
  const access = workflowAccess(context);
  if (!access.read) throw new AuthorizationAccessError();
  const rows = await trx("workflows as w").where("w.workspaceId", query.workspaceId).whereNull("w.deletedAt").modify(query => { if (id) query.where("w.id", id); })
    .select<{ id: string; name: string; rule: string; status: Workflow["status"]; version: number; pendingCount: string; runnable: boolean; definition: unknown; executionIssue: string | null; serviceName:string | null }[]>(
      "w.id", "w.name", "w.rule", "w.status", "w.version",
      trx.raw(`(w.definition->>'kind' IN ('unscheduled_estimate','estimate_follow_up','unassigned_lead','weekly_briefing','unassigned_visit','visit_materials') AND w."publisherId" IS NOT NULL) AS runnable`),
      "w.definition", "w.executionIssue", trx.raw(`(SELECT name FROM "workspaceServices" c WHERE c."workspaceId"=w."workspaceId" AND c.id=w."serviceId") AS "serviceName"`),
      trx.raw(`(SELECT count(*) FROM "workflowSteps" s WHERE s."workspaceId" = w."workspaceId"
        AND s."workflowId" = w.id AND s.status IN ('queued','held')) AS "pendingCount"`))
    .orderBy("w.id");
  const capacity = await readWorkflowCapacity(trx, context);
  return workflowListSchema.parse({
    rows: rows.map(row => ({ id: row.id, name: row.name, rule: row.serviceName && workflowDefinitionSchema.safeParse(row.definition).data?.kind && ['routine_booking','cancellation_fill','service_due','annual_service_review'].includes(workflowDefinitionSchema.parse(row.definition).kind) ? workflowRuleDescription({...workflowDefinitionSchema.parse(row.definition),service:row.serviceName} as import('@salesmora/contracts').WorkflowDefinition) : row.rule, status: row.status, version: row.version, pendingCount: Number(row.pendingCount),
      ...(workflowDefinitionSchema.safeParse(row.definition).success ? { kind: workflowDefinitionSchema.parse(row.definition).kind } : {}),
      ...(row.executionIssue ? { issue: row.executionIssue } : {}),
      canEdit: workflowDefinitionSchema.safeParse(row.definition).success && canEditWorkflow(context, workflowDefinitionSchema.parse(row.definition).kind),
      canRunNow: Boolean(row.runnable) && canRunWorkflow(context, workflowDefinitionSchema.parse(row.definition).kind),
      ...(workflowDefinitionSchema.safeParse(row.definition).success ? { notifications: workflowDefinitionSchema.parse(row.definition).notifications ?? { inApp: true, email: false } } : {}),
      allowedActions: access.manage ? [row.status === "active" ? "pause" : "resume", "delete"] : [] })),
    total: rows.length,
    capacity,
  });
}

export async function readWorkflows(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const query = workflowListQuerySchema.parse(raw);
  if (query.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false,
    (trx, context) => readWorkflowsInTransaction(trx, context));
}

export async function changeWorkflowInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const input = workflowCommandSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId || !workflowAccess(context).manage) throw new AuthorizationAccessError();
  const current = await trx("workflows").where({ workspaceId: context.workspaceId, id: input.id })
    .whereNull("deletedAt").forUpdate().first<{ status: Workflow["status"]; version: number; definition: unknown }>("status", "version", "definition");
  if (!current) throw new AuthorizationAccessError();
  if (current.version !== input.version || (input.action === "pause" && current.status !== "active") ||
    (input.action === "resume" && current.status !== "paused")) throw new WorkflowConflictError();
  const definition = workflowDefinitionSchema.safeParse(current.definition);
  if (input.action === "resume" && definition.success && definition.data.kind === "lead_routing") {
    if (!canEditWorkflow(context, "lead_routing")) throw new AuthorizationAccessError();
    await routingSource(trx,context,'',definition.data.sourceId);
    if(definition.data.routing)await routingPolicy(trx,context,definition.data.sourceId,{strategy:definition.data.routing.strategy,memberIds:definition.data.routing.members.map(member=>member.id),matchWorkZipCodes:definition.data.routing.matchWorkZipCodes});
    await assertRoutingAvailable(trx, context.workspaceId, definition.data.sourceId, input.id);
  }
  if(input.action==='resume'&&definition.success&&definition.data.kind==='customer_schedule_change')await assertScheduleChange(trx,context,input.id);
  if(input.action==='resume'&&definition.success&&definition.data.kind==='post_job_thank_you')await assertPostJob(trx,context,input.id);
  if(input.action==='resume'&&definition.success&&definition.data.kind==='customer_visit_reminder')await assertCustomerVisit(trx,context,input.id);
  if(input.action==='resume'&&definition.success&&definition.data.kind==='assigned_lead_cold'&&!canEditWorkflow(context,'assigned_lead_cold'))throw new AuthorizationAccessError();
  if(input.action==='resume'&&definition.success&&definition.data.kind==='completion_handoff'&&!canEditWorkflow(context,'completion_handoff'))throw new AuthorizationAccessError();
  if(input.action==='resume'&&definition.success&&definition.data.kind==='annual_service_review')await assertAnnualReview(trx,context,definition.data.service,definition.data.rules.firstReviewDate,definition.data.localTime,definition.data.timezone,input.id,true,false);
  if(input.action==='resume'&&definition.success&&definition.data.kind==='service_due')await assertServiceDue(trx,context,definition.data.service,input.id);
  if(input.action==='resume'&&definition.success&&definition.data.kind==='cancellation_fill')await assertCancellation(trx,context,definition.data.service,input.id);
  if(input.action==='resume' && definition.success && definition.data.kind==='routine_booking') { if(!canEditWorkflow(context,'routine_booking'))throw new AuthorizationAccessError(); await assertRoutineBooking(trx,context,definition.data.service,input.id,true,true,definition.data.assignmentMode); }
  const status = { pause: "paused", resume: "active", delete: "deleted" }[input.action];
  const version = current.version + 1;
  await trx("workflows").where({ workspaceId: context.workspaceId, id: input.id, version: current.version })
    .update({ status, version, updatedAt: trx.fn.now(), ...(input.action === "delete" ? { deletedAt: trx.fn.now() } : {}), ...(input.action === "resume" ? { enrollAfter: trx.fn.now() } : {}) });
  const steps = () => trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId: input.id });
  if (input.action === "pause") await steps().where("status", "queued").update({ status: "held" });
  if (input.action === "delete") await steps().whereIn("status", ["queued", "held"]).update({ status: "canceled" });
  if (input.action === "resume") {
    await steps().where({recordKind:'service_due_init',status:'held'}).update({status:'queued',dueAt:trx.fn.now()});
    await steps().whereIn('recordKind',['booking','cancellation']).where({status:'held'}).update({status:'skipped'});
    // Expired steps stay skipped so missed customer messages cannot be replayed on resume.
    await steps().where("status", "held").where("dueAt", "<=", trx.fn.now()).update({ status: "skipped" });
    await steps().where("status", "held").update({ status: "queued" });
    if (["unassigned_visit", "visit_materials"].includes(workflowDefinitionSchema.safeParse(current.definition).data?.kind ?? ""))
      await trx.raw("SELECT workflow_initialize_visits(?, ?)", [context.workspaceId, input.id]);
  }
  if(input.action==='resume'&&definition.success&&definition.data.kind==='completion_handoff'&&!canEditWorkflow(context,'completion_handoff'))throw new AuthorizationAccessError();
  if(input.action==='resume'&&definition.success&&definition.data.kind==='service_due')await trx.raw(`SELECT workflow_service_schedule(?,?,d) FROM (SELECT DISTINCT "reminderOn" d FROM "workflowServiceDueCycles" WHERE "workspaceId"=? AND "workflowId"=? AND status='due' AND "notifiedAt" IS NULL) dates`,[context.workspaceId,input.id,context.workspaceId,input.id]);
  await trx("workflowLifecycleAudit").insert({ id: randomUUID(), workspaceId: context.workspaceId,
    workflowId: input.id, actorId: context.userId, action: input.action, version });
  const pending = await steps().whereIn("status", ["queued", "held"]).count({ count: "*" }).first();
  return workflowReceiptSchema.parse({ id: input.id, status, version, pendingCount: Number(pending?.count ?? 0) });
}

export async function changeWorkflow(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true,
    (trx, context) => changeWorkflowInTransaction(trx, context, input));
}

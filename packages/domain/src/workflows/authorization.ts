import { workflowRecipeSchema, type AuthorizationContext, type WorkflowDefinition } from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "../authorization/authorize";
export function canSelectWorkflowWorker(context:AuthorizationContext){const decision=authorize(context,{permission:'jobs.assign',resource:{kind:'job',id:context.workspaceId,workspaceId:context.workspaceId,ownerId:null,teamUserIds:[]}});return decision.allowed&&decision.scope==='workspace';}

export function workflowReadPermission(kind: WorkflowDefinition["kind"]) {
  return ["unassigned_lead","assigned_lead_cold"].includes(kind) ? "leads.read" as const : "estimates.read" as const;
}

export function canReadWorkflowRecords(context: AuthorizationContext, kind: WorkflowDefinition["kind"]) {
  const permissions = kind === "post_job_thank_you" ? ["customers.read","jobs.read","workorders.read"] as const : ["customer_visit_reminder","customer_schedule_change"].includes(kind) ? ["customers.read","jobs.read","workorders.read","calendar.read"] as const : kind === "completion_handoff"?["jobs.read","workorders.read"] as const:["service_due","annual_service_review"].includes(kind)?["customers.read","jobs.read"] as const:kind === "lead_routing" ? ["leads.read"] as const : kind === "weekly_briefing" ? ["reports.read", "leads.read", "estimates.read", "jobs.read", "calendar.read"] as const : ["unassigned_visit", "visit_materials", "routine_booking", "cancellation_fill"].includes(kind) ? ["calendar.read", "jobs.read", "workorders.read"] as const : [workflowReadPermission(kind)];
  return (kind!=="cancellation_fill" || canSelectWorkflowWorker(context) && bookingAuthority(context)) && permissions.every(permission => {
    const read = resolveAuthorizedCollectionScope(context, permission);
    return read.allowed && read.scope === "workspace";
  });
}

export function canPublishWorkflow(context: AuthorizationContext, kind: WorkflowDefinition["kind"] = "unscheduled_estimate") {
  return authorize(context, { permission: "workflows.publish" }).allowed &&
    authorize(context, { permission: "assistant.use" }).allowed && (!["customer_visit_reminder","post_job_thank_you","customer_schedule_change"].includes(kind) || authorize(context,{permission:"customers.email.send"}).allowed) && canReadWorkflowRecords(context, kind) &&
    (!['routine_booking','cancellation_fill'].includes(kind) || bookingAuthority(context)) &&
    (kind !== "lead_routing" || authorize(context, { permission: "leads.assign", resource: { kind: "lead", id: "new-lead", workspaceId: context.workspaceId, ownerId: null } }).allowed && ["leadCapture.read"].every(permission => {
      const scope = resolveAuthorizedCollectionScope(context, permission); return scope.allowed && scope.scope === "workspace";
    }));
}
function bookingAuthority(context:AuthorizationContext) {
  return ['jobs.schedule.update', 'workorders.schedule.update'].every(permission => {
      const job = { kind: 'job' as const, id: context.workspaceId, workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] };
      const decision = authorize(context, permission === 'jobs.schedule.update' ? { permission, resource: job } : { permission: 'workorders.schedule.update', resource: { kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, primaryAssigneeId: context.userId, assigneeIds: [context.userId], job } });
      return decision.allowed && decision.scope === 'workspace';
    });
}

export function canRunWorkflow(context: AuthorizationContext, kind: WorkflowDefinition["kind"] = "unscheduled_estimate") {
  return kind !== "customer_schedule_change" && kind !== "post_job_thank_you" && kind !== "assigned_lead_cold" && kind !== "customer_visit_reminder" && kind !== "completion_handoff" && kind !== "lead_routing" && kind !== "routine_booking" && kind !== "cancellation_fill" && kind !== "service_due" && kind !== "annual_service_review" && authorize(context, { permission: "workflows.read" }).allowed &&
    authorize(context, { permission: "workflows.manage" }).allowed && canReadWorkflowRecords(context, kind);
}

export function availableWorkflowRecipes(context: AuthorizationContext) {
  return workflowRecipeSchema.options
    .filter(kind => canPublishWorkflow(context, kind));
}

export function canEditWorkflow(context: AuthorizationContext, kind: WorkflowDefinition["kind"]) {
  return authorize(context, { permission: "workflows.read" }).allowed &&
    authorize(context, { permission: "workflows.manage" }).allowed && canPublishWorkflow(context, kind);
}

/** Routing assignees may have assigned-only visibility; reminder recipients need workspace visibility. */
export function canReceiveWorkflow(context: AuthorizationContext, kind: WorkflowDefinition["kind"]) {
  if (kind !== "lead_routing") return canReadWorkflowRecords(context, kind);
  const scope = resolveAuthorizedCollectionScope(context, "leads.read");
  return scope.allowed && ["workspace", "assigned"].includes(scope.scope);
}

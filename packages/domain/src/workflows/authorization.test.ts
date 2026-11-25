import { expect, it } from "vitest";
import { permissionIds, type AuthorizationContext, type WorkspaceRole } from "@salesmora/contracts";
import { createDefaultWorkspacePolicy } from "../authorization/policy";
import { canRunWorkflow, canPublishWorkflow, canEditWorkflow, availableWorkflowRecipes } from "./authorization";

function context(role: WorkspaceRole): AuthorizationContext {
  const userId = role === "owner" ? "owner" : role;
  return { userId, ownerUserId: "owner", workspaceId: "workspace", membership: { userId, workspaceId: "workspace", role },
    enabledPermissions: [...permissionIds], policy: createDefaultWorkspacePolicy("workspace", 1) };
}
it("allows managers with workspace estimate access and denies default read-only roles", () => {
  expect(canRunWorkflow(context("owner"))).toBe(true);
  expect(canRunWorkflow(context("admin"))).toBe(true);
  expect(canRunWorkflow(context("office"))).toBe(false);
  expect(canRunWorkflow(context("field"))).toBe(false);
});
it("rechecks disabled permissions", () => {
  for (const permission of ["workflows.read", "workflows.manage", "estimates.read"]) {
    const value = context("owner");
    value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
    expect(canRunWorkflow(value)).toBe(false);
  }
});
it("does not require the caller to have AI access for manual execution", () => {
  const value = context("owner");
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== "assistant.use");
  expect(canRunWorkflow(value)).toBe(true);
});

it("authorizes lead reminders using Lead access without requiring Estimate access", () => {
  const value = context("owner");
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== "estimates.read");
  expect(canRunWorkflow(value, "unassigned_lead")).toBe(true);
  expect(canPublishWorkflow(value, "unassigned_lead")).toBe(true);
  expect(availableWorkflowRecipes(value)).toEqual(["unassigned_lead", "unassigned_visit", "visit_materials", "lead_routing", "routine_booking", "cancellation_fill", "service_due", "annual_service_review", "completion_handoff", "customer_visit_reminder", "assigned_lead_cold", "post_job_thank_you", "customer_schedule_change"]);
  expect(canRunWorkflow(value, "estimate_follow_up")).toBe(false);
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== "leads.read");
  expect(availableWorkflowRecipes(value)).toEqual(["unassigned_visit", "visit_materials", "routine_booking", "cancellation_fill", "service_due", "annual_service_review", "completion_handoff", "customer_visit_reminder", "post_job_thank_you", "customer_schedule_change"]);
});
it("denies unassigned-lead reminders to assigned-only readers", () => {
  const value = context("admin");
  value.policy.grants = value.policy.grants.filter(grant => grant.role !== "admin" ||
    ["workflows.read", "workflows.manage", "workflows.publish", "assistant.use", "leads.read", "estimates.read"].includes(grant.permission)).map(grant => grant.role === "admin" && grant.permission === "leads.read"
    ? { ...grant, scope: "assigned" } : grant);
  expect(canPublishWorkflow(value, "unassigned_lead")).toBe(false);
  expect(canRunWorkflow(value, "unassigned_lead")).toBe(false);
  expect(availableWorkflowRecipes(value)).toEqual(["unscheduled_estimate", "estimate_follow_up"]);
});
it("requires complete current source visibility for Monday briefings", () => {
  expect(canPublishWorkflow(context("owner"), "weekly_briefing")).toBe(true);
  for (const permission of ["reports.read", "leads.read", "estimates.read", "jobs.read", "calendar.read"]) {
    const value = context("owner");
    value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
    expect(canPublishWorkflow(value, "weekly_briefing")).toBe(false);
    expect(availableWorkflowRecipes(value)).not.toContain("weekly_briefing");
  }
  const assigned = context("admin");
  assigned.policy.grants = assigned.policy.grants.map(grant => grant.role === "admin" && grant.permission === "jobs.read" ? { ...grant, scope: "assigned" } : grant);
  expect(canPublishWorkflow(assigned, "weekly_briefing")).toBe(false);
});
it.each(["unassigned_visit", "visit_materials"] as const)("requires complete Calendar, Job and Work Order visibility for %s", kind => {
  const value = context("owner");
  value.enabledPermissions = value.enabledPermissions.filter(id => id !== "estimates.read" && id !== "reports.read");
  expect(canPublishWorkflow(value, kind)).toBe(true);
  expect(canRunWorkflow(value, kind)).toBe(true);
  for (const permission of ["calendar.read", "jobs.read", "workorders.read"]) {
    const denied = { ...value, enabledPermissions: value.enabledPermissions.filter(id => id !== permission) };
    expect(canPublishWorkflow(denied, kind)).toBe(false);
    expect(canRunWorkflow(denied, kind)).toBe(false);
  }
});

it("requires read, manage, publish and current source visibility to edit a workflow", () => {
  expect(canEditWorkflow(context("owner"), "unassigned_visit")).toBe(true);
  expect(canEditWorkflow(context("admin"), "unassigned_visit")).toBe(true);
  expect(canEditWorkflow(context("office"), "unassigned_visit")).toBe(false);
  for (const permission of ["workflows.read", "workflows.manage", "workflows.publish", "assistant.use", "calendar.read", "jobs.read", "workorders.read"]) {
    const value = context("owner"); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
    expect(canEditWorkflow(value, "unassigned_visit")).toBe(false);
  }
});
it("requires assignment/source authority for routing and does not allow manual routing runs", () => {
  expect(canPublishWorkflow(context("owner"), "lead_routing")).toBe(true);
  expect(canRunWorkflow(context("owner"), "lead_routing")).toBe(false);
  for (const permission of ["leads.assign", "leadCapture.read", "leads.read", "workflows.publish", "assistant.use"]) {
    const value = context("owner"); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
    expect(canPublishWorkflow(value, "lead_routing")).toBe(false);
  }
});

it('requires full assignment and scheduling authority for cancellation reviews and has no Run now',()=>{
 const value=context('owner');expect(canPublishWorkflow(value,'cancellation_fill')).toBe(true);expect(canRunWorkflow(value,'cancellation_fill')).toBe(false);
 for(const permission of ['jobs.assign','jobs.schedule.update','workorders.schedule.update','calendar.read'] as const){expect(canPublishWorkflow({...value,enabledPermissions:value.enabledPermissions.filter(p=>p!==permission)},'cancellation_fill')).toBe(false);}
});

it('completion handoff requires full Jobs and Work Orders access but no Calendar access or Run now',()=>{const value=context('owner');value.enabledPermissions=value.enabledPermissions.filter(p=>p!=='calendar.read');expect(canPublishWorkflow(value,'completion_handoff')).toBe(true);expect(canRunWorkflow(value,'completion_handoff')).toBe(false);value.enabledPermissions=value.enabledPermissions.filter(p=>p!=='workorders.read');expect(canPublishWorkflow(value,'completion_handoff')).toBe(false);});

it('annual reviews require full Customers and Jobs access, with no Calendar requirement or Run now', () => {
  const value = context('owner'); value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'calendar.read');
  expect(canPublishWorkflow(value, 'annual_service_review')).toBe(true); expect(canRunWorkflow(value, 'annual_service_review')).toBe(false);
  for (const permission of ['customers.read','jobs.read'] as const) expect(canPublishWorkflow({ ...value, enabledPermissions: value.enabledPermissions.filter(id => id !== permission) }, 'annual_service_review')).toBe(false);
});

it('requires customer email authority and workspace-wide visit records for automatic customer reminders', () => {
  expect(canPublishWorkflow(context('owner'), 'customer_visit_reminder')).toBe(true);
  for (const permission of ['customers.email.send', 'customers.read', 'calendar.read', 'jobs.read', 'workorders.read']) {
    const base=context('owner');
    const restricted = { ...base, enabledPermissions: base.enabledPermissions.filter(item => item !== permission) };
    expect(canPublishWorkflow(restricted, 'customer_visit_reminder')).toBe(false);
  }
  expect(canRunWorkflow(context('owner'), 'customer_visit_reminder')).toBe(false);
});

it('requires workspace lead visibility to publish cold reminders and does not offer Run now',()=>{
 expect(canPublishWorkflow(context('owner'),'assigned_lead_cold')).toBe(true);
 expect(canPublishWorkflow(context('field'),'assigned_lead_cold')).toBe(false);
 expect(canRunWorkflow(context('owner'),'assigned_lead_cold')).toBe(false);
 const base=context('owner');expect(canPublishWorkflow({...base,enabledPermissions:base.enabledPermissions.filter(p=>p!=='leads.read')},'assigned_lead_cold')).toBe(false);
});

it('requires customer email authority and workspace-wide finished-work access for thank-you rules',()=>{
 expect(canPublishWorkflow(context('owner'),'post_job_thank_you')).toBe(true);
 expect(canRunWorkflow(context('owner'),'post_job_thank_you')).toBe(false);
 for(const permission of ['customers.email.send','customers.read','jobs.read','workorders.read']){
  const c=context('owner');
  expect(canPublishWorkflow({...c,enabledPermissions:c.enabledPermissions.filter(p=>p!==permission)},'post_job_thank_you')).toBe(false);
 }
});

it('requires full visit/customer visibility and email authority for customer schedule notices',()=>{
 const c=context('owner');expect(canPublishWorkflow(c,'customer_schedule_change')).toBe(true);expect(canRunWorkflow(c,'customer_schedule_change')).toBe(false);
 for(const permission of ['customers.email.send','customers.read','jobs.read','workorders.read','calendar.read'])expect(canPublishWorkflow({...c,enabledPermissions:c.enabledPermissions.filter(p=>p!==permission)},'customer_schedule_change')).toBe(false);
});

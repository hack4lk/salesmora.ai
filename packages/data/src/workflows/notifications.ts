import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { workflowDefinitionSchema, workflowNotificationsCommandSchema, workflowNotificationsReceiptSchema, type PermissionId } from "@salesmora/contracts";
import { isVisitWorkflow, canRunWorkflow, canEditWorkflow } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { WorkflowConflictError } from "./store";

export async function changeWorkflowNotifications(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workflowNotificationsCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    if (!(canRunWorkflow(context) || canRunWorkflow(context, "unassigned_lead") || canRunWorkflow(context, "unassigned_visit"))) throw new AuthorizationAccessError();
    const row = await trx("workflows").where({ id: input.id, workspaceId: context.workspaceId }).whereNull("deletedAt")
      .first<{ version: number; definition: unknown }>("version", "definition");
    if (!row) throw new AuthorizationAccessError();
    const definition = workflowDefinitionSchema.parse(row.definition);
    if (!(canRunWorkflow(context, definition.kind) || definition.kind === "routine_booking" && canEditWorkflow(context,definition.kind))) throw new AuthorizationAccessError();
    if (row.version !== input.version) throw new WorkflowConflictError();
    if(definition.kind==='customer_visit_reminder')throw new AuthorizationAccessError();
    if (definition.notifications?.inApp === input.notifications.inApp && definition.notifications.email === input.notifications.email) {
      return workflowNotificationsReceiptSchema.parse({ id: input.id, version: row.version, notifications: input.notifications });
    }
    const version = row.version + 1;
    await trx("workflows").where({ id: input.id, workspaceId: context.workspaceId }).update({
      version, definition: JSON.stringify({ ...definition, notifications: input.notifications }), updatedAt: trx.fn.now(),
    });
    // Channel changes affect future reminders. Previously queued emails can be stopped but never replayed.
    if (!input.notifications.email) await trx(definition.kind === "routine_booking" ? "workflowBookingNotifications" : isVisitWorkflow(definition) ? "workflowVisitNotifications" : definition.kind === "weekly_briefing" ? "workflowBriefingNotifications" : definition.kind === "unassigned_lead" ? "leadWorkflowNotifications" : "estimateNotifications").where({ workspaceId: context.workspaceId, workflowId: input.id, emailStatus: "queued" })
      .update({ emailStatus: "skipped" });
    await trx("workflowLifecycleAudit").insert({ id: randomUUID(), workspaceId: context.workspaceId, workflowId: input.id,
      actorId: context.userId, action: "notifications", version });
    return workflowNotificationsReceiptSchema.parse({ id: input.id, version, notifications: input.notifications });
  });
}

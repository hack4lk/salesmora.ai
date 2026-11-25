import type { Knex } from "knex";
import type { AuthorizationContext, WorkflowDefinition, WorkspaceRole } from "@salesmora/contracts";
import { canReceiveWorkflow } from "@salesmora/domain";

export class WorkflowDraftError extends Error {}

export async function workflowRecipient(trx: Knex.Transaction, context: AuthorizationContext, reference: string, kind: WorkflowDefinition["kind"], exactId?: string) {
  const query = trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId).whereNull("u.deletionRequestedAt").whereNull("u.suspendedAt");
  if (exactId) query.where("u.id", exactId);
  else if (reference.toLowerCase() === "me") query.where("u.id", context.userId);
  else query.whereRaw("lower(u.name) = lower(?)", [reference]);
  const matches = await query.select<{ id: string; name: string; role: WorkspaceRole }[]>("u.id", "u.name", "m.role").limit(2);
  if (matches.length !== 1) throw new WorkflowDraftError("Who should get the reminder? Use your full teammate name or say me.");
  const person = matches[0];
  // Recipient scope is checked using current workspace grants in the existing authority snapshot.
  const recipientContext = { ...context, userId: person.id, membership: { userId: person.id, workspaceId: context.workspaceId, role: person.role } };
  if (kind === "lead_routing" && !canReceiveWorkflow(recipientContext, kind)) throw new WorkflowDraftError("Choose a teammate who can access their assigned leads.");
  if (!canReceiveWorkflow(recipientContext, kind)) throw new WorkflowDraftError(`Choose a teammate who can read workspace ${["unassigned_visit", "visit_materials", "routine_booking"].includes(kind) ? "Calendar, Jobs and Work Orders" : kind === "completion_handoff" ? "Jobs and Work Orders" : ["service_due","annual_service_review"].includes(kind) ? "Customers and Jobs" : kind === "weekly_briefing" ? "Reports, Leads, Estimates, Jobs and Calendar" : kind === "unassigned_lead" ? "leads" : "estimates"}.`);
  return person;
}


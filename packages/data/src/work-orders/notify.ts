import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import type { AuthorizationContext, WorkOrderMutation, WorkOrderNotificationEvent } from "@salesmora/contracts";
import { editsChangeIssuedContent } from "@salesmora/domain";
import type { Row } from "./store";

/** Recipients for one confirmed mutation. Delivery is re-authorized when the notification is read. */
export async function notifyWorkOrderChange(trx: Knex.Transaction, context: AuthorizationContext, row: Row, input: WorkOrderMutation) {
  const crew = row.crewIds ?? [];
  const current = [...(row.primaryAssigneeId ? [row.primaryAssigneeId] : []), ...crew];
  const wants: { event: WorkOrderNotificationEvent; users: string[] }[] = [];
  const office = async () => {
    const members = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId").where("m.workspaceId", context.workspaceId)
      .whereIn("m.role", ["owner", "admin", "office"]).whereNull("u.deletionRequestedAt").select("m.userId");
    return [...(row.jobOwnerId ? [row.jobOwnerId] : []), ...members.map(m => m.userId as string)];
  };
  const open = row.status !== "draft";
  switch (input.action) {
    case "status":
      if (input.to === "issued") wants.push({ event: "issued", users: current });
      if (input.to === "canceled") wants.push({ event: "canceled", users: [...await office(), ...current] });
      break;
    case "complete": wants.push({ event: "completed", users: await office() }); break;
    case "assign": {
      const next = [...(input.assigneeId ? [input.assigneeId] : []), ...input.crewIds];
      if (open) wants.push({ event: "assigned", users: next.filter(id => !current.includes(id)) });
      break;
    }
    case "schedule": if (open) wants.push({ event: "rescheduled", users: current }); break;
    case "edit": case "tasks": case "materials":
      if (editsChangeIssuedContent(row.status)) wants.push({ event: "changed", users: current });
      break;
  }
  if (!wants.length) return;
  const actor = await trx("users").where({ id: context.userId }).first("name");
  const seen = new Set<string>(), rows: object[] = [];
  for (const { event, users } of wants) for (const userId of users) {
    if (userId === context.userId || seen.has(`${event}:${userId}`)) continue;
    seen.add(`${event}:${userId}`);
    rows.push({ id: randomUUID(), workspaceId: context.workspaceId, workOrderId: row.id, userId, event, actorName: actor?.name ?? "" });
  }
  if (rows.length) await trx("workOrderNotifications").insert(rows);
}

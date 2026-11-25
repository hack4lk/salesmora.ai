import type { Knex } from "knex";
import { workflowDefinitionSchema, workflowVisitSnapshotSchema, type WorkflowVisitSnapshot, type AuthorizationContext, type PermissionId } from "@salesmora/contracts";
import { canReadWorkflowRecords, isVisitWorkflow } from "@salesmora/domain";
import { AuthorizationAccessError, WorkspaceSuspendedError, withWorkspaceAuthorization } from "../authorization/store";
import { withoutSuspendedWorkspaces } from "../accounts/workspace-hold";
import { workflowVisitProjectionSQL, workflowVisitMaterialsProjectionSQL } from "../workflows/visits";
import { workflowParticipantsEligible } from "../workflows/execution";

export function workflowVisitNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext, includeEmailOnly = false) {
  const query = trx("workflowVisitNotifications as n").join("calendarVisits as v", function () {
    this.on("v.workspaceId", "n.workspaceId").andOn("v.id", "n.visitId");
  }).where({ "n.workspaceId": context.workspaceId, "n.userId": context.userId });
  query.joinRaw(`CROSS JOIN LATERAL (
    SELECT * FROM (${workflowVisitProjectionSQL}) assignment WHERE n.snapshot->>'reason' IS NULL
    UNION ALL SELECT * FROM (${workflowVisitMaterialsProjectionSQL}) materials WHERE n.snapshot->>'reason' = 'materials'
    UNION ALL SELECT n.snapshot->>'title',n.snapshot->>'customerName',n.snapshot->'recordLabels',(n.snapshot->>'totalRecords')::bigint,false WHERE n.snapshot->>'reason'='customer_reminder'
  ) current_notice`)
    .whereRaw(`v."scheduledDate" = n."scheduledDate" AND NOT current_notice.assigned AND current_notice.total > 0
      AND current_notice.labels = n.snapshot->'recordLabels' AND current_notice.total = (n.snapshot->>'totalRecords')::bigint
      AND current_notice.title = n.snapshot->>'title' AND current_notice."customerName" = n.snapshot->>'customerName'`);
  if (!canReadWorkflowRecords(context, "unassigned_visit")) query.whereRaw("false");
  if (!includeEmailOnly) query.where("n.inApp", true);
  return query;
}
export type WorkflowVisitEmail = { id: string; to: string; workspaceId: string; visitId: string; snapshot: WorkflowVisitSnapshot };

/** Targeted queue delivery, current shared-visit eligibility and preferences checked before transport. */
export async function processWorkflowVisitEmails(db: Knex, enabled: readonly PermissionId[],
  send: (mail: WorkflowVisitEmail) => Promise<void>, limit = 10, target?: { id: string; workspaceId: string }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid visit reminder email batch size.");
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const query = withoutSuspendedWorkspaces(db("workflowVisitNotifications"), "workflowVisitNotifications.workspaceId")
    .where({ emailStatus: "queued" }).where("nextAttemptAt", "<=", db.fn.now()).orderBy("nextAttemptAt").orderBy("id").limit(limit);
  if (target) query.where({ id: target.id, workspaceId: target.workspaceId });
  const candidates = await query.select("id", "workspaceId", "userId");
  for (const candidate of candidates) {
    try {
      await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false, async (trx, context) => {
        const queued = await trx("workflowVisitNotifications").where({ id: candidate.id, emailStatus: "queued" })
          .where("nextAttemptAt", "<=", trx.fn.now()).forUpdate().skipLocked().first("attempts");
        if (!queued) return;
        const row = await workflowVisitNotificationQuery(trx, context, true)
          .join("workflows as w", function () { this.on("w.id", "n.workflowId").andOn("w.workspaceId", "n.workspaceId"); })
          .join("users as u", "u.id", "n.userId").leftJoin("notificationPreferences as p", "p.userId", "n.userId")
          .where("n.id", candidate.id).select("n.visitId", "n.snapshot", "w.definition", "w.publisherId", "w.status", "u.email", "u.emailVerified", "p.workflowVisitEmail", "p.workflowMaterialsEmail",
            trx.raw(`n."scheduledDate" > (clock_timestamp() AT TIME ZONE (n.snapshot->>'timezone'))::date AS eligible`)).first();
        const definition = workflowDefinitionSchema.safeParse(row?.definition);
        if (!row || !row.eligible || row.status !== "active" || !row.emailVerified || (row.snapshot?.reason === "materials" ? row.workflowMaterialsEmail : row.workflowVisitEmail) === false || !definition.success ||
          !isVisitWorkflow(definition.data) || (definition.data.kind === "visit_materials") !== (row.snapshot?.reason === "materials") || !definition.data.notifications?.email || definition.data.recipientId !== context.userId ||
          !row.publisherId || !await workflowParticipantsEligible(trx, context, definition.data, row.publisherId)) {
          await trx("workflowVisitNotifications").where({ id: candidate.id }).update({ emailStatus: "skipped" }); summary.skipped++; return;
        }
        const attempts = queued.attempts + 1;
        try {
          await send({ id: candidate.id, to: row.email, workspaceId: candidate.workspaceId, visitId: row.visitId,
            snapshot: workflowVisitSnapshotSchema.parse(row.snapshot) });
          await trx("workflowVisitNotifications").where({ id: candidate.id }).update({ emailStatus: "sent", attempts, sentAt: trx.fn.now() }); summary.sent++;
        } catch {
          const failed = attempts >= 5; summary[failed ? "failed" : "retryPending"]++;
          await trx("workflowVisitNotifications").where({ id: candidate.id }).update({ emailStatus: failed ? "failed" : "queued", attempts,
            nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)) });
        }
      });
    } catch (error) {
      if (error instanceof WorkspaceSuspendedError) continue;
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db.transaction(async trx => {
        await trx("workspaces").where({ id: candidate.workspaceId }).forShare().first("id");
        await trx("workflowVisitNotifications").where({ id: candidate.id, emailStatus: "queued" }).update({ emailStatus: "skipped" });
      }); summary.skipped++;
    }
  }
  return summary;
}

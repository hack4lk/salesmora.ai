import type { Knex } from "knex";
import { workflowDefinitionSchema, workflowBriefingSnapshotSchema, type WorkflowBriefingSnapshot, type AuthorizationContext, type PermissionId } from "@salesmora/contracts";
import { AuthorizationAccessError, WorkspaceSuspendedError, withWorkspaceAuthorization } from "../authorization/store";
import { withoutSuspendedWorkspaces } from "../accounts/workspace-hold";
import { workflowParticipantsEligible } from "../workflows/execution";
import { workflowBriefingQuery } from "../workflows/briefings";

export function briefingNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext, includeEmailOnly = false) {
  const query = workflowBriefingQuery(trx, context).join("workflowBriefingNotifications as n", function () {
    this.on("n.workspaceId", "b.workspaceId").andOn("n.briefingId", "b.id");
  }).where("n.userId", context.userId);
  if (!includeEmailOnly) query.where("n.inApp", true);
  return query;
}
export type WorkflowBriefingEmail = { id: string; to: string; workspaceId: string; briefingId: string; snapshot: WorkflowBriefingSnapshot };

/** Briefings have their own personal email preference. */
export async function processWorkflowBriefingEmails(db: Knex, enabled: readonly PermissionId[],
  send: (mail: WorkflowBriefingEmail) => Promise<void>, limit = 10, target?: { id: string; workspaceId: string }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid briefing email batch size.");
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const query = withoutSuspendedWorkspaces(db("workflowBriefingNotifications"), "workflowBriefingNotifications.workspaceId")
    .where({ emailStatus: "queued" }).where("nextAttemptAt", "<=", db.fn.now())
    .orderBy("nextAttemptAt").orderBy("id").limit(limit);
  if (target) query.where({ id: target.id, workspaceId: target.workspaceId });
  const candidates = await query.select("id", "workspaceId", "userId");
  for (const candidate of candidates) {
    try {
      // Share lock holds current access/lifecycle stable while this notice is sent.
      await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false,
        async (trx, context) => {
          const queued = await trx("workflowBriefingNotifications").where({ id: candidate.id, emailStatus: "queued" })
            .where("nextAttemptAt", "<=", trx.fn.now()).forUpdate().skipLocked().first("attempts");
          if (!queued) return;
          const row = await briefingNotificationQuery(trx, context, true)
            .join("workflows as w", function () { this.on("w.id", "n.workflowId").andOn("w.workspaceId", "n.workspaceId"); })
            .join("workflowSteps as s", function () { this.on("s.id", "b.id").andOn("s.workspaceId", "b.workspaceId"); })
            .join("users as u", "u.id", "n.userId")
            .leftJoin("notificationPreferences as p", "p.userId", "n.userId")
            .where("n.id", candidate.id).select("n.briefingId", "b.snapshot", "w.definition", "w.publisherId", "w.status",
              "u.email", "u.emailVerified", "p.workflowBriefingEmail",
              trx.raw(`clock_timestamp() >= CASE WHEN s.origin = 'manual' THEN s."dueAt" + interval '5 minutes'
                ELSE s."dueAt" + interval '3 hours' END AS expired`)).first();
          const definition = workflowDefinitionSchema.safeParse(row?.definition);
          if (!row || row.expired || row.status !== "active" || !row.emailVerified || row.workflowBriefingEmail === false ||
            !definition.success || definition.data.kind !== "weekly_briefing" || !definition.data.notifications?.email ||
            definition.data.recipientId !== context.userId || !row.publisherId ||
            !await workflowParticipantsEligible(trx, context, definition.data, row.publisherId)) {
            await trx("workflowBriefingNotifications").where({ id: candidate.id }).update({ emailStatus: "skipped" });
            summary.skipped++; return;
          }
          const attempts = queued.attempts + 1;
          try {
            await send({ id: candidate.id, to: row.email, workspaceId: candidate.workspaceId, briefingId: row.briefingId,
              snapshot: workflowBriefingSnapshotSchema.parse(row.snapshot) });
            await trx("workflowBriefingNotifications").where({ id: candidate.id }).update({ emailStatus: "sent", attempts, sentAt: trx.fn.now() });
            summary.sent++;
          } catch {
            const failed = attempts >= 5;
            summary[failed ? "failed" : "retryPending"]++;
            await trx("workflowBriefingNotifications").where({ id: candidate.id }).update({ emailStatus: failed ? "failed" : "queued", attempts,
              nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)) });
          }
        });
    } catch (error) {
      if (error instanceof WorkspaceSuspendedError) continue;
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db.transaction(async trx => {
        await trx("workspaces").where({ id: candidate.workspaceId }).forShare().first("id");
        await trx("workflowBriefingNotifications").where({ id: candidate.id, emailStatus: "queued" }).update({ emailStatus: "skipped" });
      });
      summary.skipped++;
    }
  }
  return summary;
}

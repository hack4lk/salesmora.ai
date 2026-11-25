import type { Knex } from "knex";
import { workflowDefinitionSchema, type AuthorizationContext, type PermissionId } from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError, WorkspaceSuspendedError, withWorkspaceAuthorization } from "../authorization/store";
import { withoutSuspendedWorkspaces } from "../accounts/workspace-hold";
import { coldLeadRecipient } from '../workflows/assigned-lead-cold';
import { unassignedLeadEligibility, workflowParticipantsEligible } from "../workflows/execution";

export function leadWorkflowNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext, includeEmailOnly = false) {
  const query = trx("leadWorkflowNotifications as n").join("leads as l", function () {
    this.on("l.workspaceId", "n.workspaceId").andOn("l.id", "n.leadId");
  }).where({ "n.workspaceId": context.workspaceId, "n.userId": context.userId }).whereNull("l.archivedAt");
  const scope=resolveAuthorizedCollectionScope(context,'leads.read');
  if(!scope.allowed||!['workspace','assigned'].includes(scope.scope))query.whereRaw('false');
  if(scope.allowed&&scope.scope==='assigned')query.whereNotNull('n.activityAt').where('l.ownerId',context.userId);
  query.where(q=>q.whereNull('n.activityAt').orWhereRaw(`l."lastActivityAt"=n."activityAt" AND l."ownerId"=n."ownerId" AND l.stage IN ('new','contacted','estimate-sent') AND EXISTS(SELECT 1 FROM workflows cw WHERE cw."workspaceId"=n."workspaceId" AND cw.id=n."workflowId" AND cw.status='active' AND cw."deletedAt" IS NULL AND cw.version=n."workflowVersion" AND cw.definition->>'kind'='assigned_lead_cold' AND ((cw.definition->>'recipientMode'='owner' AND n."userId"=l."ownerId") OR (cw.definition->>'recipientMode'='teammate' AND cw.definition->>'recipientId'=n."userId" AND ?)))`,[scope.allowed&&scope.scope==='workspace']));
  if (!includeEmailOnly) query.where("n.inApp", true);
  return query;
}

export type LeadWorkflowEmail = { id: string; to: string; workspaceId: string; leadId: string; leadNumber: string; leadName: string; businessDays?: number };

/** Existing lead email preference applies to assignments and lead workflow reminders. */
export async function processLeadWorkflowEmails(db: Knex, enabled: readonly PermissionId[],
  send: (mail: LeadWorkflowEmail) => Promise<void>, limit = 10, target?: { id: string; workspaceId: string }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid lead reminder email batch size.");
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const query = withoutSuspendedWorkspaces(db("leadWorkflowNotifications"), "leadWorkflowNotifications.workspaceId")
    .where({ emailStatus: "queued" }).where("nextAttemptAt", "<=", db.fn.now())
    .orderBy("nextAttemptAt").orderBy("id").limit(limit);
  if (target) query.where({ id: target.id, workspaceId: target.workspaceId });
  const candidates = await query.select("id", "workspaceId", "userId");
  for (const candidate of candidates) {
    try {
      // Share lock holds current access/lifecycle stable while this notice is sent.
      await withWorkspaceAuthorization(db, { workspaceId: candidate.workspaceId, userId: candidate.userId }, enabled, false,
        async (trx, context) => {
          const queued = await trx("leadWorkflowNotifications").where({ id: candidate.id, emailStatus: "queued" })
            .where("nextAttemptAt", "<=", trx.fn.now()).forUpdate().skipLocked().first("attempts");
          if (!queued) return;
          const row = await leadWorkflowNotificationQuery(trx, context, true)
            .join("workflows as w", function () { this.on("w.id", "n.workflowId").andOn("w.workspaceId", "n.workspaceId"); })
            .join("users as u", "u.id", "n.userId")
            .leftJoin("notificationPreferences as p", "p.userId", "n.userId")
            .where("n.id", candidate.id).select("n.leadId", "n.activityAt", "n.businessDays", "l.ownerId", "l.leadNumber", "l.name", "w.definition", "w.publisherId", "w.status",
              "u.email", "u.emailVerified", "p.leadAssignedEmail", trx.raw(`${unassignedLeadEligibility} AS eligible`)).first();
          const definition = workflowDefinitionSchema.safeParse(row?.definition);
          const cold=definition.success&&definition.data.kind==='assigned_lead_cold';
          const participants=row&&definition.success&&row.publisherId?(cold&&definition.data.kind==='assigned_lead_cold'?await coldLeadRecipient(trx,context,definition.data,row.publisherId,row.ownerId)===context.userId:await workflowParticipantsEligible(trx,context,definition.data,row.publisherId)):false;
          if (!row || (!cold&&!row.eligible) || row.status !== 'active' || !row.emailVerified || row.leadAssignedEmail === false || !definition.success || !['unassigned_lead','assigned_lead_cold'].includes(definition.data.kind) || !definition.data.notifications?.email || (!cold&&definition.data.recipientId!==context.userId) || !participants) {
            await trx("leadWorkflowNotifications").where({ id: candidate.id }).update({ emailStatus: "skipped" });
            summary.skipped++; return;
          }
          const attempts = queued.attempts + 1;
          try {
            await send({ id: candidate.id, to: row.email, workspaceId: candidate.workspaceId, leadId: row.leadId,
              leadNumber: `LD-${String(row.leadNumber).padStart(4, "0")}`, leadName: row.name,...(cold?{businessDays:row.businessDays}:{}) });
            await trx("leadWorkflowNotifications").where({ id: candidate.id }).update({ emailStatus: "sent", attempts, sentAt: trx.fn.now() });
            summary.sent++;
          } catch {
            const failed = attempts >= 5;
            summary[failed ? "failed" : "retryPending"]++;
            await trx("leadWorkflowNotifications").where({ id: candidate.id }).update({ emailStatus: failed ? "failed" : "queued", attempts,
              nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)) });
          }
        });
    } catch (error) {
      if (error instanceof WorkspaceSuspendedError) continue;
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db.transaction(async trx => {
        await trx("workspaces").where({ id: candidate.workspaceId }).forShare().first("id");
        await trx("leadWorkflowNotifications").where({ id: candidate.id, emailStatus: "queued" }).update({ emailStatus: "skipped" });
      });
      summary.skipped++;
    }
  }
  return summary;
}

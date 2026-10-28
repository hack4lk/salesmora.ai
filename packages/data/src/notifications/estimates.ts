import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateNotificationEventSchema,
  estimateStatusSchema,
  permissionIds,
  type AuthorizationContext,
  type EstimateNotificationEvent,
  type EstimateStatus,
  type PermissionId,
} from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization } from "../authorization/store";

type EstimateNotificationRow = {
  id: string;
  workspaceId: string;
  estimateId: string;
  userId: string;
  event: EstimateNotificationEvent;
  createdAt: Date | string;
  readAt: Date | null;
  estimateNumber: number;
  estimateName: string;
  currentStatus: EstimateStatus;
  validUntil: string | null;
  expiringSoon: boolean;
};

function hasEstimateReadScope(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  return scope.allowed && scope.resourceKind === "estimate" &&
    ["workspace", "assigned_job"].includes(scope.scope);
}

function constrainEstimateRead(
  query: Knex.QueryBuilder,
  trx: Knex.Transaction,
  context: AuthorizationContext,
) {
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  if (!scope.allowed || scope.resourceKind !== "estimate" ||
      !["workspace", "assigned_job"].includes(scope.scope)) {
    query.whereRaw("false");
    return query;
  }
  query.where("e.workspaceId", context.workspaceId).whereNull("e.archivedAt")
    .whereNot("e.status", "superseded")
    .whereNotExists(
      trx("estimates as newer")
        .select(trx.raw("1"))
        .whereRaw(`newer."workspaceId" = e."workspaceId"
          AND newer."estimateNumber" = e."estimateNumber"
          AND newer.revision > e.revision`),
    );
  if (scope.scope === "assigned_job") {
    query.where("e.parentType", "job").whereExists(
      trx("jobs as scoped_job").select(trx.raw("1"))
        .whereRaw(`scoped_job."workspaceId" = e."workspaceId"
          AND scoped_job.id = e."jobId"`)
        .andWhere(assigned => assigned
          .where("scoped_job.primaryOwnerId", context.userId)
          .orWhereExists(
            trx("jobTeamMembers as scoped_team").select(trx.raw("1"))
              .whereRaw(`scoped_team."workspaceId" = scoped_job."workspaceId"
                AND scoped_team."jobId" = scoped_job.id`)
              .where("scoped_team.userId", context.userId),
          )),
    );
  }
  return query;
}

function visibleEstimateQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return constrainEstimateRead(
    trx("estimates as e").join("workspaces as w", "w.id", "e.workspaceId"),
    trx,
    context,
  );
}

export function canReadEstimateNotifications(context: AuthorizationContext) {
  return hasEstimateReadScope(context);
}

export function estimateNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  const query = trx("estimateNotifications as n")
    .join("estimates as e", function joinEstimate() {
      this.on("e.id", "n.estimateId").andOn("e.workspaceId", "n.workspaceId");
    })
    .join("workspaces as w", "w.id", "e.workspaceId")
    .where("n.workspaceId", context.workspaceId)
    .where("n.userId", context.userId);
  constrainEstimateRead(query, trx, context);
  return query;
}

export async function notifyEstimateRecipients(
  trx: Knex.Transaction,
  input: {
    workspaceId: string;
    estimateId: string;
    event: EstimateNotificationEvent;
    dedupeKey: string;
    actorId?: string | null;
  },
  enabled: readonly PermissionId[] = permissionIds,
) {
  const event = estimateNotificationEventSchema.parse(input.event);
  if (!input.dedupeKey || input.dedupeKey.length > 200) {
    throw new RangeError("Estimate notification keys must be between 1 and 200 characters.");
  }
  const estimate = await trx("estimates")
    .where({ workspaceId: input.workspaceId, id: input.estimateId })
    .first("ownerId", "parentType", "leadId", "jobId");
  if (!estimate) return 0;

  const parentOwner = estimate.parentType === "lead"
    ? await trx("leads").where({ workspaceId: input.workspaceId, id: estimate.leadId }).first("ownerId")
    : await trx("jobs").where({ workspaceId: input.workspaceId, id: estimate.jobId }).first("primaryOwnerId");
  const recipients = new Set<string>([
    estimate.ownerId,
    estimate.parentType === "lead" ? parentOwner?.ownerId : parentOwner?.primaryOwnerId,
  ].filter((userId): userId is string => typeof userId === "string"));
  let created = 0;
  for (const userId of recipients) {
    if (userId === input.actorId) continue;
    try {
      created += await withWorkspaceAuthorization(
        trx,
        { workspaceId: input.workspaceId, userId },
        enabled,
        false,
        async (nested, context) => {
          const visible = await visibleEstimateQuery(nested, context)
            .where("e.id", input.estimateId).first("e.id");
          if (!visible) return 0;
          const rows = await nested("estimateNotifications").insert({
            id: randomUUID(),
            workspaceId: input.workspaceId,
            estimateId: input.estimateId,
            userId,
            event,
            dedupeKey: input.dedupeKey,
          }).onConflict(["workspaceId", "dedupeKey", "userId"]).ignore().returning("id");
          return rows.length;
        },
      );
    } catch (error) {
      if (!(error instanceof AuthorizationAccessError)) throw error;
    }
  }
  return created;
}

function notificationStatus(trx: Knex.Transaction) {
  return trx.raw(`CASE WHEN e.status IN ('sent','published')
      AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
    THEN 'expired' ELSE e.status END AS "currentStatus"`);
}

function reminderWindow(trx: Knex.Transaction) {
  return trx.raw(`(e."validUntil" >= (now() AT TIME ZONE w.timezone)::date
    AND e."validUntil" <= (now() AT TIME ZONE w.timezone)::date + 3) AS "expiringSoon"`);
}

function currentForEmail(row: EstimateNotificationRow) {
  switch (row.event) {
    case "sent":
    case "delivery_failed":
      return row.currentStatus === "sent";
    case "viewed":
      return row.currentStatus !== "draft" && row.currentStatus !== "superseded";
    case "decision_recorded":
      return row.currentStatus === "accepted" || row.currentStatus === "declined";
    case "expiring_soon":
      return (row.currentStatus === "sent" || row.currentStatus === "published") &&
        row.expiringSoon;
    case "expired":
      return row.currentStatus === "expired";
    default:
      return false;
  }
}

export type EstimateNotificationEmail = {
  id: string;
  to: string;
  workspaceId: string;
  event: EstimateNotificationEvent;
  estimateId: string;
  estimateNumber: string;
  estimateName: string;
  status: EstimateStatus;
};

export async function processEstimateNotificationEmails(
  db: Knex,
  enabled: readonly PermissionId[],
  send: (mail: EstimateNotificationEmail) => Promise<void>,
  limit = 10,
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Invalid Estimate notification delivery batch size.");
  }
  const summary = { sent: 0, skipped: 0, retryPending: 0, failed: 0 };
  const candidates = await db("estimateNotifications")
    .where({ emailStatus: "queued" })
    .where("nextAttemptAt", "<=", db.fn.now())
    .orderBy("nextAttemptAt").orderBy("id").limit(limit)
    .select("id", "workspaceId", "userId");

  for (const candidate of candidates) {
    try {
      await withWorkspaceAuthorization(
        db,
        { workspaceId: candidate.workspaceId, userId: candidate.userId },
        enabled,
        false,
        async (trx, context) => {
          const queued = await trx("estimateNotifications")
            .where({ id: candidate.id, emailStatus: "queued" })
            .where("nextAttemptAt", "<=", trx.fn.now())
            .forUpdate().skipLocked().first();
          if (!queued) return;
          const row = await estimateNotificationQuery(trx, context)
            .where("n.id", candidate.id)
            .select(
              "n.event", "n.estimateId", "n.attempts", "n.createdAt",
              "e.estimateNumber", "e.name as estimateName", "e.validUntil",
              "u.email", "u.emailVerified",
              notificationStatus(trx),
              reminderWindow(trx),
            )
            .join("users as u", "u.id", "n.userId")
            .first() as (EstimateNotificationRow & {
              attempts: number;
              email: string;
              emailVerified: boolean;
            }) | undefined;
          const preference = await trx("notificationPreferences")
            .where({ userId: context.userId }).first("estimateEmail");
          if (!row || !currentForEmail(row) || !row.emailVerified ||
              preference?.estimateEmail === false) {
            await trx("estimateNotifications").where({ id: candidate.id })
              .update({ emailStatus: "skipped" });
            summary.skipped++;
            return;
          }
          const attempts = queued.attempts + 1;
          try {
            await send({
              id: candidate.id,
              to: row.email,
              workspaceId: candidate.workspaceId,
              event: estimateNotificationEventSchema.parse(row.event),
              estimateId: row.estimateId,
              estimateNumber: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
              estimateName: row.estimateName,
              status: estimateStatusSchema.parse(row.currentStatus),
            });
            await trx("estimateNotifications").where({ id: candidate.id }).update({
              emailStatus: "sent", attempts, sentAt: trx.fn.now(),
            });
            summary.sent++;
          } catch {
            const failed = attempts >= 5;
            summary[failed ? "failed" : "retryPending"]++;
            await trx("estimateNotifications").where({ id: candidate.id }).update({
              emailStatus: failed ? "failed" : "queued",
              attempts,
              nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)),
            });
          }
        },
      );
    } catch (error) {
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db.transaction(async trx => {
        await trx("workspaces").where({ id: candidate.workspaceId }).forShare().first("id");
        await trx("estimateNotifications")
          .where({ id: candidate.id, emailStatus: "queued" })
          .update({ emailStatus: "skipped" });
      });
      summary.skipped++;
    }
  }
  return summary;
}

export async function scheduleEstimateReminders(
  db: Knex,
  now?: Date,
): Promise<{ reminders: number }> {
  if (now && !Number.isFinite(now.getTime())) {
    throw new RangeError("A valid Estimate reminder time is required.");
  }
  const instant = now ? now.toISOString() : db.raw("clock_timestamp()");
  const workspaces = await db("workspaces as w")
    .whereNull("w.deletionRequestedAt")
    .whereExists(
      db("estimates as e").select(db.raw("1"))
        .whereRaw('e."workspaceId" = w.id')
        .whereIn("e.status", ["sent", "published"])
        .whereNull("e.archivedAt")
        .whereNotExists(
          db("estimates as newer").select(db.raw("1"))
            .whereRaw(`newer."workspaceId" = e."workspaceId"
              AND newer."estimateNumber" = e."estimateNumber"
              AND newer.revision > e.revision`),
        )
        .whereRaw(`e."validUntil" BETWEEN
          (?::timestamptz AT TIME ZONE w.timezone)::date AND
          (?::timestamptz AT TIME ZONE w.timezone)::date + 3`, [instant, instant]),
    )
    .select("w.id").orderBy("w.id").limit(50);
  let reminders = 0;
  for (const workspace of workspaces) {
    reminders += await db.transaction(async trx => {
      const locked = await trx("workspaces").where({ id: workspace.id })
        .whereNull("deletionRequestedAt").forUpdate().first("id", "timezone");
      if (!locked) return 0;
      const estimates = await trx("estimates as e")
        .where("e.workspaceId", locked.id)
        .whereIn("e.status", ["sent", "published"])
        .whereNull("e.archivedAt")
        .whereNotExists(
          trx("estimates as newer").select(trx.raw("1"))
            .whereRaw(`newer."workspaceId" = e."workspaceId"
              AND newer."estimateNumber" = e."estimateNumber"
              AND newer.revision > e.revision`),
        )
        .whereRaw(`e."validUntil" BETWEEN
          (?::timestamptz AT TIME ZONE ?)::date AND
          (?::timestamptz AT TIME ZONE ?)::date + 3`,
          [instant, locked.timezone, instant, locked.timezone],
        )
        .select(
          "e.id",
          trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntilDate"`),
        )
        .orderBy("e.validUntil").orderBy("e.id").limit(100);
      let created = 0;
      for (const estimate of estimates) {
        created += await notifyEstimateRecipients(trx, {
          workspaceId: locked.id,
          estimateId: estimate.id,
          event: "expiring_soon",
          dedupeKey: `estimate:${estimate.id}:expiring:${estimate.validUntilDate}`,
        });
      }
      return created;
    });
  }
  return { reminders };
}

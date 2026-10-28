import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { estimateEmailDestinationSchema, type PermissionId } from "@salesmora/contracts";
import { validEstimateFrozenSnapshot } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization } from "../authorization/store";
import type { EstimateEmailInput } from "../email/estimate";
import { authorizeEstimateDelivery } from "./drafts";
import { estimateSnapshotHash } from "./sharing-paper";
import { recoverEstimateShareToken } from "./share-token";
import { notifyEstimateRecipients } from "../notifications/estimates";

export type EstimateEmailDelivery = Omit<EstimateEmailInput, "baseURL"> & { id: string; to: string; queuedAt: Date | string };
type FailureCode = "authorization" | "inactive" | "invalid" | "transport";
export const estimateDeliveryFailureMessages: Record<FailureCode, string> = {
  authorization: "Delivery stopped because the sender no longer has access to send this estimate.",
  inactive: "Delivery stopped because the estimate or customer link is no longer active.",
  invalid: "Delivery stopped because the frozen estimate or customer link could not be verified.",
  transport: "The email could not be delivered within the retry window. Check email delivery and review the recipient before resending.",
};
export function estimateDeliveryFailureMessage(code: unknown): string | undefined {
  switch (code) {
    case "authorization": case "inactive": case "invalid": case "transport":
      return estimateDeliveryFailureMessages[code];
    default: return undefined;
  }
}
type DeliveryRow = {
  id: string; workspaceId: string; estimateId: string; snapshotId: string;
  requestedBy: string | null; recipient: string; subject: string; attemptCount: number; queuedAt: Date | string;
  status: "queued" | "sent" | "failed" | "bounced";
};
type Candidate = Pick<DeliveryRow, "id" | "workspaceId" | "estimateId" | "requestedBy">;
const now = (db: Knex) => db.raw("clock_timestamp()");

async function fail(
  trx: Knex.Transaction,
  delivery: Candidate,
  code: FailureCode,
  enabled?: readonly PermissionId[],
) {
  await trx("estimate_deliveries").where({ id: delivery.id, status: "queued" }).update({
    status: "failed", failedAt: now(trx), failureCode: code,
  });
  await deliveryActivity(trx, delivery, "delivery-failed", { reason: code });
  if (enabled && (code === "invalid" || code === "transport")) {
    await notifyEstimateRecipients(trx, {
      workspaceId: delivery.workspaceId,
      estimateId: delivery.estimateId,
      event: "delivery_failed",
      dedupeKey: `estimate:${delivery.estimateId}:delivery-failed:${delivery.id}`,
      actorId: delivery.requestedBy,
    }, enabled);
  }
}

/** Caller holds the exclusive workspace lock, excluding in-flight transports. */
export async function stopEstimateDeliveries(trx: Knex.Transaction, workspaceId: string, estimateId: string) {
  const rows: Candidate[] = await trx("estimate_deliveries").where({ workspaceId, estimateId, status: "queued" })
    .orderBy("id").forUpdate().select("id", "workspaceId", "estimateId", "requestedBy");
  for (const row of rows) await fail(trx, row, "inactive");
}

async function deliveryActivity(
  trx: Knex.Transaction,
  delivery: Candidate,
  type: string,
  changes: Record<string, unknown>,
) {
  await trx("estimate_activity").insert({
    id: randomUUID(), workspaceId: delivery.workspaceId, estimateId: delivery.estimateId,
    actorId: null, actorName: "Email delivery", source: "worker", type,
    changes: JSON.stringify(changes),
  });
}

async function claim(trx: Knex.Transaction, id: string): Promise<DeliveryRow | undefined> {
  return trx<DeliveryRow>("estimate_deliveries").where({ id, status: "queued" })
    .where("nextAttemptAt", "<=", now(trx)).forUpdate().skipLocked().first();
}

async function deliveryContent(trx: Knex.Transaction, delivery: DeliveryRow): Promise<EstimateEmailDelivery | null> {
  const row = await trx("estimate_snapshots").where({
    id: delivery.snapshotId, estimateId: delivery.estimateId, workspaceId: delivery.workspaceId,
  }).first("content", "contentHash");
  const snapshot = row && validEstimateFrozenSnapshot(row.content);
  if (!snapshot || estimateSnapshotHash(snapshot) !== row.contentHash) return null;
  const link = await trx("estimate_share_tokens").where({
    workspaceId: delivery.workspaceId, estimateId: delivery.estimateId, snapshotId: delivery.snapshotId,
  }).first();
  if (!link?.encryptedToken) return null;
  const request = estimateEmailDestinationSchema.safeParse({
    recipientEmail: delivery.recipient, subject: delivery.subject,
  });
  if (!request.success) return null;
  let token: string;
  try {
    token = recoverEstimateShareToken(link.encryptedToken, link.tokenHash);
  } catch {
    // An unverifiable link is a terminal failure, not a reason to regenerate or send one.
    return null;
  }
  const { content, amounts } = snapshot;
  return {
    id: delivery.id, to: delivery.recipient, subject: delivery.subject, token, queuedAt: delivery.queuedAt,
    businessName: content.business.name, replyTo: content.business.email,
    recipientName: content.recipientName, number: content.number, name: content.name,
    totalCents: amounts.totalCents, validUntil: content.validUntil,
    ...(content.paymentLink ? { paymentLink: content.paymentLink } : {}),
  };
}

/** Same workspace -> outbox lock order as mutations; only transport failures consume retry attempts. */
export async function processEstimateEmails(
  db: Knex,
  enabled: readonly PermissionId[],
  send: (mail: EstimateEmailDelivery) => Promise<{ providerMessageId: string }>,
  limit = 10,
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid estimate delivery batch size.");
  const summary = { sent: 0, retryPending: 0, failed: 0 };
  const candidates: Candidate[] = await db("estimate_deliveries").where({ status: "queued" })
    .where("nextAttemptAt", "<=", now(db)).orderBy("nextAttemptAt").orderBy("id").limit(limit)
    .select("id", "workspaceId", "estimateId", "requestedBy");
  for (const candidate of candidates) {
    try {
      if (!candidate.requestedBy) throw new AuthorizationAccessError();
      await withWorkspaceAuthorization(db, {
        workspaceId: candidate.workspaceId, userId: candidate.requestedBy,
      }, enabled, false, async (trx, context) => {
        const delivery = await claim(trx, candidate.id);
        if (!delivery) return;
        const estimate = await authorizeEstimateDelivery(trx, context, delivery.estimateId);
        const link = await trx("estimate_share_tokens").where({
          workspaceId: context.workspaceId, estimateId: delivery.estimateId, snapshotId: delivery.snapshotId,
        }).whereNull("revokedAt").where("expiresAt", ">", now(trx)).first("id");
        if (estimate.status !== "sent" || estimate.archivedAt || !link) {
          await fail(trx, delivery, "inactive"); summary.failed++; return;
        }
        const mail = await deliveryContent(trx, delivery);
        if (!mail) { await fail(trx, delivery, "invalid", context.enabledPermissions); summary.failed++; return; }
        const attempts = delivery.attemptCount + 1;
        let receipt: { providerMessageId: string };
        try {
          receipt = await send(mail);
          if (!receipt.providerMessageId || /[\r\n]/.test(receipt.providerMessageId)) {
            throw new Error("Missing estimate delivery receipt.");
          }
        } catch {
          if (attempts >= 5) {
            await fail(trx, delivery, "transport", context.enabledPermissions);
            await trx("estimate_deliveries").where({ id: delivery.id }).update({ attemptCount: attempts });
            summary.failed++;
          } else {
            await trx("estimate_deliveries").where({ id: delivery.id }).update({
              attemptCount: attempts, nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** (attempts - 1)),
            });
            summary.retryPending++;
          }
          return;
        }
        await trx("estimate_deliveries").where({ id: delivery.id }).update({
          status: "sent", attemptCount: attempts, sentAt: now(trx),
          providerMessageId: receipt.providerMessageId, failureCode: null,
        });
        await deliveryActivity(trx, delivery, "email-sent", { attempts });
        summary.sent++;
      });
    } catch (error) {
      if (!(error instanceof AuthorizationAccessError)) throw error;
      await db.transaction(async trx => {
        await trx("workspaces").where({ id: candidate.workspaceId }).forShare().first("id");
        const delivery = await claim(trx, candidate.id);
        if (delivery) { await fail(trx, delivery, "authorization"); summary.failed++; }
      });
    }
  }
  return summary;
}

import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateIdSchema,
  estimateShareTokenSchema,
  permissionIds,
  shareEstimateSchema,
  type EstimateFrozenSnapshot,
  type EstimateStatus,
  type PermissionId,
  type ShareEstimateInput,
  type AuthorizationContext,
} from "@salesmora/contracts";
import { canTransitionEstimate } from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import {
  EstimateDraftConflictError,
  EstimateDraftValidationError,
  loadEstimateSharingContext,
  loadEstimateRevisionSharingReview,
  validateEstimateRevisionConfirmation,
} from "./drafts";
import { estimateEmailSubject, estimateSharingPaper, estimateSnapshotHash, verifiedEstimateFrozenSnapshot } from "./sharing-paper";
import { estimateTokenHash, newEstimateShareToken, recoverEstimateShareToken } from "./share-token";
import { decryptFile, deserializeDekEnvelope, deserializeFileCiphertext } from "../files/encryption";
import type { StorageAdapter } from "../files/storage-adapter";
import { estimateDeliveryFailureMessage, stopEstimateDeliveries } from "./delivery";
import { notifyEstimateRecipients } from "../notifications/estimates";

export { estimateDraftPaperContent, estimateEmailSubject } from "./sharing-paper";

type SnapshotRow = {
  id: string;
  workspaceId: string;
  estimateId: string;
  content: unknown;
  contentHash: string;
  estimateVersion: number;
};
type TokenRow = {
  id: string;
  workspaceId: string;
  estimateId: string;
  snapshotId: string;
  tokenHash: string;
  encryptedToken: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  viewCount: number;
  firstViewedAt: Date | null;
};
export type EstimateSharedPaper = {
  state: "snapshot";
  estimateId: string;
  version: number;
  snapshotHash: string;
  content: EstimateFrozenSnapshot["content"];
  amounts: EstimateFrozenSnapshot["amounts"];
};
export type EstimateShareReceipt = {
  estimateId: string;
  version: number;
  snapshotHash: string;
  status: "sent" | "published";
};
export type EstimateSharingDelivery = {
  email:
    | { state: "not-sent" }
    | {
      state: "queued" | "sent" | "failed" | "bounced"; recipientEmail: string; updatedAt: string;
      attemptCount: number; nextAttemptAt: string | null; failureMessage?: string;
    };
  link: {
    state: "not-created" | "active" | "expired" | "revoked" | "replaced" | "unavailable";
    expiresAt: string | null;
    firstViewedAt: string | null;
  };
};

function checkedSnapshot(row: SnapshotRow): EstimateFrozenSnapshot {
  const snapshot = verifiedEstimateFrozenSnapshot(row.content, row.contentHash);
  if (!snapshot) {
    throw new EstimateDraftValidationError("The frozen estimate is unavailable. Its snapshot is invalid.");
  }
  return snapshot;
}

function sharedPaper(row: SnapshotRow): EstimateSharedPaper {
  const snapshot = checkedSnapshot(row);
  return {
    state: "snapshot",
    estimateId: row.estimateId,
    version: row.estimateVersion,
    snapshotHash: row.contentHash,
    content: snapshot.content,
    amounts: snapshot.amounts,
  };
}

async function frozenRow(trx: Knex.Transaction, workspaceId: string, estimateId: string) {
  return trx<SnapshotRow>("estimate_snapshots").where({ workspaceId, estimateId }).first();
}

function activeLink(token: TokenRow | undefined, status: EstimateStatus, now: Date) {
  return !!token && !token.revokedAt && token.expiresAt > now &&
    ["sent", "published", "accepted", "declined"].includes(status);
}

async function deliverySummary(
  trx: Knex.Transaction,
  workspaceId: string,
  estimateId: string,
  status: EstimateStatus,
): Promise<EstimateSharingDelivery> {
  const token = await trx<TokenRow>("estimate_share_tokens").where({ workspaceId, estimateId }).first();
  const mail = await trx("estimate_deliveries").where({ workspaceId, estimateId })
    .orderBy("queuedAt", "desc").orderBy("id", "desc").first();
  const now = (await trx.raw("SELECT clock_timestamp() AS now")).rows[0].now as Date;
  const state = !token ? "not-created"
    : status === "superseded" ? "replaced"
      : status === "void" || token.revokedAt ? "revoked"
        : token.expiresAt <= now || status === "expired" ? "expired"
          : activeLink(token, status, now) ? "active" : "unavailable";
  return {
    email: mail ? {
      state: mail.status,
      recipientEmail: mail.recipient,
      updatedAt: (mail.bouncedAt ?? mail.failedAt ?? mail.sentAt ?? mail.queuedAt).toISOString(),
      attemptCount: mail.attemptCount,
      nextAttemptAt: mail.status === "queued" && mail.attemptCount > 0 ? mail.nextAttemptAt.toISOString() : null,
      failureMessage: estimateDeliveryFailureMessage(mail.failureCode),
    } : { state: "not-sent" },
    link: {
      state,
      expiresAt: token?.expiresAt.toISOString() ?? null,
      firstViewedAt: token?.firstViewedAt?.toISOString() ?? null,
    },
  };
}

/** Version/hash-bound review; no token is returned or sharing performed here. */
export async function readEstimateSharingReview(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  estimateId: string,
) {
  estimateIdSchema.parse(estimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    return readEstimateSharingReviewInTransaction(trx, context, estimateId);
  });
}
export async function readEstimateSharingReviewInTransaction(trx: Knex.Transaction, context: AuthorizationContext, estimateId: string) {
    const { seed, canSend } = await loadEstimateSharingContext(trx, context, estimateId);
    const estimate = seed.estimate;
    if (!estimate) throw new AuthorizationAccessError();
    const row = await frozenRow(trx, context.workspaceId, estimateId);
    const draft = estimate.status === "draft" ? estimateSharingPaper(seed) : null;
    const paper = row ? sharedPaper(row) : null;
    const snapshotHash = paper?.snapshotHash ?? (draft?.snapshot ? estimateSnapshotHash(draft.snapshot) : null);
    return {
      estimate,
      today: seed.today,
      canSend,
      subject: estimateEmailSubject(estimate.number, paper?.content.business.name ?? seed.paperBusiness.name),
      issues: draft?.issues ?? [],
      snapshotHash,
      paper,
      draftPaper: draft?.snapshot && snapshotHash && !draft.issues.length ? {
        state: "snapshot" as const, estimateId, version: estimate.version, snapshotHash,
        content: draft.snapshot.content, amounts: draft.snapshot.amounts,
      } : null,
      draft: draft?.content ?? null,
      delivery: await deliverySummary(trx, context.workspaceId, estimateId, estimate.status),
      revision: await loadEstimateRevisionSharingReview(trx, context, estimateId, false),
    };
}
export type EstimateSharingReviewResult = Awaited<ReturnType<typeof readEstimateSharingReview>>;

async function activity(
  trx: Knex.Transaction,
  identity: WorkspaceIdentity,
  estimateId: string,
  type: string,
  changes: Record<string, unknown>,
  source: "ui" | "assistant-confirmed" = "ui",
) {
  const actor = await trx("users").where({ id: identity.userId }).first("name");
  await trx("estimate_activity").insert({
    id: randomUUID(), workspaceId: identity.workspaceId, estimateId,
    actorId: identity.userId, actorName: actor.name, source, type,
    changes: JSON.stringify(changes),
  });
}

/** The transaction owns authorization, reviewed content, version, receipt, snapshot, link and outbox. */
export async function shareEstimate(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
): Promise<EstimateShareReceipt> {
  const input = shareEstimateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return shareEstimateInTransaction(trx, context, input);
  });
}
export async function shareEstimateInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown, source: "ui" | "assistant-confirmed" = "ui",
): Promise<EstimateShareReceipt> {
    const input = shareEstimateSchema.parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
    const identity = context;
    const { seed, canSend } = await loadEstimateSharingContext(trx, context, input.estimateId);
    const estimate = seed.estimate;
    if (!estimate || !canSend) throw new AuthorizationAccessError();
    const inputHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts")
      .where({ workspaceId: identity.workspaceId, submissionId: input.submissionId }).first();
    if (prior) {
      if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId ||
          prior.operation !== input.mode || prior.inputHash !== inputHash) {
        throw new EstimateDraftConflictError("This confirmation was already used for a different request.");
      }
      const frozen = await frozenRow(trx, identity.workspaceId, input.estimateId);
      if (!frozen) throw new EstimateDraftConflictError("The confirmed snapshot is unavailable.");
      checkedSnapshot(frozen);
      return {
        estimateId: input.estimateId, version: prior.version, snapshotHash: frozen.contentHash,
        status: input.mode === "publish" ? "published" : "sent",
      };
    }
    if (estimate.version !== input.expectedVersion) throw new EstimateDraftConflictError();
    if (estimate.archived) throw new EstimateDraftValidationError("Restore the estimate before sharing.");
    const target = input.mode === "publish" ? "published" : "sent";
    const existingSnapshot = await frozenRow(trx, identity.workspaceId, input.estimateId);
    let snapshotId: string;
    let snapshot: EstimateFrozenSnapshot;
    let snapshotHash: string;
    if (input.mode === "resend") {
      const delivery = await deliverySummary(trx, identity.workspaceId, estimate.id, estimate.status);
      const queued = await trx("estimate_deliveries")
        .where({ workspaceId: identity.workspaceId, estimateId: estimate.id, status: "queued" }).first("id");
      if (estimate.status !== "sent" || delivery.link.state !== "active" ||
          delivery.email.state === "not-sent" || queued || !existingSnapshot) {
        throw new EstimateDraftValidationError("Only an active Sent estimate without a queued email can be resent.");
      }
      snapshot = checkedSnapshot(existingSnapshot);
      snapshotId = existingSnapshot.id;
      snapshotHash = existingSnapshot.contentHash;
    } else {
      if (!canTransitionEstimate(estimate.status, target) || existingSnapshot) {
        throw new EstimateDraftValidationError("Only a saved, never-shared Draft can be sent or published.");
      }
      const review = estimateSharingPaper(seed);
      if (review.issues.length || !review.snapshot) {
        throw new EstimateDraftValidationError(review.issues.join(" ") || "The customer paper is incomplete.");
      }
      snapshot = review.snapshot;
      snapshotHash = estimateSnapshotHash(snapshot);
      snapshotId = randomUUID();
    }
    if (input.snapshotHash !== snapshotHash) {
      throw new EstimateDraftConflictError("The reviewed customer paper changed. Reload and review it before confirming.");
    }
    const revision = input.mode === "resend" ? null : await loadEstimateRevisionSharingReview(trx, context, estimate.id);
    if (input.mode !== "resend") validateEstimateRevisionConfirmation(revision, input.revisionReview);
    if (input.mode !== "publish") validateEmailRequest(input, snapshot);
    const version = estimate.version + 1;
    if (input.mode !== "resend") {
      await verifySnapshotLogo(trx, identity.workspaceId, snapshot);
      await trx("estimate_snapshots").insert({
        id: snapshotId, workspaceId: identity.workspaceId, estimateId: estimate.id,
        content: JSON.stringify(snapshot), contentHash: snapshotHash, estimateVersion: version,
      });
      const token = newEstimateShareToken();
      // PostgreSQL resolves DST and the workspace-local next midnight, never the browser timezone.
      const expiry = await trx("workspaces").where({ id: identity.workspaceId })
        .select(trx.raw('((?::date + 1)::timestamp AT TIME ZONE timezone) AS "expiresAt"', [snapshot.content.validUntil]))
        .first();
      await trx("estimate_share_tokens").insert({
        id: randomUUID(), workspaceId: identity.workspaceId, estimateId: estimate.id, snapshotId,
        ...token, expiresAt: expiry.expiresAt,
      });
    }
    if (input.mode !== "publish") {
      await trx("estimate_deliveries").insert({
        id: randomUUID(), workspaceId: identity.workspaceId, estimateId: estimate.id, snapshotId,
        recipient: input.recipientEmail,
        recipientHash: createHash("sha256").update(input.recipientEmail.toLowerCase()).digest("hex"),
        subject: input.subject, requestedBy: identity.userId,
        idempotencyKey: `estimate-${input.submissionId}`,
      });
    }
    await trx("estimates").where({
      workspaceId: identity.workspaceId, id: estimate.id, version: input.expectedVersion,
    }).update({
      version, updatedAt: trx.fn.now(),
      ...(input.mode === "resend" ? {} : {
        status: target,
        [input.mode === "publish" ? "publishedAt" : "sentAt"]: trx.fn.now(),
      }),
    });
    if (revision) {
      const changed = await trx("estimates").where({
        workspaceId: context.workspaceId, id: revision.sourceEstimateId, version: revision.sourceVersion,
      }).update({ status: "superseded", supersededById: estimate.id, version: revision.sourceVersion + 1, updatedAt: trx.fn.now() });
      if (!changed) throw new EstimateDraftConflictError();
      await trx("estimate_share_tokens").where({ workspaceId: context.workspaceId, estimateId: revision.sourceEstimateId })
        .whereNull("revokedAt").update({ revokedAt: trx.fn.now() });
      await stopEstimateDeliveries(trx, context.workspaceId, revision.sourceEstimateId);
      await activity(trx, identity, revision.sourceEstimateId, "superseded", {
        status: { before: revision.sourceStatus, after: "superseded" },
        revision: { before: revision.sourceRevision, after: estimate.revision },
      }, source);
    }
    await activity(trx, identity, estimate.id, input.mode === "resend" ? "resent" : target, {
      ...(input.mode === "resend" ? {} : { status: { before: "draft", after: target } }),
      fromVersion: estimate.version, toVersion: version,
    }, source);
    if (input.mode === "send" || input.mode === "resend") {
      await notifyEstimateRecipients(trx, {
        workspaceId: identity.workspaceId,
        estimateId: estimate.id,
        event: "sent",
        dedupeKey: `estimate:${estimate.id}:sent:${input.submissionId}`,
        actorId: identity.userId,
      }, context.enabledPermissions);
    }
    await trx("estimate_operation_receipts").insert({
      workspaceId: identity.workspaceId, submissionId: input.submissionId,
      actorId: identity.userId, operation: input.mode, inputHash, estimateId: estimate.id, version,
    });
    return { estimateId: estimate.id, version, snapshotHash, status: target };
}

function validateEmailRequest(
  input: Exclude<ShareEstimateInput, { mode: "publish" }>,
  snapshot: EstimateFrozenSnapshot,
) {
  if (input.subject !== estimateEmailSubject(snapshot.content.number, snapshot.content.business.name)) {
    throw new EstimateDraftConflictError("The email subject changed. Reload and review the estimate.");
  }
}

async function verifySnapshotLogo(trx: Knex.Transaction, workspaceId: string, snapshot: EstimateFrozenSnapshot) {
  const path = snapshot.content.business.logoPath;
  if (!path) return;
  if (!await snapshotLogoFile(trx, workspaceId, snapshot)) {
    throw new EstimateDraftValidationError("The business logo is unavailable. Update it in Settings before sharing.");
  }
}

async function snapshotLogoFile(trx: Knex.Transaction, workspaceId: string, snapshot: EstimateFrozenSnapshot) {
  const path = snapshot.content.business.logoPath;
  if (!path) return null;
  return trx("files").where({
    workspaceId, id: path.split("/").at(-1), entityType: "estimate-business-profile-logo",
    entityId: workspaceId, status: "ready", mimeType: "image/webp", categoryTag: "saved",
  }).whereNull("deletedAt").first("storageKey", "encryptedDekB64");
}

async function snapshotLogo(
  trx: Knex.Transaction,
  storage: StorageAdapter,
  workspaceId: string,
  snapshot: EstimateFrozenSnapshot,
) {
  const file = await snapshotLogoFile(trx, workspaceId, snapshot);
  if (!file) throw new EstimateDraftValidationError("The frozen estimate logo is unavailable.");
  const encrypted = await storage.get(file.storageKey);
  return decryptFile({
    ...deserializeDekEnvelope(Buffer.from(file.encryptedDekB64, "base64")),
    ...deserializeFileCiphertext(encrypted),
  }).plaintext;
}

export async function readEstimateSnapshotLogo(
  db: Knex,
  storage: StorageAdapter,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  estimateId: string,
) {
  estimateIdSchema.parse(estimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    await loadEstimateSharingContext(trx, context, estimateId);
    const row = await frozenRow(trx, context.workspaceId, estimateId);
    if (!row) throw new AuthorizationAccessError();
    return snapshotLogo(trx, storage, context.workspaceId, checkedSnapshot(row));
  });
}

export async function readEstimateCustomerLink(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  estimateId: string,
) {
  estimateIdSchema.parse(estimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { seed } = await loadEstimateSharingContext(trx, context, estimateId);
    const estimate = seed.estimate;
    if (!estimate || estimate.archived) throw new AuthorizationAccessError();
    const summary = await deliverySummary(trx, identity.workspaceId, estimateId, estimate.status);
    if (summary.link.state !== "active") throw new AuthorizationAccessError();
    const row = await frozenRow(trx, identity.workspaceId, estimateId);
    if (!row) throw new AuthorizationAccessError();
    checkedSnapshot(row);
    const token = await trx<TokenRow>("estimate_share_tokens")
      .where({ workspaceId: identity.workspaceId, estimateId, snapshotId: row.id }).first();
    if (!token?.encryptedToken) throw new EstimateDraftValidationError("The customer link is unavailable.");
    return { path: `/e/${recoverEstimateShareToken(token.encryptedToken, token.tokenHash)}` };
  });
}

type PublicEstimateInactive = {
  state: "not-found" | "expired" | "revoked" | "withdrawn" | "replaced" | "unavailable" | "rate-limited";
};
export type PublicEstimateRead = { state: "ready"; snapshot: EstimateSharedPaper } | PublicEstimateInactive;

export async function readPublicEstimate(
  db: Knex,
  token: string,
  requesterKey: string,
): Promise<PublicEstimateRead> {
  const result = await withPublicEstimate(db, token, requesterKey, async (trx, row, link, now) => {
    await trx("estimate_share_tokens").where({ id: link.id }).update({
      viewCount: trx.raw('"viewCount" + 1'), firstViewedAt: link.firstViewedAt ?? now, lastViewedAt: now,
    });
    if (!link.firstViewedAt) {
      await trx("estimate_activity").insert({
        id: randomUUID(), workspaceId: row.workspaceId, estimateId: row.estimateId,
        actorId: null, actorName: "Customer", source: "system", type: "viewed", changes: "{}",
      });
      await notifyEstimateRecipients(trx, {
        workspaceId: row.workspaceId,
        estimateId: row.estimateId,
        event: "viewed",
        dedupeKey: `estimate:${row.estimateId}:viewed:${link.id}`,
      }, permissionIds);
    }
    return sharedPaper(row);
  });
  return result.state === "ready" ? { state: "ready", snapshot: result.value } : result;
}

export async function readPublicEstimateLogo(
  db: Knex,
  storage: StorageAdapter,
  token: string,
  requesterKey: string,
): Promise<{ state: "ready"; image: Buffer } | PublicEstimateInactive> {
  const result = await withPublicEstimate(db, token, requesterKey, async (trx, row) =>
    snapshotLogo(trx, storage, row.workspaceId, checkedSnapshot(row)),
  );
  return result.state === "ready" ? { state: "ready", image: result.value } : result;
}

/** Page and logo reads hold the same workspace/token locks throughout their protected work. */
async function withPublicEstimate<T>(
  db: Knex,
  token: string,
  requesterKey: string,
  use: (trx: Knex.Transaction, row: SnapshotRow, link: TokenRow, now: Date) => Promise<T>,
): Promise<{ state: "ready"; value: T } | PublicEstimateInactive> {
  if (!requesterKey || requesterKey.length > 200) throw new RangeError("A bounded public requester key is required.");
  if (!await consumePublicRead(db, requesterKey)) return { state: "rate-limited" };
  if (!estimateShareTokenSchema.safeParse(token).success) return { state: "not-found" };
  const candidate = await db<TokenRow>("estimate_share_tokens").where({ tokenHash: estimateTokenHash(token) })
    .first("workspaceId", "id");
  if (!candidate) return { state: "not-found" };
  return db.transaction(async trx => {
    const workspace = await trx("workspaces").where({ id: candidate.workspaceId })
      .whereNull("deletionRequestedAt").forShare().first("id");
    if (!workspace) return { state: "not-found" };
    const link = await trx<TokenRow>("estimate_share_tokens")
      .where({ workspaceId: workspace.id, id: candidate.id, tokenHash: estimateTokenHash(token) })
      .forUpdate().first();
    if (!link) return { state: "not-found" };
    const estimate = await trx("estimates").where({ workspaceId: workspace.id, id: link.estimateId })
      .first("status");
    const now = (await trx.raw("SELECT clock_timestamp() AS now")).rows[0].now as Date;
    if (!estimate) return { state: "not-found" };
    if (estimate.status === "superseded") return { state: "replaced" };
    if (estimate.status === "void") return { state: "withdrawn" };
    if (link.revokedAt) return { state: "revoked" };
    if (link.expiresAt <= now || estimate.status === "expired") return { state: "expired" };
    if (!activeLink(link, estimate.status, now)) return { state: "unavailable" };
    const row = await trx<SnapshotRow>("estimate_snapshots")
      .where({ workspaceId: workspace.id, estimateId: link.estimateId, id: link.snapshotId }).first();
    if (!row) return { state: "unavailable" };
    const snapshot = verifiedEstimateFrozenSnapshot(row.content, row.contentHash);
    if (!snapshot) return { state: "unavailable" };
    return { state: "ready", value: await use(trx, row, link, now) };
  });
}

async function consumePublicRead(db: Knex, requesterKey: string) {
  const key = `estimate-public:${createHash("sha256").update(requesterKey).digest("hex")}`;
  const now = Date.now();
  const [bucket] = await db("rateLimits").insert({
    id: randomUUID(), key, count: 1, lastRequest: now,
  }).onConflict("key").merge({
    count: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN 1 ELSE "rateLimits".count + 1 END', [now - 60_000]),
    lastRequest: db.raw('CASE WHEN "rateLimits"."lastRequest" < ? THEN ? ELSE "rateLimits"."lastRequest" END', [now - 60_000, now]),
  }).returning("count");
  return bucket.count <= 60;
}

import { once } from "node:events";
import { Readable, Transform, type TransformCallback } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ZipArchive, type Archiver } from "archiver";
import type { Knex } from "@salesmora/data";
import { createStorageAdapter, createStreamingFileEncryption } from "@salesmora/data";
import { appendAdminAuditEvent } from "@salesmora/data/admin-audit";
import { csvLine } from "@salesmora/data/csv";
import { sendEmail } from "@salesmora/data/email/transport";
import { renderWorkspaceExportReadyEmail } from "@salesmora/data/email/workspace-export-ready";

export const adminWorkspaceExportLimits = Object.freeze({
  rowsPerDataset: 50_000,
  csvBytes: 500 * 1024 * 1024,
  archiveBytes: 500 * 1024 * 1024,
});
const csvCount = 6;
const maxRowsPerDataset = adminWorkspaceExportLimits.rowsPerDataset;
const maxCsvBytes = adminWorkspaceExportLimits.csvBytes;
const maxArchiveBytes = adminWorkspaceExportLimits.archiveBytes;
const maxAttempts = 3;
const pollIntervalMs = 5_000;
const retryDelayMs = 60_000;
const staleLeaseMs = 20 * 60_000;
const leaseRefreshMs = 60_000;

type ExportStaffRole = "super_admin" | "support";
type RequestState = "queued" | "generating";

interface ExportRequest {
  id: string;
  workspaceId: string;
  ownerUserId: string;
  requestedBy: string;
  requestedByRole: ExportStaffRole;
  reason: string;
  state: RequestState;
  attempts: number;
}

export interface AdminExportStorage {
  putStream(
    key: string,
    stream: Readable,
    options?: { contentType?: string; metadata?: Record<string, string> },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface AdminWorkspaceExportNotice {
  id: string;
  workspaceName: string;
  ownerEmail: string;
  expiresAt: Date;
}

export type AdminWorkspaceExportNotifier = (notice: AdminWorkspaceExportNotice) => Promise<void>;

type DatasetRow = Record<string, unknown>;

class ExportLimitError extends Error {}
class ExportOwnerUnavailableError extends Error {}

export function assertAdminExportByteLimit(byteCount: number, limitBytes: number) {
  if (!Number.isSafeInteger(byteCount) || byteCount < 0) {
    throw new Error("Export byte count must be a non-negative safe integer.");
  }
  if (!Number.isSafeInteger(limitBytes) || limitBytes < 1) {
    throw new Error("Export byte limit must be a positive safe integer.");
  }
  if (byteCount > limitBytes) {
    throw new ExportLimitError("export_limit_exceeded");
  }
}

export function createAdminExportByteLimitTransform(
  limitBytes: number,
  onBytes: (bytes: number) => void = () => {},
): Transform {
  if (!Number.isSafeInteger(limitBytes) || limitBytes < 1) {
    throw new Error("Export byte limit must be a positive safe integer.");
  }
  let total = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
      total += chunk.length;
      onBytes(chunk.length);
      try {
        assertAdminExportByteLimit(total, limitBytes);
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      callback(null, chunk);
    },
  });
}

export function assertAdminExportRowLimit(rowCount: number) {
  if (!Number.isSafeInteger(rowCount) || rowCount < 0) {
    throw new Error("Export row count must be a non-negative safe integer.");
  }
  if (rowCount > maxRowsPerDataset) {
    throw new ExportLimitError("export_limit_exceeded");
  }
}

function readMasterKey(value = process.env.ADMIN_EXPORT_MASTER_KEY): Buffer {
  if (!value) throw new Error("ADMIN_EXPORT_MASTER_KEY is required when Admin exports are enabled.");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32 || key.toString("base64") !== value) {
    throw new Error("ADMIN_EXPORT_MASTER_KEY must be canonical base64 for exactly 32 random bytes.");
  }
  return key;
}

function timestamp(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (!(value instanceof Date) && typeof value !== "string") {
    throw new Error("Export contains a value that is not a timestamp.");
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("Export contains an invalid timestamp.");
  return date.toISOString();
}

function money(cents: unknown): string {
  if (cents === null || cents === undefined) return "";
  if (typeof cents !== "number" && typeof cents !== "string") {
    throw new Error("Export contains a value that is not an amount.");
  }
  const value = BigInt(cents);
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

async function* cursorRows<T extends DatasetRow>(
  trx: Knex.Transaction,
  statement: string,
  bindings: readonly string[],
): AsyncGenerator<T> {
  await trx.raw(
    `DECLARE admin_workspace_export_cursor NO SCROLL CURSOR FOR ${statement}`,
    [...bindings],
  );
  try {
    for (;;) {
      const { rows } = await trx.raw<{ rows: T[] }>(
        "FETCH FORWARD 100 FROM admin_workspace_export_cursor",
      );
      if (!rows.length) return;
      yield* rows;
    }
  } finally {
    await trx.raw("CLOSE admin_workspace_export_cursor");
  }
}

async function ownerIsEligible(
  trx: Knex.Transaction,
  request: ExportRequest,
): Promise<boolean> {
  const owner = await trx("workspaces as w")
    .join("users as u", "u.id", "w.ownerId")
    .join("workspaceMemberships as m", function joinOwner() {
      this.on("m.workspaceId", "w.id").andOn("m.userId", "u.id");
    })
    .where("w.id", request.workspaceId)
    .where("w.ownerId", request.ownerUserId)
    .where("m.role", "owner")
    .where("u.emailVerified", true)
    .whereNull("u.deletionRequestedAt")
    .whereNull("u.suspendedAt")
    .whereNull("w.deletionRequestedAt")
    .whereNull("w.suspendedAt")
    .first("w.id");
  return Boolean(owner);
}

async function appendCSV(
  trx: Knex.Transaction,
  archive: Archiver,
  filename: string,
  headers: readonly string[],
  query: string,
  bindings: readonly string[],
  values: (row: DatasetRow) => readonly unknown[],
  totals: { csvBytes: number },
): Promise<number> {
  let rows = 0;
  const content = Readable.from(
    (async function* () {
      const header = `\uFEFF${csvLine(headers)}`;
      totals.csvBytes += Buffer.byteLength(header);
      assertAdminExportByteLimit(totals.csvBytes, maxCsvBytes);
      yield header;
      for await (const row of cursorRows(trx, query, bindings)) {
        rows++;
        assertAdminExportRowLimit(rows);
        const line = csvLine(values(row));
        totals.csvBytes += Buffer.byteLength(line);
        assertAdminExportByteLimit(totals.csvBytes, maxCsvBytes);
        yield line;
      }
    })(),
    { highWaterMark: 1 },
  );
  const entryFinished = once(archive, "entry");
  archive.append(content, { name: filename });
  await entryFinished;
  return rows;
}

async function generateArchive(
  db: Knex,
  storage: AdminExportStorage,
  masterKey: Buffer,
  request: ExportRequest,
  signal: AbortSignal,
) {
  const objectKey = `admin-workspace-exports/${request.id}.zip.aesgcm`;
  const encryption = createStreamingFileEncryption(masterKey);
  const archive = new ZipArchive({ zlib: { level: 6 } });
  const totals = { csvBytes: 0, archiveBytes: 0, artifactBytes: 0 };
  const inputLimit = createAdminExportByteLimitTransform(
    maxArchiveBytes,
    bytes => { totals.archiveBytes += bytes; },
  );
  const outputCounter = new Transform({
    transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
      totals.artifactBytes += chunk.length;
      callback(null, chunk);
    },
  });
  archive.on("warning", error => archive.destroy(error));

  let upload: Promise<void> | undefined;
  let encryptionPipeline: Promise<void> | undefined;
  let exportTransaction: Promise<number> | undefined;
  try {
    encryptionPipeline = pipeline(
      archive,
      inputLimit,
      encryption.cipher,
      outputCounter,
      { signal },
    );
    upload = storage.putStream(objectKey, outputCounter, {
      contentType: "application/octet-stream",
      metadata: { encryption: "AES-256-GCM", purpose: "admin-workspace-export" },
    });
    exportTransaction = db.transaction(async trx => {
      await trx.raw("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
      await trx.raw("SET LOCAL statement_timeout = '15min'");
      if (!(await ownerIsEligible(trx, request))) throw new ExportOwnerUnavailableError();

      const append = (
        filename: string,
        headers: readonly string[],
        query: string,
        values: (row: DatasetRow) => readonly unknown[],
      ) => appendCSV(trx, archive, filename, headers, query, [request.workspaceId], values, totals);

      await append(
        "leads.csv",
        ["Lead ID", "Lead #", "Name", "Email", "Phone", "Service", "Address", "Details", "Internal notes", "Source", "Stage", "Owner name", "Owner ID", "Created", "Updated", "Archived"],
        `SELECT l.id, l."leadNumber", l.name, l.email, l.phone, l.service, l.address, l.details, l.notes, l.source, l.stage,
          COALESCE(u.name, l."ownerName", '') AS "ownerName", l."ownerId", l."createdAt", l."updatedAt", l."archivedAt"
        FROM leads l LEFT JOIN users u ON u.id = l."ownerId"
        WHERE l."workspaceId" = ? ORDER BY l.id`,
        row => [
          row.id, `LD-${String(row.leadNumber).padStart(4, "0")}`, row.name, row.email, row.phone,
          row.service, row.address, row.details, row.notes, row.source, row.stage, row.ownerName,
          row.ownerId, timestamp(row.createdAt), timestamp(row.updatedAt),
          row.archivedAt ? "true" : "false",
        ],
      );
      await append(
        "customers.csv",
        ["Customer number", "Name", "Type", "Company", "Email", "Phone", "Location", "Owner", "Customer since"],
        `SELECT c."customerNumber", c.name, c.type, c."companyName", c.email, c.phone, c.location,
          COALESCE(u.name, '') AS "ownerName", c."createdAt"
        FROM customers c LEFT JOIN users u ON u.id = c."ownerId"
        WHERE c."workspaceId" = ? ORDER BY c."customerNumber", c.id`,
        row => [
          `CU-${String(row.customerNumber).padStart(4, "0")}`, row.name, row.type, row.companyName,
          row.email, row.phone, row.location, row.ownerName, timestamp(row.createdAt),
        ],
      );
      await append(
        "estimates.csv",
        ["Estimate number", "Revision", "Name", "Status", "Customer", "Parent type", "Parent ID", "Owner", "Total", "Sent date", "Valid until", "Decided date", "Decision channel"],
        `SELECT e."estimateNumber", e.revision, e.name, e.status, COALESCE(c.name, l.name, j."customerName", '') AS "customerName",
          e."parentType", COALESCE(e."leadId", e."jobId")::text AS "parentId", COALESCE(u.name, '') AS "ownerName",
          e."totalCents", e."sentAt", to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil",
          e."decidedAt", e."decisionChannel"
        FROM estimates e
        LEFT JOIN leads l ON l."workspaceId" = e."workspaceId" AND l.id = e."leadId"
        LEFT JOIN jobs j ON j."workspaceId" = e."workspaceId" AND j.id = e."jobId"
        LEFT JOIN customers c ON c."workspaceId" = e."workspaceId" AND c.id = e."customerId"
        LEFT JOIN users u ON u.id = e."ownerId"
        WHERE e."workspaceId" = ? ORDER BY e."estimateNumber", e.revision`,
        row => [
          `EST-${String(row.estimateNumber).padStart(4, "0")}`, row.revision, row.name, row.status,
          row.customerName, row.parentType, row.parentId, row.ownerName, money(row.totalCents),
          timestamp(row.sentAt), row.validUntil,
          timestamp(row.decidedAt), row.decisionChannel,
        ],
      );
      await append(
        "jobs.csv",
        ["Job number", "Customer", "Title", "Service", "Location", "Description", "Status", "Owner", "Scheduled date", "Arrival window", "Completion deadline", "Waiting reason", "Created", "Updated"],
        `SELECT j."jobNumber", j."customerName", j.title, j.service, j.location, j.description, j.status,
          COALESCE(u.name, '') AS "ownerName", to_char(j."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate",
          j."arrivalWindow", to_char(j."completionDeadline", 'YYYY-MM-DD') AS "completionDeadline",
          j."waitingReason", j."createdAt", j."updatedAt"
        FROM jobs j LEFT JOIN users u ON u.id = j."primaryOwnerId"
        WHERE j."workspaceId" = ? ORDER BY j."jobNumber", j.id`,
        row => [
          `J-${String(row.jobNumber).padStart(4, "0")}`, row.customerName, row.title, row.service, row.location,
          row.description, row.status, row.ownerName, row.scheduledDate, row.arrivalWindow,
          row.completionDeadline, row.waitingReason, timestamp(row.createdAt),
          timestamp(row.updatedAt),
        ],
      );
      await append(
        "work-orders.csv",
        ["Work order", "Title", "Status", "Job", "Customer", "Address", "Assignee", "Crew", "Scheduled date", "Arrival window", "Tasks done"],
        `SELECT w."workOrderNumber", w.title, w.status, j."jobNumber", j."customerName", j.location,
          COALESCE(a.name, '') AS "assigneeName",
          COALESCE((SELECT string_agg(c.name, '; ' ORDER BY c.name)
            FROM "workOrderCrew" crew JOIN users c ON c.id = crew."userId"
            WHERE crew."workspaceId" = w."workspaceId" AND crew."workOrderId" = w.id), '') AS "crewNames",
          to_char(w."scheduledDate", 'YYYY-MM-DD') AS "scheduledDate", w."arrivalWindow",
          (SELECT count(*) FILTER (WHERE task.done)::int || '/' || count(*)::int
            FROM "workOrderTasks" task WHERE task."workspaceId" = w."workspaceId" AND task."workOrderId" = w.id) AS tasks
        FROM "workOrders" w JOIN jobs j ON j."workspaceId" = w."workspaceId" AND j.id = w."jobId"
        LEFT JOIN users a ON a.id = w."primaryAssigneeId"
        WHERE w."workspaceId" = ? ORDER BY w."workOrderNumber", w.id`,
        row => [
          `WO-${String(row.workOrderNumber).padStart(4, "0")}`, row.title, row.status,
          `J-${String(row.jobNumber).padStart(4, "0")}`, row.customerName, row.location,
          row.assigneeName, row.crewNames, row.scheduledDate, row.arrivalWindow, row.tasks ?? "0/0",
        ],
      );
      await append(
        "materials.csv",
        ["Name", "SKU", "Unit", "Category", "Supplier", "Cost per unit", "Price per unit", "Status", "Notes", "Supplier link", "Image link"],
        `SELECT name, sku, unit, category, supplier, "costCents", "priceCents",
          CASE WHEN "archivedAt" IS NOT NULL THEN 'archived' ELSE status END AS status,
          notes, "sourceUrl", "imageUrl"
        FROM "materialCatalog" WHERE "workspaceId" = ? ORDER BY name, id`,
        row => [
          row.name, row.sku, row.unit, row.category, row.supplier, money(row.costCents),
          money(row.priceCents), row.status, row.notes, row.sourceUrl, row.imageUrl,
        ],
      );
      const fileMetadataCount = await append(
        "file-metadata.csv",
        ["File ID", "Entity type", "Entity ID", "Name", "MIME type", "Size bytes", "Status", "Category", "Caption", "Uploaded by user ID", "Created", "Deleted"],
        `SELECT id, "entityType", "entityId", name, "mimeType", "sizeBytes", status, "categoryTag",
          caption, "uploadedByUserId", "createdAt", "deletedAt"
        FROM files WHERE "workspaceId" = ? ORDER BY "createdAt", id`,
        row => [
          row.id, row.entityType, row.entityId, row.name, row.mimeType, row.sizeBytes, row.status,
          row.categoryTag, row.caption, row.uploadedByUserId,
          timestamp(row.createdAt), timestamp(row.deletedAt),
        ],
      );
      await archive.finalize();
      return fileMetadataCount;
    });
    const [, , fileMetadataCount] = await Promise.all([
      encryptionPipeline,
      upload,
      exportTransaction,
    ]);
    return {
      objectKey,
      encryptedDek: encryption.dekEnvelope,
      fileIv: encryption.fileIv,
      fileAuthTag: encryption.cipher.getAuthTag(),
      archiveSizeBytes: totals.archiveBytes,
      artifactSizeBytes: totals.artifactBytes,
      fileMetadataCount,
    };
  } catch (error) {
    archive.abort();
    inputLimit.destroy();
    encryption.cipher.destroy();
    outputCounter.destroy();
    await Promise.allSettled([
      encryptionPipeline ?? Promise.resolve(),
      upload ?? Promise.resolve(),
      exportTransaction ?? Promise.resolve(0),
    ]);
    try {
      await storage.delete(objectKey);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Admin workspace export failed and its partial artifact could not be removed.",
      );
    }
    throw error;
  }
}

async function claimNextRequest(
  db: Knex,
  now: Date,
  requestIds?: readonly string[],
): Promise<ExportRequest | null> {
  return db.transaction(async trx => {
    const staleBefore = new Date(now.getTime() - staleLeaseMs);
    const query = trx.withSchema("admin").table("workspaceExportRequests")
      .where(query => query
        .where(query => query.where({ state: "queued" }).andWhere(retry => retry
          .whereNull("nextAttemptAt").orWhere("nextAttemptAt", "<=", now)))
        .orWhere(query => query.where({ state: "generating" }).andWhere("updatedAt", "<", staleBefore)))
      .orderBy("requestedAt", "asc");
    if (requestIds) query.whereIn("id", requestIds);
    const request = await query
      .forUpdate()
      .skipLocked()
      .first<ExportRequest & { nextAttemptAt: Date | null }>([
        "id", "workspaceId", "ownerUserId", "requestedBy", "requestedByRole",
        "reason", "state", "attempts", "nextAttemptAt",
      ]);
    if (!request) return null;
    if (request.state === "generating" && request.attempts >= maxAttempts) {
      await trx.withSchema("admin").table("workspaceExportRequests").where({ id: request.id }).update({
        state: "failed",
        failureCode: "worker_interrupted",
        nextAttemptAt: null,
        updatedAt: now,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: request.requestedBy,
        staffRole: request.requestedByRole,
        action: "data.requests.export.failed",
        targetType: "workspace_export_request",
        targetId: request.id,
        workspaceId: request.workspaceId,
        reason: request.reason,
        before: { state: "generating", attempts: request.attempts },
        after: { state: "failed", failureCode: "worker_interrupted" },
      });
      return null;
    }
    const attempts = request.attempts + 1;
    await trx.withSchema("admin").table("workspaceExportRequests").where({ id: request.id }).update({
      state: "generating",
      attempts,
      failureCode: null,
      nextAttemptAt: null,
      updatedAt: now,
    });
    await appendAdminAuditEvent(trx, {
      staffUserId: request.requestedBy,
      staffRole: request.requestedByRole,
      action: "data.requests.export.generating",
      targetType: "workspace_export_request",
      targetId: request.id,
      workspaceId: request.workspaceId,
      reason: request.reason,
      before: { state: request.state, attempts: request.attempts },
      after: { state: "generating", attempts },
    });
    return { ...request, state: "generating", attempts };
  });
}

async function recordFailure(
  db: Knex,
  request: ExportRequest,
  code: string,
  permanent: boolean,
  now: Date,
) {
  await db.transaction(async trx => {
    const state = permanent || request.attempts >= maxAttempts ? "failed" : "queued";
    const nextAttemptAt = state === "queued" ? new Date(now.getTime() + retryDelayMs) : null;
    const before = await trx.withSchema("admin").table("workspaceExportRequests")
      .where({ id: request.id, state: "generating" }).forUpdate()
      .first<{ state: string; attempts: number }>(["state", "attempts"]);
    if (!before) return;
    await trx.withSchema("admin").table("workspaceExportRequests").where({ id: request.id }).update({
      state,
      failureCode: code,
      nextAttemptAt,
      updatedAt: now,
    });
    await appendAdminAuditEvent(trx, {
      staffUserId: request.requestedBy,
      staffRole: request.requestedByRole,
      action: state === "queued" ? "data.requests.export.retry_scheduled" : "data.requests.export.failed",
      targetType: "workspace_export_request",
      targetId: request.id,
      workspaceId: request.workspaceId,
      reason: request.reason,
      before: { state: before.state, attempts: before.attempts },
      after: { state, failureCode: code, nextAttemptAt },
    });
  });
}

export async function processNextAdminWorkspaceExport(
  db: Knex,
  storage: AdminExportStorage,
  masterKey: Buffer,
  signal: AbortSignal = new AbortController().signal,
  requestIds?: readonly string[],
) {
  const now = new Date();
  const request = await claimNextRequest(db, now, requestIds);
  if (!request) return false;
  const leaseController = new AbortController();
  const activeSignal = AbortSignal.any([signal, leaseController.signal]);
  let refreshing = false;
  const heartbeat = setInterval(() => {
    if (refreshing || activeSignal.aborted) return;
    refreshing = true;
    void db.withSchema("admin").table("workspaceExportRequests")
      .where({ id: request.id, state: "generating", attempts: request.attempts })
      .update({ updatedAt: new Date() })
      .then(updated => {
        if (updated !== 1) leaseController.abort();
      })
      .catch(error => {
        console.error(JSON.stringify({
          event: "worker.admin_export_lease_failed",
          requestId: request.id,
          error: error instanceof Error ? error.name : "UnknownError",
        }));
        leaseController.abort();
      })
      .finally(() => {
        refreshing = false;
      });
  }, leaseRefreshMs);
  heartbeat.unref();
  let uploaded = false;
  try {
    activeSignal.throwIfAborted();
    const artifact = await generateArchive(db, storage, masterKey, request, activeSignal);
    uploaded = true;
    const readyAt = new Date();
    const { fileMetadataCount, ...artifactRecord } = artifact;
    await db.transaction(async trx => {
      if (!(await ownerIsEligible(trx, request))) throw new ExportOwnerUnavailableError();
      await trx.withSchema("admin").table("workspaceExportArtifacts").insert({
        requestId: request.id,
        ...artifactRecord,
        createdAt: readyAt,
      });
      const updated = await trx.withSchema("admin").table("workspaceExportRequests")
        .where({ id: request.id, state: "generating" }).update({
          state: "ready",
          failureCode: null,
          nextAttemptAt: null,
          expiresAt: new Date(readyAt.getTime() + 7 * 24 * 60 * 60_000),
          csvCount,
          fileMetadataCount,
          updatedAt: readyAt,
        });
      if (updated !== 1) throw new Error("Admin export request state changed during generation.");
      await appendAdminAuditEvent(trx, {
        staffUserId: request.requestedBy,
        staffRole: request.requestedByRole,
        action: "data.requests.export.ready",
        targetType: "workspace_export_request",
        targetId: request.id,
        workspaceId: request.workspaceId,
        reason: request.reason,
        before: { state: "generating" },
        after: {
          state: "ready",
          csvCount,
          fileMetadataCount,
          expiresAt: new Date(readyAt.getTime() + 7 * 24 * 60 * 60_000),
          archiveSizeBytes: artifactRecord.archiveSizeBytes,
          artifactSizeBytes: artifactRecord.artifactSizeBytes,
        },
      });
    });
  } catch (error) {
    if (uploaded) await storage.delete(`admin-workspace-exports/${request.id}.zip.aesgcm`);
    const ownerUnavailable = error instanceof ExportOwnerUnavailableError;
    const limitExceeded = error instanceof ExportLimitError;
    const aborted = activeSignal.aborted;
    const code = ownerUnavailable
      ? "owner_unavailable"
      : limitExceeded
        ? "export_limit_exceeded"
        : aborted
          ? signal.aborted ? "worker_stopped" : "worker_lease_lost"
          : "generation_failed";
    await recordFailure(db, request, code, ownerUnavailable || limitExceeded, new Date());
    console.error(JSON.stringify({
      event: "worker.admin_export_failed",
      requestId: request.id,
      failureCode: code,
      error: error instanceof Error ? error.name : "UnknownError",
    }));
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}

function customerAppOrigin() {
  const value = process.env.CUSTOMER_APP_URL ?? process.env.BETTER_AUTH_URL;
  if (!value) throw new Error("CUSTOMER_APP_URL is required for Admin export notifications.");
  const url = new URL(value);
  const localHTTP = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((!localHTTP && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("CUSTOMER_APP_URL must be an HTTPS origin except for localhost.");
  }
  return url.origin;
}

export async function sendAdminWorkspaceExportNotice(notice: AdminWorkspaceExportNotice) {
  const baseURL = customerAppOrigin();
  await sendEmail({
    to: notice.ownerEmail,
    ...renderWorkspaceExportReadyEmail({
      baseURL,
      requestId: notice.id,
      workspaceName: notice.workspaceName,
      expiresAt: notice.expiresAt,
    }),
    idempotencyKey: `workspace-export-ready-${notice.id}`,
  }, baseURL);
}

export async function processNextAdminWorkspaceExportNotification(
  db: Knex,
  notifier: AdminWorkspaceExportNotifier,
  now = new Date(),
) {
  const result = await db.transaction(async trx => {
    const request = await trx.withSchema("admin").table("workspaceExportRequests")
      .where({ state: "ready", notificationStatus: "pending" })
      .where("expiresAt", ">", now)
      .where(query => query.whereNull("nextNotificationAt").orWhere("nextNotificationAt", "<=", now))
      .orderBy("requestedAt", "asc")
      .forUpdate()
      .skipLocked()
      .first<{
        id: string;
        workspaceId: string;
        ownerUserId: string;
        requestedBy: string;
        requestedByRole: ExportStaffRole;
        reason: string;
        workspaceName: string;
        expiresAt: Date;
        notificationAttempts: number;
      }>([
        "id", "workspaceId", "ownerUserId", "requestedBy", "requestedByRole",
        "reason", "workspaceName", "expiresAt", "notificationAttempts",
      ]);
    if (!request) return null;

    const owner = await trx("workspaces as w")
      .join("users as u", "u.id", "w.ownerId")
      .join("workspaceMemberships as m", function joinOwner() {
        this.on("m.workspaceId", "w.id").andOn("m.userId", "u.id");
      })
      .where("w.id", request.workspaceId)
      .where("w.ownerId", request.ownerUserId)
      .where("m.role", "owner")
      .where("u.emailVerified", true)
      .whereNull("u.deletionRequestedAt")
      .whereNull("u.suspendedAt")
      .whereNull("w.deletionRequestedAt")
      .whereNull("w.suspendedAt")
      .first<{ email: string }>("u.email as email");

    if (!owner) {
      await trx.withSchema("admin").table("workspaceExportRequests").where({ id: request.id }).update({
        state: "failed",
        failureCode: "owner_unavailable",
        notificationStatus: "failed",
        nextNotificationAt: null,
        updatedAt: now,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: request.requestedBy,
        staffRole: request.requestedByRole,
        action: "data.requests.export.failed",
        targetType: "workspace_export_request",
        targetId: request.id,
        workspaceId: request.workspaceId,
        reason: request.reason,
        before: { state: "ready", notificationStatus: "pending" },
        after: { state: "failed", failureCode: "owner_unavailable" },
      });
      return { unavailable: true as const, id: request.id };
    }

    await trx.withSchema("admin").table("workspaceExportRequests").where({ id: request.id }).update({
      notificationAttempts: request.notificationAttempts + 1,
      nextNotificationAt: new Date(now.getTime() + staleLeaseMs),
      updatedAt: now,
    });
    return {
      unavailable: false as const,
      request: { id: request.id, workspaceName: request.workspaceName, ownerEmail: owner.email, expiresAt: request.expiresAt },
      staffUserId: request.requestedBy,
      staffRole: request.requestedByRole,
      workspaceId: request.workspaceId,
      reason: request.reason,
      attempts: request.notificationAttempts + 1,
    };
  });
  if (!result) return false;
  if (result.unavailable) return true;

  try {
    await notifier(result.request);
    await db.transaction(async trx => {
      const updated = await trx.withSchema("admin").table("workspaceExportRequests")
        .where({ id: result.request.id, state: "ready", notificationStatus: "pending" })
        .update({
          notificationStatus: "sent",
          notificationSentAt: new Date(),
          nextNotificationAt: null,
          updatedAt: new Date(),
        });
      if (updated !== 1) return;
      await appendAdminAuditEvent(trx, {
        staffUserId: result.staffUserId,
        staffRole: result.staffRole,
        action: "data.requests.export.notified",
        targetType: "workspace_export_request",
        targetId: result.request.id,
        workspaceId: result.workspaceId,
        reason: result.reason,
        after: { notificationStatus: "sent", attempts: result.attempts },
      });
    });
  } catch (error) {
    await db.transaction(async trx => {
      const nextAttemptAt = new Date(Date.now() + retryDelayMs);
      const updated = await trx.withSchema("admin").table("workspaceExportRequests")
        .where({ id: result.request.id, state: "ready", notificationStatus: "pending" })
        .update({ nextNotificationAt: nextAttemptAt, updatedAt: new Date() });
      if (updated !== 1) return;
      await appendAdminAuditEvent(trx, {
        staffUserId: result.staffUserId,
        staffRole: result.staffRole,
        action: "data.requests.export.notification_retry_scheduled",
        targetType: "workspace_export_request",
        targetId: result.request.id,
        workspaceId: result.workspaceId,
        reason: result.reason,
        after: { notificationStatus: "pending", attempts: result.attempts, nextAttemptAt },
      });
    });
    console.error(JSON.stringify({
      event: "worker.admin_export_notification_failed",
      requestId: result.request.id,
      attempts: result.attempts,
      error: error instanceof Error ? error.name : "UnknownError",
    }));
  }
  return true;
}

export async function processNextExpiredAdminWorkspaceExport(
  db: Knex,
  storage: AdminExportStorage,
  now = new Date(),
) {
  return db.transaction(async trx => {
    const request = await trx.withSchema("admin").table("workspaceExportRequests")
      .whereIn("state", ["ready", "failed"])
      .whereNotNull("expiresAt")
      .where("expiresAt", "<=", now)
      .orderBy("expiresAt", "asc")
      .forUpdate()
      .skipLocked()
      .first<{
        id: string;
        workspaceId: string;
        requestedBy: string;
        requestedByRole: ExportStaffRole;
        reason: string;
        state: "ready" | "failed";
      }>(["id", "workspaceId", "requestedBy", "requestedByRole", "reason", "state"]);
    if (!request) return false;

    await storage.delete(`admin-workspace-exports/${request.id}.zip.aesgcm`);
    const updated = await trx.withSchema("admin").table("workspaceExportRequests")
      .where({ id: request.id, state: request.state })
      .where("expiresAt", "<=", now)
      .update({
        ...(request.state === "ready" ? { state: "expired" } : {}),
        nextNotificationAt: null,
        updatedAt: now,
      });
    if (updated !== 1) return;
    await trx.withSchema("admin").table("workspaceExportArtifacts").where({ requestId: request.id }).delete();
    await appendAdminAuditEvent(trx, {
      staffUserId: request.requestedBy,
      staffRole: request.requestedByRole,
      action: "data.requests.export.expired",
      targetType: "workspace_export_request",
      targetId: request.id,
      workspaceId: request.workspaceId,
      reason: request.reason,
      before: { state: request.state, artifactRemoved: false },
      after: { state: request.state === "ready" ? "expired" : "failed", artifactRemoved: true },
    });
    return true;
  });
}

export async function startAdminWorkspaceExports(db: Knex): Promise<() => Promise<void>> {
  if (process.env.ADMIN_WORKSPACE_EXPORTS_ENABLED !== "true") return async () => {};
  const masterKey = readMasterKey();
  customerAppOrigin();
  const storage = createStorageAdapter();
  for (const [schema, table] of [["admin", "workspaceExportRequests"], ["admin", "workspaceExportArtifacts"]] as const) {
    if (!(await db.schema.withSchema(schema).hasTable(table))) {
      storage.close();
      throw new Error("Apply Admin workspace export migrations before starting the worker.");
    }
  }

  let stopping = false;
  let activeController: AbortController | undefined;
  let wakeTimer: NodeJS.Timeout | undefined;
  let wake: (() => void) | undefined;
  const loop = (async () => {
    while (!stopping) {
      activeController = new AbortController();
      try {
        await processNextAdminWorkspaceExport(db, storage, masterKey, activeController.signal);
        await processNextAdminWorkspaceExportNotification(db, sendAdminWorkspaceExportNotice);
        await processNextExpiredAdminWorkspaceExport(db, storage);
      } catch (error) {
        console.error(JSON.stringify({
          event: "worker.admin_export_poll_failed",
          error: error instanceof Error ? error.name : "UnknownError",
        }));
      } finally {
        activeController = undefined;
      }
      if (stopping) break;
      await new Promise<void>(resolve => {
        wake = resolve;
        wakeTimer = setTimeout(resolve, pollIntervalMs);
      });
      wake = undefined;
      wakeTimer = undefined;
    }
  })();
  return async () => {
    stopping = true;
    activeController?.abort();
    if (wakeTimer) clearTimeout(wakeTimer);
    wake?.();
    await loop;
    storage.close();
    masterKey.fill(0);
  };
}

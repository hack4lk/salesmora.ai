import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertRuntimeDatabaseRole,
  createDatabase,
  decryptFile,
  deserializeDekEnvelope,
} from "@salesmora/data";
import { verifyAdminAuditChain } from "@salesmora/data/admin-audit";
import {
  processNextAdminWorkspaceExport,
  processNextAdminWorkspaceExportNotification,
  processNextExpiredAdminWorkspaceExport,
  type AdminExportStorage,
} from "./admin-workspace-exports.js";

const envFile = fileURLToPath(new URL("../../../.env.local", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const ownerURL = process.env.TEST_DATABASE_URL;
const workerPassword = process.env.DB_WORKER_PASSWORD;
const webPassword = process.env.DB_WEB_PASSWORD;
if (!ownerURL || !workerPassword || !webPassword || ownerURL === process.env.DATABASE_URL ||
  !["localhost", "127.0.0.1"].includes(new URL(ownerURL).hostname) ||
  !new URL(ownerURL).pathname.endsWith("_test")) {
  throw new Error("Admin workspace-export rehearsal requires separate local owner, web, and worker connections to the _test database.");
}

const owner = createDatabase(ownerURL);
const workerConnection = new URL(ownerURL);
workerConnection.username = "salesmora_worker";
workerConnection.password = workerPassword;
const worker = createDatabase(workerConnection.href);
const webConnection = new URL(ownerURL);
webConnection.username = "salesmora_web";
webConnection.password = webPassword;
const web = createDatabase(webConnection.href);
const prefix = `admin-export-${randomUUID()}`;
const now = new Date();
const ownerId = randomUUID();
const otherOwnerId = randomUUID();
const workspaceId = randomUUID();
const otherWorkspaceId = randomUUID();
const staffId = randomUUID();
const requestId = randomUUID();
const ineligibleRequestId = randomUUID();
const leadId = randomUUID();
const customerId = randomUUID();
const jobId = randomUUID();
const estimateId = randomUUID();
const workOrderId = randomUUID();
const materialId = randomUUID();
const fileId = randomUUID();
const staffEmail = `${prefix}@salesmora.ai`;
const directory = await mkdtemp(join(tmpdir(), "salesmora-admin-export-"));
const masterKey = randomBytes(32);
const objects = new Map<string, Buffer>();
let failUploadOnce = true;
let workspaceCreated = false;
let usersCreated = false;
let staffCreated = false;
let schemaReady = false;
const storage: AdminExportStorage = {
  async putStream(key, stream) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    if (failUploadOnce) {
      failUploadOnce = false;
      throw new Error("Injected upload failure.");
    }
    objects.set(key, Buffer.concat(chunks));
  },
  async delete(key) {
    objects.delete(key);
  },
};

async function seedUser(id: string, name: string, email: string) {
  await owner("users").insert({
    id,
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: "admin-export-rehearsal",
    termsAcceptedAt: now,
  });
}

async function seedWorkspace(id: string, userId: string, name: string) {
  await owner.transaction(async trx => {
    await trx("workspaces").insert({
      id,
      ownerId: userId,
      businessName: name,
      businessType: "test",
      postalCode: "",
      serviceRange: "",
      createdAt: now,
    });
    await trx("workspaceMemberships").insert({
      workspaceId: id,
      userId,
      role: "owner",
    });
    await trx("workspacePolicies").insert({ workspaceId: id });
  });
}

async function seedRequest(id: string) {
  await owner.withSchema("admin").table("workspaceExportRequests").insert({
    id,
    workspaceId,
    workspaceName: `${prefix} workspace`,
    ownerUserId: ownerId,
    ownerName: `${prefix} owner`,
    maskedOwnerEmail: "ow••••@example.test",
    requestedBy: staffId,
    requestedByName: `${prefix} staff`,
    requestedByRole: "support",
    reason: "Customer requested an account data export.",
    state: "queued",
    requestedAt: now,
    updatedAt: now,
    expiresAt: null,
    csvCount: null,
    fileMetadataCount: null,
    downloadedAt: null,
    attempts: 0,
    failureCode: null,
    nextAttemptAt: null,
  });
}

try {
  await assertRuntimeDatabaseRole(worker, "Worker");
  const { rows: [role] } = await worker.raw<{ rows: { user: string }[] }>("SELECT current_user AS user");
  assert.equal(role.user, "salesmora_worker");
  const { rows: [webRole] } = await web.raw<{ rows: { user: string }[] }>("SELECT current_user AS user");
  assert.equal(webRole.user, "salesmora_web");
  assert.ok(await owner.schema.withSchema("admin").hasTable("workspaceExportRequests"), "apply migrations before the rehearsal");
  assert.ok(await owner.schema.withSchema("admin").hasTable("workspaceExportArtifacts"), "apply migrations before the rehearsal");
  schemaReady = true;

  const { rows: [privileges] } = await owner.raw<{
    rows: {
      requestRead: boolean;
      requestStateUpdate: boolean;
      requestWorkspaceUpdate: boolean;
      requestInsert: boolean;
      artifactInsert: boolean;
      artifactRead: boolean;
      staffRead: boolean;
      auditInsert: boolean;
      auditUpdate: boolean;
      adminArtifactRead: boolean;
      webAdminSchemaUsage: boolean;
      artifactDelete: boolean;
      webArtifactRead: boolean;
      artifactRequestRead: boolean;
      webDownloadReadFunction: boolean;
      webDownloadRecordFunction: boolean;
      webReadSchemaPrivilege: boolean;
      notificationRead: boolean;
      notificationUpdate: boolean;
      notificationWorkspaceRead: boolean;
    }[];
  }>(`SELECT
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'state', 'SELECT') AS "requestRead",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'state', 'UPDATE') AS "requestStateUpdate",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'workspaceId', 'UPDATE') AS "requestWorkspaceUpdate",
    has_table_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'INSERT') AS "requestInsert",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportArtifacts"', 'requestId', 'INSERT') AS "artifactInsert",
    has_table_privilege('salesmora_worker', 'admin."workspaceExportArtifacts"', 'SELECT') AS "artifactRead",
    has_table_privilege('salesmora_worker', 'admin."staffUsers"', 'SELECT') AS "staffRead",
    has_column_privilege('salesmora_worker', 'admin."auditEvents"', 'hash', 'INSERT') AS "auditInsert",
    has_table_privilege('salesmora_worker', 'admin."auditEvents"', 'UPDATE') AS "auditUpdate",
    has_table_privilege('salesmora_admin_app', 'admin."workspaceExportArtifacts"', 'SELECT') AS "adminArtifactRead",
    has_schema_privilege('salesmora_web', 'admin', 'USAGE') AS "webAdminSchemaUsage",
    has_table_privilege('salesmora_worker', 'admin."workspaceExportArtifacts"', 'DELETE') AS "artifactDelete",
    has_table_privilege('salesmora_web', 'admin."workspaceExportArtifacts"', 'SELECT') AS "webArtifactRead",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportArtifacts"', 'requestId', 'SELECT') AS "artifactRequestRead",
    has_function_privilege('salesmora_web', 'public.read_owner_workspace_export(uuid,text)', 'EXECUTE') AS "webDownloadReadFunction",
    has_function_privilege('salesmora_web', 'public.record_owner_workspace_export_download(uuid,text)', 'EXECUTE') AS "webDownloadRecordFunction",
    has_schema_privilege('salesmora_web', 'public', 'USAGE') AS "webReadSchemaPrivilege",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'notificationStatus', 'SELECT') AS "notificationRead",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'notificationSentAt', 'UPDATE') AS "notificationUpdate",
    has_column_privilege('salesmora_worker', 'admin."workspaceExportRequests"', 'workspaceName', 'SELECT') AS "notificationWorkspaceRead"`);
  assert.deepEqual(privileges, {
    requestRead: true,
    requestStateUpdate: true,
    requestWorkspaceUpdate: false,
    requestInsert: false,
    artifactInsert: true,
    artifactRead: false,
    staffRead: false,
    auditInsert: true,
    auditUpdate: false,
    adminArtifactRead: false,
    webAdminSchemaUsage: false,
    artifactDelete: true,
    webArtifactRead: false,
    artifactRequestRead: true,
    webDownloadReadFunction: true,
    webDownloadRecordFunction: true,
    webReadSchemaPrivilege: true,
    notificationRead: true,
    notificationUpdate: true,
    notificationWorkspaceRead: true,
  });
  await assert.rejects(worker.withSchema("admin").table("staffUsers").select("id"), { code: "42501" });
  assert.deepEqual(await worker.withSchema("admin").table("workspaceExportArtifacts").select("requestId"), []);
  await assert.rejects(worker.withSchema("admin").table("workspaceExportArtifacts").select("objectKey"), { code: "42501" });

  await seedUser(ownerId, `${prefix} owner`, `${prefix}@example.test`);
  usersCreated = true;
  await seedUser(otherOwnerId, `${prefix} other`, `${prefix}-other@example.test`);
  await seedWorkspace(workspaceId, ownerId, `${prefix} workspace`);
  workspaceCreated = true;
  await seedWorkspace(otherWorkspaceId, otherOwnerId, `${prefix} other workspace`);
  await owner.withSchema("admin").table("staffUsers").insert({
    id: staffId,
    name: `${prefix} staff`,
    email: staffEmail,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  staffCreated = true;

  await owner("customers").insert({
    id: customerId,
    workspaceId,
    customerNumber: 1,
    name: `${prefix} customer`,
    type: "person",
    companyName: "",
    email: "customer@example.test",
    phone: "555-0101",
    location: "Test location",
    internalNotes: "Customer internal note",
    ownerId,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
  await owner("leads").insert({
    id: leadId,
    workspaceId,
    createdBy: ownerId,
    submissionId: randomUUID(),
    submissionHash: "fixture",
    name: `${prefix} lead`,
    email: "lead@example.test",
    phone: "555-0102",
    service: "Repair",
    address: "Test address",
    details: "Lead details",
    notes: "Lead internal note",
    source: "other",
    stage: "new",
    ownerId,
    createdAt: now,
  });
  await owner("leads").insert({
    id: randomUUID(),
    workspaceId: otherWorkspaceId,
    createdBy: otherOwnerId,
    submissionId: randomUUID(),
    submissionHash: "other-fixture",
    name: `${prefix} other tenant marker`,
    email: "other@example.test",
    phone: "",
    service: "Repair",
    address: "",
    details: "",
    notes: "",
    source: "other",
    stage: "new",
    ownerId: otherOwnerId,
    createdAt: now,
  });
  await owner("jobs").insert({
    id: jobId,
    workspaceId,
    jobNumber: 1,
    customerId,
    customerName: `${prefix} customer`,
    title: `${prefix} job`,
    service: "Repair",
    location: "Test location",
    description: "Job description",
    status: "needs-scheduling",
    primaryOwnerId: ownerId,
    createdBy: ownerId,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
  await owner("estimates").insert({
    id: estimateId,
    workspaceId,
    estimateNumber: null,
    revision: 1,
    name: `${prefix} estimate`,
    status: "draft",
    parentType: "lead",
    leadId,
    customerId,
    ownerId,
    recipientName: `${prefix} customer`,
    recipientEmail: "customer@example.test",
    totalCents: "12345",
    createdBy: ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await owner("workOrders").insert({
    id: workOrderId,
    workspaceId,
    workOrderNumber: 1,
    jobId,
    title: `${prefix} work order`,
    status: "draft",
    primaryAssigneeId: ownerId,
    createdBy: ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await owner("materialCatalog").insert({
    id: materialId,
    workspaceId,
    name: `${prefix} material`,
    sku: "FIXTURE-1",
    costCents: 525,
    priceCents: 1025,
  });
  await owner("files").insert({
    id: fileId,
    workspaceId,
    entityType: "job",
    entityId: jobId,
    uploadedByUserId: ownerId,
    name: `${prefix} metadata-only.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 123,
    status: "ready",
    storageKey: "private-sensitive-storage-key",
    encryptedDekB64: "private-sensitive-dek",
  });
  await seedRequest(requestId);

  const failedAttempt = await processNextAdminWorkspaceExport(
    worker, storage, masterKey, new AbortController().signal, [requestId],
  );
  assert.equal(failedAttempt, true);
  const queued = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{ state: string; attempts: number; failureCode: string }>();
  assert.equal(queued?.state, "queued");
  assert.equal(queued?.attempts, 1);
  assert.equal(queued?.failureCode, "generation_failed");
  await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).update({ nextAttemptAt: new Date(Date.now() - 1) });
  await owner("users").where({ id: ownerId }).update({ emailVerified: true });

  const generated = await processNextAdminWorkspaceExport(
    worker, storage, masterKey, new AbortController().signal, [requestId],
  );
  assert.equal(generated, true);
  const ready = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{
      state: string;
      attempts: number;
      csvCount: number;
      fileMetadataCount: number;
      expiresAt: Date;
      notificationStatus: string;
    }>();
  assert.equal(ready?.state, "ready");
  assert.equal(ready?.attempts, 2);
  assert.equal(ready?.csvCount, 6);
  assert.equal(ready?.fileMetadataCount, 1);
  assert.equal(ready?.notificationStatus, "pending");
  assert.ok(ready?.expiresAt && ready.expiresAt.getTime() >= Date.now() + 6 * 24 * 60 * 60_000);

  const artifact = await owner.withSchema("admin").table("workspaceExportArtifacts")
    .where({ requestId }).first<{
      objectKey: string;
      encryptedDek: Buffer;
      fileIv: Buffer;
      fileAuthTag: Buffer;
      archiveSizeBytes: string;
      artifactSizeBytes: string;
    }>();
  assert.ok(artifact);
  const encrypted = objects.get(artifact.objectKey);
  assert.ok(encrypted);
  assert.equal(Number(artifact.artifactSizeBytes), encrypted.length);
  const ownerExport = await web.raw<{
    rows: Array<{ objectKey: string; workspaceName: string; artifactSizeBytes: string }>;
  }>("SELECT * FROM public.read_owner_workspace_export(?::uuid, ?::text)", [requestId, ownerId]);
  assert.equal(ownerExport.rows.length, 1);
  assert.equal(ownerExport.rows[0]?.objectKey, artifact.objectKey);
  assert.equal(ownerExport.rows[0]?.workspaceName, `${prefix} workspace`);
  assert.equal(Number(ownerExport.rows[0]?.artifactSizeBytes), encrypted.length);
  const deniedOwnerExport = await web.raw<{ rows: unknown[] }>(
    "SELECT * FROM public.read_owner_workspace_export(?::uuid, ?::text)",
    [requestId, otherOwnerId],
  );
  assert.equal(deniedOwnerExport.rows.length, 0);
  await owner("users").where({ id: ownerId }).update({ emailVerified: false });
  const unverifiedOwnerExport = await web.raw<{ rows: unknown[] }>(
    "SELECT * FROM public.read_owner_workspace_export(?::uuid, ?::text)",
    [requestId, ownerId],
  );
  assert.equal(unverifiedOwnerExport.rows.length, 0);
  await assert.rejects(web.withSchema("admin").table("workspaceExportArtifacts").select("requestId"), { code: "42501" });
  const deniedDownloadRecord = await web.raw<{ rows: { recorded: boolean }[] }>(
    "SELECT public.record_owner_workspace_export_download(?::uuid, ?::text) AS recorded",
    [requestId, otherOwnerId],
  );
  assert.equal(deniedDownloadRecord.rows[0]?.recorded, false);
  const unverifiedDownloadRecord = await web.raw<{ rows: { recorded: boolean }[] }>(
    "SELECT public.record_owner_workspace_export_download(?::uuid, ?::text) AS recorded",
    [requestId, ownerId],
  );
  assert.equal(unverifiedDownloadRecord.rows[0]?.recorded, false);
  await owner("users").where({ id: ownerId }).update({ emailVerified: true });
  const recordedDownload = await web.raw<{ rows: { recorded: boolean }[] }>(
    "SELECT public.record_owner_workspace_export_download(?::uuid, ?::text) AS recorded",
    [requestId, ownerId],
  );
  assert.equal(recordedDownload.rows[0]?.recorded, true);
  const downloadAudit = await owner("accountAudit").where({ userId: ownerId, action: "workspace.export.downloaded" })
    .first<{ actorId: string; details: { requestId: string } }>();
  assert.equal(downloadAudit?.actorId, ownerId);
  assert.equal(downloadAudit?.details.requestId, requestId);
  const downloadedRequest = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{ downloadedAt: Date }>("downloadedAt");
  assert.ok(downloadedRequest?.downloadedAt);

  const plaintext = decryptFile({
    ...deserializeDekEnvelope(artifact.encryptedDek),
    fileIv: artifact.fileIv,
    fileAuthTag: artifact.fileAuthTag,
    ciphertext: encrypted,
  }, masterKey).plaintext;
  assert.ok(plaintext.length > 0);

  const zipPath = join(directory, "workspace-export.zip");
  await writeFile(zipPath, plaintext);
  const names = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
  assert.equal(names.status, 0, names.stderr);
  assert.deepEqual(names.stdout.trim().split("\n").sort(), [
    "customers.csv",
    "estimates.csv",
    "file-metadata.csv",
    "jobs.csv",
    "leads.csv",
    "materials.csv",
    "work-orders.csv",
  ]);
  const csv = (name: string) => {
    const result = spawnSync("unzip", ["-p", zipPath, name], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  assert.match(csv("leads.csv"), new RegExp(`${prefix} lead`));
  assert.match(csv("customers.csv"), new RegExp(`${prefix} customer`));
  assert.match(csv("estimates.csv"), new RegExp(`${prefix} estimate`));
  assert.match(csv("jobs.csv"), new RegExp(`${prefix} job`));
  assert.match(csv("work-orders.csv"), new RegExp(`${prefix} work order`));
  assert.match(csv("materials.csv"), new RegExp(`${prefix} material`));
  const metadata = csv("file-metadata.csv");
  assert.match(metadata, new RegExp(`${prefix} metadata-only.pdf`));
  assert.doesNotMatch(metadata, /private-sensitive-storage-key|private-sensitive-dek/);
  assert.doesNotMatch(plaintext.toString("utf8"), new RegExp(`${prefix} other tenant marker`));

  let notificationAttempts = 0;
  const notice = await processNextAdminWorkspaceExportNotification(worker, async value => {
    notificationAttempts++;
    if (notificationAttempts === 1) throw new Error("Injected notification failure.");
    assert.equal(value.id, requestId);
    assert.equal(value.ownerEmail, `${prefix}@example.test`);
    assert.equal(value.workspaceName, `${prefix} workspace`);
  });
  assert.equal(notice, true);
  const retryScheduled = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{ notificationStatus: string; notificationAttempts: number; nextNotificationAt: Date }>();
  assert.equal(retryScheduled?.notificationStatus, "pending");
  assert.equal(retryScheduled?.notificationAttempts, 1);
  assert.ok(retryScheduled?.nextNotificationAt.getTime() > Date.now());
  assert.equal(await processNextAdminWorkspaceExportNotification(worker, async value => {
    notificationAttempts++;
    assert.equal(value.id, requestId);
  }, new Date(Date.now() + 60_001)), true);
  const notified = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{
      notificationStatus: string;
      notificationAttempts: number;
      notificationSentAt: Date;
    }>();
  assert.equal(notified?.notificationStatus, "sent");
  assert.equal(notified?.notificationAttempts, 2);
  assert.ok(notified?.notificationSentAt);

  await seedRequest(ineligibleRequestId);
  await owner("users").where({ id: ownerId }).update({ emailVerified: false });
  await processNextAdminWorkspaceExport(
    worker, storage, masterKey, new AbortController().signal, [ineligibleRequestId],
  );
  const rejected = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: ineligibleRequestId }).first<{ state: string; failureCode: string }>();
  assert.equal(rejected?.state, "failed");
  assert.equal(rejected?.failureCode, "owner_unavailable");

  await owner.withSchema("admin").table("workspaceExportRequests").where({ id: requestId }).update({
    expiresAt: new Date(Date.now() - 1),
  });
  assert.equal(await processNextExpiredAdminWorkspaceExport(worker, storage), true);
  assert.equal(objects.has(artifact.objectKey), false);
  assert.equal(await owner.withSchema("admin").table("workspaceExportArtifacts").where({ requestId }).first(), undefined);
  const expired = await owner.withSchema("admin").table("workspaceExportRequests")
    .where({ id: requestId }).first<{ state: string }>("state");
  assert.equal(expired?.state, "expired");

  const lifecycle = await owner.withSchema("admin").table("auditEvents")
    .where({ targetId: requestId }).orderBy("sequence").select("action", "staffUserId");
  assert.deepEqual(lifecycle.map(row => row.action), [
    "data.requests.export.generating",
    "data.requests.export.retry_scheduled",
    "data.requests.export.generating",
    "data.requests.export.ready",
    "data.requests.export.notification_retry_scheduled",
    "data.requests.export.notified",
    "data.requests.export.expired",
  ]);
  assert.ok(lifecycle.every(row => row.staffUserId === staffId));
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  console.log("Admin workspace-export rehearsal passed: worker and verified-Owner download grants, scoped CSV ZIP, encryption, notification retries, expiry cleanup, Owner recheck, and staff-attributed audit.");
} finally {
  masterKey.fill(0);
  await rm(directory, { recursive: true, force: true });
  if (schemaReady) {
    await owner.withSchema("admin").table("workspaceExportRequests")
      .whereIn("id", [requestId, ineligibleRequestId]).delete();
    if (workspaceCreated) {
      await owner("workspaces").whereIn("id", [workspaceId, otherWorkspaceId]).delete();
    }
    if (usersCreated) {
      await owner("users").whereIn("id", [ownerId, otherOwnerId]).delete();
    }
    if (staffCreated) {
      await owner.withSchema("admin").table("staffUsers").where({ id: staffId }).delete();
    }
  }
  await Promise.all([web.destroy(), worker.destroy(), owner.destroy()]);
}

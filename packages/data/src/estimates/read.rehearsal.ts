import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  estimateExportColumns,
  estimateExportRequestSchema,
  estimateListQuerySchema,
  permissionIds,
  estimateChatFilterSchema,
  estimateDraftChatProposeSchema,
  type EstimateDraftChatView,
  type EstimateDecisionChatInput,
} from "@salesmora/contracts";
import sharp from "sharp";
import { createDatabase } from "../database";
import { initializeWorkspacePolicy, AuthorizationAccessError } from "../authorization/store";
import { cleanupStagedEstimateBusinessLogos, readEstimateBusinessLogo, uploadEstimateBusinessLogo } from "./business-profile";
import { StorageAdapter, type StorageObject } from "../files/storage-adapter";
import { readEstimates, readEstimatesForChat, readEstimateAgingForChat, readRelatedEstimates, readEstimateCustomerParents, readEstimateCustomerSources } from "./read";
import {
  createEstimateCSVExport,
  EstimateExportEmptyError,
  EstimateExportLimitError,
  estimateExportRowLimit,
  previewEstimateExport,
} from "./export";
import { processEstimateEmails, type EstimateEmailDelivery } from "./delivery";
import { readEstimateLifecycle, setEstimateArchived, voidEstimate } from "./lifecycle";
import { expireEstimates } from "./expiry";
import { readEstimateDecisionReview, recordEstimateDecision } from "./decisions";
import { readEstimateLeadStageReview, confirmEstimateLeadStage } from "./lead-stage";
import { convertAcceptedEstimateToJob, readEstimateConversionReview } from "./conversion";
import {
  processEstimateNotificationEmails,
  scheduleEstimateReminders,
  type EstimateNotificationEmail,
} from "../notifications/estimates";
import {
  markNotificationRead,
  readNotificationPreferences,
  readNotifications,
  saveNotificationPreferences,
} from "../notifications/store";
import { createJob } from "../jobs/store";
import { moveLeadStage } from "../leads/stage";
import { estimateChatStamp, estimateChatEvidenceAllowed } from "./chat-evidence";
import { operateEstimateChatDraft, proposeEstimateChatDraft, readEstimateChatDraftEditor } from "./chat-drafts";
import {
  estimateShareChatBinding, operateEstimateChatShare, proposeEstimateChatShare, readEstimateChatShare,
  refreshEstimateChatShareRecipient, visibleEstimateChatShare,
} from "./chat-sharing";
import {
  estimateDecisionChatBinding, estimateDecisionChatEvidenceAllowed, operateEstimateChatDecision,
  proposeEstimateChatDecision, readEstimateChatDecision, visibleEstimateChatDecision,
} from "./chat-decisions";
import {
  estimateDraftActionChatBinding, estimateDraftActionChatEvidenceAllowed, operateEstimateChatDraftAction,
  proposeEstimateChatDraftAction, readEstimateChatDraftAction, visibleEstimateChatDraftAction,
} from "./chat-draft-actions";
import { withWorkspaceAuthorization } from "../authorization/store";
import { down as rollbackDraftActionMigration } from "../migrations/202610270003_estimate_chat_draft_actions";
import { down as rollbackVoidMigration } from "../migrations/202610270005_estimate_chat_voids";
import { down as rollbackArchiveMigration } from "../migrations/202610270007_estimate_chat_archives";
import { down as rollbackDraftDeleteMigration } from "../migrations/202610270012_estimate_chat_draft_deletes";
import { down as rollbackDraftDeleteEvidenceMigration } from "../migrations/202610270013_estimate_draft_delete_evidence";
import { down as rollbackConversionMigration } from "../migrations/202610270014_estimate_chat_conversions";
import {
  estimateConversionChatBinding,
  estimateConversionChatEvidenceAllowed,
  operateEstimateChatConversion,
  proposeEstimateChatConversion,
  readEstimateChatConversion,
  visibleEstimateChatConversion,
} from "./chat-conversions";
import {
  estimateArchiveChatBinding, estimateArchiveChatEvidenceAllowed, operateEstimateChatArchive,
  proposeEstimateChatArchive, readEstimateChatArchive, visibleEstimateChatArchive,
} from "./chat-archives";
import {
  estimateDraftDeleteChatBinding, estimateDraftDeleteChatEvidenceAllowed,
  operateEstimateChatDraftDelete, proposeEstimateChatDraftDelete, readEstimateChatDraftDelete,
} from "./chat-draft-deletes";
import {
  estimateVoidChatBinding, estimateVoidChatEvidenceAllowed, operateEstimateChatVoid,
  proposeEstimateChatVoid, readEstimateChatVoid, visibleEstimateChatVoid,
} from "./chat-voids";
import {
  createEstimateDraft,
  deleteEstimateDraft,
  duplicateEstimate,
  EstimateDraftConflictError,
  EstimateDraftValidationError,
  readEstimateCreationSeed,
  readEstimateAssistantDetail,
  readEstimateEditor,
  readEstimateRevisionFamily,
  reviseEstimate,
  updateEstimateDraft,
} from "./drafts";
import {
  EstimateBusinessProfileConflict,
  readEstimateBusinessProfile,
  saveEstimateBusinessProfile,
} from "./business-profile";
import {
  readEstimateCustomerLink,
  readEstimateSharingReview,
  readEstimateSnapshotLogo,
  readPublicEstimate,
  readPublicEstimateLogo,
  shareEstimate,
} from "./sharing";

const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (
  !connection ||
  !new URL(connection).pathname.endsWith("_test") ||
  connection === process.env.DATABASE_URL ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)
) {
  throw Error("Use the isolated local test database.");
}

const db = createDatabase(connection);
const workspaceId = randomUUID();
const users = { owner: randomUUID(), field: randomUUID(), office: randomUUID() };
const customerId = randomUUID();
const jobId = randomUUID();
const leadId = randomUUID();
const enabled = [...permissionIds];
class RehearsalStorage extends StorageAdapter {
  readonly objects = new Map<string, Buffer>();

  constructor() {
    super({
      endpoint: "http://127.0.0.1:59000",
      bucket: "estimate-rehearsal",
      region: "us-east-1",
      accessKeyId: "local",
      secretAccessKey: "local",
      forcePathStyle: true,
    });
  }

  override async put(key: string, object: StorageObject) {
    this.objects.set(key, Buffer.from(object.data));
  }

  override async get(key: string) {
    const value = this.objects.get(key);
    if (!value) throw new Error("Rehearsal file is missing.");
    return Buffer.from(value);
  }

  override async delete(key: string) {
    this.objects.delete(key);
  }
}
const rehearsalStorage = new RehearsalStorage();
const identity = (role: keyof typeof users = "owner") => ({
  userId: users[role],
  workspaceId,
});
let passed = 0;
const publicRequester = randomUUID();
const rateLimitKeys = [publicRequester, `${publicRequester}-limit`].map(key =>
  `estimate-public:${createHash("sha256").update(key).digest("hex")}`,
);

async function check(label: string, work: () => Promise<void>) {
  await work();
  console.log(`PASS ${label}`);
  passed++;
}

function localDate(offset: number) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function sharingDraft(recipientEmail = "", paymentLink = "", parent: { type: "lead" | "job"; id: string } = { type: "job", id: jobId }) {
  return createEstimateDraft(db, identity(), enabled, {
    workspaceId, submissionId: randomUUID(), parentType: parent.type, parentId: parent.id,
    values: {
      details: {
        name: "Sharing fixture", recipientName: "Fixture Customer", recipientEmail,
        serviceAddress: "2 Fixture Avenue", ownerId: users.owner,
      },
      items: [{
        description: "Fixture installation", quantity: "1", unitPrice: "100.00",
        taxable: false, included: false,
      }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: {
        message: "Customer message", validUntil: localDate(5),
        paymentTerms: "Due within 60 days.", termsNote: "Customer terms.",
        deposit: { type: "percent", value: "25" },
      },
      scope: "Customer scope", internalNotes: "STAFF_ONLY_SHARING_FIXTURE",
      paymentLink,
    },
  });
}

async function queueEmail() {
  const draft = await sharingDraft("delivery-fixture@example.test");
  const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
  await shareEstimate(db, identity(), enabled, {
    mode: "send", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
    snapshotHash: review.snapshotHash, submissionId: randomUUID(),
    recipientEmail: "delivery-fixture@example.test", subject: review.subject,
  });
  return { estimateId: draft.id, delivery: await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id }).first() };
}

async function decisionFixture() {
  const { estimateId } = await queueEmail();
  const review = await readEstimateDecisionReview(db, identity(), enabled, estimateId);
  return {
    workspaceId, estimateId, expectedVersion: review.estimate.version, submissionId: randomUUID(),
    snapshotHash: review.snapshotHash, mode: "record" as const, expectedDecisionId: null,
    outcome: "accepted" as const, decisionDate: review.today, channel: "phone" as const, note: "PRIVATE_DECISION_NOTE",
  };
}

async function acceptedLeadConversionFixture(withCustomer = true) {
  const sourceLeadId = randomUUID();
  await db("leads").insert({
    id: sourceLeadId, workspaceId, createdBy: users.owner, submissionId: randomUUID(),
    submissionHash: randomUUID(), name: "Conversion fixture lead", email: "", phone: "",
    service: "Fixture repair", address: "2 Fixture Avenue", details: "", notes: "",
    source: "website", stage: "contacted", ownerId: users.owner,
    customerId: withCustomer ? customerId : null,
  });
  const draft = await sharingDraft("conversion-fixture@example.test", "", { type: "lead", id: sourceLeadId });
  const sharing = await readEstimateSharingReview(db, identity(), enabled, draft.id);
  const sent = await shareEstimate(db, identity(), enabled, {
    mode: "send", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
    snapshotHash: sharing.snapshotHash, submissionId: randomUUID(),
    recipientEmail: "conversion-fixture@example.test", subject: sharing.subject,
  });
  const decision = await readEstimateDecisionReview(db, identity(), enabled, draft.id);
  await recordEstimateDecision(db, identity(), enabled, {
    workspaceId, estimateId: draft.id, expectedVersion: sent.version,
    snapshotHash: decision.snapshotHash, submissionId: randomUUID(),
    mode: "record", expectedDecisionId: null, outcome: "accepted",
    decisionDate: decision.today, channel: "phone", note: "",
  });
  const review = await readEstimateConversionReview(db, identity(), enabled, draft.id);
  return { sourceLeadId, estimateId: draft.id, review };
}

function conversionCommand(fixture: Awaited<ReturnType<typeof acceptedLeadConversionFixture>>) {
  const review = fixture.review.review;
  if (review.expectedLeadVersion === null || review.expectedCustomerVersion === null) {
    throw new Error("Conversion fixture requires a linked customer and source lead.");
  }
  return {
    workspaceId, estimateId: fixture.estimateId, submissionId: randomUUID(),
    expectedVersion: review.expectedVersion, expectedLeadVersion: review.expectedLeadVersion,
    expectedCustomerVersion: review.expectedCustomerVersion, snapshotHash: review.snapshotHash,
    sourceLeadId: fixture.sourceLeadId,
    job: {
      customerId: review.job.customerId, title: review.job.title, service: review.job.service,
      location: review.job.location, description: review.job.description,
      primaryOwnerId: review.job.primaryOwnerId, teamUserIds: review.job.teamUserIds,
      scheduledDate: review.job.scheduledDate, arrivalWindow: review.job.arrivalWindow,
      completionDeadline: review.job.completionDeadline,
    },
  };
}

async function archiveFixture() {
  const command = await decisionFixture();
  const receipt = await recordEstimateDecision(db, identity(), enabled, { ...command, outcome: "declined" });
  return {
    workspaceId, estimateId: command.estimateId, expectedVersion: receipt.version,
    submissionId: randomUUID(), mode: "archive" as const,
  };
}

async function leadSuggestionFixture(outcome?: "accepted" | "declined") {
  const id = randomUUID();
  await db("leads").insert({
    id, workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: randomUUID(),
    name: `Suggestion lead ${id}`, email: "", phone: "", service: "Lead suggestion repair",
    address: "", details: "", notes: "", source: "website", stage: "contacted",
    ownerId: users.office, customerId: null,
  });
  const lead = await db("leads").where({ id }).first("version");
  const activityCount = (await db("leadActivity").where({ leadId: id })).length;
  const draft = await sharingDraft("lead-stage@example.test", "", { type: "lead", id });
  const review = await readEstimateSharingReview(db, identity("office"), enabled, draft.id);
  const sendId = randomUUID();
  const sent = await shareEstimate(db, identity("office"), enabled, {
    mode: "send", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
    snapshotHash: review.snapshotHash, submissionId: sendId,
    recipientEmail: "lead-stage@example.test", subject: review.subject,
  });
  let sourceSubmissionId = sendId;
  let version = sent.version;
  if (outcome) {
    const decision = await readEstimateDecisionReview(db, identity("office"), enabled, draft.id);
    sourceSubmissionId = randomUUID();
    const saved = await recordEstimateDecision(db, identity("office"), enabled, {
      workspaceId, estimateId: draft.id, submissionId: sourceSubmissionId, expectedVersion: version,
      snapshotHash: decision.snapshotHash, mode: "record", expectedDecisionId: null,
      outcome, decisionDate: decision.today, channel: "phone", note: "PRIVATE_LEAD_DECISION",
    });
    version = saved.version;
  }
  const binding = { workspaceId, estimateId: draft.id, sourceSubmissionId, expectedEstimateVersion: version };
  return {
    binding, sendId, leadId: id, activityCount,
    command: {
      ...binding, leadId: id, expectedLeadVersion: Number(lead.version),
      submissionId: randomUUID(), to: outcome === "declined" ? "lost" : "estimate-sent",
    },
  };
}

async function revisionFixture(paymentLink = "") {
  const draft = await sharingDraft("revision-fixture@example.test", paymentLink);
  const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
  const shared = await shareEstimate(db, identity(), enabled, {
    workspaceId, estimateId: draft.id, submissionId: randomUUID(), expectedVersion: draft.version,
    snapshotHash: review.snapshotHash, mode: "publish",
  });
  return {
    workspaceId, estimateId: draft.id, submissionId: randomUUID(),
    expectedVersion: shared.version, snapshotHash: shared.snapshotHash,
  };
}

async function publishRevision(estimateId: string) {
  const review = await readEstimateSharingReview(db, identity(), enabled, estimateId);
  return shareEstimate(db, identity(), enabled, {
    workspaceId, estimateId, submissionId: randomUUID(), expectedVersion: review.estimate.version,
    snapshotHash: review.snapshotHash, mode: "publish",
    ...(review.revision ? { revisionReview: {
      sourceEstimateId: review.revision.sourceEstimateId, sourceVersion: review.revision.sourceVersion, paymentLinkReviewed: true,
    } } : {}),
  });
}

async function addEstimate(input: {
  status: string;
  parentType: "lead" | "job";
  ownerId: string | null;
  name: string;
  totalCents: number | null;
  validUntil?: string | null;
  revision?: number;
  estimateNumber?: number;
  leadId?: string;
  jobId?: string;
  archivedAt?: Date | null;
  decidedAt?: Date | null;
  sentAt?: Date | null;
}) {
  const [row] = await db("estimates")
    .insert({
      id: randomUUID(),
      workspaceId,
      name: input.name,
      status: input.status,
      parentType: input.parentType,
      leadId: input.leadId ?? null,
      jobId: input.jobId ?? null,
      customerId: input.parentType === "job" ? customerId : null,
      ownerId: input.ownerId,
      totalCents: input.totalCents,
      validUntil: input.validUntil ?? null,
      revision: input.revision ?? 1,
      estimateNumber: input.estimateNumber ?? null,
      decidedAt: input.decidedAt ?? null,
      sentAt: input.sentAt ?? null,
      decisionChannel: input.decidedAt ? "phone" : null,
      archivedAt: input.archivedAt ?? null,
      createdBy: users.owner,
    })
    .returning(["id", "estimateNumber"]);
  return { id: row.id as string, estimateNumber: Number(row.estimateNumber) };
}

try {
  await db.transaction(async (trx) => {
    const now = new Date();
    await trx("users").insert(
      Object.entries(users).map(([role, id]) => ({
        id,
        name: `Estimate fixture ${role}`,
        email: `${id}@example.test`,
        createdAt: now,
        updatedAt: now,
        termsVersion: "fixture",
        termsAcceptedAt: now,
      })),
    );
    await trx("workspaces").insert({
      id: workspaceId,
      ownerId: users.owner,
      businessName: "Estimate fixture workspace",
      businessType: "plumbing",
      postalCode: "",
      serviceRange: "",
      timezone: "America/New_York",
    });
    await trx("workspaceMemberships").insert([
      { workspaceId, userId: users.owner, role: "owner" },
      { workspaceId, userId: users.field, role: "field" },
      { workspaceId, userId: users.office, role: "office" },
    ]);
    await initializeWorkspacePolicy(trx, { workspaceId, userId: users.owner });
    await trx("customers").insert({
      id: customerId,
      workspaceId,
      name: "Estimate Fixture Customer",
      type: "person",
      companyName: "",
      email: "",
      phone: "",
      location: "",
      internalNotes: "",
    });
    await trx("jobs").insert({
      id: jobId,
      workspaceId,
      customerId,
      customerName: "Estimate Fixture Customer",
      title: "Fixture repair",
      service: "Plumbing",
      location: "",
      description: "",
      primaryOwnerId: users.field,
      createdBy: users.owner,
    });
    await trx("leads").insert({
      id: leadId,
      workspaceId,
      createdBy: users.owner,
      submissionId: randomUUID(),
      submissionHash: "estimate-fixture",
      name: "Lead Only Customer",
      email: "",
      phone: "",
      service: "Roof repair",
      address: "",
      details: "",
      notes: "",
      source: "website",
      stage: "contacted",
      ownerId: users.owner,
    });
  });

  const superseded = await addEstimate({
    status: "superseded",
    parentType: "job",
    ownerId: users.field,
    name: "Older revision",
    totalCents: 9000,
    jobId,
  });
  await addEstimate({
    status: "draft",
    parentType: "job",
    ownerId: users.field,
    name: "Current revision",
    totalCents: 10000,
    revision: 2,
    estimateNumber: superseded.estimateNumber,
    jobId,
  });
  const expiringEstimate = await addEstimate({
    status: "sent",
    parentType: "job",
    ownerId: users.field,
    name: "Expiring estimate",
    totalCents: 20000,
    validUntil: localDate(3),
    sentAt: new Date(Date.now() - 10 * 86_400_000),
    jobId,
  });
  await addEstimate({
    status: "draft",
    parentType: "lead",
    ownerId: users.owner,
    name: "Lead estimate",
    totalCents: 40000,
    leadId,
  });
  await addEstimate({
    status: "accepted",
    parentType: "job",
    ownerId: users.field,
    name: "Accepted estimate",
    totalCents: 30000,
    validUntil: localDate(5),
    decidedAt: new Date(),
    jobId,
  });
  await addEstimate({
    status: "declined",
    parentType: "job",
    ownerId: users.field,
    name: "Archived estimate",
    totalCents: 5000,
    archivedAt: new Date(),
    jobId,
  });

  await check("workspace list, latest revision, metrics, and number formatting", async () => {
    const result = await readEstimates(db, identity(), enabled, { workspaceId });
    assert.equal(result.canVoid, true);
    assert.equal(result.scope, "workspace");
    assert.equal(result.total, 4);
    assert.equal(result.scopeTotal, 6);
    assert.deepEqual(
      result.rows.map((row) => row.name).sort(),
      ["Accepted estimate", "Current revision", "Expiring estimate", "Lead estimate"].sort(),
    );
    assert.match(result.rows.find((row) => row.name === "Current revision")!.number, /^EST-\d{4}$/);
    assert.equal(result.metrics.awaitingCount, 1);
    assert.equal(result.metrics.openValueCents, "70000");
    assert.equal(result.metrics.acceptedThisMonthCount, 1);
    assert.equal(result.metrics.acceptedThisMonthCents, "30000");
    assert.equal(result.metrics.expiringInSevenDaysCount, 1);
    assert.equal(result.canCreate, true);
    assert.equal(result.canExport, true);
    assert(result.rows.every(row => row.canDuplicate));
    assert(result.rows.every(row => row.canDelete === (row.status === "draft")));
    assert(result.rows.every(row => row.canRevise === ["sent", "published", "declined", "expired"].includes(row.status)));
  });

  await check("Field SQL scope includes assigned jobs but excludes lead estimates", async () => {
    const result = await readEstimates(db, identity("field"), enabled, { workspaceId });
    assert.equal(result.canVoid, false);
    assert.equal(result.scope, "assigned_job");
    assert.equal(result.total, 3);
    assert(result.scopeTotal >= result.total);
    assert(result.scopeTotal < 6);
    assert(result.rows.every((row) => row.parentType === "job"));
    assert.equal(result.canCreate, true);
    assert.equal(result.canExport, false);
    assert(result.rows.every(row => row.canDuplicate));
    assert(result.rows.every(row => !row.canDelete));
    assert(result.rows.every(row => row.canRevise === ["sent", "published", "declined", "expired"].includes(row.status)));
    assert.deepEqual(result.owners.map((owner) => owner.id), [users.field]);
  });

  await check("hidden revisions, archived rows, filters, escaped search, and paging", async () => {
    const hidden = await readEstimates(db, identity(), enabled, {
      workspaceId,
      includeHidden: true,
      pageSize: 50,
    });
    assert.equal(hidden.total, 6);
    assert.equal(hidden.scopeTotal, 6);
    assert(hidden.rows.some((row) => row.name === "Older revision" && row.status === "superseded"));
    assert(hidden.rows.some((row) => row.name === "Archived estimate" && row.archived));

    const filtered = await readEstimates(db, identity(), enabled, {
      workspaceId,
      q: "EST-0002",
      status: "sent",
      pageSize: 25,
    });
    assert.equal(filtered.total, 1);
    assert.equal(filtered.rows[0].name, "Expiring estimate");

    const page = await readEstimates(db, identity(), enabled, {
      workspaceId,
      page: 2,
      pageSize: 25,
    });
    assert.equal(page.rows.length, 0);
    assert.equal(page.total, 4);
  });

  await check("assistant reads apply bounded filters and protect hidden Estimates", async () => {
    const filters = {
      query: "Expiring",
      status: "sent",
      owner: "me",
      parent: "job",
      customer: null,
      minTotalCents: 15000,
      maxTotalCents: 25000,
      validUntilFrom: null,
      validUntilTo: null,
      includeHidden: false,
      limit: 1,
    };
    const result = await readEstimatesForChat(
      db,
      identity("field"),
      enabled,
      filters,
    );
    assert.equal(result.total, 1);
    assert.equal(result.truncated, false);
    assert.equal(result.estimates[0].name, "Expiring estimate");
    assert.deepEqual(
      Object.keys(result.estimates[0]).sort(),
      [
        "archived",
        "customer",
        "id",
        "name",
        "number",
        "owner",
        "parent",
        "parentId",
        "parentType",
        "revision",
        "status",
        "totalCents",
        "updatedAt",
        "validUntil",
      ].sort(),
    );
    assert.equal(result.totalCents, 20000);
    assert.equal(result.timezone, "America/New_York");
    assert.equal(result.today, localDate(0));
    assert.equal(result.estimates[0].parentId, jobId);
    await assert.rejects(
      readEstimatesForChat(
        db,
        identity("field"),
        enabled,
        { ...filters, includeHidden: true },
      ),
      AuthorizationAccessError,
    );
  });

  await check("assistant aggregates cover every match, preserve quick filters and unknown amounts", async () => {
    const filters = estimateChatFilterSchema.parse({
      query: "", status: "all", owner: "all", parent: "all", customer: null,
      minTotalCents: null, maxTotalCents: null, validUntilFrom: null, validUntilTo: null,
      includeHidden: false, limit: 1,
    });
    const all = await readEstimatesForChat(db, identity(), enabled, filters);
    assert.equal(all.total, 4);
    assert.equal(all.totalCents, 100000);
    assert.equal(all.estimates.length, 1);
    assert.equal(all.truncated, true);
    const awaiting = await readEstimatesForChat(db, identity(), enabled, { ...filters, quickFilter: "awaiting" });
    assert.equal(awaiting.total, 1);
    assert.equal(awaiting.totalCents, 20000);
    const expiring = await readEstimatesForChat(db, identity(), enabled, { ...filters, quickFilter: "expiring" });
    assert.equal(expiring.total, 1);
    const empty = await readEstimatesForChat(db, identity(), enabled, { ...filters, query: "NO_MATCH_ESTIMATE" });
    assert.equal(empty.total, 0);
    assert.equal(empty.totalCents, 0);
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ totalCents: null });
    const unknown = await readEstimatesForChat(db, identity(), enabled, filters);
    assert.equal(unknown.totalCents, null);
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ totalCents: Number.MAX_SAFE_INTEGER - 80000 });
    const maximum = await readEstimatesForChat(db, identity(), enabled, filters);
    assert.equal(maximum.totalCents, Number.MAX_SAFE_INTEGER);
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ totalCents: Number.MAX_SAFE_INTEGER - 79999 });
    const overflow = await readEstimatesForChat(db, identity(), enabled, filters);
    assert.equal(overflow.totalCents, null);
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ totalCents: 20000 });
  });

  await check("assistant epoch detects changes even for empty results and revoked Job assignment", async () => {
    const stamp = await withWorkspaceAuthorization(db, identity("field"), enabled, false, estimateChatStamp);
    await withWorkspaceAuthorization(db, identity("field"), enabled, false, async (trx, context) => {
      assert.equal(await estimateChatEvidenceAllowed(trx, context, stamp), true);
    });
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.owner });
    await withWorkspaceAuthorization(db, identity("field"), enabled, false, async (trx, context) => {
      assert.equal(await estimateChatEvidenceAllowed(trx, context, stamp), false);
    });
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.field });
    const current = await withWorkspaceAuthorization(db, identity(), enabled, false, estimateChatStamp);
    assert.notEqual(current, stamp);
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ name: "New epoch name" });
    await withWorkspaceAuthorization(db, identity(), enabled, false, async (trx, context) => {
      assert.equal(await estimateChatEvidenceAllowed(trx, context, current), false);
    });
    await db("estimates").where({ workspaceId, id: expiringEstimate.id }).update({ name: "Expiring estimate" });
  });

  await check("assistant aging uses workspace dates and authorized Job scope", async () => {
    const acceptedLeadEstimate = await addEstimate({
      status: "accepted",
      parentType: "lead",
      ownerId: users.owner,
      name: "Accepted lead without Job",
      totalCents: 25000,
      decidedAt: new Date(),
      leadId,
    });
    const ownerResult = await readEstimateAgingForChat(db, identity(), enabled, {
      waitingDays: 7,
      expiringWithinDays: 7,
      limit: 1,
    });
    assert.equal(ownerResult.waiting.total, 1);
    assert.equal(ownerResult.waiting.totalCents, 20000);
    assert.equal(ownerResult.waiting.truncated, false);
    assert.equal(ownerResult.waiting.estimates[0].id, expiringEstimate.id);
    assert(ownerResult.waiting.estimates[0].waitingDays >= 9);
    assert.equal(ownerResult.expiring.total, 1);
    assert.equal(ownerResult.expiring.totalCents, 20000);
    assert.equal(ownerResult.expiring.estimates[0].daysUntilExpiry, 3);
    assert.equal(ownerResult.acceptedWithoutJob.total, 1);
    assert.equal(ownerResult.acceptedWithoutJob.totalCents, 25000);
    assert.equal(ownerResult.acceptedWithoutJob.estimates[0].id, acceptedLeadEstimate.id);

    const fieldResult = await readEstimateAgingForChat(
      db,
      identity("field"),
      enabled,
      { waitingDays: 7, expiringWithinDays: 7, limit: 10 },
    );
    assert.equal(fieldResult.scope, "assigned_job");
    assert.equal(fieldResult.acceptedWithoutJob.total, 0);
    await assert.rejects(
      readEstimateAgingForChat(db, identity("field"), enabled, {
        waitingDays: 0,
        expiringWithinDays: 7,
        limit: 10,
      }),
    );
    await db("estimates")
      .where({ workspaceId, id: acceptedLeadEstimate.id })
      .delete();
  });

  await check("assistant Estimate details use canonical draft and frozen totals", async () => {
    const draft = await sharingDraft(
      "private-estimate-detail@example.test",
      "https://payments.example.test/pay",
    );
    const draftDetail = await readEstimateAssistantDetail(
      db,
      identity(),
      enabled,
      draft.id,
    );
    assert.equal(draftDetail.source, "current_draft");
    assert.equal(draftDetail.totals.subtotalCents, 10000);
    assert.equal(draftDetail.totals.taxCents, 0);
    assert.equal(draftDetail.totals.totalCents, 10000);
    assert.equal(draftDetail.totals.depositCents, 2500);
    assert.equal(draftDetail.totals.balanceCents, 7500);
    assert.equal(draftDetail.lineItems[0].amountCents, 10000);
    assert.equal(
      JSON.stringify(draftDetail).includes("STAFF_ONLY_SHARING_FIXTURE"),
      false,
    );
    assert.equal(JSON.stringify(draftDetail).includes("payments.example.test"), false);
    await deleteEstimateDraft(db, identity(), enabled, {
      workspaceId,
      estimateId: draft.id,
      expectedVersion: draft.version,
      typedConfirmation: draft.number,
    });

    const assistantFixtureThreads: string[] = [];
    const assistantFixtureJobs: string[] = [];
    async function assistantDraftFixture(role: "owner" | "office" = "owner") {
      const parentId = randomUUID(), turnId = randomUUID(), threadId = randomUUID();
      assistantFixtureJobs.push(parentId); assistantFixtureThreads.push(threadId);
      await db("jobs").insert({
        id: parentId, workspaceId, title: "Assistant proposal fixture", customerName: "Fixture",
        service: "Fixture", location: "", description: "", primaryOwnerId: users.owner, createdBy: users.owner,
      });
      await db("chatThreads").insert({ id: threadId, workspaceId, userId: users[role] });
      await db("chatTurns").insert({
        id: turnId, threadId, workspaceId, userId: users[role], clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
      await db("chatMessages").insert({ id: randomUUID(), turnId, role: "user", text: "Prepare a Draft with installation at $100.00." });
      const input = estimateDraftChatProposeSchema.parse({ request: {
        operation: "create", parentType: "job", parentRef: parentId, estimateRef: null,
        changes: { name: "Proposal fixture", scope: null, message: null, paymentTerms: null, termsNote: null,
          validUntil: null, discount: null, taxRate: null, deposit: null, items: [{
            savedLineId: null, description: "Installation", quantity: "1", unit: "job", unitPrice: "100.00",
            taxable: false, included: false, priceSource: "user", priceQuote: "$100.00", catalogRef: null,
          }] },
      } });
      const view = await proposeEstimateChatDraft(db, identity(role), enabled, turnId, input, new AbortController().signal);
      await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
      return { parentId, turnId, threadId, view, input };
    }
    function assistantDraftBinding(view: EstimateDraftChatView) {
      const draft = view.draft;
      return {
        proposalId: draft.id, inputHash: draft.inputHash, authorizationVersion: draft.authorizationVersion,
        actionType: draft.actionType, parentType: draft.parent.type, parentId: draft.parent.id, parentVersion: draft.parent.version,
        estimateId: draft.actionType === "estimate.update" ? draft.estimate.id : null,
        expectedVersion: draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null,
      };
    }
    await check("assistant Draft proposals expire at exactly 15 minutes, including editor handoff", async () => {
      const fixture = await assistantDraftFixture(), now = Date.now;
      try {
        Date.now = () => Date.parse(fixture.view.draft.expiresAt);
        for (const action of ["confirm", "cancel", "editor"] as const) {
          await assert.rejects(operateEstimateChatDraft(db, identity(), enabled, assistantDraftBinding(fixture.view), action), EstimateDraftConflictError);
        }
        await assert.rejects(readEstimateChatDraftEditor(db, identity(), enabled, fixture.view.draft.id), EstimateDraftConflictError);
        assert.equal((await db("estimates").where({ workspaceId, jobId: fixture.parentId })).length, 0);
      } finally { Date.now = now; }
    });
    await check("assistant Draft confirmation rolls back Estimate, receipt and proposal if durable audit fails", async () => {
      const fixture = await assistantDraftFixture();
      const constraint = `assistant_draft_audit_${randomUUID().replaceAll("-", "")}`;
      await db.raw(`ALTER TABLE "chatEstimateDraftAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
      try {
        await assert.rejects(operateEstimateChatDraft(db, identity(), enabled, assistantDraftBinding(fixture.view), "confirm"));
        assert.equal((await db("estimates").where({ workspaceId, jobId: fixture.parentId })).length, 0);
        assert.equal((await db("chatEstimateDrafts").where({ id: fixture.view.draft.id }).first()).state, "pending");
        assert.equal((await db("estimate_operation_receipts").where({ workspaceId, submissionId: fixture.view.draft.id })).length, 0);
      } finally { await db.raw(`ALTER TABLE "chatEstimateDraftAudit" DROP CONSTRAINT "${constraint}"`); }
      const result = await operateEstimateChatDraft(db, identity(), enabled, assistantDraftBinding(fixture.view), "confirm");
      assert.equal(result.view.draft.state, "confirmed");
      assert.equal((await db("estimate_activity").where({ estimateId: result.view.receipt!.id }).first()).source, "assistant-confirmed");
    });
    await check("assistant Draft proposals are invalidated by membership replacement and catalog changes", async () => {
      const fixture = await assistantDraftFixture("office");
      const membership = await db("workspaceMemberships").where({ workspaceId, userId: users.office }).first();
      await db("workspaceMemberships").where({ workspaceId, userId: users.office }).delete();
      await db("workspaceMemberships").insert(membership);
      await assert.rejects(operateEstimateChatDraft(db, identity("office"), enabled, assistantDraftBinding(fixture.view), "confirm"), AuthorizationAccessError);
      const second = await assistantDraftFixture(), materialId = randomUUID();
      await db("materialCatalog").insert({ id: materialId, workspaceId, name: "Epoch fixture", unit: "each", priceCents: 100 });
      await assert.rejects(operateEstimateChatDraft(db, identity(), enabled, assistantDraftBinding(second.view), "confirm"), EstimateDraftConflictError);
      assert.equal((await db("estimates").where({ workspaceId }).whereIn("jobId", [fixture.parentId, second.parentId])).length, 0);
      await db("materialCatalog").where({ id: materialId }).delete();
    });
    await check("assistant user-price proof rejects numeric claims not found in the actual owned user message", async () => {
      const fixture = await assistantDraftFixture();
      await db("chatTurns").where({ id: fixture.turnId }).update({ state: "running" });
      fixture.input.request.changes.items![0].unitPrice = "750";
      fixture.input.request.changes.items![0].priceQuote = "$750";
      const view = await proposeEstimateChatDraft(db, identity(), enabled, fixture.turnId, fixture.input, new AbortController().signal);
      assert.equal(view.canConfirm, false);
      assert.equal(view.draft.proposed.items[0].unitPrice, "");
      assert.deepEqual(view.draft.proposed.items[0].priceSource, { type: "missing" });
      await db("chatTurns").where({ id: fixture.turnId }).update({ state: "completed" });
    });
    await check("assistant user-price proof accepts sentence punctuation and explicit no-charge evidence, not negated numeric signs", async () => {
      const fixture = await assistantDraftFixture();
      assert.equal(fixture.view.canConfirm, true);
      await db("chatTurns").where({ id: fixture.turnId }).update({ state: "running" });
      await db("chatMessages").where({ turnId: fixture.turnId, role: "user" })
        .update({ text: "Installation at $100.00. Cleanup included at no charge. Not a negative price: -$50.00." });
      const base = fixture.input.request.changes.items![0];
      fixture.input.request.changes.items = [
        base, { ...base, description: "Cleanup", unitPrice: "0.00", included: true, priceQuote: "included at no charge" },
        { ...base, description: "Unsupported sign", unitPrice: "50.00", priceQuote: "$50.00" },
      ];
      const view = await proposeEstimateChatDraft(db, identity(), enabled, fixture.turnId, fixture.input, new AbortController().signal);
      assert.equal(view.draft.proposed.items[0].unitPrice, "100.00");
      assert.equal(view.draft.proposed.items[1].unitPrice, "0.00");
      assert.equal(view.draft.proposed.items[1].included, true);
      assert.equal(view.draft.proposed.items[2].unitPrice, "");
      await db("chatTurns").where({ id: fixture.turnId }).update({ state: "completed" });
    });
    await db("chatThreads").whereIn("id", assistantFixtureThreads).delete();
    await db("estimate_operation_receipts").where({ workspaceId })
      .whereIn("estimateId", db("estimates").where({ workspaceId }).whereIn("jobId", assistantFixtureJobs).select("id"))
      .update({ estimateId: null });
    await db("estimates").where({ workspaceId }).whereIn("jobId", assistantFixtureJobs).delete();
    await db("jobs").where({ workspaceId }).whereIn("id", assistantFixtureJobs).delete();
  });

  await check("foreign workspace and forged workspace identifiers are denied", async () => {
    await assert.rejects(
      readEstimates(db, identity(), enabled, {
        workspaceId: randomUUID(),
      }),
      AuthorizationAccessError,
    );
  });

  await check("list row actions use current per-record scopes, team assignment and independent grants", async () => {
    const policies = await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
      .whereIn("permission", ["estimates.create", "estimates.update", "estimates.delete"]);
    try {
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
        .whereIn("permission", ["estimates.create", "estimates.update"]).update({ scope: "assigned_job" });
      let list = await readEstimates(db, identity("office"), enabled, { workspaceId });
      assert(list.rows.every(row => !row.canDuplicate && !row.canRevise));
      assert.equal(list.rows.find(row => row.name === "Lead estimate")!.canDelete, true);
      await db("jobTeamMembers").insert({ workspaceId, jobId, userId: users.office });
      list = await readEstimates(db, identity("office"), enabled, { workspaceId });
      assert(list.rows.filter(row => row.parentType === "job").every(row => row.canDuplicate));
      assert.equal(list.rows.find(row => row.name === "Expiring estimate")!.canRevise, true);
      assert.equal(list.rows.find(row => row.name === "Lead estimate")!.canDuplicate, false);
      await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.update" }).delete();
      list = await readEstimates(db, identity("office"), enabled, { workspaceId });
      assert(list.rows.filter(row => row.parentType === "job").every(row => row.canDuplicate));
      assert(list.rows.every(row => !row.canRevise));
      await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.create" }).delete();
      list = await readEstimates(db, identity("office"), enabled, { workspaceId });
      assert(list.rows.every(row => !row.canDuplicate && !row.canRevise));
      assert.equal(list.rows.find(row => row.name === "Lead estimate")!.canDelete, true);
      await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.delete" }).delete();
      list = await readEstimates(db, identity("office"), enabled, { workspaceId });
      assert(list.rows.every(row => !row.canDelete));
    } finally {
      await db("jobTeamMembers").where({ workspaceId, jobId, userId: users.office }).delete();
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
        .whereIn("permission", ["estimates.create", "estimates.update", "estimates.delete"]).delete();
      await db("workspaceRolePolicies").insert(policies);
    }
  });

  async function checkLeadSuggestions() {
      await check("lead suggestions read authorized minimal context without changing records; Send and Decline stay separate", async () => {
        for (const outcome of [undefined, "declined"] as const) {
          const fixture = await leadSuggestionFixture(outcome);
          const before = await db("leads").where({ id: fixture.leadId }).first();
          const estimate = await db("estimates").where({ id: fixture.binding.estimateId }).first();
          const review = await readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding);
          assert.equal(review.target, outcome ? "lost" : "estimate-sent");
          assert.deepEqual(Object.keys(review).sort(), ["estimate", "event", "lead", "target"]);
          assert.equal(JSON.stringify(review).includes("PRIVATE_"), false);
          assert.deepEqual(await db("leads").where({ id: fixture.leadId }).first(), before);
          assert.deepEqual(await db("estimates").where({ id: fixture.binding.estimateId }).first(), estimate);
          assert.equal((await db("leadActivity").where({ leadId: fixture.leadId })).length, fixture.activityCount);
        }
      });
      await check("estimate-bound lead moves reuse one stage mutation/activity and preserve estimate, snapshot, outbox and jobs", async () => {
        for (const outcome of [undefined, "declined"] as const) {
          const fixture = await leadSuggestionFixture(outcome);
          const estimate = await db("estimates").where({ id: fixture.binding.estimateId }).first();
          const snapshot = await db("estimate_snapshots").where({ estimateId: estimate.id }).first();
          const deliveries = await db("estimate_deliveries").where({ estimateId: estimate.id });
          const jobs = await db("jobs").where({ workspaceId }).orderBy("id");
          const command = { ...fixture.command, ...(outcome ? { reason: "Customer chose another provider." } : {}) };
          const receipt = await confirmEstimateLeadStage(db, identity("office"), enabled, command);
          assert.equal(receipt.version, fixture.command.expectedLeadVersion + 1);
          assert.deepEqual(await confirmEstimateLeadStage(db, identity("office"), enabled, command), receipt);
          const lead = await db("leads").where({ id: fixture.leadId }).first();
          assert.equal(lead.stage, command.to);
          assert.equal(lead.version, fixture.command.expectedLeadVersion + 1);
          const activity = await db("leadActivity").where({ leadId: fixture.leadId });
          assert.equal(activity.length, fixture.activityCount + 1);
          const latest = activity.find(row => row.changes.estimateSuggestion?.estimateId === estimate.id);
          assert.ok(latest);
          assert.equal(latest.changes.reason, outcome ? command.reason : undefined);
          assert.deepEqual(await db("estimates").where({ id: estimate.id }).first(), estimate);
          assert.deepEqual(await db("estimate_snapshots").where({ estimateId: estimate.id }).first(), snapshot);
          assert.deepEqual(await db("estimate_deliveries").where({ estimateId: estimate.id }), deliveries);
          assert.deepEqual(await db("jobs").where({ workspaceId }).orderBy("id"), jobs);
        }
      });
      await check("lead suggestion eligibility never reopens closed/archived/current-target leads or broadens the offered stage", async () => {
        const fixture = await leadSuggestionFixture();
        for (const stage of ["estimate-sent", "won", "lost"]) {
          await db("leads").where({ id: fixture.leadId }).update({ stage });
          assert.equal((await readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding)).target, null);
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), EstimateDraftConflictError);
        }
        await db("leads").where({ id: fixture.leadId }).update({ stage: "contacted", archivedAt: new Date() });
        assert.equal((await readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding)).target, null);
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), EstimateDraftConflictError);
        await db("leads").where({ id: fixture.leadId }).update({ archivedAt: null });
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...fixture.command, to: "lost" }), EstimateDraftConflictError);
        assert.equal((await db("leadActivity").where({ leadId: fixture.leadId })).length, fixture.activityCount);
      });
      await check("suggestion confirmation rejects changed lead versions, estimates, effective expiry and supersession atomically", async () => {
        const fixture = await leadSuggestionFixture();
        await db("leads").where({ id: fixture.leadId }).update({ version: 2 });
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), EstimateDraftConflictError);
        await db("leads").where({ id: fixture.leadId }).update({ version: fixture.command.expectedLeadVersion });
        for (const patch of [{ version: fixture.binding.expectedEstimateVersion + 1 }, { status: "void" }, { status: "superseded" }, { archivedAt: new Date() }, { validUntil: localDate(-1) }]) {
          const original = await db("estimates").where({ id: fixture.binding.estimateId }).first();
          await db("estimates").where({ id: original.id }).update(patch);
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), EstimateDraftConflictError);
          await db("estimates").where({ id: original.id }).update({
            version: original.version, status: original.status, archivedAt: original.archivedAt, validUntil: original.validUntil,
          });
        }
        assert.equal((await db("leadActivity").where({ leadId: fixture.leadId })).length, fixture.activityCount);
      });
      await check("suggestions bind source operation, actor, workspace and exact parent rather than trusting a supplied event", async () => {
        const fixture = await leadSuggestionFixture();
        const unrelated = await leadSuggestionFixture();
        await assert.rejects(readEstimateLeadStageReview(db, identity(), enabled, fixture.binding), EstimateDraftConflictError);
        await assert.rejects(readEstimateLeadStageReview(db, identity("office"), enabled, { ...fixture.binding, sourceSubmissionId: randomUUID() }), EstimateDraftConflictError);
        await assert.rejects(readEstimateLeadStageReview(db, identity("office"), enabled, { ...fixture.binding, sourceSubmissionId: unrelated.sendId }), EstimateDraftConflictError);
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...fixture.command, leadId }), AuthorizationAccessError);
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...fixture.command, workspaceId: randomUUID() }), AuthorizationAccessError);
        const job = await queueEmail();
        const source = await db("estimate_operation_receipts").where({ estimateId: job.estimateId, operation: "send" }).first();
        await assert.rejects(readEstimateLeadStageReview(db, identity(), enabled, {
          workspaceId, estimateId: job.estimateId, sourceSubmissionId: source.submissionId, expectedEstimateVersion: source.version,
        }), AuthorizationAccessError);
        const receipt = await db("estimate_operation_receipts").where({ submissionId: fixture.sendId }).first();
        for (const operation of ["publish", "resend"]) {
          await db("estimate_operation_receipts").where({ submissionId: fixture.sendId }).update({ operation });
          await assert.rejects(readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding), EstimateDraftConflictError);
        }
        await db("estimate_operation_receipts").where({ submissionId: fixture.sendId }).update({ operation: receipt.operation });
      });
      await check("Declined corrections only offer Lost for an outcome change, not metadata-only edits or Accepted", async () => {
        const fixture = await leadSuggestionFixture("accepted");
        await assert.rejects(readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding), EstimateDraftConflictError);
        let review = await readEstimateDecisionReview(db, identity("office"), enabled, fixture.binding.estimateId);
        for (const previousOutcome of ["accepted", "declined"]) {
          const sourceSubmissionId = randomUUID();
          const receipt = await recordEstimateDecision(db, identity("office"), enabled, {
            workspaceId, estimateId: fixture.binding.estimateId, expectedVersion: review.estimate.version,
            snapshotHash: review.snapshotHash, submissionId: sourceSubmissionId, mode: "correct",
            expectedDecisionId: review.estimate.decision!.id, outcome: "declined", decisionDate: review.today,
            channel: "email", note: "Metadata correction", reason: "Correct recorded outcome or metadata.",
          });
          const binding = { ...fixture.binding, sourceSubmissionId, expectedEstimateVersion: receipt.version };
          assert.equal((await readEstimateLeadStageReview(db, identity("office"), enabled, binding)).target,
            previousOutcome === "accepted" ? "lost" : null);
          if (previousOutcome === "declined") {
            await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...fixture.command, ...binding, to: "lost" }), EstimateDraftConflictError);
          }
          review = await readEstimateDecisionReview(db, identity("office"), enabled, fixture.binding.estimateId);
        }
      });
      await check("suggestions reauthorize independent read/move grants, assigned ownership, membership and retry access", async () => {
        const fixture = await leadSuggestionFixture();
        for (const permission of ["estimates.read", "leads.read", "leads.stage.update"]) {
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled.filter(p => p !== permission), fixture.command), AuthorizationAccessError);
        }
        const grant = { workspaceId, role: "office", permission: "leads.stage.update" };
        const previous = await db("workspaceRolePolicies").where(grant).first();
        try {
          await db("workspaceRolePolicies").where(grant).delete();
          assert.equal((await readEstimateLeadStageReview(db, identity("office"), enabled, fixture.binding)).lead.canMove, false);
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), AuthorizationAccessError);
        } finally { await db("workspaceRolePolicies").insert(previous); }
        const readGrant = { workspaceId, role: "office", permission: "leads.read" };
        try {
          await db("workspaceRolePolicies").where(readGrant).update({ scope: "assigned" });
          await db("workspaceRolePolicies").where(grant).update({ scope: "assigned" });
          await db("leads").where({ id: fixture.leadId }).update({ ownerId: users.owner });
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), AuthorizationAccessError);
        } finally {
          await db("workspaceRolePolicies").where(readGrant).update({ scope: "workspace" });
          await db("workspaceRolePolicies").where(grant).update({ scope: previous.scope });
          await db("leads").where({ id: fixture.leadId }).update({ ownerId: users.office });
        }
        await confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command);
        const membership = await db("workspaceMemberships").where({ workspaceId, userId: users.office }).first();
        try {
          await db("workspaceMemberships").where({ workspaceId, userId: users.office }).delete();
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command), AuthorizationAccessError);
        } finally { await db("workspaceMemberships").insert(membership); }
      });
      await check("competing stage suggestions create one activity; retry IDs cannot be repurposed across contexts", async () => {
        const fixture = await leadSuggestionFixture("declined");
        const results = await Promise.allSettled([
          confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command),
          confirmEstimateLeadStage(db, identity("office"), enabled, { ...fixture.command, submissionId: randomUUID() }),
        ]);
        assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
        const activity = await db("leadActivity").where({ leadId: fixture.leadId });
        assert.equal(activity.length, fixture.activityCount + 1);
        const winner = activity.find(row => row.changes.estimateSuggestion?.estimateId === fixture.binding.estimateId);
        assert.ok(winner);
        const command = { ...fixture.command, submissionId: winner.id };
        await confirmEstimateLeadStage(db, identity("office"), enabled, command);
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...command, reason: "Changed request" }), EstimateDraftConflictError);
        const second = await leadSuggestionFixture("declined");
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, { ...second.command, submissionId: winner.id }), EstimateDraftConflictError);
        const generic = await leadSuggestionFixture();
        await moveLeadStage(db, identity("office"), enabled, {
          workspaceId, leadId: generic.leadId, expectedVersion: generic.command.expectedLeadVersion, to: "estimate-sent", submissionId: generic.command.submissionId,
        });
        await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, generic.command), EstimateDraftConflictError);
      });
      await check("failure saving the estimate binding rolls back the existing lead mutation and activity", async () => {
        const fixture = await leadSuggestionFixture();
        const before = await db("leads").where({ id: fixture.leadId }).first();
        const constraint = `estimate_stage_${randomUUID().replaceAll("-", "")}`;
        try {
          await db.raw(`ALTER TABLE "leadActivity" ADD CONSTRAINT "${constraint}" CHECK (id <> '${fixture.command.submissionId}'::uuid OR NOT jsonb_exists(changes, 'estimateSuggestion'))`);
          await assert.rejects(confirmEstimateLeadStage(db, identity("office"), enabled, fixture.command));
          assert.deepEqual(await db("leads").where({ id: fixture.leadId }).first(), before);
          assert.equal((await db("leadActivity").where({ leadId: fixture.leadId })).length, fixture.activityCount);
        } finally { await db.raw(`ALTER TABLE "leadActivity" DROP CONSTRAINT IF EXISTS "${constraint}"`); }
      });
  }

  await check("related reads use exact parents, current revisions and explicit hidden history", async () => {
    const input = { workspaceId, recordType: "job" as const, recordId: jobId, page: 1, includeHidden: false };
    const result = await readRelatedEstimates(db, identity(), enabled, input);
    assert.equal(result.total, 3);
    assert.equal(result.canCreate, true);
    assert.equal(result.rows.length, 3);
    assert(result.rows.every(row => row.parent.type === "job" && row.href.includes(`workspace=${workspaceId}`)));
    assert(result.rows.every(row => !row.archived && row.status !== "superseded"));
    const hidden = await readRelatedEstimates(db, identity(), enabled, { ...input, includeHidden: true });
    assert.equal(hidden.total, 5);
    assert(hidden.rows.some(row => row.archived));
    assert(hidden.rows.some(row => row.status === "superseded"));
    assert.notEqual(hidden.readVersion, result.readVersion);
    const lead = await readRelatedEstimates(db, identity(), enabled, { ...input, recordType: "lead", recordId: leadId });
    assert.deepEqual(lead.rows.map(row => row.name), ["Lead estimate"]);
    const customer = await readRelatedEstimates(db, identity(), enabled, { ...input, recordType: "customer", recordId: customerId });
    assert.equal(customer.total, 3);
    try {
      await db("leads").where({ id: leadId }).update({ customerId });
      const linked = await readRelatedEstimates(db, identity(), enabled, { ...input, recordType: "customer", recordId: customerId });
      assert.equal(linked.total, 4);
      assert(linked.rows.some(row => row.parent.type === "lead"));
    } finally { await db("leads").where({ id: leadId }).update({ customerId: null }); }
  });

  await check("related reads reject forged tenants/parents, disabled grants and Field customer access", async () => {
    const input = { workspaceId, recordType: "job" as const, recordId: jobId, page: 1, includeHidden: false };
    for (const patch of [{ workspaceId: randomUUID() }, { recordId: randomUUID() }, { recordType: "lead" as const }]) {
      await assert.rejects(readRelatedEstimates(db, identity(), enabled, { ...input, ...patch }), AuthorizationAccessError);
    }
    await assert.rejects(readRelatedEstimates(db, identity(), enabled.filter(p => p !== "estimates.read"), input), AuthorizationAccessError);
    await assert.rejects(readRelatedEstimates(db, identity("field"), enabled, { ...input, recordType: "customer", recordId: customerId }), AuthorizationAccessError);
    const field = await readRelatedEstimates(db, identity("field"), enabled, input);
    assert.equal(field.total, 3);
    try {
      await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
      await assert.rejects(readRelatedEstimates(db, identity("field"), enabled, input), AuthorizationAccessError);
      await db("jobTeamMembers").insert({ workspaceId, jobId, userId: users.field });
      assert.equal((await readRelatedEstimates(db, identity("field"), enabled, input)).total, 3);
    } finally {
      await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
      await db("jobTeamMembers").where({ workspaceId, jobId, userId: users.field }).delete();
    }
  });

  await check("related customer counts and creation sources enforce independent parent and estimate scopes", async () => {
    const policies = await db("workspaceRolePolicies").where({ workspaceId, role: "office" });
    const input = { workspaceId, recordType: "customer" as const, recordId: customerId, page: 1, includeHidden: false };
    try {
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
        .whereNotIn("permission", ["customers.read", "leads.read", "jobs.read", "estimates.read", "estimates.create"]).delete();
      await db("leads").where({ id: leadId }).update({ customerId });
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
        .whereIn("permission", ["jobs.read", "leads.read"]).update({ scope: "assigned" });
      let result = await readRelatedEstimates(db, identity("office"), enabled, input);
      assert.equal(result.total, 0); assert.equal(result.canCreate, false);
      await db("jobTeamMembers").insert({ workspaceId, jobId, userId: users.office });
      result = await readRelatedEstimates(db, identity("office"), enabled, input);
      assert.equal(result.total, 3); assert.equal(result.canCreate, true);
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" })
        .whereIn("permission", ["estimates.read", "estimates.create"]).update({ scope: "assigned_job" });
      assert.equal((await readRelatedEstimates(db, identity("office"), enabled, input)).total, 3);
      await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.create" }).delete();
      assert.equal((await readRelatedEstimates(db, identity("office"), enabled, input)).canCreate, false);
    } finally {
      await db("leads").where({ id: leadId }).update({ customerId: null });
      await db("jobTeamMembers").where({ workspaceId, jobId, userId: users.office }).delete();
      await db("workspaceRolePolicies").where({ workspaceId, role: "office" }).delete();
      await db("workspaceRolePolicies").insert(policies);
    }
  });

  await check("related pagination is bounded/stable and its read version changes before cached rows can be appended", async () => {
    const ids: string[] = [];
    const input = { workspaceId, recordType: "job" as const, recordId: jobId, page: 1, includeHidden: false };
    try {
      for (let index = 0; index < 12; index++) ids.push((await addEstimate({
        name: `Related paging ${index}`, status: "draft", parentType: "job", jobId,
        ownerId: users.owner, totalCents: index === 0 ? 0 : null,
      })).id);
      const first = await readRelatedEstimates(db, identity(), enabled, input);
      const second = await readRelatedEstimates(db, identity(), enabled, { ...input, page: 2 });
      assert.equal(first.total, 15); assert.equal(first.rows.length, 10); assert.equal(second.rows.length, 5);
      assert.equal(first.readVersion, second.readVersion);
      assert.equal(new Set([...first.rows, ...second.rows].map(row => row.id)).size, 15);
      assert([...first.rows, ...second.rows].some(row => row.totalCents === 0));
      assert([...first.rows, ...second.rows].some(row => row.totalCents === null));
      await db("estimates").where({ id: ids[0] }).increment("version", 1);
      assert.notEqual((await readRelatedEstimates(db, identity(), enabled, input)).readVersion, first.readVersion);
      await db("estimates").whereIn("id", ids).delete();
      const clamped = await readRelatedEstimates(db, identity(), enabled, { ...input, page: 100 });
      assert.equal(clamped.page, 1); assert.equal(clamped.total, 3);
    } finally { await db("estimates").whereIn("id", ids).delete(); }
  });

  await check("customer parent selection includes only linked, readable and creatable records, including closed Jobs", async () => {
    const input = { workspaceId, customerId, type: "job" as const, q: "" };
    const original = await db("jobs").where({ id: jobId }).first("status");
    try {
      const sources = await readEstimateCustomerSources(db, identity(), enabled, customerId);
      assert.equal(sources.canReadLeads, false); assert.equal(sources.canReadJobs, true);
      await db("jobs").where({ id: jobId }).update({ status: "completed" });
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, input))[0].id, jobId);
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, { ...input, q: "%_" })).length, 0);
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, { ...input, q: "Fixture" })).length, 1);
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, { ...input, type: "lead" })).length, 0);
      await db("leads").where({ id: leadId }).update({ customerId });
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, { ...input, type: "lead" }))[0].id, leadId);
      await db("leads").where({ id: leadId }).update({ archivedAt: new Date() });
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, { ...input, type: "lead" })).length, 0);
      await db("customers").where({ id: customerId }).update({ archivedAt: new Date() });
      assert.equal((await readEstimateCustomerParents(db, identity(), enabled, input)).length, 0);
      await assert.rejects(readEstimateCreationSeed(db, identity(), enabled, "job", jobId, customerId), AuthorizationAccessError);
      assert.equal((await readRelatedEstimates(db, identity(), enabled, {
        workspaceId, recordType: "customer", recordId: customerId, page: 1, includeHidden: false,
      })).total, 4);
    } finally {
      await db("customers").where({ id: customerId }).update({ archivedAt: null });
      await db("leads").where({ id: leadId }).update({ customerId: null, archivedAt: null });
      await db("jobs").where({ id: jobId }).update(original);
    }
    await assert.rejects(readEstimateCustomerParents(db, identity(), enabled, { ...input, customerId: randomUUID() }), AuthorizationAccessError);
    await assert.rejects(readEstimateCustomerParents(db, identity("field"), enabled, input), AuthorizationAccessError);
  });

  await check("customer creation navigation is read-only and save rejects a changed customer relationship", async () => {
    const seed = await readEstimateCreationSeed(db, identity(), enabled, "job", jobId, customerId);
    assert.equal(seed.creationCustomerId, customerId); assert.equal(seed.estimate, null);
    await assert.rejects(readEstimateCreationSeed(db, identity(), enabled, "lead", leadId, customerId), AuthorizationAccessError);
    try {
      await db("leads").where({ id: leadId }).update({ customerId });
      assert.equal((await readEstimateCreationSeed(db, identity(), enabled, "lead", leadId, customerId)).creationCustomerId, customerId);
    } finally { await db("leads").where({ id: leadId }).update({ customerId: null }); }
    const count = Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n);
    const values = {
      details: { name: "Customer context Draft", recipientName: "", recipientEmail: "", serviceAddress: "", ownerId: "" },
      items: [], totals: { discount: { type: "none" as const }, taxRate: "0" },
      terms: { message: "", validUntil: "", paymentTerms: "", termsNote: "", deposit: { type: "none" as const } },
      scope: "", internalNotes: "",
    };
    await assert.rejects(createEstimateDraft(db, identity(), enabled, {
      workspaceId, submissionId: randomUUID(), parentType: "lead", parentId: leadId, customerId, values,
    }), AuthorizationAccessError);
    assert.equal(Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n), count);
    const command = { workspaceId, submissionId: randomUUID(), parentType: "job", parentId: jobId, customerId, values };
    const saved = await createEstimateDraft(db, identity(), enabled, command);
    assert.deepEqual(await createEstimateDraft(db, identity(), enabled, command), saved);
    await db("estimate_operation_receipts").where({ workspaceId, estimateId: saved.id }).delete();
    await db("estimates").where({ id: saved.id }).delete();
  });

  await check("new-lead warnings include current Published estimates but exclude expired, archived and superseded families", async () => {
    const ids: string[] = [];
    try {
      for (const [name, status, validUntil, archivedAt] of [
        ["Published warning", "published", localDate(1), null],
        ["Expired warning", "sent", localDate(-1), null],
        ["Archived warning", "draft", null, new Date()],
      ] as const) ids.push((await addEstimate({ name, status, validUntil, archivedAt, parentType: "lead", leadId, ownerId: users.owner, totalCents: 0 })).id);
      const old = await addEstimate({ name: "Older open warning", status: "sent", validUntil: localDate(1), parentType: "lead", leadId, ownerId: users.owner, totalCents: 0 });
      ids.push(old.id);
      ids.push((await addEstimate({ name: "Latest closed warning", status: "declined", parentType: "lead", leadId, ownerId: users.owner, totalCents: 0, estimateNumber: old.estimateNumber, revision: 2 })).id);
      const seed = await readEstimateCreationSeed(db, identity(), enabled, "lead", leadId);
      assert(seed.existingEstimates.some(row => row.id === ids[0] && row.status === "published"));
      assert(!seed.existingEstimates.some(row => ids.slice(1).includes(row.id)));
    } finally { await db("estimates").whereIn("id", ids).delete(); }
  });

  await check("editor uses the workspace-local effective expired status", async () => {
    const expired = await addEstimate({
      status: "sent",
      parentType: "job",
      ownerId: users.field,
      name: "Expired editor estimate",
      totalCents: 10000,
      validUntil: localDate(-1),
      jobId,
    });
    const seed = await readEstimateEditor(db, identity(), enabled, expired.id);
    assert.equal(seed.estimate?.status, "expired");
    assert.equal(seed.estimate?.number, `EST-${String(expired.estimateNumber).padStart(4, "0")}`);
  });

  await check("draft create/read/update supports unassigned and legacy owner values", async () => {
    const creation = await readEstimateCreationSeed(db, identity(), enabled, "job", jobId);
    assert.equal(creation.parent?.id, jobId);
    assert.equal(creation.capabilities.create, true);
    const values = {
      details: {
        name: "Editable estimate",
        recipientName: "",
        recipientEmail: "",
        serviceAddress: "",
        ownerId: "",
      },
      items: [],
      totals: { discount: { type: "none" as const }, taxRate: "0" },
      terms: {
        message: "",
        validUntil: "",
        paymentTerms: "",
        termsNote: "",
        deposit: { type: "none" as const },
      },
      scope: "",
      internalNotes: "",
    };
    const created = await createEstimateDraft(db, identity(), enabled, {
      workspaceId,
      submissionId: randomUUID(),
      parentType: "job",
      parentId: jobId,
      values,
    });
    const read = await readEstimateEditor(db, identity(), enabled, created.id);
    assert.equal(read.estimate?.number, created.number);
    assert.equal(read.estimate?.values.details.ownerId, "");
    const updated = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId,
      estimateId: created.id,
      expectedVersion: created.version,
      values,
    });
    assert.equal(updated.version, created.version + 1);
    await assert.rejects(
      updateEstimateDraft(db, identity(), enabled, {
        workspaceId,
        estimateId: created.id,
        expectedVersion: created.version,
        values,
      }),
      EstimateDraftConflictError,
    );
  });

  await check("owner can create a draft estimate from an authorized lead", async () => {
    const profile = {
      name: "Estimate Fixture Business",
      address: "1 Fixture Avenue",
      phone: "555-0100",
      email: "estimates@example.test",
      licenseLine: "Fixture license",
      logoPath: null,
      requireServiceAddress: false,
      validForDays: "45",
      taxRate: "8.875",
      deposit: { type: "none" as const },
      paymentPresets: [{
        id: "standard",
        label: "Standard",
        text: "Due upon completion.",
      }],
      message: "Thank you for considering us.",
      termsNote: "Work is subject to site access.",
    };
    const savedProfile = await saveEstimateBusinessProfile(db, identity(), enabled, {
      workspaceId,
      expectedVersion: 1,
      profile,
    });
    assert.equal(savedProfile.version, 2);
    assert.equal(savedProfile.profile.requireServiceAddress, false);
    assert.equal(savedProfile.profile.paymentPresets[0]?.id, "standard");
    await assert.rejects(
      saveEstimateBusinessProfile(db, identity(), enabled, {
        workspaceId,
        expectedVersion: 1,
        profile,
      }),
      EstimateBusinessProfileConflict,
    );
    const reloaded = await readEstimateBusinessProfile(db, identity(), enabled);
    assert.equal(reloaded.canManage, true);
    assert.equal(reloaded.record.version, 2);

    const creation = await readEstimateCreationSeed(db, identity(), enabled, "lead", leadId);
    assert.equal(creation.parent?.id, leadId);
    assert.equal(creation.capabilities.create, true);
    assert.deepEqual(creation.paperBusiness, {
      name: "Estimate Fixture Business",
      address: "1 Fixture Avenue",
      phone: "555-0100",
      email: "estimates@example.test",
      licenseLine: "Fixture license",
      logoPath: null,
      requireServiceAddress: false,
    });
    assert.equal(creation.defaults.taxRate, "8.875");
    assert.equal(creation.defaults.validUntil, localDate(45));
    assert.equal(creation.defaults.message, profile.message);
    assert.equal(creation.defaults.termsNote, profile.termsNote);
    assert.deepEqual(creation.paymentPresets, profile.paymentPresets);
    const materialId = randomUUID();
    await db("materialCatalog").insert({
      id: materialId,
      workspaceId,
      name: "Copper pipe",
      unit: "ft",
      priceCents: 400,
    });
    const created = await createEstimateDraft(db, identity(), enabled, {
      workspaceId,
      submissionId: randomUUID(),
      parentType: "lead",
      parentId: leadId,
      values: {
        details: {
          name: "Lead estimate",
          recipientName: "",
          recipientEmail: "",
          serviceAddress: "",
          ownerId: users.owner,
        },
        items: [{
          description: "Copper pipe",
          quantity: "1",
          unitPrice: "4.00",
          taxable: false,
          included: false,
          catalog: { id: materialId, name: "Copper pipe", unit: "ft", sku: "" },
        }],
        totals: { discount: { type: "none" }, taxRate: "0" },
        terms: {
          message: "",
          validUntil: "",
          paymentTerms: "",
          termsNote: "",
          deposit: { type: "none" },
        },
        scope: "",
        internalNotes: "",
      },
    });
    const saved = await readEstimateEditor(db, identity(), enabled, created.id);
    assert.equal(saved.estimate?.parent.type, "lead");
    assert.equal(saved.estimate?.parent.id, leadId);
    assert.equal(saved.estimate?.values.items[0]?.catalog?.id, materialId);
    assert.equal(saved.estimate?.values.items[0]?.catalog?.name, "Copper pipe");
  });

  await check("business logos are sanitized, saved and cleaned when staging expires", async () => {
    const current = await readEstimateBusinessProfile(db, identity(), enabled);
    const png = await sharp({
      create: {
        width: 24,
        height: 18,
        channels: 4,
        background: { r: 10, g: 60, b: 120, alpha: 1 },
      },
    }).png().toBuffer();
    const staged = await uploadEstimateBusinessLogo(
      db,
      rehearsalStorage,
      identity(),
      enabled,
      current.record.version,
      { type: "image/png", data: png },
    );
    const saved = await saveEstimateBusinessProfile(db, identity(), enabled, {
      workspaceId,
      expectedVersion: current.record.version,
      profile: { ...current.record.profile, logoPath: staged.logoPath },
    });
    assert.equal(saved.version, current.record.version + 1);
    assert.equal(saved.profile.logoPath, staged.logoPath);
    const creation = await readEstimateCreationSeed(db, identity(), enabled, "lead", leadId);
    assert.equal(creation.paperBusiness.logoPath, staged.logoPath);
    assert.equal(creation.paperBusiness.requireServiceAddress, false);
    const logoId = staged.logoPath.split("/").at(-1)!;
    const logo = await readEstimateBusinessLogo(
      db,
      rehearsalStorage,
      identity(),
      enabled,
      logoId,
    );
    await assert.doesNotReject(sharp(logo).metadata());
    const settingsOnlyPermissions = enabled.filter(
      permission => permission !== "estimates.read",
    );
    await assert.doesNotReject(readEstimateBusinessLogo(
      db,
      rehearsalStorage,
      identity(),
      settingsOnlyPermissions,
      logoId,
    ));

    const orphan = await uploadEstimateBusinessLogo(
      db,
      rehearsalStorage,
      identity(),
      enabled,
      saved.version,
      { type: "image/png", data: png },
    );
    const orphanId = orphan.logoPath.split("/").at(-1)!;
    await db("files")
      .where({ id: orphanId, workspaceId })
      .update({ createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) });
    assert.equal(await cleanupStagedEstimateBusinessLogos(db, rehearsalStorage), 1);
    const orphanRecord = await db("files").where({ id: orphanId, workspaceId }).first("deletedAt");
    assert.ok(orphanRecord?.deletedAt);
  });

  await check("create and duplicate retries return the committed result before parent re-resolution", async () => {
    const submissionId = randomUUID();
    const values = {
      details: {
        name: "Idempotent estimate",
        recipientName: "",
        recipientEmail: "",
        serviceAddress: "",
        ownerId: users.owner,
      },
      items: [],
      totals: { discount: { type: "none" as const }, taxRate: "0" },
      terms: {
        message: "",
        validUntil: "",
        paymentTerms: "",
        termsNote: "",
        deposit: { type: "none" as const },
      },
      scope: "",
      internalNotes: "",
    };
    const input = { workspaceId, submissionId, parentType: "job" as const, parentId: jobId, values };
    const created = await createEstimateDraft(db, identity(), enabled, input);
    await db("jobs").where({ workspaceId, id: jobId }).update({ title: "Updated fixture title" });
    const retried = await createEstimateDraft(db, identity(), enabled, input);
    assert.equal(retried.id, created.id);
    assert.equal(retried.number, created.number);

    const duplicateInput = {
      workspaceId,
      estimateId: created.id,
      expectedVersion: created.version,
      submissionId: randomUUID(),
    };
    const duplicated = await duplicateEstimate(db, identity(), enabled, duplicateInput);
    await db("jobs").where({ workspaceId, id: jobId }).update({ title: "Updated again" });
    const duplicateRetry = await duplicateEstimate(db, identity(), enabled, duplicateInput);
    assert.equal(duplicateRetry.id, duplicated.id);
    assert.equal(duplicateRetry.number, duplicated.number);

    const deleted = await deleteEstimateDraft(db, identity(), enabled, {
      workspaceId,
      estimateId: duplicated.id,
      expectedVersion: duplicated.version,
      typedConfirmation: duplicated.number,
    });
    assert.equal(deleted.id, duplicated.id);
  });

  await check("sharing rejects stale versions, changed profile and denied confirmations without side effects", async () => {
    const draft = await sharingDraft();
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.deepEqual(review.issues, []);
    assert.ok(review.snapshotHash);
    const request = {
      mode: "publish", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      snapshotHash: review.snapshotHash, submissionId: randomUUID(),
    };
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      ...request, expectedVersion: draft.version + 1,
    }), EstimateDraftConflictError);
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      ...request, snapshotHash: "0".repeat(64),
    }), EstimateDraftConflictError);
    for (const permission of ["estimates.send", "estimates.read"]) {
      await assert.rejects(shareEstimate(db, identity(), enabled.filter(value => value !== permission), request), AuthorizationAccessError);
    }
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      ...request, workspaceId: randomUUID(),
    }), AuthorizationAccessError);
    const current = await readEstimateBusinessProfile(db, identity(), enabled);
    await saveEstimateBusinessProfile(db, identity(), enabled, {
      workspaceId, expectedVersion: current.record.version,
      profile: { ...current.record.profile, name: "Changed fixture business" },
    });
    await assert.rejects(shareEstimate(db, identity(), enabled, request), EstimateDraftConflictError);
    assert.equal((await db("estimate_snapshots").where({ workspaceId, estimateId: draft.id })).length, 0);
    assert.equal((await db("estimate_share_tokens").where({ workspaceId, estimateId: draft.id })).length, 0);
    assert.equal((await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id })).length, 0);
    assert.equal((await db("estimates").where({ workspaceId, id: draft.id }).first()).status, "draft");
  });

  await check("incomplete paper and encryption failure roll back all sharing writes", async () => {
    const draft = await sharingDraft();
    const loaded = await readEstimateEditor(db, identity(), enabled, draft.id);
    assert.ok(loaded.estimate);
    let version = draft.version;
    for (const patch of [
      { items: [] },
      { details: { ...loaded.estimate.values.details, recipientName: "" } },
      { terms: { ...loaded.estimate.values.terms, validUntil: localDate(-1) } },
    ]) {
      const saved = await updateEstimateDraft(db, identity(), enabled, {
        workspaceId, estimateId: draft.id, expectedVersion: version,
        values: { ...loaded.estimate.values, ...patch },
      });
      version = saved.version;
      const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
      assert(review.issues.length > 0);
      await assert.rejects(shareEstimate(db, identity(), enabled, {
        mode: "publish", workspaceId, estimateId: draft.id, expectedVersion: version,
        snapshotHash: review.snapshotHash ?? "0".repeat(64), submissionId: randomUUID(),
      }), EstimateDraftValidationError);
    }
    const saved = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: version, values: loaded.estimate.values,
    });
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    const key = process.env.FILE_MASTER_KEY;
    try {
      delete process.env.FILE_MASTER_KEY;
      await assert.rejects(shareEstimate(db, identity(), enabled, {
        mode: "publish", workspaceId, estimateId: draft.id, expectedVersion: saved.version,
        snapshotHash: review.snapshotHash, submissionId: randomUUID(),
      }), /FILE_MASTER_KEY/);
    } finally {
      if (key !== undefined) process.env.FILE_MASTER_KEY = key;
    }
    for (const table of ["estimate_snapshots", "estimate_share_tokens", "estimate_deliveries"]) {
      assert.equal((await db(table).where({ workspaceId, estimateId: draft.id })).length, 0);
    }
    assert.equal((await db("estimate_activity").where({ workspaceId, estimateId: draft.id, type: "published" })).length, 0);
    assert.equal((await db("estimate_operation_receipts").where({ workspaceId, estimateId: draft.id, operation: "publish" })).length, 0);
    const row = await db("estimates").where({ workspaceId, id: draft.id }).first();
    assert.equal(row.status, "draft");
    assert.equal(row.version, saved.version);
  });

  let publishedId = "";
  let publishedToken = "";
  let publishedHash = "";
  let frozenLogo: string | null = null;
  await check("concurrent Publish retries commit one private snapshot, encrypted link and receipt without email", async () => {
    const draft = await sharingDraft();
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.ok(review.snapshotHash);
    const request = {
      mode: "publish", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      snapshotHash: review.snapshotHash, submissionId: randomUUID(),
    };
    const [first, second] = await Promise.all([
      shareEstimate(db, identity(), enabled, request), shareEstimate(db, identity(), enabled, request),
    ]);
    assert.deepEqual(first, second);
    assert.equal(first.status, "published");
    assert.equal(first.version, draft.version + 1);
    const snapshots = await db("estimate_snapshots").where({ workspaceId, estimateId: draft.id });
    const tokens = await db("estimate_share_tokens").where({ workspaceId, estimateId: draft.id });
    assert.equal(snapshots.length, 1);
    assert.equal(tokens.length, 1);
    assert.equal((await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id })).length, 0);
    const text = JSON.stringify(snapshots[0].content);
    assert(!text.includes("STAFF_ONLY") && !text.includes(jobId) && !text.includes(users.owner));
    assert.equal(snapshots[0].content.content.paymentTerms, "Due within 60 days.");
    assert.equal(snapshots[0].content.content.termsNote, "Customer terms.");
    assert.equal(snapshots[0].content.amounts.totalCents, 10000);
    assert.equal(snapshots[0].content.amounts.depositCents, 2500);
    const link = await readEstimateCustomerLink(db, identity(), enabled, draft.id);
    const token = link.path.slice("/e/".length);
    assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(createHash("sha256").update(token).digest("hex"), tokens[0].tokenHash);
    assert(!JSON.stringify(tokens[0]).includes(token));
    const expiry = await db.raw(`SELECT
      to_char(?::timestamptz AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI:SS') AS local,
      to_char(?::date + 1, 'YYYY-MM-DD') AS next`, [tokens[0].expiresAt, review.draft!.validUntil]);
    assert.equal(expiry.rows[0].local, `${expiry.rows[0].next} 00:00:00`);
    await assert.rejects(db("estimate_snapshots").where({ id: snapshots[0].id }).update({ contentHash: "0".repeat(64) }), /immutable/);
    await assert.rejects(shareEstimate(db, identity(), enabled, { ...request, snapshotHash: "0".repeat(64) }), EstimateDraftConflictError);
    await assert.rejects(shareEstimate(db, identity(), enabled.filter(value => value !== "estimates.send"), request), AuthorizationAccessError);
    await assert.rejects(shareEstimate(db, identity("office"), enabled, request), EstimateDraftConflictError);
    publishedId = draft.id;
    publishedToken = token;
    publishedHash = first.snapshotHash;
    frozenLogo = snapshots[0].content.content.business.logoPath;
  });

  await check("frozen staff and public reads survive profile/logo replacement and deduplicate first view", async () => {
    const current = await readEstimateBusinessProfile(db, identity(), enabled);
    await saveEstimateBusinessProfile(db, identity(), enabled, {
      workspaceId, expectedVersion: current.record.version,
      profile: { ...current.record.profile, name: "Another fixture business", logoPath: null },
    });
    const staff = await readEstimateSharingReview(db, identity(), enabled, publishedId);
    assert.equal(staff.paper?.snapshotHash, publishedHash);
    assert.equal(staff.paper?.content.business.name, "Changed fixture business");
    assert.equal(staff.paper?.content.business.logoPath, frozenLogo);
    assert.ok(frozenLogo);
    const assistantDetail = await readEstimateAssistantDetail(
      db,
      identity(),
      enabled,
      publishedId,
    );
    assert.equal(assistantDetail.source, "frozen_snapshot");
    assert.equal(assistantDetail.totals.totalCents, 10000);
    assert.equal(assistantDetail.lineItems[0].amountCents, 10000);
    assert.equal(
      JSON.stringify(assistantDetail).includes("STAFF_ONLY_SHARING_FIXTURE"),
      false,
    );
    assert.equal(JSON.stringify(assistantDetail).includes("payments.example.test"), false);
    const staffLogo = await readEstimateSnapshotLogo(db, rehearsalStorage, identity(), enabled, publishedId);
    const publicLogo = await readPublicEstimateLogo(db, rehearsalStorage, publishedToken, publicRequester);
    assert.equal(publicLogo.state, "ready");
    if (publicLogo.state !== "ready") throw new Error("Expected captured logo.");
    assert.deepEqual(publicLogo.image, staffLogo);
    assert.equal((await sharp(publicLogo.image).metadata()).format, "webp");
    const [one, two] = await Promise.all([
      readPublicEstimate(db, publishedToken, publicRequester),
      readPublicEstimate(db, publishedToken, publicRequester),
    ]);
    assert.equal(one.state, "ready");
    assert.deepEqual(one, two);
    const token = await db("estimate_share_tokens").where({ workspaceId, estimateId: publishedId }).first();
    assert.equal(token.viewCount, 2);
    assert(token.firstViewedAt);
    const activities = await db("estimate_activity").where({ workspaceId, estimateId: publishedId, type: "viewed" });
    assert.equal(activities.length, 1);
    const viewNotices = await db("estimateNotifications").where({
      workspaceId, estimateId: publishedId, event: "viewed",
    });
    assert.deepEqual(new Set(viewNotices.map(notice => notice.userId)), new Set([users.owner, users.field]));
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.owner });
    await assert.rejects(readEstimateCustomerLink(db, identity("field"), enabled, publishedId), AuthorizationAccessError);
    await assert.rejects(readEstimateSharingReview(db, identity("field"), enabled, publishedId), AuthorizationAccessError);
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.field });
  });

  await check("Estimate notifications use current read access, suppress self-alerts, and honor email preferences", async () => {
    await db("estimateNotifications").where({ workspaceId, emailStatus: "queued" }).update({ emailStatus: "skipped" });
    const sent = await queueEmail();
    const sentNotices = await db("estimateNotifications").where({ workspaceId, estimateId: sent.estimateId, event: "sent" });
    assert.equal(sentNotices.length, 1);
    assert.equal(sentNotices[0].userId, users.field);
    const fieldNotice = (await readNotifications(db, identity("field"), enabled)).items
      .find(item => item.kind === "estimate" && item.estimateId === sent.estimateId);
    assert(fieldNotice?.kind === "estimate");
    assert.deepEqual(Object.keys(fieldNotice).sort(), [
      "createdAt", "estimateId", "estimateName", "estimateNumber", "event", "id", "kind", "read", "status",
    ]);
    assert.equal(fieldNotice.event, "sent");
    const number = await db("estimates").where({ workspaceId, id: sent.estimateId }).first("estimateNumber");
    assert.equal(fieldNotice.estimateNumber, `EST-${String(number.estimateNumber).padStart(4, "0")}`);
    assert.equal(fieldNotice.status, "sent");
    await markNotificationRead(db, identity("field"), enabled, fieldNotice.id);
    assert.equal((await readNotifications(db, identity("field"), enabled)).items
      .find(item => item.kind === "estimate" && item.id === fieldNotice.id)?.read, true);
    await assert.rejects(markNotificationRead(db, identity("office"), enabled, fieldNotice.id), AuthorizationAccessError);

    await db("users").where({ id: users.field }).update({ emailVerified: true });
    await saveNotificationPreferences(db, identity("field"), enabled, {
      leadAssignedEmail: true, visitChangedEmail: false, estimateEmail: false,
    });
    await saveNotificationPreferences(db, identity("field"), enabled, {
      leadAssignedEmail: false, estimateEmail: true,
    });
    const preferences = await readNotificationPreferences(db, identity("field"), enabled);
    assert.equal(preferences.leadAssignedEmail, false);
    assert.equal(preferences.visitChangedEmail, false);
    assert.equal(preferences.estimateEmail, true);

    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.owner });
    assert(!(await readNotifications(db, identity("field"), enabled)).items
      .some(item => item.kind === "estimate" && item.estimateId === sent.estimateId));
    await assert.rejects(markNotificationRead(db, identity("field"), enabled, fieldNotice.id), AuthorizationAccessError);
    const accessResult = await processEstimateNotificationEmails(db, enabled, async () => {
      throw new Error("A recipient who lost access must not receive mail.");
    }, 100);
    assert(accessResult.skipped > 0);
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.field });

    await db("estimateNotifications").where({ workspaceId, emailStatus: "queued" }).update({ emailStatus: "skipped" });
    const optedOut = await queueEmail();
    const optedOutNotice = await db("estimateNotifications").where({
      workspaceId, estimateId: optedOut.estimateId, userId: users.field, event: "sent",
    }).first();
    assert(optedOutNotice);
    await saveNotificationPreferences(db, identity("field"), enabled, {
      leadAssignedEmail: true, estimateEmail: false,
    });
    const optedOutResult = await processEstimateNotificationEmails(db, enabled, async () => {
      throw new Error("An opted-out recipient must not receive mail.");
    });
    assert.equal(optedOutResult.skipped, 1);
    assert.equal((await db("estimateNotifications").where({ id: optedOutNotice.id }).first()).emailStatus, "skipped");

    await db("estimateNotifications").where({ workspaceId, emailStatus: "queued" }).update({ emailStatus: "skipped" });
    const deliverable = await queueEmail();
    const deliverableNotice = await db("estimateNotifications").where({
      workspaceId, estimateId: deliverable.estimateId, userId: users.field, event: "sent",
    }).first();
    assert(deliverableNotice);
    await saveNotificationPreferences(db, identity("field"), enabled, {
      leadAssignedEmail: true, estimateEmail: true,
    });
    let delivered: EstimateNotificationEmail | undefined;
    const deliveredResult = await processEstimateNotificationEmails(db, enabled, async mail => { delivered = mail; });
    assert.equal(deliveredResult.sent, 1);
    assert(delivered);
    assert.equal(delivered.estimateId, deliverable.estimateId);
    assert.equal(delivered.status, "sent");
    assert.equal((await db("estimateNotifications").where({ id: deliverableNotice.id }).first()).emailStatus, "sent");

    await db("estimateNotifications").where({ workspaceId, emailStatus: "queued" }).update({ emailStatus: "skipped" });
    const retryable = await queueEmail();
    const retryNotice = await db("estimateNotifications").where({
      workspaceId, estimateId: retryable.estimateId, userId: users.field, event: "sent",
    }).first();
    assert(retryNotice);
    const firstAttempt = await processEstimateNotificationEmails(db, enabled, async () => {
      throw new Error("Temporary notification transport failure.");
    });
    assert.equal(firstAttempt.retryPending, 1);
    const pending = await db("estimateNotifications").where({ id: retryNotice.id }).first();
    assert.equal(pending.emailStatus, "queued");
    assert.equal(pending.attempts, 1);
    await db("estimateNotifications").where({ id: retryNotice.id }).update({ nextAttemptAt: new Date(0) });
    const replayed: string[] = [];
    const retryResult = await processEstimateNotificationEmails(db, enabled, async mail => { replayed.push(mail.id); });
    assert.equal(retryResult.sent, 1);
    assert.deepEqual(replayed, [retryNotice.id]);
    assert.equal((await db("estimateNotifications").where({ id: retryNotice.id }).first()).attempts, 2);
  });

  await check("payment links persist, validate, affect review hashes, freeze for delivery and clear on duplicate", async () => {
    const link = "https://payments.example.test/checkout?token=fictional&estimate=one";
    const draft = await sharingDraft("payment@example.test", link);
    const loaded = await readEstimateEditor(db, identity(), enabled, draft.id);
    assert(loaded.estimate);
    assert.equal(loaded.estimate.values.paymentLink, link);
    const legacyValues = { ...loaded.estimate.values };
    delete legacyValues.paymentLink;
    const legacyUpdate = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version, values: legacyValues,
    });
    assert.equal((await readEstimateEditor(db, identity(), enabled, draft.id)).estimate?.values.paymentLink, link);
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.equal(review.draftPaper?.content.paymentLink, link);
    await assert.rejects(updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: legacyUpdate.version,
      values: { ...loaded.estimate.values, paymentLink: "javascript:alert(1)" },
    }));
    const changed = link + "-changed";
    const updated = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: legacyUpdate.version,
      values: { ...loaded.estimate.values, paymentLink: changed },
    });
    const fresh = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.notEqual(fresh.snapshotHash, review.snapshotHash);
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      mode: "send", workspaceId, estimateId: draft.id, expectedVersion: updated.version,
      snapshotHash: review.snapshotHash, submissionId: randomUUID(),
      recipientEmail: "delivery@example.test", subject: fresh.subject,
    }), EstimateDraftConflictError);
    const sent = await shareEstimate(db, identity(), enabled, {
      mode: "send", workspaceId, estimateId: draft.id, expectedVersion: updated.version,
      snapshotHash: fresh.snapshotHash, submissionId: randomUUID(),
      recipientEmail: "delivery@example.test", subject: fresh.subject,
    });
    const duplicate = await duplicateEstimate(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: sent.version, submissionId: randomUUID(),
    });
    assert.equal((await readEstimateEditor(db, identity(), enabled, duplicate.id)).estimate?.values.paymentLink, "");
    // Mutable row edits must never be used to render an already captured customer paper or email.
    await db("estimates").where({ workspaceId, id: draft.id }).update({ paymentLink: "https://payments.example.test/not-frozen" });
    const frozen = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.equal(frozen.paper?.content.paymentLink, changed);
    const path = await readEstimateCustomerLink(db, identity(), enabled, draft.id);
    const publicPaper = await readPublicEstimate(db, path.path.slice(3), publicRequester);
    assert.equal(publicPaper.state, "ready");
    if (publicPaper.state === "ready") assert.equal(publicPaper.snapshot.content.paymentLink, changed);
    const delivered: EstimateEmailDelivery[] = [];
    await processEstimateEmails(db, enabled, async input => {
      delivered.push(input); return { providerMessageId: "payment-link-fixture" };
    });
    assert.equal(delivered.find(input => input.to === "delivery@example.test")?.paymentLink, changed);
  });

  await check("Send is retry-safe; queued resend is denied and a corrected destination never edits frozen paper", async () => {
    const draft = await sharingDraft("original@example.test");
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.ok(review.snapshotHash);
    const request = {
      mode: "send", workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      snapshotHash: review.snapshotHash, submissionId: randomUUID(),
      recipientEmail: "delivery-only@example.test", subject: review.subject,
    };
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      ...request, subject: "Unexpected changed subject",
    }), EstimateDraftConflictError);
    const first = await shareEstimate(db, identity(), enabled, request);
    assert.deepEqual(await shareEstimate(db, identity(), enabled, request), first);
    let deliveries = await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id });
    assert.equal(deliveries.length, 1);
    assert.equal(deliveries[0].status, "queued");
    const resend = {
      ...request, mode: "resend", expectedVersion: first.version, submissionId: randomUUID(),
      recipientEmail: "corrected@example.test",
    };
    await assert.rejects(shareEstimate(db, identity(), enabled, resend), EstimateDraftValidationError);
    // Rehearse a completed first delivery without calling an email provider.
    await db("estimate_deliveries").where({ id: deliveries[0].id }).update({ status: "sent", sentAt: new Date() });
    const second = await shareEstimate(db, identity(), enabled, resend);
    assert.deepEqual(await shareEstimate(db, identity(), enabled, resend), second);
    deliveries = await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id }).orderBy("queuedAt");
    assert.equal(deliveries.length, 2);
    assert.deepEqual(deliveries.map(row => row.recipient), ["delivery-only@example.test", "corrected@example.test"]);
    assert.equal((await db("estimate_snapshots").where({ workspaceId, estimateId: draft.id })).length, 1);
    const frozen = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    assert.equal(frozen.paper?.content.recipientEmail, "original@example.test");
    assert.equal(frozen.paper?.version, first.version);
    assert.equal(frozen.estimate.version, second.version);
  });

  await check("inactive public links withhold paper for expiry, revocation, void, supersession and workspace deletion", async () => {
    const tokenQuery = () => db("estimate_share_tokens").where({ workspaceId, estimateId: publishedId });
    const original = await tokenQuery().first();
    await tokenQuery().update({ expiresAt: new Date(Date.now() - 1000) });
    assert.deepEqual(await readPublicEstimate(db, publishedToken, publicRequester), { state: "expired" });
    assert.deepEqual(await readPublicEstimateLogo(db, rehearsalStorage, publishedToken, publicRequester), { state: "expired" });
    await tokenQuery().update({ expiresAt: original.expiresAt, revokedAt: new Date() });
    assert.deepEqual(await readPublicEstimate(db, publishedToken, publicRequester), { state: "revoked" });
    await tokenQuery().update({ revokedAt: null });
    for (const [status, state] of [["void", "withdrawn"], ["superseded", "replaced"]] as const) {
      await db("estimates").where({ workspaceId, id: publishedId }).update({ status });
      assert.deepEqual(await readPublicEstimate(db, publishedToken, publicRequester), { state });
    }
    await db("estimates").where({ workspaceId, id: publishedId }).update({ status: "published" });
    await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
    assert.deepEqual(await readPublicEstimate(db, publishedToken, publicRequester), { state: "not-found" });
    await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });

  await check("public lookup rate limit includes malformed tokens and allows exactly sixty requests", async () => {
    const key = `${publicRequester}-limit`;
    for (let index = 0; index < 60; index++) {
      assert.deepEqual(await readPublicEstimate(db, "invalid", key), { state: "not-found" });
    }
    assert.deepEqual(await readPublicEstimate(db, "invalid", key), { state: "rate-limited" });
    await db("rateLimits").where({ key: rateLimitKeys[1] }).update({ lastRequest: Date.now() - 60_001 });
    assert.deepEqual(await readPublicEstimate(db, "invalid", key), { state: "not-found" });
    assert.equal((await db("rateLimits").where({ key: rateLimitKeys[1] }).first()).count, 1);
  });

  await check("link expiry follows workspace midnight across both daylight-saving transitions", async () => {
    const year = Number(localDate(0).slice(0, 4)) + 1;
    for (const { month, sunday, utcHour } of [
      { month: 2, sunday: 2, utcHour: "04" }, { month: 10, sunday: 1, utcHour: "05" },
    ]) {
      const first = new Date(Date.UTC(year, month, 1));
      const day = 1 + (7 - first.getUTCDay()) % 7 + 7 * (sunday - 1);
      const date = new Date(Date.UTC(year, month, day));
      const validUntil = date.toISOString().slice(0, 10);
      date.setUTCDate(day + 1);
      const nextDate = date.toISOString().slice(0, 10);
      const draft = await sharingDraft();
      const loaded = await readEstimateEditor(db, identity(), enabled, draft.id);
      assert.ok(loaded.estimate);
      const updated = await updateEstimateDraft(db, identity(), enabled, {
        workspaceId, estimateId: draft.id, expectedVersion: draft.version,
        values: { ...loaded.estimate.values, terms: { ...loaded.estimate.values.terms, validUntil } },
      });
      const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
      await shareEstimate(db, identity(), enabled, {
        mode: "publish", workspaceId, estimateId: draft.id, expectedVersion: updated.version,
        snapshotHash: review.snapshotHash, submissionId: randomUUID(),
      });
      const token = await db("estimate_share_tokens").where({ workspaceId, estimateId: draft.id }).first();
      assert.equal(token.expiresAt.toISOString(), `${nextDate}T${utcHour}:00:00.000Z`);
    }
  });

  await processEstimateEmails(db, enabled, async () => ({ providerMessageId: "fixture-previous" }));
  const accept = async () => ({ providerMessageId: "fixture-accepted" });
  await check("delivery claims serialize concurrent workers and use frozen content after profile changes", async () => {
    const queued = await queueEmail();
    const business = await readEstimateBusinessProfile(db, identity(), enabled);
    const originalName = business.record.profile.name;
    await saveEstimateBusinessProfile(db, identity(), enabled, {
      workspaceId, expectedVersion: business.record.version,
      profile: { ...business.record.profile, name: "LATER_PROFILE_DO_NOT_SEND" },
    });
    const sent: EstimateEmailDelivery[] = [];
    const send = async (mail: EstimateEmailDelivery) => {
      sent.push(mail); await new Promise(resolve => setTimeout(resolve, 30)); return accept();
    };
    const results = await Promise.all([
      processEstimateEmails(db, enabled, send), processEstimateEmails(db, enabled, send),
    ]);
    assert.equal(results.reduce((sum, result) => sum + result.sent, 0), 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].businessName, originalName);
    assert.equal(sent[0].totalCents, 10000);
    assert.equal(sent[0].to, "delivery-fixture@example.test");
    assert.ok(!JSON.stringify(sent[0]).includes("STAFF_ONLY"));
    const row = await db("estimate_deliveries").where({ id: queued.delivery.id }).first();
    assert.equal(row.status, "sent"); assert.equal(row.attemptCount, 1);
    assert.equal(row.providerMessageId, "fixture-accepted"); assert.ok(row.sentAt);
  });
  await check("delivery retries at one, two, four and eight minutes, then fails on attempt five", async () => {
    const queued = await queueEmail();
    const query = () => db("estimate_deliveries").where({ id: queued.delivery.id });
    const reject = async () => { throw new Error("PRIVATE_TRANSPORT_DETAILS"); };
    for (let attempt = 1; attempt <= 5; attempt++) {
      const before = Date.now();
      const result = await processEstimateEmails(db, enabled, reject);
      const row = await query().first();
      assert.equal(row.attemptCount, attempt);
      if (attempt < 5) {
        assert.equal(result.retryPending, 1); assert.equal(row.status, "queued");
        const delay = 60_000 * 2 ** (attempt - 1);
        assert.ok(row.nextAttemptAt.getTime() >= before + delay);
        assert.ok(row.nextAttemptAt.getTime() <= Date.now() + delay);
        assert.deepEqual(await processEstimateEmails(db, enabled, reject), { sent: 0, retryPending: 0, failed: 0 });
        const review = await readEstimateSharingReview(db, identity(), enabled, queued.estimateId);
        assert.ok(review.delivery.email.state === "queued");
        assert.equal(review.delivery.email.attemptCount, attempt);
        assert.ok(review.delivery.email.nextAttemptAt);
        await query().update({ nextAttemptAt: new Date(Date.now() - 1000) });
      } else {
        assert.equal(result.failed, 1); assert.equal(row.status, "failed");
        assert.equal(row.failureCode, "transport"); assert.ok(row.failedAt);
        assert.equal(await db("estimateNotifications").where({
          workspaceId, estimateId: queued.estimateId, event: "delivery_failed", userId: users.field,
        }).count("* as n").then(result => Number(result[0].n)), 1);
        const review = await readEstimateSharingReview(db, identity(), enabled, queued.estimateId);
        assert.ok(review.delivery.email.state === "failed");
        assert.match(review.delivery.email.failureMessage ?? "", /five attempts/);
        assert.ok(!JSON.stringify(review.delivery).includes("PRIVATE_TRANSPORT"));
      }
    }
  });
  await check("a transient delivery failure is retried using the same delivery and corrected recipient", async () => {
    const queued = await queueEmail();
    await processEstimateEmails(db, enabled, async () => { throw new Error("temporary"); });
    await db("estimate_deliveries").where({ id: queued.delivery.id }).update({ nextAttemptAt: new Date(Date.now() - 1000) });
    let count = 0;
    await processEstimateEmails(db, enabled, async mail => {
      assert.equal(mail.id, queued.delivery.id); assert.equal(mail.to, "delivery-fixture@example.test");
      count++; return accept();
    });
    assert.equal(count, 1);
    const row = await db("estimate_deliveries").where({ id: queued.delivery.id }).first();
    assert.equal(row.attemptCount, 2); assert.equal(row.status, "sent");
  });
  await check("delivery rechecks read/send authorization and requester membership before transport", async () => {
    for (const permission of ["estimates.read", "estimates.send"]) {
      const queued = await queueEmail();
      let calls = 0;
      const result = await processEstimateEmails(db, enabled.filter(value => value !== permission),
        async () => { calls++; return accept(); });
      assert.equal(calls, 0); assert.equal(result.failed, 1);
      assert.equal((await db("estimate_deliveries").where({ id: queued.delivery.id }).first()).failureCode, "authorization");
    }
    const queued = await queueEmail();
    await db("estimate_deliveries").where({ id: queued.delivery.id }).update({ requestedBy: users.office });
    const membership = await db("workspaceMemberships").where({ workspaceId, userId: users.office }).first();
    await db("workspaceMemberships").where({ workspaceId, userId: users.office }).delete();
    const result = await processEstimateEmails(db, enabled, async () => { assert.fail("Unauthorized transport"); });
    assert.equal(result.failed, 1);
    await db("workspaceMemberships").insert(membership);
  });
  await check("delivery refuses expired/revoked links and archived/decided/replaced estimates", async () => {
    for (const patch of [
      { status: "accepted" }, { status: "declined" }, { status: "void" }, { status: "superseded" },
      { archivedAt: new Date() },
    ]) {
      const queued = await queueEmail();
      await db("estimates").where({ id: queued.estimateId }).update(patch);
      assert.equal((await processEstimateEmails(db, enabled, async () => { assert.fail("Inactive transport"); })).failed, 1);
    }
    for (const patch of [{ revokedAt: new Date() }, { expiresAt: new Date(Date.now() - 1000) }]) {
      const queued = await queueEmail();
      await db("estimate_share_tokens").where({ estimateId: queued.estimateId }).update(patch);
      assert.equal((await processEstimateEmails(db, enabled, async () => { assert.fail("Inactive transport"); })).failed, 1);
    }
  });
  await check("delivery fails closed on invalid recovery tokens, deleted requesters and workspaces", async () => {
    const invalid = await queueEmail();
    await db("estimate_share_tokens").where({ estimateId: invalid.estimateId }).update({ encryptedToken: "invalid" });
    await processEstimateEmails(db, enabled, async () => { assert.fail("Invalid token transport"); });
    assert.equal((await db("estimate_deliveries").where({ id: invalid.delivery.id }).first()).failureCode, "invalid");
    const missing = await queueEmail();
    await db("estimate_deliveries").where({ id: missing.delivery.id }).update({ requestedBy: null });
    assert.equal((await processEstimateEmails(db, enabled, async () => { assert.fail("Deleted actor transport"); })).failed, 1);
    await queueEmail();
    await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
    assert.equal((await processEstimateEmails(db, enabled, async () => { assert.fail("Deleted workspace transport"); })).failed, 1);
    await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: null });
  });

  await check("withdrawal is atomic, idempotent and preserves frozen records while stopping retry mail", async () => {
    const queued = await queueEmail();
    const token = await readEstimateCustomerLink(db, identity(), enabled, queued.estimateId);
    const hashBefore = await db("estimate_snapshots").where({ workspaceId, estimateId: queued.estimateId }).first("contentHash", "content");
    await db("estimate_deliveries").where({ id: queued.delivery.id }).update({
      attemptCount: 1, nextAttemptAt: new Date(Date.now() + 60_000),
    });
    const command = {
      workspaceId, estimateId: queued.estimateId, expectedVersion: 2, submissionId: randomUUID(),
      reason: "  PRIVATE_WITHDRAWAL_REASON  ",
    };
    const receipts = await Promise.all([voidEstimate(db, identity(), enabled, command), voidEstimate(db, identity(), enabled, command)]);
    assert.deepEqual(receipts[0], receipts[1]);
    assert.equal(receipts[0].version, 3);
    const row = await db("estimates").where({ id: queued.estimateId }).first();
    assert.equal(row.status, "void"); assert.equal(row.voidReason, "PRIVATE_WITHDRAWAL_REASON");
    const mail = await db("estimate_deliveries").where({ id: queued.delivery.id }).first();
    assert.equal(mail.status, "failed"); assert.equal(mail.failureCode, "inactive"); assert.equal(mail.attemptCount, 1);
    assert.ok((await db("estimate_share_tokens").where({ estimateId: queued.estimateId }).first()).revokedAt);
    assert.deepEqual(await db("estimate_snapshots").where({ workspaceId, estimateId: queued.estimateId }).first("contentHash", "content"), hashBefore);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: queued.estimateId });
    assert.equal(history.estimate.status, "void");
    assert.equal(history.events.filter(event => event.kind === "voided").length, 1);
    assert.ok(history.events.some(event => event.kind === "delivery-failed"));
    assert.ok(JSON.stringify(history).includes("PRIVATE_WITHDRAWAL_REASON"));
    assert.ok(!JSON.stringify(history).includes("STAFF_ONLY_SHARING_FIXTURE"));
    assert.deepEqual(await readPublicEstimate(db, token.path.slice(3), publicRequester), { state: "withdrawn" });
    assert.deepEqual(await readPublicEstimateLogo(db, rehearsalStorage, token.path.slice(3), publicRequester), { state: "withdrawn" });
    await assert.rejects(readEstimateCustomerLink(db, identity(), enabled, queued.estimateId), AuthorizationAccessError);
    await assert.rejects(voidEstimate(db, identity(), enabled, { ...command, reason: "Different request" }), EstimateDraftConflictError);
    await assert.rejects(voidEstimate(db, identity(), enabled.filter(p => p !== "estimates.void"), command), AuthorizationAccessError);
    await processEstimateEmails(db, enabled, async () => { assert.fail("Withdrawn transport"); });
  });
  await check("Published withdrawal works for Office and leaves no email or Job side effects", async () => {
    const draft = await sharingDraft();
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    await shareEstimate(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, mode: "publish", submissionId: randomUUID(), expectedVersion: 1, snapshotHash: review.snapshotHash,
    });
    const token = await readEstimateCustomerLink(db, identity(), enabled, draft.id);
    const jobsBefore = await db("jobs").where({ workspaceId }).count({ n: "*" }).first();
    const result = await voidEstimate(db, identity("office"), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: 2, submissionId: randomUUID(), reason: "Office withdrawal",
    });
    assert.equal(result.status, "void");
    assert.deepEqual(await db("jobs").where({ workspaceId }).count({ n: "*" }).first(), jobsBefore);
    assert.equal((await db("estimate_deliveries").where({ workspaceId, estimateId: draft.id })).length, 0);
    assert.deepEqual(await readPublicEstimate(db, token.path.slice(3), publicRequester), { state: "withdrawn" });
  });
  await check("withdrawal rejects invalid states, stale versions, denied roles and cross-workspace access without writes", async () => {
    const queued = await queueEmail();
    const command = { workspaceId, estimateId: queued.estimateId, expectedVersion: 2, submissionId: randomUUID(), reason: "Valid reason" };
    await assert.rejects(voidEstimate(db, identity("field"), enabled, command), AuthorizationAccessError);
    await assert.rejects(voidEstimate(db, identity(), enabled.filter(p => p !== "estimates.read"), command), AuthorizationAccessError);
    await assert.rejects(voidEstimate(db, identity(), enabled, { ...command, workspaceId: randomUUID() }), AuthorizationAccessError);
    await assert.rejects(voidEstimate(db, { ...identity(), workspaceId: randomUUID() }, enabled, command), AuthorizationAccessError);
    await assert.rejects(voidEstimate(db, identity(), enabled, { ...command, expectedVersion: 1 }), EstimateDraftConflictError);
    for (const reason of ["", " ", "x".repeat(501)]) await assert.rejects(voidEstimate(db, identity(), enabled, { ...command, reason }));
    for (const patch of [
      { status: "draft" }, { status: "accepted" }, { status: "declined" }, { status: "superseded" },
      { status: "void" }, { status: "expired" }, { archivedAt: new Date() }, { validUntil: localDate(-1) },
    ]) {
      await db("estimates").where({ id: queued.estimateId }).update({ status: "sent", archivedAt: null, validUntil: localDate(5), ...patch });
      await assert.rejects(voidEstimate(db, identity(), enabled, command), EstimateDraftValidationError);
    }
    assert.equal((await db("estimate_operation_receipts").where({ workspaceId, submissionId: command.submissionId })).length, 0);
    assert.equal((await db("estimate_activity").where({ workspaceId, estimateId: queued.estimateId, type: "voided" })).length, 0);
    assert.equal((await db("estimate_share_tokens").where({ estimateId: queued.estimateId }).first()).revokedAt, null);
    await db("estimates").where({ id: queued.estimateId }).update({ status: "sent", validUntil: localDate(5) });
    await voidEstimate(db, identity(), enabled, command);
  });
  await check("withdrawal serializes behind an in-flight SMTP submission and cannot recall accepted mail", async () => {
    const queued = await queueEmail();
    let release!: () => void;
    let started!: () => void;
    const entered = new Promise<void>(resolve => { started = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const order: string[] = [];
    const worker = processEstimateEmails(db, enabled, async () => {
      started(); await gate; order.push("smtp"); return accept();
    });
    await entered;
    const withdrawal = voidEstimate(db, identity(), enabled, {
      workspaceId, estimateId: queued.estimateId, expectedVersion: 2, submissionId: randomUUID(), reason: "After submission",
    }).then(receipt => { order.push("void"); return receipt; });
    release();
    await Promise.all([worker, withdrawal]);
    assert.deepEqual(order, ["smtp", "void"]);
    const mail = await db("estimate_deliveries").where({ id: queued.delivery.id }).first();
    assert.equal(mail.status, "sent"); assert.ok(mail.sentAt);
    assert.equal((await db("estimates").where({ id: queued.estimateId }).first()).status, "void");
  });
  await check("public reads and competing confirmations serialize with withdrawal", async () => {
    const queued = await queueEmail();
    const token = await readEstimateCustomerLink(db, identity(), enabled, queued.estimateId);
    const command = { workspaceId, estimateId: queued.estimateId, expectedVersion: 2, submissionId: randomUUID(), reason: "Concurrent withdrawal" };
    const results = await Promise.allSettled([
      voidEstimate(db, identity(), enabled, command),
      voidEstimate(db, identity(), enabled, { ...command, submissionId: randomUUID() }),
      readPublicEstimate(db, token.path.slice(3), publicRequester),
    ]);
    assert.equal(results.slice(0, 2).filter(r => r.status === "fulfilled").length, 1);
    const loser = results.slice(0, 2).find(r => r.status === "rejected");
    assert.ok(loser?.status === "rejected" && loser.reason instanceof EstimateDraftConflictError);
    const publicResult = results[2];
    assert.ok(publicResult.status === "fulfilled" && ["ready", "withdrawn"].includes(publicResult.value.state));
    assert.deepEqual(await readPublicEstimate(db, token.path.slice(3), publicRequester), { state: "withdrawn" });
    await processEstimateEmails(db, enabled, async () => { assert.fail("Void-first transport"); });
  });
  await check("staff history is bounded, full-precision paged and reauthorized without private payload leakage", async () => {
    const draft = await sharingDraft();
    const input = { workspaceId, estimateId: draft.id };
    await db("estimate_activity").insert(Array.from({ length: 60 }, (_, i) => ({
      id: randomUUID(), workspaceId, estimateId: draft.id, actorId: users.owner, actorName: "Fixture owner",
      source: "ui", type: "draft.saved", changes: JSON.stringify({
        fields: ["scope", "paymentLink"], scope: "PRIVATE_SCOPE_PAYLOAD", paymentLink: "PRIVATE_PAYMENT_URL",
      }),
      createdAt: db.raw(`'2000-01-01T00:00:00Z'::timestamptz + (? * interval '1 microsecond')`, [i]),
    })));
    let page = await readEstimateLifecycle(db, identity(), enabled, input);
    assert.equal(page.total, 61); assert.equal(page.events.length, 25);
    assert.equal(page.canVoid, true);
    const ids = page.events.map(event => event.id);
    while (page.nextCursor) {
      page = await readEstimateLifecycle(db, identity(), enabled, { ...input, before: page.nextCursor });
      assert.ok(page.events.length <= 25);
      ids.push(...page.events.map(event => event.id));
      assert.ok(!JSON.stringify(page).includes("PRIVATE_"));
    }
    assert.equal(ids.length, 61); assert.equal(new Set(ids).size, 61);
    const field = await readEstimateLifecycle(db, identity("field"), enabled, input);
    assert.equal(field.canVoid, false);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
    await assert.rejects(readEstimateLifecycle(db, identity("field"), enabled, input), AuthorizationAccessError);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
    await assert.rejects(readEstimateLifecycle(db, identity(), enabled.filter(p => p !== "estimates.read"), input), AuthorizationAccessError);
    await assert.rejects(readEstimateLifecycle(db, identity(), enabled, { ...input, workspaceId: randomUUID() }), AuthorizationAccessError);
  });

  await check("archive and restore change only archive metadata/version and preserve closed customer paper, decisions and Jobs", async () => {
    const command = await archiveFixture();
    const estimateId = command.estimateId;
    const rowBefore = await db("estimates").where({ id: estimateId }).first();
    const snapshots = await db("estimate_snapshots").where({ estimateId });
    const decisions = await db("estimate_decisions").where({ estimateId });
    const tokens = await db("estimate_share_tokens").where({ estimateId });
    const deliveries = await db("estimate_deliveries").where({ estimateId });
    const items = await db("estimate_items").where({ estimateId }).orderBy("id");
    const jobBefore = await db("jobs").where({ id: jobId }).first();
    const token = await readEstimateCustomerLink(db, identity(), enabled, estimateId);
    const [archived, retry] = await Promise.all([
      setEstimateArchived(db, identity("office"), enabled, command),
      setEstimateArchived(db, identity("office"), enabled, command),
    ]);
    assert.deepEqual(archived, retry);
    assert.equal(archived.archived, true); assert.equal(archived.version, command.expectedVersion + 1);
    const rowArchived = await db("estimates").where({ id: estimateId }).first();
    assert.ok(rowArchived.archivedAt instanceof Date); assert.equal(rowArchived.archivedBy, users.office);
    assert.deepEqual(rowArchived, {
      ...rowBefore, archivedAt: rowArchived.archivedAt, archivedBy: users.office,
      version: archived.version, updatedAt: new Date(archived.updatedAt),
    });
    const restore = { ...command, mode: "restore", expectedVersion: archived.version, submissionId: randomUUID() };
    const restored = await setEstimateArchived(db, identity(), enabled, restore);
    assert.deepEqual(await setEstimateArchived(db, identity(), enabled, restore), restored);
    assert.equal(restored.archived, false); assert.equal(restored.version, archived.version + 1);
    assert.deepEqual(await db("estimates").where({ id: estimateId }).first(), {
      ...rowBefore, version: restored.version, updatedAt: new Date(restored.updatedAt),
    });
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId }), snapshots);
    assert.deepEqual(await db("estimate_decisions").where({ estimateId }), decisions);
    assert.deepEqual(await db("estimate_share_tokens").where({ estimateId }), tokens);
    assert.deepEqual(await db("estimate_deliveries").where({ estimateId }), deliveries);
    assert.deepEqual(await db("estimate_items").where({ estimateId }).orderBy("id"), items);
    assert.deepEqual(await db("jobs").where({ id: jobId }).first(), jobBefore);
    assert.equal((await readPublicEstimate(db, token.path.slice(3), publicRequester)).state, "ready");
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId });
    assert.equal(history.events.filter(event => event.kind === "archived").length, 1);
    assert.equal(history.events.filter(event => event.kind === "restored").length, 1);
    assert.equal(history.events.find(event => event.kind === "archived")?.source.type, "ui");
    assert.ok(!JSON.stringify(history).includes("STAFF_ONLY_SHARING_FIXTURE"));
  });
  await check("archive eligibility accepts closed states and workspace-effective expiry but never persists a fabricated status", async () => {
    for (const status of ["declined", "expired", "superseded", "void"]) {
      const source = await revisionFixture();
      await db("estimates").where({ id: source.estimateId }).update({ status });
      const receipt = await setEstimateArchived(db, identity(), enabled, {
        workspaceId, estimateId: source.estimateId, expectedVersion: source.expectedVersion,
        submissionId: randomUUID(), mode: "archive",
      });
      assert.equal(receipt.archived, true);
      assert.equal((await db("estimates").where({ id: source.estimateId }).first()).status, status);
    }
    const source = await revisionFixture();
    await db("estimates").where({ id: source.estimateId }).update({ validUntil: localDate(-1) });
    const base = {
      workspaceId, estimateId: source.estimateId, expectedVersion: source.expectedVersion, submissionId: randomUUID(),
    };
    const receipt = await setEstimateArchived(db, identity(), enabled, { ...base, mode: "archive" });
    assert.equal((await db("estimates").where({ id: source.estimateId }).first()).status, "published");
    assert.equal((await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: source.estimateId })).estimate.status, "expired");
    await expireEstimates(db);
    const persisted = await db("estimates").where({ id: source.estimateId }).first();
    assert.equal(persisted.status, "expired"); assert.equal(persisted.version, receipt.version + 1);
    assert.ok(persisted.archivedAt);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...base, mode: "archive" }), EstimateDraftConflictError);
  });
  await check("archive rejects active states, stale confirmations and redundant archive/restore without side effects", async () => {
    const command = await archiveFixture();
    for (const status of ["draft", "sent", "published", "accepted"]) {
      await db("estimates").where({ id: command.estimateId }).update({ status, validUntil: localDate(5) });
      const before = await db("estimates").where({ id: command.estimateId }).first();
      await assert.rejects(setEstimateArchived(db, identity(), enabled, command), EstimateDraftValidationError);
      assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), before);
    }
    await db("estimates").where({ id: command.estimateId }).update({ status: "declined" });
    await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...command, expectedVersion: command.expectedVersion - 1 }), EstimateDraftConflictError);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...command, mode: "restore" }), EstimateDraftValidationError);
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: command.submissionId })).length, 0);
    const archived = await setEstimateArchived(db, identity(), enabled, command);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, {
      ...command, expectedVersion: archived.version, submissionId: randomUUID(),
    }), EstimateDraftValidationError);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "archived" })).length, 1);
  });
  await check("archive and restore reauthorize role, current grants, membership, workspace and retry access", async () => {
    const command = await archiveFixture();
    const ownerSeed = await readEstimateEditor(db, identity(), enabled, command.estimateId);
    const fieldSeed = await readEstimateEditor(db, identity("field"), enabled, command.estimateId);
    assert.equal(ownerSeed.capabilities.archive, true); assert.equal(fieldSeed.capabilities.archive, false);
    assert.equal((await readEstimates(db, identity(), enabled, { workspaceId })).canArchive, true);
    assert.equal((await readEstimates(db, identity("field"), enabled, { workspaceId })).canArchive, false);
    for (const permission of ["estimates.read", "estimates.archive"]) {
      await assert.rejects(setEstimateArchived(db, identity(), enabled.filter(p => p !== permission), command), AuthorizationAccessError);
    }
    await assert.rejects(setEstimateArchived(db, identity("field"), enabled, command), AuthorizationAccessError);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...command, workspaceId: randomUUID() }), AuthorizationAccessError);
    await assert.rejects(setEstimateArchived(db, { ...identity(), workspaceId: randomUUID() }, enabled, command), AuthorizationAccessError);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...command, estimateId: randomUUID() }), AuthorizationAccessError);
    const archived = await setEstimateArchived(db, identity("office"), enabled, command);
    const restore = { ...command, mode: "restore", expectedVersion: archived.version, submissionId: randomUUID() };
    const grant = { workspaceId, role: "office", permission: "estimates.archive" };
    const previous = await db("workspaceRolePolicies").where(grant).first();
    try {
      await db("workspaceRolePolicies").where(grant).delete();
      assert.equal((await readEstimateEditor(db, identity("office"), enabled, command.estimateId)).capabilities.archive, false);
      assert.equal((await readEstimates(db, identity("office"), enabled, { workspaceId })).canArchive, false);
      await assert.rejects(setEstimateArchived(db, identity("office"), enabled, command), AuthorizationAccessError);
      await assert.rejects(setEstimateArchived(db, identity("office"), enabled, restore), AuthorizationAccessError);
    } finally { await db("workspaceRolePolicies").insert(previous); }
    const membership = await db("workspaceMemberships").where({ workspaceId, userId: users.office }).first();
    try {
      await db("workspaceMemberships").where({ workspaceId, userId: users.office }).delete();
      await assert.rejects(setEstimateArchived(db, identity("office"), enabled, restore), AuthorizationAccessError);
    } finally { await db("workspaceMemberships").insert(membership); }
    try {
      await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
      await assert.rejects(setEstimateArchived(db, identity(), enabled, restore), AuthorizationAccessError);
    } finally { await db("workspaces").where({ id: workspaceId }).update({ deletionRequestedAt: null }); }
    assert.equal((await db("estimates").where({ id: command.estimateId }).first()).version, archived.version);
    await setEstimateArchived(db, identity("office"), enabled, restore);
  });
  await check("competing archive and restore confirmations serialize and replay keys cannot be repurposed", async () => {
    const command = await archiveFixture();
    const results = await Promise.allSettled([
      setEstimateArchived(db, identity(), enabled, command),
      setEstimateArchived(db, identity(), enabled, { ...command, submissionId: randomUUID() }),
    ]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    const rejected = results.find(result => result.status === "rejected");
    assert.ok(rejected?.status === "rejected" && rejected.reason instanceof EstimateDraftConflictError);
    const prior = await db("estimate_operation_receipts").where({ estimateId: command.estimateId, operation: "archive" }).first();
    const winning = { ...command, submissionId: prior.submissionId };
    await assert.rejects(setEstimateArchived(db, identity("office"), enabled, winning), EstimateDraftConflictError);
    for (const patch of [
      { mode: "restore" }, { expectedVersion: command.expectedVersion + 1 }, { estimateId: (await archiveFixture()).estimateId },
    ]) await assert.rejects(setEstimateArchived(db, identity(), enabled, { ...winning, ...patch }), EstimateDraftConflictError);
    const restore = { ...winning, mode: "restore", expectedVersion: prior.version, submissionId: randomUUID() };
    const restored = await Promise.all([
      setEstimateArchived(db, identity(), enabled, restore),
      setEstimateArchived(db, identity(), enabled, restore),
    ]);
    assert.deepEqual(restored[0], restored[1]);
    await assert.rejects(setEstimateArchived(db, identity(), enabled, winning), EstimateDraftConflictError);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "archived" })).length, 1);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "restored" })).length, 1);
  });
  await check("archive receipt failure rolls back metadata and history and allows the same confirmation to retry", async () => {
    const command = await archiveFixture();
    const before = await db("estimates").where({ id: command.estimateId }).first();
    const constraint = `archive_rehearsal_${randomUUID().replaceAll("-", "")}`;
    try {
      // PostgreSQL DDL cannot bind values; Knex quotes this isolated failure fixture.
      await db.raw(db.raw('ALTER TABLE estimate_operation_receipts ADD CONSTRAINT ?? CHECK ("submissionId" <> ?::uuid)',
        [constraint, command.submissionId]).toQuery());
      await assert.rejects(setEstimateArchived(db, identity(), enabled, command), { code: "23514" });
      assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), before);
      assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "archived" })).length, 0);
      assert.equal((await db("estimate_operation_receipts").where({ submissionId: command.submissionId })).length, 0);
    } finally { await db.raw("ALTER TABLE estimate_operation_receipts DROP CONSTRAINT IF EXISTS ??", [constraint]); }
    assert.equal((await setEstimateArchived(db, identity(), enabled, command)).archived, true);
  });
  await check("archive and a concurrent decision correction cannot produce an archived Accepted estimate", async () => {
    const command = await archiveFixture();
    const review = await readEstimateDecisionReview(db, identity(), enabled, command.estimateId);
    assert.ok(review.estimate.decision);
    const correction = {
      workspaceId, estimateId: command.estimateId, expectedVersion: command.expectedVersion,
      submissionId: randomUUID(), snapshotHash: review.snapshotHash, mode: "correct",
      expectedDecisionId: review.estimate.decision.id, outcome: "accepted", decisionDate: review.today,
      channel: "phone", note: "", reason: "Customer clarified the decision",
    };
    const results = await Promise.allSettled([
      setEstimateArchived(db, identity(), enabled, command),
      recordEstimateDecision(db, identity(), enabled, correction),
    ]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    const rejected = results.find(result => result.status === "rejected");
    assert.ok(rejected?.status === "rejected" &&
      (rejected.reason instanceof EstimateDraftConflictError || rejected.reason instanceof EstimateDraftValidationError));
    const row = await db("estimates").where({ id: command.estimateId }).first();
    assert.equal(row.version, command.expectedVersion + 1);
    assert.ok((row.status === "accepted" && row.archivedAt === null) || (row.status === "declined" && row.archivedAt !== null));
  });
  await check("restoring an older revision never changes default latest-revision filtering or revives its replaced link", async () => {
    const source = await revisionFixture();
    const link = await readEstimateCustomerLink(db, identity(), enabled, source.estimateId);
    const draft = await reviseEstimate(db, identity(), enabled, source);
    await publishRevision(draft.id);
    const before = await db("estimates").where({ id: source.estimateId }).first();
    const base = { workspaceId, estimateId: source.estimateId, expectedVersion: before.version, submissionId: randomUUID(), mode: "archive" };
    const archived = await setEstimateArchived(db, identity(), enabled, base);
    const restored = await setEstimateArchived(db, identity(), enabled, {
      ...base, mode: "restore", expectedVersion: archived.version, submissionId: randomUUID(),
    });
    assert.equal(restored.archived, false);
    const number = `EST-${String(before.estimateNumber).padStart(4, "0")}`;
    const visible = await readEstimates(db, identity(), enabled, { workspaceId, q: number, pageSize: 100 });
    assert.ok(!visible.rows.some(row => row.id === source.estimateId));
    assert.ok(visible.rows.some(row => row.id === draft.id));
    const included = await readEstimates(db, identity(), enabled, { workspaceId, q: number, includeHidden: true, pageSize: 100 });
    assert.ok(included.rows.some(row => row.id === source.estimateId && row.status === "superseded" && !row.archived));
    assert.deepEqual(await readPublicEstimate(db, link.path.slice(3), publicRequester), { state: "replaced" });
    const family = await readEstimateRevisionFamily(db, identity(), enabled, { workspaceId, estimateId: source.estimateId });
    assert.equal(family.total, 2); assert.equal(family.revisions.find(row => row.id === source.estimateId)?.archived, false);
  });
  await check("restoring closed records never renews withdrawn, expired or revoked customer links", async () => {
    for (const state of ["withdrawn", "expired", "revoked", "token-expired"]) {
      const command = await archiveFixture();
      const link = await readEstimateCustomerLink(db, identity(), enabled, command.estimateId);
      if (state === "withdrawn" || state === "expired") {
        await db("estimates").where({ id: command.estimateId }).update({ status: state === "withdrawn" ? "void" : "expired" });
      } else {
        await db("estimate_share_tokens").where({ estimateId: command.estimateId })
          .update(state === "revoked" ? { revokedAt: new Date() } : { expiresAt: new Date(Date.now() - 1000) });
      }
      const tokens = await db("estimate_share_tokens").where({ estimateId: command.estimateId });
      const before = await db("estimates").where({ id: command.estimateId }).first();
      const archived = await setEstimateArchived(db, identity(), enabled, command);
      const restored = await setEstimateArchived(db, identity(), enabled, {
        ...command, mode: "restore", expectedVersion: archived.version, submissionId: randomUUID(),
      });
      assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), {
        ...before, version: restored.version, updatedAt: new Date(restored.updatedAt),
      });
      const expected = { state: state === "token-expired" ? "expired" : state };
      assert.deepEqual(await readPublicEstimate(db, link.path.slice(3), publicRequester), expected);
      assert.deepEqual(await readPublicEstimateLogo(db, rehearsalStorage, link.path.slice(3), publicRequester), expected);
      assert.deepEqual(await db("estimate_share_tokens").where({ estimateId: command.estimateId }), tokens);
    }
  });

  await check("recorded acceptance is atomic, frozen-amount based, retry-safe and stops queued mail without revoking links", async () => {
    const command = await decisionFixture();
    const before = await db("estimate_snapshots").where({ estimateId: command.estimateId }).first();
    const tokenBefore = await db("estimate_share_tokens").where({ estimateId: command.estimateId }).first();
    const link = await readEstimateCustomerLink(db, identity(), enabled, command.estimateId);
    const jobsBefore = await db("jobs").where({ workspaceId }).select("*");
    await db("estimates").where({ id: command.estimateId }).update({ totalCents: 1 });
    const results = await Promise.all([
      recordEstimateDecision(db, identity(), enabled, command), recordEstimateDecision(db, identity(), enabled, command),
    ]);
    assert.deepEqual(results[0], results[1]);
    assert.equal(results[0].version, 3); assert.equal(results[0].status, "accepted");
    const row = await db("estimates").where({ id: command.estimateId }).first();
    assert.equal(Number(row.acceptedTotalCents), 10000);
    assert.equal(row.decisionNote, "PRIVATE_DECISION_NOTE");
    assert.equal(await db("estimateNotifications").where({
      workspaceId, estimateId: command.estimateId, event: "decision_recorded", userId: users.field,
    }).count("* as n").then(result => Number(result[0].n)), 1);
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId: command.estimateId }).first(), before);
    const tokenAfter = await db("estimate_share_tokens").where({ estimateId: command.estimateId }).first();
    assert.deepEqual(tokenAfter.expiresAt, tokenBefore.expiresAt); assert.equal(tokenAfter.revokedAt, null);
    assert.equal((await db("estimate_deliveries").where({ estimateId: command.estimateId }).first()).status, "failed");
    await processEstimateEmails(db, enabled, async () => { assert.fail("Decision must stop transport"); });
    const publicPaper = await readPublicEstimate(db, link.path.slice(3), publicRequester);
    assert.equal(publicPaper.state, "ready"); assert.ok(!JSON.stringify(publicPaper).includes("PRIVATE_DECISION_NOTE"));
    assert.deepEqual(await db("jobs").where({ workspaceId }).select("*"), jobsBefore);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 1);
    await assert.rejects(db("estimate_decisions").where({ id: results[0].decisionId }).update({ note: "Rewrite" }), /immutable/);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: command.estimateId });
    assert.equal(history.events.filter(e => e.kind === "decision-recorded").length, 1);
    const metrics = await readEstimates(db, identity(), enabled, { workspaceId });
    assert.ok(BigInt(metrics.metrics.acceptedThisMonthCents) >= 10000n);
    const reviewed = await readEstimateSharingReview(db, identity(), enabled, command.estimateId);
    await assert.rejects(shareEstimate(db, identity(), enabled, {
      ...command, mode: "resend", expectedVersion: 3, submissionId: randomUUID(),
      recipientEmail: "fixture@example.test", subject: reviewed.subject,
    }));
  });
  await check("Office corrections preserve each decision, metadata-only changes and the linked converted Job", async () => {
    const command = await decisionFixture();
    const initial = await recordEstimateDecision(db, identity(), enabled, { ...command, outcome: "declined" });
    await db("jobs").where({ id: jobId }).update({ acceptedEstimateId: command.estimateId });
    const jobBefore = await db("jobs").where({ id: jobId }).first();
    const corrected = {
      ...command, mode: "correct" as const, expectedVersion: 3, expectedDecisionId: initial.decisionId,
      submissionId: randomUUID(), reason: "PRIVATE_CORRECTION_REASON", decisionDate: localDate(-1), note: "Corrected note",
    };
    const receipt = await recordEstimateDecision(db, identity("office"), enabled, corrected);
    assert.equal(receipt.status, "accepted");
    const sameOutcome = await recordEstimateDecision(db, identity("office"), enabled, {
      ...corrected, submissionId: randomUUID(), expectedVersion: 4, expectedDecisionId: receipt.decisionId,
      channel: "email", reason: "Metadata only", note: "Corrected metadata",
    });
    assert.equal(sameOutcome.version, 5);
    const review = await readEstimateDecisionReview(db, identity(), enabled, command.estimateId);
    assert.equal(review.estimate.decision?.channel, "email");
    assert.equal(review.estimate.decision?.decisionDate, localDate(-1));
    assert.ok(review.convertedJob?.href.includes(jobId));
    const restricted = await readEstimateDecisionReview(db, identity(), enabled.filter(p => p !== "jobs.read"), command.estimateId);
    assert.equal(restricted.convertedJob, null);
    const decline = await recordEstimateDecision(db, identity("office"), enabled, {
      ...corrected, outcome: "declined", submissionId: randomUUID(), expectedVersion: 5,
      expectedDecisionId: sameOutcome.decisionId,
    });
    assert.equal(decline.status, "declined");
    assert.equal((await db("estimates").where({ id: command.estimateId }).first()).acceptedTotalCents, null);
    assert.deepEqual(await db("jobs").where({ id: jobId }).first(), jobBefore);
    const entries = await db("estimate_decisions").where({ estimateId: command.estimateId }).orderBy("estimateVersion");
    assert.equal(entries.length, 4);
    assert.equal(entries[0].outcome, "declined"); assert.equal(entries[1].previousDecisionId, entries[0].id);
    assert.equal(entries[2].previousDecisionId, entries[1].id);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: command.estimateId });
    assert.equal(history.events.filter(e => e.kind === "decision-corrected").length, 3);
    assert.ok(JSON.stringify(history).includes("PRIVATE_CORRECTION_REASON"));
    await db("jobs").where({ id: jobId }).update({ acceptedEstimateId: null });
  });
  await check("decisions reject invalid dates, text, states and version/snapshot/decision bindings without writes", async () => {
    const command = await decisionFixture();
    for (const patch of [
      { expectedVersion: 1 }, { snapshotHash: "f".repeat(64) }, { decisionDate: localDate(1) },
      { decisionDate: "2026-02-30" }, { note: " ".repeat(501) }, { channel: "invalid" },
      { expectedDecisionId: randomUUID() }, { acceptedTotalCents: 1 },
    ]) await assert.rejects(recordEstimateDecision(db, identity(), enabled, { ...command, ...patch }));
    for (const patch of [
      { status: "draft" }, { status: "accepted" }, { status: "declined" }, { status: "expired" }, { status: "superseded" },
      { status: "void" }, { archivedAt: new Date() }, { validUntil: localDate(-1) },
    ]) {
      await db("estimates").where({ id: command.estimateId }).update({ status: "sent", archivedAt: null, validUntil: localDate(5), ...patch });
      await assert.rejects(recordEstimateDecision(db, identity(), enabled, command));
    }
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 0);
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: command.submissionId })).length, 0);
    await db("estimates").where({ id: command.estimateId }).update({ status: "sent", validUntil: localDate(5) });
    const receipt = await recordEstimateDecision(db, identity(), enabled, command);
    const correction = { ...command, mode: "correct", expectedDecisionId: receipt.decisionId, expectedVersion: 3, submissionId: randomUUID() };
    for (const reason of ["", " ", " ".repeat(501)]) {
      await assert.rejects(recordEstimateDecision(db, identity(), enabled, { ...correction, reason }));
    }
    await assert.rejects(recordEstimateDecision(db, identity(), enabled, { ...correction, reason: "Reason", expectedDecisionId: randomUUID() }), EstimateDraftConflictError);
  });
  await check("decision permissions recheck membership, workspace, assigned Jobs and the Field correction ceiling", async () => {
    const command = await decisionFixture();
    for (const permission of ["estimates.read", "estimates.decide"]) {
      await assert.rejects(recordEstimateDecision(db, identity(), enabled.filter(p => p !== permission), command), AuthorizationAccessError);
    }
    await assert.rejects(recordEstimateDecision(db, identity(), enabled, { ...command, workspaceId: randomUUID() }), AuthorizationAccessError);
    await assert.rejects(recordEstimateDecision(db, { ...identity(), workspaceId: randomUUID() }, enabled, command), AuthorizationAccessError);
    const fieldReview = await readEstimateDecisionReview(db, identity("field"), enabled, command.estimateId);
    assert.equal(fieldReview.canDecide, true); assert.equal(fieldReview.canCorrectDecision, false);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
    await assert.rejects(recordEstimateDecision(db, identity("field"), enabled, command), AuthorizationAccessError);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
    const receipt = await recordEstimateDecision(db, identity("field"), enabled, command);
    await assert.rejects(recordEstimateDecision(db, identity("field"), enabled, {
      ...command, mode: "correct", expectedVersion: 3, expectedDecisionId: receipt.decisionId, reason: "Wrong", submissionId: randomUUID(),
    }), AuthorizationAccessError);
    await assert.rejects(recordEstimateDecision(db, identity("office"), enabled, command), EstimateDraftConflictError);
    await assert.rejects(recordEstimateDecision(db, identity("field"), enabled.filter(p => p !== "estimates.decide"), command), AuthorizationAccessError);
  });
  await check("workspace date and legitimate zero snapshot totals are authoritative; Field cannot decide lead estimates", async () => {
    const draft = await sharingDraft();
    const editor = await readEstimateEditor(db, identity(), enabled, draft.id);
    const values = editor.estimate!.values;
    const saved = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: 1,
      values: { ...values, items: values.items.map(item => ({ ...item, included: true, unitPrice: "0" })) },
    });
    const paper = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    await shareEstimate(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: saved.version, submissionId: randomUUID(),
      mode: "publish", snapshotHash: paper.snapshotHash,
    });
    await db("workspaces").where({ id: workspaceId }).update({ timezone: "Pacific/Honolulu" });
    try {
      const review = await readEstimateDecisionReview(db, identity(), enabled, draft.id);
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Honolulu" }).format(new Date());
      assert.equal(review.today, today);
      assert.equal(review.estimate.totalCents, 0);
      await recordEstimateDecision(db, identity(), enabled, {
        workspaceId, estimateId: draft.id, submissionId: randomUUID(), expectedVersion: review.estimate.version,
        snapshotHash: review.snapshotHash, expectedDecisionId: null, mode: "record",
        outcome: "accepted", decisionDate: today, channel: "other", note: "",
      });
      const row = await db("estimates").where({ id: draft.id }).first();
      assert.equal(Number(row.acceptedTotalCents), 0);
      assert.equal(new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Honolulu" }).format(row.decidedAt), today);
    } finally { await db("workspaces").where({ id: workspaceId }).update({ timezone: "America/New_York" }); }
    const lead = await createEstimateDraft(db, identity(), enabled, {
      workspaceId, submissionId: randomUUID(), parentType: "lead", parentId: leadId, values,
    });
    const leadPaper = await readEstimateSharingReview(db, identity(), enabled, lead.id);
    await shareEstimate(db, identity(), enabled, {
      workspaceId, estimateId: lead.id, expectedVersion: 1, submissionId: randomUUID(), mode: "publish", snapshotHash: leadPaper.snapshotHash,
    });
    await assert.rejects(recordEstimateDecision(db, identity("field"), enabled, {
      workspaceId, estimateId: lead.id, expectedVersion: 2, submissionId: randomUUID(), snapshotHash: leadPaper.snapshotHash,
      mode: "record", expectedDecisionId: null, outcome: "declined", decisionDate: localDate(0), channel: "other", note: "",
    }), AuthorizationAccessError);
  });
  await check("competing decisions cannot overwrite each other and old receipts cannot undo a correction", async () => {
    const command = await decisionFixture();
    const competing = await Promise.allSettled([
      recordEstimateDecision(db, identity(), enabled, command),
      recordEstimateDecision(db, identity(), enabled, { ...command, outcome: "declined", submissionId: randomUUID() }),
    ]);
    assert.equal(competing.filter(r => r.status === "fulfilled").length, 1);
    const review = await readEstimateDecisionReview(db, identity(), enabled, command.estimateId);
    const previous = review.estimate.decision!;
    await recordEstimateDecision(db, identity(), enabled, {
      ...command, mode: "correct", expectedVersion: 3, expectedDecisionId: previous.id,
      outcome: previous.outcome === "accepted" ? "declined" : "accepted", reason: "Correction", submissionId: randomUUID(),
    });
    await assert.rejects(recordEstimateDecision(db, identity(), enabled, command), EstimateDraftConflictError);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 2);
  });
  await check("unverifiable snapshots fail closed and legacy snapshot payment-link absence stays unchanged", async () => {
    const command = await decisionFixture();
    const before = await db("estimate_snapshots").where({ estimateId: command.estimateId }).first();
    await db("estimate_snapshots").where({ id: before.id }).delete();
    await db("estimate_snapshots").insert({ ...before, content: JSON.stringify(before.content), contentHash: "0".repeat(64) });
    await assert.rejects(recordEstimateDecision(db, identity(), enabled, command), EstimateDraftValidationError);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 0);
    const content = structuredClone(before.content);
    delete content.content.paymentLink;
    const { estimateSnapshotHash } = await import("./sharing-paper");
    const snapshotHash = estimateSnapshotHash(content);
    await db("estimate_snapshots").where({ id: before.id }).delete();
    await db("estimate_snapshots").insert({ ...before, content: JSON.stringify(content), contentHash: snapshotHash });
    await recordEstimateDecision(db, identity(), enabled, { ...command, snapshotHash });
    assert.deepEqual((await db("estimate_snapshots").where({ id: before.id }).first()).content, content);
  });
  await check("decision waits for in-flight SMTP and retains accepted mail and original customer-link expiry", async () => {
    const command = await decisionFixture();
    const token = await db("estimate_share_tokens").where({ estimateId: command.estimateId }).first();
    let release!: () => void;
    let started!: () => void;
    const entered = new Promise<void>(resolve => { started = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const order: string[] = [];
    const worker = processEstimateEmails(db, enabled, async () => { started(); await gate; order.push("smtp"); return accept(); });
    await entered;
    const decision = recordEstimateDecision(db, identity(), enabled, command).then(() => { order.push("decision"); });
    release(); await Promise.all([worker, decision]);
    assert.deepEqual(order, ["smtp", "decision"]);
    assert.equal((await db("estimate_deliveries").where({ estimateId: command.estimateId }).first()).status, "sent");
    assert.deepEqual((await db("estimate_share_tokens").where({ id: token.id }).first()).expiresAt, token.expiresAt);
  });

  await check("revision creation uses frozen values, retains units and requires review of carried payment links", async () => {
    const draft = await sharingDraft("revision-fixture@example.test", "https://payments.example.test/old-amount");
    const editor = await readEstimateEditor(db, identity(), enabled, draft.id);
    const saved = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      values: { ...editor.estimate!.values, items: editor.estimate!.values.items.map(item => ({ ...item, unit: "hr" })) },
    });
    const original = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    const shared = await shareEstimate(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: saved.version, submissionId: randomUUID(),
      snapshotHash: original.snapshotHash, mode: "publish",
    });
    const token = await readEstimateCustomerLink(db, identity(), enabled, draft.id);
    const before = await db("estimate_snapshots").where({ estimateId: draft.id }).first();
    await db("estimates").where({ id: draft.id }).update({ name: "MUTATED_NAME", scope: "MUTATED_SCOPE", totalCents: 999 });
    await db("estimate_items").where({ estimateId: draft.id }).update({ description: "MUTATED_ITEM", unitPriceCents: 999 });
    const command = {
      workspaceId, estimateId: draft.id, expectedVersion: shared.version,
      snapshotHash: shared.snapshotHash, submissionId: randomUUID(),
    };
    const revision = await reviseEstimate(db, identity(), enabled, command);
    assert.equal(revision.number, draft.number); assert.equal(revision.revision, 2);
    const copied = (await readEstimateEditor(db, identity(), enabled, revision.id)).estimate!.values;
    assert.equal(copied.details.name, "Sharing fixture"); assert.equal(copied.scope, "Customer scope");
    assert.equal(copied.items[0].description, "Fixture installation"); assert.equal(copied.items[0].unitPrice, "100.00");
    assert.equal(copied.items[0].unit, "hr"); assert.equal(copied.internalNotes, "");
    assert.equal(copied.paymentLink, "https://payments.example.test/old-amount");
    assert.equal((await readPublicEstimate(db, token.path.slice(3), publicRequester)).state, "ready");
    assert.equal((await db("estimates").where({ id: draft.id }).first()).status, "published");
    const review = await readEstimateSharingReview(db, identity(), enabled, revision.id);
    assert.equal(review.draftPaper!.content.items[0].unit, "hr");
    assert.equal(review.revision!.requiresPaymentLinkReview, true);
    const preparerReview = await readEstimateSharingReview(db, identity(), enabled.filter(p => p !== "estimates.send"), revision.id);
    assert.equal(preparerReview.canSend, false);
    assert.equal(preparerReview.draftPaper!.content.items[0].unit, "hr");
    assert.deepEqual(preparerReview.revision, review.revision);
    const publish = {
      workspaceId, estimateId: revision.id, expectedVersion: revision.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: "publish",
      revisionReview: { sourceEstimateId: draft.id, sourceVersion: shared.version, paymentLinkReviewed: false },
    };
    await assert.rejects(shareEstimate(db, identity(), enabled, publish), /Review the carried payment link/);
    await assert.rejects(shareEstimate(db, identity(), enabled, { ...publish, revisionReview: undefined }), EstimateDraftConflictError);
    assert.equal((await db("estimates").where({ id: draft.id }).first()).status, "published");
    await shareEstimate(db, identity(), enabled, { ...publish, revisionReview: { ...publish.revisionReview, paymentLinkReviewed: true } });
    assert.deepEqual(await readPublicEstimate(db, token.path.slice(3), publicRequester), { state: "replaced" });
    assert.deepEqual(await db("estimate_snapshots").where({ id: before.id }).first(), before);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: draft.id });
    assert.equal(history.events[0].kind, "superseded");
    assert.ok(!JSON.stringify(history).includes("payments.example.test"));
  });
  await check("concurrent Revise opens one pending Draft and deletion never reuses its revision identity", async () => {
    const command = await revisionFixture();
    const token = await readEstimateCustomerLink(db, identity(), enabled, command.estimateId);
    const results = await Promise.all([
      reviseEstimate(db, identity(), enabled, command),
      reviseEstimate(db, identity(), enabled, { ...command, submissionId: randomUUID() }),
    ]);
    assert.equal(results[0].id, results[1].id);
    assert.equal((await reviseEstimate(db, identity(), enabled, command)).id, results[0].id);
    const source = await db("estimates").where({ id: command.estimateId }).first();
    await assert.rejects(db("estimates").insert({
      id: randomUUID(), workspaceId, estimateNumber: source.estimateNumber, sourceEstimateId: source.id,
      revision: 1, name: "Competing Draft", parentType: "job", jobId,
    }), /estimates_one_pending_revision/);
    const different = await sharingDraft();
    const differentRow = await db("estimates").where({ id: different.id }).first();
    await assert.rejects(db("estimates").insert({
      id: randomUUID(), workspaceId, estimateNumber: differentRow.estimateNumber, sourceEstimateId: source.id,
      revision: 1, name: "Wrong-family revision", parentType: "job", jobId,
    }), /estimates_revision_source_fk/);
    await deleteEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: results[0].id, expectedVersion: results[0].version, typedConfirmation: results[0].number,
    });
    await assert.rejects(reviseEstimate(db, identity(), enabled, command), EstimateDraftConflictError);
    const next = await reviseEstimate(db, identity(), enabled, { ...command, submissionId: randomUUID() });
    assert.equal(next.revision, 3);
    const nextHistory = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: next.id });
    assert.ok(nextHistory.events[0].changes.some(change => change.kind === "revision" && change.before === 1 && change.after === 3));
    assert.equal((await db("estimates").where({ id: source.id }).first()).status, "published");
    assert.equal((await readPublicEstimate(db, token.path.slice(3), publicRequester)).state, "ready");
  });
  await check("revision permissions, invalid states and stale snapshot/version bindings reject without writes", async () => {
    const command = await revisionFixture();
    for (const permission of ["estimates.read", "estimates.create", "estimates.update"] as const) {
      await assert.rejects(reviseEstimate(db, identity(), enabled.filter(p => p !== permission), command), AuthorizationAccessError);
    }
    await assert.rejects(reviseEstimate(db, identity(), enabled, { ...command, workspaceId: randomUUID() }), AuthorizationAccessError);
    await assert.rejects(reviseEstimate(db, identity(), enabled, { ...command, snapshotHash: "0".repeat(64) }), EstimateDraftConflictError);
    await assert.rejects(reviseEstimate(db, identity(), enabled, { ...command, expectedVersion: command.expectedVersion + 1 }), EstimateDraftConflictError);
    for (const status of ["draft", "accepted", "void", "superseded"]) {
      await db("estimates").where({ id: command.estimateId }).update({ status });
      await assert.rejects(reviseEstimate(db, identity(), enabled, command), EstimateDraftValidationError);
    }
    await db("estimates").where({ id: command.estimateId }).update({ status: "published", archivedAt: new Date() });
    await assert.rejects(reviseEstimate(db, identity(), enabled, command), EstimateDraftValidationError);
    await db("estimates").where({ id: command.estimateId }).update({ archivedAt: null });
    const field = await reviseEstimate(db, identity("field"), enabled, command);
    assert.equal(field.revision, 2);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
    await assert.rejects(reviseEstimate(db, identity("field"), enabled, command), AuthorizationAccessError);
    await assert.rejects(readEstimateRevisionFamily(db, identity("field"), enabled, { workspaceId, estimateId: command.estimateId }), AuthorizationAccessError);
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
  });
  await check("supersession rechecks the predecessor and rolls back every write on failure or competing confirmation", async () => {
    const command = await revisionFixture();
    const draft = await reviseEstimate(db, identity(), enabled, command);
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    const publish = {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: "publish",
      revisionReview: { sourceEstimateId: command.estimateId, sourceVersion: command.expectedVersion, paymentLinkReviewed: false },
    };
    await db("estimates").where({ id: command.estimateId }).increment("version", 1);
    await assert.rejects(shareEstimate(db, identity(), enabled, publish), EstimateDraftConflictError);
    assert.equal((await db("estimate_snapshots").where({ estimateId: draft.id })).length, 0);
    assert.equal((await db("estimates").where({ id: command.estimateId }).first()).status, "published");
    await db("estimates").where({ id: command.estimateId }).update({ status: "accepted" });
    await assert.rejects(shareEstimate(db, identity(), enabled, { ...publish,
      revisionReview: { ...publish.revisionReview, sourceVersion: command.expectedVersion + 1 } }), EstimateDraftValidationError);
    await db("estimates").where({ id: command.estimateId }).update({ status: "published" });
    const fresh = { ...publish, revisionReview: { ...publish.revisionReview, sourceVersion: command.expectedVersion + 1 } };
    const results = await Promise.allSettled([
      shareEstimate(db, identity(), enabled, fresh),
      shareEstimate(db, identity(), enabled, { ...fresh, submissionId: randomUUID() }),
    ]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "superseded" })).length, 1);
    assert.equal((await db("estimate_snapshots").where({ estimateId: draft.id })).length, 1);
    await assert.rejects(reviseEstimate(db, identity(), enabled, { ...command, submissionId: randomUUID(), expectedVersion: command.expectedVersion + 2 }),
      EstimateDraftValidationError);
  });
  await check("revision family reads page only authorized rows and retain frozen totals for every shared revision", async () => {
    let command = await revisionFixture();
    const root = command.estimateId;
    for (let index = 0; index < 26; index++) {
      const draft = await reviseEstimate(db, identity(), enabled, command);
      const receipt = await publishRevision(draft.id);
      command = { ...command, estimateId: draft.id, expectedVersion: receipt.version, snapshotHash: receipt.snapshotHash, submissionId: randomUUID() };
    }
    let family = await readEstimateRevisionFamily(db, identity(), enabled, { workspaceId, estimateId: root });
    assert.equal(family.total, 27); assert.equal(family.revisions.length, 25);
    assert.equal(family.revisions[0].revision, 27); assert.equal(family.canRevise, false);
    assert.ok(family.revisions.every(row => row.totalCents === 10000));
    family = await readEstimateRevisionFamily(db, identity(), enabled, { workspaceId, estimateId: root, beforeRevision: family.nextBeforeRevision });
    assert.deepEqual(family.revisions.map(row => row.revision), [2, 1]);
    assert.equal(family.nextBeforeRevision, null);
    const first = await db("estimates").where({ id: root }).first();
    const otherJob = randomUUID();
    await db("jobs").insert({ id: otherJob, workspaceId, customerId, title: "Unassigned sibling", customerName: "Fixture",
      service: "Plumbing", location: "", description: "", primaryOwnerId: users.owner, createdBy: users.owner });
    await db("estimates").where({ id: command.estimateId }).update({ jobId: otherJob });
    const scoped = await readEstimateRevisionFamily(db, identity("field"), enabled, { workspaceId, estimateId: root });
    assert.equal(scoped.total, 26);
    assert.ok(!scoped.revisions.some(row => row.id === command.estimateId));
    assert.equal((await db("estimates").where({ id: root }).first()).estimateNumber, first.estimateNumber);
  });
  await check("replacing a Declined estimate retains its decision and does not rewrite the converted Job", async () => {
    const accepted = await decisionFixture();
    await recordEstimateDecision(db, identity(), enabled, { ...accepted, outcome: "declined" });
    const review = await readEstimateDecisionReview(db, identity(), enabled, accepted.estimateId);
    const convertedJobId = randomUUID();
    await db("jobs").insert({
      id: convertedJobId, workspaceId, customerId, customerName: "Fixture", title: "Converted job",
      service: "Plumbing", location: "", description: "Retained Job details", primaryOwnerId: users.owner,
      createdBy: users.owner, acceptedEstimateId: accepted.estimateId,
    });
    const jobBefore = await db("jobs").where({ id: convertedJobId }).first();
    const draft = await reviseEstimate(db, identity(), enabled, {
      workspaceId, estimateId: accepted.estimateId, expectedVersion: review.estimate.version,
      snapshotHash: review.snapshotHash, submissionId: randomUUID(),
    });
    await publishRevision(draft.id);
    const after = await readEstimateDecisionReview(db, identity(), enabled, accepted.estimateId);
    assert.equal(after.estimate.status, "superseded"); assert.equal(after.estimate.decision!.outcome, "declined");
    assert.equal((await db("estimate_decisions").where({ estimateId: accepted.estimateId })).length, 1);
    assert.deepEqual(await db("jobs").where({ id: convertedJobId }).first(), jobBefore);
  });
  await check("supersession stops queued mail under the existing SMTP lock without changing either frozen paper", async () => {
    const queued = await queueEmail();
    const source = await readEstimateSharingReview(db, identity(), enabled, queued.estimateId);
    const draft = await reviseEstimate(db, identity(), enabled, {
      workspaceId, estimateId: queued.estimateId, expectedVersion: source.estimate.version,
      snapshotHash: source.snapshotHash, submissionId: randomUUID(),
    });
    const before = await db("estimate_snapshots").where({ estimateId: queued.estimateId }).first();
    const review = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    const publish = {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: "publish",
      revisionReview: { sourceEstimateId: queued.estimateId, sourceVersion: source.estimate.version, paymentLinkReviewed: false },
    };
    let entered!: () => void, release!: () => void;
    const start = new Promise<void>(resolve => { entered = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const order: string[] = [];
    const transport = processEstimateEmails(db, enabled, async () => { entered(); await gate; order.push("smtp"); return accept(); });
    await start;
    const replace = shareEstimate(db, identity(), enabled, publish).then(() => order.push("superseded"));
    release(); await Promise.all([transport, replace]);
    assert.deepEqual(order, ["smtp", "superseded"]);
    assert.equal((await db("estimate_deliveries").where({ id: queued.delivery.id }).first()).status, "sent");
    assert.deepEqual(await db("estimate_snapshots").where({ id: before.id }).first(), before);
    const other = await queueEmail();
    const otherReview = await readEstimateSharingReview(db, identity(), enabled, other.estimateId);
    const next = await reviseEstimate(db, identity(), enabled, {
      workspaceId, estimateId: other.estimateId, expectedVersion: otherReview.estimate.version,
      snapshotHash: otherReview.snapshotHash, submissionId: randomUUID(),
    });
    await publishRevision(next.id);
    await processEstimateEmails(db, enabled, async mail => { assert.notEqual(mail.id, other.delivery.id); return accept(); });
    assert.equal((await db("estimate_deliveries").where({ id: other.delivery.id }).first()).status, "failed");
  });
  await check("scheduled expiry is once-only, workspace-local and serialized with decisions and replacement", async () => {
    const due = await revisionFixture();
    const valid = await revisionFixture();
    await db("estimates").where({ id: due.estimateId }).update({ validUntil: localDate(-1) });
    await db("estimates").where({ id: valid.estimateId }).update({ validUntil: localDate(0) });
    await Promise.all([expireEstimates(db), expireEstimates(db)]);
    assert.equal((await db("estimates").where({ id: due.estimateId }).first()).status, "expired");
    assert.equal((await db("estimates").where({ id: valid.estimateId }).first()).status, "published");
    assert.equal((await db("estimate_activity").where({ estimateId: due.estimateId, type: "expired" })).length, 1);
    await expireEstimates(db);
    assert.equal((await db("estimate_activity").where({ estimateId: due.estimateId, type: "expired" })).length, 1);
    assert.deepEqual(new Set((await db("estimateNotifications").where({
      workspaceId, estimateId: due.estimateId, event: "expired",
    }).pluck("userId"))), new Set([users.owner, users.field]));
    const event = (await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: due.estimateId })).events[0];
    assert.equal(event.kind, "expired"); assert.equal(event.source.type, "worker");
    const revised = await reviseEstimate(db, identity(), enabled, {
      ...due, expectedVersion: due.expectedVersion + 1, submissionId: randomUUID(),
    });
    await Promise.all([expireEstimates(db), publishRevision(revised.id)]);
    assert.equal((await db("estimates").where({ id: due.estimateId }).first()).status, "superseded");
    const accepted = await decisionFixture();
    await recordEstimateDecision(db, identity(), enabled, accepted);
    await db("estimates").where({ id: accepted.estimateId }).update({ validUntil: localDate(-1) });
    await expireEstimates(db);
    assert.equal((await db("estimates").where({ id: accepted.estimateId }).first()).status, "accepted");
  });
  await check("three-day Estimate reminders use workspace dates, current revisions and durable recipient deduplication", async () => {
    const reminderNow = new Date("2026-10-26T12:00:00.000Z");
    const dueDate = "2026-10-29";
    const due = await addEstimate({
      status: "sent", parentType: "job", ownerId: users.field,
      name: "Three-day reminder fixture", totalCents: 12000, validUntil: dueDate, jobId,
    });
    const overdueWindow = await addEstimate({
      status: "sent", parentType: "job", ownerId: users.field,
      name: "Outside reminder window", totalCents: 13000, validUntil: "2026-10-30", jobId,
    });
    const olderRevision = await addEstimate({
      status: "sent", parentType: "job", ownerId: users.field,
      name: "Older sent revision reminder fixture", totalCents: 15000,
      validUntil: dueDate, revision: 1, jobId,
    });
    const currentRevision = await addEstimate({
      status: "published", parentType: "job", ownerId: users.field,
      name: "Current revision reminder fixture", totalCents: 16000,
      validUntil: dueDate, revision: 2, estimateNumber: olderRevision.estimateNumber, jobId,
    });
    await Promise.all([
      scheduleEstimateReminders(db, reminderNow),
      scheduleEstimateReminders(db, reminderNow),
    ]);
    const dueNotices = await db("estimateNotifications").where({
      workspaceId, estimateId: due.id, userId: users.field, event: "expiring_soon",
    });
    assert.equal(dueNotices.length, 1);
    assert.equal(dueNotices[0].dedupeKey, `estimate:${due.id}:expiring:${dueDate}`);
    assert.equal(await db("estimateNotifications").where({
      workspaceId, estimateId: olderRevision.id, event: "expiring_soon",
    }).count("* as n").then(result => Number(result[0].n)), 0);
    assert.equal(await db("estimateNotifications").where({
      workspaceId, estimateId: currentRevision.id, userId: users.field, event: "expiring_soon",
    }).count("* as n").then(result => Number(result[0].n)), 1);
    assert.equal(await db("estimateNotifications").where({
      workspaceId, estimateId: overdueWindow.id, event: "expiring_soon",
    }).count("* as n").then(result => Number(result[0].n)), 0);

    const timezoneDue = await addEstimate({
      status: "published", parentType: "job", ownerId: users.field,
      name: "Workspace date reminder fixture", totalCents: 14000, validUntil: "2026-10-30", jobId,
    });
    try {
      await db("workspaces").where({ id: workspaceId }).update({ timezone: "Pacific/Kiritimati" });
      await scheduleEstimateReminders(db, new Date("2026-10-26T23:00:00.000Z"));
      assert.equal(await db("estimateNotifications").where({
        workspaceId, estimateId: timezoneDue.id, event: "expiring_soon",
      }).count("* as n").then(result => Number(result[0].n)), 1);
    } finally {
      await db("workspaces").where({ id: workspaceId }).update({ timezone: "America/New_York" });
    }
    await assert.rejects(scheduleEstimateReminders(db, new Date("invalid")), RangeError);
  });
  await check("scheduled expiry uses each workspace day and rolls back a failed batch before retry", async () => {
    const boundary = await revisionFixture();
    const west = new Intl.DateTimeFormat("en-CA", { timeZone: "Etc/GMT+12" }).format(new Date());
    const east = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Kiritimati" }).format(new Date());
    assert.ok(east > west);
    await db("estimates").where({ id: boundary.estimateId }).update({ validUntil: west });
    try {
      await db("workspaces").where({ id: workspaceId }).update({ timezone: "Etc/GMT+12" });
      await expireEstimates(db);
      assert.equal((await db("estimates").where({ id: boundary.estimateId }).first()).status, "published");
      await db("workspaces").where({ id: workspaceId }).update({ timezone: "Pacific/Kiritimati" });
      await expireEstimates(db);
      assert.equal((await db("estimates").where({ id: boundary.estimateId }).first()).status, "expired");
    } finally { await db("workspaces").where({ id: workspaceId }).update({ timezone: "America/New_York" }); }
    const first = await revisionFixture(), failure = await revisionFixture();
    await db("estimates").where({ id: first.estimateId }).update({ validUntil: localDate(-3) });
    await db("estimates").where({ id: failure.estimateId }).update({ validUntil: localDate(-2), version: 2147483647 });
    await assert.rejects(expireEstimates(db), { code: "22003" });
    assert.equal((await db("estimates").where({ id: first.estimateId }).first()).status, "published");
    assert.equal((await db("estimate_activity").where({ estimateId: first.estimateId, type: "expired" })).length, 0);
    await db("estimates").where({ id: failure.estimateId }).update({ version: failure.expectedVersion });
    await expireEstimates(db);
    assert.equal((await db("estimates").where({ id: first.estimateId }).first()).status, "expired");
    assert.equal((await db("estimates").where({ id: failure.estimateId }).first()).status, "expired");
    assert.equal((await db("estimate_activity").where({ estimateId: first.estimateId, type: "expired" })).length, 1);
  });
  await check("expiry respects exact workspace-midnight boundaries across DST and fractional timezones", async () => {
    for (const [timezone, validUntil, midnight] of [
      ["America/New_York", "2024-03-10", "2024-03-11T04:00:00.000Z"],
      ["America/New_York", "2024-11-03", "2024-11-04T05:00:00.000Z"],
      ["Asia/Kathmandu", "2024-02-29", "2024-02-29T18:15:00.000Z"],
      ["Pacific/Kiritimati", "2024-12-31", "2024-12-31T10:00:00.000Z"],
    ]) {
      const source = await revisionFixture();
      await db("estimates").where({ id: source.estimateId }).update({ validUntil });
      try {
        await db("workspaces").where({ id: workspaceId }).update({ timezone });
        await expireEstimates(db, new Date(Date.parse(midnight) - 1));
        assert.equal((await db("estimates").where({ id: source.estimateId }).first()).status, "published");
        await expireEstimates(db, new Date(midnight));
        assert.equal((await db("estimates").where({ id: source.estimateId }).first()).status, "expired");
        assert.equal((await db("estimate_activity").where({ estimateId: source.estimateId, type: "expired" })).length, 1);
      } finally { await db("workspaces").where({ id: workspaceId }).update({ timezone: "America/New_York" }); }
    }
    await assert.rejects(expireEstimates(db, new Date("invalid")), RangeError);
  });

  await check("accepted lead conversion is atomic, concurrent retries create one Job, and conversion side effects stay scoped", async () => {
    const fixture = await acceptedLeadConversionFixture();
    const command = conversionCommand(fixture);
    const beforeEstimate = await db("estimates").where({ id: fixture.estimateId })
      .first("status", "version", "acceptedTotalCents");
    const beforeLead = await db("leads").where({ id: fixture.sourceLeadId }).first("stage", "version", "customerId");
    const beforeDeliveries = await db("estimate_deliveries").where({ workspaceId, estimateId: fixture.estimateId }).count({ n: "*" }).first();
    const [first, concurrent] = await Promise.all([
      convertAcceptedEstimateToJob(db, identity(), enabled, command),
      convertAcceptedEstimateToJob(db, identity(), enabled, command),
    ]);
    assert.deepEqual(concurrent, first);
    assert.deepEqual(await convertAcceptedEstimateToJob(db, identity(), enabled, command), first);
    assert.equal((await db("jobs").where({ workspaceId, acceptedEstimateId: fixture.estimateId })).length, 1);
    const job = await db("jobs").where({ workspaceId, acceptedEstimateId: fixture.estimateId }).first();
    assert.equal(job.sourceLeadId, fixture.sourceLeadId);
    assert.equal(job.customerId, customerId);
    assert.equal((await db("workOrders").where({ workspaceId, jobId: job.id })).length, 0);
    assert.equal((await db("estimates").where({ id: fixture.estimateId }).first("status", "version", "acceptedTotalCents")).status, beforeEstimate.status);
    assert.equal((await db("estimates").where({ id: fixture.estimateId }).first("version")).version, beforeEstimate.version);
    assert.equal((await db("estimates").where({ id: fixture.estimateId }).first("acceptedTotalCents")).acceptedTotalCents, beforeEstimate.acceptedTotalCents);
    assert.deepEqual(await db("leads").where({ id: fixture.sourceLeadId }).first("stage", "version", "customerId"), beforeLead);
    assert.equal(Number((await db("estimate_deliveries").where({ workspaceId, estimateId: fixture.estimateId }).count({ n: "*" }).first())?.n ?? 0), Number(beforeDeliveries?.n ?? 0));
    assert.equal((await db("estimate_activity").where({ workspaceId, estimateId: fixture.estimateId, type: "converted" })).length, 1);
    assert.equal((await db("estimate_operation_receipts").where({ workspaceId, estimateId: fixture.estimateId, operation: "convert" })).length, 1);
    const review = await readEstimateConversionReview(db, identity(), enabled, fixture.estimateId);
    assert.equal(review.estimate.convertedJobExists, true);
    assert.equal(review.estimate.sourceLeadHasJob, true);
    assert.equal(review.estimate.convertedJob?.id, job.id);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: fixture.estimateId });
    assert(history.events.some(event => event.kind === "converted"));
  });

  await check("conversion blocks missing customer context, stale lead bindings and leads that already have Jobs", async () => {
    const missingCustomer = await acceptedLeadConversionFixture(false);
    assert.deepEqual(missingCustomer.review.customer, { state: "missing" });
    assert.equal(missingCustomer.review.canResolveCustomer, true);

    const stale = await acceptedLeadConversionFixture();
    const staleCommand = conversionCommand(stale);
    await db("leads").where({ id: stale.sourceLeadId }).update({ version: staleCommand.expectedLeadVersion + 1 });
    await assert.rejects(convertAcceptedEstimateToJob(db, identity(), enabled, staleCommand), EstimateDraftConflictError);
    assert.equal((await db("jobs").where({ workspaceId, sourceLeadId: stale.sourceLeadId })).length, 0);

    const existing = await acceptedLeadConversionFixture();
    await createJob(db, identity(), enabled, {
      workspaceId, submissionId: randomUUID(), customerId,
      sourceLeadId: existing.sourceLeadId, title: "Existing lead Job",
      service: "Fixture repair", location: "2 Fixture Avenue", description: "",
      primaryOwnerId: null, teamUserIds: [], scheduledDate: null,
      arrivalWindow: null, completionDeadline: null,
    });
    const decision = await readEstimateDecisionReview(db, identity(), enabled, existing.estimateId);
    assert.equal(decision.canConvertToJob, false);
    const conversionReview = await readEstimateConversionReview(db, identity(), enabled, existing.estimateId);
    assert.equal(conversionReview.estimate.sourceLeadHasJob, true);
    await assert.rejects(
      convertAcceptedEstimateToJob(db, identity(), enabled, conversionCommand(existing)),
      EstimateDraftConflictError,
    );
    assert.equal((await db("jobs").where({ workspaceId, sourceLeadId: existing.sourceLeadId })).length, 1);
  });

  await check("stale customer versions block conversion before Job creation", async () => {
    const fixture = await acceptedLeadConversionFixture();
    const command = conversionCommand(fixture);
    const customer = await db("customers").where({ id: command.job.customerId }).first("version");
    try {
      await db("customers").where({ id: command.job.customerId }).update({ version: Number(customer.version) + 1 });
      await assert.rejects(convertAcceptedEstimateToJob(db, identity(), enabled, command), EstimateDraftConflictError);
      assert.equal((await db("jobs").where({ workspaceId, sourceLeadId: fixture.sourceLeadId })).length, 0);
    } finally {
      await db("customers").where({ id: command.job.customerId }).update({ version: customer.version });
    }
  });

  await check("a conversion history failure rolls back its Job, calendar/activity writes and receipt before retry", async () => {
    const fixture = await acceptedLeadConversionFixture();
    const command = conversionCommand(fixture);
    const constraint = `conversion_failure_${randomUUID().replaceAll("-", "")}`;
    const beforeJobActivities = Number((await db("jobActivity").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0);
    const beforeVisitRecords = Number((await db("calendarVisitRecords").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0);
    const beforeVisits = Number((await db("calendarVisits").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0);
    await db.raw(`ALTER TABLE "estimate_activity" ADD CONSTRAINT "${constraint}" CHECK ("estimateId" <> '${fixture.estimateId}'::uuid OR type <> 'converted')`);
    try {
      await assert.rejects(convertAcceptedEstimateToJob(db, identity(), enabled, command), { code: "23514" });
      assert.equal((await db("jobs").where({ workspaceId, sourceLeadId: fixture.sourceLeadId })).length, 0);
      assert.equal(Number((await db("jobActivity").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0), beforeJobActivities);
      assert.equal(Number((await db("calendarVisitRecords").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0), beforeVisitRecords);
      assert.equal(Number((await db("calendarVisits").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0), beforeVisits);
      assert.equal((await db("estimate_activity").where({ workspaceId, estimateId: fixture.estimateId, type: "converted" })).length, 0);
      assert.equal((await db("estimate_operation_receipts").where({ workspaceId, submissionId: command.submissionId })).length, 0);
    } finally {
      await db.raw(`ALTER TABLE "estimate_activity" DROP CONSTRAINT IF EXISTS "${constraint}"`);
    }
    const receipt = await convertAcceptedEstimateToJob(db, identity(), enabled, command);
    assert.equal((await db("jobs").where({ workspaceId, acceptedEstimateId: fixture.estimateId })).length, 1);
    assert.equal((await db("estimate_activity").where({ workspaceId, estimateId: fixture.estimateId, type: "converted" })).length, 1);
    assert.equal((await db("estimate_operation_receipts").where({ workspaceId, submissionId: command.submissionId })).length, 1);
    assert.equal(receipt.estimateId, fixture.estimateId);
  });

  await check("Estimate CSV exports match filtered current revisions, approved columns, CSV safety and UTC dates", async () => {
    const decision = await decisionFixture();
    await recordEstimateDecision(db, identity(), enabled, decision);
    const current = await db("estimates").where({ id: decision.estimateId }).first("estimateNumber");
    const formulaName = '=HYPERLINK("x,y") CSV export formula';
    await db("estimates").where({ id: decision.estimateId }).update({
      name: formulaName,
      revision: 2,
    });
    await addEstimate({
      status: "sent",
      parentType: "job",
      ownerId: users.field,
      name: "CSV export formula older revision",
      totalCents: 9000,
      validUntil: localDate(5),
      revision: 1,
      estimateNumber: Number(current.estimateNumber),
      jobId,
    });
    await addEstimate({
      status: "expired",
      parentType: "job",
      ownerId: users.field,
      name: "CSV export formula archived",
      totalCents: 8000,
      validUntil: localDate(-1),
      archivedAt: new Date(),
      jobId,
    });
    const input = {
      query: estimateListQuerySchema.parse({
        workspaceId,
        q: "CSV export formula",
        page: 2,
        pageSize: 25,
        sort: "estimateNumber",
        direction: "asc",
      }),
      columns: [...estimateExportColumns],
    };
    const preview = await previewEstimateExport(db, identity(), enabled, input);
    assert.deepEqual(preview, { count: 1, scope: "workspace", rowLimit: 50000 });
    const download = await createEstimateCSVExport(db, identity(), enabled, input);
    assert.equal(download.count, 1);
    const csv = Buffer.from(await new Response(download.stream).arrayBuffer()).toString("utf8");
    assert.ok(csv.startsWith("\uFEFF"));
    assert.ok(csv.includes('"Estimate number","Revision","Name","Status","Customer","Parent type","Parent ID","Owner","Total","Sent date","Valid until","Decided date","Decision channel"'));
    assert.ok(csv.includes('"EST-'));
    assert.ok(csv.includes('"2"'));
    assert.ok(csv.includes('"\'=HYPERLINK(""x,y"") CSV export formula"'));
    assert.ok(csv.includes('"accepted"'), csv);
    assert.ok(csv.includes('"Estimate Fixture Customer"'));
    assert.ok(csv.includes(`"${jobId}"`));
    assert.ok(csv.includes('"Estimate fixture owner"'));
    assert.ok(csv.includes('"100.00"'));
    assert.match(csv, /"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);
    assert.ok(csv.includes(`"${localDate(5)}"`));
    assert.ok(csv.includes('"phone"'));
    assert.doesNotMatch(csv, /PRIVATE_DECISION_NOTE|internalNotes|paymentLink/);
    const audit = await db("estimateExportAudit")
      .where({ workspaceId, outcome: "completed" })
      .orderBy("createdAt", "desc")
      .first();
    assert.equal(audit.count, 1);
    assert.equal(audit.rowsSent, 1);
    assert.equal(JSON.stringify(audit.filters).includes("CSV export formula"), false);

    const includeHidden = {
      ...input,
      query: { ...input.query, includeHidden: true },
    };
    assert.equal(
      (await previewEstimateExport(db, identity(), enabled, includeHidden)).count,
      3,
    );
    await assert.rejects(
      previewEstimateExport(db, identity("office"), enabled, input),
      AuthorizationAccessError,
    );
    await assert.rejects(
      previewEstimateExport(db, identity(), enabled.filter((permission) => permission !== "estimates.export"), input),
      AuthorizationAccessError,
    );
  });

  await check("Estimate CSV export cap, empty filters, and request cancellation fail explicitly", async () => {
    const current = await db("estimates")
      .where({ workspaceId })
      .where("name", "like", "%CSV export formula%")
      .orderBy("revision", "desc")
      .first("estimateNumber");
    const input = estimateExportRequestSchema.parse({
      query: estimateListQuerySchema.parse({
        workspaceId,
        q: "CSV export formula",
        includeHidden: true,
      }),
      columns: ["number", "name"],
    });
    const originalLimit = process.env.ESTIMATE_EXPORT_ROW_LIMIT;
    try {
      process.env.ESTIMATE_EXPORT_ROW_LIMIT = "2";
      assert.equal(estimateExportRowLimit(), 2);
      assert.equal((await previewEstimateExport(db, identity(), enabled, input)).count, 3);
      await assert.rejects(
        createEstimateCSVExport(db, identity(), enabled, input),
        EstimateExportLimitError,
      );
      const rejected = await db("estimateExportAudit")
        .where({ workspaceId, outcome: "rejected", count: 3 })
        .orderBy("createdAt", "desc")
        .first();
      assert.equal(rejected.rowsSent, 0);
    } finally {
      if (originalLimit === undefined) delete process.env.ESTIMATE_EXPORT_ROW_LIMIT;
      else process.env.ESTIMATE_EXPORT_ROW_LIMIT = originalLimit;
    }
    const empty = {
      ...input,
      query: { ...input.query, q: "no matching Estimate export fixture" },
    };
    assert.equal((await previewEstimateExport(db, identity(), enabled, empty)).count, 0);
    await assert.rejects(
      createEstimateCSVExport(db, identity(), enabled, empty),
      EstimateExportEmptyError,
    );
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      createEstimateCSVExport(db, identity(), enabled, input, controller.signal),
      (error: unknown) => error instanceof Error && error.name === "AbortError",
    );
    process.env.ESTIMATE_EXPORT_ROW_LIMIT = "0";
    try {
      assert.throws(estimateExportRowLimit, /Invalid Estimate export row limit configuration/);
    } finally {
      if (originalLimit === undefined) delete process.env.ESTIMATE_EXPORT_ROW_LIMIT;
      else process.env.ESTIMATE_EXPORT_ROW_LIMIT = originalLimit;
    }
    assert.ok(current);
  });

  await checkLeadSuggestions();
  async function sharingAssistant(mode: "send" | "publish" | "resend", estimateId: string, role: "owner" | "office" = "owner") {
    const turnId = randomUUID(), threadId = randomUUID();
    await db("chatThreads").insert({ id: threadId, ...identity(role) });
    await db("chatTurns").insert({
      id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
      surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
    });
    await db("chatMessages").insert({
      id: randomUUID(), turnId, role: "user", text: "Prepare a sharing review for this saved Estimate.",
    });
    const ticket = await proposeEstimateChatShare(db, identity(role), enabled, turnId,
      { request: { operation: mode, estimateRef: estimateId } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateShareChatBinding(ticket) };
  }
  await check("assistant sharing preparation, review and idempotent cancellation perform no sharing writes", async () => {
    const draft = await sharingDraft("assistant-send@example.test");
    const before = await db("estimates").where({ id: draft.id }).first();
    const run = await sharingAssistant("send", draft.id);
    const view = await readEstimateChatShare(db, identity(), enabled, run.binding);
    assert.equal(view.review.recipientEmail, "assistant-send@example.test");
    assert.equal(view.review.snapshot.amounts.totalCents, 10000);
    assert.equal(JSON.stringify(view).includes("STAFF_ONLY_SHARING_FIXTURE"), false);
    assert.deepEqual(await db("estimates").where({ id: draft.id }).first(), before);
    for (const table of ["estimate_snapshots", "estimate_share_tokens", "estimate_deliveries"]) {
      assert.equal((await db(table).where({ estimateId: draft.id })).length, 0);
    }
    for (let retry = 0; retry < 2; retry++) {
      const result = await operateEstimateChatShare(db, identity(), enabled, run.binding, "cancel", false);
      assert.equal(result.view.ticket.state, "cancelled");
    }
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false), EstimateDraftConflictError);
  });
  await check("assistant Send atomically freezes and queues once with concurrent retry and a checked receipt", async () => {
    const draft = await sharingDraft("assistant-send@example.test");
    const run = await sharingAssistant("send", draft.id);
    const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false)));
    assert.deepEqual(one, two);
    assert.equal(one.view.ticket.state, "confirmed");
    assert.equal(one.view.receipt?.version, draft.version + 1);
    const deliveries = await db("estimate_deliveries").where({ estimateId: draft.id });
    assert.equal(deliveries.length, 1); assert.equal(deliveries[0].status, "queued");
    assert.equal((await db("estimate_snapshots").where({ estimateId: draft.id })).length, 1);
    assert.equal((await db("estimate_share_tokens").where({ estimateId: draft.id })).length, 1);
    assert.equal((await db("estimate_activity").where({ estimateId: draft.id, type: "sent" }).first()).source, "assistant-confirmed");
    assert.equal((await operateEstimateChatShare(db, identity(), enabled, run.binding, "open", false)).href, `/estimates/${draft.id}?workspace=${workspaceId}`);
    await db("estimate_deliveries").where({ estimateId: draft.id }).update({ status: "sent", sentAt: new Date(), attemptCount: 1 });
    assert.equal((await readEstimateChatShare(db, identity(), enabled, run.binding)).ticket.state, "confirmed");
    assert.equal((await db("chatEstimateShareAudit").where({ proposalId: run.ticket.id, action: "confirmed" })).length, 1);
  });
  await check("assistant Publish creates no email; Resend replaces a recipient proposal without changing frozen paper", async () => {
    const draft = await sharingDraft("assistant-publish@example.test");
    const publication = await sharingAssistant("publish", draft.id);
    const published = await operateEstimateChatShare(db, identity(), enabled, publication.binding, "confirm", false);
    assert.equal(published.view.receipt?.status, "published");
    assert.equal((await db("estimate_deliveries").where({ estimateId: draft.id })).length, 0);
    await assert.rejects(sharingAssistant("resend", draft.id), EstimateDraftValidationError);
    const sentDraft = await sharingDraft("assistant-resend@example.test");
    const send = await sharingAssistant("send", sentDraft.id);
    await operateEstimateChatShare(db, identity(), enabled, send.binding, "confirm", false);
    await assert.rejects(sharingAssistant("resend", sentDraft.id), EstimateDraftValidationError);
    await db("estimate_deliveries").where({ estimateId: sentDraft.id }).update({ status: "sent", sentAt: new Date(), attemptCount: 1 });
    const resend = await sharingAssistant("resend", sentDraft.id);
    const frozen = await db("estimate_snapshots").where({ estimateId: sentDraft.id }).first();
    const refreshed = await refreshEstimateChatShareRecipient(db, identity(), enabled, resend.binding, "updated-recipient@example.test");
    assert.equal(refreshed.ticket.state, "pending");
    assert.notEqual(refreshed.ticket.id, resend.ticket.id);
    assert.equal((await db("estimate_deliveries").where({ estimateId: sentDraft.id })).length, 1);
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, resend.binding, "confirm", false), EstimateDraftConflictError);
    const resent = await operateEstimateChatShare(db, identity(), enabled, estimateShareChatBinding(refreshed.ticket), "confirm", false);
    assert.equal(resent.view.receipt?.status, "sent");
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId: sentDraft.id }).first(), frozen);
    assert.equal((await db("estimate_deliveries").where({ estimateId: sentDraft.id, status: "queued" }).first()).recipient, "updated-recipient@example.test");
  });
  await check("assistant sharing audit failure rolls back snapshot, token, email, state and operation receipt", async () => {
    const draft = await sharingDraft("assistant-rollback@example.test");
    const run = await sharingAssistant("send", draft.id);
    const constraint = `assistant_share_audit_${randomUUID().replaceAll("-", "")}`;
    await db.raw(`ALTER TABLE "chatEstimateShareAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
    try {
      await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false));
      for (const table of ["estimate_snapshots", "estimate_share_tokens", "estimate_deliveries", "estimate_operation_receipts"]) {
        const query = db(table).where({ estimateId: draft.id });
        if (table === "estimate_operation_receipts") query.where({ submissionId: run.ticket.id });
        assert.equal((await query).length, 0, table);
      }
      assert.equal((await db("estimates").where({ id: draft.id }).first()).status, "draft");
      assert.equal((await db("chatEstimateShares").where({ id: run.ticket.id }).first()).state, "pending");
    } finally { await db.raw(`ALTER TABLE "chatEstimateShareAudit" DROP CONSTRAINT "${constraint}"`); }
    assert.equal((await operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false)).view.ticket.state, "confirmed");
  });
  await check("assistant sharing checks exact expiry, ownership, hash, permission, parent changes and current-page identity", async () => {
    const draft = await sharingDraft("assistant-boundary@example.test");
    const run = await sharingAssistant("publish", draft.id), now = Date.now;
    await assert.rejects(operateEstimateChatShare(db, identity("office"), enabled, run.binding, "confirm", false), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, { ...run.binding, inputHash: "f".repeat(64) }, "confirm", false), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled.filter(value => value !== "estimates.send"), run.binding, "confirm", false), AuthorizationAccessError);
    try {
      Date.now = () => Date.parse(run.ticket.expiresAt);
      await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false), EstimateDraftConflictError);
      assert.equal((await readEstimateChatShare(db, identity(), enabled, run.binding)).ticket.state, "expired");
    } finally { Date.now = now; }
    await db("jobs").where({ id: jobId }).increment("version", 1);
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false), EstimateDraftConflictError);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatShare(trx, context, run.turnId)), undefined);
    const pageRun = await sharingAssistant("publish", draft.id);
    await db("chatTurns").where({ id: pageRun.turnId }).update({
      state: "running", surfaceKey: "estimate.detail", pageContext: JSON.stringify({ recordRefs: [{ type: "estimate", id: draft.id }] }),
    });
    const selected = await proposeEstimateChatShare(db, identity(), enabled, pageRun.turnId,
      { request: { operation: "publish", estimateRef: null } }, new AbortController().signal);
    assert.equal(selected.estimate.id, draft.id);
    await db("chatTurns").where({ id: pageRun.turnId }).update({ state: "completed" });
  });
  await check("assistant revision publication requires real replacement and payment-link acknowledgement", async () => {
    const original = await sharingDraft("assistant-revision@example.test", "https://payments.example.test/review-me");
    const first = await sharingAssistant("publish", original.id);
    const receipt = (await operateEstimateChatShare(db, identity(), enabled, first.binding, "confirm", false)).view.receipt!;
    const revision = await reviseEstimate(db, identity(), enabled, {
      workspaceId, estimateId: original.id, expectedVersion: receipt.version, snapshotHash: receipt.snapshotHash, submissionId: randomUUID(),
    });
    const run = await sharingAssistant("publish", revision.id);
    const view = await readEstimateChatShare(db, identity(), enabled, run.binding);
    assert.equal(view.review.revision?.requiresPaymentLinkReview, true);
    assert.equal(run.ticket.requiresDialog, true);
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false), EstimateDraftValidationError);
    assert.equal((await db("estimates").where({ id: original.id }).first()).status, "published");
    await operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", true);
    assert.equal((await db("estimates").where({ id: original.id }).first()).status, "superseded");
    assert.ok((await db("estimate_share_tokens").where({ estimateId: original.id }).first()).revokedAt);
    assert.equal((await db("estimate_activity").where({ estimateId: original.id, type: "superseded" }).first()).source, "assistant-confirmed");
  });
  await check("assistant sharing receipts recheck membership identity rather than accepting a replacement membership", async () => {
    const draft = await sharingDraft("assistant-membership@example.test");
    const run = await sharingAssistant("send", draft.id, "office");
    await operateEstimateChatShare(db, identity("office"), enabled, run.binding, "confirm", false);
    const membership = await db("workspaceMemberships").where(identity("office")).first();
    await db("workspaceMemberships").where(identity("office")).delete();
    await db("workspaceMemberships").insert(membership);
    await assert.rejects(operateEstimateChatShare(db, identity("office"), enabled, run.binding, "confirm", false), AuthorizationAccessError);
    await assert.rejects(readEstimateChatShare(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
    assert.equal((await db("estimate_deliveries").where({ estimateId: draft.id })).length, 1);
  });
  await check("Draft and sharing preparation supersede each other within one owned conversation without sharing", async () => {
    const draft = await sharingDraft("assistant-intent@example.test");
    const run = await sharingAssistant("send", draft.id);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const next = await proposeEstimateChatDraft(db, identity(), enabled, run.turnId, { request: {
      operation: "update", estimateRef: draft.id, parentType: null, parentRef: null,
      changes: { name: "Refined assistant intent", scope: null, message: null, paymentTerms: null, termsNote: null,
        validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
    } }, new AbortController().signal);
    assert.equal((await db("chatEstimateShares").where({ id: run.ticket.id }).first()).state, "superseded");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    await assert.rejects(operateEstimateChatShare(db, identity(), enabled, run.binding, "confirm", false), EstimateDraftConflictError);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const final = await proposeEstimateChatShare(db, identity(), enabled, run.turnId,
      { request: { operation: "send", estimateRef: draft.id } }, new AbortController().signal);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    assert.equal((await db("chatEstimateDrafts").where({ id: next.draft.id }).first()).state, "superseded");
    assert.equal((await operateEstimateChatShare(db, identity(), enabled, estimateShareChatBinding(final), "cancel", false)).view.ticket.state, "cancelled");
    assert.equal((await db("estimate_deliveries").where({ estimateId: draft.id })).length, 0);
    assert.equal((await db("estimates").where({ id: draft.id }).first()).name, "Sharing fixture");
  });
  async function decisionAssistant(
    estimateId: string, changes: Partial<EstimateDecisionChatInput> = {}, role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string },
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
      await db("chatMessages").insert({
        id: randomUUID(), turnId, role: "user", text: "Prepare a decision review. Do not record anything yet.",
      });
    } else await db("chatTurns").where({ id: turnId }).update({ state: "running", leaseUntil: new Date(Date.now() + 60000) });
    const ticket = await proposeEstimateChatDecision(db, identity(role), enabled, turnId, { request: {
      operation: "decision", estimateRef: estimateId, outcome: "accepted", decisionDate: localDate(0),
      channel: "phone", note: null, reason: null, ...changes,
    } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateDecisionChatBinding(ticket) };
  }
  await check("assistant decision preparation and incomplete cancellation do not record, notify, stop mail or mutate CRM", async () => {
    const command = await decisionFixture();
    const snapshot = async () => Object.fromEntries(await Promise.all([
      "estimates", "estimate_decisions", "estimate_activity", "estimate_operation_receipts",
      "estimateNotifications", "estimate_deliveries",
      "estimate_snapshots", "estimate_share_tokens", "jobs", "leads",
    ].map(async table => [table, await db(table).where({ workspaceId })
      .orderBy(table === "estimate_operation_receipts" ? "submissionId" : "id")])));
    const before = await snapshot();
    const run = await decisionAssistant(command.estimateId, { outcome: null, decisionDate: null, channel: null });
    const view = await readEstimateChatDecision(db, identity(), enabled, run.binding);
    assert.equal(view.canConfirm, false);
    assert.equal(view.value.outcome, ""); assert.equal(view.value.channel, ""); assert.equal(view.value.decisionDate, "");
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftValidationError);
    for (let retry = 0; retry < 2; retry++) {
      assert.equal((await operateEstimateChatDecision(db, identity(), enabled, run.binding, "cancel")).view.ticket.state, "cancelled");
    }
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    assert.deepEqual(await snapshot(), before);
  });
  await check("assistant Accepted confirmation is frozen-total based, concurrent-safe, atomic and attributed to chat", async () => {
    const command = await decisionFixture();
    await db("estimates").where({ id: command.estimateId }).update({ totalCents: 1 });
    const frozen = await db("estimate_snapshots").where({ estimateId: command.estimateId }).first();
    const tokens = await db("estimate_share_tokens").where({ estimateId: command.estimateId });
    const jobs = await db("jobs").where({ workspaceId });
    const run = await decisionAssistant(command.estimateId, { note: "  PRIVATE_CHAT_NOTE\nliteral <tag>  " });
    assert.equal(JSON.stringify(run.ticket).includes("PRIVATE_CHAT_NOTE"), false);
    assert.equal(JSON.stringify(run.ticket).includes("recipientName"), false);
    const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm")));
    assert.deepEqual(one, two);
    assert.equal(one.view.receipt?.status, "accepted");
    assert.equal(one.view.receipt?.version, command.expectedVersion + 1);
    const row = await db("estimates").where({ id: command.estimateId }).first();
    assert.equal(Number(row.acceptedTotalCents), 10000);
    assert.equal(row.decisionNote, "PRIVATE_CHAT_NOTE\nliteral <tag>");
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId: command.estimateId }).first(), frozen);
    assert.deepEqual(await db("estimate_share_tokens").where({ estimateId: command.estimateId }), tokens);
    assert.deepEqual(await db("jobs").where({ workspaceId }), jobs);
    assert.equal((await db("estimate_deliveries").where({ estimateId: command.estimateId }).first()).status, "failed");
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 1);
    assert.equal((await db("estimateNotifications").where({ estimateId: command.estimateId, event: "decision_recorded", userId: users.field })).length, 1);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "decision-recorded" }).first()).source, "assistant-confirmed");
    assert.equal((await db("chatEstimateDecisionAudit").where({ proposalId: run.ticket.id, action: "confirmed" })).length, 1);
    assert.equal((await operateEstimateChatDecision(db, identity(), enabled, run.binding, "open")).href, `/estimates/${command.estimateId}?workspace=${workspaceId}`);
    assert.equal((await readEstimateChatDecision(db, identity(), enabled, run.binding)).ticket.state, "confirmed");
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId: command.estimateId });
    assert.equal(history.events.find(event => event.kind === "decision-recorded")?.source.type, "chat");
  });
  await check("assistant corrections preserve unspecified saved fields, explicitly clear notes and retain immutable entries", async () => {
    const command = await decisionFixture();
    const original = await recordEstimateDecision(db, identity(), enabled, command);
    const run = await decisionAssistant(command.estimateId, {
      operation: "correct-decision", outcome: null, decisionDate: null, channel: "email", note: null, reason: "  Correct channel only  ",
    }, "office");
    const view = await readEstimateChatDecision(db, identity("office"), enabled, run.binding);
    assert.equal(view.value.outcome, "accepted");
    assert.equal(view.value.decisionDate, command.decisionDate);
    assert.equal(view.value.note, command.note);
    assert.equal(view.review.estimate.decision?.id, original.decisionId);
    assert.equal(JSON.stringify(run.ticket).includes(command.note), false);
    const first = await operateEstimateChatDecision(db, identity("office"), enabled, run.binding, "confirm");
    assert.equal(first.view.receipt?.status, "accepted");
    const clear = await decisionAssistant(command.estimateId, {
      operation: "correct-decision", outcome: null, decisionDate: null, channel: null, note: "", reason: "Clear optional note",
    }, "office");
    const cleared = await readEstimateChatDecision(db, identity("office"), enabled, clear.binding);
    assert.equal(cleared.review.estimate.decision?.note, command.note); assert.equal(cleared.value.note, "");
    await operateEstimateChatDecision(db, identity("office"), enabled, clear.binding, "confirm");
    const entries = await db("estimate_decisions").where({ estimateId: command.estimateId }).orderBy("estimateVersion");
    assert.equal(entries.length, 3); assert.equal(entries[0].note, command.note);
    assert.equal(entries[1].previousDecisionId, original.decisionId); assert.equal(entries[1].reason, "Correct channel only");
    assert.equal(entries[2].previousDecisionId, entries[1].id); assert.equal(entries[2].note, "");
    await assert.rejects(readEstimateChatDecision(db, identity("office"), enabled, run.binding), EstimateDraftConflictError);
  });
  await check("assistant future dates and missing correction reasons remain reviewable but cannot confirm", async () => {
    const command = await decisionFixture();
    const future = await decisionAssistant(command.estimateId, { decisionDate: localDate(1) });
    assert.equal((await readEstimateChatDecision(db, identity(), enabled, future.binding)).canConfirm, false);
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, future.binding, "confirm"), EstimateDraftValidationError);
    await recordEstimateDecision(db, identity(), enabled, command);
    const missing = await decisionAssistant(command.estimateId, { operation: "correct-decision", reason: "   " });
    assert.equal((await readEstimateChatDecision(db, identity(), enabled, missing.binding)).canConfirm, false);
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, missing.binding, "confirm"), EstimateDraftValidationError);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 1);
  });
  await check("assistant decisions recheck owned completed turn, hash, Estimate/version/snapshot and independent parent grants", async () => {
    const command = await decisionFixture();
    const run = await decisionAssistant(command.estimateId);
    await assert.rejects(operateEstimateChatDecision(db, identity("office"), enabled, run.binding, "confirm"), AuthorizationAccessError);
    for (const change of [{ inputHash: "f".repeat(64) }, { estimateId: randomUUID() }, { expectedVersion: 1 }, { snapshotHash: "f".repeat(64) }]) {
      await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, { ...run.binding, ...change }, "confirm"), EstimateDraftConflictError);
    }
    for (const permission of ["assistant.use", "estimates.read", "estimates.decide", "jobs.read"]) {
      await assert.rejects(operateEstimateChatDecision(db, identity(), enabled.filter(value => value !== permission), run.binding, "confirm"), AuthorizationAccessError);
      await assert.rejects(readEstimateChatDecision(db, identity(), enabled.filter(value => value !== permission), run.binding), AuthorizationAccessError);
    }
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    await db("jobs").where({ id: jobId }).increment("version", 1);
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatDecision(trx, context, run.turnId)), undefined);
  });
  await check("assistant decision expiry uses the exact boundary and evidence no longer authorizes expired review", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId), now = Date.now;
    try {
      Date.now = () => Date.parse(run.ticket.expiresAt);
      await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
      assert.equal((await readEstimateChatDecision(db, identity(), enabled, run.binding)).ticket.state, "expired");
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateDecisionChatEvidenceAllowed(trx, context, run.turnId)), false);
    } finally { Date.now = now; }
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 0);
  });
  await check("assistant decision audit failure rolls back the decision, mail stop, notification, activity, receipt and proposal", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId);
    const estimateBefore = await db("estimates").where({ id: command.estimateId }).first();
    const deliveries = await db("estimate_deliveries").where({ estimateId: command.estimateId });
    const activity = await db("estimate_activity").where({ estimateId: command.estimateId });
    const constraint = `assistant_decision_audit_${randomUUID().replaceAll("-", "")}`;
    await db.raw(`ALTER TABLE "chatEstimateDecisionAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
    try {
      await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), /check constraint/);
      assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), estimateBefore);
      assert.deepEqual(await db("estimate_deliveries").where({ estimateId: command.estimateId }), deliveries);
      assert.deepEqual(await db("estimate_activity").where({ estimateId: command.estimateId }), activity);
      assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 0);
      assert.equal((await db("estimateNotifications").where({ estimateId: command.estimateId, event: "decision_recorded" })).length, 0);
      assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
      assert.equal((await db("chatEstimateDecisions").where({ id: run.ticket.id }).first()).state, "pending");
    } finally { await db.raw(`ALTER TABLE "chatEstimateDecisionAudit" DROP CONSTRAINT "${constraint}"`); }
    assert.equal((await operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm")).view.ticket.state, "confirmed");
  });
  await check("assistant decisions retain the Field initial-decision scope but never grant Field correction", async () => {
    const command = await decisionFixture();
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
    const run = await decisionAssistant(command.estimateId, {}, "field");
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
    await assert.rejects(operateEstimateChatDecision(db, identity("field"), enabled, run.binding, "confirm"));
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
    const refreshed = await decisionAssistant(command.estimateId, {}, "field");
    await operateEstimateChatDecision(db, identity("field"), enabled, refreshed.binding, "confirm");
    await assert.rejects(decisionAssistant(command.estimateId, { operation: "correct-decision", reason: "Not permitted" }, "field"), AuthorizationAccessError);
  });
  await check("assistant decision receipt visibility rechecks membership replacement and does not replay a write", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId, {}, "office");
    await operateEstimateChatDecision(db, identity("office"), enabled, run.binding, "confirm");
    const membership = await db("workspaceMemberships").where(identity("office")).first();
    await db("workspaceMemberships").where(identity("office")).delete();
    await db("workspaceMemberships").insert(membership);
    await assert.rejects(readEstimateChatDecision(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatDecision(db, identity("office"), enabled, run.binding, "confirm"), AuthorizationAccessError);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 1);
  });
  await check("assistant initial Declined and metadata-only corrections preserve separate Lost Lead-stage review", async () => {
    const fixture = await leadSuggestionFixture(), before = await db("leads").where({ id: fixture.leadId }).first();
    const run = await decisionAssistant(fixture.binding.estimateId, { outcome: "declined" }, "office");
    const result = await operateEstimateChatDecision(db, identity("office"), enabled, run.binding, "confirm");
    assert.deepEqual(await db("leads").where({ id: fixture.leadId }).first(), before);
    const source = {
      workspaceId, estimateId: fixture.binding.estimateId, sourceSubmissionId: run.ticket.id,
      expectedEstimateVersion: result.view.receipt!.version,
    };
    const review = await readEstimateLeadStageReview(db, identity("office"), enabled, source);
    assert.equal(review.target, "lost");
    const corrected = await decisionAssistant(fixture.binding.estimateId, {
      operation: "correct-decision", outcome: null, decisionDate: null, channel: "email", note: null, reason: "Correct channel",
    }, "office");
    const metadata = await operateEstimateChatDecision(db, identity("office"), enabled, corrected.binding, "confirm");
    const metadataReview = await readEstimateLeadStageReview(db, identity("office"), enabled, {
      ...source, sourceSubmissionId: corrected.ticket.id, expectedEstimateVersion: metadata.view.receipt!.version,
    });
    assert.equal(metadataReview.target, null);
    assert.deepEqual(await db("leads").where({ id: fixture.leadId }).first(), before);
  });
  await check("assistant corrections to converted Estimates do not alter the accepted Job", async () => {
    const fixture = await acceptedLeadConversionFixture();
    const converted = await convertAcceptedEstimateToJob(db, identity(), enabled, conversionCommand(fixture));
    const job = await db("jobs").where({ id: converted.job.id }).first();
    const run = await decisionAssistant(fixture.estimateId, {
      operation: "correct-decision", outcome: "declined", note: "", reason: "Correct recorded response after conversion",
    });
    await operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm");
    assert.deepEqual(await db("jobs").where({ id: converted.job.id }).first(), job);
    assert.equal((await db("jobs").where({ workspaceId, acceptedEstimateId: fixture.estimateId })).length, 1);
  });
  await check("assistant decision proposals select only exact targets or registered current-page identity", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId);
    await db("chatTurns").where({ id: run.turnId }).update({
      state: "running", surfaceKey: "estimate.detail", pageContext: JSON.stringify({ recordRefs: [{ type: "estimate", id: command.estimateId }] }),
    });
    const request = { operation: "decision", estimateRef: null, outcome: "accepted", decisionDate: localDate(0), channel: "phone", note: null, reason: null };
    const page = await proposeEstimateChatDecision(db, identity(), enabled, run.turnId, { request }, new AbortController().signal);
    assert.equal(page.estimate.id, command.estimateId);
    await assert.rejects(proposeEstimateChatDecision(db, identity(), enabled, run.turnId, {
      request: { ...request, estimateRef: "Sharing fixture" },
    }, new AbortController().signal), EstimateDraftValidationError);
    await db("chatTurns").where({ id: run.turnId }).update({ surfaceKey: "home", pageContext: "{}" });
    await assert.rejects(proposeEstimateChatDecision(db, identity(), enabled, run.turnId, { request }, new AbortController().signal), EstimateDraftValidationError);
  });
  await check("Draft, sharing and decision intents supersede each other without recording a decision", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId);
    const draft = await sharingDraft("assistant-cross-family@example.test");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const sharing = await proposeEstimateChatShare(db, identity(), enabled, run.turnId, {
      request: { operation: "publish", estimateRef: draft.id },
    }, new AbortController().signal);
    assert.equal((await db("chatEstimateDecisions").where({ id: run.ticket.id }).first()).state, "superseded");
    const second = await decisionAssistant(command.estimateId, {}, "owner", run);
    assert.equal((await db("chatEstimateShares").where({ id: sharing.id }).first()).state, "superseded");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const drafted = await proposeEstimateChatDraft(db, identity(), enabled, run.turnId, { request: {
      operation: "update", estimateRef: draft.id, parentType: null, parentRef: null,
      changes: { name: "Cross-family intent", scope: null, message: null, paymentTerms: null, termsNote: null,
        validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
    } }, new AbortController().signal);
    assert.equal((await db("chatEstimateDecisions").where({ id: second.ticket.id }).first()).state, "superseded");
    const third = await decisionAssistant(command.estimateId, {}, "owner", run);
    assert.equal((await db("chatEstimateDrafts").where({ id: drafted.draft.id }).first()).state, "superseded");
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, second.binding, "confirm"), EstimateDraftConflictError);
    await operateEstimateChatDecision(db, identity(), enabled, third.binding, "cancel");
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 0);
  });
  await check("assistant decisions accept a Published zero-total Estimate without inventing a price", async () => {
    const draft = await sharingDraft();
    const seed = await readEstimateEditor(db, identity(), enabled, draft.id), values = seed.estimate!.values;
    const saved = await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      values: { ...values, items: values.items.map(item => ({ ...item, included: true, unitPrice: "0" })) },
    });
    const paper = await readEstimateSharingReview(db, identity(), enabled, draft.id);
    await shareEstimate(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: saved.version, snapshotHash: paper.snapshotHash,
      mode: "publish", submissionId: randomUUID(),
    });
    const run = await decisionAssistant(draft.id);
    assert.equal(run.ticket.estimate.status, "published"); assert.equal(run.ticket.estimate.totalCents, 0);
    await operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm");
    const row = await db("estimates").where({ id: draft.id }).first();
    assert.equal(Number(row.acceptedTotalCents), 0);
    assert.equal((await db("estimate_deliveries").where({ estimateId: draft.id })).length, 0);
  });
  await check("assistant decision reviews reject later manual decisions and changed private stored content", async () => {
    const command = await decisionFixture(), run = await decisionAssistant(command.estimateId);
    const receipt = await recordEstimateDecision(db, identity(), enabled, command);
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    const correction = await decisionAssistant(command.estimateId, {
      operation: "correct-decision", outcome: null, channel: null, decisionDate: null, reason: "Reviewed correction",
    });
    await recordEstimateDecision(db, identity(), enabled, {
      ...command, mode: "correct", expectedVersion: receipt.version, expectedDecisionId: receipt.decisionId,
      submissionId: randomUUID(), reason: "Another manual correction", note: "New saved note",
    });
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, correction.binding, "confirm"), EstimateDraftConflictError);
    const next = await decisionAssistant(command.estimateId, { operation: "correct-decision", reason: "Current correction" });
    const row = await db("chatEstimateDecisions").where({ id: next.ticket.id }).first();
    row.payload.value.note = "Unreviewed replacement";
    await db("chatEstimateDecisions").where({ id: next.ticket.id }).update({ payload: JSON.stringify(row.payload) });
    await assert.rejects(readEstimateChatDecision(db, identity(), enabled, next.binding), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatDecision(db, identity(), enabled, next.binding, "confirm"), EstimateDraftConflictError);
    assert.equal((await db("estimate_decisions").where({ estimateId: command.estimateId })).length, 2);
  });
  async function draftActionAssistant(
    operation: "revise" | "duplicate", estimateRef: string | null, role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string }, permissions = enabled,
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
    } else await db("chatTurns").where({ id: turnId }).update({ state: "running", leaseUntil: new Date(Date.now() + 60000) });
    const ticket = await proposeEstimateChatDraftAction(db, identity(role), permissions, turnId,
      { request: { operation, estimateRef } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateDraftActionChatBinding(ticket) };
  }
  async function draftActionBusinessSnapshot() {
    return Object.fromEntries(await Promise.all([
      "estimates", "estimate_items", "estimate_decisions", "estimate_activity", "estimate_operation_receipts",
      "estimateNotifications", "estimate_deliveries", "estimate_snapshots", "estimate_share_tokens", "jobs", "leads",
      "workspaceEstimateCounters", "workspaceEstimateRevisionCounters",
    ].map(async table => {
      const orderBy = table === "estimate_operation_receipts" ? "submissionId"
        : table === "workspaceEstimateRevisionCounters" ? "estimateNumber" : table === "workspaceEstimateCounters" ? "workspaceId" : "id";
      return [table, await db(table).where({ workspaceId }).orderBy(orderBy)];
    })));
  }
  await check("assistant Revise and Duplicate prepare/read/cancel without saving, sharing or allocating a revision", async () => {
    const command = await revisionFixture("https://payments.example.test/source-only");
    const before = await draftActionBusinessSnapshot();
    for (const operation of ["revise", "duplicate"] as const) {
      const run = await draftActionAssistant(operation, command.estimateId);
      const view = await readEstimateChatDraftAction(db, identity(), enabled, run.binding);
      assert.equal(view.ticket.state, "pending");
      assert.equal(view.ticket.plan.kind, "create");
      for (const text of ["recipientName", "recipientEmail", "internalNotes", "paymentLink", "items", "values", "STAFF_ONLY"]) {
        assert.equal(JSON.stringify(run.ticket).includes(text), false);
      }
      await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "open"), EstimateDraftConflictError);
      for (let retry = 0; retry < 2; retry++) {
        assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "cancel")).view.ticket.state, "cancelled");
      }
      await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    }
    assert.deepEqual(await draftActionBusinessSnapshot(), before);
  });
  await check("assistant Revise atomically creates one frozen-content Draft and leaves shared paper, token and CRM unchanged", async () => {
    const command = await revisionFixture("https://payments.example.test/review-again");
    await db("estimates").where({ id: command.estimateId }).update({ name: "Mutable saved name", scope: "Mutable scope", totalCents: 1 });
    await db("estimate_items").where({ estimateId: command.estimateId }).update({ description: "Mutable line", unitPriceCents: 1 });
    const token = await readEstimateCustomerLink(db, identity(), enabled, command.estimateId);
    assert.equal((await readPublicEstimate(db, token.path.slice(3), publicRequester)).state, "ready");
    const original = await db("estimates").where({ id: command.estimateId }).first();
    const frozen = await db("estimate_snapshots").where({ estimateId: command.estimateId }).first();
    const tokens = await db("estimate_share_tokens").where({ estimateId: command.estimateId });
    const parents = { jobs: await db("jobs").where({ workspaceId }), leads: await db("leads").where({ workspaceId }) };
    const run = await draftActionAssistant("revise", command.estimateId);
    const view = await readEstimateChatDraftAction(db, identity(), enabled, run.binding);
    assert.equal(view.review.values.details.name, "Sharing fixture");
    assert.equal(view.review.values.scope, "Customer scope");
    assert.equal(view.review.values.items[0].unitPrice, "100.00");
    assert.equal(view.review.totalCents, 10000);
    assert.equal(view.review.values.internalNotes, "");
    const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm")));
    assert.deepEqual(one, two);
    assert.equal(one.view.receipt?.reused, false); assert.equal(one.view.receipt?.revision, 2);
    assert.equal(one.view.receipt?.number, run.ticket.source.number);
    const resultId = one.view.receipt!.id;
    assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), original);
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId: command.estimateId }).first(), frozen);
    assert.deepEqual(await db("estimate_share_tokens").where({ estimateId: command.estimateId }), tokens);
    assert.deepEqual(await db("jobs").where({ workspaceId }), parents.jobs);
    assert.deepEqual(await db("leads").where({ workspaceId }), parents.leads);
    assert.equal((await db("estimate_deliveries").where({ estimateId: resultId })).length, 0);
    assert.equal((await db("estimateNotifications").where({ estimateId: resultId })).length, 0);
    assert.equal((await db("estimate_activity").where({ estimateId: resultId, type: "revision-created" }).first()).source, "assistant-confirmed");
    assert.equal((await db("chatEstimateDraftActionAudit").where({ proposalId: run.ticket.id, action: "confirmed" })).length, 1);
    assert.equal((await readEstimateSharingReview(db, identity(), enabled, resultId)).revision!.requiresPaymentLinkReview, true);
    assert.equal((await readEstimateChatDraftAction(db, identity(), enabled, run.binding)).receipt?.id, resultId);
    assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "open")).href, `/estimates/${resultId}?workspace=${workspaceId}`);
    assert.equal((await readPublicEstimate(db, token.path.slice(3), publicRequester)).state, "ready");
  });
  await check("assistant Duplicate copies saved content and private notes, clears recipient/date/payment and creates one new family", async () => {
    const command = await revisionFixture("https://payments.example.test/do-not-copy");
    await db("estimates").where({ id: command.estimateId }).update({ scope: "Saved mutable scope, not frozen scope" });
    const original = await db("estimates").where({ id: command.estimateId }).first();
    const run = await draftActionAssistant("duplicate", command.estimateId);
    const view = await readEstimateChatDraftAction(db, identity(), enabled, run.binding);
    assert.equal(view.review.values.internalNotes, "STAFF_ONLY_SHARING_FIXTURE");
    assert.equal(view.review.values.scope, "Saved mutable scope, not frozen scope");
    assert.equal(view.review.values.details.recipientName, "");
    assert.equal(view.review.values.details.recipientEmail, "");
    assert.equal(view.review.values.terms.validUntil, "");
    assert.equal(view.review.values.paymentLink, "");
    const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm")));
    assert.deepEqual(one, two);
    const result = await db("estimates").where({ id: one.view.receipt!.id }).first();
    assert.notEqual(result.estimateNumber, original.estimateNumber);
    assert.equal(result.revision, 1); assert.equal(result.sourceEstimateId, null);
    assert.equal(result.status, "draft"); assert.equal(result.internalNotes, "STAFF_ONLY_SHARING_FIXTURE");
    assert.equal(result.recipientName, ""); assert.equal(result.recipientEmail, "");
    assert.equal(result.paymentLink, ""); assert.equal(result.validUntil, null);
    assert.equal((await db("estimate_decisions").where({ estimateId: result.id })).length, 0);
    assert.equal((await db("estimate_snapshots").where({ estimateId: result.id })).length, 0);
    assert.equal((await db("estimate_activity").where({ estimateId: result.id }).first()).source, "assistant-confirmed");
    assert.deepEqual(await db("estimates").where({ id: command.estimateId }).first(), original);
    assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "open")).href, `/estimates/${result.id}?workspace=${workspaceId}`);
  });
  await check("assistant Revise reviews and reuses an existing edited Draft without overwriting or another business write", async () => {
    const command = await revisionFixture();
    const draft = await reviseEstimate(db, identity(), enabled, command);
    const seed = await readEstimateEditor(db, identity(), enabled, draft.id);
    await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      values: { ...seed.estimate!.values, internalNotes: "Keep private pending edits", scope: "Keep edited pending scope" },
    });
    const before = await draftActionBusinessSnapshot();
    const run = await draftActionAssistant("revise", command.estimateId);
    const view = await readEstimateChatDraftAction(db, identity(), enabled, run.binding);
    assert.deepEqual(view.ticket.plan, { kind: "reuse", revision: 2, existingDraft: { id: draft.id, version: 2 } });
    assert.equal(view.review.values.scope, "Keep edited pending scope");
    assert.equal(view.review.values.internalNotes, "Keep private pending edits");
    const confirmed = await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm");
    assert.equal(confirmed.view.receipt?.id, draft.id); assert.equal(confirmed.view.receipt?.reused, true);
    const after = await draftActionBusinessSnapshot();
    const { estimate_operation_receipts: beforeReceipts, ...beforeBusiness } = before;
    const { estimate_operation_receipts: afterReceipts, ...afterBusiness } = after;
    assert.deepEqual(afterBusiness, beforeBusiness);
    assert.equal(afterReceipts.length, beforeReceipts.length + 1);
  });
  await check("assistant exact number resolves current revision intent while explicit Draft IDs never silently retarget", async () => {
    const command = await revisionFixture();
    const draft = await reviseEstimate(db, identity(), enabled, command);
    const run = await draftActionAssistant("revise", draft.number);
    assert.equal(run.ticket.source.id, command.estimateId);
    assert.equal(run.ticket.plan.existingDraft?.id, draft.id);
    await assert.rejects(draftActionAssistant("revise", draft.id), EstimateDraftValidationError);
    const copy = await draftActionAssistant("duplicate", draft.number);
    assert.equal(copy.ticket.source.id, draft.id);
    await db("chatTurns").where({ id: copy.turnId }).update({
      state: "running", surfaceKey: "estimate.detail", pageContext: JSON.stringify({ recordRefs: [{ type: "estimate", id: command.estimateId }] }),
    });
    const page = await proposeEstimateChatDraftAction(db, identity(), enabled, copy.turnId,
      { request: { operation: "revise", estimateRef: null } }, new AbortController().signal);
    assert.equal(page.source.id, command.estimateId);
    await db("chatTurns").where({ id: copy.turnId }).update({ surfaceKey: "home" });
    await assert.rejects(proposeEstimateChatDraftAction(db, identity(), enabled, copy.turnId,
      { request: { operation: "revise", estimateRef: null } }, new AbortController().signal), EstimateDraftValidationError);
    assert.equal((await db("chatEstimateDraftActions").where({ id: page.id }).first()).state, "pending");
  });
  await check("assistant creation intent cannot silently become reuse after manual Revise or accept changed pending edits", async () => {
    const command = await revisionFixture(), run = await draftActionAssistant("revise", command.estimateId);
    const draft = await reviseEstimate(db, identity(), enabled, command);
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    const reuse = await draftActionAssistant("revise", command.estimateId);
    const seed = await readEstimateEditor(db, identity(), enabled, draft.id);
    await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version, values: { ...seed.estimate!.values, scope: "Later pending edit" },
    });
    await assert.rejects(readEstimateChatDraftAction(db, identity(), enabled, reuse.binding), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, reuse.binding, "confirm"), EstimateDraftConflictError);
    assert.equal((await db("estimates").where({ workspaceId, estimateNumber: Number(draft.number.slice(4)), status: "draft" })).length, 1);
  });
  await check("assistant Revise preserves deleted-revision gaps and preparation never advances the counter", async () => {
    const command = await revisionFixture(), draft = await reviseEstimate(db, identity(), enabled, command);
    await deleteEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version, typedConfirmation: draft.number,
    });
    const before = await db("workspaceEstimateRevisionCounters").where({ workspaceId, estimateNumber: Number(draft.number.slice(4)) }).first();
    const run = await draftActionAssistant("revise", command.estimateId);
    assert.equal(run.ticket.plan.revision, 3);
    assert.deepEqual(await db("workspaceEstimateRevisionCounters").where({ workspaceId, estimateNumber: before.estimateNumber }).first(), before);
    assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm")).view.receipt?.revision, 3);
  });
  await check("assistant Draft actions enforce independent parent/current grants without requiring edit/send for Duplicate", async () => {
    const command = await revisionFixture();
    for (const operation of ["revise", "duplicate"] as const) {
      const run = await draftActionAssistant(operation, command.estimateId);
      for (const permission of ["assistant.use", "estimates.read", "estimates.create", "jobs.read", ...(operation === "revise" ? ["estimates.update"] : [])]) {
        const permissions = enabled.filter(value => value !== permission);
        await assert.rejects(readEstimateChatDraftAction(db, identity(), permissions, run.binding), AuthorizationAccessError);
        await assert.rejects(operateEstimateChatDraftAction(db, identity(), permissions, run.binding, "confirm"), AuthorizationAccessError);
      }
    }
    const permissions = enabled.filter(value => !["estimates.update", "estimates.send", "estimates.decide"].includes(value));
    const copy = await draftActionAssistant("duplicate", command.estimateId, "owner", undefined, permissions);
    assert.equal((await operateEstimateChatDraftAction(db, identity(), permissions, copy.binding, "confirm")).view.ticket.state, "confirmed");
    const leadDraft = await sharingDraft("", "", { type: "lead", id: leadId });
    const lead = await draftActionAssistant("duplicate", leadDraft.id);
    await assert.rejects(readEstimateChatDraftAction(db, identity(), enabled.filter(value => value !== "leads.read"), lead.binding), AuthorizationAccessError);
  });
  await check("assistant Field Draft actions retain assigned-Job and prepared-by limits and redact after assignment loss", async () => {
    const command = await revisionFixture();
    await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.field });
    try {
      const revise = await draftActionAssistant("revise", command.estimateId, "field");
      assert.equal((await operateEstimateChatDraftAction(db, identity("field"), enabled, revise.binding, "confirm")).view.receipt?.revision, 2);
      await assert.rejects(draftActionAssistant("duplicate", command.estimateId, "field"), AuthorizationAccessError);
      await db("estimates").where({ id: command.estimateId }).update({ ownerId: users.field });
      const copy = await draftActionAssistant("duplicate", command.estimateId, "field");
      await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner });
      await assert.rejects(readEstimateChatDraftAction(db, identity("field"), enabled, copy.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatDraftAction(db, identity("field"), enabled, copy.binding, "confirm"), AuthorizationAccessError);
      assert.equal(await withWorkspaceAuthorization(db, identity("field"), enabled, false, (trx, context) =>
        visibleEstimateChatDraftAction(trx, context, copy.turnId)), undefined);
      const lead = await sharingDraft("", "", { type: "lead", id: leadId });
      await assert.rejects(draftActionAssistant("duplicate", lead.id, "field"), AuthorizationAccessError);
    } finally { await db("jobs").where({ id: jobId }).update({ primaryOwnerId: users.owner }); }
  });
  await check("assistant Draft actions bind ownership, completed turns, exact metadata and untampered private review", async () => {
    const command = await revisionFixture(), run = await draftActionAssistant("duplicate", command.estimateId);
    await assert.rejects(readEstimateChatDraftAction(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatDraftAction(db, { ...identity(), workspaceId: randomUUID() }, enabled, run.binding, "confirm"), AuthorizationAccessError);
    for (const change of [{ inputHash: "f".repeat(64) }, { reviewHash: "f".repeat(64) }, { authorizationVersion: "f".repeat(64) },
      { expectedVersion: 999 }, { estimateId: randomUUID() }, { actionType: "estimate.revise" }]) {
      await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, { ...run.binding, ...change }, "confirm"), EstimateDraftConflictError);
    }
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    await assert.rejects(readEstimateChatDraftAction(db, identity(), enabled, run.binding), EstimateDraftConflictError);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    const row = await db("chatEstimateDraftActions").where({ id: run.ticket.id }).first();
    row.payload.review.values.scope = "Not reviewed";
    await db("chatEstimateDraftActions").where({ id: run.ticket.id }).update({ payload: JSON.stringify(row.payload) });
    await assert.rejects(readEstimateChatDraftAction(db, identity(), enabled, run.binding), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
  });
  await check("assistant Draft action expiry rejects the exact boundary and evidence no longer releases the proposal", async () => {
    const command = await revisionFixture(), run = await draftActionAssistant("revise", command.estimateId), now = Date.now;
    try {
      Date.now = () => Date.parse(run.ticket.expiresAt) - 1;
      assert.equal((await readEstimateChatDraftAction(db, identity(), enabled, run.binding)).ticket.state, "pending");
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateDraftActionChatEvidenceAllowed(trx, context, run.turnId)), true);
      Date.now = () => Date.parse(run.ticket.expiresAt);
      assert.equal((await readEstimateChatDraftAction(db, identity(), enabled, run.binding)).ticket.state, "expired");
      for (const decision of ["confirm", "cancel", "open"] as const) {
        await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
      }
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateDraftActionChatEvidenceAllowed(trx, context, run.turnId)), false);
    } finally { Date.now = now; }
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
  });
  await check("assistant Draft action audit failure rolls back Draft/items/counters/activity/receipt and leaves intent pending", async () => {
    for (const operation of ["revise", "duplicate", "reuse"] as const) {
      const command = await revisionFixture();
      if (operation === "reuse") await reviseEstimate(db, identity(), enabled, command);
      const run = await draftActionAssistant(operation === "reuse" ? "revise" : operation, command.estimateId);
      const before = await draftActionBusinessSnapshot();
      const constraint = `assistant_draft_action_audit_${randomUUID().replaceAll("-", "")}`;
      await db.raw(`ALTER TABLE "chatEstimateDraftActionAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
      try {
        await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm"), /check constraint/);
        assert.deepEqual(await draftActionBusinessSnapshot(), before);
        assert.equal((await db("chatEstimateDraftActions").where({ id: run.ticket.id }).first()).state, "pending");
      } finally { await db.raw(`ALTER TABLE "chatEstimateDraftActionAudit" DROP CONSTRAINT "${constraint}"`); }
      assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm")).view.ticket.state, "confirmed");
    }
  });
  await check("assistant Draft action pending/confirmed receipts reject same-role membership replacement", async () => {
    const command = await revisionFixture(), pending = await draftActionAssistant("revise", command.estimateId, "office");
    const copy = await draftActionAssistant("duplicate", command.estimateId, "office");
    await operateEstimateChatDraftAction(db, identity("office"), enabled, copy.binding, "confirm");
    const member = await db("workspaceMemberships").where(identity("office")).first();
    await db("workspaceMemberships").where(identity("office")).delete();
    await db("workspaceMemberships").insert(member);
    for (const run of [pending, copy]) {
      await assert.rejects(readEstimateChatDraftAction(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatDraftAction(db, identity("office"), enabled, run.binding, "confirm"), AuthorizationAccessError);
    }
  });
  await check("all four Estimate proposal families supersede each other and invalid Draft action preparation preserves intent", async () => {
    const command = await revisionFixture(), source = await sharingDraft(), run = await decisionAssistant(command.estimateId);
    const action = await draftActionAssistant("revise", command.estimateId, "owner", run);
    assert.equal((await db("chatEstimateDecisions").where({ id: run.ticket.id }).first()).state, "superseded");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    await assert.rejects(proposeEstimateChatDraftAction(db, identity(), enabled, run.turnId,
      { request: { operation: "revise", estimateRef: randomUUID() } }, new AbortController().signal), AuthorizationAccessError);
    assert.equal((await db("chatEstimateDraftActions").where({ id: action.ticket.id }).first()).state, "pending");
    const share = await proposeEstimateChatShare(db, identity(), enabled, run.turnId,
      { request: { operation: "publish", estimateRef: source.id } }, new AbortController().signal);
    assert.equal((await db("chatEstimateDraftActions").where({ id: action.ticket.id }).first()).state, "superseded");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    assert.equal((await readEstimateChatDraftAction(db, identity(), enabled, action.binding)).ticket.state, "superseded");
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateDraftActionChatEvidenceAllowed(trx, context, run.turnId)), false);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const next = await proposeEstimateChatDraftAction(db, identity(), enabled, run.turnId,
      { request: { operation: "duplicate", estimateRef: source.id } }, new AbortController().signal);
    assert.equal((await db("chatEstimateShares").where({ id: share.id }).first()).state, "superseded");
    const drafted = await proposeEstimateChatDraft(db, identity(), enabled, run.turnId, { request: {
      operation: "update", estimateRef: source.id, parentType: null, parentRef: null,
      changes: { name: "Current Draft intent", scope: null, message: null, paymentTerms: null, termsNote: null,
        validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
    } }, new AbortController().signal);
    assert.equal((await db("chatEstimateDraftActions").where({ id: next.id }).first()).state, "superseded");
    const final = await proposeEstimateChatDraftAction(db, identity(), enabled, run.turnId,
      { request: { operation: "duplicate", estimateRef: source.id } }, new AbortController().signal);
    assert.equal((await db("chatEstimateDrafts").where({ id: drafted.draft.id }).first()).state, "superseded");
    await decisionAssistant(command.estimateId, {}, "owner", run);
    assert.equal((await db("chatEstimateDraftActions").where({ id: final.id }).first()).state, "superseded");
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, action.binding, "confirm"), EstimateDraftConflictError);
    assert.equal((await db("estimates").where({ id: source.id }).first()).name, "Sharing fixture");
  });
  await check("intent supersession replaces only the current turn's inherited pending provenance across all six service families", async () => {
    for (const sourceKind of ["decision", "draft-action", "void"] as const) {
      for (const nextKind of ["draft", "share", "decision", "draft-action", "void", "archive"] as const) {
        const command = await revisionFixture(), draft = await sharingDraft();
        const prior = sourceKind === "decision" ? await decisionAssistant(command.estimateId)
          : sourceKind === "void" ? await voidAssistant(command.estimateId) : await draftActionAssistant("revise", command.estimateId);
        const turnId = randomUUID(), dependentId = randomUUID(), retainedId = randomUUID();
        const field = sourceKind === "decision" ? "estimateDecisionEvidence"
          : sourceKind === "void" ? "estimateVoidEvidence" : "estimateDraftActionEvidence";
        const inherited = JSON.stringify([prior.turnId, retainedId]);
        await db("chatTurns").insert([
          { id: turnId, threadId: prior.threadId, ...identity(), clientTurnId: randomUUID(), requestHash: "fixture",
            surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000), [field]: inherited },
          { id: dependentId, threadId: prior.threadId, ...identity(), clientTurnId: randomUUID(), requestHash: "fixture",
            surfaceKey: "home", state: "completed", leaseUntil: new Date(Date.now() + 60000), [field]: inherited },
        ]);
        await db("chatMessages").insert({
          id: randomUUID(), turnId, role: "user", text: "Prepare the replacement review using saved values. Do not save it.",
        });
        if (nextKind === "archive") {
          const closed = await archiveFixture();
          await archiveAssistant("archive", closed.estimateId, "owner", { turnId, threadId: prior.threadId });
        } else if (nextKind === "void") await voidAssistant(command.estimateId, "Replace the pending intent", "owner", { turnId, threadId: prior.threadId });
        else if (nextKind === "draft-action") await draftActionAssistant("duplicate", command.estimateId, "owner", { turnId, threadId: prior.threadId });
        else if (nextKind === "decision") await decisionAssistant(command.estimateId, {}, "owner", { turnId, threadId: prior.threadId });
        else if (nextKind === "share") await proposeEstimateChatShare(db, identity(), enabled, turnId,
          { request: { operation: "publish", estimateRef: draft.id } }, new AbortController().signal);
        else await proposeEstimateChatDraft(db, identity(), enabled, turnId, { request: {
          operation: "update", estimateRef: draft.id, parentType: null, parentRef: null,
          changes: { name: "Replacement Draft review", scope: null, message: null, paymentTerms: null, termsNote: null,
            validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
        } }, new AbortController().signal);
        assert.deepEqual((await db("chatTurns").where({ id: turnId }).first())[field], [retainedId]);
        assert.deepEqual((await db("chatTurns").where({ id: dependentId }).first())[field], [prior.turnId, retainedId]);
      }
    }
  });
  await check("assistant Revise rejects ineligible sources while Duplicate preserves manual archived/closed eligibility", async () => {
    const command = await revisionFixture();
    for (const status of ["draft", "accepted", "superseded", "void"]) {
      await db("estimates").where({ id: command.estimateId }).update({ status });
      await assert.rejects(draftActionAssistant("revise", command.estimateId), EstimateDraftValidationError);
    }
    await db("estimates").where({ id: command.estimateId }).update({ status: "void", archivedAt: new Date() });
    await assert.rejects(draftActionAssistant("revise", command.estimateId), EstimateDraftValidationError);
    const run = await draftActionAssistant("duplicate", command.estimateId);
    assert.equal(run.ticket.source.archived, true);
    const result = await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm");
    assert.equal((await db("estimates").where({ id: result.view.receipt!.id }).first()).archivedAt, null);
  });
  await check("assistant Duplicate empty and zero-total Drafts retain explicit unavailable versus legitimate zero amounts", async () => {
    for (const empty of [true, false]) {
      const draft = await sharingDraft(), seed = await readEstimateEditor(db, identity(), enabled, draft.id);
      await updateEstimateDraft(db, identity(), enabled, {
        workspaceId, estimateId: draft.id, expectedVersion: draft.version,
        values: { ...seed.estimate!.values, items: empty ? [] : seed.estimate!.values.items.map(item => ({ ...item, included: true, unitPrice: "0" })) },
      });
      const run = await draftActionAssistant("duplicate", draft.id);
      assert.equal((await readEstimateChatDraftAction(db, identity(), enabled, run.binding)).review.totalCents, empty ? null : 0);
      const result = await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm");
      const row = await db("estimates").where({ id: result.view.receipt!.id }).first();
      assert.equal(row.totalCents === null ? null : Number(row.totalCents), empty ? null : 0);
    }
  });
  await check("assistant Duplicate reviews current catalog metadata without repricing and rejects later material changes", async () => {
    const materialId = randomUUID();
    await db("materialCatalog").insert({ id: materialId, workspaceId, name: "Original catalog name", unit: "hr", priceCents: 99999 });
    const draft = await sharingDraft(), seed = await readEstimateEditor(db, identity(), enabled, draft.id);
    await updateEstimateDraft(db, identity(), enabled, {
      workspaceId, estimateId: draft.id, expectedVersion: draft.version,
      values: { ...seed.estimate!.values, items: seed.estimate!.values.items.map(item => ({
        ...item, catalog: { id: materialId, name: "Original catalog name", unit: "hr", sku: "" },
      })) },
    });
    await db("materialCatalog").where({ id: materialId }).update({ name: "Current catalog name", unit: "each", sku: "CURRENT" });
    const run = await draftActionAssistant("duplicate", draft.id);
    const view = await readEstimateChatDraftAction(db, identity(), enabled, run.binding);
    assert.equal(view.review.values.items[0].unitPrice, "100.00");
    assert.equal(view.review.values.items[0].catalog?.name, "Current catalog name");
    const result = await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm");
    assert.deepEqual((await readEstimateEditor(db, identity(), enabled, result.view.receipt!.id)).estimate!.values, view.review.values);
    const stale = await draftActionAssistant("duplicate", draft.id);
    await db("materialCatalog").where({ id: materialId }).update({ name: "Later unreviewed name" });
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, stale.binding, "confirm"), EstimateDraftConflictError);
    const inactive = await draftActionAssistant("duplicate", draft.id);
    await db("materialCatalog").where({ id: materialId }).update({ archivedAt: new Date() });
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, inactive.binding, "confirm"), EstimateDraftValidationError);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatDraftAction(trx, context, inactive.turnId)), undefined);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateDraftActionChatEvidenceAllowed(trx, context, inactive.turnId)), false);
    await assert.rejects(draftActionAssistant("duplicate", draft.id, "owner", undefined,
      enabled.filter(value => value !== "materials.read")), AuthorizationAccessError);
  });
  await check("assistant Draft action confirmed navigation/redelivery fails closed after destination edit or deletion", async () => {
    for (const deleted of [false, true]) {
      const draft = await sharingDraft(), run = await draftActionAssistant("duplicate", draft.id);
      const result = await operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm");
      const saved = result.view.receipt!;
      if (deleted) await deleteEstimateDraft(db, identity(), enabled, {
        workspaceId, estimateId: saved.id, expectedVersion: saved.version, typedConfirmation: saved.number,
      });
      else {
        const seed = await readEstimateEditor(db, identity(), enabled, saved.id);
        await updateEstimateDraft(db, identity(), enabled, {
          workspaceId, estimateId: saved.id, expectedVersion: saved.version, values: { ...seed.estimate!.values, scope: "Later edit" },
        });
      }
      for (const decision of ["confirm", "open"] as const) {
        await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
      }
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        visibleEstimateChatDraftAction(trx, context, run.turnId)), undefined);
    }
  });
  await check("assistant Draft action revoked eligibility, parent changes, aborted requests and expired leases fail closed", async () => {
    const command = await revisionFixture(), run = await draftActionAssistant("revise", command.estimateId);
    await db("estimates").where({ id: command.estimateId }).update({ status: "accepted" });
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatDraftAction(trx, context, run.turnId)), undefined);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateDraftActionChatEvidenceAllowed(trx, context, run.turnId)), false);
    const copy = await draftActionAssistant("duplicate", command.estimateId);
    await db("jobs").where({ id: jobId }).increment("version", 1);
    await assert.rejects(readEstimateChatDraftAction(db, identity(), enabled, copy.binding), EstimateDraftConflictError);
    await db("chatTurns").where({ id: copy.turnId }).update({ state: "running" });
    const before = await db("chatEstimateDraftActions").where({ workspaceId });
    const controller = new AbortController(); controller.abort();
    await assert.rejects(proposeEstimateChatDraftAction(db, identity(), enabled, copy.turnId,
      { request: { operation: "duplicate", estimateRef: command.estimateId } }, controller.signal), { name: "AbortError" });
    await db("chatTurns").where({ id: copy.turnId }).update({ leaseUntil: new Date(0) });
    await assert.rejects(proposeEstimateChatDraftAction(db, identity(), enabled, copy.turnId,
      { request: { operation: "duplicate", estimateRef: command.estimateId } }, new AbortController().signal), EstimateDraftConflictError);
    await db("chatTurns").where({ id: copy.turnId }).update({ surfaceKey: "settings", leaseUntil: new Date(Date.now() + 60000) });
    await assert.rejects(proposeEstimateChatDraftAction(db, identity(), enabled, copy.turnId,
      { request: { operation: "duplicate", estimateRef: command.estimateId } }, new AbortController().signal), AuthorizationAccessError);
    assert.deepEqual(await db("chatEstimateDraftActions").where({ workspaceId }), before);
  });
  await check("assistant Draft actions bind the exact revision counter and retain metadata-only audits across guarded rollback", async () => {
    const command = await revisionFixture(), run = await draftActionAssistant("revise", command.estimateId);
    await db("workspaceEstimateRevisionCounters").where({
      workspaceId, estimateNumber: Number(run.ticket.source.number.slice(4)),
    }).increment("lastRevision", 1);
    await assert.rejects(operateEstimateChatDraftAction(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    const next = await draftActionAssistant("revise", command.estimateId);
    assert.equal(next.ticket.plan.revision, 3);
    assert.equal((await operateEstimateChatDraftAction(db, identity(), enabled, next.binding, "confirm")).view.receipt?.revision, 3);
    await assert.rejects(rollbackDraftActionMigration(db), /Retained Estimate Draft action proposals/);
    const audits = await db("chatEstimateDraftActionAudit").where({ workspaceId });
    assert.ok(audits.length > 0);
    for (const audit of audits) {
      assert.deepEqual(Object.keys(audit).sort(), ["action", "actorId", "createdAt", "id", "inputHash", "proposalId", "workspaceId"]);
    }
    assert.equal(await db.schema.hasTable("chatEstimateDraftActions"), true);
  });
  async function voidAssistant(
    estimateRef: string | null, reason: string | null = "Customer requested withdrawal", role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string }, permissions = enabled,
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
    } else await db("chatTurns").where({ id: turnId }).update({ state: "running", leaseUntil: new Date(Date.now() + 60000) });
    const message = await db("chatMessages").where({ turnId, role: "user" }).first("id");
    const text = reason === null ? "Prepare a withdrawal review. I have not supplied a reason." : `Withdraw this Estimate. Reason: ${reason}`;
    if (message) await db("chatMessages").where({ id: message.id }).update({ text });
    else await db("chatMessages").insert({ id: randomUUID(), turnId, role: "user", text });
    const ticket = await proposeEstimateChatVoid(db, identity(role), permissions, turnId,
      { request: { operation: "void", estimateRef, reason } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateVoidChatBinding(ticket) };
  }
  await check("assistant Void preparation/read/cancellation change no business data and expose only a compact ticket", async () => {
    const command = await revisionFixture(), before = await draftActionBusinessSnapshot();
    const run = await voidAssistant(command.estimateId);
    const view = await readEstimateChatVoid(db, identity(), enabled, run.binding);
    assert.equal(view.ticket.state, "pending"); assert.equal(view.canConfirm, true);
    assert.equal(view.review.reason, "Customer requested withdrawal");
    for (const field of ["reason", "recipientName", "recipientEmail", "totalCents", "paymentLink", "receipt", "href", "items"]) {
      assert.equal(JSON.stringify(run.ticket).includes(`"${field}"`), false);
    }
    await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "open"), EstimateDraftConflictError);
    for (let retry = 0; retry < 2; retry++) {
      assert.equal((await operateEstimateChatVoid(db, identity(), enabled, run.binding, "cancel")).view.ticket.state, "cancelled");
    }
    await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    assert.deepEqual(await draftActionBusinessSnapshot(), before);
    assert.deepEqual((await db("chatEstimateVoidAudit").where({ proposalId: run.ticket.id }).orderBy("createdAt")).map(row => row.action),
      ["proposed", "cancelled"]);
  });
  await check("assistant Void missing reasons are explicit and cannot confirm; invented reasons cannot replace pending intent", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId, null);
    const before = await draftActionBusinessSnapshot();
    const view = await readEstimateChatVoid(db, identity(), enabled, run.binding);
    assert.equal(view.canConfirm, false); assert.equal(view.review.reason, "");
    await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), EstimateDraftValidationError);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    await assert.rejects(proposeEstimateChatVoid(db, identity(), enabled, run.turnId,
      { request: { operation: "void", estimateRef: command.estimateId, reason: "Invented withdrawal reason" } },
      new AbortController().signal), EstimateDraftValidationError);
    assert.equal((await db("chatEstimateVoids").where({ id: run.ticket.id }).first()).state, "pending");
    assert.deepEqual(await draftActionBusinessSnapshot(), before);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    await operateEstimateChatVoid(db, identity(), enabled, run.binding, "cancel");
  });
  await check("assistant Void reuses the manual atomic withdrawal, preserves frozen content and writes private chat history once", async () => {
    const { estimateId, delivery } = await queueEmail();
    const link = await readEstimateCustomerLink(db, identity(), enabled, estimateId);
    const frozen = await db("estimate_snapshots").where({ estimateId }).first();
    const parentRows = { jobs: await db("jobs").where({ workspaceId }), leads: await db("leads").where({ workspaceId }) };
    const notifications = await db("estimateNotifications").where({ workspaceId }).orderBy("id");
    const deliveries = await db("estimate_deliveries").where({ workspaceId }).count({ count: "*" }).first();
    const run = await voidAssistant(estimateId, "PRIVATE_WITHDRAWAL_REASON\nUser supplied second line");
    const [first, concurrent] = await Promise.all([
      operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"),
      operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"),
    ]);
    assert.deepEqual(first, concurrent);
    assert.deepEqual(await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), first);
    assert.equal(first.view.receipt?.version, run.ticket.estimate.version + 1);
    assert.equal(first.view.receipt?.status, "void");
    assert.equal((await readEstimateChatVoid(db, identity(), enabled, run.binding)).ticket.state, "confirmed");
    assert.equal((await operateEstimateChatVoid(db, identity(), enabled, run.binding, "open")).href,
      `/estimates/${estimateId}?workspace=${workspaceId}`);
    await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "cancel"), EstimateDraftConflictError);
    const row = await db("estimates").where({ id: estimateId }).first();
    assert.equal(row.archivedAt, null); assert.equal(row.voidReason, first.view.review.reason);
    assert.deepEqual(await db("estimate_snapshots").where({ estimateId }).first(), frozen);
    assert.equal(JSON.stringify(frozen).includes("PRIVATE_WITHDRAWAL_REASON"), false);
    assert.equal((await db("estimate_share_tokens").where({ estimateId }).whereNull("revokedAt")).length, 0);
    const stopped = await db("estimate_deliveries").where({ id: delivery.id }).first();
    assert.equal(stopped.status, "failed"); assert.equal(stopped.failureCode, "inactive");
    assert.deepEqual(await db("estimate_deliveries").where({ workspaceId }).count({ count: "*" }).first(), deliveries);
    assert.deepEqual(await db("estimateNotifications").where({ workspaceId }).orderBy("id"), notifications);
    assert.deepEqual({ jobs: await db("jobs").where({ workspaceId }), leads: await db("leads").where({ workspaceId }) }, parentRows);
    const activity = await db("estimate_activity").where({ estimateId, type: "voided" });
    assert.equal(activity.length, 1); assert.equal(activity[0].source, "assistant-confirmed"); assert.equal(activity[0].actorId, users.owner);
    assert.equal(activity[0].changes.reason, first.view.review.reason);
    const history = await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId });
    const withdrawal = history.events.find(event => event.kind === "voided");
    assert.equal(withdrawal?.source.type, "chat");
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 1);
    assert.equal((await db("chatEstimateVoidAudit").where({ proposalId: run.ticket.id, action: "confirmed" })).length, 1);
    assert.deepEqual(await readPublicEstimate(db, link.path.slice(3), publicRequester), { state: "withdrawn" });
  });
  await check("assistant Void preserves the exact trimmed 500-character user quote, including interior whitespace", async () => {
    const command = await revisionFixture();
    const reason = `Line one\n${"x".repeat(489)}`;
    assert.equal(reason.length, 498);
    const run = await voidAssistant(command.estimateId, ` ${reason} `);
    const result = await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm");
    assert.equal(result.view.review.reason, reason);
    const boundary = await revisionFixture(), limit = await voidAssistant(boundary.estimateId, "x".repeat(500));
    await operateEstimateChatVoid(db, identity(), enabled, limit.binding, "confirm");
    for (const invalid of [" ", "x".repeat(501)]) {
      await assert.rejects(voidAssistant((await revisionFixture()).estimateId, invalid));
    }
  });
  await check("assistant Void rejects Draft/closed/archived and read-time expired sources without withdrawing", async () => {
    const command = await revisionFixture();
    for (const status of ["draft", "accepted", "declined", "expired", "superseded", "void"]) {
      await db("estimates").where({ id: command.estimateId }).update({ status });
      await assert.rejects(voidAssistant(command.estimateId), EstimateDraftValidationError);
    }
    await db("estimates").where({ id: command.estimateId }).update({ status: "published", archivedAt: new Date() });
    await assert.rejects(voidAssistant(command.estimateId), EstimateDraftValidationError);
    await db("estimates").where({ id: command.estimateId }).update({ archivedAt: null, validUntil: localDate(-1) });
    await assert.rejects(voidAssistant(command.estimateId), EstimateDraftValidationError);
    assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "voided" })).length, 0);
  });
  await check("assistant Void binds read/void/assistant/parent grants independently and does not require send/edit/decision", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
    for (const permission of ["assistant.use", "estimates.read", "estimates.void", "jobs.read"]) {
      const permissions = enabled.filter(value => value !== permission);
      await assert.rejects(voidAssistant(command.estimateId, "User reason", "owner", undefined, permissions), AuthorizationAccessError);
      await assert.rejects(readEstimateChatVoid(db, identity(), permissions, run.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatVoid(db, identity(), permissions, run.binding, "confirm"), AuthorizationAccessError);
    }
    await assert.rejects(voidAssistant(command.estimateId, "User reason", "field"), AuthorizationAccessError);
    const permissions = enabled.filter(value => !["estimates.update", "estimates.send", "estimates.decide", "estimates.archive", "estimates.delete"].includes(value));
    const allowed = await voidAssistant(command.estimateId, "User reason", "office", undefined, permissions);
    assert.equal((await operateEstimateChatVoid(db, identity("office"), permissions, allowed.binding, "confirm")).view.ticket.state, "confirmed");
  });
  await check("assistant Void supports Lead parents while independently enforcing current Lead access", async () => {
    const draft = await sharingDraft("", "", { type: "lead", id: leadId });
    await publishRevision(draft.id);
    const run = await voidAssistant(draft.id);
    const review = await readEstimateChatVoid(db, identity(), enabled, run.binding);
    assert.equal(review.review.parent.type, "lead"); assert.equal(review.review.parent.id, leadId);
    await assert.rejects(readEstimateChatVoid(db, identity(), enabled.filter(value => value !== "leads.read"), run.binding), AuthorizationAccessError);
    await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm");
  });
  await check("assistant Void ownership, completed-turn and exact metadata bindings are mandatory", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
    await assert.rejects(readEstimateChatVoid(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatVoid(db, { ...identity(), workspaceId: randomUUID() }, enabled, run.binding, "confirm"), AuthorizationAccessError);
    for (const change of [{ inputHash: "f".repeat(64) }, { reviewHash: "f".repeat(64) }, { snapshotHash: "f".repeat(64) },
      { authorizationVersion: "f".repeat(64) }, { expectedVersion: 999 }, { estimateId: randomUUID() }]) {
      await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, { ...run.binding, ...change }, "confirm"), EstimateDraftConflictError);
    }
    for (const state of ["running", "failed", "cancelled"]) {
      await db("chatTurns").where({ id: run.turnId }).update({ state });
      await assert.rejects(readEstimateChatVoid(db, identity(), enabled, run.binding), EstimateDraftConflictError);
      await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    }
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    const threadId = randomUUID();
    await db("chatThreads").insert({ id: threadId, ...identity() });
    await db("chatEstimateVoids").where({ id: run.ticket.id }).update({ threadId });
    await assert.rejects(readEstimateChatVoid(db, identity(), enabled, run.binding), AuthorizationAccessError);
  });
  await check("assistant Void exact proposal expiry blocks confirm/cancel/open and invalidates evidence", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId), now = Date.now;
    try {
      Date.now = () => Date.parse(run.ticket.expiresAt) - 1;
      assert.equal((await readEstimateChatVoid(db, identity(), enabled, run.binding)).ticket.state, "pending");
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateVoidChatEvidenceAllowed(trx, context, run.turnId)), true);
      Date.now = () => Date.parse(run.ticket.expiresAt);
      assert.equal((await readEstimateChatVoid(db, identity(), enabled, run.binding)).ticket.state, "expired");
      for (const decision of ["confirm", "cancel", "open"] as const) {
        await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
      }
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateVoidChatEvidenceAllowed(trx, context, run.turnId)), false);
    } finally { Date.now = now; }
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
  });
  await check("assistant Void detects tampered private reason, readiness, row state and source evidence", async () => {
    for (const mutation of ["reason", "readiness", "state", "parent", "date"] as const) {
      const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
      const row = await db("chatEstimateVoids").where({ id: run.ticket.id }).first();
      if (mutation === "reason") {
        row.payload.review.reason = "Unreviewed replacement";
        await db("chatEstimateVoids").where({ id: run.ticket.id }).update({ payload: JSON.stringify(row.payload) });
      } else if (mutation === "readiness") {
        row.payload.canConfirm = false;
        await db("chatEstimateVoids").where({ id: run.ticket.id }).update({ payload: JSON.stringify(row.payload) });
      } else if (mutation === "state") await db("chatEstimateVoids").where({ id: run.ticket.id }).update({ state: "confirmed" });
      else if (mutation === "parent") await db("jobs").where({ id: jobId }).increment("version", 1);
      else await db("estimates").where({ id: command.estimateId }).update({ validUntil: localDate(-1) });
      await assert.rejects(readEstimateChatVoid(db, identity(), enabled, run.binding));
      await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"));
      assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "voided" })).length, 0);
    }
  });
  await check("assistant Void retains frozen snapshot immutability without disabling database protections", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
    await assert.rejects(db("estimate_snapshots").where({ estimateId: command.estimateId }).update({ contentHash: "f".repeat(64) }),
      /Estimate snapshots are immutable/);
    assert.equal((await readEstimateChatVoid(db, identity(), enabled, run.binding)).ticket.snapshotHash, command.snapshotHash);
    await operateEstimateChatVoid(db, identity(), enabled, run.binding, "cancel");
  });
  await check("assistant Void conflicts with later manual withdrawal rather than claiming its receipt or overwriting its reason", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
    await voidEstimate(db, identity(), enabled, {
      workspaceId, estimateId: command.estimateId, expectedVersion: command.expectedVersion,
      submissionId: command.submissionId, reason: "Different manual withdrawal",
    });
    await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
    assert.equal((await db("estimates").where({ id: command.estimateId }).first()).voidReason, "Different manual withdrawal");
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
  });
  await check("assistant Void audit failure rolls back withdrawal, tokens, delivery stops, activity, receipt and proposal", async () => {
    const { estimateId } = await queueEmail(), run = await voidAssistant(estimateId);
    const before = await draftActionBusinessSnapshot();
    const constraint = `assistant_void_audit_${randomUUID().replaceAll("-", "")}`;
    await db.raw(`ALTER TABLE "chatEstimateVoidAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
    try {
      await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm"), /check constraint/);
      assert.deepEqual(await draftActionBusinessSnapshot(), before);
      assert.equal((await db("chatEstimateVoids").where({ id: run.ticket.id }).first()).state, "pending");
    } finally { await db.raw(`ALTER TABLE "chatEstimateVoidAudit" DROP CONSTRAINT "${constraint}"`); }
    assert.equal((await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm")).view.ticket.state, "confirmed");
  });
  await check("assistant Void pending and confirmed outcomes reject same-role membership replacement", async () => {
    const pendingSource = await revisionFixture(), savedSource = await revisionFixture();
    const pending = await voidAssistant(pendingSource.estimateId, "User reason", "office");
    const saved = await voidAssistant(savedSource.estimateId, "User reason", "office");
    await operateEstimateChatVoid(db, identity("office"), enabled, saved.binding, "confirm");
    const member = await db("workspaceMemberships").where(identity("office")).first();
    await db("workspaceMemberships").where(identity("office")).delete();
    await db("workspaceMemberships").insert(member);
    for (const run of [pending, saved]) {
      await assert.rejects(readEstimateChatVoid(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatVoid(db, identity("office"), enabled, run.binding, "confirm"), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatVoid(db, identity("office"), enabled, run.binding, "open"),
        run === saved ? AuthorizationAccessError : EstimateDraftConflictError);
      assert.equal(await withWorkspaceAuthorization(db, identity("office"), enabled, false, (trx, context) =>
        visibleEstimateChatVoid(trx, context, run.turnId)), undefined);
      assert.equal(await withWorkspaceAuthorization(db, identity("office"), enabled, false, (trx, context) =>
        estimateVoidChatEvidenceAllowed(trx, context, run.turnId)), false);
    }
  });
  await check("assistant Void restored receipts/retries/opening reject later archive or saved-result changes", async () => {
    for (const changed of ["archive", "reason", "version"] as const) {
      const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
      const saved = await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm");
      if (changed === "archive") await setEstimateArchived(db, identity(), enabled, {
        workspaceId, estimateId: command.estimateId, submissionId: randomUUID(),
        expectedVersion: saved.view.receipt!.version, mode: "archive",
      });
      else await db("estimates").where({ id: command.estimateId }).update(changed === "reason"
        ? { voidReason: "Changed after confirmation" } : { version: saved.view.receipt!.version + 1 });
      for (const decision of ["confirm", "open"] as const) {
        await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
      }
      await assert.rejects(readEstimateChatVoid(db, identity(), enabled, run.binding), EstimateDraftConflictError);
      assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "voided" })).length, 1);
    }
  });
  await check("assistant Void resolves only exact current revision or selected-page identity without retargeting older UUIDs", async () => {
    const command = await revisionFixture(), draft = await reviseEstimate(db, identity(), enabled, command);
    const number = (await readEstimateEditor(db, identity(), enabled, draft.id)).estimate!.number;
    await assert.rejects(voidAssistant(number), EstimateDraftValidationError);
    const exact = await voidAssistant(command.estimateId);
    assert.equal(exact.ticket.estimate.id, command.estimateId);
    await db("chatTurns").where({ id: exact.turnId }).update({
      state: "running", surfaceKey: "estimate.detail", pageContext: JSON.stringify({ recordRefs: [{ type: "estimate", id: command.estimateId }] }),
    });
    const page = await proposeEstimateChatVoid(db, identity(), enabled, exact.turnId,
      { request: { operation: "void", estimateRef: null, reason: null } }, new AbortController().signal);
    assert.equal(page.estimate.id, command.estimateId);
    await db("chatTurns").where({ id: exact.turnId }).update({ surfaceKey: "home", pageContext: "{}" });
    await assert.rejects(proposeEstimateChatVoid(db, identity(), enabled, exact.turnId,
      { request: { operation: "void", estimateRef: null, reason: null } }, new AbortController().signal), EstimateDraftValidationError);
  });
  await check("assistant Void participates in pending supersession both ways with all four approved proposal families", async () => {
    for (const kind of ["draft", "share", "decision", "draft-action"] as const) {
      const command = await revisionFixture(), draft = await sharingDraft();
      const first = await voidAssistant(command.estimateId);
      await db("chatTurns").where({ id: first.turnId }).update({ state: "running" });
      if (kind === "draft-action") await draftActionAssistant("duplicate", command.estimateId, "owner", first);
      else if (kind === "decision") await decisionAssistant(command.estimateId, {}, "owner", first);
      else if (kind === "share") await proposeEstimateChatShare(db, identity(), enabled, first.turnId,
        { request: { operation: "publish", estimateRef: draft.id } }, new AbortController().signal);
      else await proposeEstimateChatDraft(db, identity(), enabled, first.turnId, { request: {
        operation: "update", estimateRef: draft.id, parentType: null, parentRef: null,
        changes: { name: "Replace withdrawal intent", scope: null, message: null, paymentTerms: null, termsNote: null,
          validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
      } }, new AbortController().signal);
      assert.equal((await db("chatEstimateVoids").where({ id: first.ticket.id }).first()).state, "superseded");
      const next = await voidAssistant(command.estimateId, "Replacement reason", "owner", first);
      const table = { draft: "chatEstimateDrafts", share: "chatEstimateShares", decision: "chatEstimateDecisions", "draft-action": "chatEstimateDraftActions" }[kind];
      assert.equal((await db(table).where({ turnId: first.turnId }).where({ state: "pending" })).length, 0);
      await assert.rejects(operateEstimateChatVoid(db, identity(), enabled, first.binding, "confirm"), EstimateDraftConflictError);
      await operateEstimateChatVoid(db, identity(), enabled, next.binding, "cancel");
      assert.equal((await db("estimate_activity").where({ estimateId: command.estimateId, type: "voided" })).length, 0);
    }
  });
  await check("assistant Void aborted, unleased or unsupported turns cannot persist a proposal", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const before = await db("chatEstimateVoids").where({ workspaceId }).orderBy("id");
    const controller = new AbortController(); controller.abort();
    const input = { request: { operation: "void", estimateRef: command.estimateId, reason: null } };
    await assert.rejects(proposeEstimateChatVoid(db, identity(), enabled, run.turnId, input, controller.signal), { name: "AbortError" });
    await db("chatTurns").where({ id: run.turnId }).update({ leaseUntil: new Date(0) });
    await assert.rejects(proposeEstimateChatVoid(db, identity(), enabled, run.turnId, input, new AbortController().signal), EstimateDraftConflictError);
    await db("chatTurns").where({ id: run.turnId }).update({ surfaceKey: "settings", leaseUntil: new Date(Date.now() + 60000) });
    await assert.rejects(proposeEstimateChatVoid(db, identity(), enabled, run.turnId, input, new AbortController().signal), AuthorizationAccessError);
    assert.deepEqual(await db("chatEstimateVoids").where({ workspaceId }).orderBy("id"), before);
  });
  await check("assistant Void confirmed evidence survives proposal expiry only while current saved state and grants agree", async () => {
    const command = await revisionFixture(), run = await voidAssistant(command.estimateId), now = Date.now;
    await operateEstimateChatVoid(db, identity(), enabled, run.binding, "confirm");
    try {
      Date.now = () => Date.parse(run.ticket.expiresAt) + 1;
      assert.equal((await readEstimateChatVoid(db, identity(), enabled, run.binding)).ticket.state, "confirmed");
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateVoidChatEvidenceAllowed(trx, context, run.turnId)), true);
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled.filter(value => value !== "estimates.void"), false, (trx, context) =>
        estimateVoidChatEvidenceAllowed(trx, context, run.turnId)), false);
    } finally { Date.now = now; }
  });
  await check("assistant Void retains only metadata audit columns and guards migration rollback over retained intent", async () => {
    await assert.rejects(rollbackVoidMigration(db), /Retained Estimate Void proposals/);
    const audits = await db("chatEstimateVoidAudit").where({ workspaceId });
    assert.ok(audits.length > 0);
    for (const audit of audits) {
      assert.deepEqual(Object.keys(audit).sort(), ["action", "actorId", "createdAt", "id", "inputHash", "proposalId", "workspaceId"]);
      assert.equal(JSON.stringify(audit).includes("Customer requested withdrawal"), false);
    }
    assert.equal(await db.schema.hasTable("chatEstimateVoids"), true);
  });
  async function archiveAssistant(
    operation: "archive" | "restore", estimateRef: string | null, role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string }, permissions = enabled,
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
    } else await db("chatTurns").where({ id: turnId }).update({ state: "running", leaseUntil: new Date(Date.now() + 60000) });
    if (!await db("chatMessages").where({ turnId, role: "user" }).first("id")) {
      await db("chatMessages").insert({
        id: randomUUID(), turnId, role: "user", text: "Prepare the requested Archive/Restore review. Do not save it.",
      });
    }
    const ticket = await proposeEstimateChatArchive(db, identity(role), permissions, turnId,
      { request: { operation, estimateRef } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateArchiveChatBinding(ticket) };
  }
  async function draftDeleteAssistant(
    estimateRef: string | null, role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string }, permissions = enabled,
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
    } else await db("chatTurns").where({ id: turnId }).update({ state: "running", leaseUntil: new Date(Date.now() + 60000) });
    if (!await db("chatMessages").where({ turnId, role: "user" }).first("id")) {
      await db("chatMessages").insert({
        id: randomUUID(), turnId, role: "user",
        text: "Review this exact Draft for permanent deletion. Do not delete without typing its number.",
      });
    }
    const ticket = await proposeEstimateChatDraftDelete(db, identity(role), permissions, turnId,
      { request: { operation: "delete-draft", estimateRef } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateDraftDeleteChatBinding(ticket) };
  }
  async function conversionAssistant(
    estimateRef: string | null,
    role: keyof typeof users = "owner",
    conversation?: { turnId: string; threadId: string },
    permissions = enabled,
  ) {
    const turnId = conversation?.turnId ?? randomUUID(), threadId = conversation?.threadId ?? randomUUID();
    if (!conversation) {
      await db("chatThreads").insert({ id: threadId, ...identity(role) });
      await db("chatTurns").insert({
        id: turnId, threadId, ...identity(role), clientTurnId: randomUUID(), requestHash: "fixture",
        surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
      });
    } else await db("chatTurns").where({ id: turnId }).update({
      state: "running", leaseUntil: new Date(Date.now() + 60000),
    });
    const ticket = await proposeEstimateChatConversion(db, identity(role), permissions, turnId,
      { request: { operation: "convert", estimateRef } }, new AbortController().signal);
    await db("chatTurns").where({ id: turnId }).update({ state: "completed" });
    return { ticket, turnId, threadId, binding: estimateConversionChatBinding(ticket) };
  }
  await check("assistant Archive/Restore preparation, read and cancel expose compact tickets without changing business data", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      if (operation === "restore") await setEstimateArchived(db, identity(), enabled, source);
      const before = await draftActionBusinessSnapshot(), run = await archiveAssistant(operation, source.estimateId);
      const view = await readEstimateChatArchive(db, identity(), enabled, run.binding);
      assert.equal(view.ticket.state, "pending"); assert.equal(view.ticket.actionType, `estimate.${operation}`);
      for (const field of ["recipientName", "recipientEmail", "totalCents", "reason", "parent", "receipt", "href", "items", "paymentLink"]) {
        assert.equal(JSON.stringify(run.ticket).includes(`"${field}"`), false);
      }
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "open"), EstimateDraftConflictError);
      for (let retry = 0; retry < 2; retry++) {
        assert.equal((await operateEstimateChatArchive(db, identity(), enabled, run.binding, "cancel")).view.ticket.state, "cancelled");
      }
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
      assert.deepEqual(await draftActionBusinessSnapshot(), before);
      assert.deepEqual((await db("chatEstimateArchiveAudit").where({ proposalId: run.ticket.id }).orderBy("createdAt")).map(row => row.action),
        ["proposed", "cancelled"]);
    }
  });
  await check("assistant Archive/Restore reuse the manual metadata-only transaction with one checked result, staff history and receipt", async () => {
    const source = await archiveFixture(), estimateId = source.estimateId;
    const link = await readEstimateCustomerLink(db, identity(), enabled, estimateId);
    const initial = await db("estimates").where({ id: estimateId }).first();
    for (const operation of ["archive", "restore"] as const) {
      const original = await draftActionBusinessSnapshot();
      const before = await db("estimates").where({ id: estimateId }).first(), run = await archiveAssistant(operation, estimateId, "office");
      const [saved, concurrent] = await Promise.all([
        operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "confirm"),
        operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "confirm"),
      ]);
      assert.deepEqual(saved, concurrent);
      assert.deepEqual(await operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "confirm"), saved);
      assert.equal("href" in saved, false);
      const receipt = saved.view.receipt!;
      assert.equal(receipt.version, before.version + 1); assert.equal(receipt.archived, operation === "archive");
      assert.equal(saved.view.ticket.estimate.archived, operation === "restore");
      const current = await db("estimates").where({ id: estimateId }).first();
      assert.deepEqual(current, {
        ...before, version: receipt.version, updatedAt: new Date(receipt.updatedAt),
        archivedAt: operation === "archive" ? current.archivedAt : null, archivedBy: operation === "archive" ? users.office : null,
      });
      assert.equal((await readEstimateChatArchive(db, identity("office"), enabled, run.binding)).ticket.state, "confirmed");
      assert.equal((await operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "open")).href,
        `/estimates/${estimateId}?workspace=${workspaceId}`);
      await assert.rejects(operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "cancel"), EstimateDraftConflictError);
      const type = operation === "archive" ? "archived" : "restored";
      const activity = await db("estimate_activity").where({ estimateId, type });
      assert.equal(activity.length, 1); assert.equal(activity[0].source, "assistant-confirmed"); assert.equal(activity[0].actorId, users.office);
      assert.deepEqual(activity[0].changes, {});
      assert.equal((await readEstimateLifecycle(db, identity(), enabled, { workspaceId, estimateId })).events.find(event => event.kind === type)?.source.type, "chat");
      assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id, operation })).length, 1);
      assert.equal((await db("chatEstimateArchiveAudit").where({ proposalId: run.ticket.id, action: "confirmed" })).length, 1);
      const after = await draftActionBusinessSnapshot();
      for (const table of Object.keys(original).filter(table => !["estimates", "estimate_activity", "estimate_operation_receipts"].includes(table))) {
        assert.deepEqual(after[table], original[table], table);
      }
      assert.equal((await readPublicEstimate(db, link.path.slice(3), publicRequester)).state, "ready");
    }
    const restored = await db("estimates").where({ id: estimateId }).first();
    assert.deepEqual(restored, { ...initial, version: initial.version + 2, updatedAt: restored.updatedAt });
  });
  await check("assistant Archive accepts effective closed states without rewriting status or requiring frozen paper", async () => {
    for (const status of ["declined", "expired", "superseded", "void", "read-time-expired"]) {
      const source = await sharingDraft();
      await db("estimates").where({ id: source.id }).update(status === "read-time-expired"
        ? { status: "published", validUntil: localDate(-1) } : { status });
      assert.equal((await db("estimate_snapshots").where({ estimateId: source.id })).length, 0);
      const run = await archiveAssistant("archive", source.id);
      assert.equal(run.ticket.estimate.status, status === "read-time-expired" ? "expired" : status);
      await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
      assert.equal((await db("estimates").where({ id: source.id }).first()).status, status === "read-time-expired" ? "published" : status);
    }
  });
  await check("assistant Archive/Restore reject wrong states without replacing valid intent or changing business data", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    const active = await sharingDraft();
    const before = await draftActionBusinessSnapshot();
    for (const status of ["draft", "sent", "published", "accepted"]) {
      await db("estimates").where({ id: active.id }).update({ status, validUntil: localDate(5) });
      await assert.rejects(archiveAssistant("archive", active.id, "owner", run), EstimateDraftValidationError);
    }
    await assert.rejects(archiveAssistant("restore", source.estimateId, "owner", run), EstimateDraftValidationError);
    assert.equal((await db("chatEstimateArchives").where({ id: run.ticket.id }).first()).state, "pending");
    assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
    const after = await draftActionBusinessSnapshot();
    for (const table of Object.keys(before).filter(table => table !== "estimates")) assert.deepEqual(after[table], before[table]);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
  });
  await check("assistant Restore accepts any currently archived status, including incomplete Drafts, without adding a frozen-paper requirement", async () => {
    for (const status of ["draft", "sent", "published", "accepted", "declined", "expired", "superseded", "void"]) {
      const draft = await sharingDraft();
      await db("estimates").where({ id: draft.id }).update({ status, archivedAt: new Date(), archivedBy: users.owner, recipientName: "" });
      const run = await archiveAssistant("restore", draft.id);
      assert.equal(run.ticket.estimate.status, status);
      const result = await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
      assert.equal(result.view.receipt?.archived, false);
      assert.equal((await db("estimates").where({ id: draft.id }).first()).status, status);
      assert.equal((await db("estimate_snapshots").where({ estimateId: draft.id })).length, 0);
    }
  });
  await check("assistant Archive/Restore require read/archive/assistant/Job access independently and not send/edit/decision/delete", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      if (operation === "restore") await setEstimateArchived(db, identity(), enabled, source);
      const run = await archiveAssistant(operation, source.estimateId);
      for (const permission of ["assistant.use", "estimates.read", "estimates.archive", "jobs.read"]) {
        const permissions = enabled.filter(value => value !== permission);
        await assert.rejects(archiveAssistant(operation, source.estimateId, "owner", undefined, permissions), AuthorizationAccessError);
        await assert.rejects(readEstimateChatArchive(db, identity(), permissions, run.binding), AuthorizationAccessError);
        for (const decision of ["confirm", "cancel"] as const) {
          await assert.rejects(operateEstimateChatArchive(db, identity(), permissions, run.binding, decision), AuthorizationAccessError);
        }
      }
      await assert.rejects(archiveAssistant(operation, source.estimateId, "field"), AuthorizationAccessError);
      const permissions = enabled.filter(value => !["estimates.create", "estimates.update", "estimates.send", "estimates.decide", "estimates.void", "estimates.delete"].includes(value));
      const separate = await archiveFixture();
      if (operation === "restore") await setEstimateArchived(db, identity(), enabled, separate);
      const allowed = await archiveAssistant(operation, separate.estimateId, "office", undefined, permissions);
      assert.equal((await operateEstimateChatArchive(db, identity("office"), permissions, allowed.binding, "confirm")).view.ticket.state, "confirmed");
    }
  });
  await check("assistant Archive/Restore support Lead parents with independent current Lead read checks", async () => {
    const draft = await sharingDraft("", "", { type: "lead", id: leadId });
    await db("estimates").where({ id: draft.id }).update({ status: "void" });
    for (const operation of ["archive", "restore"] as const) {
      const run = await archiveAssistant(operation, draft.id);
      const view = await readEstimateChatArchive(db, identity(), enabled, run.binding);
      assert.equal(view.review.parent.type, "lead"); assert.equal(view.review.parent.id, leadId);
      const permissions = enabled.filter(value => value !== "leads.read");
      await assert.rejects(readEstimateChatArchive(db, identity(), permissions, run.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatArchive(db, identity(), permissions, run.binding, "confirm"), AuthorizationAccessError);
      await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
    }
  });
  await check("assistant Archive/Restore bind ownership, completed turns, source, action and all metadata exactly", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    await assert.rejects(readEstimateChatArchive(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatArchive(db, { ...identity(), workspaceId: randomUUID() }, enabled, run.binding, "confirm"), AuthorizationAccessError);
    for (const change of [{ inputHash: "f".repeat(64) }, { reviewHash: "f".repeat(64) }, { authorizationVersion: "f".repeat(64) },
      { expectedVersion: 999 }, { estimateId: randomUUID() }, { actionType: "estimate.restore" }]) {
      await assert.rejects(readEstimateChatArchive(db, identity(), enabled, { ...run.binding, ...change }), EstimateDraftConflictError);
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, { ...run.binding, ...change }, "confirm"), EstimateDraftConflictError);
    }
    for (const state of ["running", "failed", "cancelled"]) {
      await db("chatTurns").where({ id: run.turnId }).update({ state });
      await assert.rejects(readEstimateChatArchive(db, identity(), enabled, run.binding), EstimateDraftConflictError);
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        visibleEstimateChatArchive(trx, context, run.turnId)), undefined);
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
    }
    await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
    const threadId = randomUUID();
    await db("chatThreads").insert({ id: threadId, ...identity() });
    await db("chatEstimateArchives").where({ id: run.ticket.id }).update({ threadId });
    await assert.rejects(readEstimateChatArchive(db, identity(), enabled, run.binding), AuthorizationAccessError);
  });
  await check("assistant Archive/Restore exact expiry boundary blocks confirm/cancel/Open and withholds evidence", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      if (operation === "restore") await setEstimateArchived(db, identity(), enabled, source);
      const run = await archiveAssistant(operation, source.estimateId), now = Date.now;
      try {
        Date.now = () => Date.parse(run.ticket.expiresAt) - 1;
        assert.equal((await readEstimateChatArchive(db, identity(), enabled, run.binding)).ticket.state, "pending");
        assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
          estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), true);
        Date.now = () => Date.parse(run.ticket.expiresAt);
        assert.equal((await readEstimateChatArchive(db, identity(), enabled, run.binding)).ticket.state, "expired");
        for (const decision of ["confirm", "cancel", "open"] as const) {
          await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
        }
        assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
          estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
      } finally { Date.now = now; }
      assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
    }
  });
  await check("assistant Archive/Restore detect private review, row state, source, parent and date changes before confirmation", async () => {
    for (const mutation of ["review", "state", "parent", "source", "date"] as const) {
      const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
      const row = await db("chatEstimateArchives").where({ id: run.ticket.id }).first();
      if (mutation === "review") {
        row.payload.review.recipientName = "Unreviewed recipient";
        await db("chatEstimateArchives").where({ id: run.ticket.id }).update({ payload: JSON.stringify(row.payload) });
      } else if (mutation === "state") await db("chatEstimateArchives").where({ id: run.ticket.id }).update({ state: "confirmed" });
      else if (mutation === "parent") await db("jobs").where({ id: jobId }).increment("version", 1);
      else await db("estimates").where({ id: source.estimateId }).update(mutation === "source"
        ? { recipientName: "Changed after preparation" } : { validUntil: localDate(-1) });
      await assert.rejects(readEstimateChatArchive(db, identity(), enabled, run.binding));
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"));
      assert.equal((await db("estimate_activity").where({ estimateId: source.estimateId, type: "archived" })).length, 0);
    }
  });
  await check("assistant Archive/Restore audit failure rolls back metadata, history, receipt and proposal, allowing an exact retry", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      const run = await archiveAssistant(operation, source.estimateId), before = await draftActionBusinessSnapshot();
      const constraint = `assistant_archive_audit_${randomUUID().replaceAll("-", "")}`;
      await db.raw(`ALTER TABLE "chatEstimateArchiveAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> 'confirmed') NOT VALID`);
      try {
        await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"), /check constraint/);
        assert.deepEqual(await draftActionBusinessSnapshot(), before);
        assert.equal((await db("chatEstimateArchives").where({ id: run.ticket.id }).first()).state, "pending");
      } finally { await db.raw(`ALTER TABLE "chatEstimateArchiveAudit" DROP CONSTRAINT "${constraint}"`); }
      assert.equal((await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm")).view.ticket.state, "confirmed");
    }
  });
  await check("assistant Archive and a concurrent manual correction cannot produce an archived Accepted Estimate", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    const review = await readEstimateDecisionReview(db, identity(), enabled, source.estimateId);
    const correction = {
      workspaceId, estimateId: source.estimateId, expectedVersion: source.expectedVersion,
      submissionId: randomUUID(), snapshotHash: review.snapshotHash, mode: "correct",
      expectedDecisionId: review.estimate.decision!.id, outcome: "accepted", decisionDate: review.today,
      channel: "phone", note: "", reason: "Customer clarified the decision",
    };
    const results = await Promise.allSettled([
      operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"),
      recordEstimateDecision(db, identity(), enabled, correction),
    ]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    const rejected = results.find(result => result.status === "rejected");
    assert.ok(rejected?.status === "rejected" && rejected.reason instanceof EstimateDraftConflictError);
    const row = await db("estimates").where({ id: source.estimateId }).first();
    assert.equal(row.version, source.expectedVersion + 1);
    assert.ok((row.status === "accepted" && row.archivedAt === null) || (row.status === "declined" && row.archivedAt !== null));
  });
  await check("assistant Archive/Restore conflict with later manual changes rather than borrowing a different operation receipt", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      const run = await archiveAssistant(operation, source.estimateId);
      await setEstimateArchived(db, identity(), enabled, {
        ...source, mode: operation, expectedVersion: run.ticket.estimate.version, submissionId: randomUUID(),
      });
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm"), EstimateDraftConflictError);
      assert.equal((await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).length, 0);
    }
  });
  await check("assistant Archive/Restore pending, cancelled and confirmed outcomes reject same-role membership replacement", async () => {
    const runs = [];
    for (const state of ["pending", "cancelled", "confirmed"]) {
      const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId, "office");
      if (state !== "pending") await operateEstimateChatArchive(db, identity("office"), enabled, run.binding, state === "confirmed" ? "confirm" : "cancel");
      runs.push(run);
    }
    const member = await db("workspaceMemberships").where(identity("office")).first();
    await db("workspaceMemberships").where(identity("office")).delete();
    await db("workspaceMemberships").insert(member);
    for (const run of runs) {
      await assert.rejects(readEstimateChatArchive(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
      assert.equal(await withWorkspaceAuthorization(db, identity("office"), enabled, false, (trx, context) =>
        visibleEstimateChatArchive(trx, context, run.turnId)), undefined);
      assert.equal(await withWorkspaceAuthorization(db, identity("office"), enabled, false, (trx, context) =>
        estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
    }
  });
  await check("assistant Archive/Restore checked receipts, retries and Open reject later metadata, status or parent changes", async () => {
    for (const operation of ["archive", "restore"] as const) {
      for (const mutation of ["archive", "status", "version", "parent", "actor"] as const) {
        const source = await archiveFixture();
        if (operation === "restore") await setEstimateArchived(db, identity(), enabled, source);
        const run = await archiveAssistant(operation, source.estimateId);
        const saved = await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
        if (mutation === "parent") await db("jobs").where({ id: jobId }).increment("version", 1);
        else await db("estimates").where({ id: source.estimateId }).update(
          mutation === "archive" ? { archivedAt: operation === "archive" ? null : new Date() }
            : mutation === "status" ? { status: "void" }
              : mutation === "actor" ? { archivedBy: users.office } : { version: saved.view.receipt!.version + 1 });
        for (const decision of ["confirm", "open"] as const) {
          await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, decision), EstimateDraftConflictError);
        }
        await assert.rejects(readEstimateChatArchive(db, identity(), enabled, run.binding), EstimateDraftConflictError);
        assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
          estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
      }
    }
  });
  await check("assistant Archive/Restore resolve exact latest-number or selected-page identity, never retargeting older UUIDs", async () => {
    const source = await revisionFixture(), draft = await reviseEstimate(db, identity(), enabled, source);
    await publishRevision(draft.id);
    const row = await db("estimates").where({ id: source.estimateId }).first();
    const number = `EST-${String(row.estimateNumber).padStart(4, "0")}`;
    await assert.rejects(archiveAssistant("archive", number), EstimateDraftValidationError);
    const exact = await archiveAssistant("archive", source.estimateId);
    assert.equal(exact.ticket.estimate.id, source.estimateId); assert.equal(exact.ticket.estimate.status, "superseded");
    await db("chatTurns").where({ id: exact.turnId }).update({
      state: "running", surfaceKey: "estimate.detail", pageContext: JSON.stringify({ recordRefs: [{ type: "estimate", id: source.estimateId }] }),
    });
    const page = await proposeEstimateChatArchive(db, identity(), enabled, exact.turnId,
      { request: { operation: "archive", estimateRef: null } }, new AbortController().signal);
    assert.equal(page.estimate.id, source.estimateId);
    await db("chatTurns").where({ id: exact.turnId }).update({ surfaceKey: "home", pageContext: "{}" });
    await assert.rejects(proposeEstimateChatArchive(db, identity(), enabled, exact.turnId,
      { request: { operation: "archive", estimateRef: null } }, new AbortController().signal), EstimateDraftValidationError);
    await db("chatTurns").where({ id: exact.turnId }).update({ state: "completed" });
    await operateEstimateChatArchive(db, identity(), enabled, estimateArchiveChatBinding(page), "confirm");
    const restore = await archiveAssistant("restore", source.estimateId);
    await operateEstimateChatArchive(db, identity(), enabled, restore.binding, "confirm");
    const visible = await readEstimates(db, identity(), enabled, { workspaceId, q: number, pageSize: 100 });
    assert.ok(!visible.rows.some(row => row.id === source.estimateId)); assert.ok(visible.rows.some(row => row.id === draft.id));
    const included = await readEstimates(db, identity(), enabled, { workspaceId, q: number, includeHidden: true, pageSize: 100 });
    assert.ok(included.rows.some(row => row.id === source.estimateId && row.status === "superseded" && !row.archived));
  });
  await check("assistant Archive/Restore never renew expired, withdrawn, replaced or revoked customer links", async () => {
    for (const state of ["withdrawn", "expired", "revoked", "token-expired", "replaced"]) {
      const source = await archiveFixture(), link = await readEstimateCustomerLink(db, identity(), enabled, source.estimateId);
      if (state === "withdrawn" || state === "expired" || state === "replaced") {
        await db("estimates").where({ id: source.estimateId }).update({ status: state === "withdrawn" ? "void" : state === "replaced" ? "superseded" : "expired" });
      } else await db("estimate_share_tokens").where({ estimateId: source.estimateId })
        .update(state === "revoked" ? { revokedAt: new Date() } : { expiresAt: new Date(Date.now() - 1000) });
      const tokens = await db("estimate_share_tokens").where({ estimateId: source.estimateId }).orderBy("id");
      for (const operation of ["archive", "restore"] as const) {
        const run = await archiveAssistant(operation, source.estimateId);
        await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
      }
      assert.deepEqual(await readPublicEstimate(db, link.path.slice(3), publicRequester), { state: state === "token-expired" ? "expired" : state });
      assert.deepEqual(await db("estimate_share_tokens").where({ estimateId: source.estimateId }).orderBy("id"), tokens);
    }
  });
  await check("assistant Archive/Restore supersede pending intent both ways with all six connected families and each other", async () => {
    for (const kind of ["draft", "share", "decision", "draft-action", "void", "archive"] as const) {
      const closed = await archiveFixture(), active = await revisionFixture(), draft = await sharingDraft();
      const first = await archiveAssistant("archive", closed.estimateId);
      await db("chatTurns").where({ id: first.turnId }).update({ state: "running" });
      if (kind === "archive") await archiveAssistant("archive", closed.estimateId, "owner", first);
      else if (kind === "void") await voidAssistant(active.estimateId, "Replacement reason", "owner", first);
      else if (kind === "draft-action") await draftActionAssistant("duplicate", active.estimateId, "owner", first);
      else if (kind === "decision") await decisionAssistant(active.estimateId, {}, "owner", first);
      else if (kind === "share") await proposeEstimateChatShare(db, identity(), enabled, first.turnId,
        { request: { operation: "publish", estimateRef: draft.id } }, new AbortController().signal);
      else await proposeEstimateChatDraft(db, identity(), enabled, first.turnId, { request: {
        operation: "update", estimateRef: draft.id, parentType: null, parentRef: null,
        changes: { name: "Replacement intent", scope: null, message: null, paymentTerms: null, termsNote: null,
          validUntil: null, discount: null, taxRate: null, deposit: null, items: null },
      } }, new AbortController().signal);
      assert.equal((await db("chatEstimateArchives").where({ id: first.ticket.id }).first()).state, "superseded");
      const next = await archiveAssistant("archive", closed.estimateId, "owner", first);
      const table = { draft: "chatEstimateDrafts", share: "chatEstimateShares", decision: "chatEstimateDecisions",
        "draft-action": "chatEstimateDraftActions", void: "chatEstimateVoids", archive: "chatEstimateArchives" }[kind];
      assert.equal((await db(table).where({ turnId: first.turnId, state: "pending" })).length, kind === "archive" ? 1 : 0);
      await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, first.binding, "confirm"), EstimateDraftConflictError);
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateArchiveChatEvidenceAllowed(trx, context, first.turnId)), true);
      await operateEstimateChatArchive(db, identity(), enabled, next.binding, "cancel");
    }
  });
  await check("assistant Archive/Restore aborted, unleased or unsupported preparations cannot replace pending intent", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    const before = await db("chatEstimateArchives").where({ workspaceId }).orderBy("id");
    const controller = new AbortController(); controller.abort();
    const input = { request: { operation: "archive", estimateRef: source.estimateId } };
    await assert.rejects(proposeEstimateChatArchive(db, identity(), enabled, run.turnId, input, controller.signal), { name: "AbortError" });
    await db("chatTurns").where({ id: run.turnId }).update({ leaseUntil: new Date(0) });
    await assert.rejects(proposeEstimateChatArchive(db, identity(), enabled, run.turnId, input, new AbortController().signal), EstimateDraftConflictError);
    await db("chatTurns").where({ id: run.turnId }).update({ surfaceKey: "settings", leaseUntil: new Date(Date.now() + 60000) });
    await assert.rejects(proposeEstimateChatArchive(db, identity(), enabled, run.turnId, input, new AbortController().signal), AuthorizationAccessError);
    assert.deepEqual(await db("chatEstimateArchives").where({ workspaceId }).orderBy("id"), before);
  });
  await check("assistant Archive/Restore confirmed results survive proposal expiry only while current saved state and grants agree", async () => {
    const source = await archiveFixture();
    for (const operation of ["archive", "restore"] as const) {
      const run = await archiveAssistant(operation, source.estimateId), now = Date.now;
      await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
      try {
        Date.now = () => Date.parse(run.ticket.expiresAt) + 1;
        assert.equal((await readEstimateChatArchive(db, identity(), enabled, run.binding)).ticket.state, "confirmed");
        assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
          estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), true);
        assert.equal(await withWorkspaceAuthorization(db, identity(), enabled.filter(value => value !== "estimates.archive"), false, (trx, context) =>
          estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
        assert.equal((await operateEstimateChatArchive(db, identity(), enabled, run.binding, "open")).href,
          `/estimates/${source.estimateId}?workspace=${workspaceId}`);
      } finally { Date.now = now; }
    }
  });
  await check("assistant Archive/Restore recheck revoked saved grants and membership on preparation, replay and Open", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId, "office");
    await operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "confirm");
    const grant = { workspaceId, role: "office", permission: "estimates.archive" };
    const savedGrant = await db("workspaceRolePolicies").where(grant).first();
    try {
      await db("workspaceRolePolicies").where(grant).delete();
      await assert.rejects(archiveAssistant("restore", source.estimateId, "office"), AuthorizationAccessError);
      await assert.rejects(readEstimateChatArchive(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
      for (const decision of ["confirm", "open"] as const) {
        await assert.rejects(operateEstimateChatArchive(db, identity("office"), enabled, run.binding, decision), AuthorizationAccessError);
      }
    } finally { await db("workspaceRolePolicies").insert(savedGrant); }
    const member = await db("workspaceMemberships").where(identity("office")).first();
    try {
      await db("workspaceMemberships").where(identity("office")).delete();
      await assert.rejects(readEstimateChatArchive(db, identity("office"), enabled, run.binding), AuthorizationAccessError);
      await assert.rejects(operateEstimateChatArchive(db, identity("office"), enabled, run.binding, "open"), AuthorizationAccessError);
    } finally { await db("workspaceMemberships").insert(member); }
  });
  await check("assistant Archive/Restore preparation and cancellation audit failures roll back supersession and proposal resolution", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    const before = await draftActionBusinessSnapshot(), proposals = await db("chatEstimateArchives").where({ workspaceId }).orderBy("id");
    await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
    for (const action of ["proposed", "cancelled"]) {
      const constraint = `assistant_archive_atomic_${randomUUID().replaceAll("-", "")}`;
      await db.raw(`ALTER TABLE "chatEstimateArchiveAudit" ADD CONSTRAINT "${constraint}" CHECK ("workspaceId" <> '${workspaceId}'::uuid OR action <> '${action}') NOT VALID`);
      try {
        if (action === "proposed") {
          await assert.rejects(proposeEstimateChatArchive(db, identity(), enabled, run.turnId,
            { request: { operation: "archive", estimateRef: source.estimateId } }, new AbortController().signal), /check constraint/);
        } else {
          await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
          await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "cancel"), /check constraint/);
        }
        assert.deepEqual(await db("chatEstimateArchives").where({ workspaceId }).orderBy("id"), proposals);
        assert.equal((await db("chatEstimateArchiveAudit").where({ proposalId: run.ticket.id })).length, 1);
        assert.deepEqual(await draftActionBusinessSnapshot(), before);
      } finally { await db.raw(`ALTER TABLE "chatEstimateArchiveAudit" DROP CONSTRAINT "${constraint}"`); }
    }
    assert.equal((await operateEstimateChatArchive(db, identity(), enabled, run.binding, "cancel")).view.ticket.state, "cancelled");
  });
  await check("assistant Archive/Restore use independent-turn supersession, withhold replaced evidence and preserve cancelled proposals", async () => {
    const closed = await archiveFixture(), hidden = await archiveFixture();
    await setEstimateArchived(db, identity(), enabled, hidden);
    const prior = await archiveAssistant("archive", closed.estimateId);
    const turnId = randomUUID();
    await db("chatTurns").insert({
      id: turnId, threadId: prior.threadId, ...identity(), clientTurnId: randomUUID(), requestHash: "fixture",
      surfaceKey: "home", state: "running", leaseUntil: new Date(Date.now() + 60000),
    });
    const next = await archiveAssistant("restore", hidden.estimateId, "owner", { turnId, threadId: prior.threadId });
    assert.equal((await readEstimateChatArchive(db, identity(), enabled, prior.binding)).ticket.state, "superseded");
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateArchiveChatEvidenceAllowed(trx, context, prior.turnId)), false);
    await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, prior.binding, "confirm"), EstimateDraftConflictError);
    await operateEstimateChatArchive(db, identity(), enabled, next.binding, "cancel");
    const fresh = await archiveAssistant("archive", closed.estimateId, "owner", next);
    assert.equal((await db("chatEstimateArchives").where({ id: next.ticket.id }).first()).state, "cancelled");
    await operateEstimateChatArchive(db, identity(), enabled, fresh.binding, "cancel");
  });
  await check("assistant Archive/Restore reject substituted saved-result timestamps without returning fabricated receipts", async () => {
    const source = await archiveFixture(), run = await archiveAssistant("archive", source.estimateId);
    await operateEstimateChatArchive(db, identity(), enabled, run.binding, "confirm");
    const row = await db("chatEstimateArchives").where({ id: run.ticket.id }).first();
    row.payload.receipt.updatedAt = new Date(Date.parse(row.payload.receipt.updatedAt) + 1).toISOString();
    await db("chatEstimateArchives").where({ id: run.ticket.id }).update({ payload: JSON.stringify(row.payload) });
    await assert.rejects(readEstimateChatArchive(db, identity(), enabled, run.binding), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, run.binding, "open"), EstimateDraftConflictError);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateArchiveChatEvidenceAllowed(trx, context, run.turnId)), false);
  });
  await check("assistant Archive/Restore retain metadata-only audit and guard migration rollback over retained proposals", async () => {
    await assert.rejects(rollbackArchiveMigration(db), /Retained Estimate Archive\/Restore proposals/);
    const audits = await db("chatEstimateArchiveAudit").where({ workspaceId });
    assert.ok(audits.length > 0);
    for (const audit of audits) {
      assert.deepEqual(Object.keys(audit).sort(), ["action", "actorId", "createdAt", "id", "inputHash", "proposalId", "workspaceId"]);
    }
    assert.equal(await db.schema.hasTable("chatEstimateArchives"), true);
  });
  await check("assistant Draft deletion resolves a null reference from the selected Estimate page", async () => {
    const draft = await sharingDraft();
    const threadId = randomUUID(), turnId = randomUUID();
    await db("chatThreads").insert({ id: threadId, ...identity() });
    await db("chatTurns").insert({
      id: turnId, threadId, ...identity(), clientTurnId: randomUUID(), requestHash: "fixture",
      surfaceKey: "estimate.detail", pageContext: JSON.stringify({
        recordRefs: [{ type: "estimate", id: draft.id }],
      }),
      state: "running", leaseUntil: new Date(Date.now() + 60000),
    });
    const run = await draftDeleteAssistant(null, "owner", { turnId, threadId });
    assert.equal(run.ticket.estimate.id, draft.id);
    await operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "cancel",
    });
  });
  await check("assistant Draft deletion preparation, private review and cancellation write no Estimate fields", async () => {
    const draft = await sharingDraft();
    const before = await draftActionBusinessSnapshot();
    const run = await draftDeleteAssistant(draft.id);
    const view = await readEstimateChatDraftDelete(db, identity(), enabled, run.binding);
    assert.equal(view.ticket.state, "pending");
    assert.equal(view.ticket.actionType, "estimate.delete-draft");
    const parent = await db("jobs").where({ workspaceId, id: jobId }).first("jobNumber", "title", "version");
    assert.deepEqual(view.review.parent, {
      type: "job", id: jobId, version: Number(parent.version),
      number: `J-${String(parent.jobNumber).padStart(4, "0")}`, name: parent.title,
    });
    for (const field of ["name", "recipientName", "parent", "review", "receipt", "typedConfirmation"]) {
      assert.equal(JSON.stringify(run.ticket).includes(`"${field}"`), false);
    }
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm",
    }));
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: `${run.ticket.estimate.number} `,
    }), EstimateDraftValidationError);
    assert.equal((await db("estimates").where({ id: draft.id }).first()).version, draft.version);
    assert.deepEqual(await draftActionBusinessSnapshot(), before);
    const cancel = { workspaceId, request: run.binding, decision: "cancel" as const };
    assert.equal((await operateEstimateChatDraftDelete(db, identity(), enabled, cancel)).view.ticket.state, "cancelled");
    assert.equal((await operateEstimateChatDraftDelete(db, identity(), enabled, cancel)).view.ticket.state, "cancelled");
    assert.deepEqual(await db("chatEstimateDraftDeleteAudit").where({ proposalId: run.ticket.id }).orderBy("createdAt")
      .then(rows => rows.map(row => row.action)), ["proposed", "cancelled"]);
    assert.deepEqual(await draftActionBusinessSnapshot(), before);
  });
  await check("assistant Draft deletion confirms only the exact never-shared revision and preserves its shared predecessor", async () => {
    const revision = await revisionFixture();
    const predecessor = await db("estimates").where({ id: revision.estimateId }).first();
    const pending = await reviseEstimate(db, identity(), enabled, revision);
    const run = await draftDeleteAssistant(pending.id);
    assert.equal(run.ticket.estimate.number, `EST-${String(predecessor.estimateNumber).padStart(4, "0")}`);
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: "EST-9999",
    }), EstimateDraftValidationError);
    assert.ok(await db("estimates").where({ id: pending.id }).first());
    const confirmed = await operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: run.ticket.estimate.number,
    });
    assert.equal(confirmed.view.ticket.state, "confirmed");
    assert.deepEqual(confirmed.view.receipt, {
      estimateId: pending.id, version: pending.version, number: run.ticket.estimate.number, revision: pending.revision,
    });
    assert.equal(await db("estimates").where({ id: pending.id }).first(), undefined);
    assert.equal((await db("estimates").where({ id: revision.estimateId }).first()).status, "published");
    assert.ok(await db("estimate_snapshots").where({ estimateId: revision.estimateId }).first());
    assert.deepEqual((await readEstimateChatDraftDelete(db, identity(), enabled, run.binding)).receipt, confirmed.view.receipt);
    assert.deepEqual((await operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: run.ticket.estimate.number,
    })).view.receipt, confirmed.view.receipt);
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: "EST-0000",
    }), EstimateDraftConflictError);
  });
  await check("assistant Draft deletion rechecks delete grants, sharing eligibility and the reviewed version", async () => {
    const draft = await sharingDraft();
    await assert.rejects(draftDeleteAssistant(draft.id, "owner", undefined,
      enabled.filter(permission => permission !== "estimates.delete")), AuthorizationAccessError);
    const shared = await revisionFixture();
    await assert.rejects(draftDeleteAssistant(shared.estimateId), AuthorizationAccessError);
    const run = await draftDeleteAssistant(draft.id);
    await db("estimates").where({ id: draft.id }).update({ name: "Changed after deletion review", version: draft.version + 1 });
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm", typedConfirmation: run.ticket.estimate.number,
    }), EstimateDraftConflictError);
    assert.equal((await db("estimates").where({ id: draft.id }).first()).name, "Changed after deletion review");
    assert.equal((await db("chatEstimateDraftDeletes").where({ id: run.ticket.id }).first()).state, "pending");
  });
  await check("assistant Draft deletion shares pending-intent supersession with Archive/Restore in both directions", async () => {
    const draft = await sharingDraft();
    const pendingDelete = await draftDeleteAssistant(draft.id);
    const closed = await archiveFixture();
    const archive = await archiveAssistant("archive", closed.estimateId, "owner", pendingDelete);
    assert.equal((await db("chatEstimateDraftDeletes").where({ id: pendingDelete.ticket.id }).first()).state, "superseded");
    await assert.rejects(operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: pendingDelete.binding, decision: "confirm",
      typedConfirmation: pendingDelete.ticket.estimate.number,
    }), EstimateDraftConflictError);
    await operateEstimateChatArchive(db, identity(), enabled, archive.binding, "cancel");

    const nextDraft = await sharingDraft();
    const nextClosed = await archiveFixture();
    const pendingArchive = await archiveAssistant("archive", nextClosed.estimateId);
    const deletion = await draftDeleteAssistant(nextDraft.id, "owner", pendingArchive);
    assert.equal((await db("chatEstimateArchives").where({ id: pendingArchive.ticket.id }).first()).state, "superseded");
    await assert.rejects(operateEstimateChatArchive(db, identity(), enabled, pendingArchive.binding, "confirm"), EstimateDraftConflictError);
    await operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: deletion.binding, decision: "cancel",
    });
  });
  await check("assistant Draft-deletion history expires pending evidence and retains checked receipts", async () => {
    const expiringDraft = await sharingDraft();
    const expiring = await draftDeleteAssistant(expiringDraft.id);
    const now = Date.now;
    try {
      Date.now = () => Date.parse(expiring.ticket.expiresAt) + 1;
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateDraftDeleteChatEvidenceAllowed(trx, context, expiring.turnId)), false);
    } finally { Date.now = now; }

    const draft = await sharingDraft();
    const run = await draftDeleteAssistant(draft.id);
    const confirmed = await operateEstimateChatDraftDelete(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "confirm",
      typedConfirmation: run.ticket.estimate.number,
    });
    assert.equal(confirmed.view.ticket.state, "confirmed");
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateDraftDeleteChatEvidenceAllowed(trx, context, run.turnId)), true);
    await db("chatTurns").where({ id: run.turnId }).update({
      estimateDraftDeleteEvidence: JSON.stringify([run.turnId]),
    });
    await assert.rejects(rollbackDraftDeleteEvidenceMigration(db), /Retained Draft-deletion evidence/);
  });
  await check("assistant Draft-deletion history evidence clears when a newer Archive supersedes it", async () => {
    const draft = await sharingDraft();
    const pending = await draftDeleteAssistant(draft.id);
    const turnId = randomUUID();
    await db("chatTurns").insert({
      id: turnId,
      threadId: pending.threadId,
      ...identity(),
      clientTurnId: randomUUID(),
      requestHash: "fixture",
      surfaceKey: "home",
      state: "running",
      leaseUntil: new Date(Date.now() + 60000),
      estimateDraftDeleteEvidence: JSON.stringify([pending.turnId]),
    });
    const closed = await archiveFixture();
    const archive = await archiveAssistant("archive", closed.estimateId, "owner", {
      turnId, threadId: pending.threadId,
    });
    assert.equal((await db("chatEstimateDraftDeletes").where({ id: pending.ticket.id }).first()).state, "superseded");
    assert.deepEqual((await db("chatTurns").where({ id: turnId }).first()).estimateDraftDeleteEvidence, []);
    await operateEstimateChatArchive(db, identity(), enabled, archive.binding, "cancel");
  });
  await check("assistant Draft deletion keeps metadata-only audit and guards rollback over retained proposals", async () => {
    await assert.rejects(rollbackDraftDeleteMigration(db), /Retained Estimate Draft deletion proposals/);
    const audits = await db("chatEstimateDraftDeleteAudit").where({ workspaceId });
    assert.ok(audits.length > 0);
    for (const audit of audits) {
      assert.deepEqual(Object.keys(audit).sort(), ["action", "actorId", "createdAt", "id", "inputHash", "proposalId", "workspaceId"]);
      assert.equal(JSON.stringify(audit).includes("Customer"), false);
    }
    assert.equal(await db.schema.hasTable("chatEstimateDraftDeletes"), true);
  });
  await check("assistant conversion opens only the separately confirmed Job form and rechecks every binding", async () => {
    const fixture = await acceptedLeadConversionFixture();
    const run = await conversionAssistant(fixture.estimateId);
    const beforeJobs = await db("jobs").where({ workspaceId }).count({ n: "*" }).first();
    const read = await readEstimateChatConversion(db, identity(), enabled, run.binding);
    assert.equal(read.view.ticket.state, "pending");
    assert.deepEqual(read.view.review.estimate, run.ticket.estimate);
    assert.equal(read.view.review.customer.state, "ready");
    assert.equal(read.view.review.estimate.status, "accepted");
    for (const secret of ["recipientEmail", "internalNotes", "paymentLink", "receipt", "jobCreated"]) {
      assert.equal(JSON.stringify(run.ticket).includes(`"${secret}"`), false);
    }
    const opened = await operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "review",
    });
    assert.equal(opened.view.ticket.state, "pending");
    assert.equal(Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0),
      Number(beforeJobs?.n ?? 0));
    assert.equal((await db("chatEstimateConversionAudit").where({
      proposalId: run.ticket.id, action: "review-opened",
    })).length, 1);
    await assert.rejects(readEstimateChatConversion(db, identity("field"), enabled, run.binding), AuthorizationAccessError);
    await assert.rejects(readEstimateChatConversion(db, identity(), enabled.filter(value => value !== "jobs.create"), run.binding), AuthorizationAccessError);
    await assert.rejects(readEstimateChatConversion(db, identity(), enabled, {
      ...run.binding, snapshotHash: "0".repeat(64),
    }), EstimateDraftConflictError);
    await assert.rejects(operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: run.binding, decision: "review", href: "/jobs",
    }), /Unrecognized key/);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateConversionChatEvidenceAllowed(trx, context, run.turnId)), true);
    assert.equal((await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatConversion(trx, context, run.turnId)))?.ticket.state, "pending");
    const conversion = await convertAcceptedEstimateToJob(
      db,
      identity(),
      enabled,
      conversionCommand(fixture),
    );
    assert.ok(conversion.job.id);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      visibleEstimateChatConversion(trx, context, run.turnId)), undefined);
    assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
      estimateConversionChatEvidenceAllowed(trx, context, run.turnId)), false);
  });
  await check("assistant conversion cancellation is no-write, expiry is enforced and supersession clears only its evidence", async () => {
    const first = await acceptedLeadConversionFixture();
    const pending = await conversionAssistant(first.estimateId);
    const beforeJobs = await db("jobs").where({ workspaceId }).count({ n: "*" }).first();
    const cancelled = await operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: pending.binding, decision: "cancel",
    });
    assert.equal(cancelled.view.ticket.state, "cancelled");
    assert.deepEqual((await operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: pending.binding, decision: "cancel",
    })).view, cancelled.view);
    assert.equal(Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0),
      Number(beforeJobs?.n ?? 0));

    const expiring = await acceptedLeadConversionFixture();
    const expired = await conversionAssistant(expiring.estimateId);
    const now = Date.now;
    try {
      Date.now = () => Date.parse(expired.ticket.expiresAt) + 1;
      await assert.rejects(operateEstimateChatConversion(db, identity(), enabled, {
        workspaceId, request: expired.binding, decision: "cancel",
      }), EstimateDraftConflictError);
      assert.equal(await withWorkspaceAuthorization(db, identity(), enabled, false, (trx, context) =>
        estimateConversionChatEvidenceAllowed(trx, context, expired.turnId)), false);
    } finally { Date.now = now; }

    const second = await acceptedLeadConversionFixture();
    const prior = await conversionAssistant(second.estimateId);
    const nextTurn = randomUUID();
    await db("chatTurns").insert({
      id: nextTurn, threadId: prior.threadId, ...identity(), clientTurnId: randomUUID(),
      requestHash: "fixture", surfaceKey: "home", state: "running",
      leaseUntil: new Date(Date.now() + 60000),
      estimateConversionEvidence: JSON.stringify([prior.turnId]),
    });
    const third = await acceptedLeadConversionFixture();
    const replacement = await conversionAssistant(third.estimateId, "owner", {
      turnId: nextTurn, threadId: prior.threadId,
    });
    assert.equal((await db("chatEstimateConversions").where({ id: prior.ticket.id }).first()).state, "superseded");
    assert.deepEqual((await db("chatTurns").where({ id: nextTurn }).first()).estimateConversionEvidence, []);
    assert.equal(replacement.ticket.state, "pending");
    await assert.rejects(rollbackConversionMigration(db), /Retained Estimate conversion proposals/);
    assert.equal(await db.schema.hasTable("chatEstimateConversions"), true);
    assert.equal(await db.schema.hasTable("chatEstimateConversionAudit"), true);
    assert.equal(await db.schema.hasColumn("chatTurns", "estimateConversionEvidence"), true);
    assert.ok(await db("chatEstimateConversions").where({ workspaceId }).first("id"));
    const audits = await db("chatEstimateConversionAudit").where({ workspaceId });
    assert.ok(audits.length > 0);
    for (const audit of audits) {
      assert.deepEqual(Object.keys(audit).sort(), ["action", "actorId", "createdAt", "id", "inputHash", "proposalId", "workspaceId"]);
      assert.equal(JSON.stringify(audit).includes("Customer"), false);
    }
  });
  await check("assistant conversion proposals reject stale Estimate, Lead, Customer and membership bindings", async () => {
    const staleEstimate = await acceptedLeadConversionFixture();
    const estimateRun = await conversionAssistant(staleEstimate.estimateId);
    const estimate = await db("estimates").where({ id: staleEstimate.estimateId }).first("version");
    await db("estimates").where({ id: staleEstimate.estimateId }).update({ version: Number(estimate.version) + 1 });
    await assert.rejects(operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: estimateRun.binding, decision: "review",
    }), EstimateDraftConflictError);

    const staleLead = await acceptedLeadConversionFixture();
    const leadRun = await conversionAssistant(staleLead.estimateId);
    const lead = await db("leads").where({ id: staleLead.sourceLeadId }).first("version");
    await db("leads").where({ id: staleLead.sourceLeadId }).update({ version: Number(lead.version) + 1 });
    await assert.rejects(operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: leadRun.binding, decision: "review",
    }), EstimateDraftConflictError);

    const staleCustomer = await acceptedLeadConversionFixture();
    const customerRun = await conversionAssistant(staleCustomer.estimateId);
    const customer = await db("leads").where({ id: staleCustomer.sourceLeadId }).first("customerId");
    const currentCustomer = await db("customers").where({ id: customer.customerId }).first("version");
    await db("customers").where({ id: customer.customerId }).update({ version: Number(currentCustomer.version) + 1 });
    await assert.rejects(operateEstimateChatConversion(db, identity(), enabled, {
      workspaceId, request: customerRun.binding, decision: "review",
    }), EstimateDraftConflictError);

    const policyFixture = await acceptedLeadConversionFixture();
    const policyRun = await conversionAssistant(policyFixture.estimateId);
    const policy = await db("workspacePolicies").where({ workspaceId }).first("revision");
    await db("workspacePolicies").where({ workspaceId }).update({ revision: Number(policy.revision) + 1 });
    await assert.rejects(
      readEstimateChatConversion(db, identity(), enabled, policyRun.binding),
      AuthorizationAccessError,
    );
    for (const fixture of [staleEstimate, staleLead, staleCustomer, policyFixture]) {
      assert.equal(await db("jobs").where({ workspaceId, sourceLeadId: fixture.sourceLeadId }).first("id"), undefined);
    }
  });
  console.log(`PASS ${passed} estimate database journeys`);
} finally {
  await db("rateLimits").whereIn("key", rateLimitKeys).delete();
  await db("estimate_operation_receipts").where({ workspaceId }).delete();
  await db("estimates").where({ workspaceId }).delete();
  await db("workspaces").where({ id: workspaceId }).delete();
  await db("users").whereIn("id", Object.values(users)).delete();
  rehearsalStorage.close();
  await db.destroy();
}

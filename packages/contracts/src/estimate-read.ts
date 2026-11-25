import { z } from "zod";
import { estimateAdjustmentSchema, estimateDraftValuesSchema, estimateStatusSchema, type EstimateListResult } from "./estimate";
import { estimatePaperAmountsSchema, estimatePaperContentSchema } from "./estimate-sharing";
import { estimateHistoryCursorSchema, type EstimateLifecycleRead } from "./estimate-lifecycle";
import type { EstimateRevisionFamily } from "./estimate-revision";
import { estimateRecordedDecisionSchema, type EstimateDecisionReview } from "./estimate-decision";
import type { RelatedEstimatesResult } from "./estimate-related";

const version = z.number().int().positive();
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const member = z.object({ id: z.string(), name: z.string() });
const parent = z.object({
  type: z.enum(["lead", "job"]), id: z.uuid(), number: z.string(), name: z.string(), status: z.string(), service: z.string(),
  customer: z.object({ id: z.uuid(), name: z.string() }).nullable(), contactName: z.string(), recipientEmail: z.string(), serviceAddress: z.string(), href: z.string().optional(),
});
export const estimateEditorRecordSchema = z.object({
  id: z.uuid(), number: z.string(), revision: version, status: estimateStatusSchema, archived: z.boolean(), version, updatedAt: z.string(),
  sharing: z.enum(["never-shared", "shared"]), parent, values: estimateDraftValuesSchema,
});
export const estimateEditorSeedSchema = z.object({
  creationCustomerId: z.uuid().optional(), workspaceId: z.uuid(), timezone: z.string(), today: z.iso.date(),
  paperBusiness: estimatePaperContentSchema.shape.business, parent: parent.nullable(),
  existingEstimates: z.array(z.object({ id: z.uuid(), number: z.string(), status: z.enum(["draft", "sent", "published"]), href: z.string() })),
  estimate: estimateEditorRecordSchema.nullable(), members: z.array(member), paymentPresets: z.array(z.object({ id: z.string(), label: z.string(), text: z.string() })),
  defaults: z.object({ taxRate: z.string(), validUntil: z.string(), message: z.string(), termsNote: z.string(), deposit: estimateAdjustmentSchema }),
  capabilities: z.object({ read: z.boolean(), create: z.boolean(), update: z.boolean(), delete: z.boolean(), void: z.boolean(), archive: z.boolean(),
    assignOwner: z.boolean(), browseMaterials: z.boolean(), viewMaterialPrices: z.boolean() }),
});
export const estimateDraftSaveResultSchema = z.object({ id: z.uuid(), number: z.string(), revision: version, version, updatedAt: z.string() });
export const estimateDeletedResultSchema = z.object({ deleted: z.literal(true), id: z.uuid() });
export const estimateShareReceiptSchema = z.object({ estimateId: z.uuid(), version, snapshotHash: hash, status: z.enum(["sent", "published"]) });
export const estimateVoidReceiptSchema = z.object({ estimateId: z.uuid(), version, status: z.literal("void"), updatedAt: z.string() });
export const estimateArchiveReceiptSchema = z.object({ estimateId: z.uuid(), version, archived: z.boolean(), updatedAt: z.string() });
export const estimateLinkResultSchema = z.object({ path: z.string().regex(/^\/e\/[A-Za-z0-9_-]{43}$/) });
export const estimateDecisionReceiptSchema = z.object({ estimateId: z.uuid(), decisionId: z.uuid(), status: z.enum(["accepted", "declined"]), version, updatedAt: z.string() });
export const estimateDecisionReviewSchema = z.object({
  estimate: z.object({ id: z.uuid(), number: z.string(), revision: version, version, name: z.string(), recipientName: z.string(), totalCents: z.number(),
    status: estimateStatusSchema, archived: z.boolean(), decision: estimateRecordedDecisionSchema.extend({ id: z.uuid() }).nullable() }),
  snapshotHash: hash, today: z.iso.date(), timezone: z.string(), canDecide: z.boolean(), canCorrectDecision: z.boolean(), canConvertToJob: z.boolean(),
  convertedJob: z.object({ number: z.string(), href: z.string() }).nullable(),
}) satisfies z.ZodType<EstimateDecisionReview>;
export const estimateParentOptionsSchema = z.array(z.object({ id: z.uuid(), number: z.string(), name: z.string(), detail: z.string(), status: z.string() }));
export const relatedEstimatesResultSchema = z.object({
  rows: z.array(z.object({ id: z.uuid(), number: z.string(), revision: version, name: z.string(), status: estimateStatusSchema, archived: z.boolean(),
    totalCents: z.number().nullable(), href: z.string(), parent: z.object({ type: z.enum(["lead", "job"]), number: z.string() }) })),
  total: z.number().int().nonnegative(), page: version, pageSize: version, canCreate: z.boolean(), readVersion: z.string(),
}) satisfies z.ZodType<RelatedEstimatesResult>;
export const estimateRevisionFamilySchema = z.object({
  number: z.string(), currentEstimateId: z.uuid(), version, snapshotHash: hash.nullable(), canRevise: z.boolean(),
  revisions: z.array(z.object({ id: z.uuid(), revision: version, status: estimateStatusSchema, archived: z.boolean(), totalCents: z.number().nullable(), href: z.string().optional() })),
  total: z.number().int().nonnegative(), nextBeforeRevision: version.nullable(),
}) satisfies z.ZodType<EstimateRevisionFamily>;
const paper = z.object({
  state: z.literal("snapshot"), estimateId: z.uuid(), version, snapshotHash: hash, content: estimatePaperContentSchema, amounts: estimatePaperAmountsSchema,
});
// Staff reads replace the captured settings logo path with an authorized estimate URL.
// Keep this projection separate so stored snapshots retain their exact schema and hash.
const staffPaper = paper.extend({
  content: estimatePaperContentSchema.extend({
    business: estimatePaperContentSchema.shape.business.extend({ logoPath: z.string().nullable() }),
  }),
}).refine(value => value.content.business.logoPath === null || value.content.business.logoPath === `/api/estimates/${value.estimateId}/logo`, {
  message: "Expected this estimate's authorized logo URL.", path: ["content", "business", "logoPath"],
});
export const estimateSharingReviewSchema = z.object({
  estimate: estimateEditorRecordSchema, today: z.iso.date(), canSend: z.boolean(), subject: z.string(), issues: z.array(z.string()), snapshotHash: hash.nullable(),
  paper: staffPaper.nullable(), draftPaper: paper.nullable(), draft: estimatePaperContentSchema.nullable(),
  delivery: z.object({
    email: z.union([z.object({ state: z.literal("not-sent") }), z.object({
      state: z.enum(["queued", "sent", "failed", "bounced"]), recipientEmail: z.string(), updatedAt: z.string(),
      attemptCount: z.number().int().nonnegative(), nextAttemptAt: z.string().nullable(), failureMessage: z.string().optional(),
    })]),
    link: z.object({ state: z.enum(["not-created", "active", "expired", "revoked", "replaced", "unavailable"]), expiresAt: z.string().nullable(), firstViewedAt: z.string().nullable() }),
  }),
  revision: z.object({ sourceEstimateId: z.uuid(), sourceVersion: version, sourceRevision: version, sourceStatus: estimateStatusSchema, requiresPaymentLinkReview: z.boolean() }).nullable(),
});
export const estimateListResultSchema = z.object({
  rows: z.array(z.object({
    id: z.uuid(), number: z.string(), estimateNumber: version, revision: version, name: z.string(), customerName: z.string(), service: z.string(),
    status: estimateStatusSchema, totalCents: z.number().nullable(), parentType: z.enum(["lead", "job"]), parentId: z.uuid(), parentNumber: z.string(),
    ownerId: z.string().nullable(), ownerName: z.string().nullable(), validUntil: z.string().nullable(), updatedAt: z.string(), decidedAt: z.string().nullable(),
    archived: z.boolean(), version, canDuplicate: z.boolean(), canRevise: z.boolean(), canDelete: z.boolean(),
  })),
  total: z.number().int().nonnegative(), scopeTotal: z.number().int().nonnegative(), page: version, pageSize: version, timezone: z.string(),
  scope: z.enum(["workspace", "assigned_job"]), policyRevision: z.number().int().nonnegative(), canCreate: z.boolean(), canExport: z.boolean(), canVoid: z.boolean(), canArchive: z.boolean(),
  owners: z.array(member.extend({ openEstimateCount: z.number().int().nonnegative() })),
  metrics: z.object({ awaitingCount: z.number().nonnegative(), openValueCents: z.string(), acceptedThisMonthCount: z.number().nonnegative(),
    acceptedThisMonthCents: z.string(), expiringInSevenDaysCount: z.number().nonnegative() }),
}) satisfies z.ZodType<EstimateListResult>;
const historyChange = z.union([
  z.object({ kind: z.literal("field"), field: z.enum(["name", "recipientName", "recipientEmail", "serviceAddress", "owner", "scope", "message", "termsNote", "paymentTerms", "paymentLink", "validUntil", "deposit", "taxRate", "discount", "items", "internalNotes"]) }),
  z.object({ kind: z.literal("status"), before: estimateStatusSchema.nullable(), after: estimateStatusSchema }),
  z.object({ kind: z.literal("total"), beforeCents: z.number().nullable(), afterCents: z.number().nullable() }),
  z.object({ kind: z.literal("revision"), before: version, after: version }),
  z.object({ kind: z.literal("converted-job"), number: z.string() }),
]);
const eventBase = {
  id: z.uuid(), createdAt: z.string(), source: z.union([z.object({ type: z.enum(["ui", "chat", "system"]), actorName: z.string().nullable() }), z.object({ type: z.literal("worker") })]),
  changes: z.array(historyChange),
};
const decisionDetails = { decisionDate: z.string(), channel: z.enum(["email", "phone", "in-person", "other"]), note: z.string().optional() };
export const estimateLifecycleReadSchema = z.object({
  estimate: z.object({ id: z.uuid(), number: z.string(), revision: version, version, name: z.string(), recipientName: z.string(), status: estimateStatusSchema, archived: z.boolean() }),
  canVoid: z.boolean(), timezone: z.string(),
  events: z.array(z.union([
    z.object({ ...eventBase, kind: z.enum(["created", "updated", "sent", "published", "revision-created", "expired", "superseded", "archived", "restored", "duplicated", "converted", "delivery-queued", "delivery-sent", "delivery-failed", "delivery-bounced", "viewed"]) }),
    z.object({ ...eventBase, ...decisionDetails, kind: z.literal("decision-recorded") }),
    z.object({ ...eventBase, ...decisionDetails, kind: z.literal("decision-corrected"), reason: z.string() }),
    z.object({ ...eventBase, kind: z.literal("voided"), reason: z.string() }),
  ])),
  total: z.number().int().nonnegative(), nextCursor: estimateHistoryCursorSchema.nullable(),
}) satisfies z.ZodType<EstimateLifecycleRead>;

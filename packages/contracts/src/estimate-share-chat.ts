import { z } from "zod";
import { estimateStatusSchema } from "./estimate";
import { estimateEmailDestinationSchema, estimateFrozenSnapshotSchema } from "./estimate-sharing";
import { estimateDraftChatProposeSchema } from "./estimate-draft-chat";
import { estimateDecisionChatProposeSchema } from "./estimate-decision-chat";
import { estimateDraftActionChatProposeSchema } from "./estimate-draft-action-chat";
import { estimateVoidChatProposeSchema } from "./estimate-void-chat";
import { estimateArchiveChatProposeSchema } from "./estimate-archive-chat";
import { estimateDraftDeleteChatProposeSchema } from "./estimate-draft-delete-chat";
import { estimateConversionChatProposeSchema } from "./estimate-conversion-chat";
import { estimateChatExportFiltersSchema } from "./estimate-chat";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const action = z.enum(["estimate.send", "estimate.publish", "estimate.resend"]);
export const estimateShareChatProposeSchema = z.object({
  request: z.object({
    operation: z.enum(["send", "publish", "resend"]),
    estimateRef: z.string().max(80).nullable(),
  }).strict(),
}).strict();
export const estimateExportChatProposeSchema = z.object({
  request: z.object({
    operation: z.literal("export"),
    filters: estimateChatExportFiltersSchema.nullable(),
  }).strict(),
}).strict();
export const estimateProposeChatSchema = z.object({
  request: z.union([estimateDraftChatProposeSchema.shape.request, estimateShareChatProposeSchema.shape.request,
    estimateDecisionChatProposeSchema.shape.request, estimateDraftActionChatProposeSchema.shape.request,
    estimateVoidChatProposeSchema.shape.request, estimateArchiveChatProposeSchema.shape.request,
    estimateDraftDeleteChatProposeSchema.shape.request, estimateConversionChatProposeSchema.shape.request,
    estimateExportChatProposeSchema.shape.request]),
}).strict();
export const estimateProposeChatToolParameters = z.toJSONSchema(estimateProposeChatSchema);
const record = z.object({
  id: z.uuid(), version: z.number().int().positive(), number: z.string().regex(/^EST-\d{4,}$/),
  revision: z.number().int().positive(), name: z.string().min(1).max(120),
  status: estimateStatusSchema, archived: z.boolean(),
  totalCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  validUntil: z.iso.date(),
}).strict();
export const estimateShareChatTicketSchema = z.object({
  id: z.uuid(), actionType: action, inputHash: hash, authorizationVersion: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: record,
  snapshotHash: hash,
  requiresDialog: z.boolean(),
}).strict().superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000) context.addIssue({ code: "custom", message: "Sharing review lifetime must not exceed 15 minutes." });
  if (!value.requiresDialog && value.actionType !== "estimate.send") context.addIssue({ code: "custom", message: "Publish and Resend require a shared review dialog." });
  if (value.estimate.archived || value.estimate.status !== (value.actionType === "estimate.resend" ? "sent" : "draft")) {
    context.addIssue({ code: "custom", message: "Sharing proposals must bind an eligible saved Estimate." });
  }
});
export type EstimateShareChatTicket = z.infer<typeof estimateShareChatTicketSchema>;
export const estimateShareChatBindingSchema = z.object({
  proposalId: z.uuid(), actionType: action, inputHash: hash, authorizationVersion: hash,
  estimateId: z.uuid(), expectedVersion: z.number().int().positive(), snapshotHash: hash,
}).strict();
export const estimateShareChatDecisionSchema = z.object({
  workspaceId: z.uuid(), request: estimateShareChatBindingSchema,
  decision: z.enum(["confirm", "cancel", "open"]),
  paymentLinkReviewed: z.boolean(),
}).strict();
export const estimateShareChatRefreshSchema = z.object({
  workspaceId: z.uuid(), request: estimateShareChatBindingSchema, recipientEmail: z.email().max(254),
}).strict();
export const estimateShareChatReviewSchema = z.object({
  today: z.iso.date(),
  recipientName: z.string().max(200), recipientEmail: z.string().max(254),
  subject: z.string().min(1).max(300),
  snapshot: estimateFrozenSnapshotSchema,
  parent: z.object({ type: z.enum(["lead", "job"]), id: z.uuid(), version: z.number().int().positive() }).strict(),
  revision: z.object({
    sourceEstimateId: z.uuid(), sourceVersion: z.number().int().positive(), sourceRevision: z.number().int().positive(),
    sourceStatus: estimateStatusSchema, requiresPaymentLinkReview: z.boolean(),
  }).strict().nullable(),
  delivery: z.object({
    email: z.discriminatedUnion("state", [
      z.object({ state: z.literal("not-sent") }).strict(),
      z.object({
        state: z.enum(["queued", "sent", "failed", "bounced"]), recipientEmail: z.string().max(254),
        updatedAt: z.iso.datetime(), attemptCount: z.number().int().nonnegative(),
        nextAttemptAt: z.iso.datetime().nullable(), failureMessage: z.string().optional(),
      }).strict(),
    ]),
    link: z.object({
      state: z.enum(["not-created", "active", "expired", "revoked", "replaced", "unavailable"]),
      expiresAt: z.iso.datetime().nullable(), firstViewedAt: z.iso.datetime().nullable(),
    }).strict(),
  }).strict(),
}).strict();
export const estimateShareChatReceiptSchema = z.object({
  estimateId: z.uuid(), version: z.number().int().positive(), snapshotHash: hash,
  status: z.enum(["sent", "published"]),
}).strict();
export const estimateShareChatViewSchema = z.object({
  ticket: estimateShareChatTicketSchema, review: estimateShareChatReviewSchema,
  receipt: estimateShareChatReceiptSchema.nullable(),
}).strict().superRefine((value, context) => {
  const { ticket, review, receipt } = value;
  const content = review.snapshot.content;
  if ((review.revision !== null && (!ticket.requiresDialog || ticket.actionType === "estimate.resend")) ||
      review.recipientName !== content.recipientName ||
      (ticket.actionType !== "estimate.resend" && review.recipientEmail !== content.recipientEmail) ||
      (ticket.actionType !== "estimate.publish" && !estimateEmailDestinationSchema.safeParse({
        recipientEmail: review.recipientEmail, subject: review.subject,
      }).success)) {
    context.addIssue({ code: "custom", message: "Sharing destination and revision review must match their operation." });
  }
  if (content.number !== ticket.estimate.number || content.revision !== ticket.estimate.revision ||
      content.name !== ticket.estimate.name || content.validUntil !== ticket.estimate.validUntil ||
      review.snapshot.amounts.totalCents !== ticket.estimate.totalCents ||
      (receipt !== null && (ticket.state !== "confirmed" || receipt.estimateId !== ticket.estimate.id ||
        receipt.version !== ticket.estimate.version + 1 || receipt.snapshotHash !== ticket.snapshotHash ||
        receipt.status !== (ticket.actionType === "estimate.publish" ? "published" : "sent"))) ||
      (ticket.state === "confirmed" && receipt === null)) {
    context.addIssue({ code: "custom", message: "Sharing review, identity and receipt must agree." });
  }
});
export type EstimateShareChatView = z.infer<typeof estimateShareChatViewSchema>;
export const estimateShareChatStoredSchema = estimateShareChatViewSchema.safeExtend({
  stamp: z.string().regex(/^[a-f0-9]{32}$/),
});
export type EstimateShareChatStored = z.infer<typeof estimateShareChatStoredSchema>;
export const estimateShareChatResponseSchema = z.object({
  view: estimateShareChatViewSchema,
  href: z.string().regex(/^\/estimates\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/).optional(),
}).strict();

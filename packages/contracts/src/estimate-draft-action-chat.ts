import { z } from "zod";
import { estimateDraftValuesSchema, estimateStatusSchema } from "./estimate";
import { estimateChatEstimateRefSchema } from "./estimate-chat";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const stamp = z.string().regex(/^[a-f0-9]{32}$/);
const version = z.number().int().positive();
const number = z.string().regex(/^EST-\d{4,}$/);
export const estimateDraftActionChatProposeSchema = z.object({
  request: z.object({
    operation: z.enum(["revise", "duplicate"]),
    estimateRef: estimateChatEstimateRefSchema.nullable(),
  }).strict(),
}).strict();
export type EstimateDraftActionChatInput = z.infer<typeof estimateDraftActionChatProposeSchema>["request"];

const source = z.object({
  id: z.uuid(), version, number, revision: version, name: z.string().min(1).max(120),
  status: estimateStatusSchema, archived: z.boolean(),
}).strict();
const plan = z.object({
  kind: z.enum(["create", "reuse"]), revision: version,
  existingDraft: z.object({ id: z.uuid(), version }).strict().nullable(),
}).strict();
export const estimateDraftActionChatTicketSchema = z.object({
  id: z.uuid(), actionType: z.enum(["estimate.revise", "estimate.duplicate"]),
  inputHash: hash, authorizationVersion: hash, reviewHash: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  source, plan,
}).strict().superRefine((ticket, context) => {
  const duration = Date.parse(ticket.expiresAt) - Date.parse(ticket.createdAt);
  if (duration <= 0 || duration > 900000 ||
      (ticket.plan.kind === "reuse") !== (ticket.plan.existingDraft !== null) ||
      ticket.plan.existingDraft?.id === ticket.source.id ||
      (ticket.actionType === "estimate.duplicate"
        ? ticket.plan.kind !== "create" || ticket.plan.revision !== 1
        : ticket.source.archived || !["sent", "published", "declined", "expired"].includes(ticket.source.status) ||
          ticket.plan.revision <= ticket.source.revision)) {
    context.addIssue({ code: "custom", message: "Draft action must bind an eligible source, exact plan and at most 15-minute window." });
  }
});
export type EstimateDraftActionChatTicket = z.infer<typeof estimateDraftActionChatTicketSchema>;
export const estimateDraftActionChatBindingSchema = z.object({
  proposalId: z.uuid(), actionType: z.enum(["estimate.revise", "estimate.duplicate"]),
  inputHash: hash, authorizationVersion: hash, reviewHash: hash,
  estimateId: z.uuid(), expectedVersion: version,
}).strict();
export const estimateDraftActionChatDecisionSchema = z.object({
  workspaceId: z.uuid(), request: estimateDraftActionChatBindingSchema,
  decision: z.enum(["confirm", "cancel", "open"]),
}).strict();
export const estimateDraftActionChatReviewSchema = z.object({
  parent: z.object({
    type: z.enum(["lead", "job"]), id: z.uuid(), version,
    number: z.string().min(1).max(40), name: z.string().min(1).max(200),
  }).strict(),
  values: estimateDraftValuesSchema,
  totalCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  snapshotHash: hash.nullable(),
}).strict();
const receipt = z.object({
  id: z.uuid(), number, revision: version, version, updatedAt: z.iso.datetime(), reused: z.boolean(),
}).strict();
export const estimateDraftActionChatViewSchema = z.object({
  ticket: estimateDraftActionChatTicketSchema, review: estimateDraftActionChatReviewSchema, receipt: receipt.nullable(),
}).strict().superRefine(({ ticket, review, receipt }, context) => {
  const duplicate = ticket.actionType === "estimate.duplicate";
  if ((duplicate ? review.snapshotHash !== null : review.snapshotHash === null) ||
      (duplicate && (review.values.details.name !== `${ticket.source.name.slice(0, 113)} (copy)` ||
        review.values.details.recipientName !== "" || review.values.details.recipientEmail !== "" ||
        review.values.terms.validUntil !== "" || review.values.paymentLink !== "")) ||
      (!duplicate && ticket.plan.kind === "create" && review.values.internalNotes !== "") ||
      (review.values.items.length === 0) !== (review.totalCents === null) ||
      (ticket.state === "confirmed") !== (receipt !== null) ||
      (receipt && (receipt.id === ticket.source.id || receipt.revision !== ticket.plan.revision ||
        receipt.reused !== (ticket.plan.kind === "reuse") ||
        (duplicate ? receipt.number === ticket.source.number : receipt.number !== ticket.source.number) ||
        (ticket.plan.existingDraft
          ? receipt.id !== ticket.plan.existingDraft.id || receipt.version !== ticket.plan.existingDraft.version
          : receipt.version !== 1)))) {
    context.addIssue({ code: "custom", message: "Draft review, copy rules and receipt must agree with the exact proposal." });
  }
});
export type EstimateDraftActionChatView = z.infer<typeof estimateDraftActionChatViewSchema>;
export const estimateDraftActionChatStoredSchema = estimateDraftActionChatViewSchema.safeExtend({
  stamp, resultStamp: stamp.nullable(),
}).superRefine((value, context) => {
  if ((value.ticket.state === "confirmed") !== (value.resultStamp !== null)) {
    context.addIssue({ code: "custom", message: "Confirmed Draft actions require current result evidence." });
  }
});
export type EstimateDraftActionChatStored = z.infer<typeof estimateDraftActionChatStoredSchema>;
export const estimateDraftActionChatResponseSchema = z.object({
  view: estimateDraftActionChatViewSchema,
  href: z.string().regex(/^\/estimates\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/).optional(),
}).strict().superRefine(({ view, href }, context) => {
  if (href && (!view.receipt || view.ticket.state !== "confirmed" || !href.startsWith(`/estimates/${view.receipt.id}?workspace=`))) {
    context.addIssue({ code: "custom", message: "Only a confirmed Draft action may open its exact saved result." });
  }
});

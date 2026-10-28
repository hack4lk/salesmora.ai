import { z } from "zod";
import { estimateChatEstimateRefSchema } from "./estimate-chat";
import { voidEstimateSchema } from "./estimate-lifecycle";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const estimateVoidChatProposeSchema = z.object({
  request: z.object({
    operation: z.literal("void"),
    estimateRef: estimateChatEstimateRefSchema.nullable(),
    reason: voidEstimateSchema.shape.reason.nullable(),
  }).strict(),
}).strict();
export const estimateVoidChatTicketSchema = z.object({
  id: z.uuid(), actionType: z.literal("estimate.void"),
  inputHash: hash, authorizationVersion: hash, reviewHash: hash, snapshotHash: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: z.object({
    id: z.uuid(), version: z.number().int().positive(), number: z.string().regex(/^EST-\d{4,}$/),
    revision: z.number().int().positive(), name: z.string().min(1).max(120),
    status: z.enum(["sent", "published"]), archived: z.literal(false),
  }).strict(),
}).strict().superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000) {
    context.addIssue({ code: "custom", message: "Void review lifetime must not exceed 15 minutes." });
  }
});
export type EstimateVoidChatTicket = z.infer<typeof estimateVoidChatTicketSchema>;
export const estimateVoidChatBindingSchema = z.object({
  proposalId: z.uuid(), actionType: z.literal("estimate.void"), inputHash: hash,
  authorizationVersion: hash, reviewHash: hash, snapshotHash: hash,
  estimateId: z.uuid(), expectedVersion: z.number().int().positive(),
}).strict();
export const estimateVoidChatDecisionSchema = z.object({
  workspaceId: z.uuid(), request: estimateVoidChatBindingSchema, decision: z.enum(["confirm", "cancel", "open"]),
}).strict();
export const estimateVoidChatReviewSchema = z.object({
  recipientName: z.string().min(1).max(200),
  totalCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  parent: z.object({
    type: z.enum(["lead", "job"]), id: z.uuid(), version: z.number().int().positive(),
    number: z.string().min(1).max(30), name: z.string().min(1).max(200),
  }).strict(),
  today: z.iso.date(), timezone: z.string().min(1).refine(value => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch (error) { if (error instanceof RangeError) return false; throw error; }
  }),
  reason: z.string().max(500).refine(value => value === value.trim()),
}).strict();
const receipt = z.object({
  estimateId: z.uuid(), version: z.number().int().positive(), status: z.literal("void"), updatedAt: z.iso.datetime(),
}).strict();
export const estimateVoidChatViewSchema = z.object({
  ticket: estimateVoidChatTicketSchema, review: estimateVoidChatReviewSchema,
  canConfirm: z.boolean(), receipt: receipt.nullable(),
}).strict().superRefine((value, context) => {
  if (value.canConfirm !== (value.review.reason.length > 0) ||
      (value.ticket.state === "confirmed") !== (value.receipt !== null) ||
      (value.receipt && (!value.canConfirm || value.receipt.estimateId !== value.ticket.estimate.id ||
        value.receipt.version !== value.ticket.estimate.version + 1))) {
    context.addIssue({ code: "custom", message: "Void reason, confirmation readiness and receipt must agree." });
  }
});
export type EstimateVoidChatView = z.infer<typeof estimateVoidChatViewSchema>;
export const estimateVoidChatStoredSchema = estimateVoidChatViewSchema.safeExtend({
  stamp: z.string().regex(/^[a-f0-9]{32}$/),
  resultStamp: z.string().regex(/^[a-f0-9]{32}$/).nullable(),
}).superRefine((value, context) => {
  if ((value.ticket.state === "confirmed") !== (value.resultStamp !== null)) {
    context.addIssue({ code: "custom", message: "Only a confirmed Void has saved-result evidence." });
  }
});
export type EstimateVoidChatStored = z.infer<typeof estimateVoidChatStoredSchema>;
export const estimateVoidChatResponseSchema = z.object({
  view: estimateVoidChatViewSchema,
  href: z.string().regex(/^\/estimates\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/).optional(),
}).strict();

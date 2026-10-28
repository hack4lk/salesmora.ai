import { z } from "zod";
import { estimateStatusSchema } from "./estimate";
import { estimateChatEstimateRefSchema } from "./estimate-chat";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const estimateArchiveChatProposeSchema = z.object({
  request: z.object({
    operation: z.enum(["archive", "restore"]),
    estimateRef: estimateChatEstimateRefSchema.nullable(),
  }).strict(),
}).strict();
export const estimateArchiveChatTicketSchema = z.object({
  id: z.uuid(), actionType: z.enum(["estimate.archive", "estimate.restore"]),
  inputHash: hash, authorizationVersion: hash, reviewHash: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: z.object({
    id: z.uuid(), version: z.number().int().positive(), number: z.string().regex(/^EST-\d{4,}$/),
    revision: z.number().int().positive(), name: z.string().min(1).max(120),
    status: estimateStatusSchema, archived: z.boolean(),
  }).strict(),
}).strict().superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000 ||
      (value.actionType === "estimate.archive"
        ? value.estimate.archived || !["declined", "expired", "superseded", "void"].includes(value.estimate.status)
        : !value.estimate.archived)) {
    context.addIssue({ code: "custom", message: "Archive/Restore must bind an eligible source and at most 15-minute window." });
  }
});
export type EstimateArchiveChatTicket = z.infer<typeof estimateArchiveChatTicketSchema>;
export const estimateArchiveChatBindingSchema = z.object({
  proposalId: z.uuid(), actionType: z.enum(["estimate.archive", "estimate.restore"]), inputHash: hash,
  authorizationVersion: hash, reviewHash: hash,
  estimateId: z.uuid(), expectedVersion: z.number().int().positive(),
}).strict();
export const estimateArchiveChatDecisionSchema = z.object({
  workspaceId: z.uuid(), request: estimateArchiveChatBindingSchema, decision: z.enum(["confirm", "cancel", "open"]),
}).strict();
export const estimateArchiveChatReviewSchema = z.object({
  recipientName: z.string().max(200),
  parent: z.object({
    type: z.enum(["lead", "job"]), id: z.uuid(), version: z.number().int().positive(),
    number: z.string().min(1).max(40), name: z.string().min(1).max(200),
  }).strict(),
  today: z.iso.date(), timezone: z.string().min(1).refine(value => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch (error) { if (error instanceof RangeError) return false; throw error; }
  }),
}).strict();
const receipt = z.object({
  estimateId: z.uuid(), version: z.number().int().positive(), archived: z.boolean(), updatedAt: z.iso.datetime(),
}).strict();
export const estimateArchiveChatViewSchema = z.object({
  ticket: estimateArchiveChatTicketSchema, review: estimateArchiveChatReviewSchema, receipt: receipt.nullable(),
}).strict().superRefine(({ ticket, receipt }, context) => {
  if ((ticket.state === "confirmed") !== (receipt !== null) ||
      (receipt && (receipt.estimateId !== ticket.estimate.id || receipt.version !== ticket.estimate.version + 1 ||
        receipt.archived !== (ticket.actionType === "estimate.archive")))) {
    context.addIssue({ code: "custom", message: "Archive/Restore receipt must match the exact action, source and next version." });
  }
});
export type EstimateArchiveChatView = z.infer<typeof estimateArchiveChatViewSchema>;
export const estimateArchiveChatStoredSchema = estimateArchiveChatViewSchema.safeExtend({
  stamp: z.string().regex(/^[a-f0-9]{32}$/),
  resultStamp: z.string().regex(/^[a-f0-9]{32}$/).nullable(),
}).superRefine((value, context) => {
  if ((value.ticket.state === "confirmed") !== (value.resultStamp !== null)) {
    context.addIssue({ code: "custom", message: "Only confirmed Archive/Restore has saved-result evidence." });
  }
});
export type EstimateArchiveChatStored = z.infer<typeof estimateArchiveChatStoredSchema>;
export const estimateArchiveChatResponseSchema = z.object({
  view: estimateArchiveChatViewSchema,
  href: z.string().regex(/^\/estimates\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/).optional(),
}).strict().superRefine(({ view, href }, context) => {
  if (href && (!view.receipt || !href.startsWith(`/estimates/${view.receipt.estimateId}?workspace=`))) {
    context.addIssue({ code: "custom", message: "Only a confirmed Archive/Restore may open its exact saved Estimate." });
  }
});

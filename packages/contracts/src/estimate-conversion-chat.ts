import { z } from "zod";
import { estimateChatEstimateRefSchema } from "./estimate-chat";
import { estimateConversionReviewSchema } from "./estimate-conversion";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const stamp = z.string().regex(/^[a-f0-9]{32}$/);
const version = z.number().int().positive();

export const estimateConversionChatProposeSchema = z.object({
  request: z.object({
    operation: z.literal("convert"),
    estimateRef: estimateChatEstimateRefSchema.nullable(),
  }).strict(),
}).strict();

export const estimateConversionChatTicketSchema = z.object({
  id: z.uuid(),
  actionType: z.literal("estimate.convert"),
  inputHash: hash,
  authorizationVersion: hash,
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: estimateConversionReviewSchema.shape.estimate,
  customer: estimateConversionReviewSchema.shape.customer,
}).strict().superRefine((ticket, context) => {
  const duration = Date.parse(ticket.expiresAt) - Date.parse(ticket.createdAt);
  if (duration <= 0 || duration > 900000) {
    context.addIssue({ code: "custom", message: "Conversion review must expire within 15 minutes." });
  }
});
export type EstimateConversionChatTicket = z.infer<typeof estimateConversionChatTicketSchema>;

export const estimateConversionChatBindingSchema = z.object({
  proposalId: z.uuid(),
  actionType: z.literal("estimate.convert"),
  inputHash: hash,
  authorizationVersion: hash,
  estimateId: z.uuid(),
  expectedVersion: version,
  snapshotHash: hash,
  sourceLeadId: z.uuid(),
}).strict();

export const estimateConversionChatDecisionSchema = z.object({
  workspaceId: z.uuid(),
  request: estimateConversionChatBindingSchema,
  decision: z.enum(["review", "cancel"]),
}).strict();

export const estimateConversionChatViewSchema = z.object({
  ticket: estimateConversionChatTicketSchema,
  review: estimateConversionReviewSchema,
}).strict().superRefine(({ ticket, review }, context) => {
  if (ticket.estimate.id !== review.estimate.id ||
      ticket.estimate.version !== review.estimate.version ||
      ticket.estimate.snapshotHash !== review.estimate.snapshotHash ||
      ticket.estimate.parentId !== review.estimate.parentId ||
      ticket.customer.state !== review.customer.state ||
      (ticket.customer.state === "ready" && review.customer.state === "ready" &&
        (ticket.customer.id !== review.customer.id || ticket.customer.name !== review.customer.name))) {
    context.addIssue({
      code: "custom",
      message: "Conversion ticket and authorized review must match.",
    });
  }
});
export type EstimateConversionChatView = z.infer<typeof estimateConversionChatViewSchema>;

export const estimateConversionChatResponseSchema = z.object({
  view: estimateConversionChatViewSchema,
}).strict();

export const estimateConversionChatStoredSchema = estimateConversionChatViewSchema.safeExtend({
  stamp,
});
export type EstimateConversionChatStored = z.infer<typeof estimateConversionChatStoredSchema>;

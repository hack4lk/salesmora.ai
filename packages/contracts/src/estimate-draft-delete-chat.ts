import { z } from "zod";
import { estimateChatEstimateRefSchema } from "./estimate-chat";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const stamp = z.string().regex(/^[a-f0-9]{32}$/);
const version = z.number().int().positive();
const number = z.string().regex(/^EST-\d{4,}$/);

export const estimateDraftDeleteChatProposeSchema = z.object({
  request: z.object({
    operation: z.literal("delete-draft"),
    estimateRef: estimateChatEstimateRefSchema.nullable(),
  }).strict(),
}).strict();
export type EstimateDraftDeleteChatInput =
  z.infer<typeof estimateDraftDeleteChatProposeSchema>["request"];

export const estimateDraftDeleteChatTicketSchema = z.object({
  id: z.uuid(),
  actionType: z.literal("estimate.delete-draft"),
  inputHash: hash,
  authorizationVersion: hash,
  reviewHash: hash,
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: z.object({
    id: z.uuid(),
    version,
    number,
    revision: version,
  }).strict(),
}).strict().superRefine((ticket, context) => {
  const duration = Date.parse(ticket.expiresAt) - Date.parse(ticket.createdAt);
  if (duration <= 0 || duration > 900000) {
    context.addIssue({ code: "custom", message: "Draft deletion review must expire within 15 minutes." });
  }
});
export type EstimateDraftDeleteChatTicket = z.infer<typeof estimateDraftDeleteChatTicketSchema>;

export const estimateDraftDeleteChatBindingSchema = z.object({
  proposalId: z.uuid(),
  actionType: z.literal("estimate.delete-draft"),
  inputHash: hash,
  authorizationVersion: hash,
  reviewHash: hash,
  estimateId: z.uuid(),
  expectedVersion: version,
}).strict();

export const estimateDraftDeleteChatDecisionSchema = z.object({
  workspaceId: z.uuid(),
  request: estimateDraftDeleteChatBindingSchema,
  decision: z.enum(["confirm", "cancel"]),
  typedConfirmation: z.string().min(1).max(40).optional(),
}).strict().superRefine((request, context) => {
  if ((request.decision === "confirm") !== (request.typedConfirmation !== undefined)) {
    context.addIssue({
      code: "custom",
      message: "Only explicit deletion confirmation includes the exact typed Estimate number.",
    });
  }
});

export const estimateDraftDeleteChatReviewSchema = z.object({
  name: z.string().min(1).max(120),
  recipientName: z.string().max(200),
  parent: z.object({
    type: z.enum(["lead", "job"]),
    id: z.uuid(),
    version,
    number: z.string().min(1).max(40),
    name: z.string().min(1).max(200),
  }).strict(),
}).strict();

const receipt = z.object({
  estimateId: z.uuid(),
  version,
  number,
  revision: version,
}).strict();

export const estimateDraftDeleteChatViewSchema = z.object({
  ticket: estimateDraftDeleteChatTicketSchema,
  review: estimateDraftDeleteChatReviewSchema,
  receipt: receipt.nullable(),
}).strict().superRefine(({ ticket, receipt }, context) => {
  if ((ticket.state === "confirmed") !== (receipt !== null) ||
      (receipt && (
        receipt.estimateId !== ticket.estimate.id ||
        receipt.version !== ticket.estimate.version ||
        receipt.number !== ticket.estimate.number ||
        receipt.revision !== ticket.estimate.revision
      ))) {
    context.addIssue({
      code: "custom",
      message: "Draft deletion receipt must match the exact deleted revision.",
    });
  }
});
export type EstimateDraftDeleteChatView = z.infer<typeof estimateDraftDeleteChatViewSchema>;
export const estimateDraftDeleteChatResponseSchema = z.object({
  view: estimateDraftDeleteChatViewSchema,
}).strict();

export const estimateDraftDeleteChatStoredSchema = estimateDraftDeleteChatViewSchema.safeExtend({
  stamp,
  resultStamp: stamp.nullable(),
}).superRefine((value, context) => {
  if ((value.ticket.state === "confirmed") !== (value.resultStamp !== null)) {
    context.addIssue({
      code: "custom",
      message: "Only a confirmed Draft deletion has saved-result evidence.",
    });
  }
});
export type EstimateDraftDeleteChatStored = z.infer<typeof estimateDraftDeleteChatStoredSchema>;

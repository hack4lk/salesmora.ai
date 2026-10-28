import { z } from "zod";
import { estimateStatusSchema } from "./estimate";
import {
  estimateDecisionChannels, estimateDecisionCommandSchema, estimateDecisionOutcomes,
  estimateRecordedDecisionSchema,
} from "./estimate-decision";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const date = estimateRecordedDecisionSchema.shape.decisionDate;
export const estimateDecisionChatProposeSchema = z.object({
  request: z.object({
    operation: z.enum(["decision", "correct-decision"]),
    estimateRef: z.string().max(80).nullable(),
    outcome: z.enum(estimateDecisionOutcomes).nullable(),
    decisionDate: date.nullable(),
    channel: z.enum(estimateDecisionChannels).nullable(),
    note: z.string().max(500).nullable(),
    reason: z.string().max(500).nullable(),
  }).strict(),
}).strict();
export type EstimateDecisionChatInput = z.infer<typeof estimateDecisionChatProposeSchema>["request"];
const record = z.object({
  id: z.uuid(), version: z.number().int().positive(), number: z.string().regex(/^EST-\d{4,}$/),
  revision: z.number().int().positive(), name: z.string().min(1).max(120),
  status: estimateStatusSchema, archived: z.boolean(),
  totalCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict();
export const estimateDecisionChatTicketSchema = z.object({
  id: z.uuid(), actionType: z.literal("estimate.decision"), mode: z.enum(["record", "correct"]),
  inputHash: hash, authorizationVersion: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "superseded", "expired"]),
  estimate: record, snapshotHash: hash,
}).strict().superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000) {
    context.addIssue({ code: "custom", message: "Decision review lifetime must not exceed 15 minutes." });
  }
  if (value.estimate.archived || !(value.mode === "record" ? ["sent", "published"] : ["accepted", "declined"]).includes(value.estimate.status)) {
    context.addIssue({ code: "custom", message: "Decision proposals must bind an eligible active Estimate." });
  }
});
export type EstimateDecisionChatTicket = z.infer<typeof estimateDecisionChatTicketSchema>;
export const estimateDecisionChatBindingSchema = z.object({
  proposalId: z.uuid(), actionType: z.literal("estimate.decision"), inputHash: hash,
  authorizationVersion: hash, estimateId: z.uuid(), expectedVersion: z.number().int().positive(), snapshotHash: hash,
}).strict();
export const estimateDecisionChatDecisionSchema = z.object({
  workspaceId: z.uuid(), request: estimateDecisionChatBindingSchema, decision: z.enum(["confirm", "cancel", "open"]),
}).strict();
const review = z.object({
  estimate: record.extend({
    recipientName: z.string().min(1).max(200),
    decision: estimateRecordedDecisionSchema.extend({ id: z.uuid() }).nullable(),
  }).strict(),
  today: date, timezone: z.string().min(1).refine(value => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch (error) { if (error instanceof RangeError) return false; throw error; }
  }),
  canDecide: z.boolean(), canCorrectDecision: z.boolean(),
  parent: z.object({ type: z.enum(["lead", "job"]), id: z.uuid(), version: z.number().int().positive() }).strict(),
}).strict();
const value = z.object({
  estimateId: z.uuid(), expectedVersion: z.number().int().positive(),
  outcome: z.union([z.enum(estimateDecisionOutcomes), z.literal("")]),
  decisionDate: z.union([date, z.literal("")]),
  channel: z.union([z.enum(estimateDecisionChannels), z.literal("")]),
  note: z.string().max(500), reason: z.string().max(500),
}).strict();
const receipt = z.object({
  estimateId: z.uuid(), decisionId: z.uuid(), status: z.enum(estimateDecisionOutcomes),
  version: z.number().int().positive(), updatedAt: z.iso.datetime(),
}).strict();
const view = z.object({
  ticket: estimateDecisionChatTicketSchema, review, value, canConfirm: z.boolean(), receipt: receipt.nullable(),
}).strict();

/** Validation only; authorization and execution remain the server's responsibility. */
export function estimateDecisionChatCommand(
  input: Pick<z.infer<typeof view>, "ticket" | "review" | "value">, workspaceId: string,
) {
  const { ticket, review, value } = input;
  const { reason, ...fields } = value;
  const parsed = estimateDecisionCommandSchema.safeParse({
    ...fields, workspaceId, submissionId: ticket.id, estimateId: ticket.estimate.id,
    snapshotHash: ticket.snapshotHash, mode: ticket.mode, expectedDecisionId: review.estimate.decision?.id ?? null,
    ...(ticket.mode === "correct" ? { reason } : {}),
  });
  return parsed.success && value.estimateId === ticket.estimate.id && value.expectedVersion === ticket.estimate.version &&
    review.canDecide && (ticket.mode !== "correct" || review.canCorrectDecision) &&
    value.decisionDate <= review.today ? parsed.data : null;
}
export const estimateDecisionChatViewSchema = view.superRefine((input, context) => {
  const { ticket, review, value, receipt } = input;
  const { decision } = review.estimate;
  if (Object.entries(ticket.estimate).some(([key, entry]) => review.estimate[key as keyof typeof ticket.estimate] !== entry) ||
      value.estimateId !== ticket.estimate.id || value.expectedVersion !== ticket.estimate.version ||
      (ticket.mode === "record" && value.reason !== "") ||
      (ticket.mode === "record" ? decision !== null : !decision || decision.outcome !== ticket.estimate.status) ||
      input.canConfirm !== !!estimateDecisionChatCommand(input, ticket.estimate.id) ||
      (ticket.state === "confirmed") !== (receipt !== null) ||
      (receipt && (receipt.estimateId !== ticket.estimate.id || receipt.version !== ticket.estimate.version + 1 ||
        receipt.status !== value.outcome || !input.canConfirm))) {
    context.addIssue({ code: "custom", message: "Decision review, proposed values, identity and receipt must agree." });
  }
});
export type EstimateDecisionChatView = z.infer<typeof estimateDecisionChatViewSchema>;
export const estimateDecisionChatStoredSchema = estimateDecisionChatViewSchema.safeExtend({
  stamp: z.string().regex(/^[a-f0-9]{32}$/),
});
export type EstimateDecisionChatStored = z.infer<typeof estimateDecisionChatStoredSchema>;
export const estimateDecisionChatResponseSchema = z.object({
  view: estimateDecisionChatViewSchema,
  href: z.string().regex(/^\/estimates\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/).optional(),
}).strict();

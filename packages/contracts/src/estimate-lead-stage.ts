import { z } from "zod";
import { estimateStatusSchema } from "./estimate";
import { leadStages } from "./lead-read";

export type EstimateLeadStageEvent =
  | { kind: "send" | "publish" | "resend" }
  | { kind: "decision"; outcome: "accepted" | "declined"; previousOutcome: "accepted" | "declined" | null };
export type EstimateLeadStageTarget = "estimate-sent" | "lost";

const binding = {
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  sourceSubmissionId: z.uuid(),
  expectedEstimateVersion: z.number().int().positive(),
};
export const estimateLeadStageQuerySchema = z.object(binding).strict();
export type EstimateLeadStageQuery = z.infer<typeof estimateLeadStageQuerySchema>;
export const estimateLeadStageCommandSchema = z.object({
  ...binding,
  leadId: z.uuid(),
  expectedLeadVersion: z.number().int().positive(),
  submissionId: z.uuid(),
  to: z.enum(["estimate-sent", "lost"]),
  reason: z.string().trim().max(500).optional(),
}).strict().refine(value => value.to === "lost" || !value.reason, {
  message: "A reason is only accepted when moving to Lost.", path: ["reason"],
});
export type EstimateLeadStageCommand = z.infer<typeof estimateLeadStageCommandSchema>;

export const estimateLeadStageReviewSchema = z.object({
  estimate: z.object({
    id: z.uuid(), number: z.string(), revision: z.number().int().positive(), version: z.number().int().positive(),
    status: estimateStatusSchema, archived: z.boolean(),
  }).strict(),
  event: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("send") }).strict(),
    z.object({
      kind: z.literal("decision"), outcome: z.literal("declined"),
      previousOutcome: z.enum(["accepted", "declined"]).nullable(),
    }).strict(),
  ]),
  lead: z.object({
    id: z.uuid(), number: z.string(), name: z.string(), version: z.number().int().positive(),
    stage: z.enum(leadStages), canMove: z.boolean(), archived: z.boolean(),
  }).strict(),
  target: z.enum(["estimate-sent", "lost"]).nullable(),
}).strict();
export type EstimateLeadStageReview = z.infer<typeof estimateLeadStageReviewSchema>;
export const estimateLeadStageReceiptSchema = z.object({
  estimateId: z.uuid(), leadId: z.uuid(), submissionId: z.uuid(), version: z.number().int().positive(),
}).strict();
export type EstimateLeadStageReceipt = z.infer<typeof estimateLeadStageReceiptSchema>;

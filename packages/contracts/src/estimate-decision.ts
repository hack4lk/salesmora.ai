import { z } from "zod";
import type { EstimateStatus } from "./estimate";

export const estimateDecisionOutcomes = ["accepted", "declined"] as const;
export const estimateDecisionChannels = ["email", "phone", "in-person", "other"] as const;
export type EstimateDecisionOutcome = (typeof estimateDecisionOutcomes)[number];
export type EstimateDecisionChannel = (typeof estimateDecisionChannels)[number];
export const estimateRecordedDecisionSchema = z.object({
  outcome: z.enum(estimateDecisionOutcomes),
  decisionDate: z.iso.date().refine(value => !value.startsWith("0000")),
  channel: z.enum(estimateDecisionChannels),
  note: z.string().max(500).trim(),
}).strict();
export type EstimateRecordedDecision = z.infer<typeof estimateRecordedDecisionSchema>;

const command = {
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  ...estimateRecordedDecisionSchema.shape,
};
export const estimateDecisionCommandSchema = z.discriminatedUnion("mode", [
  z.object({ ...command, mode: z.literal("record"), expectedDecisionId: z.null() }).strict(),
  z.object({
    ...command, mode: z.literal("correct"), expectedDecisionId: z.uuid(),
    reason: z.string().max(500).trim().min(1),
  }).strict(),
]);
export type EstimateDecisionCommand = z.infer<typeof estimateDecisionCommandSchema>;
export type EstimateDecisionReceipt = {
  estimateId: string;
  decisionId: string;
  status: EstimateRecordedDecision["outcome"];
  version: number;
  updatedAt: string;
};
export type EstimateDecisionReview = {
  estimate: {
    id: string; number: string; revision: number; version: number; name: string;
    recipientName: string; totalCents: number; status: EstimateStatus; archived: boolean;
    decision: (EstimateRecordedDecision & { id: string }) | null;
  };
  snapshotHash: string;
  today: string;
  timezone: string;
  canDecide: boolean;
  canCorrectDecision: boolean;
  canConvertToJob: boolean;
  convertedJob: { number: string; href: string } | null;
};

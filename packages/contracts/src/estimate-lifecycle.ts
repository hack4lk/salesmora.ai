import { z } from "zod";
import { estimateStatusSchema, type EstimateStatus } from "./estimate";
import { estimateRecordedDecisionSchema } from "./estimate-decision";

export const voidEstimateSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  reason: z.string().max(500).trim().min(1),
}).strict();
export type VoidEstimateInput = z.infer<typeof voidEstimateSchema>;
export type EstimateVoidReceipt = { estimateId: string; version: number; status: "void"; updatedAt: string };

export const estimateArchiveCommandSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  mode: z.enum(["archive", "restore"]),
}).strict();
export type EstimateArchiveCommand = z.infer<typeof estimateArchiveCommandSchema>;
export type EstimateArchiveReceipt = { estimateId: string; version: number; archived: boolean; updatedAt: string };

export const estimateHistoryCursorSchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.uuid(),
}).strict();
export const estimateHistoryQuerySchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  before: estimateHistoryCursorSchema.optional(),
}).strict();
export type EstimateHistoryCursor = z.infer<typeof estimateHistoryCursorSchema>;

export const estimateHistoryFields = [
  "name", "recipientName", "recipientEmail", "serviceAddress", "owner", "scope",
  "message", "termsNote", "paymentTerms", "paymentLink", "validUntil", "deposit",
  "taxRate", "discount", "items", "internalNotes",
] as const;
export type EstimateHistoryField = (typeof estimateHistoryFields)[number];
export const estimateActivityChangesSchema = z.object({
  status: z.object({ before: estimateStatusSchema.nullable(), after: estimateStatusSchema }).optional(),
  fields: z.array(z.enum(estimateHistoryFields)).optional(),
  reason: z.string().trim().min(1).max(500).optional(),
  decision: estimateRecordedDecisionSchema.optional(),
  convertedJob: z.object({ id: z.uuid(), number: z.string().trim().min(1).max(20) }).strict().optional(),
  revision: z.object({
    before: z.number().int().positive(),
    after: z.number().int().positive(),
  }).strict().optional(),
});
export type EstimateHistoryChange =
  | { kind: "field"; field: EstimateHistoryField }
  | { kind: "status"; before: EstimateStatus | null; after: EstimateStatus }
  | { kind: "total"; beforeCents: number | null; afterCents: number | null }
  | { kind: "revision"; before: number; after: number }
  | { kind: "converted-job"; number: string };
export type EstimateHistorySource =
  | { type: "ui" | "chat" | "system"; actorName: string | null }
  | { type: "worker" };
type EventBase = {
  id: string;
  createdAt: string;
  source: EstimateHistorySource;
  changes: readonly EstimateHistoryChange[];
};
type DecisionDetails = {
  decisionDate: string;
  channel: "email" | "phone" | "in-person" | "other";
  note?: string;
};
export type EstimateHistoryEvent = EventBase & (
  | { kind: "created" | "updated" | "sent" | "published" | "revision-created" | "expired" | "superseded" | "archived" | "restored" | "duplicated" | "converted" | "delivery-queued" | "delivery-sent" | "delivery-failed" | "delivery-bounced" | "viewed" }
  | ({ kind: "decision-recorded" } & DecisionDetails)
  | ({ kind: "decision-corrected"; reason: string } & DecisionDetails)
  | { kind: "voided"; reason: string }
);
export type EstimateLifecycleRead = {
  estimate: {
    id: string; number: string; revision: number; version: number; name: string;
    recipientName: string; status: EstimateStatus; archived: boolean;
  };
  canVoid: boolean;
  timezone: string;
  events: EstimateHistoryEvent[];
  total: number;
  nextCursor: EstimateHistoryCursor | null;
};

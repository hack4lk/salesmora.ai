import { z } from "zod";
import type { EstimateStatus } from "./estimate";

export const reviseEstimateSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  submissionId: z.uuid(),
}).strict();
export type ReviseEstimateInput = z.infer<typeof reviseEstimateSchema>;

export const estimateRevisionsQuerySchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  beforeRevision: z.number().int().positive().optional(),
}).strict();

export const estimateRevisionSharingSchema = z.object({
  sourceEstimateId: z.uuid(),
  sourceVersion: z.number().int().positive(),
  paymentLinkReviewed: z.boolean(),
}).strict();
export type EstimateRevisionSharing = z.infer<typeof estimateRevisionSharingSchema>;

export type EstimateRevisionSummary = {
  id: string;
  revision: number;
  status: EstimateStatus;
  archived: boolean;
  totalCents: number | null;
  href?: string;
};
export type EstimateRevisionFamily = {
  number: string;
  currentEstimateId: string;
  version: number;
  snapshotHash: string | null;
  canRevise: boolean;
  revisions: EstimateRevisionSummary[];
  total: number;
  nextBeforeRevision: number | null;
};

import { z } from "zod";
import type { EstimateStatus } from "./estimate";

export const relatedEstimatesQuerySchema = z.object({
  workspaceId: z.uuid(),
  recordType: z.enum(["lead", "job", "customer"]),
  recordId: z.uuid(),
  includeHidden: z.boolean().default(false),
  page: z.number().int().min(1).max(100_000).default(1),
}).strict();
export type RelatedEstimatesQuery = z.infer<typeof relatedEstimatesQuerySchema>;

export type RelatedEstimateRow = {
  id: string;
  number: string;
  revision: number;
  name: string;
  status: EstimateStatus;
  archived: boolean;
  totalCents: number | null;
  href: string;
  parent: { type: "lead" | "job"; number: string };
};
export type RelatedEstimatesResult = {
  rows: RelatedEstimateRow[];
  total: number;
  page: number;
  pageSize: number;
  canCreate: boolean;
  readVersion: string;
};

export const estimateCustomerParentsQuerySchema = z.object({
  workspaceId: z.uuid(),
  customerId: z.uuid(),
  type: z.enum(["lead", "job"]),
  q: z.string().trim().max(200).default(""),
}).strict();
export type EstimateCustomerParentsQuery = z.infer<typeof estimateCustomerParentsQuerySchema>;
export type EstimateParentOption = {
  id: string;
  number: string;
  name: string;
  detail: string;
  status: string;
};

import type { EstimateParentType, EstimateStatus } from "../estimate-preview.types";

export type EstimateSummaryRow = {
  id: string;
  number: string;
  revision: number;
  name: string;
  customerName: string;
  status: EstimateStatus;
  archived: boolean;
  totalCents: number | null;
  parentType: EstimateParentType;
  parentId: string;
  parentNumber: string;
  validUntil: string | null;
};
export type EstimateSummaryDateRange = { from: string; to: string };
export type EstimateSummaryResult = {
  id: string;
  /** Assistant wording of the read query, e.g. "Expiring this week". */
  queryLabel: string;
  scope: "workspace" | "assigned";
  filterLabels: readonly string[];
  dateRange: EstimateSummaryDateRange | null;
  retrievedAt: string;
  timezone: string;
  totalMatches: number;
  totalCents: number | null;
  canReviewExport: boolean;
  rows: readonly EstimateSummaryRow[];
};
export type EstimateSummaryCardProps = {
  result?: EstimateSummaryResult;
  state?: "ready" | "loading" | "error" | "forbidden";
  canRead?: boolean;
  disabled?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Host reauthorizes estimate and result identities before navigation. */
  onOpenEstimate?: (estimateId: string) => void;
  /** Host resolves result identities to validated list filters. */
  onOpenList?: (resultId: string) => void;
  /** Host resolves result identities to a validated export-review handoff. */
  onReviewExport?: (resultId: string) => void;
};

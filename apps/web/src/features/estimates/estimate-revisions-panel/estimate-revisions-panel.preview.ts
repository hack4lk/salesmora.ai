import type { EstimateRevisionSummary } from "@salesmora/contracts";
export type { EstimateRevisionSummary } from "@salesmora/contracts";

export function orderEstimateRevisions(
  revisions: readonly EstimateRevisionSummary[],
): EstimateRevisionSummary[] {
  return [...revisions].sort((a, b) => b.revision - a.revision);
}

import { StatusBadge } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimateStatusBadgeData as copy } from "./estimate-status-badge.data";

/** The shared badge supplies appearance; Estimates owns its lifecycle labels. Archived is a separate flag. */
export function EstimateStatusBadge({
  status,
  archived = false,
}: {
  status: EstimateStatus;
  archived?: boolean;
}) {
  const { label, tone } = copy.statuses[status];
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
      <StatusBadge label={label} tone={tone} dot />
      {archived && <StatusBadge label={copy.archived} tone="neutral" />}
    </span>
  );
}

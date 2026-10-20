import type { JobStatus } from "@salesmora/contracts";
import { StatusBadge } from "@salesmora/ui";
import { jobStatusBadgeData } from "./job-status-badge.data";

/** The approved shared badge supplies appearance; Jobs owns its lifecycle labels. */
export function JobStatusBadge({status}:{status:JobStatus}) {
  const {label,tone}=jobStatusBadgeData[status];
  return <StatusBadge label={label} tone={tone} dot />;
}

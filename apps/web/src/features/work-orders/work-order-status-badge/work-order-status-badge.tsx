import type { WorkOrderStatus } from "@salesmora/contracts";
import { StatusBadge } from "@salesmora/ui";
import { workOrderStatusBadgeData } from "./work-order-status-badge.data";

/** The shared badge supplies appearance; Work Orders owns its lifecycle labels. */
export function WorkOrderStatusBadge({status}:{status:WorkOrderStatus}) {
  const {label,tone}=workOrderStatusBadgeData[status];
  return <StatusBadge label={label} tone={tone} dot />;
}

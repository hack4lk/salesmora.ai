import type { WorkOrderStatus } from "@salesmora/contracts";
import type { StatusBadgeTone } from "@salesmora/ui";

export const workOrderStatusBadgeData: Record<WorkOrderStatus, {label:string;tone:StatusBadgeTone}> = {
  draft: {label:"Draft",tone:"neutral"},
  issued: {label:"Issued",tone:"info"},
  "in-progress": {label:"In Progress",tone:"warning"},
  completed: {label:"Completed",tone:"success"},
  canceled: {label:"Canceled",tone:"error"},
};
export const workOrderStatusBadgeStoryData = {
  title:"Work order statuses", description:"Work orders move from Draft to Issued, In Progress and Completed, or are Canceled. Archived is a separate flag.",
  workOrder:"WO-1011 · Water heater replacement", customer:"Priya Shah", label:"Current status", next:"3 of 6 tasks complete",
};

import type { JobStatus, WorkOrderStatus } from "@salesmora/contracts";

export type {
  GanttChartData,
  GanttCustomer,
  GanttJob,
  GanttTeamMember,
  GanttWorkOrder,
} from "@salesmora/contracts";

export type GanttStatus = "on-track" | "at-risk" | "delayed";

/**
 * Maps a job to the status color used on its bar.
 * Overdue open jobs are delayed; completed jobs are distinguished by reduced opacity.
 */
export const mapJobToGanttStatus = (
  jobStatus: JobStatus,
  overdue = false,
): GanttStatus => {
  if (overdue) return "delayed";
  switch (jobStatus) {
    case "waiting":
      return "at-risk";
    case "needs-scheduling":
    case "canceled":
      return "delayed";
    default:
      return "on-track";
  }
};

/** Maps work order status to Gantt status for display purposes. */
export const mapWorkOrderToGanttStatus = (
  woStatus: WorkOrderStatus,
): GanttStatus => {
  switch (woStatus) {
    case "draft":
    case "canceled":
      return "at-risk";
    default:
      return "on-track";
  }
};

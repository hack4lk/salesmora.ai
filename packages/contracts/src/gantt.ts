import type { JobStatus } from "./job";
import type { WorkOrderStatus } from "./work-order";

export interface GanttTeamMember {
  id: string;
  name: string;
}

export interface GanttCustomer {
  id: string;
  name: string;
}

/** A work order is a single visit: it starts on its scheduled date and ends when it was completed. */
export interface GanttWorkOrder {
  id: string;
  jobId: string;
  number: string;
  title: string;
  status: WorkOrderStatus;
  scheduledDate: string | null; // YYYY-MM-DD
  completionDate: string | null; // YYYY-MM-DD, set once the work order is completed
  assigneeId?: string | null;
  assigneeName?: string | null;
}

export interface GanttJob {
  id: string;
  number: string;
  title: string;
  status: JobStatus;
  customerId: string;
  customerName: string;
  scheduledDate: string | null; // YYYY-MM-DD
  completionDeadline: string | null; // YYYY-MM-DD
  primaryOwnerId?: string | null;
  primaryOwnerName?: string | null;
  teamUserIds?: string[];
  /** Open job whose completion deadline has passed in the workspace timezone. */
  overdue?: boolean;
  workOrders: GanttWorkOrder[];
}

export interface GanttChartData {
  jobs: GanttJob[];
  teamMembers: GanttTeamMember[];
  customers: GanttCustomer[];
}

export interface GanttResult extends GanttChartData {
  /** Today in the workspace timezone, YYYY-MM-DD. */
  today: string;
  /** True when more jobs matched than the response limit allows. */
  truncated: boolean;
}

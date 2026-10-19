import type { JobStatus } from "@salesmora/contracts";
import type { StatusBadgeTone } from "@salesmora/ui";

export const jobStatusBadgeData: Record<JobStatus, {label:string;tone:StatusBadgeTone}> = {
  "needs-scheduling": {label:"Needs Scheduling",tone:"neutral"},
  scheduled: {label:"Scheduled",tone:"info"},
  "in-progress": {label:"In Progress",tone:"info"},
  waiting: {label:"Waiting",tone:"warning"},
  completed: {label:"Completed",tone:"success"},
  canceled: {label:"Canceled",tone:"error"},
};
export const jobStatusBadgeStoryData = {
  title:"Job statuses", description:"Scheduled work and job progress use the same statuses across Jobs and Calendar.",
  job:"J-1038 · Kitchen sink repair", customer:"Jordan Lee", next:"Waiting on materials", label:"Current status",
};

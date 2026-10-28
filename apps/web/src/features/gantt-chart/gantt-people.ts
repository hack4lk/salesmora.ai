import type { GanttJob, GanttTeamMember } from './gantt-chart.types';

/**
 * Names of a job's team members. The primary owner is stored separately and is never listed here.
 * Members who left the workspace are shown with the fallback label rather than dropped.
 */
export const getJobTeamNames = (
  job: GanttJob,
  teamMembers: readonly GanttTeamMember[],
  fallback: string,
) => (job.teamUserIds ?? []).map((id) => teamMembers.find((member) => member.id === id)?.name ?? fallback);

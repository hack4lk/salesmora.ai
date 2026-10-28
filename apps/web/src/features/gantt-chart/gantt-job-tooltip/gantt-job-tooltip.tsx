'use client';

import type { ReactNode } from 'react';
import { StatusBadge } from '@salesmora/ui';
import { JobStatusBadge } from '../../jobs/job-status-badge/job-status-badge';
import type { GanttJob, GanttTeamMember } from '../gantt-chart.types';
import { getJobTeamNames } from '../gantt-people';
import { GanttTooltip, type GanttTooltipTriggerProps } from '../gantt-tooltip/gantt-tooltip';
import { ganttJobTooltipData as copy } from './gantt-job-tooltip.data';

export type GanttJobTooltipProps = {
  job: GanttJob;
  teamMembers: readonly GanttTeamMember[];
  children: (triggerProps: GanttTooltipTriggerProps) => ReactNode;
};

/** Hover and focus details for a job bar: identity, status, customer and people. */
export function GanttJobTooltip({ job, teamMembers, children }: GanttJobTooltipProps) {
  const team = getJobTeamNames(job, teamMembers, copy.formerTeammate);

  return (
    <GanttTooltip
      content={
        <div className="grid gap-3">
          <div className="min-w-0 wrap-anywhere">
            <p className="m-0 text-xs font-semibold text-muted">{job.number}</p>
            <p className="m-0 mt-1 text-sm font-semibold">{job.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <JobStatusBadge status={job.status} />
            {job.overdue && <StatusBadge label={copy.overdue} tone="error" />}
          </div>
          <dl className="m-0 grid gap-2 text-sm">
            <div><dt className="text-xs font-semibold text-muted">{copy.customer}</dt><dd className="m-0 mt-0.5 wrap-anywhere">{job.customerName}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">{copy.owner}</dt><dd className="m-0 mt-0.5">{job.primaryOwnerName ?? copy.unassigned}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">{copy.team}</dt><dd className="m-0 mt-0.5 wrap-anywhere">{team.length ? team.join(', ') : copy.noTeam}</dd></div>
          </dl>
        </div>
      }
    >
      {children}
    </GanttTooltip>
  );
}

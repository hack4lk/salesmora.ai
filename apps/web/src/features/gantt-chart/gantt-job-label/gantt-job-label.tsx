'use client';

import type { GanttJob } from '../gantt-chart.types';
import { ganttJobLabelData as copy } from './gantt-job-label.data';

export type GanttJobLabelProps = {
  job: Pick<GanttJob, 'number' | 'title'>;
  expanded: boolean;
  onToggle: () => void;
};

/**
 * Sidebar row for a job. The whole row toggles its work orders.
 */
export function GanttJobLabel({ job, expanded, onToggle }: GanttJobLabelProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={copy.toggleJob(job.number, job.title)}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className="flex h-14 cursor-pointer items-start gap-2 border-b border-line px-4 py-2 hover:bg-paper"
    >
      <div aria-hidden="true" className="mt-1 w-5 shrink-0 font-bold text-primary hover:text-primary-dark">
        {expanded ? '▼' : '▶'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-muted">{job.number}</div>
        <div className="truncate text-sm font-semibold text-ink">{job.title}</div>
      </div>
    </div>
  );
}

'use client';

import { CheckCircleOutlined, CloseOutlined, ErrorOutlined } from '@salesmora/ui';
import { mapJobToGanttStatus, type GanttJob } from '../gantt-chart.types';
import { getBarPosition, getItemDates, getTotalDays } from '../gantt-timeline';
import { ganttJobRowData as copy } from './gantt-job-row.data';

export type GanttJobRowProps = {
  job: GanttJob;
  startDate: string;
  endDate: string;
  /** When provided, the bar links to the job. */
  href?: string;
};

const statusStyles = {
  'on-track': { barClass: 'bg-success', Icon: CheckCircleOutlined },
  'at-risk': { barClass: 'bg-warning', Icon: ErrorOutlined },
  delayed: { barClass: 'bg-error', Icon: CloseOutlined },
} as const;

/**
 * Renders a single job bar on the Gantt timeline with status-based colors and icons.
 */
export function GanttJobRow({ job, startDate, endDate, href }: GanttJobRowProps) {
  const dates = getItemDates(job.scheduledDate, job.completionDeadline);
  if (!dates) {
    return (
      <div className="relative flex h-14 border-b border-line bg-paper">
        <div className="flex items-center p-3 text-xs italic text-muted">{copy.noDates}</div>
      </div>
    );
  }

  const { barClass, Icon } = statusStyles[mapJobToGanttStatus(job.status, job.overdue)];
  const isCompleted = job.status === 'completed';
  const { leftPercent, widthPercent } = getBarPosition(dates.start, dates.end, startDate, endDate);
  const totalDays = getTotalDays(startDate, endDate);
  const barClassName = `absolute top-0 z-10 flex h-6 min-w-30 items-center gap-1.5 rounded-md border border-black/10 px-3 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md ${barClass} ${isCompleted ? 'opacity-40' : ''} ${href ? 'cursor-pointer' : ''}`;
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4.5 shrink-0" />
      <span className="truncate">{job.number}</span>
    </>
  );

  return (
    <div className="relative flex h-14 border-b border-line bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex">
        {Array.from({ length: totalDays }).map((_, i) => (
          <div key={i} className="w-20 shrink-0 border-r border-line" />
        ))}
      </div>

      {/* Left and width are computed from the job dates at runtime */}
      {href ? (
        <a href={href} className={barClassName} style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }} title={job.title} aria-label={copy.openJob(job.number, job.title)}>
          {content}
        </a>
      ) : (
        <div className={barClassName} style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }} title={job.title}>
          {content}
        </div>
      )}
    </div>
  );
}

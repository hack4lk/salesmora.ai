'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { GanttCustomer, GanttJob, GanttTeamMember } from '../gantt-chart.types';
import { DAY_WIDTH_PX, getGanttRange, getTimelineWidth, getTotalDays } from '../gantt-timeline';
import { emptyGanttFilters, GanttFilters, type GanttFiltersValue } from '../gantt-filters/gantt-filters';
import { GanttJobLabel } from '../gantt-job-label/gantt-job-label';
import { GanttJobRow } from '../gantt-job-row/gantt-job-row';
import { GanttLegend } from '../gantt-legend/gantt-legend';
import { GanttTimelineHeader } from '../gantt-timeline-header/gantt-timeline-header';
import { GanttWorkOrderLabel } from '../gantt-work-order-label/gantt-work-order-label';
import { GanttWorkOrderRow } from '../gantt-work-order-row/gantt-work-order-row';
import { ganttChartData as copy } from './gantt-chart.data';

export type GanttChartProps = {
  jobs: readonly GanttJob[];
  teamMembers: readonly GanttTeamMember[];
  customers: readonly GanttCustomer[];
  /** YYYY-MM-DD in the workspace timezone. */
  today: string;
  /** True when the server omitted jobs because of the response limit. */
  truncated?: boolean;
  /** When provided, bars link to the job and work order pages of this workspace. */
  workspaceId?: string;
};

/**
 * Gantt chart displaying jobs and work orders on a timeline.
 * The date header and the bars share one horizontal scroll position.
 */
export function GanttChart({ jobs, teamMembers, customers, today, truncated = false, workspaceId }: GanttChartProps) {
  const id = useId();
  const [expandedJobs, setExpandedJobs] = useState<ReadonlySet<string>>(new Set());
  const [filters, setFilters] = useState<GanttFiltersValue>(emptyGanttFilters);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);

  const { startDate, endDate } = useMemo(() => getGanttRange(jobs, today), [jobs, today]);

  useEffect(() => {
    const header = timelineHeaderRef.current;
    const content = timelineContentRef.current;
    if (!header || !content) return;

    // Open on today with a few days of context before it
    const todayOffset = Math.max(0, getTotalDays(startDate, today) - 3) * DAY_WIDTH_PX;
    content.scrollLeft = todayOffset;
    header.scrollLeft = todayOffset;

    const onHeaderScroll = () => { content.scrollLeft = header.scrollLeft; };
    const onContentScroll = () => { header.scrollLeft = content.scrollLeft; };
    header.addEventListener('scroll', onHeaderScroll);
    content.addEventListener('scroll', onContentScroll);
    return () => {
      header.removeEventListener('scroll', onHeaderScroll);
      content.removeEventListener('scroll', onContentScroll);
    };
  }, [startDate, today]);

  const toggleJobExpanded = (jobId: string) => {
    const updated = new Set(expandedJobs);
    if (!updated.delete(jobId)) updated.add(jobId);
    setExpandedJobs(updated);
  };

  const filteredJobs = jobs.filter((job) => (
    (filters.status === 'all' || filters.status === job.status)
    && (filters.team === 'all' || job.primaryOwnerId === filters.team || !!job.teamUserIds?.includes(filters.team))
    && (filters.customer === 'all' || filters.customer === job.customerId)
  ));

  const totalDays = getTotalDays(startDate, endDate);
  const timelineWidth = getTimelineWidth(startDate, endDate);

  return (
    <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 text-ink">
      <header>
        <h1 id={`${id}-title`} className="m-0 text-heading font-semibold">{copy.title}</h1>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p>
      </header>

      <GanttFilters teamMembers={teamMembers} customers={customers} filters={filters} onFiltersChange={setFilters} />
      <GanttLegend />
      {truncated && <p role="status" className="m-0 text-sm text-muted">{copy.truncated}</p>}

      <div className="flex h-[600px] flex-col overflow-hidden rounded-lg border border-line bg-paper">
        <div className="flex border-b border-line">
          <div className="w-45 shrink-0 border-r border-line bg-canvas px-4 py-3 text-sm font-semibold text-ink">
            {copy.jobsLabel}
          </div>
          <div ref={timelineHeaderRef} className="flex-1 overflow-x-auto overflow-y-hidden">
            {/* Width is computed from the date range at runtime */}
            <div className="flex" style={{ width: `${timelineWidth}px` }}>
              <GanttTimelineHeader startDate={startDate} totalDays={totalDays} today={today} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-45 shrink-0 flex-col overflow-y-auto border-r border-line bg-canvas">
            {filteredJobs.length === 0 ? (
              <div className="p-4 text-center text-sm italic text-muted">{copy.noJobsFound}</div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id}>
                  <GanttJobLabel job={job} expanded={expandedJobs.has(job.id)} onToggle={() => toggleJobExpanded(job.id)} />
                  {expandedJobs.has(job.id) && job.workOrders.map((wo) => (
                    <GanttWorkOrderLabel key={wo.id} workOrder={wo} />
                  ))}
                </div>
              ))
            )}
          </div>

          <div ref={timelineContentRef} className="flex-1 overflow-auto">
            <div style={{ width: `${timelineWidth}px` }}>
              {filteredJobs.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted">{copy.noJobsFound}</div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id}>
                    <GanttJobRow job={job} startDate={startDate} endDate={endDate} href={workspaceId ? `/jobs/${job.id}?workspace=${encodeURIComponent(workspaceId)}` : undefined} />
                    {expandedJobs.has(job.id) && job.workOrders.map((wo) => (
                      <GanttWorkOrderRow key={wo.id} workOrder={wo} startDate={startDate} endDate={endDate} href={workspaceId ? `/work-orders/${wo.id}?workspace=${encodeURIComponent(workspaceId)}` : undefined} />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

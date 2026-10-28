'use client';

import type { GanttWorkOrder } from '../gantt-chart.types';
import { getBarPosition, getItemDates, getTotalDays } from '../gantt-timeline';
import { ganttWorkOrderRowData as copy } from './gantt-work-order-row.data';

export type GanttWorkOrderRowProps = {
  workOrder: GanttWorkOrder;
  startDate: string;
  endDate: string;
  /** When provided, the bar links to the work order. */
  href?: string;
};

/**
 * Renders a single work order bar on the Gantt timeline in seafoam color.
 */
export function GanttWorkOrderRow({ workOrder, startDate, endDate, href }: GanttWorkOrderRowProps) {
  const dates = getItemDates(workOrder.scheduledDate, workOrder.completionDate);
  if (!dates) {
    return (
      <div className="relative flex h-11 border-b border-line bg-paper">
        <div className="flex items-center p-2 text-xs italic text-muted">{copy.noDates}</div>
      </div>
    );
  }

  const isCompleted = workOrder.status === 'completed';
  const { leftPercent, widthPercent } = getBarPosition(dates.start, dates.end, startDate, endDate);
  const totalDays = getTotalDays(startDate, endDate);
  const barClassName = `absolute top-0 z-10 flex h-6 min-w-15 items-center gap-1 rounded border border-black/10 bg-seafoam px-2.5 text-xs font-semibold text-ink shadow-sm transition-shadow hover:shadow-md ${isCompleted ? 'opacity-40' : ''} ${href ? 'cursor-pointer' : ''}`;
  const content = <span className="truncate">{workOrder.number}</span>;

  return (
    <div className="relative flex h-11 border-b border-line bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex">
        {Array.from({ length: totalDays }).map((_, i) => (
          <div key={i} className="w-20 shrink-0 border-r border-decoration" />
        ))}
      </div>

      {/* Left and width are computed from the work order dates at runtime */}
      {widthPercent > 0 && (href ? (
        <a href={href} className={barClassName} style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }} title={workOrder.title} aria-label={copy.openWorkOrder(workOrder.number, workOrder.title)}>
          {content}
        </a>
      ) : (
        <div className={barClassName} style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }} title={workOrder.title}>
          {content}
        </div>
      ))}
    </div>
  );
}

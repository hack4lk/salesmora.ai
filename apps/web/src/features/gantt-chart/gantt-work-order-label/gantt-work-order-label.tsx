'use client';

import type { GanttWorkOrder } from '../gantt-chart.types';

export type GanttWorkOrderLabelProps = {
  workOrder: Pick<GanttWorkOrder, 'title'>;
};

/**
 * Sidebar row for a work order, indented beneath its job.
 */
export function GanttWorkOrderLabel({ workOrder }: GanttWorkOrderLabelProps) {
  return (
    <div className="flex h-11 items-start border-b border-line bg-paper py-1 pl-12 pr-4 hover:bg-canvas">
      <div className="min-w-0 flex-1 truncate text-xs text-ink">{workOrder.title}</div>
    </div>
  );
}

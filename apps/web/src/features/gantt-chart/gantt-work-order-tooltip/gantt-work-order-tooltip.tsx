'use client';

import type { ReactNode } from 'react';
import { WorkOrderStatusBadge } from '../../work-orders/work-order-status-badge/work-order-status-badge';
import type { GanttWorkOrder } from '../gantt-chart.types';
import { GanttTooltip, type GanttTooltipTriggerProps } from '../gantt-tooltip/gantt-tooltip';
import { ganttWorkOrderTooltipData as copy } from './gantt-work-order-tooltip.data';

export type GanttWorkOrderTooltipProps = {
  workOrder: GanttWorkOrder;
  /** Work orders carry no customer of their own, so it comes from the parent job. */
  customerName: string;
  children: (triggerProps: GanttTooltipTriggerProps) => ReactNode;
};

/** Hover and focus details for a work order bar: identity, status, customer and assignee. */
export function GanttWorkOrderTooltip({ workOrder, customerName, children }: GanttWorkOrderTooltipProps) {
  return (
    <GanttTooltip
      content={
        <div className="grid gap-3">
          <div className="min-w-0 wrap-anywhere">
            <p className="m-0 text-xs font-semibold text-muted">{workOrder.number}</p>
            <p className="m-0 mt-1 text-sm font-semibold">{workOrder.title}</p>
          </div>
          <div><WorkOrderStatusBadge status={workOrder.status} /></div>
          <dl className="m-0 grid gap-2 text-sm">
            <div><dt className="text-xs font-semibold text-muted">{copy.customer}</dt><dd className="m-0 mt-0.5 wrap-anywhere">{customerName}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">{copy.assignee}</dt><dd className="m-0 mt-0.5">{workOrder.assigneeName ?? copy.unassigned}</dd></div>
          </dl>
        </div>
      }
    >
      {children}
    </GanttTooltip>
  );
}

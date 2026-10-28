import type { GanttWorkOrder } from '../gantt-chart.types';

const baseWorkOrder: GanttWorkOrder = {
  id: 'story-wo',
  jobId: 'story-job',
  number: 'WO-5001',
  title: 'Demolition & Prep',
  status: 'issued',
  scheduledDate: '2026-10-25',
  completionDate: null,
  assigneeId: 'user-1',
  assigneeName: 'Sam Rivera',
};

export const ganttWorkOrderTooltipData = {
  customer: 'Customer',
  assignee: 'Assigned to',
  unassigned: 'Unassigned',
  stories: {
    heading: 'Gantt work order tooltip',
    description: 'Component preview · Hover or focus the bar to see the tooltip',
    customerName: 'Maple Street Renovations',
  },
  workOrders: {
    default: baseWorkOrder,
    completed: { ...baseWorkOrder, id: 'story-wo-2', number: 'WO-5002', status: 'completed', completionDate: '2026-10-27' },
    unassigned: { ...baseWorkOrder, id: 'story-wo-3', number: 'WO-5003', assigneeId: undefined, assigneeName: undefined },
    long: {
      ...baseWorkOrder,
      id: 'story-wo-4',
      number: 'WO-5004',
      title: 'Remove existing cabinetry, flooring and fixtures, then cap utilities and protect adjoining rooms',
    },
  } satisfies Record<string, GanttWorkOrder>,
} as const;

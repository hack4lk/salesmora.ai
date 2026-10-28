import type { GanttWorkOrder } from '../gantt-chart.types';

const baseWorkOrder: GanttWorkOrder = {
  id: 'story-wo',
  jobId: 'story-job',
  number: 'WO-5001',
  title: 'Demolition & Prep',
  status: 'issued',
  scheduledDate: '2026-10-25',
  completionDate: '2026-10-30',
};

export const ganttWorkOrderRowData = {
  noDates: 'No dates scheduled',
  openWorkOrder: (number: string, title: string) => `Open work order ${number}: ${title}`,
  range: { startDate: '2026-10-21', endDate: '2026-11-20' },
  workOrders: {
    issued: baseWorkOrder,
    completed: { ...baseWorkOrder, id: 'story-wo-2', number: 'WO-5002', status: 'completed' },
    startsBeforeRange: { ...baseWorkOrder, id: 'story-wo-3', number: 'WO-5003', scheduledDate: '2026-10-01' },
    singleDay: { ...baseWorkOrder, id: 'story-wo-5', number: 'WO-5005', completionDate: null },
    unscheduled: { ...baseWorkOrder, id: 'story-wo-4', number: 'WO-5004', scheduledDate: null, completionDate: null },
  } satisfies Record<string, GanttWorkOrder>,
  stories: {
    heading: 'Gantt work order row',
    description: 'Component preview · Work order bar on the timeline',
  },
} as const;

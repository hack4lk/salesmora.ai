import type { GanttJob } from '../gantt-chart.types';

const storyJob: GanttJob = {
  id: 'story-job',
  number: 'J-2401',
  title: 'Kitchen Renovation - Maple Street',
  status: 'scheduled',
  customerId: 'cust-1',
  customerName: 'Maple Street Renovations',
  scheduledDate: '2026-10-25',
  completionDeadline: '2026-11-08',
  workOrders: [],
};

export const ganttJobLabelData = {
  toggleJob: (number: string, title: string) => `Toggle work orders for ${number} ${title}`,
  stories: {
    heading: 'Gantt job label',
    description: 'Component preview · Sidebar row that expands a job',
    longTitle: 'Complete interior renovation of the Riverside Hotel east wing including lobby and conference rooms',
    job: storyJob,
  },
} as const;

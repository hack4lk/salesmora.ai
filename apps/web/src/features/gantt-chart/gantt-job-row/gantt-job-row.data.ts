import type { GanttJob } from '../gantt-chart.types';

const baseJob: GanttJob = {
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

export const ganttJobRowData = {
  noDates: 'No dates scheduled',
  openJob: (number: string, title: string) => `Open job ${number}: ${title}`,
  range: { startDate: '2026-10-21', endDate: '2026-11-20' },
  jobs: {
    onTrack: baseJob,
    atRisk: { ...baseJob, id: 'story-job-2', number: 'J-2402', status: 'waiting' },
    delayed: { ...baseJob, id: 'story-job-3', number: 'J-2403', status: 'needs-scheduling' },
    completed: { ...baseJob, id: 'story-job-4', number: 'J-2404', status: 'completed' },
    startsBeforeRange: { ...baseJob, id: 'story-job-5', number: 'J-2405', scheduledDate: '2026-10-01' },
    overdue: { ...baseJob, id: 'story-job-7', number: 'J-2407', overdue: true },
    singleDay: { ...baseJob, id: 'story-job-8', number: 'J-2408', completionDeadline: null },
    unscheduled: { ...baseJob, id: 'story-job-6', number: 'J-2406', scheduledDate: null, completionDeadline: null },
  } satisfies Record<string, GanttJob>,
  stories: {
    heading: 'Gantt job row',
    description: 'Component preview · Job bar on the timeline',
  },
} as const;

import type { GanttJob, GanttWorkOrder } from '../gantt-chart.types';

const baseWorkOrder: GanttWorkOrder = {
  id: 'story-wo',
  jobId: 'story-job',
  number: 'WO-5001',
  title: 'Demolition & Prep',
  status: 'issued',
  scheduledDate: '2026-10-26',
  completionDate: null,
  assigneeId: 'user-1',
  assigneeName: 'Sam Rivera',
};

const parentJob: GanttJob = {
  id: 'story-job',
  number: 'J-2401',
  title: 'Kitchen Renovation - Maple Street',
  status: 'scheduled',
  customerId: 'cust-1',
  customerName: 'Maple Street Renovations',
  scheduledDate: '2026-10-25',
  completionDeadline: '2026-11-08',
  workOrders: [baseWorkOrder],
};

export const ganttWorkOrderDrawerData = {
  description: (number: string) => `Work order ${number}`,
  customer: 'Customer',
  schedule: 'Schedule',
  scheduled: 'Scheduled',
  completed: 'Completed',
  notSet: 'Not set',
  assignee: 'Assigned to',
  unassigned: 'Unassigned',
  parentJob: 'Parent job',
  viewJob: (number: string, title: string) => `View job ${number}: ${title}`,
  openWorkOrder: (number: string) => `Open work order ${number}`,
  stories: {
    heading: 'Gantt work order drawer',
    launch: 'Open work order drawer',
  },
  job: parentJob,
  workOrders: {
    default: baseWorkOrder,
    completed: { ...baseWorkOrder, id: 'story-wo-2', number: 'WO-5002', status: 'completed', completionDate: '2026-10-28' },
    unscheduled: { ...baseWorkOrder, id: 'story-wo-3', number: 'WO-5003', status: 'draft', scheduledDate: null },
    unassigned: { ...baseWorkOrder, id: 'story-wo-4', number: 'WO-5004', assigneeId: undefined, assigneeName: undefined },
    long: {
      ...baseWorkOrder,
      id: 'story-wo-5',
      number: 'WO-5005',
      title: 'Remove existing cabinetry, flooring and fixtures, then cap utilities and protect adjoining rooms',
    },
  } satisfies Record<string, GanttWorkOrder>,
  longCustomerJob: {
    ...parentJob,
    customerName: 'Northside Community Workshop and Equipment Access Cooperative',
    title: 'Full gut renovation of the north wing including structural reinforcement, electrical rewiring and custom cabinetry',
  } satisfies GanttJob,
} as const;

import type { GanttJob, GanttTeamMember, GanttWorkOrder } from '../gantt-chart.types';

const workOrder = (n: number, extra: Partial<GanttWorkOrder> = {}): GanttWorkOrder => ({
  id: `story-wo-${n}`,
  jobId: 'story-job',
  number: `WO-500${n}`,
  title: ['Demolition & Prep', 'Electrical & Plumbing', 'Cabinet Installation'][n - 1],
  status: 'issued',
  scheduledDate: '2026-10-26',
  completionDate: null,
  assigneeId: 'user-1',
  assigneeName: 'Sam Rivera',
  ...extra,
});

const baseJob: GanttJob = {
  id: 'story-job',
  number: 'J-2401',
  title: 'Kitchen Renovation - Maple Street',
  status: 'scheduled',
  customerId: 'cust-1',
  customerName: 'Maple Street Renovations',
  scheduledDate: '2026-10-25',
  completionDeadline: '2026-11-08',
  primaryOwnerId: 'user-1',
  primaryOwnerName: 'Sam Rivera',
  teamUserIds: ['user-2', 'user-3'],
  workOrders: [workOrder(1), workOrder(2, { status: 'draft' }), workOrder(3, { status: 'completed', completionDate: '2026-10-28' })],
};

export const ganttJobDrawerData = {
  description: (number: string) => `Job ${number}`,
  customer: 'Customer',
  schedule: 'Schedule',
  start: 'Start',
  deadline: 'Deadline',
  notSet: 'Not set',
  owner: 'Owner',
  team: 'Team',
  overdue: 'Overdue',
  unassigned: 'Unassigned',
  noTeam: 'No team members',
  formerTeammate: 'Former teammate',
  workOrders: 'Work orders',
  workOrdersCount: (count: number) => `Work orders (${count})`,
  noWorkOrders: 'No work orders yet.',
  viewWorkOrder: (number: string, title: string) => `View work order ${number}: ${title}`,
  openJob: (number: string) => `Open job ${number}`,
  stories: {
    heading: 'Gantt job drawer',
    launch: 'Open job drawer',
    teamMembers: [
      { id: 'user-1', name: 'Sam Rivera' },
      { id: 'user-2', name: 'Alex Chen' },
      { id: 'user-3', name: 'Jordan Lee' },
    ] satisfies GanttTeamMember[],
  },
  jobs: {
    default: baseJob,
    overdue: { ...baseJob, id: 'story-job-2', number: 'J-2402', status: 'in-progress', scheduledDate: '2026-10-01', completionDeadline: '2026-10-15', overdue: true },
    noWorkOrders: { ...baseJob, id: 'story-job-3', number: 'J-2403', workOrders: [] },
    unscheduled: { ...baseJob, id: 'story-job-4', number: 'J-2404', status: 'needs-scheduling', scheduledDate: null, completionDeadline: null },
    noPeople: { ...baseJob, id: 'story-job-5', number: 'J-2405', primaryOwnerId: undefined, primaryOwnerName: undefined, teamUserIds: [] },
    long: {
      ...baseJob,
      id: 'story-job-6',
      number: 'J-2406',
      title: 'Full gut renovation of the north wing including structural reinforcement, electrical rewiring and custom cabinetry',
      customerName: 'Northside Community Workshop and Equipment Access Cooperative',
      workOrders: [workOrder(1, { title: 'Remove existing cabinetry, flooring and fixtures, then cap utilities and protect adjoining rooms' })],
    },
  } satisfies Record<string, GanttJob>,
} as const;

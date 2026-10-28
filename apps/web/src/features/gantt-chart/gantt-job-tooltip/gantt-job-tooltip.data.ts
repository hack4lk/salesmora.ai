import type { GanttJob, GanttTeamMember } from '../gantt-chart.types';

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
  workOrders: [],
};

export const ganttJobTooltipData = {
  customer: 'Customer',
  owner: 'Owner',
  team: 'Team',
  overdue: 'Overdue',
  unassigned: 'Unassigned',
  noTeam: 'No team members',
  formerTeammate: 'Former teammate',
  stories: {
    heading: 'Gantt job tooltip',
    description: 'Component preview · Hover or focus the bar to see the tooltip',
    teamMembers: [
      { id: 'user-1', name: 'Sam Rivera' },
      { id: 'user-2', name: 'Alex Chen' },
      { id: 'user-3', name: 'Jordan Lee' },
    ] satisfies GanttTeamMember[],
  },
  jobs: {
    default: baseJob,
    overdue: { ...baseJob, id: 'story-job-2', number: 'J-2402', status: 'in-progress', overdue: true },
    noPeople: { ...baseJob, id: 'story-job-3', number: 'J-2403', primaryOwnerId: undefined, primaryOwnerName: undefined, teamUserIds: [] },
    formerTeammate: { ...baseJob, id: 'story-job-4', number: 'J-2404', teamUserIds: ['user-2', 'user-gone'] },
    long: {
      ...baseJob,
      id: 'story-job-5',
      number: 'J-2405',
      title: 'Full gut renovation of the north wing including structural reinforcement, electrical rewiring and custom cabinetry',
      customerName: 'Northside Community Workshop and Equipment Access Cooperative',
    },
  } satisfies Record<string, GanttJob>,
} as const;

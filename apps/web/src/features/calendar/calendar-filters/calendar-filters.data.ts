import { jobStatuses, workOrderStatuses } from '@salesmora/contracts';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { workOrderStatusBadgeData } from '../../work-orders/work-order-status-badge/work-order-status-badge.data';

export const calendarFiltersData = {
  title: 'Calendar filters', person: 'Assigned person', allPeople: 'All assigned people', me: 'Me', unassigned: 'Unassigned',
  type: 'Record type', types: { all: 'Jobs and Work Orders', job: 'Jobs', work_order: 'Work Orders' },
  status: 'Status', allStatuses: 'All active statuses', job: 'Job', workOrder: 'Work Order',
  search: 'Customer search', placeholder: 'Search customers…', mine: 'Only mine',
  ownScope: 'Your access is limited to your own permitted schedule.',
  shared: 'Shared visits appear once when a linked record matches your filters.',
  chip: (label: string, value: string) => `${label}: ${value}`,
  stories: { title: 'Calendar filters preview', description: 'Fictional filter state only; live queries and URL synchronization will be connected later.',
    viewerId: 'sam', sam: 'Sam Rivera', alex: 'Alex Chen', jordan: 'Jordan Lee', customer: 'Jordan',
    longName: 'Alexandra Montgomery-Sánchez — Residential installation and maintenance team',
    longCustomer: 'Northside Community Workshop and Neighborhood Resource Center',
    memberName: (index: number) => `Preview teammate ${index + 1}`,
  },
} as const;
export const calendarFilterStatuses = [
  ...jobStatuses.filter((status): status is Exclude<typeof status, 'completed' | 'canceled'> => status !== 'completed' && status !== 'canceled').map(status => ({ value: `job:${status}` as const, type: 'job' as const, label: `${calendarFiltersData.job}: ${jobStatusBadgeData[status].label}` })),
  ...workOrderStatuses.filter((status): status is Exclude<typeof status, 'completed' | 'canceled'> => status !== 'completed' && status !== 'canceled').map(status => ({ value: `work_order:${status}` as const, type: 'work_order' as const, label: `${calendarFiltersData.workOrder}: ${workOrderStatusBadgeData[status].label}` })),
];
export const calendarFilterMembers = [
  { id: 'sam', name: calendarFiltersData.stories.sam }, { id: 'alex', name: calendarFiltersData.stories.alex }, { id: 'jordan', name: calendarFiltersData.stories.jordan },
];

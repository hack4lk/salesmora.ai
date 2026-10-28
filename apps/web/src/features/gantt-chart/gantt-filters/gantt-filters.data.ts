export const ganttFiltersData = {
  title: 'Filters',
  status: 'Status',
  team: 'Team Member',
  customer: 'Customer',
  allStatuses: 'All Statuses',
  allTeam: 'All Team Members',
  allCustomers: 'All Customers',
  chip: (label: string, value: string) => `${label}: ${value}`,
  jobStatuses: [
    { value: 'needs-scheduling', label: 'Needs scheduling' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
  ],
  stories: {
    heading: 'Gantt filters',
    description: 'Component preview · Status, team member and customer filters',
    teamMembers: [
      { id: 'user-1', name: 'Sam Rivera' },
      { id: 'user-2', name: 'Alex Chen' },
    ],
    customers: [
      { id: 'cust-1', name: 'Maple Street Renovations' },
      { id: 'cust-2', name: 'Downtown Office Build' },
    ],
  },
} as const;

export const metricCardData = {
  fallbackLabel: 'Metric', placeholder: '—', loading: 'Loading…', unavailable: 'Unavailable',
  stories: {
    title: 'Metric card', description: 'Reusable count summary for workspace totals. Fictional values; no data is loaded.',
    customers: 'Customers', workspace: 'In this workspace', openLeads: 'With open leads', opportunities: 'Customers with active opportunities',
    activeJobs: 'With active jobs', currentWork: 'Customers with current work',
    money: 'Open value', moneyValue: '$24,644.03', moneyDescription: 'Draft, sent and published estimates', filterLabel: 'Awaiting response', filterDescription: 'Select to filter the list',
    longLabel: 'Customers with a linked lead requiring attention from your team',
    longDescription: 'Workspace totals include permitted active customer records and remain independent of list search and filters.',
  },
} as const;

export const leadsToolbarData = {
  region: 'Lead search and actions', view: 'Lead view', list: 'List', pipeline: 'Pipeline', add: 'Add lead', export: 'Export',
  search: 'Search leads', placeholder: 'Name, email, phone, service or address', searchHelp: 'Search names, contact details, services and addresses.', searchMinimum: 'Enter at least 2 characters to search.',
  stage: 'Stage', source: 'Source', owner: 'Owner', created: 'Created', from: 'From date', to: 'To date',
  any: 'Any', me: 'Me', unassigned: 'Unassigned', attention: 'Needs attention', archived: 'Show archived',
  dateHelp: 'Choose both dates to apply a custom range.', dateError: 'The end date must be on or after the start date.',
  rangeTitle: 'Check the date range',
  open: (label: string) => `Open ${label.toLowerCase()} filters`, close: (label: string) => `Close ${label.toLowerCase()} filters`, noOptions: 'No matching options',
  selected: (count: number) => `${count} selected`, chip: (label: string, value: string) => `${label}: ${value}`,
  stages: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'estimate-sent', label: 'Estimate sent' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }],
  sources: [{ value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }, { value: 'phone', label: 'Phone' }, { value: 'gmail', label: 'Gmail' }, { value: 'other', label: 'Other' }],
  dates: [{ value: 'any', label: 'Any time' }, { value: '7days', label: 'Last 7 days' }, { value: '30days', label: 'Last 30 days' }, { value: 'custom', label: 'Custom range' }],
  stories: {
    title: 'Leads toolbar', description: 'Preview filters and actions using fictional teammates. No records are queried or changed.',
    owners: [{ id: 'taylor', name: 'Taylor Morgan' }, { id: 'sam', name: 'Sam Rivera' }, { id: 'ava', name: 'Ava Morgan' }],
    added: 'Add lead requested (preview only).', exported: 'Export requested (preview only).',
  },
} as const;

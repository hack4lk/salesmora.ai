export const leadPipelineWidgetData = {
  title: 'Leads by pipeline stage',
  description: 'A quick view of your current opportunities',
  action: 'View pipeline', unavailable: 'Coming soon',
  total: (count: number) => `${new Intl.NumberFormat('en-US').format(count)} ${count === 1 ? 'lead' : 'leads'} across your pipeline`,
  count: (count: number) => new Intl.NumberFormat('en-US').format(count),
  stageValue: (count: number, total: number) => `${count} of ${total} leads`,
  empty: 'No leads yet. Your pipeline will appear here when you add your first lead.',
  stages: [
    { id: 'new', label: 'New' }, { id: 'contacted', label: 'Contacted' },
    { id: 'estimate-sent', label: 'Estimate sent' }, { id: 'won', label: 'Won' }, { id: 'lost', label: 'Lost' },
  ],
  stories: {
    title: 'Home pipeline widget',
    notice: 'Component preview with fictional counts. Pipeline navigation is mocked.',
    counts: { new: 18, contacted: 12, 'estimate-sent': 9, won: 6, lost: 2 },
    empty: { new: 0, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 },
    firstLead: { new: 1, contacted: 0, 'estimate-sent': 0, won: 0, lost: 0 },
    largeCounts: { new: 1234567, contacted: 123456, 'estimate-sent': 12345, won: 1234, lost: 123 },
  },
} as const;

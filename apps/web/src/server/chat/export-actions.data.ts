export const chatExportData = {
  query: (value: string) => `Search: ${value}`, stages: (value: string) => `Stage: ${value}`, sources: (value: string) => `Source: ${value}`,
  owner: (value: string) => `Owner: ${value}`, created: (value: string) => `Created: ${value}`,
  me: 'Me', unassigned: 'Unassigned', attention: 'Needs attention',
  stagesMap: { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent', won: 'Won', lost: 'Lost' },
  sourcesMap: { website: 'Website', referral: 'Referral', phone: 'Phone', gmail: 'Gmail', other: 'Other' },
  dates: { '7days': 'Last 7 days', '30days': 'Last 30 days' },
} as const;

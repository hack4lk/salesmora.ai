export const chatLeadSearchData = {
  owner: (name: string) => `Owner: ${name}`, me: 'Me', unassigned: 'Unassigned', former: 'Former teammate',
  query: (value: string) => `Search: ${value}`, stages: (value: string) => `Stage: ${value}`, sources: (value: string) => `Source: ${value}`,
  created: (value: string) => `Created: ${value}`, custom: (from: string, to: string) => `${from} – ${to}`,
  stagesMap: { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent', won: 'Won', lost: 'Lost' },
  sourcesMap: { website: 'Website', referral: 'Referral', phone: 'Phone', gmail: 'Gmail', other: 'Other' },
  dates: { '7days': 'Last 7 days', '30days': 'Last 30 days' }, attention: 'Needs attention',
} as const;

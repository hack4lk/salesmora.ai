export const homeSummaryMetricsData = {
  title: 'Summary metrics',
  labels: {
    newLeads: 'New leads',
    activeJobs: 'Active jobs',
    attentionJobs: 'Jobs needing attention',
    awaitingIntake: 'Awaiting intake',
    visitsToday: 'Visits today',
  },
  view: (label: string) => `View ${label.toLowerCase()}`,
  about: (label: string) => `About metric: ${label}`,
  viewLabel: 'View',
  retry: (label: string) => `Retry ${label.toLowerCase()}`,
  retryLabel: 'Retry',
  stories: {
    title: 'Home summary review',
    notice: 'Component preview. Counts and destinations are fictional; no workspace data is loaded or changed.',
    workspaceId: '00000000-0000-4000-8000-000000000001',
    longDescription: 'Accessible work · Today plus the preceding 29 calendar dates in the workspace timezone, America/Argentina/Buenos_Aires',
  },
} as const;

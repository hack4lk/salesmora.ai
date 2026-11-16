export const homeActivityWidgetData = {
  title: 'Recent activity',
  about: 'About recent activity',
  description: 'The latest five supported lead and job events on records you can read, newest first. Open a record for details. Private note content and raw changes are not shown; this is not a comprehensive audit log.',
  empty: 'No recent activity available to you.',
  loading: 'Loading recent activity...',
  errorTitle: 'Recent activity unavailable',
  error: 'We could not load recent activity. Other sections are still available.',
  retry: 'Retry activity',
  recordAction: (domain: string, label: string) => `Open ${domain.toLowerCase()}: ${label}`,
  stories: {
    title: 'Home recent activity',
    notice: 'Component preview. Events and destinations are fictional; no live report access is granted.',
    workspaceId: '00000000-0000-4000-8000-000000000001',
  },
} as const;

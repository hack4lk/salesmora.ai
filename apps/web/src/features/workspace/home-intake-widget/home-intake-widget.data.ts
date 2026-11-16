export const homeIntakeWidgetData = {
  title: 'Intake review',
  about: 'About intake review',
  description: 'Incoming items awaiting a review decision. Flagged items appear first, then the oldest received. Approved and dismissed items are excluded. Opening an item does not approve it or create a lead.',
  view: 'Review intake',
  empty: 'No intake items awaiting review.',
  loading: 'Loading intake items…',
  errorTitle: 'Intake review unavailable',
  error: 'We could not load your intake items. Other sections are still available.',
  retry: 'Retry intake',
  awaiting: (total: number) => `${new Intl.NumberFormat('en-US').format(total)} awaiting review`,
  remainder: (shown: number, total: number) => `Showing ${shown} of ${total} awaiting items. Review intake for the rest.`,
  stories: {
    title: 'Home intake review',
    notice: 'Component preview. Intake items and destinations are fictional; no decisions are made.',
    workspaceId: '00000000-0000-4000-8000-000000000001',
  },
} as const;

export const homeAttentionWidgetData = {
  title: 'Needs your attention',
  empty: 'Nothing needs attention. Check your schedule for upcoming work.',
  loading: 'Loading attention items…',
  errorTitle: 'Attention items unavailable',
  error: 'We could not load your attention items. Other sections are still available.',
  retry: 'Retry attention',
  remainder: (shown: number, total: number) => `Showing ${shown} of ${total} items. Review the relevant job, lead, or intake lists for the rest.`,
  actionName: (action: string, title: string) => `${action}: ${title}`,
  stories: {
    notice: 'Component preview. All records and destinations are fictional; no workspace data is loaded or changed.',
    workspaceId: '00000000-0000-4000-8000-000000000001',
    longTitle: 'Alexandra Montgomery · Extensive heating, ventilation and plumbing replacement across the entire property',
    longMetadata: 'J-101 · Alexandra Rivera Montgomery · Waiting for replacement parts and confirmation of access arrangements for the property',
  },
} as const;

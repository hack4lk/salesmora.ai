export const calendarRouteData = {
  assistantContext: (date: string, own: boolean) => `Week of ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))}${own ? ' · Only my schedule' : ''}`,
  error: 'The Calendar could not be loaded. Try again.', errorTitle: 'Calendar unavailable',
  saved: 'Visit schedule updated.', savedReload: 'The visit was saved, but the Calendar could not refresh. Reload to see the latest schedule.',
  unavailable: 'Reload the visit and review its current schedule before confirming.',
  warningsUnavailable: 'Workload warnings could not be checked. You can still save this reviewed schedule.',
} as const;

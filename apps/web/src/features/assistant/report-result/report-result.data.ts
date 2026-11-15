export const reportResultData = {
  title: 'Report result',
  period: 'Selected period',
  current: 'Current snapshot / no historical period',
  timezone: 'Workspace timezone',
  captured: 'Retrieved',
  filters: 'Applied report filters',
  coverage: 'Coverage and definitions',
  open: 'Open report',
  historical: 'This answer reflects the retrieved snapshots. Opening the report reads current authorized data.',
  states: {
    loading: 'Reading the authorized report...',
    error: 'The report result could not be displayed. Retry the report question.',
    unavailable: 'This report result is unavailable under your current access.',
    stale: 'This saved result needs a fresh authorized read. Ask the report question again.',
  },
} as const;

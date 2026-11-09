export const reportCurrentContextData = {
  title: 'Current-state context',
  mode: 'As of now / not filtered by reporting period',
  help: 'About current-state context',
  description: 'Current workload is not limited to records created in the selected reporting period. The scope shown here applies to this snapshot independently of the period results.',
  denied: 'Your current access does not allow this current-state context.',
  loading: 'Loading current-state context...',
  failed: 'Current-state context could not be loaded. No current count is displayed.',
  retry: 'Try again',
  evidence: 'View supporting evidence',
  pending: 'Opening current-state evidence...',
} as const;

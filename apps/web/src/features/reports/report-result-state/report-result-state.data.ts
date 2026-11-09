export const reportResultStateData = {
  loadingTitle: 'Preparing report',
  loading: 'Loading the report for your selected configuration. No totals are displayed yet.',
  errorTitle: 'Report could not be loaded',
  error: 'No totals are displayed. Retry, or edit the report to narrow the selection.',
  emptyTitle: 'No matching records',
  empty: 'This is an authorized empty selection, not a permission denial. Try another range or filter.',
  deniedTitle: 'Reports access required',
  denied: 'Your current access does not allow this report. Ask a workspace administrator to review your permissions.',
  retry: 'Retry report',
  edit: 'Edit report',
  pending: 'Updating report...',
} as const;

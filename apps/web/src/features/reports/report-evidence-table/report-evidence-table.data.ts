export const reportEvidenceTableData = {
  title: 'Supporting evidence',
  export: 'Preview CSV',
  exportHelp: 'CSV exports all matching authorized rows, not only this page.',
  exportHelpLabel: 'About CSV export scope',
  denied: 'Your current access does not allow this supporting evidence.',
  exportDenied: 'CSV requires separate export permissions. On-screen access does not imply export access.',
  invalid: 'Supporting evidence could not be displayed because its page or columns are inconsistent. Refresh the report and try again.',
  unknown: 'Unknown',
  record: (label: string) => `View record: ${label}`,
} as const;

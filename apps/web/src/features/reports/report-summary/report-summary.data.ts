export const reportSummaryData = {
  title: 'Report summary',
  denied: 'Your current access does not allow this report summary.',
  empty: 'No summary metrics are available for this supporting view.',
  evidence: 'View supporting evidence',
  evidenceLabel: (label: string) => `View supporting evidence: ${label}`,
  pending: 'Opening supporting evidence...',
} as const;

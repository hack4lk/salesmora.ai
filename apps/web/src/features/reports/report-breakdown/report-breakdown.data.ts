export const reportBreakdownData = {
  title: (group: string) => `Breakdown / ${group}`,
  help: 'About this breakdown',
  description: "Each count uses the same authorized supporting rows. Bars show each group's share of the total; groups do not overlap.",
  denied: 'Your current access does not allow this report breakdown.',
  invalid: 'The breakdown could not be displayed because its counts do not reconcile. Refresh the report and try again.',
  empty: 'No groups in this selection.',
  total: 'Total supporting rows',
  evidence: 'View supporting evidence',
  evidenceLabel: (label: string) => `View supporting evidence: ${label}`,
  pending: 'Opening supporting evidence...',
} as const;

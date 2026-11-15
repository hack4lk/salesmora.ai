export const leadIntakeReportData = {
  title: 'Lead intake',
  metric: 'New leads',
  definition: 'Distinct authorized leads created in the selected period. This is a creation cohort, not current pipeline or Won/Lost outcomes.',
  basis: 'Lead creation date',
  group: 'Source',
  view: 'New leads',
  invalid: 'Lead intake could not be displayed because its summary, breakdown or evidence counts do not reconcile. Refresh the report and try again.',
} as const;

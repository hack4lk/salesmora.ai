export const leadPipelineReportData = {
  title: 'Current lead pipeline and age',
  help: 'About current lead pipeline and age',
  mode: 'As of now / not filtered by reporting period',
  scope: 'Current authorization is evaluated independently of period results. Period-result assignment and group filters do not apply. Only non-archived New, Contacted and Estimate sent leads are included; Won and Lost are excluded.',
  age: 'Lead age is the business-local calendar-date difference between creation and the current snapshot: 0-7, 8-14, 15-30 and 31+ days. It is not elapsed 24-hour periods. Future-created records are invalid, not age zero.',
  activity: 'Last recorded activity is shown as evidence, not proof of external contact. Activity age and seven-day inactivity are separate from lead creation age.',
  invalid: 'Current lead pipeline could not be displayed because its counts, ages or supporting evidence are inconsistent. Retry the report.',
  stages: { new: 'New', contacted: 'Contacted', estimate_sent: 'Estimate sent' },
  bands: { '0-7': '0-7 days', '8-14': '8-14 days', '15-30': '15-30 days', '31+': '31+ days' },
};

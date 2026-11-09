export const leadAttentionReportData = {
  title: 'Current lead attention',
  help: 'About current lead attention',
  mode: 'As of now / not filtered by reporting period',
  scope: 'Current authorization is evaluated independently of period results. Period-result assignment and group filters do not apply.',
  openOnly: 'Only non-archived New, Contacted and Estimate sent leads are included. Won and Lost leads are excluded.',
  overlap: 'Inactivity and missing ownership can overlap. Combined attention counts each lead once when either condition applies; do not add the two counts.',
  labels: { inactive: 'Seven-day inactivity', unowned: 'No current primary owner', combined: 'Combined attention' },
  definitions: {
    inactive: 'Last recorded activity is strictly earlier than the snapshot minus seven days, using the existing database timezone semantics. Exactly at the cutoff is not inactive. Recorded activity is not proof of external contact.',
    unowned: 'The lead has no current primary owner with a surviving workspace membership. This includes former members; it does not mean the lead was never assigned.',
    combined: 'Distinct open leads with seven-day inactivity OR no current primary owner. A lead meeting both conditions appears once.',
  },
  evidence: 'One row per distinct lead in the selected current-attention view. Stage, primary owner and last recorded activity reflect the current snapshot. Former-owner labels require surviving identifiable evidence.',
  invalid: 'Current lead attention could not be displayed because the counts or supporting evidence are inconsistent. Retry the report.',
};

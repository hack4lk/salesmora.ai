export const leadOutcomesReportData = {
  title: 'Lead outcomes',
  basis: 'Recorded stage-transition date',
  overlap: 'Won and Lost count distinct leads independently. A lead can appear in both during the reporting period; do not add these counts as exclusive outcomes.',
  definition: (outcome: 'won' | 'lost') => `Distinct authorized leads with at least one recorded ${outcome === 'won' ? 'Won' : 'Lost'} transition in the selected period. Repeated transitions to the same outcome count once. Current stage does not prove a dated transition. Authorized archives remain included.`,
  invalid: 'Lead outcomes could not be displayed because the counts or supporting evidence are inconsistent. Retry the report.',
  coverage: 'Stage-history coverage is incomplete',
  evidence: (outcome: 'won' | 'lost') => `Recorded ${outcome === 'won' ? 'Won' : 'Lost'} transitions`,
  evidenceBasis: 'One row per lead; transition date is the latest recorded matching transition within the period. Assignment and source reflect current surviving values.',
};

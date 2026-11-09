export const jobLifecycleReportData = {
  title: 'Job lifecycle',
  help: 'About Job lifecycle',
  labels: { created: 'Created', completed: 'Completed', canceled: 'Canceled', reopened: 'Reopened' },
  overlap: 'Each metric counts distinct Jobs independently. A Job can appear in several lifecycle metrics during the selected period; these counts are not additive or exclusive outcomes.',
  definitions: {
    created: 'Distinct surviving authorized Jobs created during the selected period.',
    completed: 'Distinct surviving authorized Jobs with a valid recorded completion in the selected period. Select the latest valid completion within that period by timestamp, then event ID. A later reopen does not erase that historical completion.',
    canceled: 'Distinct surviving authorized Jobs with a valid recorded cancellation in the selected period. Repeated cancellations count once.',
    reopened: 'Distinct surviving authorized Jobs with a valid recorded reopening in the selected period, from either Completed or Canceled. Repeated reopenings count once.',
  },
  basis: { created: 'Job creation date', completed: 'Recorded completion date', canceled: 'Recorded cancellation date', reopened: 'Recorded reopening date' },
  evidence: 'One row per distinct Job in the selected projection. Completed uses the latest valid completion within the reporting period. Canceled and Reopened show the latest matching transition within the period. Current status, primary owner and service are surviving snapshot values, not historical attribution.',
  snapshot: 'Current status does not prove a dated transition. Count, supporting rows and CSV must use the same authorized event selection and snapshot. Malformed events require explicit diagnostics or incomplete coverage; never silently substitute zero.',
  coverage: 'Recorded lifecycle coverage is incomplete',
  invalid: 'Job lifecycle could not be displayed because its counts, coverage or supporting evidence are inconsistent. Retry the report.',
};

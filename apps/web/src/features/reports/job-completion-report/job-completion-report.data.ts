export const jobCompletionReportData = {
  title: 'Job completion detail',
  help: 'About Job completion detail',
  selection: 'Select the latest valid completion within the reporting period for each authorized Job, using timestamp then event ID as the deterministic tie-breaker. A later reopening does not erase the historical completion.',
  trend: 'Daily buckets, supporting rows, CSV and duration use that same period-selected completion set. Zero days are included. Selecting a day narrows that set; it does not rerun completion selection for a smaller period. Independently queried periods are not additive.',
  duration: 'Elapsed calendar days are business-local completion date minus business-local creation date, not elapsed hours or labor hours. Same-day completion is zero days. Completions before creation are invalid evidence.',
  empty: 'No valid elapsed-day samples are available; the average is unavailable, not zero.',
  incomplete: 'Elapsed-day coverage is incomplete',
  invalid: 'Job completion detail could not be displayed because dates, counts, duration or supporting evidence are inconsistent. Retry the report.',
};

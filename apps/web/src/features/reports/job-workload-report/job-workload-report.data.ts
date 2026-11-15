export const jobWorkloadReportData = {
  title: 'Current Jobs workload and deadlines',
  help: 'About current Jobs workload and deadlines',
  mode: 'As of now / not filtered by reporting period',
  labels: { active: 'Active Jobs', overdue: 'Overdue', dueSoon: 'Due soon', noDeadline: 'No completion deadline', waiting: 'Waiting', unassigned: 'No current primary owner' },
  definitions: {
    active: 'Distinct currently authorized Jobs in Needs Scheduling, Scheduled, In Progress or Waiting. Completed and Canceled Jobs are excluded.',
    overdue: 'Active Jobs with a completion deadline strictly before business-local today. Due today is not overdue.',
    dueSoon: 'Active Jobs with a completion deadline from business-local today through today +7, both dates included.',
    noDeadline: 'Active Jobs with no completion deadline. Missing deadlines are not overdue.',
    waiting: 'Active Jobs currently Waiting, grouped by their recorded Waiting reason.',
    unassigned: 'Active Jobs whose current primary owner is null. Supporting team participation is separate from primary responsibility. Former owners are not inferred from missing membership.',
  },
  scope: 'Current authorization and filters apply independently of period results. Period-result assignment and group filters do not apply.',
  overlap: 'Waiting and unassigned Jobs can overlap deadline categories. Do not add these metrics as exclusive totals. Status, primary owner and service breakdowns each reconcile independently to Active Jobs; Waiting reasons reconcile to Waiting Jobs.',
  schedule: 'Scheduled work dates are not completion deadlines. A past scheduled date with a future deadline is scheduling attention, not an overdue completion deadline.',
  invalid: 'Current Jobs workload could not be displayed because its dates, counts or supporting evidence are inconsistent. Retry the report.',
};

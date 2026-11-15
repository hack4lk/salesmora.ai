export const calendarUnscheduledReportData = {
  title: 'Unscheduled queues',
  help: 'About unscheduled queues',
  labels: { visits: 'Distinct unscheduled visits', jobs: 'Unscheduled Job records', workOrders: 'Unscheduled Work Order records' },
  definition: 'Current canonical visits with no scheduled date and at least one authorized active Job or Work Order record. This queue has no visit-date filter; business-local today provides snapshot context only.',
  units: 'An explicitly shared Job and two Work Orders count as one visit, one Job record and two Work Order records. Record and participant counts are non-additive; matching dates, names or customers never establish sharing.',
  active: 'Completed and canceled records and archived Work Orders are excluded. Authorized active draft Work Orders remain included where permitted. An active Job is not excluded merely because its status says Scheduled when the canonical visit has no date.',
  access: 'Only authorized active record and participant context is shown. Work Order access never grants parent-Job access. Own scope shows only Me, without other participants or residual unassigned totals. Drill-through does not promise permission to schedule.',
  invalid: 'Unscheduled queues could not be displayed because their distinct visits, active record units, scope or evidence are inconsistent. Retry the report.',
};

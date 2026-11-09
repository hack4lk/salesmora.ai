export const calendarReviewReportData = {
  title: 'Schedule review',
  help: 'About schedule review',
  overlaps: 'Overlapping arrival-window pairs',
  past: 'Past scheduled visits',
  overlapDefinition: 'Count each unordered pair of distinct canonical visits once per authorized person and scheduled date when their arrival windows intersect. Adjacent windows do not overlap. The same shared pair can count for more than one person; person totals are non-additive.',
  pastDefinition: 'Distinct current visits on authorized active records with a scheduled date strictly before business-local today, within the selected visit-date range. Today is not past. Shared records never add visits.',
  review: 'Past dates prompt schedule review, not a claim of missed attendance. No rescheduling action, historical cancellation analysis, labor duration, available hours or utilization is inferred.',
  unknown: 'Missing arrival windows are unknown, not proven conflicts or free time. Zero known overlapping pairs does not establish an available schedule.',
  own: 'Own scope shows only Me and pairs involving Me. Hidden parent Jobs, records, crew and unrelated participant totals are withheld.',
  invalid: 'Schedule review could not be displayed because its visit dates, arrival windows, pair membership, scope or evidence are inconsistent. Retry the report.',
};

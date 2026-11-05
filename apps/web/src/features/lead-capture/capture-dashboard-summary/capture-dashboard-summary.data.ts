export const captureDashboardSummaryData = {
  title: 'Capture source summary', types: { website: 'Website form and hosted link', gmail: 'Gmail' },
  metrics: {
    captured: { label: 'Captured to date', description: 'Unique accepted submissions or emails, including possible duplicates. Delivery retries are not counted again.' },
    awaitingReview: { label: 'Awaiting review now', description: 'Accepted items that still need an Intake Review decision.' },
    approved: { label: 'Approved to date', description: 'Items approved once, including immediate website lead creation and reviewed links or updates to existing leads.' },
  },
  review: 'Open Intake Review', reviewUnavailable: 'The Intake Review link is unavailable.', blocked: 'Intake blocked',
  attention: 'Source needs attention', retry: 'Retry totals', error: 'Source totals are unavailable. Try loading them again.',
  invalid: 'This capture source is unavailable. Reload its latest details.', denied: 'You do not have permission to view this capture source summary.',
  stories: { description: 'Fictional lifetime totals. No source or Intake Review records are queried.', name: 'Water heater inquiries', long: 'Residential plumbing maintenance and whole-home improvement inquiries ', href: '/intake?captureSource=example-source', blocked: 'Intake is stopped because access needs review. Existing review items are preserved.', opened: 'Intake Review navigation requested (preview only).' },
};

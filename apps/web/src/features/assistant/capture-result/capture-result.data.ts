export const captureAssistantResultData = {
  title: 'Lead Capture assistant result', loading: 'Checking this Lead Capture result…', unavailable: 'This result is unavailable. Reload it to check your current access.',
  stale: 'This review has changed or expired. Reload the latest review before continuing.', failed: 'The request could not be verified. Reload the review before trying again.',
  pending: 'Confirming your decision…', retry: 'Reload result', review: 'Review proposed change', close: 'Close review', cancel: 'Cancel proposal',
  confirm: 'Apply reviewed suggestions', draftNotice: 'These suggestions have not been applied. Review them before confirming.',
  fixedReview: 'This is a fixed proposal. Ask the assistant for a new proposal to change it.',
  publicationNotice: 'Launch timing is fixed to this proposal. Ask for a new proposal to change it.',
  cancelled: 'Proposal cancelled. No business change was made.', superseded: 'A newer proposal replaced this review.', expired: 'This proposal has expired. Ask for a new review.',
  completed: 'This proposal was confirmed. Reload to check its saved outcome.', open: 'Open record', captured: 'Retrieved',
  window: (shown: number, total: number) => `Showing ${shown} of ${total} matching sources.`,
  stories: { notice: 'Fictional API responses. No AI request, source change, publication, intake decision or email is sent.', name: 'Fictional plumbing requests', saved: 'Suggested fields applied to the unsaved draft. Save the draft to persist them.', paused: 'Intake paused. Existing receipts are preserved.', launched: 'The reviewed website configuration was launched.', intakeSaved: 'The intake decision was saved.' },
} as const;

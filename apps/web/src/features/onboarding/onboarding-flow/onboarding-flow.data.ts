export const onboardingFlowData = {
  documentTitle: 'Set up your workspace — SalesMora.ai', title: 'Set up your workspace',
  description: 'Tell us about your business, then review and create your workspace.',
  signedIn: 'Signed in as', signOut: 'Sign out',
  error: 'Your workspace could not be saved. Your details are still here. Please try again.',
  invalid: 'Check your business, services, and teammate details before creating your workspace.',
  expired: 'Your session has expired. Sign in again to create your workspace.',
  stories: { title: 'Setup flow preview', notice: 'Component preview. No workspace is saved or invitation sent.', success: 'Preview confirmed. No workspace was created.', email: 'flow-owner@example.com', name: 'Northstar Plumbing', service: 'Drain cleaning' },
  home: { documentTitle: 'Home — SalesMora.ai', title: 'Home', description: 'Your workspace, at a glance.', business: 'Business', type: 'Business type', services: 'Services', postal: 'Primary ZIP / postal code', range: 'Typical service range', invitations: 'Team invitations', verification: 'Verify your email before queued invitations can be sent.', delivery: 'Teammates join after accepting their email invitation.', retryInvitations:'Send pending invitations', retryNote:'Pending invitations can be retried once per minute. Sent invitations will not be sent again.', invitationStatuses:{pending_verification:'Waiting for owner verification',queued:'Waiting to send',sent:'Sent',accepted:'Accepted',revoked:'Cancelled'}, none: 'No teammate invitations', notProvided: 'Not provided' },
} as const;

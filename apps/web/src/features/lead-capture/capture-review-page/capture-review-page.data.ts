export const captureReviewPageData = {
  denied: 'You do not have permission to view this capture source review.', invalid: 'The launch response could not be verified. Reload the source status before trying again.',
  reviewMessage: 'Review the saved setup below and approve when this source should launch.', statuses: { active: 'Active', scheduled: 'Scheduled' },
  active: 'Capture source launched', scheduled: 'Capture source launch scheduled',
  gmailActive: 'Matching incoming emails will go to Intake Review. A teammate must approve each proposed lead.', gmailScheduled: 'Email intake starts at the scheduled time. Matching messages will require Intake Review.',
  websiteActive: 'Your form is ready to share using the installation details below.', websiteScheduled: 'Your form will start accepting submissions at the scheduled time.',
  source: 'Open source dashboard', list: 'Back to Lead Capture', intake: 'Open Intake Review', pending: 'Submitting launch request…',
  stories: { description: 'Final review page preview. Readiness, launch, scheduling, publication details and clipboard actions are simulated. No source is launched or form hosted.', workspace: 'Northstar Plumbing', viewer: 'Sam Rivera', email: 'sam@example.com', now: '2026-10-30T14:00:00Z', schedule: '2026-11-03T09:00',
    navigation: 'Setup navigation requested (preview only).', dashboard: 'Source dashboard requested (preview only).', intake: 'Intake Review requested (preview only).', failure: 'Simulated launch failure.',
  },
} as const;

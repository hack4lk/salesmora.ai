export const leadStageDraftCardData = {
  title: 'Review stage change',
  description: 'Review this proposal before saving. Ask the assistant for a new proposal to change it.',
  lead: 'Lead', from: 'Current stage', to: 'Proposed stage', reason: 'Lost reason',
  expires: 'Proposal expires', confirm: 'Confirm stage change', cancel: 'Cancel proposal',
  saving: 'Saving your decision…', failure: 'Your decision could not be saved. Try again.',
  unchanged: 'The proposed stage matches the current stage. Ask for a new proposal.',
  states: {
    pending: 'Awaiting your confirmation', confirmed: 'Stage changed', cancelled: 'Proposal cancelled. No changes saved.',
    expired: 'Proposal expired. Ask for a new proposal.', superseded: 'Replaced by a newer proposal.',
    conflict: 'This lead has changed. Review a new proposal before saving.',
    forbidden: 'You no longer have access to make this change.',
  },
  stages: { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent', won: 'Won', lost: 'Lost' },
  stories: {
    title: 'Assistant stage-change review',
    description: 'Fictional previews only. Confirm and Cancel update this preview; no lead is changed.',
    name: 'Jordan Lee', number: 'LD-1048', reason: 'Customer chose another provider.',
    longName: 'Jordan Lee and the Willow Street Community Property Management Team',
    longReason: 'Customer chose another provider for this request. Keep the history for a future service enquiry and do not send a follow-up.',
    error: 'The connection was interrupted. Try saving your decision again.',
  },
} as const;

export const leadDraftCardData = {
  title: 'Review lead draft', description: 'Check these details before creating the lead. Ask for a new draft to change them.',
  confirm: 'Confirm and create lead', cancel: 'Cancel draft', pending: 'Saving your decision…', failure: 'The decision could not be saved. Try again.',
  unassigned: 'Unassigned', empty: 'Not provided', expires: 'Draft expires',
  states: { pending: 'Awaiting your confirmation', confirmed: 'Lead created', cancelled: 'Draft cancelled', expired: 'Draft expired. Ask for a new draft.', superseded: 'Replaced by a newer draft' },
  fields: { name: 'Name', service: 'Service requested', email: 'Email', phone: 'Phone', address: 'Service address', details: 'Request details', notes: 'Internal notes', source: 'Source', stage: 'Stage', owner: 'Lead owner' },
  sources: { website: 'Website', referral: 'Referral', phone: 'Phone', gmail: 'Gmail', other: 'Other' },
  stages: { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent', won: 'Won', lost: 'Lost' },
  stories: { name: 'Taylor Brooks', service: 'Furnace repair', email: 'taylor@example.test', address: '18 Willow Street', details: 'Furnace does not heat the home.', error: 'Permissions changed. Ask for a new draft.' },
} as const;

export const gmailSetupPageData = {
  sampleUnavailable: 'Email sample mapping is not available yet. Your draft settings can be saved for later.',
  panels: { account: 'Email account', rules: 'Matching rules', fields: 'Field setup', workflow: 'Lead workflow' }, panelsLabel: 'Gmail intake sections',
  hint: 'Continue validates and saves this draft. Gmail matches will require Intake Review before a lead is created.', fieldsHint: 'Extract a representative email, review the findings and approve the mapping to continue.',
  denied: 'You do not have permission to view this Gmail setup.', failed: 'The draft could not be saved. Your changes are preserved.',
  issues: { source: 'Choose a source and enter a name of up to 80 characters.', account: 'Select a connected Gmail account before continuing.', access: 'Gmail capture is unavailable with the current access or account-loading state.', rules: 'Correct the matching rules before continuing.', fields: 'Review a matching email sample and approve the current field mapping before continuing.', workflow: 'Correct the lead workflow before continuing.' },
  stories: {
    description: 'Gmail setup page preview. Accounts, extraction, assistant replies and saves are simulated. No Gmail messages are read or leads created.',
    name: 'Gmail quote enquiries', workspace: 'Northstar Plumbing', viewer: 'Sam Rivera', email: 'sam@example.com', account: 'enquiries@example.com', otherAccount: 'quotes@example.com',
    subject: 'Kitchen estimate request', body: 'Hello, please provide an estimate.\nName: Jamie Carter\nEmail: jamie.carter@example.com\nService: Kitchen plumbing', phrase: 'estimate',
    targetLabels: { name: 'Full name', email: 'Email', service: 'Service requested' }, sourceLabels: { name: 'Name', email: 'Email', service: 'Service' }, instruction: (label: string) => `Find ${label.toLowerCase()} in incoming emails.`,
    saved: 'Draft saved in this preview only.', review: 'Final Gmail setup review requested (preview only). Nothing has launched.', website: 'Website setup requested (preview only). Gmail settings are not copied.', exit: 'Return to Lead Capture requested (preview only).', failure: 'Simulated service failure.',
    connect: 'Account connection simulated in this preview only.', assistant: 'Review the values and source text, then approve this mapping when it is ready.', changedPhrase: 'unmatched phrase',
  },
} as const;

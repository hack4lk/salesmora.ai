export const intakeProposedLeadEditorData = {
  title: 'Proposed lead details', description: 'Check these details against the original source and correct anything missing or unclear.',
  contact: 'Provide at least one email address or phone number.',
  found: 'Extracted from source', missing: 'Missing from source', uncertain: 'Needs checking', edited: 'Edited',
  optional: (label: string) => `${label} (optional)`, choose: 'Choose an option',
  errors: 'Complete the required fields and correct the highlighted values before approval.',
  readonly: 'You have view-only access to these proposed details.', resolved: 'This intake item has already been resolved. Its details cannot be edited here.',
  denied: 'You do not have permission to view these proposed lead details.', invalid: 'The field definition or intake record is unavailable. Reload the item before editing.',
  loading: 'Loading proposed lead details…', error: 'Proposed lead details could not be loaded. Your corrections are preserved.', retry: 'Try again',
  stories: {
    description: 'Corrections update preview state only. No intake item is saved and no lead is created.',
    labels: { name: 'Full name', email: 'Email', phone: 'Phone', service: 'Service requested', details: 'Project details', address: 'Service address', timing: 'Preferred timing', interests: 'Services of interest', date: 'Preferred date' },
    name: 'Jamie Carter', email: 'jamie.carter@example.com', phone: '(555) 014-2280', service: 'Kitchen cabinet replacement', corrected: 'Kitchen remodeling',
    choices: ['Morning', 'Afternoon'], interests: ['Kitchen', 'Bathroom'], long: 'A detailed residential remodeling request with customer preferences and service requirements. ',
  },
} as const;

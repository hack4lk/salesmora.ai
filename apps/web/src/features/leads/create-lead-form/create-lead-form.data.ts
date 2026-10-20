export const createLeadFormData = {
  formLabel: 'Create a lead', submit: 'Create lead', pending: 'Creating lead…', cancel: 'Cancel',
  successTitle: 'Lead created', success: 'Your lead is ready for follow-up.',
  sections: {
    contact: { title: 'Contact details', description: 'Add the main point of contact for this opportunity.' },
    service: { title: 'Service request', description: 'Capture what the customer needs and where the work is located.' },
    management: { title: 'Lead management', description: "Choose how this lead enters your team's pipeline." },
    notes: { title: 'Internal notes', description: 'Keep private context for your team.' },
  },
  labels: { name: 'Lead name', email: 'Email address', phone: 'Phone number', service: 'Service requested', address: 'Service address', details: 'Request details', source: 'Source', stage: 'Pipeline stage', ownerId: 'Lead owner', notes: 'Notes' },
  placeholders: { name: 'Full name', email: 'name@example.com', phone: '(212) 555-0100', service: 'e.g. Furnace repair', address: 'Street, city, ZIP', details: 'What did the customer tell you about the work?', notes: 'Add any context the team should know.' },
  optional: (label: string) => `${label} (optional)`,
  unassigned: 'Unassigned',
  sources: [{ value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }, { value: 'phone', label: 'Phone' }, { value: 'gmail', label: 'Gmail' }, { value: 'other', label: 'Other' }],
  stages: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'estimate-sent', label: 'Estimate sent' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }],
  errors: { name: 'Enter the lead name.', service: 'Enter the requested service.', email: 'Enter a valid email address.', submission: 'We could not create the lead. Please try again.' },
  stories: {
    preview: 'Manual form preview. Submissions are mocked and do not save a lead.',
    success: 'Preview complete. No lead was saved.',
    owners: [{ id: 'ava', name: 'Ava Morgan' }, { id: 'sam', name: 'Sam Rivera' }, { id: 'alex', name: 'Alex Chen' }],
    filled: { name: 'Taylor Brooks', email: 'taylor@example.com', phone: '(212) 555-0100', service: 'Furnace repair', address: '18 Willow Street, New York, NY 10001', details: 'The furnace is making a rattling noise. Please call in the afternoon.', source: 'referral', stage: 'contacted', ownerId: 'sam', notes: 'Referred by an existing customer.' },
    invalidEmail: 'not-an-email', serverError: 'The connection was interrupted. Try again with these details.',
  },
} as const;

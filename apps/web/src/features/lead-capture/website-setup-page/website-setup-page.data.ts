export const websiteSetupPageData = {
  sections: { brief: 'Business brief', fields: 'Form fields', preview: 'Form text & preview', workflow: 'Lead workflow' }, sectionsLabel: 'Website intake sections',
  continueHint: 'Continue validates and saves this draft before moving on. Nothing is published.',
  denied: 'You do not have permission to view this website setup.', failed: 'The draft could not be saved. Your changes are preserved. Try again.',
  sourceError: 'Choose a source and enter a name of up to 80 characters.', briefError: 'Describe the work this form should capture using up to 2,000 characters.', fieldsError: 'Correct the form field settings before continuing.', contentError: 'Enter a form title before continuing.', workflowError: 'Correct the workflow settings before continuing.',
  stories: { description: 'Website setup page preview. Saves and suggestions are simulated; nothing is published and no services are connected.',
    name: 'Website project requests', workspace: 'Northstar Plumbing', viewer: 'Sam Rivera', email: 'sam@example.com', brief: 'Capture kitchen plumbing and water heater requests in Brooklyn and Queens.',
    services: ['Kitchen plumbing', 'Water heater installation'], area: 'Brooklyn and Queens', teammate: 'Sam Rivera',
    saved: 'Draft saved in this preview only.', review: 'Final setup review requested (preview only). Nothing has launched.', gmail: 'Gmail setup requested (preview only). Website settings are not copied.', exit: 'Return to Lead Capture requested (preview only).',
    suggestion: 'Suggested for this website request form.', changedTitle: 'Request a plumbing visit', missingName: 'Source name is required.', failure: 'Simulated save failure.',
  },
} as const;

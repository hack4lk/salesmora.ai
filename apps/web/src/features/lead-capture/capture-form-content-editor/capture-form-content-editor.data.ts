export const captureFormContentEditorData = {
  heading: 'Form text', description: 'Choose the title and introduction customers see above the form. Changes stay in this draft.',
  pausedContacts: 'Contact details in the paused message', showBusinessEmail: 'Show business email', showBusinessPhone: 'Show business phone',
  pausedContactsHint: 'Choose either, both or neither. These settings only affect the unavailable message.',
  paused: 'Paused message', pausedHint: 'Shown when the form is unavailable. Leave blank to use the default contact message.',
  title: 'Form title', intro: 'Introduction', introHint: 'Optional. Tell customers what to share and what happens next.',
  titleError: 'Enter a form title.',
  denied: 'You do not have permission to view this form text.',
  readOnly: 'You can view this form text but do not have permission to change it.',
  stories: { updatedPaused: 'Online requests are paused until Monday. Please call us for urgent help.', updatedTitle: 'Request a plumbing visit', updatedIntro: 'Tell us what needs fixing and the best way to reach you.' },
} as const;

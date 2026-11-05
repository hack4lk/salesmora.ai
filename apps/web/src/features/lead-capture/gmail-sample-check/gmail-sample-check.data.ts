export const gmailSampleCheckData = {
  title: 'Example email check', matches: 'Matches', noMatch: 'Does not match', incomplete: 'Not ready',
  missing: 'Paste an example email to check your matching rules.',
  invalid: 'Complete the email matching rules before checking this example.',
  mismatch: 'This email would not enter Intake Review. Adjust your matching rules or go back and paste a matching example.',
  found: { subject: 'Found in subject', body: 'Found in body', both: 'Found in subject and body', none: 'Not found' },
  denied: 'You do not have permission to view this email check.',
  stories: { subject: 'Water heater inquiry', body: 'Email: alex@example.com\nService: Water heater installation',
    phrase: 'water heater', contact: 'Email:', missing: 'kitchen remodel', change: 'Use a non-matching example', changeRules: 'Change matching rules',
    description: 'Local matching check only. No email is read, lead created or notification sent.' },
};

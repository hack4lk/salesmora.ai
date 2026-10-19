export const textFieldData = {
  optionalLabel: (label: string) => `${label} (optional)`,
  stories: {
    previewLabel: 'Text field preview',
    nameLabel: 'Your name', name: 'Alex Rivera',
    websiteLabel: 'Business website', websiteHelp: 'You can add this later.',
    nameHelp: 'Use the name your teammates know you by.',
    emailLabel: 'Work email', invalidEmail: 'alex@', email: 'alex@example.com',
    emailError: 'Enter a valid email address.', emailHelp: 'Use the email address you sign in with.',
  },
} as const;

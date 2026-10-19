export const passwordFieldData = {
  optionalLabel: (label: string) => `${label} (optional)`,
  toggleLabel: (visible: boolean, label: string) => `${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`,
  stories: {
    previewLabel: 'Password field preview',
    label: 'Password', newLabel: 'Create password', example: 'Fictional-demo-42!',
    help: 'Password requirements will be supplied by the registration form.', error: 'Enter your password to continue.',
  },
} as const;

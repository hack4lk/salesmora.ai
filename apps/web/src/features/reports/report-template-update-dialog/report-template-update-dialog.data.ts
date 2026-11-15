export const reportTemplateUpdateDialogData = {
  title: 'Update template configuration',
  description: (name: string) => `Replace the saved configuration of "${name}" with this report's current settings. Result rows and permissions are not saved.`,
  confirm: 'Update configuration',
  pending: 'Updating template...',
  denied: 'You no longer have permission to update this template. Your changes have not been saved.',
} as const;

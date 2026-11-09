export const reportTemplateNameDialogData = {
  titles: { save: 'Save this report as a template', rename: 'Rename personal template' },
  confirm: { save: 'Save personal template', rename: 'Save name' },
  description: 'Save configuration only. Relative dates roll forward; custom dates remain fixed. Results and permissions are not saved.',
  name: 'Template name',
  help: 'Visible only to you. Up to 80 characters.',
  saving: 'Saving template...',
  denied: 'You no longer have permission to save this template. Your changes have not been saved.',
  errors: {
    length: 'Enter a template name between 1 and 80 characters.',
    duplicate: 'You already have a template with this name in this report area. Choose another name.',
  },
} as const;

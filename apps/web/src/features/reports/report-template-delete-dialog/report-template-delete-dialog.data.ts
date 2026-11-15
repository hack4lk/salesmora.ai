export const reportTemplateDeleteDialogData = {
  title: 'Delete personal template?',
  description: (name: string) => `Delete "${name}"? This cannot be undone.`,
  impact: 'Only this saved configuration is deleted. Reports and business records are not deleted.',
  confirm: 'Delete template',
  pending: 'Deleting template...',
  denied: 'You no longer have permission to delete this template. Nothing has been deleted.',
} as const;

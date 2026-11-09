export const reportTemplateCalloutData = {
  help: 'About saving report templates',
  title: 'Save this report as a template',
  description: "Keep this report's supporting view, filters and date choice as a personal template. Results and permissions are never saved.",
  personal: 'Only you can manage your personal templates.',
  basedOn: (name: string) => `Currently based on: ${name}.`,
  save: 'Save this report as a template',
  update: 'Update this template',
  view: 'View my templates',
  pending: 'Working on your template...',
  denied: 'You do not have access to report templates.',
  readOnly: 'Saving and updating templates are not available with your current access.',
} as const;

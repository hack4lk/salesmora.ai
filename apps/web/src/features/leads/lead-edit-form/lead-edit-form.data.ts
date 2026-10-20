import { createLeadFormData } from '../create-lead-form/create-lead-form.data';
export const leadEditFormData = {
  optional: createLeadFormData.optional,
  title: 'Edit lead', formLabel: 'Edit lead details', labels: createLeadFormData.labels, sources: createLeadFormData.sources,
  sections: createLeadFormData.sections, save: 'Save changes', pending: 'Saving changes…', cancel: 'Cancel',
  clean: 'No unsaved changes.', dirty: 'You have unsaved changes.', denied: 'You do not have permission to edit this lead.',
  sourceLocked: 'Source is fixed for leads created through Gmail or campaigns.', changed: 'Changed by another teammate. Your unsaved text is preserved.',
  conflictTitle: 'This lead changed', reload: 'Reload latest details',
  discardTitle: 'Discard unsaved changes?', discardDescription: 'Your edits will be lost. You can cancel and copy them before continuing.',
  discard: 'Discard changes', reloadConfirm: 'Reload and discard edits',
  failed: 'Could not save this lead. Your edits are preserved. Try again.', reloadFailed: 'Could not reload this lead. Your edits are preserved. Try again.',
  invalid: 'Review this field.', tooLong: (label: string, max: number) => `Keep ${label.toLowerCase()} within ${max} characters.`,
  errors: createLeadFormData.errors,
  stories: {
    title: 'Lead detail editor', description: 'Local preview with mocked saves and reloads. Stage and ownership use separate controls.',
    edit: 'Edit lead', saved: 'Changes saved (preview only).', canceled: 'Editing canceled (preview only).',
    conflict: 'Another teammate changed the service and notes. Copy your edits before reloading and applying them again.',
    changedService: 'Repair the furnace and inspect the thermostat.', changedNotes: 'Customer is available on Friday.', invalidEmail: createLeadFormData.stories.invalidEmail,
    record: { id: 'jordan', version: 3, canEdit: true, origin: 'manual', values: {
      name: 'Jordan Lee', email: 'jordan@example.com', phone: '(212) 555-0142', service: 'Furnace repair', address: '18 Willow Street, New York, NY 10001',
      details: 'The furnace rattles when starting.', notes: 'Call before visiting.', source: 'referral',
    } },
  },
} as const;

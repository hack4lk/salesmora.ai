export const deleteLeadDialogData = {
  title: 'Delete this lead permanently?',
  description: (number: string, name: string) => `${number} · ${name} and its notes and activity history will be permanently removed. This cannot be undone.`,
  alternative: 'Archive the lead instead if you may need its details or history later.',
  confirmation: 'Lead number', confirm: 'Delete lead', cancel: 'Cancel', pending: 'Deleting lead…',
  forbidden: 'You no longer have permission to delete this lead.',
  won: 'Won leads cannot be deleted. You can archive this lead instead.',
  conflict: 'This lead changed since you opened it. Close this dialog and refresh the lead before trying again.',
  stories: {
    title: 'Delete lead dialog', description: 'Review permanent deletion using the shared confirmation dialog. Actions are mocked; no records are deleted.',
    open: 'Review deletion', success: 'Lead deleted in this preview.', failure: 'The lead could not be deleted. Try again.',
    lead: { id: 'lead-1042', version: 3, leadNumber: 'LD-1042', name: 'Jordan Lee', stage: 'contacted' as const, canDelete: true },
    wrong: 'LD-9999', longName: 'Jordan Alexandra Lee and the extended household at Willow Street — kitchen, utility room and exterior renovation inquiry',
  },
};

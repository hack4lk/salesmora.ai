export const archiveLeadDialogData = {
  title: 'Archive lead?',
  description: (number: string, name: string) => `${number} · ${name} will be hidden from the default leads list, pipeline and Home pipeline counts.`,
  retained: 'Lead details and activity history are kept. You can restore this lead later.',
  allowance: 'Archived leads still count toward your plan’s lead limit. Archiving does not free up space for new leads.',
  confirm: 'Archive lead', cancel: 'Cancel', pending: 'Archiving lead…',
  forbidden: 'You no longer have permission to archive this lead.',
  archived: 'This lead is already archived. Close this dialog and refresh the lead to see its current state.',
  conflict: 'This lead changed since you opened it. Close this dialog and refresh the lead before trying again.',
  stories: {
    title: 'Archive lead dialog', description: 'Review archiving with the shared confirmation dialog. Actions are mocked; no lead is changed.',
    open: 'Review archive', success: 'Lead archived in this preview.',
    failure: 'The lead could not be archived. Try again.',
    lead: { id: 'lead-1042', version: 3, leadNumber: 'LD-1042', name: 'Jordan Lee', canArchive: true, archived: false },
    longName: 'Jordan Alexandra Lee and the extended household at Willow Street — kitchen, utility room and exterior renovation inquiry',
  },
};

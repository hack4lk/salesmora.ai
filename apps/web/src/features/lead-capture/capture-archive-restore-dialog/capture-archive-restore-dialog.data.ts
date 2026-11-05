export const captureArchiveRestoreDialogData = {
  title: { archive: 'Archive this capture source?', restore: 'Restore this capture source?' },
  description: { archive: 'Stop intake and move this source to Archived.', restore: 'Return this source to the current list in a paused state.' },
  confirm: { archive: 'Archive source', restore: 'Restore to paused' }, pending: { archive: 'Archiving…', restore: 'Restoring…' }, cancel: 'Cancel',
  source: 'Capture source', types: { website: 'Website form and hosted link', gmail: 'Gmail' },
  consequences: {
    website: { archive: 'The hosted link and embedded form will not accept submissions while this source is archived.', restore: 'Restoring does not enable submissions. Review the source setup before resuming its published form.' },
    gmail: { archive: 'Email intake processing stops. Messages are not deleted from the connected Gmail account.', restore: 'Restoring does not process Gmail messages. Review the account, approved rules and message eligibility before resuming intake.' },
  },
  preserved: 'Existing leads, pending Intake Review items and source history are preserved. Authorized teammates can continue reviewing pending items.',
  cancelSchedule: 'Archiving cancels the scheduled launch. It will not be reinstated when you restore this source.',
  draftArchive: 'This draft moves to Archived. It has not started intake.',
  reviewRequired: 'The source will stay paused until you explicitly review and resume it.',
  checking: 'Checking whether this source can be restored…', blocked: 'This source cannot be restored yet. Resolve its plan access or published-source capacity issue first.',
  unavailable: 'This source’s current status does not allow the requested action. Reload its latest details.', invalid: 'Reload a current source with a valid version before continuing.',
  forbidden: 'You do not have permission to perform this action.', deniedTitle: 'Source unavailable', denied: 'You do not have permission to view this capture source.',
  failed: 'The source could not be updated. Review its current state and try again.', reload: 'Reload source', reloading: 'Loading latest source…', reloadFailed: 'The latest source could not be loaded. Try again.',
  stories: { title: 'Archive or restore a capture source', description: 'Fictional lifecycle review. Requests are mocked; no source is archived, restored or relaunched.', open: 'Review archive action', complete: 'Action accepted (preview only).', name: 'Water heater inquiries', long: 'Residential plumbing maintenance and whole-home improvement inquiries ', conflict: 'Another teammate changed this capture source. Reload before confirming.', capacity: 'No capacity is available to restore this source. Archive another source or review your plan.', access: 'This plan does not support restoring this Gmail source.', },
};

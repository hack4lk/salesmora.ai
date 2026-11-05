export const capturePauseResumeDialogData = {
  title: { pause: 'Pause this capture source?', resume: 'Resume this capture source?' },
  description: { pause: 'Stop new intake from this source until it is resumed.', resume: 'Review the approved configuration before starting intake again.' },
  confirm: { pause: 'Pause intake', resume: 'Resume intake' }, pending: { pause: 'Pausing…', resume: 'Resuming…' }, cancel: 'Cancel',
  source: 'Capture source', types: { website: 'Website form and hosted link', gmail: 'Gmail' },
  consequences: {
    website: { pause: 'The hosted link and embedded form will show your configured paused message and stop accepting submissions.', resume: 'The hosted link and embedded form will accept submissions again using the approved form.' },
    gmail: { pause: 'New email intake processing stops. Messages are not deleted from the connected Gmail account.', resume: 'Eligible messages received during the pause will be processed using the current approved rules and sent to Intake Review. New matches also require review before lead creation.' },
  },
  preserved: 'Existing leads, pending Intake Review items and source history are preserved. Authorized teammates can continue reviewing pending items.',
  approved: 'Approved configuration', revision: 'Unpublished draft changes are not applied by resuming this source.',
  checking: 'Checking whether this source is ready to resume…', blocked: 'This source is not ready to resume. Resolve its connection, configuration or access issue first.',
  unavailable: 'This source’s current status does not allow the requested action. Reload its latest details.', invalid: 'Reload a current source with a valid version and approved configuration.',
  forbidden: 'You do not have permission to perform this action.', deniedTitle: 'Source unavailable', denied: 'You do not have permission to view this capture source.',
  failed: 'The source could not be updated. Review its current state and try again.', reload: 'Reload source', reloading: 'Loading latest source…', reloadFailed: 'The latest source could not be loaded. Try again.',
  stories: { title: 'Pause or resume intake', description: 'Fictional source review. Confirmations are mocked; no source or Gmail processing is changed.', open: 'Review intake action', complete: 'Action accepted (preview only).', name: 'Water heater inquiries', long: 'Residential plumbing maintenance and whole-home improvement inquiries ', accountLabel: 'Connected account', account: 'inquiries@example.com', rulesLabel: 'Email rules', rules: 'All phrases: water heater and Email: in the subject or body', stageLabel: 'Starting stage', stage: 'New', assignmentLabel: 'Assignment', assignment: 'Sam Rivera', conflict: 'Another teammate changed this capture source. Reload before confirming.', blocked: 'Reconnect the Gmail account before resuming intake.', change: 'Simulate a newer source version' },
};

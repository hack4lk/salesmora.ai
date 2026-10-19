export const jobsRouteData = {
  title: 'Jobs', description: 'Track work, assignments, scheduled visits and completion deadlines.',
  create: 'Create job', created: 'Job created.', saved: 'Job updated.', noteSaved: 'Progress note added.',
  error: 'Jobs could not be loaded or saved. Try again.', savedReload: 'Your change was saved, but the page could not refresh. Reload to see the latest details.',
  reload: 'Reload latest details', back: 'Back to jobs', history: 'Activity history', unavailable: 'This job is no longer available to you.',
  activity: { created: 'Job created', assign: 'Team updated', schedule: 'Schedule updated', deadline: 'Completion deadline updated', status: 'Status changed', note: 'Progress note' },
} as const;

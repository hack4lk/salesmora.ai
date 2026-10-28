export const jobNotificationEventRows = [
  { id: 'created', label: 'Job created from a lead', help: 'Notify the assigned Job team when a lead becomes a Job.' },
  { id: 'status', label: 'Job status changed', help: 'Includes completing, canceling and reopening a Job.' },
  { id: 'assignment', label: 'Job assignment changed', help: 'Assignment notices follow the recipient’s current access.' },
  { id: 'schedule', label: 'Visit schedule changed', help: 'Uses the combined visit notice, including accessible linked Work Orders. No duplicate Job email.' },
  { id: 'deadline', label: 'Completion deadline changed', help: 'Includes setting, changing or removing a deadline.' },
  { id: 'approaching', label: 'Deadline approaching or due', help: 'Uses the reminder schedule, send time and workspace timezone.' },
  { id: 'overdue', label: 'Deadline overdue', help: 'Sent only when the reminder schedule includes an overdue timing.' },
] as const;
export type JobNotificationEvent = typeof jobNotificationEventRows[number]['id'];
export type JobEventEmailValues = Record<JobNotificationEvent, boolean>;
export const defaultJobEventEmails: JobEventEmailValues = { created: true, status: true, assignment: true, schedule: true, deadline: true, approaching: true, overdue: true };
export const jobNotificationEventsData = {
  title: 'Job notification events', description: 'Choose which Job events can send email. In-app notices stay on for every plan.',
  event: 'Job event', inApp: 'In-app', email: 'Email', on: 'Always on', enabled: 'On', disabled: 'Off',
  emailLabel: (event: string) => `Email for ${event}`,
  premium: 'Premium email controls', fixed: 'Free and Standard use fixed email defaults. Premium lets authorized Owners and Admins customize email events.',
  personal: 'Workspace email rules do not override personal email preferences or record access. Enabling an event does not add reminder timings or send a message immediately.',
  recipients: 'Recipients follow each event’s rules. Visit changes skip the actor and combine accessible records into one notice. Job team chat is outside these settings.',
  readOnly: 'You can view these settings. Only authorized workspace Owners and Admins can change them.',
  review: 'Review & save', reviewTitle: 'Review Job email events', reviewDescription: 'Confirm the email rules. In-app notices remain on.', confirm: 'Save email events',
  summary: 'Job email event summary', discard: 'Discard changes', changed: 'You have unsaved changes.', unchanged: 'No unsaved changes.',
  loading: 'Loading Job notification events…', loadError: 'Job notification events could not be loaded.', reload: 'Reload events', conflict: 'These settings changed. Reload before saving.',
  saved: 'Job email events saved', savedHelp: 'Your workspace email rules have been updated.', saveError: 'The email rules could not be saved. Your changes are preserved.',
  stories: { notice: 'Interactive design preview. No rules are stored and no notifications are sent.', revision: 'job-events-preview-v1' },
} as const;

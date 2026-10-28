export const jobNotificationSettingsPageData = {
  configurationTitle: 'Deadline defaults and reminders active', configurationHelp: 'The Job creation form applies your reviewed deadline choice. Deadline reminders use workspace timing, current plan access and personal email preferences; in-app reminders stay on. Job-created, status-change, assignment-change and completion-deadline change notifications and the combined visit email rule are active. In-app notices stay on; email follows the effective workspace rules and each recipient’s preference.',
  back: '← All settings', eyebrow: 'Settings · Jobs', title: 'Deadlines & notifications',
  description: 'Configure completion deadline defaults, reminder timing and Job email events for this workspace.',
  scope: 'Workspace settings', saveHelp: 'Review and save each section separately. Saving one section leaves unsaved changes in other sections untouched.',
  timezone: 'Workspace timezone', plan: { free: 'Free', standard: 'Standard', premium: 'Premium' },
  premium: 'Premium includes up to five reminder timings, additional reminder recipients and customizable Job email events.',
  fixed: 'Free and Standard include one reminder on the due date with a configurable send time. Multiple timings, extra reminder recipients and email-event controls are available on Premium.',
  loading: 'Loading deadline and notification settings…', loadError: 'Deadline and notification settings could not be loaded.', retry: 'Retry loading settings',
  behavior: 'How reminders behave', rules: [
    { label: 'Deadline changes', detail: 'Recalculate pending reminders using the updated deadline.' },
    { label: 'Deadline removed', detail: 'Cancel pending deadline reminders.' },
    { label: 'Job completed or canceled', detail: 'Stop future reminders and preserve history.' },
    { label: 'Closed Job reopened', detail: 'Confirm or update its deadline before reminders resume.' },
  ],
  personalTitle: 'Your email preferences', personal: 'These settings apply to the workspace. Your personal email preferences remain separate; in-app notices stay on.', personalLink: 'Open my notification preferences',
  channels: 'Reminders use in-app notices and email. SMS and agent-authored Job chat reminders are deferred.',
  stories: { notice: 'Interactive design preview. Changes are not persisted and no notifications are sent.', timezone: 'America/New_York', date: '2026-10-23', time: '09:00', nextTime: '10:00', member: 'Alex Chen', defaultDays: 14, settingsHref: '/settings', preferencesHref: '/settings/notifications' },
} as const;

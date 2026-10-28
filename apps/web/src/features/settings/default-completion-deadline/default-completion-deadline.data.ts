import { addCalendarDays } from '@salesmora/domain';
export const defaultDeadlineDayLimit = 365;
export const defaultRelativeDeadlineDays = 14;
export const defaultCompletionDeadlineData = {
  title: 'Default completion deadline', description: 'Choose a default for new Jobs. A scheduled visit date is separate and does not set the completion deadline.',
  mode: 'Deadline default', unset: 'Leave unset by default', unsetHelp: 'Set a deadline on an individual Job when its timing is known.',
  relative: 'Set a relative deadline', relativeHelp: 'Calculate a completion deadline a number of days after each Job is created.',
  days: 'Days after Job creation', count: 'Count days as', business: 'Business days', calendar: 'Calendar days',
  counting: 'Counting starts after the creation day. Business days are Monday–Friday; holidays are not excluded. Calendar days include weekends.',
  precedence: 'This default applies to new Jobs without a specific Job or campaign deadline rule. Existing Jobs and their reminders stay unchanged.',
  timezone: 'Workspace timezone', example: 'Example for a new Job', created: 'Job created', deadline: 'Default completion deadline', exampleHelp: 'An illustration using a workspace-local creation date; no Job is created or updated.',
  noDeadline: 'No deadline; set it on the Job later', invalid: 'Enter a whole number from 1 to 365 days.',
  readOnly: 'You can view this default. Only authorized workspace Owners and Admins can change it.',
  review: 'Review & save', reviewTitle: 'Review default completion deadline', reviewDescription: 'Confirm the default for new Jobs. Existing Jobs will not be updated.', confirm: 'Save deadline default',
  summary: 'Default deadline summary', summaryMode: 'Default rule', effect: 'Applies to', futureJobs: 'New Jobs without a specific Job or campaign deadline rule',
  summaryRelative: (days: number, count: 'business' | 'calendar') => `${days} ${count === 'business' ? 'business' : 'calendar'} ${days === 1 ? 'day' : 'days'} after Job creation`,
  discard: 'Discard changes', unchanged: 'No unsaved changes.', changed: 'You have unsaved changes.',
  loading: 'Loading the deadline default…', loadError: 'The deadline default could not be loaded. Reload before making changes.', reload: 'Reload default',
  conflict: 'The deadline default changed. Reload the current version before saving.', saveError: 'The deadline default could not be saved. Your changes are preserved.',
  saved: 'Deadline default saved', savedHelp: 'The default for new Jobs has been updated.',
  stories: { notice: 'Interactive design preview. No defaults are stored and no Job deadlines are changed.', timezone: 'America/New_York', date: '2026-10-23',
    defaultDays: 14, monday: 'Oct 26, 2026', saturday: 'Oct 24, 2026', longTimezone: 'America/Argentina/Buenos_Aires',
  },
  date: (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)),
} as const;
/** Illustrative projection only. Live defaults require server-side workspace-date calculation. */
export function defaultDeadlineExample(created: string, days: number, count: 'business' | 'calendar') {
  if (count === 'calendar') return addCalendarDays(created, days);
  let date = created, remaining = days;
  while (remaining > 0) {
    date = addCalendarDays(date, 1);
    const day = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  return date;
}

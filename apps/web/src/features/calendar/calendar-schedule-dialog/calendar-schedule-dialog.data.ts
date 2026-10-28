import { calendarVisitPeekFixtures } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer.data';
import type { CalendarScheduleTarget } from './calendar-schedule-dialog';
export const calendarScheduleDialogData = {
  title: 'Schedule visit', edit: 'Reschedule visit', description: 'Choose a workspace-local date and arrival window, then review the affected records.',
  visit: 'Visit', date: 'Scheduled date', window: 'Arrival window (optional)', none: 'No arrival window', timezone: 'Workspace timezone',
  review: 'Review changes', confirm: 'Confirm schedule', confirmClear: 'Confirm clear schedule', back: 'Back to editing',
  clear: 'Clear schedule', clearTitle: 'Clear this visit’s schedule?',
  clearHelp: 'Active records below will lose their scheduled date and arrival window. Jobs that are Scheduled return to Needs Scheduling. Other active statuses are preserved.',
  affected: 'Affected active records', history: 'Completed and canceled records keep their historical schedule.',
  shared: 'These records share one visit. The change applies to every affected active record together.',
  unchanged: 'Assignments and completion deadlines stay unchanged. Needs Scheduling jobs become Scheduled when a date is saved; other active statuses are preserved.',
  people: 'Assigned people', from: 'Current schedule', to: 'Proposed schedule', noDate: 'Not scheduled',
  warnings: 'Review scheduling warnings', past: 'This date is in the past. You can still save it.', after: 'This date is after the Job completion deadline. You can still save it.',
  readOnly: 'Scheduling requires current permission for every affected active record. This visit is view-only.',
  empty: 'No visits are available to schedule.', conflict: 'This visit changed. Reload the latest values before saving. Your draft is preserved.',
  stories: { heading: 'Calendar scheduling preview', open: 'Open scheduling', today: '2026-10-21', nextDate: '2026-10-22',
    failure: 'The schedule could not be saved. Your draft is preserved.',
    overlap: 'Sam Rivera has another visit with an intersecting arrival window.', load: 'Sam Rivera would have 4 visits on this date.',
  },
} as const;
export const calendarScheduleTargets: readonly CalendarScheduleTarget[] = [
  { ...calendarVisitPeekFixtures.shared, revision: 'preview-shared-v1' },
  { ...calendarVisitPeekFixtures.job, revision: 'preview-job-v1', scheduledDate: null, arrivalWindow: null,
    records: [{ ...calendarVisitPeekFixtures.job.records[0], type: 'job', status: 'needs-scheduling' }] },
  { ...calendarVisitPeekFixtures.workOrder, revision: 'preview-work-order-v1' },
];

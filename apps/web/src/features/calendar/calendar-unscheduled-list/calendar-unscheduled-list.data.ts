import type { CalendarUnscheduledEntry } from './calendar-unscheduled-list';
import { calendarVisitFixtures, calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';

export const calendarUnscheduledListData = {
  title: 'Needs a scheduled date', description: 'Active Jobs and Work Orders without a visit date.',
  count: (count: number) => `${count} ${count === 1 ? 'visit' : 'visits'}`,
  showing: (shown: number, total: number) => `Showing ${shown} of ${total} visits.`,
  viewAll: 'View all unscheduled visits', schedule: 'Schedule', scheduleVisit: (title: string) => `Schedule: ${title}`,
  readOnly: 'View only', permission: 'Scheduling requires permission for every affected active record.',
  empty: 'No visits need a scheduled date.', filteredEmpty: 'No unscheduled visits match your filters.',
  loading: 'Loading unscheduled visits…', errorTitle: 'Unscheduled visits unavailable', error: 'We couldn’t load this list. Try again.', retry: 'Try again',
  noDeadline: 'No completion deadline',
  stories: { heading: 'Unscheduled visits preview', description: 'Fictional queue only; actions use preview callbacks.',
    scope: 'My unscheduled visits', thirdTitle: 'Inspect electrical panel', thirdCustomer: 'Morgan Ellis',
    manyTitle: (index: number) => `Preview service visit ${index + 1}`,
    longTitle: calendarEventCardData.stories.longTitle, longCustomer: calendarEventCardData.stories.longCustomer,
  },
} as const;
export const calendarUnscheduledEntries: readonly CalendarUnscheduledEntry[] = [
  { ...calendarVisitFixtures.shared, scheduledDate: null, arrivalWindow: null,
    completionDeadline: { date: '2026-10-19', overdue: true },
    records: [{ ...calendarVisitFixtures.shared.records[0], type: 'job', status: 'needs-scheduling' }, calendarVisitFixtures.shared.records[1]] },
  { ...calendarVisitFixtures.workOrder, scheduledDate: null, arrivalWindow: null, crew: [],
    records: [{ ...calendarVisitFixtures.workOrder.records[0], id: 'preview-wo-2', number: 'WO-1008' }] },
  { ...calendarVisitFixtures.job, id: 'preview-unscheduled-job-2', scheduledDate: null, arrivalWindow: null,
    title: calendarUnscheduledListData.stories.thirdTitle, customerName: calendarUnscheduledListData.stories.thirdCustomer,
    completionDeadline: { date: '2026-10-23', overdue: false },
    records: [{ ...calendarVisitFixtures.job.records[0], id: 'preview-job-2', number: 'J-1043', type: 'job', status: 'waiting' }], waiting: true },
];
export const calendarManyUnscheduledEntries: readonly CalendarUnscheduledEntry[] = Array.from({ length: 12 }, (_, index) => ({
  ...calendarUnscheduledEntries[2], id: `preview-queue-${index}`, title: calendarUnscheduledListData.stories.manyTitle(index),
  records: [{ ...calendarUnscheduledEntries[2].records[0], id: `preview-record-${index}`, number: `J-${1100 + index}` }],
}));

import type { CalendarScheduleTarget } from '../calendar-schedule-dialog/calendar-schedule-dialog';
import { calendarWeekEntries } from '../calendar-week-grid/calendar-week-grid.data';
import { calendarUnscheduledEntries } from '../calendar-unscheduled-list/calendar-unscheduled-list.data';

export const calendarPageData = {
  title: 'Calendar', description: 'Plan Jobs and Work Orders, review scheduled visits and see your team’s workload.',
  queuePagination: 'Unscheduled visits pages',
  mine: 'My schedule', myQueue: 'My unscheduled visits', unavailable: 'Scheduling is unavailable with the current access or loading state.',
  stories: { today: '2026-10-21', timezone: 'America/Chicago', viewerId: 'sam', saved: 'Preview schedule updated.',
    location: '124 Maple Street, Springfield, IL 62704', next: 'Confirm access before arrival.',
    queueTitles: ['Laundry room leak repair', 'Install exterior hose bib', 'Replace entry panel breaker'],
    missingCustomer: 'No matching preview customer',
    openRecord: 'Open-record callback requested. This preview does not navigate.',
    allQueue: 'View-all callback requested. This preview does not navigate.', conflict: 'The preview visit changed. Reopen it to review the latest schedule.',
  },
} as const;
export const calendarPageMembers = [{ id: 'sam', name: 'Sam Rivera' }, { id: 'alex', name: 'Alex Chen' }, { id: 'jordan', name: 'Jordan Lee' }];
const crews = [[calendarPageMembers[0], calendarPageMembers[1]], [calendarPageMembers[0]], [calendarPageMembers[1]], [], [calendarPageMembers[1]], [calendarPageMembers[0]]];
export const calendarPageVisits: readonly CalendarScheduleTarget[] = [
  ...calendarWeekEntries.map((visit, index) => ({ ...visit, crew: crews[index], revision: 'preview-v1', timezone: calendarPageData.stories.timezone,
    location: calendarPageData.stories.location, nextStep: calendarPageData.stories.next })),
  ...calendarUnscheduledEntries.map((visit, index) => ({ ...visit, id: `page-queue-${index}`, title: calendarPageData.stories.queueTitles[index],
    customerName: index === 1 ? 'Rosa Martinez' : visit.customerName,
    records: visit.records.map(record => ({ ...record, id: `page-queue-${record.type}-${index}`, number: record.type === 'job' ? `J-${1200 + index}` : `WO-${1300 + index}`, title: calendarPageData.stories.queueTitles[index] })),
    crew: index === 0 ? [calendarPageMembers[0]] : index === 1 ? [] : [calendarPageMembers[1]],
    revision: 'preview-v1', timezone: calendarPageData.stories.timezone, location: calendarPageData.stories.location, nextStep: calendarPageData.stories.next })),
];

export const calendarPagedQueueVisits: readonly CalendarScheduleTarget[] = Array.from({ length: 23 }, (_, index) => {
  const source = calendarPageVisits.find(visit => visit.scheduledDate === null)!;
  return { ...source, id: `paged-queue-${index}`, title: `Unscheduled preview visit ${index + 1}`, revision: `queue-${index}`,
    records: source.records.map(record => ({ ...record, id: `${record.id}-queue-${index}`, number: `${record.type === 'job' ? 'J' : 'WO'}-${2000 + index}`, title: `Unscheduled preview visit ${index + 1}` })) };
});

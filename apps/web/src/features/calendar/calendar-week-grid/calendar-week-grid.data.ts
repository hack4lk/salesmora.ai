import type { CalendarWeekEntry } from './calendar-week-grid';
import { calendarDayVisits } from '../calendar-day-column/calendar-day-column.data';

export const calendarWeekGridData = {
  label: 'Week schedule', loading: 'Loading scheduled visits…',
  errorTitle: 'Calendar could not be loaded', error: 'Try again to load this week’s visits.', retry: 'Try again',
  keyboard: 'Use Tab to reach visits and scheduling controls. When a day is focused, use Left and Right to move between days, Home and End for the first and last day, or Down to enter its controls.',
  scroll: 'Scroll horizontally to see all seven days on smaller screens.',
  count: (n: number) => `${n} ${n === 1 ? 'visit' : 'visits'} this week`,
  stories: {
    title: 'Scheduling calendar', description: 'Week grid preview · fictional visits only',
    weekDate: '2026-10-20', today: '2026-10-20', outsideToday: '2026-11-02',
    yearDate: '2027-01-01', dstDate: '2026-11-01', field: 'My schedule',
  },
} as const;
export const calendarWeekEntries: CalendarWeekEntry[] = calendarDayVisits.map((visit, index) => ({
  ...visit, scheduledDate: ['2026-10-19', '2026-10-20', '2026-10-20', '2026-10-22', '2026-10-24', '2026-10-25'][index],
}));

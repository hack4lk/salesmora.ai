import type { CalendarVisitPreview } from '../calendar-event-card/calendar-event-card';
import { calendarVisitFixtures } from '../calendar-event-card/calendar-event-card.data';

export const calendarDayColumnData = {
  today: 'Today', empty: 'No scheduled visits', schedule: 'Schedule visit', close: 'Close',
  count: (count: number) => `${count} ${count === 1 ? 'visit' : 'visits'}`,
  more: (count: number) => `+${count} more ${count === 1 ? 'visit' : 'visits'}`,
  allVisits: (date: string) => `All visits · ${date}`,
  scheduleOn: (date: string) => `Schedule visit on ${date}`,
  fullDate: (value: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)),
  weekday: (value: string) => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)),
  shortDate: (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)),
  stories: {
    heading: 'Calendar day column', description: 'Component preview · fictional visits only',
    date: '2026-10-20', otherDate: '2026-10-21', weekend: '2026-10-25',
    titles: ['Kitchen plumbing repair', 'Boiler maintenance', 'Site cleanup', 'Electrical inspection', 'Heating system check', 'Replace shutoff valves'],
    customers: ['Jordan Lee', 'Morgan Ellis', 'Priya Shah', 'Taylor Brooks', 'Lena Ortiz', 'Rosa Martinez'],
  },
} as const;

export const calendarDayVisits: CalendarVisitPreview[] = calendarDayColumnData.stories.titles.map((title, index) => {
  const template = index === 0 ? calendarVisitFixtures.shared : index % 2 ? calendarVisitFixtures.job : calendarVisitFixtures.workOrder;
  return { ...template, id: `preview-day-visit-${index}`, title, customerName: calendarDayColumnData.stories.customers[index],
    arrivalWindow: [null, '08:00-10:00', '09:00-11:00', '12:00-14:00', '13:00-15:00', '14:00-16:00'][index] as CalendarVisitPreview['arrivalWindow'],
    records: template.records.map(record => ({ ...record, id: `${record.id}-${index}`, title,
      number: record.type === 'job' ? `J-${1042 + index}` : `WO-${1007 + index}` })),
  };
});

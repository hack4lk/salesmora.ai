import type { CalendarWorkloadVisit } from './calendar-team-workload';

export const calendarTeamWorkloadData = {
  title: 'Team workload', ownTitle: 'My workload', unassigned: 'Unassigned', me: 'Me', everyone: 'Show everyone',
  count: (count: number) => `${count} ${count === 1 ? 'visit' : 'visits'}`,
  weekCount: (count: number) => `${count} distinct ${count === 1 ? 'visit' : 'visits'} this week`,
  filter: (name: string) => `Filter calendar by ${name}`,
  daily: 'Visits by day', busy: 'Busy day',
  busyDay: (date: string, count: number) => `${date}: ${count} visits`,
  helper: 'Visit counts do not measure free hours or availability. Working hours and time off are not included.',
  shared: 'Counts reflect current filters. Visits shared by teammates count once for each assigned person.', ownScope: 'Only your permitted schedule is shown.',
  empty: 'No scheduled visits this week.', noTeam: 'No teammates to show.',
  loading: 'Loading team workload…', errorTitle: 'Team workload unavailable', error: 'We couldn’t load this workload. Try again.', retry: 'Try again',
  day: (date: string) => new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)),
  stories: { title: 'Team workload preview', description: 'Fictional visit counts only; selections use a preview callback.', weekDate: '2026-10-21',
    sam: 'Sam Rivera', alex: 'Alex Chen', jordan: 'Jordan Lee', viewerId: 'sam', longName: 'Alexandra Montgomery-Sánchez — Residential installation and maintenance team',
  },
} as const;
export const calendarWorkloadMembers = [
  { id: 'sam', name: calendarTeamWorkloadData.stories.sam }, { id: 'alex', name: calendarTeamWorkloadData.stories.alex }, { id: 'jordan', name: calendarTeamWorkloadData.stories.jordan },
];
export const calendarWorkloadVisits: readonly CalendarWorkloadVisit[] = [
  { id: 'shared-visit', scheduledDate: '2026-10-19', crew: [calendarWorkloadMembers[0], calendarWorkloadMembers[1], calendarWorkloadMembers[0]] },
  { id: 'job-visit', scheduledDate: '2026-10-20', crew: [calendarWorkloadMembers[0]] },
  { id: 'work-order-visit', scheduledDate: '2026-10-22', crew: [calendarWorkloadMembers[1]] },
  { id: 'unassigned-visit', scheduledDate: '2026-10-24', crew: [] },
];

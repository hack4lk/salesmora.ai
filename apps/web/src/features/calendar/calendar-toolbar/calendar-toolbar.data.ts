export const calendarToolbarData = {
  label: 'Calendar week controls', navigation: 'Week navigation',
  previous: 'Previous week', next: 'Next week', today: 'Today', week: 'Week view',
  schedule: 'Schedule visit', loading: 'Loading calendar…',
  readOnly: 'You can view this calendar. Scheduling requires permission for every affected record.',
  timezone: (zone: string) => `Workspace timezone: ${zone}`,
  range: (start: string, end: string) => {
    const from = new Date(`${start}T12:00:00Z`), to = new Date(`${end}T12:00:00Z`);
    const format = (date: Date, year: boolean) => new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', ...(year ? { year: 'numeric' as const } : {}), timeZone: 'UTC',
    }).format(date);
    return `${format(from, from.getUTCFullYear() !== to.getUTCFullYear())} – ${format(to, true)}`;
  },
  stories: {
    heading: 'Scheduling calendar', description: 'Toolbar preview · fictional workspace dates',
    date: '2026-10-19', today: '2026-10-20', timezone: 'America/New_York',
    field: 'My schedule', filtered: 'Filtered schedule',
  },
} as const;

import type { CalendarVisitPreview } from './calendar-event-card';

export const calendarEventCardData = {
  types: { job: 'Job visit', work_order: 'Work Order visit', shared: 'Shared visit' },
  job: 'Job', workOrder: 'Work Order',
  noWindow: 'Arrival window not set',
  crew: 'Assigned team', unassigned: 'Unassigned',
  deadline: 'Completion deadline', overdue: 'Overdue',
  waiting: 'Waiting · visit on hold',
  readOnly: 'View only', open: 'View visit details',
  oneVisit: '1 visit',
  toggleVisit: (title: string) => `Visit: ${title}`,
  openVisit: (title: string) => `View visit details: ${title}`,
  date: (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)),
  window: (value: string) => {
    const time = (part: string) => {
      const [hour, minute] = part.split(':').map(Number);
      return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${hour < 12 ? 'AM' : 'PM'}`;
    };
    return value.split('-').map(time).join(' – ');
  },
  stories: {
    heading: 'Calendar visit', description: 'Component preview · Tuesday, October 20, 2026',
    title: 'Kitchen plumbing repair', customer: 'Jordan Lee',
    workOrderTitle: 'Replace kitchen shutoff valves', secondWorkOrderTitle: 'Test supply lines',
    sam: 'Sam Rivera', alex: 'Alex Chen',
    longTitle: 'Inspect and replace the kitchen supply lines, valves and dishwasher connection in the rear extension',
    longCustomer: 'Northside Community Workshop and Neighborhood Resource Center',
    longName: 'Alexandra Montgomery-Sánchez',
    changed: 'Open callback only; no schedule changes are saved.',
  },
} as const;

const shared: CalendarVisitPreview = {
  id: 'preview-visit-1', title: calendarEventCardData.stories.title,
  customerName: calendarEventCardData.stories.customer, arrivalWindow: '09:00-11:00',
  records: [
    { id: 'preview-job-1', type: 'job', number: 'J-1042', title: calendarEventCardData.stories.title, status: 'scheduled' },
    { id: 'preview-wo-1', type: 'work_order', number: 'WO-1007', title: calendarEventCardData.stories.workOrderTitle, status: 'issued' },
  ],
  crew: [{ id: 'sam', name: calendarEventCardData.stories.sam }, { id: 'alex', name: calendarEventCardData.stories.alex }],
  completionDeadline: { date: '2026-10-23', overdue: false }, waiting: false, canReschedule: true,
};
export const calendarVisitFixtures = {
  shared,
  job: { ...shared, id: 'preview-job-visit', records: [shared.records[0]] },
  workOrder: { ...shared, id: 'preview-wo-visit', title: calendarEventCardData.stories.workOrderTitle, records: [shared.records[1]], completionDeadline: null },
} satisfies Record<string, CalendarVisitPreview>;

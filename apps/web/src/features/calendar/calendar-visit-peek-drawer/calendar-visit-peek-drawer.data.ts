import { calendarVisitFixtures, calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';
import type { CalendarVisitPeek } from './calendar-visit-peek-drawer';

export const calendarVisitPeekDrawerData = {
  title: 'Visit details', description: 'Review this visit without leaving the calendar.',
  customer: 'Customer', location: 'Service location', noLocation: 'Service location not provided',
  schedule: 'Scheduled visit', noDate: 'No scheduled date', timezone: 'Workspace timezone',
  people: 'Assigned people', records: 'Linked records', next: 'Next step', noNext: 'No next step recorded',
  shared: 'One shared visit. Rescheduling requires review of all affected active records.',
  askAssistant: 'Ask assistant about this visit',
  assistantHelp: 'Open the assistant with this visit selected. Your permissions still apply, and changes require review.',
  assistantBusy: 'The assistant is busy. Finish or stop its current response before switching to this visit.',
  assistantContext: (numbers: readonly string[]) => `Visit · ${numbers.join(' + ')}`,
  reschedule: 'Reschedule visit', scheduleAction: 'Schedule visit',
  readOnly: 'You can view this visit. Scheduling is unavailable with your current access or this visit’s state.',
  loading: 'Loading visit details…', errorTitle: 'Visit details unavailable',
  error: 'We couldn’t load this visit. Try again.', retry: 'Try again',
  openRecord: (type: 'job' | 'work_order', number: string) => `Open ${type === 'job' ? 'Job' : 'Work Order'} ${number}`,
  stories: { assistantNotice: 'Design preview. Selecting a visit opens the global assistant; no requests are sent and no records change.', assistantDescription: 'Ask about the selected visit or prepare a schedule change for review.', title: 'Calendar visit preview', launch: 'Open visit', address: '124 Maple Street, Springfield, IL 62704',
    next: 'Confirm access to the kitchen before arrival.', timezone: 'America/Chicago',
    longLocation: 'Northside Community Workshop, rear extension and equipment access entrance, 124 Maple Street, Springfield, IL 62704',
  },
} as const;
const base = { scheduledDate: '2026-10-21', timezone: calendarVisitPeekDrawerData.stories.timezone,
  location: calendarVisitPeekDrawerData.stories.address, nextStep: calendarVisitPeekDrawerData.stories.next };
export const calendarVisitPeekFixtures = {
  shared: { ...calendarVisitFixtures.shared, ...base },
  job: { ...calendarVisitFixtures.job, ...base },
  workOrder: { ...calendarVisitFixtures.workOrder, ...base },
  field: { ...calendarVisitFixtures.workOrder, ...base, location: null, nextStep: null,
    crew: [calendarVisitFixtures.shared.crew[0]], canReschedule: false },
  long: { ...calendarVisitFixtures.shared, ...base, title: calendarEventCardData.stories.longTitle,
    customerName: calendarEventCardData.stories.longCustomer, location: calendarVisitPeekDrawerData.stories.longLocation },
} satisfies Record<string, CalendarVisitPeek>;

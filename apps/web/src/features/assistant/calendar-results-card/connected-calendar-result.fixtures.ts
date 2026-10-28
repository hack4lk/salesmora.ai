import type { CalendarChatResult } from '@salesmora/contracts';
import { calendarResultsCardData as copy } from './calendar-results-card.data';
import { calendarEventCardData as visit } from '../../calendar/calendar-event-card/calendar-event-card.data';
export const calendarConnectedWorkspace = '00000000-0000-4000-8000-000000000001';
export const calendarConnectedTurn = '00000000-0000-4000-8000-000000000002';
export const calendarConnectedResult: Exclude<CalendarChatResult, { mode:'availability' }> = {
  id: '00000000-0000-4000-8000-000000000003', mode: 'schedule', scope: 'workspace', timezone: copy.stories.timezone,
  from: copy.stories.from, to: copy.stories.to, checkedAt: copy.stories.checkedAt, filterLabels: copy.stories.filters.slice(), total: 1,
  visits: [{ id: '00000000-0000-4000-8000-000000000004', title: visit.stories.title, scheduledDate: '2026-10-20', arrivalWindow: '09:00-11:00',
    records: [{ type: 'job', id: '00000000-0000-4000-8000-000000000005', title: visit.stories.title, number: 'J-1042', status: 'scheduled' },
      { type: 'work_order', id: '00000000-0000-4000-8000-000000000006', title: visit.stories.workOrderTitle, number: 'WO-1007', status: 'issued' }],
    crew: [{ id: 'sam', name: visit.stories.sam }],
  }],
};

export const calendarConnectedAdvice: Extract<CalendarChatResult,{ mode:'availability' }> = {
  id:'00000000-0000-4000-8000-000000000007', mode:'availability', from:'2026-10-22', to:'2026-10-28',
  scope:'workspace', viewerId:'viewer', people:[{ id:'sam',name:visit.stories.sam }], arrivalWindow:'09:00-11:00',
  timezone:copy.stories.timezone, checkedAt:copy.stories.checkedAt, total:5,
  suggestions:[{ id:'00000000-0000-4000-8000-000000000008', date:'2026-10-22', person:{ id:'sam',name:visit.stories.sam },visitCount:0,unknownWindowCount:0,timing:'no-known-overlap' }],
};

import type { arrivalWindows, CalendarVisit } from '@salesmora/contracts';
import { addCalendarDays } from './dates';
type Window = typeof arrivalWindows[number];
const span = (window: Window) => window.split('-').map(t => Number(t.slice(0,2)) * 60 + Number(t.slice(3)));
export function calendarWindowsOverlap(a: Window, b: Window) {
  const [startA,endA] = span(a), [startB,endB] = span(b);
  return startA < endB && startB < endA;
}
/** Caller supplies complete, authorized active visits; never a paginated or customer-filtered card. */
export function calendarDateCandidates(input: {
  from: string; to: string; includeWeekends: boolean; arrivalWindow: Window | null;
  people: readonly { id: string; name: string }[]; visits: readonly Pick<CalendarVisit,'id'|'scheduledDate'|'arrivalWindow'|'crew'>[];
}) {
  const visits = [...new Map(input.visits.map(v => [v.id,v])).values()];
  const candidates = [];
  for (let date = input.from; date <= input.to; date = addCalendarDays(date,1)) {
    if (!input.includeWeekends && [0,6].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) continue;
    for (const person of input.people) {
      const work = visits.filter(v => v.scheduledDate === date && v.crew.some(p => p.id === person.id));
      if (input.arrivalWindow && work.some(v => v.arrivalWindow && calendarWindowsOverlap(input.arrivalWindow!,v.arrivalWindow))) continue;
      const unknownWindowCount = work.filter(v => !v.arrivalWindow).length;
      candidates.push({ date, person, visitCount: work.length, unknownWindowCount,
        timing: input.arrivalWindow && (!work.length || unknownWindowCount < work.length) ? 'no-known-overlap' as const : 'not-checked' as const });
    }
  }
  // Fewer visits first, then fewer unknown windows, then earliest date and stable person identity.
  return candidates.sort((a,b) => a.visitCount - b.visitCount || a.unknownWindowCount - b.unknownWindowCount || a.date.localeCompare(b.date) || a.person.id.localeCompare(b.person.id));
}

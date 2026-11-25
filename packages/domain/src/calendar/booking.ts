/** All ranges are UTC milliseconds, resolved in one batch by the data adapter. Endpoints are exclusive. */
export type CalendarBookingInterval = { start: number; finish: number };
export type CalendarBookingBusy = CalendarBookingInterval & { gapMinutes: number };

function intersect(left: CalendarBookingInterval[], right: readonly CalendarBookingInterval[]): CalendarBookingInterval[] {
  const result: CalendarBookingInterval[] = [];
  let a = 0, b = 0;
  while (a < left.length && b < right.length) {
    const start = Math.max(left[a].start, right[b].start), finish = Math.min(left[a].finish, right[b].finish);
    if (start < finish) result.push({ start, finish });
    if (left[a].finish < right[b].finish) a++; else b++;
  }
  return result;
}
/** No DB/model calls. Work and its trailing gap must fit every person's working period. */
export function findCommonCalendarSlot(input: {
  windows: readonly CalendarBookingInterval[]; people: readonly (readonly CalendarBookingInterval[])[];
  busy: readonly CalendarBookingBusy[]; durationMinutes: number; gapMinutes: number;
}): CalendarBookingInterval | null {
  if (!input.people.length) return null;
  let common = [...input.windows].sort((a, b) => a.start - b.start);
  for (const person of input.people) common = intersect(common, [...person].sort((a, b) => a.start - b.start));
  const duration = input.durationMinutes * 60000, gap = input.gapMinutes * 60000;
  const busy = input.busy.map(item => { const separation = Math.max(input.gapMinutes, item.gapMinutes) * 60000;
    return { start: item.start - separation, finish: item.finish + separation };
  }).sort((a, b) => a.start - b.start);
  for (const window of common) {
    let start = Math.ceil(window.start / 60000) * 60000;
    for (const occupied of busy) {
      if (occupied.finish <= start) continue;
      if (occupied.start >= start + duration) break;
      start = Math.ceil(occupied.finish / 60000) * 60000;
    }
    if (start + duration + gap <= window.finish) return { start, finish: start + duration };
  }
  return null;
}

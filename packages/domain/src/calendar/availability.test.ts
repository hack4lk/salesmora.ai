import { describe, expect, it } from 'vitest';
import { calendarDateCandidates, calendarWindowsOverlap } from './availability';
import type { CalendarVisit } from '@salesmora/contracts';
const people = [{ id: 'a', name: 'Alex' }, { id: 'b', name: 'Blake' }];
const visit = (id: string, date: string, window: CalendarVisit['arrivalWindow'], crew = people.slice(0,1)) => ({ id, scheduledDate: date, arrivalWindow: window, crew });
const input = { from:'2026-10-23', to:'2026-10-26', includeWeekends:false, arrivalWindow:null, people, visits:[] };
describe('Calendar date advice', () => {
  it('uses weekdays by default and explicitly includes weekends; date math spans DST without shifts', () => {
    expect([...new Set(calendarDateCandidates(input).map(c => c.date))]).toEqual(['2026-10-23','2026-10-26']);
    expect(calendarDateCandidates({ ...input, includeWeekends:true })).toHaveLength(8);
    expect([...new Set(calendarDateCandidates({ ...input, from:'2026-10-30', to:'2026-11-02' }).map(c => c.date))]).toEqual(['2026-10-30','2026-11-02']);
  });
  it('treats intersecting windows as conflicts, but adjacent windows as safe', () => {
    expect(calendarWindowsOverlap('09:00-11:00','10:00-12:00')).toBe(true);
    expect(calendarWindowsOverlap('10:00-12:00','12:00-14:00')).toBe(false);
    const visits = [visit('overlap','2026-10-23','09:00-11:00')];
    const checked = calendarDateCandidates({ ...input, to:input.from, visits, arrivalWindow:'10:00-12:00' });
    expect(checked.map(c => c.person.id)).toEqual(['b']);
    expect(calendarDateCandidates({ ...input, to:input.from, visits, arrivalWindow:'12:00-14:00' })).toHaveLength(2);
  });
  it('deduplicates shared visits and crew; counts all entries beyond card limits', () => {
    const visits = Array.from({ length:30 }, (_,i) => visit(String(i),'2026-10-23',null,[people[0],people[0]]));
    const candidates = calendarDateCandidates({ ...input, to:input.from, visits:[...visits,visits[0]] });
    expect(candidates.find(c => c.person.id === 'a')).toMatchObject({ visitCount:30, unknownWindowCount:30, timing:'not-checked' });
    expect(candidates[0].person.id).toBe('b');
  });
  it('never claims timing was checked on all-unknown days; flags partial unknowns', () => {
    const visits = [visit('1',input.from,null)];
    const candidates = calendarDateCandidates({ ...input, to:input.from, visits, arrivalWindow:'09:00-11:00' });
    expect(candidates.find(c => c.person.id === 'a')).toMatchObject({ timing:'not-checked', unknownWindowCount:1 });
    const partial = calendarDateCandidates({ ...input, to:input.from, visits:[...visits,visit('2',input.from,'12:00-14:00')], arrivalWindow:'09:00-11:00' });
    expect(partial.find(c => c.person.id === 'a')).toMatchObject({ timing:'no-known-overlap', unknownWindowCount:1, visitCount:2 });
    expect(candidates.find(c => c.person.id === 'b')).toMatchObject({ timing:'no-known-overlap', visitCount:0 });
  });
  it('counts busy days without blocking advice and ignores other dates and people', () => {
    const visits = Array.from({ length:4 }, (_,i) => visit(String(i),input.from,'12:00-14:00'));
    visits.push(visit('outside','2026-10-22',null), visit('other',input.from,null,people.slice(1)));
    expect(calendarDateCandidates({ ...input, to:input.from, people:people.slice(0,1), visits, arrivalWindow:'09:00-11:00' })[0]).toMatchObject({ visitCount:4, unknownWindowCount:0 });
  });
});

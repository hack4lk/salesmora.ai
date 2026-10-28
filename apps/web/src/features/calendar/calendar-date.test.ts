import { describe, expect, it } from 'vitest';
import { addCalendarDays, calendarWeekStart } from './calendar-date';

describe('Calendar date navigation', () => {
  it('uses Monday through Sunday, including a week spanning years', () => {
    expect(calendarWeekStart('2027-01-01')).toBe('2026-12-28');
    expect(calendarWeekStart('2027-01-03')).toBe('2026-12-28');
    expect(calendarWeekStart('2027-01-04')).toBe('2027-01-04');
    expect(addCalendarDays('2026-12-28', 6)).toBe('2027-01-03');
  });
  it('navigates calendar days without DST or leap-year drift', () => {
    expect(addCalendarDays('2026-03-02', 7)).toBe('2026-03-09');
    expect(addCalendarDays('2026-10-26', 7)).toBe('2026-11-02');
    expect(addCalendarDays('2028-02-28', 6)).toBe('2028-03-05');
    expect(addCalendarDays('2027-01-04', -7)).toBe('2026-12-28');
  });
  it('rejects impossible dates instead of silently rolling them forward', () => {
    expect(() => calendarWeekStart('2026-02-30')).toThrow();
    expect(() => addCalendarDays('invalid', 7)).toThrow();
  });
});

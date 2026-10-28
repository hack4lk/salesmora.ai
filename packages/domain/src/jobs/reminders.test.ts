import { describe, expect, it } from 'vitest';
import { reminderClock, reminderDeadlineForDate } from './reminders';
describe('workspace reminder timing', () => {
  it('uses workspace-local date and minute across UTC midnight', () => {
    expect(reminderClock(new Date('2026-10-27T00:30:00Z'), 'America/New_York')).toEqual({ date: '2026-10-26', time: '20:30' });
    expect(reminderClock(new Date('2026-10-27T00:30:00Z'), 'Pacific/Auckland')).toEqual({ date: '2026-10-27', time: '13:30' });
  });
  it('runs gap times at the first later local minute and folds share a daily key', () => {
    expect(reminderClock(new Date('2026-03-08T06:59:00Z'), 'America/New_York').time < '02:30').toBe(true);
    expect(reminderClock(new Date('2026-03-08T07:00:00Z'), 'America/New_York')).toEqual({ date: '2026-03-08', time: '03:00' });
    expect(reminderClock(new Date('2026-11-01T05:30:00Z'), 'America/New_York')).toEqual(reminderClock(new Date('2026-11-01T06:30:00Z'), 'America/New_York'));
  });
  it('matches only the calendar date for before/on/after offsets across year and leap boundaries', () => {
    expect(reminderDeadlineForDate('2026-12-31', 'before', 1)).toBe('2027-01-01');
    expect(reminderDeadlineForDate('2028-03-01', 'after', 1)).toBe('2028-02-29');
    expect(reminderDeadlineForDate('2026-10-26', 'on', 0)).toBe('2026-10-26');
  });
  it('rejects invalid clocks and timezone identifiers', () => {
    expect(() => reminderClock(new Date('invalid'), 'UTC')).toThrow();
    expect(() => reminderClock(new Date(), 'invalid/zone')).toThrow();
  });
});

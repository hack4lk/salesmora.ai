import { describe, expect, it } from 'vitest';
import type { CalendarAvailability } from '@salesmora/contracts';
import { calendarAvailabilityWarnings } from './availability-rules';
const allOff = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
const rules: CalendarAvailability = { weeklyHours: { ...allOff, monday: { startTime: '08:00', endTime: '17:00' } }, unavailableDates: [] };
const input = { personName: 'Alex', availability: rules, timezone: 'America/New_York', scheduleTimezone: 'America/New_York', scheduledDate: '2026-11-23',
  planned: { start: new Date('2026-11-23T13:00:00Z'), finish: new Date('2026-11-23T22:00:00Z') } };
describe('recorded person availability warnings', () => {
  it('accepts work that exactly fits recorded hours', () => expect(calendarAvailabilityWarnings(input)).toEqual([]));
  it('warns for missing hours instead of treating an empty calendar as free', () => {
    expect(calendarAvailabilityWarnings({ ...input, availability: null }).join(' ')).toContain('availability is unknown');
    expect(calendarAvailabilityWarnings({ ...input, availability: { ...rules, weeklyHours: null } }).join(' ')).toContain('availability is unknown');
  });
  it('warns for explicit days off', () => expect(calendarAvailabilityWarnings({ ...input, availability: { ...rules, weeklyHours: allOff } }).join(' ')).toContain('does not work'));
  it.each([
    { start: new Date('2026-11-23T12:59:00Z'), finish: input.planned.finish },
    { start: input.planned.start, finish: new Date('2026-11-23T22:01:00Z') },
  ])('checks the entire occupied period', planned => expect(calendarAvailabilityWarnings({ ...input, planned }).join(' ')).toContain('outside recorded working hours'));
  it('includes both endpoints of unavailable date ranges', () => {
    for (const unavailableDates of [[{ startDate: '2026-11-22', endDate: '2026-11-23' }], [{ startDate: '2026-11-23', endDate: '2026-11-24' }]])
      expect(calendarAvailabilityWarnings({ ...input, availability: { ...rules, unavailableDates } }).join(' ')).toContain('recorded unavailable dates');
  });
  it('does not infer occupied work from a date or arrival window', () => expect(calendarAvailabilityWarnings({ ...input, planned: undefined }).join(' ')).toContain('Record planned work time'));
  it('converts real work instants to the saved person timezone', () => {
    const availability = { weeklyHours: { ...allOff, sunday: { startTime: '16:00', endTime: '20:00' } }, unavailableDates: [] };
    expect(calendarAvailabilityWarnings({ ...input, availability, timezone: 'America/Los_Angeles', planned: { start: new Date('2026-11-23T01:00:00Z'), finish: new Date('2026-11-23T02:00:00Z') } })).toEqual([]);
  });
  it('treats a midnight finish as an exclusive endpoint for unavailable dates', () => {
    const messages = calendarAvailabilityWarnings({ ...input, availability: { ...rules, unavailableDates: [{ startDate: '2026-11-24', endDate: '2026-11-24' }] },
      planned: { start: new Date('2026-11-24T02:00:00Z'), finish: new Date('2026-11-24T05:00:00Z') } });
    expect(messages.some(message => message.includes('recorded unavailable dates'))).toBe(false);
  });
  it('does not guess an availability date across timezones without work times', () => {
    const messages = calendarAvailabilityWarnings({ ...input, timezone: 'America/Los_Angeles', planned: undefined });
    expect(messages).toHaveLength(1); expect(messages[0]).toContain('Record planned work time');
  });
});

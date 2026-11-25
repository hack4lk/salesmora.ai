import { describe, expect, it } from 'vitest';
import { calendarAvailabilitySchema, calendarUnavailableDatesSchema, calendarWeeklyHoursSchema, calendarWorkingHoursSchema } from './calendar-availability';

const off = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
const week = { ...off, monday: { startTime: '08:00', endTime: '17:00' } };
const range = (startDate: string, endDate = startDate) => ({ startDate, endDate });
describe('calendar availability intent', () => {
  it('distinguishes unknown hours from an explicitly nonworking week', () => {
    expect(calendarAvailabilitySchema.parse({ weeklyHours: null, unavailableDates: [] }).weeklyHours).toBeNull();
    expect(calendarAvailabilitySchema.parse({ weeklyHours: off, unavailableDates: [] }).weeklyHours).toEqual(off);
  });
  it('requires a complete explicit seven-day week without inventing hours', () => {
    expect(calendarWeeklyHoursSchema.parse(week)).toEqual(week);
    expect(calendarWeeklyHoursSchema.safeParse({ monday: week.monday }).success).toBe(false);
    expect(calendarWeeklyHoursSchema.safeParse({ ...week, holiday: null }).success).toBe(false);
  });
  it.each([
    { startTime: '', endTime: '' }, { startTime: '08:00', endTime: '08:00' },
    { startTime: '17:00', endTime: '08:00' }, { startTime: '24:00', endTime: '25:00' },
    { startTime: '8:00', endTime: '17:00' }, { startTime: '08:60', endTime: '17:00' },
    { startTime: '08:00', endTime: '17:00', duration: 9 },
  ])('rejects incomplete, overnight or malformed hours: %j', value => {
    expect(calendarWorkingHoursSchema.safeParse(value).success).toBe(false);
  });
  it('accepts full-day and multi-day unavailable ranges even when hours are unknown', () => {
    const value = { weeklyHours: null, unavailableDates: [range('2026-12-24', '2026-12-25'), range('2026-12-31')] };
    expect(calendarAvailabilitySchema.parse(value)).toEqual(value);
  });
  it.each([range('2026-02-30'), range('2026-12-25', '2026-12-24'), range('2026-12-24', ''), range('12/24/2026')])('rejects invalid date range %j', value => {
    expect(calendarUnavailableDatesSchema.safeParse(value).success).toBe(false);
  });
  it('rejects inclusive overlaps and duplicates regardless of input order', () => {
    for (const unavailableDates of [
      [range('2026-12-24', '2026-12-25'), range('2026-12-25', '2026-12-26')],
      [range('2026-12-24'), range('2026-12-24')],
      [range('2026-12-25'), range('2026-12-24', '2026-12-26')],
    ]) expect(calendarAvailabilitySchema.safeParse({ weeklyHours: week, unavailableDates }).success).toBe(false);
    expect(calendarAvailabilitySchema.safeParse({ weeklyHours: week, unavailableDates: [range('2026-12-24'), range('2026-12-25')] }).success).toBe(true);
  });
  it('bounds payload size and excludes unsupported availability facts', () => {
    expect(calendarAvailabilitySchema.safeParse({ weeklyHours: week, unavailableDates: Array.from({ length: 101 }, () => range('2026-12-24')) }).success).toBe(false);
    expect(calendarAvailabilitySchema.safeParse({ weeklyHours: week, unavailableDates: [], crewSelection: 'auto' }).success).toBe(false);
  });
});

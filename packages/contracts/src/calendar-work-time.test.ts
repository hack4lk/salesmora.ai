import { expect, it } from 'vitest';
import { calendarWorkTimeSchema } from './calendar-work-time';

it('accepts explicit same-day work time without confusing it with an arrival window', () => {
  expect(calendarWorkTimeSchema.parse({ startTime: '08:15', durationMinutes: 90 })).toEqual({ startTime: '08:15', durationMinutes: 90 });
  expect(calendarWorkTimeSchema.safeParse({ startTime: '08:00', durationMinutes: 480 }).success).toBe(true);
  expect(calendarWorkTimeSchema.safeParse({ startTime: '08:00', durationMinutes: 60, arrivalWindow: '08:00-10:00' }).success).toBe(false);
});
it('rejects missing/invalid time, partial duration, fractions, out-of-range and overnight work', () => {
  for (const input of [
    { startTime: '', durationMinutes: 60 }, { startTime: '8am', durationMinutes: 60 }, { startTime: '24:00', durationMinutes: 60 },
    { startTime: '09:60', durationMinutes: 60 }, { startTime: '08:00', durationMinutes: null }, { startTime: '08:00', durationMinutes: 0 },
    { startTime: '08:00', durationMinutes: 14 }, { startTime: '08:00', durationMinutes: 60.5 }, { startTime: '08:00', durationMinutes: 481 },
    { startTime: '23:45', durationMinutes: 15 }, { startTime: '23:30', durationMinutes: 60 },
  ]) expect(calendarWorkTimeSchema.safeParse(input).success).toBe(false);
});

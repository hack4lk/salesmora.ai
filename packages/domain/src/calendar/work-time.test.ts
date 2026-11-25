import { expect, it } from 'vitest';
import { calendarWorkTimeSummary } from './work-time';

it('formats same-day start, finish and duration including noon and mixed hours/minutes', () => {
  expect(calendarWorkTimeSummary({ startTime: '10:30', durationMinutes: 90 })).toEqual({ start: '10:30 AM', finish: '12:00 PM', duration: '1 hour 30 min', range: '10:30 AM–12:00 PM' });
  expect(calendarWorkTimeSummary({ startTime: '12:00', durationMinutes: 120 })?.finish).toBe('2:00 PM');
  expect(calendarWorkTimeSummary({ startTime: '00:00', durationMinutes: 15 })?.start).toBe('12:00 AM');
});
it('does not invent a finish for incomplete or overnight work time', () => {
  for (const value of [null, { startTime: '', durationMinutes: 60 }, { startTime: '08:00', durationMinutes: null }, { startTime: '23:30', durationMinutes: 60 }]) expect(calendarWorkTimeSummary(value)).toBeNull();
});

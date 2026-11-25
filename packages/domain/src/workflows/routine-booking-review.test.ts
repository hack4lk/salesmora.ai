import { describe, expect, it } from 'vitest';
import type { WorkflowRoutineBookingValues } from '@salesmora/contracts';
import { routineBookingReview } from './routine-booking-review';
const values: WorkflowRoutineBookingValues = { name: 'Book maintenance', service: 'Maintenance', recipientId: 'morgan', notifications: { inApp: true, email: true },
  rules: { durationMinutes: 60, gapMinutes: 30, horizonDays: 14, weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], hours: { startTime: '08:00', endTime: '12:00' } } };
describe('compact booking review', () => {
  it('explains the automatic action and every scheduling choice', () => expect(routineBookingReview(values)).toEqual({
    summary: 'Book new unscheduled Maintenance jobs for their assigned people.', duration: '1 hour', days: 'Monday–Friday', hours: '8 AM–12 PM', gap: '30 minutes', horizon: '14 calendar days',
  }));
  it('keeps minutes, nonconsecutive days, zero gap and a one-day horizon explicit', () => expect(routineBookingReview({ ...values, rules: { ...values.rules, durationMinutes: 90, gapMinutes: 0, horizonDays: 1,
    weekdays: ['friday', 'monday', 'wednesday'], hours: { startTime: '08:15', endTime: '17:30' } } })).toMatchObject({ duration: '1 hour 30 min', days: 'Mon, Wed, Fri', hours: '8:15 AM–5:30 PM', gap: 'No gap', horizon: '1 calendar day' }));
  it('labels all seven selected days as every day', () => expect(routineBookingReview({ ...values, rules: { ...values.rules, weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] } }).days).toBe('Every day'));
});

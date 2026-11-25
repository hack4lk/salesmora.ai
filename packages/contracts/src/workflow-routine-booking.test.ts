import { describe, expect, it } from 'vitest';
import { workflowRoutineBookingValuesSchema } from './workflow-routine-booking';
import { workflowRecipeSchema } from './workflows';
const values = { name: 'Book maintenance', service: 'Maintenance', recipientId: 'morgan', notifications: { inApp: true, email: true },
  rules: { durationMinutes: 60, gapMinutes: 30, horizonDays: 14, weekdays: ['monday', 'friday'], hours: { startTime: '08:00', endTime: '12:00' } } };
describe('routine-booking setup values', () => {
  it('retains exact service values and canonicalizes day order without inventing choices', () => {
    const result = workflowRoutineBookingValuesSchema.parse({ ...values, name: ' Book maintenance ', service: ' Maintenance ', rules: { ...values.rules, weekdays: ['friday', 'monday'] } });
    expect(result.name).toBe('Book maintenance'); expect(result.service).toBe(' Maintenance '); expect(result.rules.weekdays).toEqual(['monday', 'friday']);
    expect(result.notifications).toEqual({ inApp: true, email: true });
  });
  it.each([{ name: '' }, { service: ' ' }, { recipientId: '' }, { notifications: { inApp: false, email: false } }, { localTime: '09:00' }, { crewSelection: 'automatic' }])('rejects incomplete/unsupported review values %j', change => {
    expect(workflowRoutineBookingValuesSchema.safeParse({ ...values, ...change }).success).toBe(false);
  });
  it('requires the complete scheduling rules instead of filling defaults', () => {
    for (const key of Object.keys(values.rules)) expect(workflowRoutineBookingValuesSchema.safeParse({ ...values, rules: Object.fromEntries(Object.entries(values.rules).filter(([field]) => field !== key)) }).success).toBe(false);
    expect(workflowRoutineBookingValuesSchema.safeParse({ ...values, rules: { ...values.rules, durationMinutes: 240, gapMinutes: 30 } }).success).toBe(false);
  });
  it('recognizes the connected routine-booking recipe', () => expect(workflowRecipeSchema.safeParse('routine_booking').success).toBe(true));
});

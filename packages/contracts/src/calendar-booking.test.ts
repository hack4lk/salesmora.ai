import { describe, expect, it } from 'vitest';
import { calendarBookingCommandSchema, calendarBookingRulesSchema } from './calendar-booking';
const rules = { durationMinutes: 60, gapMinutes: 30, horizonDays: 14, weekdays: ['monday', 'tuesday'], hours: { startTime: '08:00', endTime: '12:00' } };
describe('reviewed Calendar booking rules', () => {
  it('requires all scheduling choices explicitly', () => {
    expect(calendarBookingRulesSchema.parse(rules)).toEqual(rules);
    for (const key of Object.keys(rules)) expect(calendarBookingRulesSchema.safeParse(Object.fromEntries(Object.entries(rules).filter(([field]) => field !== key))).success).toBe(false);
  });
  it.each([{ durationMinutes: 14 }, { durationMinutes: 481 }, { gapMinutes: -1 }, { gapMinutes: 121 }, { horizonDays: 0 }, { horizonDays: 32 }, { weekdays: [] }, { weekdays: ['monday', 'monday'] }, { weekdays: ['holiday'] }, { hours: { startTime: '12:00', endTime: '08:00' } }, { hours: { startTime: '08:00', endTime: '09:00' } }, { crewSelection: 'auto' }])('rejects invalid or unsupported rules %j', change => expect(calendarBookingRulesSchema.safeParse({ ...rules, ...change }).success).toBe(false));
  it('binds the request to a workspace, job and receipt without accepting a preselected unverified slot', () => {
    const input = { workspaceId: '9115e486-ff42-46ec-a6fc-7994c25e41a1', jobId: '4ef4d155-6884-4cbf-9684-c97f407fa2b5', submissionId: 'e1ce6ea0-e2bf-4325-bd60-e6d34c03567d', rules };
    expect(calendarBookingCommandSchema.parse(input)).toEqual(input);
    expect(calendarBookingCommandSchema.safeParse({ ...input, startTime: '09:00' }).success).toBe(false);
  });
});

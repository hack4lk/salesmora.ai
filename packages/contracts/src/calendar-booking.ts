import { z } from 'zod';
import { calendarWeekdays, calendarWorkingHoursSchema } from './calendar-availability';

/** Explicit reviewed rules; no duration, hours, gap or horizon is inferred by the executor. */
export const calendarBookingRulesSchema = z.object({
  durationMinutes: z.number().int().min(15).max(480), gapMinutes: z.number().int().min(0).max(120),
  horizonDays: z.number().int().min(1).max(31),
  weekdays: z.array(z.enum(calendarWeekdays)).min(1).max(7).refine(days => new Set(days).size === days.length),
  hours: calendarWorkingHoursSchema,
}).strict().refine(value => {
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return minutes(value.hours.endTime) - minutes(value.hours.startTime) >= value.durationMinutes + value.gapMinutes;
}, { message: 'Allow enough time for the work and gap.', path: ['hours'] });
export const calendarBookingSearchSchema = z.object({ workspaceId: z.uuid(), jobId: z.uuid(), rules: calendarBookingRulesSchema }).strict();
export const calendarBookingCommandSchema = calendarBookingSearchSchema.extend({ submissionId: z.uuid() });
export type CalendarBookingRules = z.infer<typeof calendarBookingRulesSchema>;
export type CalendarBookingCommand = z.infer<typeof calendarBookingCommandSchema>;
export const calendarBookingReasons = ['missing_zip','outside_coverage','no_qualified_workers','manual_assignment','unassigned', 'unknown_hours', 'inactive_person', 'no_common_slot', 'unknown_work', 'clock_change', 'deadline', 'ineligible', 'capacity_limit'] as const;
export type CalendarBookingReason = typeof calendarBookingReasons[number];
export type CalendarBookingSlot = { date: string; startTime: string; durationMinutes: number; timezone: string; startsAt: string; endsAt: string };
export type CalendarBookingSearchResult = { status: 'found'; slot: CalendarBookingSlot } | { status: 'no_slot'; reasons: CalendarBookingReason[] };
export type CalendarBookingResult = { status: 'booked'; assignedWorker?:{id:string;name:string}; slot: CalendarBookingSlot; visitId: string; visitVersion: number } | Extract<CalendarBookingSearchResult, { status: 'no_slot' }>;

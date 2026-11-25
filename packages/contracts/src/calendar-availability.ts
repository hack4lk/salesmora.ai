import { z } from 'zod';
import { jobDateSchema } from './job';

export const calendarWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Choose a valid time.');
export const calendarWorkingHoursSchema = z.object({ startTime: localTime, endTime: localTime }).strict()
  .refine(value => value.startTime < value.endTime, { message: 'Finish must be after start on the same day.', path: ['endTime'] });
const dayHours = calendarWorkingHoursSchema.nullable();
export const calendarWeeklyHoursSchema = z.object({
  monday: dayHours, tuesday: dayHours, wednesday: dayHours, thursday: dayHours,
  friday: dayHours, saturday: dayHours, sunday: dayHours,
}).strict();
export const calendarUnavailableDatesSchema = z.object({ startDate: jobDateSchema, endDate: jobDateSchema }).strict()
  .refine(value => value.startDate <= value.endDate, { message: 'End date must be on or after start date.', path: ['endDate'] });

/** Local calendar rules for one person. A null week means unknown, not unrestricted availability. */
export const calendarAvailabilitySchema = z.object({
  weeklyHours: calendarWeeklyHoursSchema.nullable(),
  unavailableDates: z.array(calendarUnavailableDatesSchema).max(100),
}).strict().superRefine((value, context) => {
  const ordered = value.unavailableDates.map((range, index) => ({ ...range, index })).sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (let index = 1; index < ordered.length; index++) {
    if (ordered[index].startDate <= ordered[index - 1].endDate) context.addIssue({ code: 'custom',
      message: 'Combine overlapping unavailable dates into one range.', path: ['unavailableDates', ordered[index].index, 'startDate'] });
  }
});
export type CalendarWorkingHours = z.infer<typeof calendarWorkingHoursSchema>;
export type CalendarWeeklyHours = z.infer<typeof calendarWeeklyHoursSchema>;
export type CalendarAvailability = z.infer<typeof calendarAvailabilitySchema>;

export const calendarPersonAvailabilityResultSchema = z.object({
  person: z.object({ id: z.string().min(1), name: z.string() }).strict(),
  revision: z.string().regex(/^[a-f0-9]{64}$/), timezone: z.string().min(1).max(100),
  availability: calendarAvailabilitySchema, canEdit: z.boolean(),
}).strict();
export const calendarAvailabilityCommandSchema = z.object({
  workspaceId: z.uuid(), personId: z.string().min(1).max(200), submissionId: z.uuid(),
  revision: calendarPersonAvailabilityResultSchema.shape.revision, timezone: calendarPersonAvailabilityResultSchema.shape.timezone,
  availability: calendarAvailabilitySchema,
}).strict();
export type CalendarPersonAvailabilityResult = z.infer<typeof calendarPersonAvailabilityResultSchema>;

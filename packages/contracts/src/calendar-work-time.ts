import { z } from 'zod';

/** Workspace-local work-time intent. UTC occupancy requires a date/timezone at the server boundary. */
export const calendarWorkTimeSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Choose a planned start time.'),
  durationMinutes: z.number().int().min(15).max(480),
}).strict().refine(value => {
  const [hour, minute] = value.startTime.split(':').map(Number);
  return hour * 60 + minute + value.durationMinutes < 1440;
}, { message: 'Choose work times that finish on the same day.', path: ['durationMinutes'] });
export type CalendarWorkTime = z.infer<typeof calendarWorkTimeSchema>;

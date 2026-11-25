import { z } from 'zod';
import { calendarWeekdays } from './calendar-availability';
import { calendarBookingRulesSchema } from './calendar-booking';
import { workflowNotificationChannelsSchema } from './workflow-channels';
export const workflowBookingAssignmentModeSchema=z.enum(['assigned','qualified_if_unassigned']);

/** Shared setup/review values. The live workflow recipe union stays unchanged until execution is connected. */
export const workflowRoutineBookingValuesSchema = z.object({
  assignmentMode:workflowBookingAssignmentModeSchema.optional(),
  name: z.string().trim().min(1).max(120), service: z.string().min(1).max(200).refine(value => !!value.trim()),
  recipientId: z.string().min(1).max(200), notifications: workflowNotificationChannelsSchema,
  rules: calendarBookingRulesSchema,
}).strict().transform(value => ({ ...value, rules: { ...value.rules, weekdays: calendarWeekdays.filter(day => value.rules.weekdays.includes(day)) } }));
export type WorkflowRoutineBookingValues = z.infer<typeof workflowRoutineBookingValuesSchema>;

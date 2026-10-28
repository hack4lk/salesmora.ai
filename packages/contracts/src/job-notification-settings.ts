import { z } from 'zod';
export const defaultDeadlineRuleSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('unset') }).strict(),
  z.object({ mode: z.literal('relative'), days: z.number().int().min(1).max(365), count: z.enum(['business', 'calendar']) }).strict(),
]);
export const deadlineReminderRuleSchema = z.object({
  sendTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  offsets: z.array(z.object({ id: z.string().min(1).max(64).regex(/^[a-zA-Z0-9-]+$/), relative: z.enum(['before', 'on', 'after']), days: z.number().int().min(0).max(365) }).strict()).min(1).max(5),
  extraRecipientIds: z.array(z.string().min(1).max(128)).max(500),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.offsets.map(r => r.id)).size !== value.offsets.length || new Set(value.offsets.map(r => `${r.relative}:${r.days}`)).size !== value.offsets.length || new Set(value.extraRecipientIds).size !== value.extraRecipientIds.length || value.offsets.some(r => r.relative === 'on' ? r.days !== 0 : r.days < 1))
    ctx.addIssue({ code: 'custom', message: 'Reminder timings and recipients must be distinct and valid.' });
});
export const jobEventEmailRulesSchema = z.object({ created: z.boolean(), status: z.boolean(), assignment: z.boolean(), schedule: z.boolean(), deadline: z.boolean(), approaching: z.boolean(), overdue: z.boolean() }).strict();
export const jobNotificationSectionSchema = z.enum(['deadline', 'reminders', 'events']);
const command = { workspaceId: z.string().uuid(), submissionId: z.string().uuid(), revision: z.string().regex(/^(0|[1-9]\d{0,8})$/) };
export const saveJobNotificationSettingsSchema = z.discriminatedUnion('section', [
  z.object({ ...command, section: z.literal('deadline'), values: defaultDeadlineRuleSchema }).strict(),
  z.object({ ...command, section: z.literal('reminders'), values: deadlineReminderRuleSchema }).strict(),
  z.object({ ...command, section: z.literal('events'), values: jobEventEmailRulesSchema }).strict(),
]);
export const jobNotificationSettingsSnapshotSchema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), plan: z.enum(['free', 'standard', 'premium']), timezone: z.string(), canManage: z.boolean(), activation: z.literal('reminders-active'),
  members: z.array(z.object({ id: z.string(), name: z.string() })),
  deadline: z.object({ revision: z.string(), values: defaultDeadlineRuleSchema }),
  reminders: z.object({ revision: z.string(), values: deadlineReminderRuleSchema }),
  events: z.object({ revision: z.string(), values: jobEventEmailRulesSchema }),
});
export type JobNotificationSection = z.infer<typeof jobNotificationSectionSchema>;
export type SaveJobNotificationSettings = z.infer<typeof saveJobNotificationSettingsSchema>;
export type JobNotificationSettingsSnapshot = z.infer<typeof jobNotificationSettingsSnapshotSchema>;

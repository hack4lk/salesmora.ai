import { z } from 'zod';

export const defaultPostJobMessage = 'Thank you for choosing us. We appreciate the opportunity to help.';
export const postJobReviewUrlSchema = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS external review link without a username or password, or leave it blank.');
export const postJobRulesSchema = z.object({
  calendarDays: z.number().int().min(1).max(30), reviewUrl: postJobReviewUrlSchema,
  messageChoice: z.enum(['default', 'custom']).nullable(), thankYouMessage: z.string().trim().min(1).max(2000),
}).strict();
export const postJobPrepareRulesSchema = z.object({
  calendarDays: z.number().int().min(1).max(30).nullish(), reviewUrl: postJobReviewUrlSchema.nullish(),
  messageChoice: z.enum(['default','custom']).nullish(), thankYouMessage: z.string().trim().min(1).max(2000).nullish(),
}).strict();
export const postJobValuesSchema = postJobRulesSchema.extend({
  name: z.string().trim().min(1).max(120), localTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  messageChoice: z.enum(['default', 'custom']),
}).strict();
export type PostJobValues = z.infer<typeof postJobValuesSchema>;

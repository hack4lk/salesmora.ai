import { z } from 'zod';
import { workflowChannelChoicesSchema } from './workflow-channels';
export const annualReviewDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Choose a valid review date.');
export const annualReviewRulesSchema = z.object({ firstReviewDate: annualReviewDateSchema }).strict();
export const annualReviewValuesSchema = z.object({ name: z.string().trim().min(1).max(120), service: z.string().min(1).max(200),
  rules: annualReviewRulesSchema, recipientId: z.string().min(1), localTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), notifications: workflowChannelChoicesSchema }).strict();
export type AnnualReviewValues = z.infer<typeof annualReviewValuesSchema>;

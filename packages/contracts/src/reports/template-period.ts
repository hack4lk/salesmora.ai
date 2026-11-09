import { z } from 'zod';
import { jobDateSchema } from '../job';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
export const reportTemplatePeriodSchema = z.discriminatedUnion('preset', [
  z.object({ preset: z.literal('last30days') }).strict(),
  z.object({ preset: z.literal('next7days') }).strict(),
  z.object({ preset: z.literal('custom'), from: date, to: date }).strict()
    .refine(value => value.from <= value.to &&
      (Date.parse(`${value.to}T12:00:00Z`) - Date.parse(`${value.from}T12:00:00Z`)) / 86400000 < 366),
]);
export type ReportTemplatePeriod = z.infer<typeof reportTemplatePeriodSchema>;

import { z } from 'zod';
import { jobDateSchema } from '../job';
import { reportTemplateAreaSchema } from './template';

const text = z.string().trim().min(1).max(4000);
const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const value = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('count'), value: count }).strict(),
  z.object({ kind: z.literal('formatted'), displayValue: text }).strict(),
  z.object({ kind: z.literal('incomplete'), displayValue: text, coverageLabel: text }).strict(),
  z.object({ kind: z.literal('unavailable'), reason: text }).strict(),
]);
const metric = z.object({ id: text, label: text, value }).strict();
const section = z.object({
  id: text,
  label: text,
  scopeLabel: text,
  basisLabel: text,
  asOf: z.iso.datetime(),
  metrics: z.array(metric).min(1).max(6).refine(items => new Set(items.map(item => item.id)).size === items.length),
}).strict();

/** Presentation snapshot only; server evidence/query binding belongs to the chat integration. */
export const reportAssistantResultSchema = z.object({
  id: text,
  area: reportTemplateAreaSchema,
  timezone: text.refine(value => {
    try { new Intl.DateTimeFormat('en-GB', { timeZone: value }); return true; }
    catch (error) { if (!(error instanceof RangeError)) throw error; return false; }
  }),
  period: z.object({ from: date, to: date }).strict().refine(value => value.from <= value.to).nullable(),
  filterLabels: z.array(text).max(12),
  sections: z.array(section).min(1).max(12).refine(items => new Set(items.map(item => item.id)).size === items.length),
  coverage: z.array(text).min(1).max(6),
}).strict();
export type ReportAssistantResult = z.infer<typeof reportAssistantResultSchema>;

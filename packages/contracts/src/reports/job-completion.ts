import { z } from 'zod';
import { jobDateSchema, jobStatuses } from '../job';
import { jobPeriodFiltersSchema } from './job-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const elapsedDays = (from: string, to: string) =>
  (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
const validPeriod = (from: string, to: string) => from <= to && elapsedDays(from, to) < 366;

export const jobCompletionQuerySchema = z.object({
  workspaceId: z.uuid(),
  view: z.literal('completion'),
  period: z.object({ from: date, to: date }).strict(),
  filters: jobPeriodFiltersSchema.default({ statuses: [], owners: [], services: [] }),
  selectedDate: date.optional(),
  page: page.default(1),
  pageSize: pageSize.default(25),
}).strict().superRefine((query, context) => {
  if (!validPeriod(query.period.from, query.period.to) ||
    (query.selectedDate !== undefined &&
      (query.selectedDate < query.period.from || query.selectedDate > query.period.to))) {
    context.addIssue({ code: 'custom', message: 'Choose a completion period of at most 366 dates and a day within it.' });
  }
});
export type JobCompletionQuery = z.infer<typeof jobCompletionQuerySchema>;

export const jobCompletionResultSchema = z.object({
  view: z.literal('completion'),
  asOf: z.iso.datetime(),
  from: date,
  to: date,
  timezone: z.string().trim().min(1),
  scopeLabel: z.string().trim().min(1),
  filters: jobPeriodFiltersSchema,
  total: count,
  coverage: z.object({ kind: z.literal('complete') }).strict(),
  days: z.array(z.object({ date, count, evidenceId: z.string().min(1) }).strict()).max(366),
  duration: z.object({
    sampleSize: count,
    totalElapsedDays: count,
    averageElapsedDays: z.number().nonnegative().nullable(),
  }).strict(),
  evidenceId: z.string().min(1),
  selectedDate: date.optional(),
  page,
  pageSize,
  evidenceTotal: count,
  rows: z.array(z.object({
    id: z.uuid(),
    recordId: z.uuid(),
    label: z.string().trim().min(1),
    createdDate: date,
    completionDate: date,
    cells: z.object({
      status: z.enum(jobStatuses),
      owner: z.string().trim().min(1),
    }).strict(),
  }).strict()).max(100),
}).strict().superRefine((result, context) => {
  const { sampleSize, totalElapsedDays, averageElapsedDays } = result.duration;
  const selected = result.selectedDate === undefined
    ? undefined : result.days.find(day => day.date === result.selectedDate);
  const selectedTotal = result.selectedDate === undefined ? result.total : selected?.count;
  const expectedRows = Math.min(
    result.pageSize,
    Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize),
  );
  const trendTotal = result.days.reduce((sum, day) => sum + day.count, 0);
  const rowElapsed = result.rows.map(row => elapsedDays(row.createdDate, row.completionDate));
  const observedElapsed = rowElapsed.reduce((sum, days) => sum + days, 0);
  const evidenceIds = [result.evidenceId, ...result.days.map(day => day.evidenceId)];
  const completePage = result.selectedDate === undefined && result.rows.length === result.total;
  const valid = validPeriod(result.from, result.to) &&
    result.days.length === elapsedDays(result.from, result.to) + 1 &&
    result.days.every((day, index) => elapsedDays(result.from, day.date) === index) &&
    Number.isSafeInteger(trendTotal) && trendTotal === result.total &&
    sampleSize === result.total &&
    (sampleSize === 0
      ? totalElapsedDays === 0 && averageElapsedDays === null
      : averageElapsedDays === totalElapsedDays / sampleSize) &&
    selectedTotal === result.evidenceTotal &&
    result.page <= Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) &&
    result.rows.length === expectedRows &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    new Set(evidenceIds).size === evidenceIds.length &&
    result.rows.every((row, index) => row.id === row.recordId &&
      (result.filters.statuses.length === 0 || result.filters.statuses.includes(row.cells.status)) &&
      Number.isSafeInteger(rowElapsed[index]) && rowElapsed[index] >= 0 &&
      row.completionDate >= result.from && row.completionDate <= result.to &&
      (result.selectedDate === undefined || row.completionDate === result.selectedDate)) &&
    Number.isSafeInteger(observedElapsed) && observedElapsed <= totalElapsedDays &&
    result.days.every(day => result.rows.filter(row => row.completionDate === day.date).length <= day.count) &&
    (!completePage || (observedElapsed === totalElapsedDays &&
      result.days.every(day => result.rows.filter(row => row.completionDate === day.date).length === day.count)));
  if (!valid) context.addIssue({ code: 'custom', message: 'Job completion evidence and elapsed-day coverage do not reconcile.' });
});
export type JobCompletionResult = z.infer<typeof jobCompletionResultSchema>;

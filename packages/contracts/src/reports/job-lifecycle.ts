import { z } from 'zod';
import { jobDateSchema, jobStatuses } from '../job';
import { jobPeriodFiltersSchema } from './job-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const views = ['created', 'completed', 'canceled', 'reopened'] as const;
const period = z.object({ from: date, to: date }).strict()
  .refine(value => value.from <= value.to);

function daysInPeriod(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 + 1;
}

export const jobLifecycleQuerySchema = z.object({
  workspaceId: z.uuid(),
  view: z.literal('lifecycle'),
  period,
  filters: jobPeriodFiltersSchema.default({ statuses: [], owners: [], services: [] }),
  selectedView: z.enum(views),
  page: page.default(1),
  pageSize: pageSize.default(25),
}).strict().superRefine((query, issueContext) => {
  if (daysInPeriod(query.period.from, query.period.to) > 366) {
    issueContext.addIssue({ code: 'custom', message: 'Job lifecycle periods are limited to 366 dates.' });
  }
});
export type JobLifecycleQuery = z.infer<typeof jobLifecycleQuerySchema>;

const coverage = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('complete') }).strict(),
  z.object({ kind: z.literal('partial'), explanation: z.string().trim().min(1) }).strict(),
]);
const row = z.object({
  id: z.uuid(),
  recordId: z.uuid(),
  label: z.string().trim().min(1),
  cells: z.object({
    date: date,
    status: z.enum(jobStatuses),
    owner: z.string().trim().min(1),
    service: z.string().trim().min(1),
  }).strict(),
}).strict();

export const jobLifecycleResultSchema = z.object({
  view: z.literal('lifecycle'),
  asOf: z.iso.datetime(),
  from: date,
  to: date,
  timezone: z.string().trim().min(1),
  scopeLabel: z.string().trim().min(1),
  filters: jobPeriodFiltersSchema,
  counts: z.object({
    created: count,
    completed: count,
    canceled: count,
    reopened: count,
  }).strict(),
  coverage: z.object({
    created: coverage,
    completed: coverage,
    canceled: coverage,
    reopened: coverage,
  }).strict(),
  evidenceIds: z.object({
    created: z.string().trim().min(1),
    completed: z.string().trim().min(1),
    canceled: z.string().trim().min(1),
    reopened: z.string().trim().min(1),
  }).strict(),
  selectedView: z.enum(views),
  page,
  pageSize,
  evidenceTotal: count,
  rows: z.array(row),
}).strict().superRefine((result, issueContext) => {
  const expectedRows = Math.min(
    result.pageSize,
    Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize),
  );
  const validRange = result.from <= result.to && daysInPeriod(result.from, result.to) <= 366;
  const selectedTotal = result.counts[result.selectedView];
  if (!validRange || selectedTotal !== result.evidenceTotal ||
    result.page > Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) ||
    result.rows.length !== expectedRows ||
    new Set(result.rows.map(item => item.id)).size !== result.rows.length ||
    result.rows.some(item => item.id !== item.recordId ||
      item.cells.date < result.from || item.cells.date > result.to ||
      (result.filters.statuses.length > 0 && !result.filters.statuses.includes(item.cells.status)))) {
    issueContext.addIssue({ code: 'custom', message: 'Job lifecycle evidence does not reconcile.' });
  }
});
export type JobLifecycleResult = z.infer<typeof jobLifecycleResultSchema>;

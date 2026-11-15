import { z } from 'zod';
import { jobDateSchema } from '../job';
import { estimateDecisionsQuerySchema } from './estimate-decisions';
import { estimateReportFiltersSchema, estimateReportAttributionShape, estimateAttributionMatches } from './estimate-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const positive = count.refine(value => value > 0);
const page = estimateDecisionsQuerySchema.shape.page;
const pageSize = estimateDecisionsQuerySchema.shape.pageSize;
export const estimateFirstQuotedQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('estimate-first-quoted'),
  period: estimateDecisionsQuerySchema.shape.period, page, pageSize,
  filters: estimateReportFiltersSchema.default({ owners: [], parents: [] }),
}).strict();
export type EstimateFirstQuotedQuery = z.infer<typeof estimateFirstQuotedQuerySchema>;
export const estimateFirstQuotedResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('estimate-first-quoted'), asOf: z.iso.datetime(),
  from: date, to: date, today: date, timezone: z.string().trim().min(1),
  scope: z.enum(['workspace', 'assigned_job']), scopeLabel: z.string().trim().min(1),
  archiveVisibility: z.enum(['included', 'excluded']),
  filters: estimateReportFiltersSchema,
  total: count, page: z.number().int().min(1).max(100000),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]),
  coverage: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('complete') }).strict(),
    z.object({ kind: z.literal('partial'), explanation: z.string().trim().min(1) }).strict(),
  ]),
  rows: z.array(z.object({
    ...estimateReportAttributionShape,
    familyId: z.string().trim().min(1), estimateNumber: z.string().trim().min(1),
    label: z.string().trim().min(1), recordId: z.uuid(),
    firstIssuedDate: date, firstIssuedRevision: positive, firstIssuedVia: z.enum(['send', 'publish']),
    currentIssuedRevision: positive, currentIssuedDate: date,
    currentStatus: z.enum(['sent', 'published', 'accepted', 'declined', 'expired', 'void']),
    archived: z.boolean(),
  }).strict()).max(100),
}).strict().superRefine((result, context) => {
  const valid = estimateDecisionsQuerySchema.shape.period.safeParse({ from: result.from, to: result.to }).success &&
    result.to <= result.today &&
    result.page <= Math.max(1, Math.ceil(result.total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.familyId)).size === result.rows.length &&
    new Set(result.rows.map(row => row.recordId)).size === result.rows.length &&
    result.rows.every(row => row.familyId === `${result.workspaceId}:${row.estimateNumber}` &&
      estimateAttributionMatches(row, result.filters) &&
      (result.archiveVisibility === 'included' || !row.archived) &&
      row.firstIssuedRevision <= row.currentIssuedRevision &&
      row.firstIssuedDate >= result.from && row.firstIssuedDate <= result.to &&
      row.currentIssuedDate >= row.firstIssuedDate && row.currentIssuedDate <= result.today &&
      (row.firstIssuedRevision !== row.currentIssuedRevision || row.firstIssuedDate === row.currentIssuedDate));
  if (!valid) context.addIssue({ code: 'custom', message: 'First-quoted families and issuance evidence do not reconcile.' });
});
export type EstimateFirstQuotedResult = z.infer<typeof estimateFirstQuotedResultSchema>;

import { z } from 'zod';
import { jobDateSchema } from '../job';
import { estimateDecisionsResultSchema } from './estimate-decisions';
import { estimateReportFiltersSchema, estimateReportAttributionShape, estimateAttributionMatches } from './estimate-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const selected = z.enum(['awaiting', 'expired', 'handoff']);
export const estimateCurrentQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('estimate-current'), selected,
  filters: estimateReportFiltersSchema.default({ owners: [], parents: [] }),
  page: page.default(1), pageSize: pageSize.default(25),
}).strict();
export type EstimateCurrentQuery = z.infer<typeof estimateCurrentQuerySchema>;
const rowFields = {
  ...estimateReportAttributionShape,
  familyId: z.string().trim().min(1), recordId: z.uuid(), estimateNumber: z.string().trim().min(1),
  revision: z.number().int().positive(), label: z.string().trim().min(1), issuedDate: date,
  validUntil: date.nullable(), archived: z.literal(false),
  money: estimateDecisionsResultSchema.shape.rows.element.shape.money,
};
export const estimateCurrentResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('estimate-current'), today: date, asOf: z.iso.datetime(),
  timezone: z.string().trim().min(1), scope: z.enum(['workspace', 'assigned_job']), scopeLabel: z.string().trim().min(1),
  filters: estimateReportFiltersSchema,
  counts: z.object({ awaiting: count, expired: count }).strict(),
  awaitingMoney: estimateDecisionsResultSchema.shape.money,
  handoff: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), count }).strict(),
    z.object({ kind: z.literal('unavailable'), explanation: z.string().trim().min(1) }).strict(),
  ]),
  selected, page, pageSize, evidenceTotal: count,
  rows: z.array(z.discriminatedUnion('status', [
    z.object({ ...rowFields, status: z.enum(['sent', 'published']) }).strict(),
    z.object({ ...rowFields, status: z.literal('accepted'), decisionDate: date,
      parentType: z.literal('lead'), leadArchived: z.literal(false), linkage: z.literal('confirmed-absent'),
    }).strict(),
  ])).max(100),
}).strict().superRefine((result, context) => {
  const total = result.selected === 'handoff'
    ? result.handoff.kind === 'available' ? result.handoff.count : 0
    : result.counts[result.selected];
  const observed = result.selected === 'awaiting' ? result.rows : [];
  const sums = observed.reduce((sum, row) => row.money.kind === 'available'
    ? { preTax: sum.preTax + row.money.preTaxCents, total: sum.total + row.money.customerTotalCents } : sum,
  { preTax: 0, total: 0 });
  const valid = Number.isSafeInteger(result.counts.awaiting + result.counts.expired) &&
    (result.scope !== 'assigned_job' || result.handoff.kind === 'unavailable') &&
    result.evidenceTotal === total &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.familyId)).size === result.rows.length &&
    new Set(result.rows.map(row => row.recordId)).size === result.rows.length &&
    result.rows.every(row => row.familyId === `${result.workspaceId}:${row.estimateNumber}` &&
      estimateAttributionMatches(row, result.filters) &&
      row.issuedDate <= result.today &&
      (result.selected === 'handoff' ? row.status === 'accepted' &&
        row.decisionDate >= row.issuedDate && row.decisionDate <= result.today
        : row.status !== 'accepted' && (result.selected === 'expired'
          ? row.validUntil !== null && row.validUntil < result.today
          : row.validUntil === null || row.validUntil >= result.today))) &&
    (result.awaitingMoney.kind === 'unavailable' ||
      observed.every(row => row.money.kind === 'available') &&
      Number.isSafeInteger(sums.preTax) && Number.isSafeInteger(sums.total) &&
      sums.preTax <= result.awaitingMoney.preTaxCents && sums.total <= result.awaitingMoney.customerTotalCents &&
      (observed.length !== result.counts.awaiting ||
        sums.preTax === result.awaitingMoney.preTaxCents && sums.total === result.awaitingMoney.customerTotalCents));
  if (!valid) context.addIssue({ code: 'custom', message: 'Current Estimate queues and frozen values do not reconcile.' });
});
export type EstimateCurrentResult = z.infer<typeof estimateCurrentResultSchema>;

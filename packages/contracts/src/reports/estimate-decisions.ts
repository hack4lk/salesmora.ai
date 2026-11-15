import { z } from 'zod';
import { jobDateSchema } from '../job';
import { estimateReportFiltersSchema, estimateReportAttributionShape, estimateAttributionMatches } from './estimate-filters';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const positive = count.refine(value => value > 0);
const selected = z.enum(['accepted', 'declined', 'decided']);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const period = z.object({ from: date, to: date }).strict().refine(value =>
  value.from <= value.to &&
  (Date.parse(`${value.to}T00:00:00Z`) - Date.parse(`${value.from}T00:00:00Z`)) / 86_400_000 < 366);
const unavailable = z.object({ kind: z.literal('unavailable'), explanation: z.string().trim().min(1) }).strict();
const availableMoney = z.object({
  kind: z.literal('available'), preTaxCents: count, taxCents: count, customerTotalCents: count,
}).strict().refine(value => Number.isSafeInteger(value.preTaxCents + value.taxCents) &&
  value.preTaxCents + value.taxCents === value.customerTotalCents);
const money = z.union([availableMoney, unavailable]);
const totalMoney = z.union([
  z.object({ kind: z.literal('available'), preTaxCents: count, customerTotalCents: count }).strict()
    .refine(value => value.preTaxCents <= value.customerTotalCents),
  unavailable,
]);
export const estimateDecisionsQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('estimate-decisions'), period, selected,
  filters: estimateReportFiltersSchema.default({ owners: [], parents: [] }),
  page: page.default(1), pageSize: pageSize.default(25),
}).strict();
export type EstimateDecisionsQuery = z.infer<typeof estimateDecisionsQuerySchema>;

export const estimateDecisionsResultSchema = z.object({
  view: z.literal('estimate-decisions'), workspaceId: z.uuid(), asOf: z.iso.datetime(),
  from: date, to: date, timezone: z.string().trim().min(1), scopeLabel: z.string().trim().min(1),
  scope: z.enum(['workspace', 'assigned_job']),
  archiveVisibility: z.enum(['included', 'excluded']),
  filters: estimateReportFiltersSchema,
  counts: z.object({ accepted: count, declined: count }).strict(),
  money: totalMoney, selected, page, pageSize, evidenceTotal: count,
  rows: z.array(z.object({
    ...estimateReportAttributionShape,
    familyId: z.string().trim().min(1), recordId: z.uuid(), estimateNumber: z.string().trim().min(1),
    revision: positive, decisionVersion: positive, label: z.string().trim().min(1),
    outcome: z.enum(['accepted', 'declined']), decisionDate: date, recordedDate: date,
    archived: z.boolean(), money,
  }).strict()).max(100),
}).strict().superRefine((result, context) => {
  const decided = result.counts.accepted + result.counts.declined;
  const total = result.selected === 'decided' ? decided : result.counts[result.selected];
  const accepted = result.rows.filter(row => row.outcome === 'accepted');
  const amounts = accepted.reduce((sum, row) => row.money.kind === 'available'
    ? { preTax: sum.preTax + row.money.preTaxCents, total: sum.total + row.money.customerTotalCents } : sum,
  { preTax: 0, total: 0 });
  const valid = period.safeParse({ from: result.from, to: result.to }).success &&
    Number.isSafeInteger(decided) && total === result.evidenceTotal &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.familyId)).size === result.rows.length &&
    new Set(result.rows.map(row => row.recordId)).size === result.rows.length &&
    result.rows.every(row => row.familyId === `${result.workspaceId}:${row.estimateNumber}` &&
      estimateAttributionMatches(row, result.filters) &&
      (result.archiveVisibility === 'included' || !row.archived) &&
      (result.selected === 'decided' || row.outcome === result.selected) &&
      row.decisionDate >= result.from && row.decisionDate <= result.to) &&
    (['accepted', 'declined'] as const).every(outcome => {
      const observed = result.rows.filter(row => row.outcome === outcome).length;
      return observed <= result.counts[outcome] && result.counts[outcome] - observed <= decided - result.rows.length;
    }) &&
    (result.money.kind === 'unavailable' ||
      accepted.every(row => row.money.kind === 'available') &&
      Number.isSafeInteger(amounts.preTax) && Number.isSafeInteger(amounts.total) &&
      amounts.preTax <= result.money.preTaxCents && amounts.total <= result.money.customerTotalCents &&
      (accepted.length !== result.counts.accepted ||
        amounts.preTax === result.money.preTaxCents && amounts.total === result.money.customerTotalCents));
  if (!valid) context.addIssue({ code: 'custom', message: 'Estimate decisions and frozen values do not reconcile.' });
});
export type EstimateDecisionsResult = z.infer<typeof estimateDecisionsResultSchema>;

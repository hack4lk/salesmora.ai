import { z } from 'zod';
import { leadSources } from '../lead-read';
import { jobDateSchema } from '../job';

const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1);
const source = z.enum(leadSources);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const period = z.object({ from: date, to: date }).strict().refine(value =>
  value.from <= value.to && (Date.parse(`${value.to}T00:00:00Z`) - Date.parse(`${value.from}T00:00:00Z`)) / 86_400_000 < 366);
export const leadSourceQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('lead-source'), period,
  selected: z.enum(['cohort', 'converted', 'accepted-estimates']), page: page.default(1), pageSize: pageSize.default(25),
}).strict();
export type LeadSourceQuery = z.infer<typeof leadSourceQuerySchema>;
const cohortRow = z.object({
  id: z.uuid(), recordId: z.uuid(), label: text, createdDate: date, source, archived: z.boolean(),
}).strict();
export const leadSourceResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('lead-source'), from: date, to: date, today: date,
  timezone: text, asOf: z.iso.datetime(), scopeLabel: text,
  scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded']),
  cohort: count,
  conversion: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), converted: count }).strict(),
    z.object({ kind: z.literal('unavailable'), explanation: text }).strict(),
  ]),
  acceptedValue: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('unavailable'), reason: z.enum(['implementation-pending', 'permissions', 'invalid-money']), explanation: text,
    }).strict(),
    z.object({
      kind: z.literal('available'), preTaxCents: count, estimateCount: count,
      unattributedPreTaxCents: count, unattributedCount: count,
    }).strict(),
  ]),
  groups: z.array(z.object({
    source, cohort: count, converted: count.nullable(),
    acceptedEstimateCount: count.nullable(), acceptedValueCents: count.nullable(),
  }).strict()).length(leadSources.length),
  evidence: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('cohort'), rows: z.array(cohortRow).max(100) }).strict(),
    z.object({ kind: z.literal('converted'), rows: z.array(cohortRow.extend({ linkedJobs: text })).max(100) }).strict(),
    z.object({ kind: z.literal('accepted-estimates'), rows: z.array(z.object({
      familyId: text, recordId: z.uuid(), estimateNumber: text.regex(/^EST-\d{4,}$/), revision: count.refine(value => value > 0),
      decisionVersion: count.refine(value => value > 0), label: text, acceptedDate: date, preTaxCents: count,
      source: source.nullable(), linkedLead: z.object({ recordId: z.uuid(), label: text }).strict().optional(),
    }).strict()).max(100) }).strict(),
  ]),
  page, pageSize, evidenceTotal: count,
}).strict().superRefine((result, context) => {
  const { conversion, evidence, groups, acceptedValue } = result;
  const total = evidence.kind === 'cohort' ? result.cohort : evidence.kind === 'converted'
    ? conversion.kind === 'available' ? conversion.converted : -1
    : acceptedValue.kind === 'available' ? acceptedValue.estimateCount : -1;
  const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
  const observed = new Map(leadSources.map(source => [source, evidence.rows.filter(row => row.source === source).length]));
  const full = evidence.rows.length === total;
  let valid = period.safeParse({ from: result.from, to: result.to }).success && result.to <= result.today &&
    new Set(groups.map(group => group.source)).size === leadSources.length &&
    sum(groups.map(group => group.cohort)) === result.cohort &&
    (conversion.kind === 'unavailable'
      ? groups.every(group => group.converted === null) && evidence.kind !== 'converted'
      : result.scope === 'workspace' && result.archiveVisibility === 'included' && conversion.converted <= result.cohort &&
        groups.every(group => group.converted !== null && group.converted <= group.cohort) &&
        sum(groups.map(group => group.converted!)) === conversion.converted) &&
    total === result.evidenceTotal && result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    evidence.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    (acceptedValue.kind === 'unavailable'
      ? evidence.kind !== 'accepted-estimates' && groups.every(group => group.acceptedEstimateCount === null && group.acceptedValueCents === null)
      : conversion.kind === 'available' && groups.every(group =>
        group.acceptedEstimateCount !== null && group.acceptedValueCents !== null &&
        (group.cohort > 0 || group.acceptedEstimateCount === 0 && group.acceptedValueCents === 0) &&
        (group.acceptedEstimateCount > 0 || group.acceptedValueCents === 0)) &&
        sum(groups.map(group => group.acceptedEstimateCount!)) + acceptedValue.unattributedCount === acceptedValue.estimateCount &&
        sum(groups.map(group => group.acceptedValueCents!)) + acceptedValue.unattributedPreTaxCents === acceptedValue.preTaxCents &&
        (acceptedValue.estimateCount > 0 || acceptedValue.preTaxCents === 0) &&
        (result.cohort > 0 || acceptedValue.estimateCount === 0) &&
        (acceptedValue.unattributedCount > 0 || acceptedValue.unattributedPreTaxCents === 0));
  if (evidence.kind !== 'accepted-estimates') {
    valid &&= new Set(evidence.rows.map(row => row.id)).size === evidence.rows.length &&
      evidence.rows.every(row => row.id === row.recordId && row.createdDate >= result.from && row.createdDate <= result.to &&
        (result.archiveVisibility === 'included' || !row.archived)) && groups.every(group => {
      const expected = evidence.kind === 'cohort' ? group.cohort : group.converted;
      const actual = observed.get(group.source)!;
      return expected !== null && actual <= expected && (full ? actual === expected : expected - actual <= total - evidence.rows.length);
    });
  } else if (acceptedValue.kind === 'available') {
    valid &&= new Set(evidence.rows.map(row => row.familyId)).size === evidence.rows.length &&
      new Set(evidence.rows.map(row => row.recordId)).size === evidence.rows.length &&
      evidence.rows.every(row => row.acceptedDate <= result.today &&
        row.familyId === `${result.workspaceId}:${row.estimateNumber}` &&
        (row.source === null ? row.linkedLead === undefined : row.linkedLead !== undefined));
    for (const currentSource of [...leadSources, null]) {
      const rows = evidence.rows.filter(row => row.source === currentSource);
      const group = groups.find(group => group.source === currentSource);
      const expectedCount = currentSource === null ? acceptedValue.unattributedCount : group!.acceptedEstimateCount!;
      const expectedValue = currentSource === null ? acceptedValue.unattributedPreTaxCents : group!.acceptedValueCents!;
      const value = sum(rows.map(row => row.preTaxCents));
      valid &&= rows.length <= expectedCount && value <= expectedValue &&
        expectedCount - rows.length <= total - evidence.rows.length &&
        (!full || rows.length === expectedCount && value === expectedValue);
    }
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Lead-source cohort, conversion, source groups and evidence do not reconcile.' });
});
export type LeadSourceResult = z.infer<typeof leadSourceResultSchema>;

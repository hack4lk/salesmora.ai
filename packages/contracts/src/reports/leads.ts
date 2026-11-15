import { z } from 'zod';
import { leadSources, leadStages } from '../lead-read';

const date = z.iso.date().refine(value => !value.startsWith('0000'));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const openLeadStages = ['new', 'contacted', 'estimate-sent'] as const;
const ownerFilter = z.array(z.string().trim().min(1).max(200).refine(value => !/[\u0000-\u001f\u007f]/.test(value)))
  .max(50).refine(values => new Set(values).size === values.length);
const filters = z.object({
  stages: z.array(z.enum(leadStages)).max(5).refine(values => new Set(values).size === values.length),
  owners: ownerFilter,
  sources: z.array(z.enum(leadSources)).max(5).refine(values => new Set(values).size === values.length),
}).strict();
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const base = z.object({ workspaceId: z.uuid(), filters, page, pageSize }).strict();
const period = z.object({ from: date, to: date }).strict()
  .refine(value => value.from <= value.to);

export const leadReportQuerySchema = z.discriminatedUnion('view', [
  base.extend({
    view: z.literal('intake'),
    period,
    trendBucket: date.optional(),
    currentFilters: filters,
  }).strict(),
  base.extend({
    view: z.enum(['won', 'lost']),
    period,
  }).strict(),
  base.extend({
    view: z.enum(['pipeline', 'age']),
    selection: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('pipeline') }).strict(),
      z.object({ kind: z.literal('stage'), stage: z.enum(openLeadStages) }).strict(),
      z.object({ kind: z.literal('age'), band: z.enum(['0-7', '8-14', '15-30', '31+']) }).strict(),
    ]),
  }).strict(),
  base.extend({
    view: z.literal('attention'),
    selection: z.enum(['inactive', 'unowned', 'combined']),
  }).strict(),
]);
export type LeadReportQuery = z.infer<typeof leadReportQuerySchema>;

const evidence = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  recordId: z.string().min(1),
  cells: z.record(z.string(), z.string()),
}).strict();
const context = z.object({
  asOf: z.iso.datetime(),
  today: date,
  timezone: z.string().min(1),
  scopeLabel: z.string().min(1),
  archiveVisibility: z.enum(['included', 'excluded']),
}).strict();
const pagination = z.object({
  page: page,
  pageSize,
  evidenceTotal: count,
}).strict();
const stageCounts = z.object({
  new: count,
  contacted: count,
  'estimate-sent': count,
}).strict();
const ageCounts = z.object({
  '0-7': count,
  '8-14': count,
  '15-30': count,
  '31+': count,
}).strict();
const outcomeCounts = z.object({ won: count, lost: count }).strict();
const attentionCounts = z.object({ inactive: count, unowned: count, combined: count }).strict();

const rawLeadReportResultSchema = z.discriminatedUnion('view', [
  context.extend({
    view: z.literal('intake'),
    from: date,
    to: date,
    total: count,
    sources: z.array(z.object({ source: z.enum(leadSources), count }).strict()),
    trend: z.array(z.object({ date, count }).strict()),
    currentOpenLeads: count,
    ...pagination.shape,
    rows: z.array(evidence),
  }).strict(),
  context.extend({
    view: z.enum(['won', 'lost']),
    from: date,
    to: date,
    counts: outcomeCounts,
    coverage: z.object({ kind: z.literal('partial'), explanation: z.string().min(1) }).strict(),
    ...pagination.shape,
    rows: z.array(evidence),
  }).strict(),
  context.extend({
    view: z.enum(['pipeline', 'age']),
    total: count,
    stages: stageCounts,
    ages: ageCounts,
    selection: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('pipeline') }).strict(),
      z.object({ kind: z.literal('stage'), stage: z.enum(openLeadStages) }).strict(),
      z.object({ kind: z.literal('age'), band: z.enum(['0-7', '8-14', '15-30', '31+']) }).strict(),
    ]),
    ...pagination.shape,
    rows: z.array(evidence),
  }).strict(),
  context.extend({
    view: z.literal('attention'),
    inactivityCutoff: z.iso.datetime(),
    counts: attentionCounts,
    selection: z.enum(['inactive', 'unowned', 'combined']),
    ...pagination.shape,
    rows: z.array(evidence),
  }).strict(),
]);

export const leadReportResultSchema = rawLeadReportResultSchema.superRefine((result, issueContext) => {
  const expectedRows = Math.min(
    result.pageSize,
    Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize),
  );
  const validPage = result.page <= Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) &&
    result.rows.length === expectedRows &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length;
  if (!validPage) issueContext.addIssue({ code: 'custom', message: 'Invalid lead report evidence page.' });
  if (result.view === 'intake') {
    const sources = result.sources.map(group => group.source);
    const sourceTotal = result.sources.reduce((sum, group) => sum + group.count, 0);
    const trendTotal = result.trend.reduce((sum, bucket) => sum + bucket.count, 0);
    if (sources.length !== leadSources.length || new Set(sources).size !== leadSources.length ||
      !leadSources.every(source => sources.includes(source)) || !Number.isSafeInteger(sourceTotal) ||
      sourceTotal !== result.total || trendTotal !== result.total ||
      result.evidenceTotal > result.total) {
      issueContext.addIssue({ code: 'custom', message: 'Lead intake totals do not reconcile.' });
    }
  } else if (result.view === 'pipeline' || result.view === 'age') {
    const stageTotal = Object.values(result.stages).reduce((sum, value) => sum + value, 0);
    const ageTotal = Object.values(result.ages).reduce((sum, value) => sum + value, 0);
    if (!Number.isSafeInteger(stageTotal) || !Number.isSafeInteger(ageTotal) ||
      stageTotal !== result.total || ageTotal !== result.total || result.evidenceTotal > result.total) {
      issueContext.addIssue({ code: 'custom', message: 'Lead pipeline totals do not reconcile.' });
    }
  } else if (result.view === 'won' || result.view === 'lost') {
    const selectedTotal = result.counts[result.view];
    if (result.evidenceTotal !== selectedTotal) {
      issueContext.addIssue({ code: 'custom', message: 'Lead outcome evidence does not reconcile.' });
    }
  } else if (result.view === 'attention') {
    if (result.counts.combined < Math.max(result.counts.inactive, result.counts.unowned) ||
      result.counts.combined > result.counts.inactive + result.counts.unowned ||
      result.evidenceTotal !== result.counts[result.selection]) {
      issueContext.addIssue({ code: 'custom', message: 'Lead attention totals do not reconcile.' });
    }
  }
});
export type LeadReportResult = z.infer<typeof leadReportResultSchema>;

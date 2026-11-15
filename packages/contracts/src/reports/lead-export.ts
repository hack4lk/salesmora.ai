import { z } from 'zod';
import { leadReportQuerySchema } from './leads';

const views = leadReportQuerySchema.options;
const exportQuery = z.discriminatedUnion('view', [
  views[0].omit({ page: true, pageSize: true }), views[1].omit({ page: true, pageSize: true }),
  views[2].omit({ page: true, pageSize: true }), views[3].omit({ page: true, pageSize: true }),
]);
export const leadReportExportDatasets = ['evidence', 'intake-days', 'intake-sources',
  'pipeline-stages', 'age-bands', 'outcomes', 'attention-categories'] as const;
export const leadReportExportInputSchema = z.object({
  query: exportQuery, dataset: z.enum(leadReportExportDatasets),
}).strict().superRefine(({ query, dataset }, context) => {
  const validDataset = dataset === 'evidence' ||
    query.view === 'intake' && ['intake-days', 'intake-sources'].includes(dataset) ||
    query.view === 'pipeline' && dataset === 'pipeline-stages' ||
    query.view === 'age' && dataset === 'age-bands' ||
    ['won', 'lost'].includes(query.view) && dataset === 'outcomes' ||
    query.view === 'attention' && dataset === 'attention-categories';
  const validPeriod = !('period' in query) || (
    Date.parse(`${query.period.to}T00:00:00Z`) - Date.parse(`${query.period.from}T00:00:00Z`)) / 86400000 < 366;
  const validBucket = query.view !== 'intake' || query.trendBucket === undefined || dataset === 'evidence' &&
    query.trendBucket >= query.period.from && query.trendBucket <= query.period.to;
  if (!validDataset || !validPeriod || !validBucket) context.addIssue({
    code: 'custom', message: 'Choose an applicable Leads report dataset and valid date selection.',
  });
});
export type LeadReportExportInput = z.infer<typeof leadReportExportInputSchema>;
const contextColumns = ['report_view', 'dataset', 'date_basis', 'period_from', 'period_to',
  'snapshot_at_utc', 'workspace_timezone', 'scope', 'archive_visibility', 'coverage'] as const;
const tableColumns = {
  'intake-days': ['local_date', 'lead_count'],
  'intake-sources': ['source', 'lead_count'],
  'pipeline-stages': ['stage', 'lead_count'],
  'age-bands': ['age_band', 'lead_count'],
  outcomes: ['outcome', 'lead_count'],
  'attention-categories': ['attention_category', 'lead_count', 'overlapping_categories'],
} as const;
const evidenceColumns = {
  intake: ['created', 'assignment', 'source', 'stage', 'activity', 'age'],
  pipeline: ['created', 'assignment', 'source', 'stage', 'activity', 'age'],
  age: ['created', 'assignment', 'source', 'stage', 'activity', 'age'],
  won: ['transition', 'assignment', 'source'],
  lost: ['transition', 'assignment', 'source'],
  attention: ['stage', 'owner', 'activity', 'reason'],
} as const;
export function leadReportExportColumns(input: LeadReportExportInput): string[] {
  return [...contextColumns, ...(input.dataset === 'evidence'
    ? ['lead_id', 'lead_label', ...evidenceColumns[input.query.view]]
    : tableColumns[input.dataset])];
}
export const leadReportExportPreviewSchema = z.object({
  input: leadReportExportInputSchema,
  workspaceId: z.uuid(), viewerId: z.string().trim().min(1).max(4000),
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded']),
  asOf: z.iso.datetime(), today: z.iso.date(), timezone: z.string().trim().min(1),
  dateBasis: z.enum(['creation-date', 'recorded-transition-date', 'current-snapshot']),
  coverage: z.string().trim().min(1).max(4000),
  count: z.number().int().nonnegative().refine(Number.isSafeInteger),
  limits: z.object({
    rows: z.number().int().positive().refine(Number.isSafeInteger),
    bytes: z.number().int().positive().refine(Number.isSafeInteger),
    durationMs: z.number().int().positive().refine(Number.isSafeInteger),
  }).strict(),
  columns: z.array(z.string().min(1)).min(1),
}).strict().superRefine((preview, context) => {
  const query = preview.input.query;
  const basis = query.view === 'intake' ? 'creation-date' : ['won', 'lost'].includes(query.view)
    ? 'recorded-transition-date' : 'current-snapshot';
  let valid = preview.workspaceId === query.workspaceId && preview.dateBasis === basis &&
    JSON.stringify(preview.columns) === JSON.stringify(leadReportExportColumns(preview.input)) &&
    (!('period' in query) || query.period.to <= preview.today);
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: preview.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(preview.asOf));
    valid &&= ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === preview.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Leads CSV preview columns, context and native clock do not match.' });
});
export type LeadReportExportPreview = z.infer<typeof leadReportExportPreviewSchema>;
/** Compact response-header context; the submitted input determines the fixed columns. */
export const leadReportExportGenerationSchema = z.object({
  id: z.uuid(), workspaceId: leadReportExportPreviewSchema.shape.workspaceId,
  policyRevision: leadReportExportPreviewSchema.shape.policyRevision,
  scope: leadReportExportPreviewSchema.shape.scope, archiveVisibility: leadReportExportPreviewSchema.shape.archiveVisibility,
  asOf: leadReportExportPreviewSchema.shape.asOf, today: leadReportExportPreviewSchema.shape.today,
  timezone: leadReportExportPreviewSchema.shape.timezone.max(100), dateBasis: leadReportExportPreviewSchema.shape.dateBasis,
  count: leadReportExportPreviewSchema.shape.count, limits: leadReportExportPreviewSchema.shape.limits,
}).strict().superRefine((generation, context) => {
  let valid = generation.count <= generation.limits.rows;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: generation.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(generation.asOf));
    valid &&= ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === generation.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Leads CSV generation count and native clock do not match.' });
});
export type LeadReportExportGeneration = z.infer<typeof leadReportExportGenerationSchema>;

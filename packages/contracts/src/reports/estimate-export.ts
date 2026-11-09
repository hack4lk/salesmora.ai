import { z } from 'zod';
import { estimateDecisionsQuerySchema } from './estimate-decisions';
import { estimateFirstQuotedQuerySchema } from './estimate-first-quoted';
import { estimateCurrentQuerySchema } from './estimate-current';

const query = z.discriminatedUnion('view', [
  estimateDecisionsQuerySchema.omit({ page: true, pageSize: true }),
  estimateFirstQuotedQuerySchema.omit({ page: true, pageSize: true }),
  estimateCurrentQuerySchema.omit({ page: true, pageSize: true }),
]);
export const estimateReportExportInputSchema = z.object({
  query, dataset: z.enum(['summary', 'evidence']),
}).strict();
export type EstimateReportExportInput = z.infer<typeof estimateReportExportInputSchema>;

const common = ['report_view', 'dataset', 'date_basis', 'period_from', 'period_to',
  'snapshot_at_utc', 'workspace_timezone', 'scope', 'archive_visibility', 'coverage'] as const;
export function estimateReportExportColumns(input: EstimateReportExportInput): string[] {
  const view = input.query.view;
  const columns = input.dataset === 'summary'
    ? view === 'estimate-decisions' ? ['accepted', 'declined', 'accepted_pre_tax_cents', 'accepted_total_cents', 'money_coverage']
      : view === 'estimate-first-quoted' ? ['first_quoted', 'issuance_coverage']
        : ['awaiting', 'expired', 'handoff', 'handoff_coverage', 'awaiting_pre_tax_cents', 'awaiting_total_cents', 'money_coverage']
    : view === 'estimate-decisions'
      ? ['estimate_id', 'estimate_number', 'revision', 'decision_version', 'estimate_label', 'owner', 'parent_type',
        'outcome', 'decision_date', 'recorded_date', 'archived', 'pre_tax_cents', 'tax_cents', 'total_cents', 'money_coverage']
      : view === 'estimate-first-quoted'
        ? ['estimate_id', 'estimate_number', 'estimate_label', 'owner', 'parent_type', 'first_issued_date',
          'first_issued_revision', 'first_issued_via', 'current_issued_revision', 'current_issued_date', 'current_status', 'archived']
        : ['estimate_id', 'estimate_number', 'revision', 'estimate_label', 'owner', 'parent_type',
          'status', 'issued_date', 'valid_until', 'decision_date', 'pre_tax_cents', 'tax_cents', 'total_cents', 'money_coverage'];
  return [...common, ...columns];
}

const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, scope: z.enum(['workspace', 'assigned_job']),
  handoff: z.boolean(), archiveVisibility: z.enum(['included', 'excluded']),
  asOf: z.iso.datetime(), today: z.iso.date(), timezone: text.max(100),
  dateBasis: z.enum(['decision-date', 'first-issued-date', 'current-snapshot']), count,
  limits: z.object({ rows: count.refine(value => value > 0), bytes: count.refine(value => value > 0),
    durationMs: count.refine(value => value > 0) }).strict(),
};
function validClock(value: { asOf: string; today: string; timezone: string }): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: value.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(value.asOf));
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === value.today;
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return false;
  }
}
export const estimateReportExportPreviewSchema = z.object({
  ...metadata, input: estimateReportExportInputSchema, viewerId: text, coverage: text, columns: z.array(text).min(1),
}).strict().superRefine((preview, context) => {
  const { query, dataset } = preview.input;
  const basis = query.view === 'estimate-decisions' ? 'decision-date'
    : query.view === 'estimate-first-quoted' ? 'first-issued-date' : 'current-snapshot';
  const valid = validClock(preview) && preview.workspaceId === query.workspaceId && preview.dateBasis === basis &&
    JSON.stringify(preview.columns) === JSON.stringify(estimateReportExportColumns(preview.input)) &&
    (query.view === 'estimate-current' ? preview.archiveVisibility === 'excluded' : query.period.to <= preview.today) &&
    (preview.scope !== 'assigned_job' || !preview.handoff) &&
    (query.view !== 'estimate-current' || query.selected !== 'handoff' || preview.handoff) &&
    (dataset !== 'summary' || preview.count === 1);
  if (!valid) context.addIssue({ code: 'custom', message: 'Estimate CSV preview input, scope, columns and clock do not match.' });
});
export type EstimateReportExportPreview = z.infer<typeof estimateReportExportPreviewSchema>;
export const estimateReportExportGenerationSchema = z.object({
  ...metadata, id: z.uuid(),
}).strict().superRefine((generation, context) => {
  if (!validClock(generation) || generation.count > generation.limits.rows ||
    generation.scope === 'assigned_job' && generation.handoff) context.addIssue({
    code: 'custom', message: 'Estimate CSV generation scope, clock or limits do not match.',
  });
});
export type EstimateReportExportGeneration = z.infer<typeof estimateReportExportGenerationSchema>;

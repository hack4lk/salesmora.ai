import { z } from 'zod';
import { jobLifecycleQuerySchema } from './job-lifecycle';
import { jobCompletionQuerySchema } from './job-completion';
import { jobWorkloadQuerySchema } from './jobs';

export const jobReportExportDatasets = [
  'summary', 'days', 'status', 'owner', 'service', 'waiting-reasons', 'evidence',
] as const;
const query = z.discriminatedUnion('view', [
  z.object({
    workspaceId: jobLifecycleQuerySchema.shape.workspaceId, view: jobLifecycleQuerySchema.shape.view,
    period: jobLifecycleQuerySchema.shape.period, filters: jobLifecycleQuerySchema.shape.filters,
    selectedView: jobLifecycleQuerySchema.shape.selectedView,
  }).strict(),
  z.object({
    workspaceId: jobCompletionQuerySchema.shape.workspaceId, view: jobCompletionQuerySchema.shape.view,
    period: jobCompletionQuerySchema.shape.period, filters: jobCompletionQuerySchema.shape.filters,
    selectedDate: jobCompletionQuerySchema.shape.selectedDate,
  }).strict(),
  jobWorkloadQuerySchema.omit({ page: true, pageSize: true }),
]);
export const jobReportExportInputSchema = z.object({
  query, dataset: z.enum(jobReportExportDatasets),
}).strict().superRefine(({ query, dataset }, context) => {
  const allowed = dataset === 'summary' || dataset === 'evidence' ||
    query.view === 'completion' && dataset === 'days' ||
    query.view === 'workload' && ['status', 'owner', 'service', 'waiting-reasons'].includes(dataset);
  const validQuery = query.view === 'lifecycle'
    ? jobLifecycleQuerySchema.safeParse(query).success
    : query.view === 'completion'
      ? jobCompletionQuerySchema.safeParse(query).success
      : true;
  if (!allowed || !validQuery) context.addIssue({
    code: 'custom', message: 'Choose an applicable Jobs report dataset and valid selection.',
  });
});
export type JobReportExportInput = z.infer<typeof jobReportExportInputSchema>;

const common = ['report_view', 'dataset', 'date_basis', 'period_from', 'period_to',
  'snapshot_at_utc', 'workspace_timezone', 'scope', 'archive_visibility', 'coverage'] as const;
export function jobReportExportColumns(input: JobReportExportInput): string[] {
  const columns = input.dataset === 'summary'
    ? input.query.view === 'lifecycle' ? ['created', 'completed', 'canceled', 'reopened']
      : input.query.view === 'completion' ? ['completed', 'duration_sample_size', 'total_elapsed_days', 'average_elapsed_days']
        : ['active', 'overdue', 'due_soon', 'no_deadline', 'waiting', 'unassigned']
    : input.dataset === 'days' ? ['local_date', 'completed']
      : input.dataset === 'evidence'
        ? input.query.view === 'lifecycle' ? ['job_id', 'job_label', 'event_type', 'event_date', 'status', 'owner', 'service']
          : input.query.view === 'completion' ? ['job_id', 'job_label', 'created_date', 'completion_date', 'elapsed_days', 'status', 'owner']
            : ['job_id', 'job_label', 'status', 'owner', 'service', 'completion_deadline', 'scheduled_date', 'waiting_reason']
        : ['group_id', 'group_label', 'job_count'];
  return [...common, ...columns];
}

const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, scope: z.enum(['workspace', 'assigned']),
  archiveVisibility: z.literal('included'), asOf: z.iso.datetime(), today: z.iso.date(),
  timezone: text.max(100), dateBasis: z.enum(['lifecycle-local-dates', 'completion-date', 'current-snapshot']),
  count, limits: z.object({
    rows: count.refine(value => value > 0), bytes: count.refine(value => value > 0),
    durationMs: count.refine(value => value > 0),
  }).strict(),
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
export const jobReportExportPreviewSchema = z.object({
  ...metadata, input: jobReportExportInputSchema, viewerId: text, coverage: text,
  columns: z.array(text).min(1),
}).strict().superRefine((preview, context) => {
  const { query, dataset } = preview.input;
  const basis = query.view === 'lifecycle' ? 'lifecycle-local-dates'
    : query.view === 'completion' ? 'completion-date' : 'current-snapshot';
  const valid = validClock(preview) && preview.workspaceId === query.workspaceId && preview.dateBasis === basis &&
    JSON.stringify(preview.columns) === JSON.stringify(jobReportExportColumns(preview.input)) &&
    (query.view === 'workload' || query.period.to <= preview.today) &&
    (dataset !== 'summary' || preview.count === 1) &&
    (dataset !== 'days' || query.view === 'completion' &&
      preview.count === (Date.parse(query.period.to) - Date.parse(query.period.from)) / 86400000 + 1);
  if (!valid) context.addIssue({ code: 'custom', message: 'Jobs CSV preview input, columns and native clock do not match.' });
});
export type JobReportExportPreview = z.infer<typeof jobReportExportPreviewSchema>;
export const jobReportExportGenerationSchema = z.object({
  ...metadata, id: z.uuid(),
}).strict().superRefine((generation, context) => {
  if (!validClock(generation) || generation.count > generation.limits.rows) context.addIssue({
    code: 'custom', message: 'Jobs CSV generation clock and limits do not match.',
  });
});
export type JobReportExportGeneration = z.infer<typeof jobReportExportGenerationSchema>;

import { z } from 'zod';
import { calendarScheduledQuerySchema, calendarScheduledResultSchema } from './calendar-scheduled';
import { calendarReviewQuerySchema } from './calendar-review';
import { calendarUnscheduledQuerySchema } from './calendar-unscheduled';

export const calendarExportDatasets = [
  'summary', 'days', 'person-days', 'visits', 'busy-person-days', 'overlaps', 'past', 'jobs', 'workOrders',
] as const;
const query = z.discriminatedUnion('view', [
  calendarScheduledQuerySchema.omit({ page: true, pageSize: true }),
  calendarReviewQuerySchema.omit({ page: true, pageSize: true }),
  calendarUnscheduledQuerySchema.omit({ page: true, pageSize: true }),
]);
export const calendarExportInputSchema = z.object({
  query, dataset: z.enum(calendarExportDatasets),
}).strict().superRefine(({ query, dataset }, context) => {
  const expected = query.view === 'calendar-scheduled'
    ? dataset === 'summary' || dataset === 'days' || dataset === 'visits' ? 'visits'
      : dataset === 'person-days' || dataset === 'busy-person-days' ? 'busy-person-days' : undefined
    : query.view === 'calendar-review'
      ? dataset === 'summary' || dataset === 'overlaps' ? 'overlaps' : dataset === 'past' ? 'past' : undefined
      : dataset === 'summary' || dataset === 'visits' ? 'visits'
        : dataset === 'jobs' || dataset === 'workOrders' ? dataset : undefined;
  if (!expected || query.selected !== expected) context.addIssue({
    code: 'custom', message: 'Calendar CSV view, dataset and selected evidence must match.',
  });
});
export type CalendarExportInput = z.infer<typeof calendarExportInputSchema>;

const common = ['report_view', 'dataset', 'date_basis', 'period_from', 'period_to', 'snapshot_at_utc',
  'workspace_timezone', 'calendar_scope', 'job_scope', 'work_order_scope', 'coverage'] as const;
const evidence = {
  days: ['date', 'visits', 'unassigned_visits'],
  'person-days': ['person_id', 'person_label', 'date', 'visits', 'busy_threshold'],
  visits: ['visit_id', 'visit_label', 'scheduled_date', 'participant_ids', 'linked_records'],
  'busy-person-days': ['person_id', 'person_label', 'date', 'visits', 'busy_threshold'],
  overlaps: ['person_id', 'person_label', 'date', 'left_visit_id', 'left_visit_label', 'left_arrival_window',
    'right_visit_id', 'right_visit_label', 'right_arrival_window'],
  past: ['visit_id', 'visit_label', 'scheduled_date', 'arrival_window', 'participant_ids', 'linked_records'],
  jobs: ['visit_id', 'record_id', 'record_label', 'status', 'participant_ids'],
  workOrders: ['visit_id', 'record_id', 'record_label', 'status', 'participant_ids'],
} as const;
export function calendarExportColumns(input: CalendarExportInput): string[] {
  const columns = input.dataset !== 'summary' ? evidence[input.dataset]
    : input.query.view === 'calendar-scheduled' ? ['visits', 'busy_person_days', 'busy_threshold']
      : input.query.view === 'calendar-review'
        ? ['scheduled_visits', 'missing_windows', 'overlap_person_pairs', 'past_visits']
        : ['visits', 'jobs', 'work_orders'];
  return [...common, ...columns];
}

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const limits = z.object({
  rows: count.refine(value => value > 0), bytes: count.refine(value => value > 0),
  durationMs: count.refine(value => value > 0),
}).strict();
export const calendarExportOutputScopesSchema = z.object({
  jobs: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), scope: z.enum(['workspace', 'assigned']) }).strict(),
    z.object({ kind: z.literal('unavailable'), reason: z.literal('permissions') }).strict(),
  ]),
  workOrders: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), scope: z.enum(['workspace', 'assigned_job']) }).strict(),
    z.object({ kind: z.literal('unavailable'), reason: z.literal('permissions') }).strict(),
  ]),
}).strict();
export type CalendarExportOutputScopes = z.infer<typeof calendarExportOutputScopesSchema>;

const metadata = {
  workspaceId: z.uuid(), policyRevision: count, scope: calendarScheduledResultSchema.shape.scope,
  outputScopes: calendarExportOutputScopesSchema,
  asOf: z.iso.datetime(), today: z.iso.date(), timezone: text.max(100),
  dateBasis: z.enum(['current-scheduled-date', 'current-unscheduled']), count, limits,
};
function validMetadata(value: {
  asOf: string; today: string; timezone: string; outputScopes: CalendarExportOutputScopes;
}) {
  if (value.outputScopes.jobs.kind !== 'available' && value.outputScopes.workOrders.kind !== 'available') return false;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: value.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(value.asOf));
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === value.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; return false; }
}
export const calendarExportPreviewSchema = z.object({
  ...metadata, input: calendarExportInputSchema, viewerId: text, coverage: text,
  columns: z.array(text).min(1),
}).strict().superRefine((preview, context) => {
  const { query, dataset } = preview.input;
  const valid = validMetadata(preview) && preview.workspaceId === query.workspaceId &&
    (preview.scope.kind !== 'own' || preview.scope.viewerId === preview.viewerId &&
      query.filters.participants.every(id => id === preview.viewerId)) &&
    preview.dateBasis === (query.view === 'calendar-unscheduled' ? 'current-unscheduled' : 'current-scheduled-date') &&
    JSON.stringify(preview.columns) === JSON.stringify(calendarExportColumns(preview.input)) &&
    (dataset !== 'summary' || preview.count === 1) &&
    (dataset !== 'days' || query.view === 'calendar-scheduled' &&
      preview.count === (Date.parse(query.period.to) - Date.parse(query.period.from)) / 86400000 + 1) &&
    (dataset !== 'jobs' || preview.outputScopes.jobs.kind === 'available') &&
    (dataset !== 'workOrders' || preview.outputScopes.workOrders.kind === 'available') &&
    query.filters.recordTypes.every(type => (type === 'job' ? preview.outputScopes.jobs : preview.outputScopes.workOrders).kind === 'available');
  if (!valid) context.addIssue({
    code: 'custom', message: 'Calendar CSV preview input, output scopes, columns and native clock do not match.',
  });
});
export type CalendarExportPreview = z.infer<typeof calendarExportPreviewSchema>;
export const calendarExportGenerationSchema = z.object({
  ...metadata, id: z.uuid(),
}).strict().superRefine((value, context) => {
  if (!validMetadata(value) || value.count > value.limits.rows) context.addIssue({
    code: 'custom', message: 'Calendar CSV generation clock, output scopes and limits do not match.',
  });
});
export type CalendarExportGeneration = z.infer<typeof calendarExportGenerationSchema>;

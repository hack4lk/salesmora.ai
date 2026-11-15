import { z } from 'zod';
import { teamLeadsQuerySchema, teamLeadsResultSchema } from './team-leads';
import { teamJobsQuerySchema } from './team-jobs';

export const teamReportExportDatasets = ['summary', 'owners', 'members', 'unassigned', 'evidence'] as const;
const query = z.discriminatedUnion('view', [
  teamLeadsQuerySchema.omit({ page: true, pageSize: true }),
  teamJobsQuerySchema.omit({ page: true, pageSize: true }),
]);
export const teamReportExportInputSchema = z.object({
  query, dataset: z.enum(teamReportExportDatasets),
}).strict().superRefine(({ query, dataset }, context) => {
  const valid = dataset === 'summary' || dataset === 'evidence' ||
    query.view === 'team-leads' && dataset === 'owners' ||
    query.view === 'team-jobs' && (dataset === 'members' || dataset === 'unassigned');
  if (!valid) context.addIssue({ code: 'custom', message: 'Choose an applicable Team report CSV dataset.' });
});
export type TeamReportExportInput = z.infer<typeof teamReportExportInputSchema>;
export type TeamReportExportScope = z.infer<typeof teamLeadsResultSchema.shape.scope>;

/** Assigned access cannot export another member's workload or an unassigned queue. */
export function teamReportExportSelectionAllowed(input: TeamReportExportInput, scope: TeamReportExportScope): boolean {
  if (scope.kind === 'workspace') return true;
  if (input.dataset === 'unassigned' || input.query.filters.members.some(id => id !== scope.currentMemberId)) return false;
  const selected = input.query.selected;
  if (input.query.view === 'team-leads') {
    const selection = input.query.selected;
    return selection.kind === 'queue' ? selection.queue !== 'unassigned' : selection.id === `member:${scope.currentMemberId}`;
  }
  return selected.kind === 'queue' ? selected.queue !== 'unassigned'
    : selected.kind === 'member' && selected.id === scope.currentMemberId;
}
const common = ['report_view', 'dataset', 'date_basis', 'snapshot_at_utc', 'workspace_timezone',
  'scope', 'archive_visibility', 'inactivity_cutoff_utc', 'coverage'] as const;
const workload = ['count', 'overdue', 'waiting', 'needs_scheduling', 'scheduled', 'in_progress', 'waiting_status'] as const;
export function teamReportExportColumns(input: TeamReportExportInput): string[] {
  const columns = input.dataset === 'summary'
    ? input.query.view === 'team-leads' ? ['open', 'inactive', 'unassigned']
      : ['active', 'overdue', 'waiting']
    : input.dataset === 'owners' ? ['owner_id', 'owner_label', 'open', 'inactive', 'new', 'contacted', 'estimate_sent']
      : input.dataset === 'members' ? ['member_id', 'member_label', 'responsibility', ...workload]
        : input.dataset === 'unassigned' ? [...workload]
          : input.query.view === 'team-leads'
            ? ['lead_id', 'lead_label', 'stage', 'owner_state', 'owner_id', 'owner_label', 'inactive', 'created_utc', 'last_activity_utc']
            : ['job_id', 'job_label', 'status', 'service', 'completion_deadline', 'scheduled_date',
              'waiting_reason', 'primary_kind', 'primary_member_id', 'supporting_member_ids'];
  return [...common, ...columns];
}
const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, scope: teamLeadsResultSchema.shape.scope,
  archiveVisibility: z.enum(['excluded', 'included']), asOf: z.iso.datetime(), today: z.iso.date(),
  timezone: text.max(100), dateBasis: z.literal('current-snapshot'), count,
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
export const teamReportExportPreviewSchema = z.object({
  ...metadata, input: teamReportExportInputSchema, viewerId: text, coverage: text,
  inactivityCutoff: z.iso.datetime({ precision: 6 }).nullable(), columns: z.array(text).min(1),
}).strict().superRefine((preview, context) => {
  const { query, dataset } = preview.input;
  const valid = validClock(preview) && preview.workspaceId === query.workspaceId &&
    (preview.scope.kind !== 'assigned' || preview.scope.currentMemberId === preview.viewerId) &&
    teamReportExportSelectionAllowed(preview.input, preview.scope) &&
    preview.archiveVisibility === (query.view === 'team-leads' ? 'excluded' : 'included') &&
    (query.view === 'team-leads'
      ? preview.inactivityCutoff !== null && Date.parse(preview.inactivityCutoff) <= Date.parse(preview.asOf)
      : preview.inactivityCutoff === null) &&
    JSON.stringify(preview.columns) === JSON.stringify(teamReportExportColumns(preview.input)) &&
    (dataset !== 'summary' && dataset !== 'unassigned' || preview.count === 1);
  if (!valid) context.addIssue({ code: 'custom', message: 'Team CSV preview input, scope, columns and native clock do not match.' });
});
export type TeamReportExportPreview = z.infer<typeof teamReportExportPreviewSchema>;
export const teamReportExportGenerationSchema = z.object({
  ...metadata, id: z.uuid(),
}).strict().superRefine((generation, context) => {
  if (!validClock(generation) || generation.count > generation.limits.rows) context.addIssue({
    code: 'custom', message: 'Team CSV generation clock and limits do not match.',
  });
});
export type TeamReportExportGeneration = z.infer<typeof teamReportExportGenerationSchema>;

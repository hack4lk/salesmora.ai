import { z } from 'zod';
import { leadSources } from '../lead-read';
import { leadSourceQuerySchema } from './lead-source';

const query = leadSourceQuerySchema.omit({ page: true, pageSize: true });
export const leadSourceExportDatasets = ['source-groups', 'cohort', 'converted', 'accepted-estimates'] as const;
export const leadSourceExportInputSchema = z.object({
  query, dataset: z.enum(leadSourceExportDatasets),
}).strict().superRefine(({ query, dataset }, context) => {
  const expected = dataset === 'converted' ? 'converted'
    : dataset === 'accepted-estimates' ? 'accepted-estimates' : 'cohort';
  if (query.selected !== expected) context.addIssue({
    code: 'custom', message: 'The Sources export dataset and selected evidence must match.',
  });
});
export type LeadSourceExportInput = z.infer<typeof leadSourceExportInputSchema>;

const commonColumns = ['report_view', 'dataset', 'date_basis', 'period_from', 'period_to',
  'snapshot_at_utc', 'workspace_timezone', 'lead_scope', 'lead_archive_visibility', 'coverage'] as const;
const groupColumns = ['group_kind', 'source', 'cohort_leads', 'converted_leads', 'conversion_coverage',
  'accepted_estimate_count', 'accepted_value_pre_tax_cents', 'currency', 'accepted_value_coverage'] as const;
const evidenceColumns = {
  cohort: ['lead_id', 'lead_label', 'created_date', 'current_source', 'archived'],
  converted: ['lead_id', 'lead_label', 'created_date', 'current_source', 'archived', 'linked_job_numbers'],
  'accepted-estimates': ['estimate_number', 'revision', 'decision_version', 'estimate_name', 'accepted_date',
    'pre_tax_cents', 'currency', 'source', 'linked_lead_id', 'linked_lead_label', 'attribution'],
} as const;
export function leadSourceExportColumns(input: LeadSourceExportInput): string[] {
  return [...commonColumns, ...(input.dataset === 'source-groups' ? groupColumns : evidenceColumns[input.dataset])];
}

const scope = z.enum(['workspace', 'assigned']);
const availability = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('available'), scope: z.literal('workspace') }).strict(),
  z.object({ kind: z.literal('unavailable'), reason: z.literal('permissions') }).strict(),
]);
const limits = z.object({
  rows: z.number().int().positive().refine(Number.isSafeInteger),
  bytes: z.number().int().positive().refine(Number.isSafeInteger),
  durationMs: z.number().int().positive().refine(Number.isSafeInteger),
}).strict();
export const leadSourceExportPreviewSchema = z.object({
  input: leadSourceExportInputSchema, workspaceId: z.uuid(), viewerId: z.string().trim().min(1).max(4000),
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  leadScope: scope, leadArchiveVisibility: z.enum(['included', 'excluded']),
  conversion: availability,
  acceptedValue: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('available'), scope: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('unavailable'), reason: z.enum(['permissions', 'invalid-money', 'implementation-pending']) }).strict(),
  ]),
  asOf: z.iso.datetime(), today: z.iso.date(), timezone: z.string().trim().min(1).max(100),
  dateBasis: z.literal('lead-creation-cohort'),
  coverage: z.string().trim().min(1).max(4000),
  count: z.number().int().nonnegative().refine(Number.isSafeInteger), limits,
  columns: z.array(z.string().min(1)).min(1),
}).strict().superRefine((preview, context) => {
  const valid = preview.workspaceId === preview.input.query.workspaceId &&
    preview.input.query.period.to <= preview.today &&
    JSON.stringify(preview.columns) === JSON.stringify(leadSourceExportColumns(preview.input)) &&
    (preview.input.dataset !== 'converted' || preview.conversion.kind === 'available') &&
    (preview.input.dataset !== 'accepted-estimates' || preview.acceptedValue.kind === 'available') &&
    (preview.input.dataset !== 'source-groups' || preview.count >= leadSources.length);
  let todayMatches = false;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: preview.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(preview.asOf));
    todayMatches = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === preview.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; }
  if (!valid || !todayMatches) context.addIssue({
    code: 'custom', message: 'Sources CSV preview input, authority, dataset and native clock do not match.',
  });
});
export type LeadSourceExportPreview = z.infer<typeof leadSourceExportPreviewSchema>;

export const leadSourceExportGenerationSchema = z.object({
  id: z.uuid(), workspaceId: z.uuid(), policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  leadScope: scope, leadArchiveVisibility: z.enum(['included', 'excluded']),
  conversion: availability,
  acceptedValue: leadSourceExportPreviewSchema.shape.acceptedValue,
  asOf: z.iso.datetime(), today: z.iso.date(), timezone: z.string().trim().min(1).max(100),
  dateBasis: z.literal('lead-creation-cohort'), count: z.number().int().nonnegative().refine(Number.isSafeInteger),
  limits,
}).strict().superRefine((generation, context) => {
  let todayMatches = false;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: generation.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(generation.asOf));
    todayMatches = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === generation.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; }
  if (!todayMatches || generation.count > generation.limits.rows) context.addIssue({
    code: 'custom', message: 'Sources CSV generation count and native clock do not match.',
  });
});
export type LeadSourceExportGeneration = z.infer<typeof leadSourceExportGenerationSchema>;

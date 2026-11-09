import { z } from 'zod';
import { activityReportQuerySchema, activityReportResultSchema, reportActivityDomains } from './activity';

export const activityReportExportInputSchema = z.object({
  query: activityReportQuerySchema.omit({ page: true, pageSize: true }),
  dataset: z.enum(['summary', 'evidence']),
}).strict();
export type ActivityReportExportInput = z.infer<typeof activityReportExportInputSchema>;
export function activityReportExportColumns(input: ActivityReportExportInput): string[] {
  const common = ['period_from', 'period_to', 'snapshot_at_utc', 'workspace_timezone', 'included_domains', 'omitted_domains'];
  return [...common, ...(input.dataset === 'summary' ? ['events'] :
    ['domain', 'event_id', 'occurred_at_utc', 'action', 'actor_key', 'actor_label', 'record_id', 'record_label'])];
}
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const metadata = {
  workspaceId: z.uuid(), policyRevision: count, asOf: z.iso.datetime(), today: z.iso.date(), timezone: text.max(100),
  includedDomains: activityReportResultSchema.shape.includedDomains,
  omittedDomains: activityReportResultSchema.shape.omittedDomains, count,
  limits: z.object({ rows: count.refine(value => value > 0), bytes: count.refine(value => value > 0),
    durationMs: count.refine(value => value > 0) }).strict(),
};
function validMetadata(value: { asOf: string; today: string; timezone: string;
  includedDomains: { domain: string; scope: string; archiveVisibility: string }[];
  omittedDomains: { domain: string; reason: string }[] }) {
  const domains = [...value.includedDomains, ...value.omittedDomains].map(item => item.domain);
  if (!value.includedDomains.length || domains.length !== reportActivityDomains.length ||
    new Set(domains).size !== reportActivityDomains.length ||
    value.omittedDomains.some(item => item.reason !== 'permissions') ||
    value.includedDomains.some(item => item.domain === 'customer' &&
      (item.scope !== 'workspace' || item.archiveVisibility === 'not-applicable') ||
      item.domain === 'estimate' && item.archiveVisibility === 'not-applicable' ||
      item.domain === 'work-order' && item.archiveVisibility !== 'included')) return false;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: value.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(value.asOf));
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-') === value.today;
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return false;
  }
}
export const activityReportExportPreviewSchema = z.object({
  ...metadata, input: activityReportExportInputSchema, viewerId: text, columns: z.array(text).min(1), coverage: text,
}).strict().superRefine((preview, context) => {
  if (!validMetadata(preview) || preview.workspaceId !== preview.input.query.workspaceId ||
    preview.input.query.period.to > preview.today ||
    preview.input.query.filters.domains.some(domain => !preview.includedDomains.some(item => item.domain === domain)) ||
    JSON.stringify(preview.columns) !== JSON.stringify(activityReportExportColumns(preview.input)) ||
    preview.input.dataset === 'summary' && preview.count !== 1) {
    context.addIssue({ code: 'custom', message: 'Activity CSV input, domains, columns or clock do not match.' });
  }
});
export type ActivityReportExportPreview = z.infer<typeof activityReportExportPreviewSchema>;
export const activityReportExportGenerationSchema = z.object({ ...metadata, id: z.uuid() }).strict().superRefine((value, context) => {
  if (!validMetadata(value) || value.count > value.limits.rows) {
    context.addIssue({ code: 'custom', message: 'Activity CSV domains, clock or limits do not match.' });
  }
});

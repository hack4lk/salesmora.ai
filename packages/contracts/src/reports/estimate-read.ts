import { z } from 'zod';
import { estimateDecisionsQuerySchema, estimateDecisionsResultSchema } from './estimate-decisions';
import { estimateCurrentQuerySchema, estimateCurrentResultSchema } from './estimate-current';
import { estimateFirstQuotedQuerySchema, estimateFirstQuotedResultSchema } from './estimate-first-quoted';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const owner = z.object({ value: estimateDecisionsResultSchema.shape.rows.element.shape.ownerKey, label: text }).strict();
export const estimateReportQuerySchema = z.discriminatedUnion('view', [
  estimateDecisionsQuerySchema, estimateFirstQuotedQuerySchema, estimateCurrentQuerySchema,
]);
export type EstimateReportQuery = z.infer<typeof estimateReportQuerySchema>;
export const estimateReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text,
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  today: z.iso.date(),
  authority: z.object({
    scope: z.enum(['workspace', 'assigned_job']),
    archives: z.enum(['included', 'excluded']),
    // Ordinary Estimate reads already authorize frozen quote values, independently of Financial Reports.
    money: z.literal(true), handoff: z.boolean(),
  }).strict(),
  exportAccess: z.object({ scope: z.enum(['workspace', 'assigned_job']), handoff: z.boolean() }).strict().nullable(),
  query: estimateReportQuerySchema,
  report: z.union([estimateDecisionsResultSchema, estimateFirstQuotedResultSchema, estimateCurrentResultSchema]),
  options: z.object({
    context: z.enum(['period', 'current']), owners: z.array(owner),
    parents: z.array(z.object({ value: z.enum(['lead', 'job']), label: text }).strict()),
  }).strict(),
}).strict().superRefine((result, context) => {
  const { query, report, authority, exportAccess, options } = result;
  const total = report.view === 'estimate-first-quoted' ? report.total : report.evidenceTotal;
  let valid = result.workspaceId === query.workspaceId && result.workspaceId === report.workspaceId &&
    query.view === report.view && authority.scope === report.scope &&
    (authority.scope !== 'assigned_job' || !authority.handoff) &&
    (exportAccess === null || (authority.scope !== 'assigned_job' || exportAccess.scope === 'assigned_job') &&
      (exportAccess.scope !== 'assigned_job' || !exportAccess.handoff) && (!exportAccess.handoff || authority.handoff)) &&
    options.context === (query.view === 'estimate-current' ? 'current' : 'period') &&
    JSON.stringify(query.filters) === JSON.stringify(report.filters) && query.pageSize === report.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(total / query.pageSize))) &&
    (['owners', 'parents'] as const).every(key =>
      new Set(options[key].map(option => option.value)).size === options[key].length &&
      query.filters[key].every(value => options[key].some(option => option.value === value))) &&
    report.rows.every(row => options.owners.some(option => option.value === row.ownerKey) &&
      options.parents.some(option => option.value === row.parentType) && text.safeParse(row.label).success) &&
    (authority.scope !== 'assigned_job' || options.parents.every(option => option.value === 'job')) &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success;
  if ('archiveVisibility' in report) valid &&= report.archiveVisibility === authority.archives;
  if ('today' in report) valid &&= report.today === result.today;
  if ('period' in query && 'from' in report) valid &&= query.period.from === report.from &&
    query.period.to === report.to && report.to <= result.today;
  if (query.view === 'estimate-decisions' && report.view === 'estimate-decisions') valid &&= query.selected === report.selected;
  if (query.view === 'estimate-current' && report.view === 'estimate-current') valid &&= query.selected === report.selected &&
    authority.handoff === (report.handoff.kind === 'available');
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === result.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Estimates report request, authority, facets and evidence do not match.' });
});
export type EstimateReportReadResult = z.infer<typeof estimateReportReadResultSchema>;

import { z } from 'zod';
import { jobDateSchema, jobStatuses } from '../job';
import { jobWorkloadQuerySchema, jobWorkloadResultSchema } from './jobs';
import { jobLifecycleQuerySchema, jobLifecycleResultSchema } from './job-lifecycle';
import { jobCompletionQuerySchema, jobCompletionResultSchema } from './job-completion';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const option = z.object({ value: text, label: text }).strict();
export const jobReportQuerySchema = z.discriminatedUnion('view', [
  jobLifecycleQuerySchema, jobCompletionQuerySchema, jobWorkloadQuerySchema,
]);
export type JobReportQuery = z.infer<typeof jobReportQuerySchema>;
export const jobReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text,
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  scope: z.enum(['workspace', 'assigned']),
  exportScope: z.enum(['workspace', 'assigned']).nullable(),
  today: jobDateSchema.refine(value => !value.startsWith('0000')),
  query: jobReportQuerySchema,
  report: z.union([jobLifecycleResultSchema, jobCompletionResultSchema, jobWorkloadResultSchema]),
  options: z.object({
    context: z.enum(['period', 'current']),
    statuses: z.array(option), owners: z.array(option), services: z.array(option),
  }).strict(),
}).strict().superRefine((result, context) => {
  const { query, report, options } = result;
  const activeStatuses = jobWorkloadQuerySchema.shape.filters.shape.statuses.unwrap().element.options;
  let valid = query.workspaceId === result.workspaceId && query.view === report.view &&
    !(result.scope === 'assigned' && result.exportScope === 'workspace') &&
    JSON.stringify(query.filters) === JSON.stringify(report.filters) &&
    query.pageSize === report.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.evidenceTotal / query.pageSize))) &&
    options.context === (query.view === 'workload' ? 'current' : 'period') &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success &&
    options.statuses.every(item => (query.view === 'workload' ? activeStatuses : jobStatuses).some(status => status === item.value)) &&
    options.owners.every(item => item.value === 'unassigned' || (item.value.startsWith('member:') && item.value.length > 7)) &&
    options.services.every(item => item.value === 'none' || (item.value.startsWith('service:') && item.value.length > 8)) &&
    (['statuses', 'owners', 'services'] as const).every(key =>
      new Set(options[key].map(item => item.value)).size === options[key].length &&
      query.filters[key].every(value => options[key].some(item => item.value === value)));
  if ('period' in query && 'from' in report) {
    valid &&= query.period.from === report.from && query.period.to === report.to && report.to <= result.today;
  }
  if (query.view === 'lifecycle' && report.view === 'lifecycle') {
    valid &&= query.selectedView === report.selectedView && new Set(Object.values(report.evidenceIds)).size === 4;
  }
  if (query.view === 'completion' && report.view === 'completion') valid &&= query.selectedDate === report.selectedDate;
  if (query.view === 'workload' && report.view === 'workload') {
    valid &&= JSON.stringify(query.selection) === JSON.stringify(report.selection) && report.today === result.today &&
      report.groups.owner.every(group => group.count === 0 || options.owners.some(option => option.value === group.id)) &&
      report.groups.service.every(group => group.count === 0 || options.services.some(option => option.value === group.id)) &&
      report.rows.every(row => options.statuses.some(option => option.value === row.status) &&
        options.owners.some(option => option.value === (row.primaryOwnerId === null ? 'unassigned' : `member:${row.primaryOwnerId}`)) &&
        options.services.some(option => option.value === row.serviceId) &&
        Object.keys(row.cells).length === 2 && ['owner', 'service'].every(key => Object.hasOwn(row.cells, key)));
  }
  valid &&= report.rows.every(row => text.safeParse(row.label).success &&
    Object.values(row.cells).every(value => text.safeParse(value).success));
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === result.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Jobs report request, authority, facets and evidence do not match.' });
});
export type JobReportReadResult = z.infer<typeof jobReportReadResultSchema>;

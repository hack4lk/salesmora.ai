import { z } from 'zod';
import { leadReportQuerySchema, leadReportResultSchema } from './leads';
import { leadSources, leadStages } from '../lead-read';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const option = z.object({ value: text, label: text }).strict();
export const leadReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text, policyRevision: z.number().int().nonnegative(),
  scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded']),
  exportScope: z.enum(['workspace', 'assigned']).nullable().optional(),
  query: leadReportQuerySchema, report: leadReportResultSchema,
  options: z.object({
    stages: z.array(option).length(5), sources: z.array(option).length(5), owners: z.array(option),
  }).strict(),
}).strict().superRefine((result, context) => {
  const { query, report, options } = result;
  let valid = query.workspaceId === result.workspaceId && query.view === report.view &&
    !(result.scope === 'assigned' && result.exportScope === 'workspace') &&
    report.archiveVisibility === result.archiveVisibility && report.pageSize === query.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.evidenceTotal / query.pageSize))) &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success &&
    options.stages.every(item => leadStages.some(stage => stage === item.value)) &&
    options.sources.every(item => leadSources.some(source => source === item.value)) &&
    Object.values(options).every(items => new Set(items.map(item => item.value)).size === items.length) &&
    (result.scope !== 'assigned' || options.owners.every(item => item.value === 'me' || item.value === 'unassigned'));
  const filters = [query.filters, ...(query.view === 'intake' ? [query.currentFilters] : [])];
  valid &&= filters.every(filter => (['stages', 'owners', 'sources'] as const).every(key =>
    filter[key].every(value => options[key].some(item => item.value === value))));
  const columns = report.view === 'won' || report.view === 'lost' ? ['transition', 'assignment', 'source']
    : report.view === 'attention' ? ['stage', 'owner', 'activity', 'reason']
      : ['created', 'assignment', 'source', 'stage', 'activity', 'age'];
  valid &&= report.rows.every(row => row.id === row.recordId && z.uuid().safeParse(row.id).success &&
    text.safeParse(row.label).success && Object.keys(row.cells).length === columns.length &&
    columns.every(key => Object.hasOwn(row.cells, key)) && Object.values(row.cells).every(value => text.safeParse(value).success));
  if ('period' in query && 'from' in report) valid &&= query.period.from === report.from && query.period.to === report.to && report.to <= report.today;
  if ((query.view === 'pipeline' || query.view === 'age') && (report.view === 'pipeline' || report.view === 'age')) {
    valid &&= JSON.stringify(query.selection) === JSON.stringify(report.selection) &&
      report.rows.every(row => ['new', 'contacted', 'estimate-sent'].includes(row.cells.stage) &&
        /^\d+$/.test(row.cells.age) && Number.isSafeInteger(Number(row.cells.age)));
    const selectedTotal = query.selection.kind === 'pipeline' ? report.total
      : query.selection.kind === 'stage' ? report.stages[query.selection.stage] : report.ages[query.selection.band];
    valid &&= report.evidenceTotal === selectedTotal;
  }
  if (query.view === 'attention' && report.view === 'attention') valid &&= query.selection === report.selection;
  if (query.view === 'intake' && report.view === 'intake') {
    const days = (Date.parse(`${report.to}T00:00:00Z`) - Date.parse(`${report.from}T00:00:00Z`)) / 86400000 + 1;
    valid &&= days <= 366 && report.trend.length === days && report.trend.every((item, index) =>
      Date.parse(`${item.date}T00:00:00Z`) === Date.parse(`${report.from}T00:00:00Z`) + index * 86400000) &&
      report.evidenceTotal === (query.trendBucket ? report.trend.find(item => item.date === query.trendBucket)?.count : report.total);
  }
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === report.today;
  }
  catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Leads report request, authority, facets and evidence do not match.' });
});
export type LeadReportReadResult = z.infer<typeof leadReportReadResultSchema>;

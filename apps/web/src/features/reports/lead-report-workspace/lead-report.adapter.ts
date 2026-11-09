import { leadReportQuerySchema, leadReportReadResultSchema, type LeadReportQuery, type LeadReportReadResult } from '@salesmora/contracts';
import type { LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';
import type { LeadReportProjection, LeadReportView } from './lead-report-workspace';
import type { ReportCurrentContextState } from '../report-current-context/report-current-context';
import { formatReportDate, resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { intakeTrendSpans } from '../report-intake-trend/report-intake-trend.validation';

export const nativeLeadReportViews = ['intake', 'pipeline', 'won', 'lost', 'attention', 'age'] as const;
export type NativeLeadReportView = typeof nativeLeadReportViews[number];
export type NativeLeadReportProjection = Extract<LeadReportProjection, { view: NativeLeadReportView }>;
const filtersFor = (filters: LeadReportFiltersValue) => ({ stages: [...filters.stages], owners: [...filters.owners], sources: [...filters.sources] });
export function leadReportRequest(input: {
  workspaceId: string; view: LeadReportView; period: ReportPeriodSelection; today: string;
  filters: { period: LeadReportFiltersValue; current: LeadReportFiltersValue }; evidenceId?: string; page: number; pageSize: number;
}): LeadReportQuery {
  const common = { workspaceId: input.workspaceId, page: input.page, pageSize: input.pageSize };
  const view = input.view;
  if (view === 'intake' || view === 'won' || view === 'lost') {
    const range = resolveReportPeriod(input.period, input.today, 'history').range;
    if (!range) throw new Error('Choose a valid historical Leads report period.');
    const period = { from: range.from, to: range.to }, filters = filtersFor(input.filters.period);
    if (view !== 'intake') return leadReportQuerySchema.parse({ ...common, view, period, filters });
    let trendBucket: string | undefined;
    if (input.evidenceId && input.evidenceId !== 'intake') {
      const span = intakeTrendSpans(period)?.spans.find(item => `trend:${item.from}` === input.evidenceId && item.from === item.to);
      if (!span) throw new Error('Only individual daily intake buckets support matching evidence in this slice.');
      trendBucket = span.from;
    }
    return leadReportQuerySchema.parse({ ...common, view, period, filters, currentFilters: filtersFor(input.filters.current),
      ...(trendBucket ? { trendBucket } : {}) });
  }
  const filters = filtersFor(input.filters.current);
  if (view === 'attention') {
    const selection = input.evidenceId ?? 'combined';
    return leadReportQuerySchema.parse({ ...common, view, filters, selection });
  }
  if (view === 'pipeline' || view === 'age') {
    const id = input.evidenceId ?? 'pipeline';
    const selection = id === 'pipeline' ? { kind: 'pipeline' }
      : id.startsWith('stage:') ? { kind: 'stage', stage: id.slice(6) } : { kind: 'age', band: id.slice(4) };
    if (id !== 'pipeline' && !id.startsWith('stage:') && !id.startsWith('age:')) throw new Error('Unsupported Leads pipeline evidence.');
    return leadReportQuerySchema.parse({ ...common, view, filters, selection });
  }
  throw new Error('This Leads view is not integrated with the report API yet.');
}
export function leadReportScopeKey(result: Pick<LeadReportReadResult, 'workspaceId' | 'viewerId' | 'policyRevision' | 'scope' | 'archiveVisibility' | 'exportScope'>): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.scope, result.archiveVisibility, result.exportScope ?? null]);
}
/** Strict native DTO adaptation; never infer current counts from historical evidence rows. */
export function adaptLeadReportResponse(raw: unknown, input: {
  request: LeadReportQuery; scopeKey: string; today: string; timezone: string;
}): { projection: NativeLeadReportProjection; current: ReportCurrentContextState; options: LeadReportReadResult['options'] } {
  const request = leadReportQuerySchema.parse(input.request), response = leadReportReadResultSchema.parse(raw);
  const result = response.report;
  if (JSON.stringify(response.query) !== JSON.stringify(request) || leadReportScopeKey(response) !== input.scopeKey ||
    result.today !== input.today || result.timezone !== input.timezone) {
    throw new Error('Leads report results no longer match this request or current authority. Reload the report.');
  }
  const snapshotLabel = `${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short',
    timeZone: result.timezone }).format(new Date(result.asOf))} (${result.timezone})`;
  const shared = { snapshotLabel, scopeLabel: result.scopeLabel, page: result.page, pageSize: result.pageSize };
  const current: ReportCurrentContextState = result.view === 'intake' ? { kind: 'ready', snapshot: {
    label: 'Current open Leads', count: result.currentOpenLeads, description: 'Current non-archived New, Contacted and Estimate sent Leads under independent current filters.',
    snapshotLabel, scopeLabel: result.scopeLabel, evidenceId: 'pipeline',
  } } : { kind: 'loading' };
  let projection: NativeLeadReportProjection;
  if (result.view === 'intake') {
    const range = { from: result.from, to: result.to };
    const spans = intakeTrendSpans(range);
    if (!spans) throw new Error('Invalid Leads intake trend period.');
    projection = { view: 'intake', state: { kind: 'ready', result: {
      ...shared, periodLabel: `${formatReportDate(result.from)} - ${formatReportDate(result.to)}`, total: result.total,
      sources: result.sources.map(group => ({ id: group.source,
        label: response.options.sources.find(item => item.value === group.source)!.label, count: group.count })),
      trend: { range, buckets: spans.spans.map(span => ({ ...span,
        count: result.trend.filter(day => day.date >= span.from && day.date <= span.to).reduce((sum, day) => sum + day.count, 0),
        ...(span.from === span.to ? { evidenceId: `trend:${span.from}` } : {}) })) },
      ...(request.view === 'intake' && request.trendBucket ? { selectedTrendBucket: request.trendBucket } : {}),
      evidenceId: 'intake', rows: result.rows.map(row => ({ ...row, cells: {
        created: row.cells.created, assignment: row.cells.assignment, source: row.cells.source,
      } })),
    } } };
  } else if (result.view === 'pipeline' || result.view === 'age') {
    projection = { view: result.view, state: { kind: 'ready', result: {
      ...shared, total: result.total, stages: { new: result.stages.new, contacted: result.stages.contacted, estimate_sent: result.stages['estimate-sent'] },
      ages: result.ages, selectedView: result.selection.kind === 'stage'
        ? { kind: 'stage', stage: result.selection.stage === 'estimate-sent' ? 'estimate_sent' : result.selection.stage } : result.selection,
      evidenceIds: { pipeline: 'pipeline', new: 'stage:new', contacted: 'stage:contacted', estimate_sent: 'stage:estimate-sent',
        '0-7': 'age:0-7', '8-14': 'age:8-14', '15-30': 'age:15-30', '31+': 'age:31+' },
      rows: result.rows.map(row => ({ ...row, stage: row.cells.stage === 'estimate-sent' ? 'estimate_sent'
        : row.cells.stage === 'new' ? 'new' : 'contacted', ageDays: Number(row.cells.age),
        cells: { created: row.cells.created, owner: row.cells.assignment, activity: row.cells.activity } })),
    } } };
  } else if (result.view === 'attention') {
    projection = { view: 'attention', state: { kind: 'ready', result: { ...shared,
      inactivityCutoffLabel: `${result.inactivityCutoff} (exact timestamp)`, counts: result.counts, selectedView: result.selection,
      evidenceIds: { inactive: 'inactive', unowned: 'unowned', combined: 'combined' }, rows: result.rows } } };
  } else if (result.view === 'won' || result.view === 'lost') {
    projection = { view: result.view, state: { kind: 'ready', result: { ...shared,
      periodLabel: `${formatReportDate(result.from)} - ${formatReportDate(result.to)}`, counts: result.counts,
      coverage: result.coverage, selectedOutcome: result.view, evidenceIds: { won: 'won', lost: 'lost' }, rows: result.rows } } };
  } else {
      throw new Error('Unsupported native Leads report response.');
  }
  return { projection, current, options: response.options };
}

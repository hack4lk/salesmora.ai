import { activityReportQuerySchema, activityReportResultSchema,
  activityReportReadResultSchema, type ActivityReportReadResult,
  type ActivityReportQuery, type ActivityReportResult as BackendResult } from '@salesmora/contracts';
import { formatReportDate, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { ActivityReportState, ActivityRecordReference } from './activity-report';
import { activityReportData as copy } from './activity-report.data';
import { validActivityReportResult, type ActivityFilterOptions, type ActivityFiltersValue } from './activity-report.validation';

export function activityReportRequest(input: {
  workspaceId: string; range: { from: string; to: string }; filters: ActivityFiltersValue; page: number; pageSize: number;
}): ActivityReportQuery {
  return activityReportQuerySchema.parse({
    workspaceId: input.workspaceId, view: 'activity', period: { from: input.range.from, to: input.range.to },
    filters: input.filters, page: input.page, pageSize: input.pageSize,
  });
}

const sameSelection = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && left.every(value => right.includes(value));

export function activityReportScopeKey(result: ActivityReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.authority,
    result.report.includedDomains, result.report.omittedDomains, result.exportScopes]);
}
export function adaptActivityReadResponse(raw: unknown, input: {
  request: ActivityReportQuery; period: ReportPeriodSelection; scopeKey: string; today: string; timezone: string;
  includedDomains: BackendResult['includedDomains'];
}) {
  const parsed = activityReportReadResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Activity report data does not match the current request, authority or evidence. Reload the report.');
  if (activityReportScopeKey(parsed.data) !== input.scopeKey) {
    throw new Error('Activity report authority has changed. Reload the report.');
  }
  return adaptActivityReportResponse(parsed.data.report, { ...input, canRead: true });
}
export function visibleActivityRecord(result: ActivityReportReadResult, record: ActivityRecordReference): boolean {
  return result.report.rows.some(row => row.domain === record.domain && row.recordId === record.recordId);
}

/** Match current host authority before exposing backend evidence or period facets. */
export function adaptActivityReportResponse(raw: unknown, input: {
  request: ActivityReportQuery; period: ReportPeriodSelection; scopeKey: string; canRead: boolean;
  today: string; timezone: string; includedDomains: BackendResult['includedDomains'];
}): { scopeKey: string; state: ActivityReportState; filterOptions: ActivityFilterOptions } {
  const request = activityReportQuerySchema.parse(input.request);
  const response = activityReportResultSchema.parse(raw);
  if (!input.canRead || !input.scopeKey.trim() || response.workspaceId !== request.workspaceId ||
    response.from !== request.period.from || response.to !== request.period.to ||
    response.today !== input.today || response.timezone !== input.timezone ||
    response.pageSize !== request.pageSize ||
    response.page !== Math.min(request.page, Math.max(1, Math.ceil(response.total / response.pageSize))) ||
    !sameSelection(response.filters.domains, request.filters.domains) ||
    !sameSelection(response.filters.actions, request.filters.actions) ||
    !sameSelection(response.filters.actors, request.filters.actors) ||
    response.includedDomains.length !== input.includedDomains.length ||
    !response.includedDomains.every(item => input.includedDomains.some(expected =>
      expected.domain === item.domain && expected.scope === item.scope && expected.archiveVisibility === item.archiveVisibility))) {
    throw new Error('Activity results do not match the current request or authority. Retry the report.');
  }
  const filterOptions: ActivityFilterOptions = {
    domains: response.options.domains.map(value => ({ value, label: copy.domains[value] })),
    actions: response.options.actions.map(value => ({ value, label: copy.actions[value] })),
    actors: response.options.actors,
  };
  const archives = response.includedDomains.map(item => `${copy.domains[item.domain]}: ${item.scope}, archives ${item.archiveVisibility}`).join('; ');
  const omitted = response.omittedDomains.map(item => `${copy.domains[item.domain]} (${item.reason})`).join(', ');
  const result = {
    from: response.from, to: response.to, today: response.today, timezone: response.timezone,
    periodLabel: `${formatReportDate(response.from)} - ${formatReportDate(response.to)}`,
    snapshotLabel: `Authorized native history / ${new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: response.timezone,
    }).format(new Date(response.asOf))} (${response.timezone})`,
    scopeLabel: `${response.scopeLabel} Coverage: ${archives}.${omitted ? ` Omitted: ${omitted}.` : ''}`,
    filters: response.filters, total: response.total, rows: response.rows, page: response.page, pageSize: response.pageSize,
  };
  if (!validActivityReportResult(result, input.period, request.filters, filterOptions, input.today, input.timezone)) {
    throw new Error('Activity facets and ordered evidence cannot be displayed consistently. Retry the report.');
  }
  return { scopeKey: input.scopeKey, state: { kind: 'ready', result }, filterOptions };
}

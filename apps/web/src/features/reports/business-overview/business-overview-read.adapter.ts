import { businessOverviewQuerySchema, businessOverviewReadResultSchema,
  type BusinessOverviewQuery, type BusinessOverviewReadResult } from '@salesmora/contracts';
import { adaptBusinessOverviewResponse } from './business-overview.adapter';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';

export function businessOverviewScopeKey(result: BusinessOverviewReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.authority]);
}
export function adaptBusinessOverviewReadResponse(raw: unknown, input: {
  request: BusinessOverviewQuery; period: ReportPeriodSelection; scopeKey: string; today: string; timezone: string;
}) {
  const request = businessOverviewQuerySchema.parse(input.request), response = businessOverviewReadResultSchema.parse(raw);
  if (JSON.stringify(response.query) !== JSON.stringify(request) || businessOverviewScopeKey(response) !== input.scopeKey ||
    response.report.today !== input.today || response.report.timezone !== input.timezone) {
    throw new Error('Overview results no longer match this request or current authority. Reload the report.');
  }
  return adaptBusinessOverviewResponse(response.report, { ...input, request, canRead: true, authority: response.authority });
}

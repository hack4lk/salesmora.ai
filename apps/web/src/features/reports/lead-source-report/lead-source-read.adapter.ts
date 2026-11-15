import { leadSourceQuerySchema, leadSourceReadResultSchema, type LeadSourceQuery, type LeadSourceReadResult } from '@salesmora/contracts';
import { adaptLeadSourceReportResponse } from './lead-source-report.adapter';

export function leadSourceScopeKey(result: LeadSourceReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.scope,
    result.archiveVisibility, result.canReadConversion, result.canReadAcceptedValue, result.canExport]);
}
export function adaptLeadSourceReadResponse(raw: unknown, input: {
  request: LeadSourceQuery; scopeKey: string; today: string; timezone: string;
}) {
  const request = leadSourceQuerySchema.parse(input.request), response = leadSourceReadResultSchema.parse(raw);
  if (JSON.stringify(response.query) !== JSON.stringify(request) || leadSourceScopeKey(response) !== input.scopeKey ||
    response.report.today !== input.today || response.report.timezone !== input.timezone) {
    throw new Error('Sources report results no longer match this request or current authority. Reload the report.');
  }
  return adaptLeadSourceReportResponse(response.report, {
    request, scopeKey: input.scopeKey, scope: response.scope, archiveVisibility: response.archiveVisibility,
    canReadConversion: response.canReadConversion, canReadAcceptedValue: response.canReadAcceptedValue,
  });
}

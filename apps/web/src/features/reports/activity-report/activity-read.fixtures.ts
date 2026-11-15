import { activityReportQuerySchema, activityReportReadResultSchema, type ActivityReportQuery } from '@salesmora/contracts';
import { activityBackendResponse, activityBackendWorkspaceId } from './activity-report.adapter.fixtures';

export const initialActivityQuery = activityReportQuerySchema.parse({ workspaceId: activityBackendWorkspaceId,
  view: 'activity', period: { from: '2026-10-08', to: '2026-11-06' } });
export function activityReadResponse(query = initialActivityQuery, input: Parameters<typeof activityBackendResponse>[1] = {}) {
  return activityReportReadResultSchema.parse({
    workspaceId: query.workspaceId, viewerId: 'activity-story-viewer', policyRevision: 1,
    authority: { scope: 'workspace' }, exportScopes: [], query, report: activityBackendResponse(query, input),
  });
}
export function largeActivityReadResponse(query: ActivityReportQuery) {
  const base = activityBackendResponse(initialActivityQuery).rows;
  return activityReadResponse(query, { rows: base.flatMap(row => Array.from({ length: 26 }, (_, copy) => ({
    ...row, eventId: `00000000-0000-4000-8000-${String(Number(row.eventId.slice(-12)) * 100 + copy).padStart(12, '0')}`,
    recordId: `00000000-0000-4000-8000-${String(Number(row.recordId.slice(-12)) * 100 + copy).padStart(12, '0')}`,
    recordLabel: `${row.recordLabel} / copy ${copy}`,
  }))) });
}

import { businessOverviewQuerySchema, businessOverviewReadResultSchema, type BusinessOverviewQuery,
  type BusinessOverviewReadAuthority } from '@salesmora/contracts';
import { overviewBackendAuthority, overviewBackendResponse, overviewBackendWorkspaceId } from './business-overview.adapter.fixtures';

export const initialOverviewQuery = businessOverviewQuerySchema.parse({
  workspaceId: overviewBackendWorkspaceId, view: 'business-overview', period: { from: '2026-10-01', to: '2026-10-31' },
});
export function overviewReadResponse(query: BusinessOverviewQuery, authority: BusinessOverviewReadAuthority = overviewBackendAuthority,
  invalidMoney = false) {
  return businessOverviewReadResultSchema.parse({
    workspaceId: query.workspaceId, viewerId: authority.calendar?.kind === 'own' ? authority.calendar.viewerId : 'overview-viewer',
    policyRevision: 1, query, authority, report: overviewBackendResponse(query, authority, invalidMoney),
  });
}

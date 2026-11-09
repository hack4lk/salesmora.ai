import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { resolveActivityReportExportScopes } from './activity-export-access';

/** Financial sections retain independent parent export and monetary read authority. */
export function resolveFinancialReportExportAccess(context: AuthorizationContext) {
  const unavailable = { estimates: null, materials: null };
  if (!authorize(context, { permission: 'reports.financial.read' }).allowed) return unavailable;
  const scopes = resolveActivityReportExportScopes(context);
  const can = (permission: 'workorders.view_prices' | 'workorders.view_costs') => authorize(context, {
    permission, resource: { kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, job: null },
  }).allowed;
  return {
    estimates: scopes.estimate,
    materials: scopes['work-order'] && can('workorders.view_prices') && can('workorders.view_costs')
      ? { scope: scopes['work-order'], jobScope: scopes.job } : null,
  };
}

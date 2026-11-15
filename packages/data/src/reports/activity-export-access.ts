import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { customerCapabilities } from '../customers/store';
import { resolveLeadReportExportScope } from './lead-export-access';
import { resolveJobReportExportScope } from './job-export-access';
import { resolveEstimateReportExportAccess } from './estimate-export-access';

export type ActivityExportScopes = {
  lead: 'workspace' | 'assigned' | null;
  customer: 'workspace' | null;
  job: 'workspace' | 'assigned' | null;
  estimate: 'workspace' | 'assigned' | null;
  'work-order': 'workspace' | 'assigned' | null;
};

/** Every Activity domain is independently limited by its parent read and export grants. */
export function resolveActivityReportExportScopes(context: AuthorizationContext): ActivityExportScopes {
  const none: ActivityExportScopes = { lead: null, customer: null, job: null, estimate: null, 'work-order': null };
  if (!authorize(context, { permission: 'reports.export' }).allowed) return none;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!report.allowed || report.resourceKind !== 'report') return none;
  const orders = resolveAuthorizedCollectionScope(context, 'workorders.read');
  const orderExport = resolveAuthorizedCollectionScope(context, 'workorders.export');
  const estimate = resolveEstimateReportExportAccess(context);
  const customers = customerCapabilities(context);
  const orderScope = orders.allowed && orders.resourceKind === 'work_order' &&
    orderExport.allowed && orderExport.resourceKind === 'work_order' &&
    ['workspace', 'assigned_job'].includes(orders.scope) && ['workspace', 'assigned_job'].includes(orderExport.scope)
    ? report.scope === 'assigned' || orders.scope === 'assigned_job' || orderExport.scope === 'assigned_job'
      ? 'assigned' : 'workspace'
    : null;
  return {
    lead: resolveLeadReportExportScope(context),
    customer: report.scope === 'workspace' && customers.read && customers.export ? 'workspace' : null,
    job: resolveJobReportExportScope(context),
    estimate: estimate ? estimate.scope === 'workspace' ? 'workspace' : 'assigned' : null,
    'work-order': orderScope,
  };
}

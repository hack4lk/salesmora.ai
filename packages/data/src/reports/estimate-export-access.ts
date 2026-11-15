import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';

type EstimateExportAccess = { scope: 'workspace' | 'assigned_job'; handoff: boolean };

/** Export authority may narrow Estimate reads and never implies Lead or Job export authority. */
export function resolveEstimateReportExportAccess(context: AuthorizationContext): EstimateExportAccess | null {
  if (!authorize(context, { permission: 'reports.export' }).allowed) return null;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const read = resolveAuthorizedCollectionScope(context, 'estimates.read');
  const exportAccess = resolveAuthorizedCollectionScope(context, 'estimates.export');
  if (!report.allowed || report.resourceKind !== 'report' ||
    !read.allowed || read.resourceKind !== 'estimate' || !['workspace', 'assigned_job'].includes(read.scope) ||
    !exportAccess.allowed || exportAccess.resourceKind !== 'estimate' ||
    !['workspace', 'assigned_job'].includes(exportAccess.scope)) return null;
  const assigned = report.scope === 'assigned' || read.scope === 'assigned_job' || exportAccess.scope === 'assigned_job';
  if (assigned && !report.sourceScopes?.job) return null;
  const leadsRead = resolveAuthorizedCollectionScope(context, 'leads.read');
  const leadsExport = resolveAuthorizedCollectionScope(context, 'leads.export');
  const jobsRead = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const jobsExport = resolveAuthorizedCollectionScope(context, 'jobs.export');
  const handoff = !assigned && report.sourceScopes?.lead === 'workspace' && report.sourceScopes.job === 'workspace' &&
    leadsRead.allowed && leadsRead.resourceKind === 'lead' && leadsRead.scope === 'workspace' &&
    leadsExport.allowed && leadsExport.resourceKind === 'lead' && leadsExport.scope === 'workspace' &&
    jobsRead.allowed && jobsRead.resourceKind === 'job' && jobsRead.scope === 'workspace' &&
    jobsExport.allowed && jobsExport.resourceKind === 'job' && jobsExport.scope === 'workspace';
  return { scope: assigned ? 'assigned_job' : 'workspace', handoff };
}

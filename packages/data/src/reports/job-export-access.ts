import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';

export function resolveJobReportExportScope(context: AuthorizationContext): 'workspace' | 'assigned' | null {
  if (!authorize(context, { permission: 'reports.export' }).allowed) return null;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const read = resolveAuthorizedCollectionScope(context, 'jobs.read');
  const exportAccess = resolveAuthorizedCollectionScope(context, 'jobs.export');
  if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.job ||
    !read.allowed || read.resourceKind !== 'job' || !['workspace', 'assigned'].includes(read.scope) ||
    !exportAccess.allowed || exportAccess.resourceKind !== 'job' ||
    !['workspace', 'assigned'].includes(exportAccess.scope)) return null;
  return report.scope === 'assigned' || report.sourceScopes.job === 'assigned' ||
    read.scope === 'assigned' || exportAccess.scope === 'assigned' ? 'assigned' : 'workspace';
}

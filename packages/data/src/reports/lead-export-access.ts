import type { AuthorizationContext } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { resolveExportScope } from '../leads/export-access';

/** Report CSV adds its own gate and intersects native read, source and export scopes. */
export function resolveLeadReportExportScope(context: AuthorizationContext): 'workspace' | 'assigned' | null {
  if (!authorize(context, { permission: 'reports.export' }).allowed) return null;
  const reports = resolveAuthorizedCollectionScope(context, 'reports.read');
  const leads = resolveExportScope(context);
  if (!reports.allowed || reports.resourceKind !== 'report' || !reports.sourceScopes?.lead || !leads) return null;
  return leads === 'assigned' || reports.scope === 'assigned' || reports.sourceScopes.lead === 'assigned'
    ? 'assigned' : 'workspace';
}

import type { AuthorizationContext, LeadSourceExportInput } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { resolveExportScope } from '../leads/export-access';

type Scope = 'workspace' | 'assigned';
type Availability = { kind: 'available'; scope: 'workspace' } | { kind: 'unavailable'; reason: 'permissions' };
export type LeadSourceExportAccess = {
  leadScope: Scope;
  leadArchiveVisibility: 'included' | 'excluded';
  conversion: Availability;
  acceptedValue: Availability;
};

function workspaceCollection(context: AuthorizationContext, permission: 'jobs.read' | 'jobs.export' |
  'estimates.read' | 'estimates.export') {
  const access = resolveAuthorizedCollectionScope(context, permission);
  return access.allowed && access.resourceKind === (permission.startsWith('jobs.') ? 'job' : 'estimate') &&
    access.scope === 'workspace';
}

/** Resolves separate Sources output scopes; unavailable supporting data is never queried for export. */
export function resolveLeadSourceExportAccess(context: AuthorizationContext): LeadSourceExportAccess | null {
  if (!authorize(context, { permission: 'reports.export' }).allowed) return null;
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  const leadScope = resolveExportScope(context);
  if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.lead || !leadScope) return null;
  const effectiveLeadScope: Scope = report.scope === 'assigned' || report.sourceScopes.lead === 'assigned' ||
    leadScope === 'assigned' ? 'assigned' : 'workspace';
  const leadArchiveVisibility = authorize(context, {
    permission: 'leads.archive',
    resource: { kind: 'lead', id: context.workspaceId, workspaceId: context.workspaceId, ownerId: null },
  }).allowed ? 'included' : 'excluded';
  const conversionAllowed = effectiveLeadScope === 'workspace' && report.scope === 'workspace' &&
    report.sourceScopes.lead === 'workspace' && report.sourceScopes.job === 'workspace' &&
    leadArchiveVisibility === 'included' &&
    workspaceCollection(context, 'jobs.read') && workspaceCollection(context, 'jobs.export');
  const acceptedValueAllowed = conversionAllowed && leadArchiveVisibility === 'included' &&
    workspaceCollection(context, 'estimates.read') && workspaceCollection(context, 'estimates.export') &&
    authorize(context, {
      permission: 'estimates.archive',
      resource: { kind: 'estimate', id: context.workspaceId, workspaceId: context.workspaceId, job: null },
    }).allowed;
  return {
    leadScope: effectiveLeadScope, leadArchiveVisibility,
    conversion: conversionAllowed ? { kind: 'available', scope: 'workspace' }
      : { kind: 'unavailable', reason: 'permissions' },
    acceptedValue: acceptedValueAllowed ? { kind: 'available', scope: 'workspace' }
      : { kind: 'unavailable', reason: 'permissions' },
  };
}
export function canExportLeadSourceDataset(access: LeadSourceExportAccess, dataset: LeadSourceExportInput['dataset']) {
  return dataset === 'source-groups' || dataset === 'cohort' ||
    dataset === 'converted' && access.conversion.kind === 'available' ||
    dataset === 'accepted-estimates' && access.acceptedValue.kind === 'available';
}

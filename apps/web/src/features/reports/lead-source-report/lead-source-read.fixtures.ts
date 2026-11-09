import { leadSourceQuerySchema, leadSourceReadResultSchema, type LeadSourceQuery } from '@salesmora/contracts';
import { sourceBackendResponse, sourceBackendWorkspaceId, sourceBackendRange } from './lead-source-report.adapter.fixtures';
import { leadSourceCohort } from './lead-source-report.fixtures';

export const initialLeadSourceQuery = leadSourceQuerySchema.parse({
  workspaceId: sourceBackendWorkspaceId, view: 'lead-source', period: sourceBackendRange, selected: 'cohort',
});
export function sourceReadResponse(query: LeadSourceQuery, options: {
  scope?: 'workspace' | 'assigned'; canReadConversion?: boolean; canReadAcceptedValue?: boolean; canExport?: boolean;
  invalidMoney?: boolean; replacement?: boolean;
} = {}) {
  const scope = options.scope ?? 'workspace';
  const canReadConversion = scope === 'workspace' && (options.canReadConversion ?? true);
  const canReadAcceptedValue = canReadConversion && (options.canReadAcceptedValue ?? true);
  const population = scope === 'assigned' ? leadSourceCohort.slice(0, 1) : leadSourceCohort;
  const report = sourceBackendResponse(query, { canReadConversion, canReadAcceptedValue,
    cohort: options.replacement ? population.map(row => ({ ...row, label: `Replacement ${row.label}` })) : population });
  return leadSourceReadResultSchema.parse({
    workspaceId: query.workspaceId, viewerId: scope === 'workspace' ? 'source-viewer' : 'source-field', policyRevision: 1,
    scope, archiveVisibility: scope === 'workspace' ? 'included' : 'excluded',
    canReadConversion, canReadAcceptedValue, canExport: scope === 'workspace' && (options.canExport ?? true), query,
    report: { ...report, scope, archiveVisibility: scope === 'workspace' ? 'included' : 'excluded',
      ...(options.invalidMoney ? {
        acceptedValue: { kind: 'unavailable', reason: 'invalid-money', explanation: 'The frozen quote value could not be verified.' },
        groups: report.groups.map(group => ({ ...group, acceptedValueCents: null, acceptedEstimateCount: null })),
      } : {}),
    },
  });
}

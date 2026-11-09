import { leadSourceResultSchema, type LeadSourceQuery } from '@salesmora/contracts';
import { leadSourceCohort, leadSourceResponse } from './lead-source-report.fixtures';

export const sourceBackendWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const sourceBackendScopeKey = 'source-backend-workspace-authority';
export const sourceBackendEmptyFilters = { stages: [], owners: [], sources: [] };
export const sourceBackendRange = { from: '2026-10-01', to: '2026-10-31' };
function uuid(number: number) {
  return `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
}
function leadId(id: string) {
  const match = /^(?:lead-)?L(\d+)$/.exec(id);
  if (!match) throw new Error('Unknown source Lead mock identity.');
  return uuid(100 + Number(match[1]));
}

/** Bridge the established fictional aggregation into strict backend shapes, without a second value calculation. */
export function sourceBackendResponse(request: LeadSourceQuery, options: {
  canReadConversion?: boolean; canReadAcceptedValue?: boolean;
  cohort?: typeof leadSourceCohort;
} = {}) {
  const canReadConversion = options.canReadConversion ?? true;
  const canReadAcceptedValue = canReadConversion && (options.canReadAcceptedValue ?? true);
  const base = leadSourceResponse(options.cohort ?? leadSourceCohort, {
    kind: request.selected, from: request.period.from, to: request.period.to,
    canReadConversion, canReadAcceptedValue, pageSize: request.pageSize,
  });
  const total = request.selected === 'cohort' ? base.cohort : request.selected === 'converted'
    ? base.conversion.kind === 'available' ? base.conversion.converted : 0
    : base.acceptedValue.kind === 'available' ? base.acceptedValue.estimateCount : 0;
  const page = Math.min(request.page, Math.max(1, Math.ceil(total / request.pageSize)));
  const result = leadSourceResponse(options.cohort ?? leadSourceCohort, {
    kind: request.selected, from: request.period.from, to: request.period.to,
    canReadConversion, canReadAcceptedValue, page, pageSize: request.pageSize,
  });
  const evidence = result.evidence.kind === 'accepted-estimates'
    ? { kind: 'accepted-estimates', rows: result.evidence.rows.map(row => {
      const index = Number(row.familyId.replace('EF-', ''));
      if (!Number.isInteger(index) || index < 1) throw new Error('Unknown source Estimate mock identity.');
      const number = `EST-${String(index).padStart(4, '0')}`;
      return { ...row, familyId: `${request.workspaceId}:${number}`, estimateNumber: number, recordId: uuid(200 + index),
        ...(row.linkedLead ? { linkedLead: { ...row.linkedLead, recordId: leadId(row.linkedLead.recordId) } } : {}) };
    }) }
    : { kind: result.evidence.kind, rows: result.evidence.rows.map(row => ({
      ...row, id: leadId(row.id), recordId: leadId(row.id), archived: row.id === 'L3',
    })) };
  return leadSourceResultSchema.parse({
    workspaceId: request.workspaceId, view: 'lead-source', from: result.from, to: result.to,
    today: result.today, timezone: 'America/New_York', asOf: '2026-11-06T14:00:00Z',
    scope: 'workspace', archiveVisibility: 'included', scopeLabel: result.scopeLabel, cohort: result.cohort,
    conversion: result.conversion.kind === 'available' ? { kind: 'available', converted: result.conversion.converted }
      : { kind: 'unavailable', explanation: 'Complete supporting Lead/Job authority is unavailable.' },
    acceptedValue: result.acceptedValue.kind === 'available'
      ? { kind: 'available', preTaxCents: result.acceptedValue.preTaxCents, estimateCount: result.acceptedValue.estimateCount,
        unattributedPreTaxCents: result.acceptedValue.unattributedPreTaxCents, unattributedCount: result.acceptedValue.unattributedCount }
      : { kind: 'unavailable', reason: 'permissions', explanation: 'Complete workspace Lead, Job and Estimate access, including archives, is required.' },
    groups: result.groups, evidence, evidenceTotal: total, page, pageSize: request.pageSize,
  });
}

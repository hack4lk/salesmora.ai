import { describe, expect, it } from 'vitest';
import type { LeadSourceQuery } from '@salesmora/contracts';
import { adaptLeadSourceReportResponse, leadSourceReportRequest } from './lead-source-report.adapter';
import { sourceBackendResponse, sourceBackendWorkspaceId, sourceBackendScopeKey,
  sourceBackendEmptyFilters, sourceBackendRange } from './lead-source-report.adapter.fixtures';
import { leadSourceCohort } from './lead-source-report.fixtures';
import { validLeadSourceResult } from './lead-source-report.validation';

const authority = { scopeKey: sourceBackendScopeKey, scope: 'workspace', archiveVisibility: 'included',
  canReadConversion: true, canReadAcceptedValue: true } as const;
function request(evidenceId = 'source-cohort', patch: Partial<Parameters<typeof leadSourceReportRequest>[0]> = {}) {
  return leadSourceReportRequest({ workspaceId: sourceBackendWorkspaceId, range: sourceBackendRange, evidenceId,
    page: 1, pageSize: 25, filters: sourceBackendEmptyFilters, ...patch });
}
function adapt(query: LeadSourceQuery, raw: unknown = sourceBackendResponse(query)) {
  return adaptLeadSourceReportResponse(raw, { ...authority, request: query });
}
function ready(query: LeadSourceQuery) {
  const projection = adapt(query);
  if (projection.state.kind !== 'ready') throw new Error('Expected ready source projection.');
  return projection.state.result;
}
describe('Sources backend-to-canonical adapter', () => {
  it('maps canonical evidence actions into strict requests and rejects unsupported filters or selections', () => {
    for (const [id, kind] of [['source-cohort', 'cohort'], ['source-converted', 'converted'], ['source-accepted-value', 'accepted-estimates']]) {
      expect(request(id).selected).toBe(kind);
    }
    for (const patch of [
      { evidenceId: 'unknown' }, { pageSize: 1 }, { page: 0 }, { range: { from: 'bad', to: 'bad' } },
      { filters: { ...sourceBackendEmptyFilters, stages: ['new'] } },
      { filters: { ...sourceBackendEmptyFilters, owners: ['me'] } },
      { filters: { ...sourceBackendEmptyFilters, sources: ['website'] } },
    ]) expect(() => request('source-cohort', patch)).toThrow();
    expect(request()).not.toHaveProperty('filters');
  });
  it('adapts all evidence shapes with canonical identities, reconciled money and business-local labels', () => {
    for (const id of ['source-cohort', 'source-converted', 'source-accepted-value']) {
      const query = request(id), projection = adapt(query), result = ready(query);
      expect(projection.view).toBe('source');
      expect(projection.scopeKey).toBe(sourceBackendScopeKey);
      expect(validLeadSourceResult(result, true, true)).toBe(true);
      expect(result.snapshotLabel).toContain('09:00');
      expect(result.snapshotLabel).toContain('America/New_York');
      expect(result.scopeLabel).toContain('Authorized archived Leads included');
      expect(result.cohortEvidenceId).toBe('source-cohort');
      expect(result.conversion).toMatchObject({ kind: 'available', evidenceId: 'source-converted', converted: 2 });
      expect(result.acceptedValue).toMatchObject({ kind: 'available', evidenceId: 'source-accepted-value',
        preTaxCents: 265000, estimateCount: 4, unattributedCount: 1 });
      if (result.evidence.kind !== 'accepted-estimates') {
        expect(result.evidence.rows[0]?.recordId).toBe('00000000-0000-4000-8000-000000000101');
      } else {
        expect(result.evidence.rows.some(row => row.acceptedDate > result.to)).toBe(true);
        expect(result.evidence.rows.filter(row => row.source === null).every(row => !row.linkedLead)).toBe(true);
        expect(result.evidence.rows[0]?.familyId).toBe(`${sourceBackendWorkspaceId}:EST-0001`);
        expect(result.evidence.rows[0]?.linkedLead?.recordId).toBe('00000000-0000-4000-8000-000000000101');
      }
      expect(JSON.stringify(result)).not.toContain('"asOf"');
    }
  });
  it('rejects stale workspace, range, evidence, size and non-clamped pages', () => {
    const query = request(), raw = sourceBackendResponse(query);
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000099' }, { view: 'calendar-scheduled' },
      { from: '2026-09-01' }, { to: '2026-11-05' }, { pageSize: 50 }, { page: 2 },
    ]) expect(() => adapt(query, { ...raw, ...patch })).toThrow();
    expect(() => adapt(query, sourceBackendResponse(request('source-converted')))).toThrow();
    const firstPageOnly = request('source-cohort', { page: 999 });
    expect(ready(firstPageOnly).page).toBe(1);
  });
  it('rejects current authority mismatches instead of accepting stale privileged fields', () => {
    const query = request(), raw = sourceBackendResponse(query);
    for (const patch of [
      { scopeKey: '' }, { scope: 'assigned' as const }, { archiveVisibility: 'excluded' as const },
      { canReadConversion: false }, { canReadAcceptedValue: false },
    ]) expect(() => adaptLeadSourceReportResponse(raw, { ...authority, request: query, ...patch })).toThrow();
  });
  it('preserves unavailable value explanations and allows authorized cohorts with redacted supporting sections', () => {
    const query = request();
    for (const canReadConversion of [true, false]) {
      const raw = sourceBackendResponse(query, { canReadConversion, canReadAcceptedValue: false });
      const projection = adaptLeadSourceReportResponse(raw, { ...authority, request: query,
        canReadConversion, canReadAcceptedValue: false });
      if (projection.state.kind !== 'ready') throw new Error('Expected ready cohort.');
      expect(projection.state.result.cohort).toBe(4);
      expect(projection.state.result.acceptedValue).toMatchObject({ kind: 'unavailable', explanation: raw.acceptedValue.kind === 'unavailable' ? raw.acceptedValue.explanation : '' });
      expect(projection.state.result.groups.every(group => group.acceptedValueCents === null)).toBe(true);
    }
    const raw = sourceBackendResponse(query, { canReadAcceptedValue: false });
    const invalid = { ...raw, acceptedValue: { kind: 'unavailable', reason: 'invalid-money', explanation: 'Frozen quote could not be verified.' } };
    const projection = adapt(query, invalid);
    if (projection.state.kind !== 'ready') throw new Error('Expected valid redacted projection.');
    expect(projection.state.result.acceptedValue).toEqual({ kind: 'unavailable', explanation: 'Frozen quote could not be verified.' });
  });
  it('adapts assigned cohorts and excluded archives without inventing conversion or value', () => {
    const query = request(), base = sourceBackendResponse(query, { canReadConversion: false });
    if (base.evidence.kind !== 'cohort') throw new Error('Expected cohort evidence.');
    const raw = { ...base, scope: 'assigned', archiveVisibility: 'excluded',
      evidence: { kind: 'cohort', rows: base.evidence.rows.map(row => ({ ...row, archived: false })) } };
    const projection = adaptLeadSourceReportResponse(raw, { ...authority, request: query,
      scope: 'assigned', archiveVisibility: 'excluded', canReadConversion: false, canReadAcceptedValue: false });
    if (projection.state.kind !== 'ready') throw new Error('Expected assigned projection.');
    expect(projection.state.result.scopeLabel).toContain('Archived Leads excluded');
    expect(projection.state.result.conversion.kind).toBe('unavailable');
  });
  it('rejects fabricated money, duplicate families, guessed Leads and malformed timezone configuration', () => {
    const query = request('source-accepted-value'), raw = sourceBackendResponse(query);
    if (raw.evidence.kind !== 'accepted-estimates') throw new Error('Expected Estimate evidence.');
    const rows = raw.evidence.rows;
    for (const patch of [
      { acceptedValue: { kind: 'available', preTaxCents: 1, estimateCount: 4, unattributedCount: 1, unattributedPreTaxCents: 40000 } },
      { evidence: { kind: 'accepted-estimates', rows: [rows[0], rows[0], ...rows.slice(2)] } },
      { evidence: { kind: 'accepted-estimates', rows: rows.map(row => row.source === null
        ? { ...row, linkedLead: { recordId: '00000000-0000-4000-8000-000000000101', label: 'Guessed Lead' } } : row) } },
      { timezone: 'Unknown/Timezone' },
    ]) expect(() => adapt(query, { ...raw, ...patch })).toThrow();
  });
  it('handles empty results and paged cohort evidence using exact backend clamping', () => {
    const query = request('source-cohort', { page: 999 });
    const empty = adapt(query, sourceBackendResponse(query, { cohort: [] }));
    if (empty.state.kind !== 'ready') throw new Error('Expected empty result.');
    expect(empty.state.result.page).toBe(1);
    expect(empty.state.result.cohort).toBe(0);
    const cohort = Array.from({ length: 27 }, (_, i) => ({ ...leadSourceCohort[0]!,
      id: `L${i + 10}`, recordId: `lead-L${i + 10}`, converted: false }));
    const firstQuery = request(), first = adapt(firstQuery, sourceBackendResponse(firstQuery, { cohort }));
    const last = adapt(query, sourceBackendResponse(query, { cohort }));
    if (first.state.kind !== 'ready' || last.state.kind !== 'ready') throw new Error('Expected paged result.');
    expect(first.state.result.evidence.rows).toHaveLength(25);
    expect(last.state.result.page).toBe(2);
    expect(last.state.result.evidence.rows).toHaveLength(2);
    expect(new Set([...first.state.result.evidence.rows, ...last.state.result.evidence.rows]
      .map(row => row.label + ('id' in row ? row.id : row.familyId))).size).toBe(27);
  });
});

import { describe, expect, it } from 'vitest';
import { estimateReportQuerySchema, type EstimateReportReadResult } from '@salesmora/contracts';
import { adaptEstimateReadResponse, estimateReportEvidenceSelection, estimateReportRequest, estimateReportScopeKey,
  initialEstimateEvidence, visibleEstimateRecord } from './estimate-read.adapter';
import { estimateReadAuthority, estimateReadResponse, initialEstimateQuery } from './estimate-read.fixtures';
import { validEstimateReportProjection } from './estimate-report-workspace.validation';

const empty = { owners: [], parents: [] };
function adapt(raw: EstimateReportReadResult) {
  return adaptEstimateReadResponse(raw, { request: raw.query, scopeKey: estimateReportScopeKey(raw),
    today: raw.today, timezone: raw.report.timezone });
}
function request(view: 'decisions' | 'first-quoted' | 'current') {
  return estimateReportRequest({ workspaceId: initialEstimateQuery.workspaceId, view,
    range: { from: '2026-10-01', to: '2026-10-31' }, filters: { period: empty, current: empty },
    evidence: initialEstimateEvidence, page: 1, pageSize: 25 });
}
describe('Estimates native-to-canonical adapter', () => {
  it('keeps independent period/current drafts and strips period bookkeeping from current reads', () => {
    const filters = { period: { owners: ['member:b'], parents: ['lead'] }, current: { owners: ['member:a'], parents: [] } };
    const range = { from: '2026-10-01', to: '2026-10-31', preset: 'custom' };
    for (const view of ['decisions', 'first-quoted', 'current'] as const) {
      const query = estimateReportRequest({ workspaceId: initialEstimateQuery.workspaceId, view,
        range,
        filters, evidence: initialEstimateEvidence, page: 1, pageSize: 50 });
      expect(query.filters).toEqual(filters[view === 'current' ? 'current' : 'period']);
      if (view === 'current') expect(query).not.toHaveProperty('period');
      else expect('period' in query && query.period).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    }
  });
  it('preserves corrected effective decisions, frozen discounts, archives and latest-issued rather than newer-draft context', () => {
    const raw = estimateReadResponse(estimateReportQuerySchema.parse({ ...initialEstimateQuery, selected: 'decided' }));
    const { projection } = adapt(raw);
    if (projection.view !== 'decisions' || projection.state.kind !== 'ready') throw new Error('Expected Decisions.');
    expect(projection.state.result.counts).toEqual({ accepted: 1, declined: 1 });
    expect(projection.state.result.money).toEqual({ kind: 'available', preTaxCents: 9000, customerTotalCents: 9900 });
    expect(projection.state.result.rows.find(row => row.label.startsWith('E3'))).toMatchObject({
      outcome: 'declined', decisionVersion: 2, decisionDate: '2026-10-13', recordedDate: '2026-11-02', archived: true });
    const current = adapt(estimateReadResponse(request('current'))).projection;
    if (current.view !== 'current' || current.state.kind !== 'ready') throw new Error('Expected Current.');
    expect(current.state.result.rows.find(row => row.label.startsWith('E1'))).toMatchObject({ revision: 1, issuedDate: '2026-09-25' });
    expect(current.state.result.counts).toEqual({ awaiting: 4, expired: 1 });
  });
  it('maps all native evidence families and visible UUIDs, never hidden or incompatible evidence', () => {
    for (const view of ['decisions', 'first-quoted', 'current'] as const) {
      const raw = estimateReadResponse(request(view)), { projection } = adapt(raw);
      if (projection.state.kind !== 'ready') throw new Error('Expected ready projection.');
      const ids = projection.view === 'first-quoted' && projection.state.kind === 'ready'
        ? [projection.state.result.evidenceId!]
        : projection.view === 'current' && projection.state.kind === 'ready'
          ? [...Object.values(projection.state.result.evidenceIds), projection.state.result.handoff.kind === 'available'
            ? projection.state.result.handoff.evidenceId! : undefined].filter((id): id is string => id !== undefined)
          : projection.view === 'decisions' && projection.state.kind === 'ready' ? Object.values(projection.state.result.evidenceIds) : [];
      for (const id of ids) {
        const selected = estimateReportEvidenceSelection(raw, id);
        const next = selected.view === 'first-quoted' ? raw.query
          : estimateReportQuerySchema.parse({ ...raw.query, selected: selected.evidence });
        expect(adapt(estimateReadResponse(next)).projection.state.kind).toBe('ready');
      }
      for (const row of raw.report.rows) expect(visibleEstimateRecord(raw, row.recordId)).toBe(row.recordId);
      expect(visibleEstimateRecord(raw, 'hidden')).toBeUndefined();
      expect(() => estimateReportEvidenceSelection(raw, 'unknown')).toThrow('unavailable');
    }
  });
  it('preserves first-quoted initial issuance rather than resend/new revision and partial coverage', () => {
    const raw = estimateReadResponse(request('first-quoted'));
    expect(raw.report.view).toBe('estimate-first-quoted');
    if (raw.report.view !== 'estimate-first-quoted') throw new Error('Expected First-quoted.');
    expect(raw.report.total).toBe(4);
    expect(raw.report.rows.find(row => row.label.startsWith('E2'))).toMatchObject({
      firstIssuedRevision: 1, firstIssuedDate: '2026-10-02', currentIssuedRevision: 2 });
    expect(raw.report.rows.some(row => row.label.startsWith('E1'))).toBe(false);
    const partial = { ...raw, report: { ...raw.report, coverage: { kind: 'partial' as const, explanation: 'Some initial history is missing.' } } };
    expect(adapt(partial).projection.state.kind).toBe('ready');
  });
  it('retains explicit unavailable frozen amounts without success-shaped zero fallbacks', () => {
    const raw = estimateReadResponse(initialEstimateQuery);
    if (raw.report.view !== 'estimate-decisions') throw new Error('Expected Decisions.');
    const unavailable = { kind: 'unavailable' as const, explanation: 'Invalid frozen snapshot.' };
    const adapted = adapt({ ...raw, report: { ...raw.report, money: unavailable,
      rows: raw.report.rows.map(row => ({ ...row, money: unavailable })) } }).projection;
    if (adapted.view !== 'decisions' || adapted.state.kind !== 'ready') throw new Error('Expected Decisions.');
    expect(adapted.state.result.money).toEqual(unavailable);
    expect(adapted.state.result.counts.accepted).toBe(1);
  });
  it('keeps archive authority and assigned Job scope separate from owner selection and handoff', () => {
    const excluded = estimateReadResponse(request('first-quoted'), { ...estimateReadAuthority, archives: 'excluded' });
    expect(excluded.report.rows.some(row => row.archived)).toBe(false);
    const assigned = estimateReadResponse(estimateReportQuerySchema.parse({ ...initialEstimateQuery, selected: 'decided' }),
      { ...estimateReadAuthority, scope: 'assigned_job', handoff: false });
    expect(assigned.options.parents.map(option => option.value)).toEqual(['job']);
    expect(assigned.options.owners.map(option => option.value)).toEqual(['member:a']);
    expect(adapt(assigned).projection.state.kind).toBe('ready');
    const handoff = estimateReadResponse(estimateReportQuerySchema.parse({ ...request('current'), selected: 'handoff' }),
      { ...estimateReadAuthority, handoff: false });
    expect(handoff.report.rows).toEqual([]);
    expect(() => estimateReportEvidenceSelection(handoff, 'estimate-current:handoff')).toThrow();
    expect(adapt(handoff).projection.state.kind).toBe('ready');
  });
  it('rejects changed requests, identity, authority, clock and stale/private facets with concise errors', () => {
    const raw = estimateReadResponse(initialEstimateQuery);
    const input = { request: raw.query, scopeKey: estimateReportScopeKey(raw), today: raw.today, timezone: raw.report.timezone };
    for (const change of [{ viewerId: 'other' }, { policyRevision: 2 },
      { authority: { ...raw.authority, handoff: false } }, { query: { ...raw.query, page: 2 } },
      { options: { ...raw.options, owners: [] } }, { report: { ...raw.report, privateNotes: 'private' } }]) {
      expect(() => adaptEstimateReadResponse({ ...raw, ...change }, input)).toThrow(/Estimates report/);
    }
    expect(() => adaptEstimateReadResponse(raw, { ...input, today: '2026-11-06' })).toThrow();
    expect(() => adaptEstimateReadResponse(raw, { ...input, timezone: 'UTC' })).toThrow();
    const invalid = { ...raw, options: { ...raw.options, owners: [{ value: 'unassigned', label: 'PRIVATE LABEL' }] } };
    expect(() => adaptEstimateReadResponse(invalid, input)).not.toThrow('PRIVATE LABEL');
  });
  it('traverses complete distinct bounded pages at 25/50/100 with stable totals and past-end clamping', () => {
    for (const view of ['decisions', 'first-quoted', 'current'] as const) for (const pageSize of [25, 50, 100] as const) {
      const query = request(view), initial = estimateReadResponse({ ...query, pageSize }, estimateReadAuthority, true);
      const total = initial.report.view === 'estimate-first-quoted' ? initial.report.total : initial.report.evidenceTotal;
      const ids = new Set<string>();
      for (let page = 1; page <= Math.ceil(total / pageSize); page++) {
        const raw = estimateReadResponse({ ...query, page, pageSize }, estimateReadAuthority, true), { projection } = adapt(raw);
        expect(validEstimateReportProjection(projection, raw.query.filters, raw.options, estimateReportScopeKey(raw), true, true)).toBe(true);
        raw.report.rows.forEach(row => { expect(ids.has(row.recordId)).toBe(false); ids.add(row.recordId); });
      }
      expect(ids.size).toBe(total);
      expect(estimateReadResponse({ ...query, page: 999, pageSize }, estimateReadAuthority, true).report.page)
        .toBe(Math.max(1, Math.ceil(total / pageSize)));
    }
  });
});

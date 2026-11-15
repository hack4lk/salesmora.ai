import { describe, expect, it } from 'vitest';
import { adaptFinancialReportResponses, financialReportRequests } from './financial-report.adapter';
import { financialBackendResponses, financialBackendScopeKey, financialBackendWorkspaceId } from './financial-report.adapter.fixtures';
import { defaultFinancialPeriod, financialReportTimezone, financialReportToday, fullFinancialAccess } from './financial-report.fixtures';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import type { FinancialReportAccess, FinancialEvidencePage } from './financial-report.validation';

const range = resolveReportPeriod(defaultFinancialPeriod, financialReportToday, 'history').range!;
function setup(selected: FinancialEvidencePage['kind'] = 'accepted', access: FinancialReportAccess = fullFinancialAccess, page = 1) {
  const requests = financialReportRequests({ workspaceId: financialBackendWorkspaceId, range, selected, page, pageSize: 25 });
  const host = { requests, selected, access, scopeKey: financialBackendScopeKey, canRead: true,
    period: defaultFinancialPeriod, today: financialReportToday, timezone: financialReportTimezone,
    estimateScope: 'workspace' as const, estimateArchives: 'included' as const, materialScope: 'workspace' as const, canReadJobLabels: true };
  return { host, raw: financialBackendResponses(requests, access) };
}
const ready = (test: { raw: ReturnType<typeof financialBackendResponses>;
  host: Parameters<typeof adaptFinancialReportResponses>[1] } = setup()) => {
  const result = adaptFinancialReportResponses(test.raw, test.host);
  expect(result.scopeKey).toBe(financialBackendScopeKey);
  if (result.state.kind !== 'ready') throw new Error('Expected ready Financial state.');
  return result.state.result;
};
describe('Financial backend adaptation', () => {
  it('uses strict native requests, copies only period bounds and rejects unsupported selections and page sizes', () => {
    expect(setup().host.requests.accepted.period).toEqual({ from: range.from, to: range.to });
    expect(() => financialReportRequests({ workspaceId: financialBackendWorkspaceId, range,
      selected: 'materials', page: 1, pageSize: 2 })).toThrow();
    const test = setup();
    const privateRequest = { ...test.host.requests.accepted, privateField: true };
    expect(() => adaptFinancialReportResponses(test.raw, { ...test.host,
      requests: { ...test.host.requests, accepted: privateRequest } })).toThrow();
    expect(() => adaptFinancialReportResponses(test.raw, { ...test.host,
      requests: { ...test.host.requests, awaiting: { ...test.host.requests.awaiting, filters: { owners: [], parents: ['lead'] } } } })).toThrow();
  });
  it('projects commitments and current costs with distinct native timestamps and genuine evidence dates', () => {
    const result = ready();
    expect(result.estimates).toMatchObject({ kind: 'available', accepted: { count: 3, money: { preTaxCents: 455000 } },
      awaiting: { count: 2, money: { preTaxCents: 215000 } } });
    expect(result.scopeLabel).toContain('2026-11-06T10:00:00Z');
    expect(result.scopeLabel).toContain('2026-11-06T10:00:01Z');
    expect(result.evidence.rows[0]).not.toHaveProperty('issuedDate');
    expect(result.evidence.rows[0]).not.toHaveProperty('ownerKey');
    expect(result.evidence.rows[0]).not.toHaveProperty('recordedDate');
    expect(result.evidence.rows[0]).toMatchObject({ recordId: '00000000-0000-4000-8000-000000000101' });
    expect(ready(setup('awaiting')).evidence.rows[0]).toMatchObject({ kind: 'awaiting', issuedDate: '2026-10-22' });
    expect(result.estimates).not.toHaveProperty('declined');
  });
  it('keeps current quotes and costs unchanged when accepted period is empty', () => {
    const test = setup();
    test.host.period = { preset: 'custom', from: '2026-08-01', to: '2026-08-30' };
    test.host.requests = financialReportRequests({ workspaceId: financialBackendWorkspaceId,
      range: { from: '2026-08-01', to: '2026-08-30' }, selected: 'accepted', page: 1, pageSize: 25 });
    test.raw = financialBackendResponses(test.host.requests);
    const result = ready(test);
    expect(result.evidence.total).toBe(0);
    expect(result.estimates).toMatchObject({ accepted: { count: 0 }, awaiting: { count: 2 } });
    expect(result.costs).toMatchObject({ lineCount: 6, knownCostCents: 17762 });
  });
  it('honors partial authority and rejects monetary or record evidence after revocation', () => {
    const noValues = { ...fullFinancialAccess, canReadEstimateValues: false };
    expect(ready(setup('accepted', noValues)).estimates).toMatchObject({ accepted: { money: { kind: 'unavailable' } } });
    const noEstimates = { ...fullFinancialAccess, canReadEstimates: false };
    expect(ready(setup('materials', noEstimates)).estimates.kind).toBe('unavailable');
    const noCosts = { ...fullFinancialAccess, canReadWorkOrderCosts: false };
    expect(ready(setup('materials', noCosts)).evidence.total).toBe(0);
    const test = setup();
    for (const access of [noValues, noEstimates, noCosts]) {
      expect(() => adaptFinancialReportResponses(test.raw, { ...test.host, access })).toThrow();
    }
    expect(() => adaptFinancialReportResponses(test.raw, { ...test.host, canRead: false })).toThrow();
    expect(() => adaptFinancialReportResponses(test.raw, { ...test.host, canReadJobLabels: false })).toThrow();
  });
  it('retains counts and unavailable frozen values instead of manufacturing zero money', () => {
    const test = setup('accepted', { ...fullFinancialAccess, canReadEstimateValues: false });
    const result = ready({ ...test, host: { ...test.host, access: fullFinancialAccess } });
    expect(result.estimates).toMatchObject({ accepted: { count: 3, money: { kind: 'unavailable' } } });
    expect(result.evidence.rows.every(row => row.kind !== 'material' && row.money.kind === 'unavailable')).toBe(true);
    const partiallyInvalid = setup();
    if (partiallyInvalid.raw.accepted.estimates.kind === 'accepted') {
      const report = partiallyInvalid.raw.accepted.estimates.report;
      report.money = { kind: 'unavailable', explanation: 'A frozen amount is invalid.' };
      report.rows[0]!.money = { kind: 'unavailable', explanation: 'Invalid frozen amount.' };
    }
    expect(ready(partiallyInvalid).estimates).toMatchObject({ accepted: { count: 3, money: { kind: 'unavailable' } } });
  });
  it('matches assigned scope and excludes Job labels when their independent authority is absent', () => {
    const test = setup('materials');
    if (test.raw.accepted.estimates.kind === 'accepted') test.raw.accepted.estimates.report.scope = 'assigned_job';
    if (test.raw.awaiting.estimates.kind === 'awaiting') test.raw.awaiting.estimates.report.scope = 'assigned_job';
    test.raw.materials.scope = 'assigned';
    test.raw.materials.rows.forEach(row => { row.jobLabel = null; });
    const result = ready({ ...test, host: { ...test.host, estimateScope: 'assigned_job', materialScope: 'assigned', canReadJobLabels: false } });
    expect(result.evidence.rows.every(row => row.kind === 'material' && row.jobLabel === null)).toBe(true);
  });
  it('reconciles a real second evidence page without replacing full-population coverage with page totals', () => {
    const test = setup('materials', fullFinancialAccess, 2);
    const material = test.raw.materials;
    const row = material.rows[0]!;
    material.page = 2;
    material.evidenceTotal = 26;
    material.rows = [{ ...row, id: '00000000-0000-4000-8000-000000009999' }];
    if (material.costs.kind !== 'available') throw new Error('Expected fictional costs.');
    const coverage = { lineCount: 26, knownCostLines: 26, missingCostLines: 0, knownCostCents: row.lineCostCents! * 26 };
    material.costs.coverage = coverage;
    material.costs.groups = material.costs.groups.map(group => group.status === row.status ? { ...group, ...coverage }
      : { ...group, lineCount: 0, knownCostLines: 0, missingCostLines: 0, knownCostCents: null });
    const result = ready(test);
    expect(result.evidence).toMatchObject({ page: 2, pageSize: 25, total: 26 });
    expect(result.evidence.rows).toHaveLength(1);
    expect(result.costs).toMatchObject({ lineCount: 26, knownCostCents: 97500 });
    expect(() => adaptFinancialReportResponses(test.raw, { ...test.host,
      requests: { ...test.host.requests, materials: { ...test.host.requests.materials, page: 1 } } })).toThrow();
  });
  it('keeps permission-unavailable sections distinct from available zero and accepts safe current denials', () => {
    const test = setup('materials', { ...fullFinancialAccess, canReadEstimates: false, canReadWorkOrderCosts: false });
    const result = ready({ ...test, host: { ...test.host, access: fullFinancialAccess } });
    expect(result.estimates.kind).toBe('unavailable');
    expect(result.costs.kind).toBe('unavailable');
    expect(result.evidence).toMatchObject({ total: 0, rows: [] });
    const mismatch = setup();
    mismatch.raw.accepted = test.raw.accepted;
    expect(() => adaptFinancialReportResponses(mismatch.raw, mismatch.host)).toThrow();
  });
  it('preserves missing versus zero costs, exact per-line rounding, restatement and safe long labels', () => {
    const test = setup('materials');
    test.raw.materials.rows[0]!.workOrderLabel = 'W'.repeat(200);
    test.raw.materials.rows[0]!.itemLabel = 'I'.repeat(200);
    const result = ready(test);
    expect(result.evidence.rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ unitCostCents: null, lineCostCents: null }),
      expect.objectContaining({ unitCostCents: 0, lineCostCents: 0 }),
      expect.objectContaining({ quantity: '0.005', lineCostCents: 2 }),
      expect.objectContaining({ changedAfterIssue: true }),
    ]));
    expect(result.evidence.rows[0]).toMatchObject({ workOrderLabel: 'W'.repeat(200), itemLabel: 'I'.repeat(200) });
    test.raw.materials.rows[0]!.lineCostCents = 1;
    expect(() => adaptFinancialReportResponses(test.raw, test.host)).toThrow();
  });
  it('accepts only the matching workspace, clock, scope, archives and clamped page', () => {
    expect(ready(setup('materials', fullFinancialAccess, 999)).evidence.page).toBe(1);
    const test = setup();
    for (const host of [{ ...test.host, today: '2026-11-05' }, { ...test.host, timezone: 'UTC' },
      { ...test.host, scopeKey: '' }, { ...test.host, estimateScope: 'assigned_job' as const },
      { ...test.host, estimateArchives: 'excluded' as const }, { ...test.host, materialScope: 'assigned' as const }]) {
      expect(() => adaptFinancialReportResponses(test.raw, host)).toThrow();
    }
    expect(() => adaptFinancialReportResponses({ ...test.raw, materials: { ...test.raw.materials, workspaceId:
      '00000000-0000-4000-8000-000000000002' } }, test.host)).toThrow();
    expect(() => adaptFinancialReportResponses({ ...test.raw, materials: { ...test.raw.materials, pageSize: 50 } }, test.host)).toThrow();
    expect(() => adaptFinancialReportResponses({ ...test.raw, accepted: { ...test.raw.accepted, from: '2026-10-01' } }, test.host)).toThrow();
    const stale = structuredClone(test.raw.accepted);
    if (stale.estimates.kind === 'accepted') stale.estimates.report.asOf = '2026-11-05T10:00:00Z';
    expect(() => adaptFinancialReportResponses({ ...test.raw, accepted: stale }, test.host)).toThrow();
  });
  it('rejects private payloads, broken totals, contradictory scope and invalid explanations', () => {
    const test = setup();
    expect(() => adaptFinancialReportResponses({ ...test.raw,
      materials: { ...test.raw.materials, privatePayload: true } }, test.host)).toThrow();
    const material = structuredClone(test.raw.materials);
    if (material.costs.kind === 'available') material.costs.coverage.knownCostCents = 1;
    expect(() => adaptFinancialReportResponses({ ...test.raw, materials: material }, test.host)).toThrow();
    const decision = structuredClone(test.raw.accepted);
    if (decision.estimates.kind === 'accepted') decision.estimates.report.scopeLabel = 'unsafe\u0000scope';
    expect(() => adaptFinancialReportResponses({ ...test.raw, accepted: decision }, test.host)).toThrow();
  });
});

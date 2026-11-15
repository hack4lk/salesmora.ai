import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks }));
import { FinancialReportRoute } from './financial-report-page';
import { financialReadResponse, initialFinancialQuery, largeFinancialReadResponse } from './financial-read.fixtures';
import { adaptFinancialReadResponse, financialReportScopeKey, visibleFinancialRecord } from './financial-report.adapter';
describe('Financial native route and authority adaptation', () => {
  it('routes Estimate/Work Order UUIDs with workspace context and refreshes access', () => {
    const initial = financialReadResponse(), route = FinancialReportRoute({ initial });
    for (const [kind, path] of [['estimate', 'estimates'], ['work-order', 'work-orders']] as const) {
      route.props.onRecord({ kind, recordId: initial.workspaceId });
      expect(mocks.push).toHaveBeenLastCalledWith(`/${path}/${initial.workspaceId}?workspace=${initial.workspaceId}`);
    }
    route.props.onReload(); expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it('allows only currently selected visible native evidence, not material line IDs or other Estimate pages', () => {
    const initial = financialReadResponse(), section = initial.reports.accepted.estimates;
    if (section.kind !== 'accepted') throw new Error('Expected fixture access.');
    expect(visibleFinancialRecord(initial, section.report.rows[0].recordId)?.kind).toBe('estimate');
    expect(visibleFinancialRecord(initial, '00000000-0000-4000-8000-000000999999')).toBeUndefined();
    const material = financialReadResponse({ ...initialFinancialQuery, selected: 'materials' });
    expect(visibleFinancialRecord(material, material.reports.materials.rows[0].workOrderId)?.kind).toBe('work-order');
    expect(visibleFinancialRecord(material, material.reports.materials.rows[0].id)).toBeUndefined();
  });
  it('rejects stale policy/session/request and unreconciled values without rendering old monetary results', () => {
    const initial = financialReadResponse();
    const input = { request: initial.query, period: { preset: 'custom' as const, ...initial.query.period },
      scopeKey: financialReportScopeKey(initial), today: initial.today, timezone: initial.timezone };
    expect(adaptFinancialReadResponse(initial, input).state.kind).toBe('ready');
    for (const patch of [{ viewerId: 'other' }, { policyRevision: 2 }, { authority: { ...initial.authority, financial: false } },
      { query: { ...initial.query, pageSize: 100 } }, { reports: { ...initial.reports, money: 'private' } }]) {
      expect(() => adaptFinancialReadResponse({ ...initial, ...patch }, input)).toThrow();
    }
  });
  it('large native fixture traverses selected subsection pages with stable whole-population totals', () => {
    const first = largeFinancialReadResponse(), second = largeFinancialReadResponse({ ...initialFinancialQuery, page: 2 });
    const a = first.reports.accepted.estimates, b = second.reports.accepted.estimates;
    if (a.kind !== 'accepted' || b.kind !== 'accepted') throw new Error('Expected accepted evidence.');
    expect(a.report.counts.accepted).toBe(78); expect(b.report.counts).toEqual(a.report.counts);
    expect(a.report.rows[0].recordId).not.toBe(b.report.rows[0].recordId);
    const last = largeFinancialReadResponse({ ...initialFinancialQuery, selected: 'materials', page: 999, pageSize: 100 });
    expect(last.reports.materials.page).toBe(Math.max(1, Math.ceil(last.reports.materials.evidenceTotal / 100)));
  });
});

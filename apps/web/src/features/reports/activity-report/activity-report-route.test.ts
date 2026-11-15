import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks }));
import { ActivityReportRoute } from './activity-report-page';
import { activityReadResponse } from './activity-read.fixtures';
import { visibleActivityRecord, activityReportScopeKey, adaptActivityReadResponse } from './activity-report.adapter';

describe('Activity domain-qualified navigation and authority adaptation', () => {
  it('routes identical UUIDs by each native domain and refreshes authority', () => {
    const initial = activityReadResponse(), route = ActivityReportRoute({ initial });
    const recordId = initial.report.rows[0].recordId;
    for (const [domain, path] of [['lead', 'leads'], ['customer', 'customers'], ['job', 'jobs'],
      ['estimate', 'estimates'], ['work-order', 'work-orders']] as const) {
      route.props.onRecord({ domain, recordId });
      expect(mocks.push).toHaveBeenLastCalledWith(`/${path}/${recordId}?workspace=${initial.workspaceId}`);
    }
    route.props.onReload(); expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it('matches visible parent UUID and domain, never a UUID alone or another page', () => {
    const initial = activityReadResponse(), row = initial.report.rows[0];
    expect(visibleActivityRecord(initial, row)).toBe(true);
    expect(visibleActivityRecord(initial, { domain: row.domain === 'lead' ? 'job' : 'lead', recordId: row.recordId })).toBe(false);
    expect(visibleActivityRecord(initial, { ...row, recordId: '00000000-0000-4000-8000-000000999999' })).toBe(false);
  });
  it('rejects changed session/policy/coverage and private native shapes before adapting', () => {
    const initial = activityReadResponse();
    const input = { request: initial.query, period: { preset: 'custom' as const, ...initial.query.period },
      scopeKey: activityReportScopeKey(initial), today: initial.report.today, timezone: initial.report.timezone,
      includedDomains: initial.report.includedDomains };
    expect(adaptActivityReadResponse(initial, input).state.kind).toBe('ready');
    for (const patch of [{ viewerId: 'another-user' }, { policyRevision: 2 }, { authority: { scope: 'assigned' } },
      { report: { ...initial.report, changes: { secret: true } } },
      { report: { ...initial.report, includedDomains: initial.report.includedDomains.map(item => item.domain === 'lead'
        ? { ...item, archiveVisibility: 'excluded' } : item) } }]) {
      expect(() => adaptActivityReadResponse({ ...initial, ...patch }, input)).toThrow();
    }
  });
});

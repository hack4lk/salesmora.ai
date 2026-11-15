import { describe, expect, it } from 'vitest';
import { adaptBusinessOverviewReadResponse, businessOverviewScopeKey } from './business-overview-read.adapter';
import { initialOverviewQuery, overviewReadResponse } from './business-overview-read.fixtures';
import { overviewBackendAuthority } from './business-overview.adapter.fixtures';

const initial = overviewReadResponse(initialOverviewQuery);
const input = { request: initialOverviewQuery, period: { preset: 'custom' as const, ...initialOverviewQuery.period },
  scopeKey: businessOverviewScopeKey(initial), today: initial.report.today, timezone: initial.report.timezone };
describe('Overview authority adaptation', () => {
  it('projects canonical metrics without importing native evidence rows', () => {
    const projection = adaptBusinessOverviewReadResponse(initial, input);
    expect(projection.state).toMatchObject({ kind: 'ready', result: { currentMetrics: expect.any(Array) } });
    expect(JSON.stringify(initial)).not.toContain('"recordId"');
  });
  it('rejects stale viewer, policy, workspace, domain authority and request association', () => {
    for (const change of [{ viewerId: 'another-user' }, { policyRevision: 2 },
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { authority: { ...initial.authority, lead: null } },
      { query: { ...initialOverviewQuery, period: { ...initialOverviewQuery.period, from: '2026-10-02' } } }]) {
      expect(() => adaptBusinessOverviewReadResponse({ ...initial, ...change }, input)).toThrow();
    }
    const reduced = overviewReadResponse(initialOverviewQuery, { ...overviewBackendAuthority, lead: null });
    expect(() => adaptBusinessOverviewReadResponse(reduced, input)).toThrow('current authority');
    expect(() => adaptBusinessOverviewReadResponse(initial, { ...input, today: '2026-11-07' })).toThrow();
    expect(() => adaptBusinessOverviewReadResponse(initial, { ...input, timezone: 'America/New_York' })).toThrow();
  });
  it('retains partial authority and invalid money with native available counts', () => {
    for (const raw of [overviewReadResponse(initialOverviewQuery, { ...overviewBackendAuthority, lead: null }),
      overviewReadResponse(initialOverviewQuery, overviewBackendAuthority, true)]) {
      expect(adaptBusinessOverviewReadResponse(raw, { ...input, scopeKey: businessOverviewScopeKey(raw) }).state.kind).toBe('ready');
    }
  });
});

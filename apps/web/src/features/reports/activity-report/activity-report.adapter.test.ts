import { describe, expect, it } from 'vitest';
import { activityReportRequest, adaptActivityReportResponse } from './activity-report.adapter';
import { activityBackendDomains, activityBackendEvents, activityBackendResponse,
  activityBackendScopeKey, activityBackendWorkspaceId } from './activity-report.adapter.fixtures';
import { activityReportToday, activityReportTimezone, defaultActivityPeriod, emptyActivityFilters } from './activity-report.fixtures';

const request = activityReportRequest({ workspaceId: activityBackendWorkspaceId,
  range: { from: '2026-10-08', to: activityReportToday }, filters: emptyActivityFilters, page: 1, pageSize: 25 });
const host = { request, period: defaultActivityPeriod, scopeKey: activityBackendScopeKey, canRead: true,
  today: activityReportToday, timezone: activityReportTimezone, includedDomains: activityBackendDomains };

describe('Activity backend adaptation', () => {
  it('projects all five domains, current period facets and canonical record UUIDs without private metadata', () => {
    const response = activityBackendResponse(request);
    const adapted = adaptActivityReportResponse(response, host);
    expect(adapted.state.kind).toBe('ready');
    if (adapted.state.kind !== 'ready') throw new Error('Expected ready Activity.');
    expect(adapted.state.result.rows).toEqual(response.rows);
    expect(adapted.state.result.scopeLabel).toContain('Work Order: workspace, archives included');
    expect(adapted.filterOptions.domains).toHaveLength(5);
    expect(adapted.filterOptions.actions.find(item => item.value === 'decision-recorded')?.label).toBe('Decision recorded');
    expect(adapted.state.result.rows.filter(row => row.eventId === activityBackendEvents[0]!.eventId)).toHaveLength(2);
    expect(adapted.state.result).not.toHaveProperty('options');
    expect(adapted.scopeKey).toBe(activityBackendScopeKey);
    expect(adaptActivityReportResponse({ ...response, scopeLabel: 'Authorized native history. '.repeat(30) }, host).state.kind).toBe('ready');
  });
  it('rejects unsupported requests instead of silently dropping facets or pagination values', () => {
    const range = { ...request.period, count: 30 };
    expect(activityReportRequest({ workspaceId: request.workspaceId, range, filters: emptyActivityFilters, page: 1, pageSize: 25 }).period)
      .toEqual(request.period);
    for (const patch of [{ pageSize: 1 }, { workspaceId: 'not-a-uuid' }, { page: 0 },
      { filters: { domains: ['invoice'], actions: [], actors: [] } },
      { range: { from: '2026-02-30', to: activityReportToday } }]) {
      expect(() => activityReportRequest({ workspaceId: activityBackendWorkspaceId,
        range: request.period, filters: emptyActivityFilters, page: 1, pageSize: 25, ...patch } as never)).toThrow();
    }
  });
  it('rejects stale workspace, period, clock, filters, pages and host authorization', () => {
    const response = activityBackendResponse(request);
    for (const patch of [
      { canRead: false }, { scopeKey: '' }, { today: '2026-11-05' }, { timezone: 'UTC' },
      { includedDomains: activityBackendDomains.filter(item => item.domain !== 'estimate') },
      { includedDomains: activityBackendDomains.map(item => item.domain === 'lead' ? { ...item, archiveVisibility: 'excluded' as const } : item) },
      { includedDomains: activityBackendDomains.map(item => ({ ...item, scope: 'assigned' as const })) },
      { request: { ...request, workspaceId: '00000000-0000-4000-8000-000000000002' } },
      { request: { ...request, period: { ...request.period, from: '2026-10-09' } } },
      { request: { ...request, pageSize: 50 as const } },
      { request: { ...request, filters: { ...request.filters, domains: ['lead' as const] } } },
      { period: { preset: 'custom' as const, from: '2026-10-09', to: request.period.to } },
    ]) expect(() => adaptActivityReportResponse(response, { ...host, ...patch })).toThrow();
  });
  it('preserves authorized period options before OR/AND facet filtering and accepts deduplicated selections', () => {
    const selected = activityReportRequest({ workspaceId: request.workspaceId, range: request.period,
      filters: { domains: ['lead', 'lead'], actions: ['created'], actors: [activityBackendEvents[0]!.actor.key] }, page: 1, pageSize: 25 });
    const response = activityBackendResponse(selected);
    const adapted = adaptActivityReportResponse(response, { ...host, request: selected });
    expect(response.total).toBe(1);
    expect(adapted.filterOptions.domains).toHaveLength(5);
    expect(adapted.filterOptions.actions).toHaveLength(6);
    expect(selected.filters.domains).toEqual(['lead']);
  });
  it('rebuilds facets from the applied period rather than retaining unavailable saved actors or actions', () => {
    const period = { preset: 'custom' as const, from: '2026-11-05', to: activityReportToday };
    const current = activityReportRequest({ workspaceId: request.workspaceId, range: period,
      filters: emptyActivityFilters, page: 1, pageSize: 25 });
    const response = activityBackendResponse(current);
    const adapted = adaptActivityReportResponse(response, { ...host, request: current, period });
    expect(response.total).toBe(3);
    expect(adapted.filterOptions.actions.map(item => item.value)).toEqual(['created', 'status-changed', 'updated']);
    expect(adapted.filterOptions.actors.some(item => item.label === 'Jamie Taylor')).toBe(false);
    const stale = { ...current, filters: { ...current.filters, actions: ['decision-recorded' as const] } };
    expect(() => adaptActivityReportResponse(response, { ...host, request: stale, period })).toThrow();
  });
  it('keeps microsecond chronology ahead of identity order and rejects reversed evidence', () => {
    const rows = [
      { ...activityBackendEvents[0]!, occurredAt: '2026-11-06T09:00:00.000002Z', eventId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
      { ...activityBackendEvents[0]!, occurredAt: '2026-11-06T09:00:00.000001Z', eventId: '00000000-0000-4000-8000-000000000010' },
    ];
    const response = activityBackendResponse(request, { rows });
    expect(adaptActivityReportResponse(response, host).state.kind).toBe('ready');
    expect(response.rows[0]?.occurredAt.endsWith('000002Z')).toBe(true);
    expect(() => adaptActivityReportResponse({ ...response, rows: [...response.rows].reverse() }, host)).toThrow();
  });
  it('clamps 25/50/100 pages and rejects a response for a different valid page', () => {
    const rows = Array.from({ length: 126 }, (_, index) => ({
      ...activityBackendEvents[0]!, eventId: `00000000-0000-4000-8000-${String(index + 1000).padStart(12, '0')}`,
    }));
    for (const pageSize of [25, 50, 100] as const) {
      const paged = { ...request, page: 999, pageSize };
      const response = activityBackendResponse(paged, { rows });
      expect(adaptActivityReportResponse(response, { ...host, request: paged }).state.kind).toBe('ready');
      expect(response.page).toBe(Math.ceil(126 / pageSize));
      expect(() => adaptActivityReportResponse(activityBackendResponse({ ...paged, page: 1 }, { rows }), { ...host, request: paged })).toThrow();
    }
  });
  it('retains explicit omitted coverage, unavailable actor labels and empty snapshots', () => {
    const includedDomains = activityBackendDomains.filter(item => item.domain !== 'customer')
      .map(item => ({ ...item, scope: 'assigned' as const }));
    const rows = activityBackendEvents.filter(row => row.domain !== 'customer').map(row => ({
      ...row, actor: { kind: 'member' as const, key: 'unavailable-actor', label: 'Former or unavailable actor' },
    }));
    const adapted = adaptActivityReportResponse(activityBackendResponse(request, { includedDomains, rows }), { ...host, includedDomains });
    if (adapted.state.kind !== 'ready') throw new Error('Expected ready Activity.');
    expect(adapted.state.result.scopeLabel).toContain('Omitted: Customer (permissions)');
    expect(adapted.filterOptions.actors).toEqual([{ value: 'unavailable-actor', label: 'Former or unavailable actor' }]);
    const empty = adaptActivityReportResponse(activityBackendResponse(request, { rows: [] }), host);
    expect(empty.filterOptions.actions).toEqual([]);
    expect(empty.filterOptions.actors).toEqual([]);
    expect(empty.state.kind === 'ready' && empty.state.result.total).toBe(0);
  });
  it('rejects private raw payloads, actor fields and unreconciled backend evidence', () => {
    const response = activityBackendResponse(request);
    for (const patch of [
      { rows: [{ ...response.rows[0], changes: { signature: 'PRIVATE' } }, ...response.rows.slice(1)] },
      { rows: [{ ...response.rows[0], actor: { ...response.rows[0]!.actor, email: 'PRIVATE' } }, ...response.rows.slice(1)] },
      { total: response.total + 1 }, { scopeLabel: 'PRIVATE\nUNSAFE' }, { validation: [] },
    ]) expect(() => adaptActivityReportResponse({ ...response, ...patch }, host)).toThrow();
  });
});

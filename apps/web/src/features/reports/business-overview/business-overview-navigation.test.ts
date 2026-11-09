import { describe, expect, it } from 'vitest';
import { overviewAttentionHref } from './business-overview-navigation';
import { overviewAttentionIds } from './business-overview.validation';

const workspaceId = '00000000-0000-4000-8000-000000000001';
describe('Overview attention navigation', () => {
  it.each([
    ['stale-leads', 'leads', { view: 'attention', selection: 'inactive', filters: { stages: [], owners: [], sources: [] } }],
    ['overdue-jobs', 'jobs', { view: 'workload', selection: { kind: 'metric', metric: 'overdue' }, filters: { statuses: [], owners: [], services: [] } }],
    ['waiting-jobs', 'jobs', { view: 'workload', selection: { kind: 'metric', metric: 'waiting' }, filters: { statuses: [], owners: [], services: [] } }],
    ['upcoming-visits', 'calendar', { view: 'calendar-scheduled', selected: 'visits',
      period: { from: '2026-12-29', to: '2027-01-04' }, filters: { participants: [], recordTypes: [] } }],
  ] as const)('opens the exact %s queue in the current workspace', (id, area, query) => {
    const url = new URL(overviewAttentionHref(id, workspaceId, '2026-12-29'), 'http://localhost');
    expect(url.pathname).toBe(`/reports/${area}`);
    expect(url.searchParams.get('workspace')).toBe(workspaceId);
    expect(JSON.parse(url.searchParams.get('query')!)).toEqual({ workspaceId, page: 1, pageSize: 25, ...query });
  });
  it('does not carry historical dates or cached evidence into current queues', () => {
    for (const id of overviewAttentionIds.filter(id => id !== 'upcoming-visits')) {
      const url = new URL(overviewAttentionHref(id, workspaceId, '2026-11-09'), 'http://localhost');
      expect(JSON.parse(url.searchParams.get('query')!)).not.toHaveProperty('period');
    }
  });
});

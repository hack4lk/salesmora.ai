import { describe, expect, it } from 'vitest';
import { financialReportNativeQueries, financialReportQuerySchema, financialReportReadResultSchema } from './financial-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const query = financialReportQuerySchema.parse({ workspaceId, view: 'financial', period: { from: '2026-10-08', to: '2026-11-06' } });
const unavailable = { kind: 'unavailable', reason: 'permissions', explanation: 'Current domain authority is unavailable.' };
const estimate = (selected: 'accepted' | 'awaiting') => ({
  workspaceId, view: 'financial-estimates', ...query.period, selected, estimates: unavailable,
});
const materials = { workspaceId, view: 'financial-materials', today: '2026-11-06', asOf: '2026-11-06T10:00:00Z',
  timezone: 'Europe/Warsaw', scope: 'workspace', archiveVisibility: 'excluded', scopeLabel: 'Current recorded costs, not actual spending.',
  filters: { statuses: [] }, costs: unavailable, selected: 'all', evidenceTotal: 0, page: 1, pageSize: 25, rows: [] };
const envelope = { workspaceId, viewerId: 'session-user', policyRevision: 1, today: materials.today, timezone: materials.timezone,
  authority: { scope: 'workspace', financial: true, estimates: null,
    materials: { scope: 'workspace', read: false, costs: false, jobLabels: false } },
  exportAccess: { estimates: null, materials: null },
  query, reports: { accepted: estimate('accepted'), awaiting: estimate('awaiting'), materials } };
describe('Financial unified read contract', () => {
  it('preserves independently unavailable sections without treating them as zero commitments', () => {
    expect(financialReportReadResultSchema.safeParse(envelope).success).toBe(true);
    expect(financialReportReadResultSchema.safeParse({ ...envelope, authority: { ...envelope.authority,
      materials: { ...envelope.authority.materials, read: true } } }).success).toBe(true);
  });
  it('builds bounded native requests with current materials free of period controls and only selected evidence paged', () => {
    for (const selected of ['accepted', 'awaiting', 'materials'] as const) {
      const requests = financialReportNativeQueries({ ...query, selected, page: 3, pageSize: 100 });
      for (const kind of ['accepted', 'awaiting', 'materials'] as const) {
        expect(requests[kind].page).toBe(kind === selected ? 3 : 1);
        expect(requests[kind].pageSize).toBe(100);
      }
      expect(requests.materials).not.toHaveProperty('period');
      expect(requests.accepted.filters).toEqual({ owners: [], parents: [] });
    }
    expect(financialReportQuerySchema.safeParse({ ...query, filters: { owners: [] } }).success).toBe(false);
  });
  it('rejects forged gates, scopes, availability, private fields and inconsistent section requests', () => {
    for (const patch of [{ viewerId: '' }, { policyRevision: -1 }, { role: 'owner' },
      { authority: { ...envelope.authority, financial: false } },
      { authority: { ...envelope.authority, scope: 'assigned' } },
      { authority: { ...envelope.authority, materials: { ...envelope.authority.materials, costs: true } } },
      { authority: { ...envelope.authority, estimates: { scope: 'workspace', archives: 'included', money: true } } },
      { query: { ...query, workspaceId: '00000000-0000-4000-8000-000000000002' } },
      { query: { ...query, period: { ...query.period, from: '2026-10-09' } } },
      { reports: { ...envelope.reports, materials: { ...materials, changes: {} } } },
      { reports: { ...envelope.reports, awaiting: estimate('accepted') } },
    ]) expect(financialReportReadResultSchema.safeParse({ ...envelope, ...patch }).success).toBe(false);
  });
  it('binds local clocks and page sizes even when all native sections are unavailable', () => {
    for (const patch of [{ today: '2026-11-07' }, { timezone: 'Invalid/Timezone' },
      { query: { ...query, pageSize: 100 } },
      { reports: { ...envelope.reports, materials: { ...materials, scope: 'assigned' } } },
    ]) expect(financialReportReadResultSchema.safeParse({ ...envelope, ...patch }).success).toBe(false);
    expect(financialReportReadResultSchema.safeParse({ ...envelope, query: { ...query, page: 100 } }).success).toBe(true);
  });
});

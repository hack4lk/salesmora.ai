import { describe, expect, it } from 'vitest';
import { calendarReportQuerySchema, calendarReportReadResultSchema } from './calendar-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const query = calendarReportQuerySchema.parse({ workspaceId, view: 'calendar-scheduled',
  period: { from: '2026-11-06', to: '2026-11-06' }, selected: 'visits' });
const result = {
  workspaceId, viewerId: 'text-viewer', policyRevision: 0, scope: { kind: 'workspace' }, query,
  canExport: false, exportScopes: null,
  options: { workspaceId, context: 'dated', scope: { kind: 'workspace' }, participants: [], recordTypes: [] },
  report: { workspaceId, view: 'calendar-scheduled', from: '2026-11-06', to: '2026-11-06', today: '2026-11-06',
    timezone: 'Europe/Warsaw', asOf: '2026-11-06T10:00:00Z', scopeLabel: 'Current authorized schedule.', scope: { kind: 'workspace' },
    filters: { participants: [], recordTypes: [] }, counts: { visits: 0, busyPersonDays: 0 },
    days: [{ date: '2026-11-06', count: 0, unassignedCount: 0 }], members: [],
    evidence: { kind: 'visits', rows: [] }, page: 1, pageSize: 25, evidenceTotal: 0 },
};
describe('Calendar authority envelope', () => {
  it('preserves text identity, zero policy revision and authorized empty results', () => {
    expect(calendarReportReadResultSchema.safeParse(result).success).toBe(true);
  });
  it('rejects contradictory workspace, facets, scope, selection, page, clock and private content', () => {
    for (const change of [{ viewerId: 'bad\u0000id' }, { privateNotes: 'hidden' },
      { canExport: true }, { exportScopes: { jobs: { kind: 'available', scope: 'workspace' },
        workOrders: { kind: 'available', scope: 'workspace' } } },
      { workspaceId: '00000000-0000-4000-8000-000000000002' },
      { query: { ...query, selected: 'busy-person-days' } }, { query: { ...query, pageSize: 50 } },
      { options: { ...result.options, context: 'unscheduled' } },
      { report: { ...result.report, asOf: '2026-11-05T10:00:00Z' } },
      { query: { ...query, filters: { participants: ['outsider'], recordTypes: [] } } }]) {
      expect(calendarReportReadResultSchema.safeParse({ ...result, ...change }).success).toBe(false);
    }
  });
  it('keeps undated queues free of date predicates', () => {
    const undated = { workspaceId, view: 'calendar-unscheduled', selected: 'visits' };
    expect(calendarReportQuerySchema.safeParse(undated).success).toBe(true);
    expect(calendarReportQuerySchema.safeParse({ ...undated, period: query.view === 'calendar-scheduled' ? query.period : {} }).success).toBe(false);
  });
});

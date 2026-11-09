import { describe, expect, it } from 'vitest';
import { calendarScheduledQuerySchema, calendarScheduledResultSchema } from './calendar-scheduled';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const rows = Array.from({ length: 4 }, (_, i) => ({
  id: uuid(i + 10), label: 'Visit', date: '2026-11-01', participantIds: ['a', 'b'],
  records: [{ id: uuid(i + 20), recordId: uuid(i + 20), type: 'job', label: 'Job' }],
}));
const result = {
  workspaceId: uuid(1), view: 'calendar-scheduled', from: '2026-11-01', to: '2026-11-02',
  today: '2026-10-31', asOf: '2026-10-31T16:00:00Z', timezone: 'America/New_York', scopeLabel: 'Authorized visits.',
  scope: { kind: 'workspace' }, counts: { visits: 4, busyPersonDays: 2 },
  days: [{ date: '2026-11-01', count: 4, unassignedCount: 0 }, { date: '2026-11-02', count: 0, unassignedCount: 0 }],
  members: [{ id: 'a', label: 'A', counts: [4, 0] }, { id: 'b', label: 'B', counts: [4, 0] }],
  evidence: { kind: 'visits', rows }, evidenceTotal: 4, page: 1, pageSize: 25,
};
describe('Scheduled Calendar report contracts', () => {
  it('allows inclusive future schedule dates but bounds periods and evidence', () => {
    const query = { workspaceId: uuid(1), view: 'calendar-scheduled', period: { from: '2026-11-01', to: '2026-11-02' }, selected: 'visits' };
    expect(calendarScheduledQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [{ pageSize: 10 }, { selected: 'overlap' }, { period: { from: '2025-01-01', to: '2026-01-02' } }]) {
      expect(calendarScheduledQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    }
  });
  it('counts distinct visits and non-additive people, with exactly four visits marking busy', () => {
    expect(calendarScheduledResultSchema.safeParse(result).success).toBe(true);
    expect(calendarScheduledResultSchema.safeParse({
      ...result, evidence: { kind: 'busy-person-days', rows: [{ personId: 'a', date: '2026-11-01' }, { personId: 'b', date: '2026-11-01' }] },
      evidenceTotal: 2,
    }).success).toBe(true);
    expect(calendarScheduledResultSchema.safeParse({ ...result, counts: { visits: 4, busyPersonDays: 0 } }).success).toBe(false);
  });
  it('withholds other participants and residuals in own scope', () => {
    const mine = { ...result, scope: { kind: 'own', viewerId: 'a' }, members: [result.members[0]],
      counts: { visits: 4, busyPersonDays: 1 }, evidence: { kind: 'visits', rows: rows.map(row => ({ ...row, participantIds: ['a'] })) } };
    expect(calendarScheduledResultSchema.safeParse(mine).success).toBe(true);
    expect(calendarScheduledResultSchema.safeParse({ ...mine, evidence: result.evidence }).success).toBe(false);
    expect(calendarScheduledResultSchema.safeParse({ ...mine, members: result.members }).success).toBe(false);
  });
  it('rejects duplicate visits/records, missing zero dates, inconsistent evidence and stale pages', () => {
    for (const patch of [
      { evidence: { kind: 'visits', rows: [rows[0], rows[0], rows[2], rows[3]] } }, { page: 2 },
      { days: [result.days[0]] }, { evidenceTotal: 3 },
      { evidence: { kind: 'visits', rows: rows.map(row => ({ ...row, participantIds: [] })) } },
      { evidence: { kind: 'busy-person-days', rows: [{ personId: 'a', date: '2026-11-02' }] }, evidenceTotal: 2 },
    ]) expect(calendarScheduledResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('represents empty schedules with explicit zero days and no invented busy load', () => {
    expect(calendarScheduledResultSchema.safeParse({
      ...result, counts: { visits: 0, busyPersonDays: 0 }, members: [], evidenceTotal: 0,
      days: result.days.map(day => ({ ...day, count: 0 })), evidence: { kind: 'visits', rows: [] },
    }).success).toBe(true);
  });
});

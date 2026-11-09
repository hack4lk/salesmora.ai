import { describe, expect, it } from 'vitest';
import { calendarUnscheduledQuerySchema, calendarUnscheduledResultSchema } from './calendar-unscheduled';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const job = { id: uuid(10), recordId: uuid(10), label: 'Job', type: 'job', status: 'scheduled' };
const order = { id: uuid(11), recordId: uuid(11), label: 'Order', type: 'work_order', status: 'draft', archived: false };
const visit = { id: uuid(2), label: 'Visit', scheduledDate: null, participantIds: ['a', 'b'], records: [job, order] };
const result = {
  workspaceId: uuid(1), view: 'calendar-unscheduled', today: '2026-11-07', asOf: '2026-11-07T16:00:00Z',
  timezone: 'America/New_York', scopeLabel: 'Authorized current queue.', scope: { kind: 'workspace' },
  members: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
  counts: { visits: 1, jobs: 1, workOrders: 1 }, visits: [visit],
  evidence: { kind: 'visits', visitIds: [visit.id] }, evidenceTotal: 1, page: 1, pageSize: 25,
};
describe('Unscheduled Calendar report contracts', () => {
  it('has no period or client-controlled scope and accepts only bounded queue selections', () => {
    const query = { workspaceId: uuid(1), view: 'calendar-unscheduled', selected: 'visits' };
    expect(calendarUnscheduledQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [
      { period: { from: '2026-01-01', to: '2026-01-31' } }, { scope: 'workspace' },
      { selected: 'busy-person-days' }, { pageSize: 10 }, { page: 0 },
    ]) expect(calendarUnscheduledQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });
  it('keeps shared visits distinct from active Job/Work Order units, including permitted Drafts', () => {
    expect(calendarUnscheduledResultSchema.safeParse(result).success).toBe(true);
    for (const kind of ['jobs', 'workOrders']) {
      expect(calendarUnscheduledResultSchema.safeParse({
        ...result, evidence: { kind, records: [{ visitId: visit.id, recordId: kind === 'jobs' ? job.id : order.id }] },
      }).success).toBe(true);
    }
  });
  it('rejects closed, archived, scheduled or duplicate supporting context', () => {
    for (const changed of [
      { ...visit, scheduledDate: '2026-11-07' }, { ...visit, records: [job, { ...order, archived: true }] },
      { ...visit, records: [{ ...job, status: 'completed' }, order] },
      { ...visit, records: [job, { ...order, status: 'canceled' }] },
      { ...visit, records: [job, job, order] }, { ...visit, records: [{ ...job, recordId: uuid(90) }, order] },
      { ...visit, participantIds: ['unknown'] },
    ]) expect(calendarUnscheduledResultSchema.safeParse({ ...result, visits: [changed] }).success).toBe(false);
  });
  it('redacts own scope to self, including empty results', () => {
    const mine = { ...result, scope: { kind: 'own', viewerId: 'a' }, members: [result.members[0]],
      visits: [{ ...visit, participantIds: ['a'] }] };
    expect(calendarUnscheduledResultSchema.safeParse(mine).success).toBe(true);
    for (const patch of [{ members: result.members }, { visits: [visit] }, { visits: [{ ...visit, participantIds: [] }] }]) {
      expect(calendarUnscheduledResultSchema.safeParse({ ...mine, ...patch }).success).toBe(false);
    }
    expect(calendarUnscheduledResultSchema.safeParse({
      ...mine, counts: { visits: 0, jobs: 0, workOrders: 0 }, visits: [], evidenceTotal: 0,
      evidence: { kind: 'visits', visitIds: [] },
    }).success).toBe(true);
  });
  it('requires exact evidence type, identity, supporting visits, totals and final page length', () => {
    for (const patch of [
      { counts: { visits: 2, jobs: 1, workOrders: 0 } }, { counts: { visits: 1, jobs: 2, workOrders: 1 } },
      { evidenceTotal: 2 }, { page: 2 }, { evidence: { kind: 'visits', visitIds: [] } },
      { visits: [visit, visit] }, { evidence: { kind: 'jobs', records: [{ visitId: visit.id, recordId: order.id }] } },
      { evidence: { kind: 'workOrders', records: [{ visitId: uuid(99), recordId: order.id }] } },
    ]) expect(calendarUnscheduledResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('allows a bounded record page on one shared visit with more than a page of records', () => {
    const orders = Array.from({ length: 26 }, (_, i) => ({ ...order, id: uuid(100 + i), recordId: uuid(100 + i) }));
    const paged = { ...result, counts: { visits: 1, jobs: 1, workOrders: 26 },
      visits: [{ ...visit, records: [job, ...orders] }], evidenceTotal: 26,
      evidence: { kind: 'workOrders', records: orders.slice(0, 25).map(row => ({ visitId: visit.id, recordId: row.id })) } };
    expect(calendarUnscheduledResultSchema.safeParse(paged).success).toBe(true);
    expect(calendarUnscheduledResultSchema.safeParse({
      ...paged, page: 2, evidence: { kind: 'workOrders', records: [{ visitId: visit.id, recordId: orders[25]!.id }] },
    }).success).toBe(true);
  });
  it('allows partial visit pages only when omitted records can support every unseen visit', () => {
    const partial = { ...result, counts: { visits: 26, jobs: 26, workOrders: 0 }, evidenceTotal: 26, page: 2,
      visits: [{ ...visit, records: [job] }] };
    expect(calendarUnscheduledResultSchema.safeParse(partial).success).toBe(true);
    expect(calendarUnscheduledResultSchema.safeParse({
      ...partial, counts: { visits: 26, jobs: 1, workOrders: 25 }, visits: [{ ...visit, records: [job, order] }],
    }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  calendarReportFiltersSchema, calendarReportFilterOptionsQuerySchema, calendarReportFilterOptionsResultSchema,
} from './calendar-filters';
import { calendarScheduledQuerySchema, calendarScheduledResultSchema } from './calendar-scheduled';
import { calendarReviewQuerySchema, calendarReviewResultSchema } from './calendar-review';
import { calendarUnscheduledQuerySchema, calendarUnscheduledResultSchema } from './calendar-unscheduled';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const filters = { participants: ['a'], recordTypes: ['work_order'] };
const common = {
  workspaceId: uuid(1), today: '2026-11-07', asOf: '2026-11-07T16:00:00Z',
  timezone: 'America/New_York', scopeLabel: 'Authorized.',
  scope: { kind: 'workspace' }, filters, members: [{ id: 'a', label: 'A' }],
  page: 1, pageSize: 25, evidenceTotal: 0,
};
describe('Calendar report facets', () => {
  it('defaults empty selections and rejects duplicate, unassigned, invalid and excessive choices', () => {
    expect(calendarReportFiltersSchema.parse({})).toEqual({ participants: [], recordTypes: [] });
    expect(calendarReportFiltersSchema.safeParse(filters).success).toBe(true);
    for (const invalid of [
      { participants: ['a', 'a'] }, { participants: ['unassigned'] }, { participants: [''] },
      { participants: Array.from({ length: 51 }, (_, i) => String(i)) },
      { recordTypes: ['job', 'job'] }, { recordTypes: ['lead'] }, { status: 'draft' },
    ]) expect(calendarReportFiltersSchema.safeParse(invalid).success).toBe(false);
  });
  it('applies the same typed facet draft to all views without adding a dated range to the queue', () => {
    for (const [schema, view, selected] of [
      [calendarScheduledQuerySchema, 'calendar-scheduled', 'visits'],
      [calendarReviewQuerySchema, 'calendar-review', 'past'],
    ] as const) {
      const query = { workspaceId: uuid(1), view, selected, period: { from: '2026-11-01', to: '2026-11-07' }, filters };
      expect(schema.parse(query).filters).toEqual(filters);
      expect(schema.parse({ ...query, filters: undefined }).filters).toEqual({ participants: [], recordTypes: [] });
    }
    const query = { workspaceId: uuid(1), view: 'calendar-unscheduled', selected: 'jobs', filters };
    expect(calendarUnscheduledQuerySchema.parse(query).filters).toEqual(filters);
    expect(calendarUnscheduledQuerySchema.safeParse({ ...query, period: { from: '2026-11-01', to: '2026-11-07' } }).success).toBe(false);
  });
  it('keeps option contexts strict and own options self-only with no unavailable sentinel', () => {
    expect(calendarReportFilterOptionsQuerySchema.safeParse({ workspaceId: uuid(1), context: 'dated' }).success).toBe(true);
    expect(calendarReportFilterOptionsQuerySchema.safeParse({ workspaceId: uuid(1), context: 'dated', period: {} }).success).toBe(false);
    const options = { workspaceId: uuid(1), context: 'dated', scope: { kind: 'own', viewerId: 'a' },
      participants: [{ value: 'a', label: 'Me' }], recordTypes: [{ value: 'job', label: 'Job' }] };
    expect(calendarReportFilterOptionsResultSchema.safeParse(options).success).toBe(true);
    for (const patch of [
      { participants: [{ value: 'b', label: 'B' }] }, { participants: [{ value: 'a', label: 'A' }, { value: 'a', label: 'A' }] },
      { participants: [{ value: 'unassigned', label: 'None' }] }, { recordTypes: [{ value: 'lead', label: 'Lead' }] },
    ]) expect(calendarReportFilterOptionsResultSchema.safeParse({ ...options, ...patch }).success).toBe(false);
  });
  it('bounds member projections to selected people even in zero results across every service', () => {
    const samples = [
      [calendarScheduledResultSchema, { ...common, view: 'calendar-scheduled', from: common.today, to: common.today,
        members: [{ id: 'a', label: 'A', counts: [0] }], days: [{ date: common.today, count: 0, unassignedCount: 0 }],
        counts: { visits: 0, busyPersonDays: 0 }, evidence: { kind: 'visits', rows: [] } }],
      [calendarReviewResultSchema, { ...common, view: 'calendar-review', from: common.today, to: common.today,
        counts: { scheduledVisits: 0, missingWindows: 0, overlapPairs: 0, pastVisits: 0 },
        visits: [], evidence: { kind: 'past', visitIds: [] } }],
      [calendarUnscheduledResultSchema, { ...common, view: 'calendar-unscheduled', counts: { visits: 0, jobs: 0, workOrders: 0 },
        visits: [], evidence: { kind: 'visits', visitIds: [] } }],
    ] as const;
    for (const [schema, sample] of samples) {
      expect(schema.safeParse(sample).success).toBe(true);
      expect(schema.safeParse({ ...sample, members: [{ id: 'b', label: 'B', counts: [0] }] }).success).toBe(false);
      expect(schema.safeParse({ ...sample, scope: { kind: 'own', viewerId: 'a' }, filters: { participants: ['b'], recordTypes: [] } }).success).toBe(false);
    }
  });
  it('rejects mismatching evidence types and hidden participants in filtered results', () => {
    const visit = { id: uuid(2), label: 'Visit', date: common.today, participantIds: ['a'],
      records: [{ id: uuid(3), recordId: uuid(3), label: 'Order', type: 'work_order' }] };
    const sample = { ...common, view: 'calendar-scheduled', from: common.today, to: common.today,
      members: [{ id: 'a', label: 'A', counts: [1] }], days: [{ date: common.today, count: 1, unassignedCount: 0 }],
      counts: { visits: 1, busyPersonDays: 0 }, evidence: { kind: 'visits', rows: [visit] }, evidenceTotal: 1 };
    expect(calendarScheduledResultSchema.safeParse(sample).success).toBe(true);
    expect(calendarScheduledResultSchema.safeParse({ ...sample, filters: { ...filters, recordTypes: ['job'] } }).success).toBe(false);
    expect(calendarScheduledResultSchema.safeParse({
      ...sample, evidence: { kind: 'visits', rows: [{ ...visit, participantIds: ['b'] }] },
    }).success).toBe(false);
    const { date: _date, ...undated } = visit;
    void _date;
    const queue = { ...common, view: 'calendar-unscheduled', counts: { visits: 1, jobs: 0, workOrders: 1 },
      visits: [{ ...undated, scheduledDate: null, records: [{ ...visit.records[0], status: 'draft', archived: false }] }],
      evidence: { kind: 'visits', visitIds: [visit.id] }, evidenceTotal: 1 };
    expect(calendarUnscheduledResultSchema.safeParse(queue).success).toBe(true);
    expect(calendarUnscheduledResultSchema.safeParse({ ...queue, filters: { ...filters, recordTypes: ['job'] } }).success).toBe(false);
  });
});

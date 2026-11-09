import { describe, expect, it } from 'vitest';
import { calendarScheduledResultSchema } from '@salesmora/contracts';
import { adaptCalendarReportResponse, calendarReportRequest, type CalendarReportRequest } from './calendar-report-workspace.adapter';
import { calendarBackendResponse, calendarBackendOptions, calendarBackendWorkspaceId } from './calendar-report-workspace.adapter.fixtures';
import { calendarWorkspaceEmptyFilters, calendarWorkspaceRange, calendarWorkspaceScopeKey } from './calendar-report-workspace.fixtures';
import { validCalendarReportProjection } from './calendar-report-workspace.validation';

const empty = calendarWorkspaceEmptyFilters;
function request(view: 'scheduled' | 'review' | 'unscheduled', patch: Partial<Parameters<typeof calendarReportRequest>[0]> = {}) {
  return calendarReportRequest({
    workspaceId: calendarBackendWorkspaceId, view, filters: { dated: empty, unscheduled: empty },
    range: calendarWorkspaceRange, page: 1, pageSize: 25,
    evidence: { scheduled: 'visits', review: 'overlaps', unscheduled: 'visits' }, ...patch,
  });
}
const adapt = (query: CalendarReportRequest, raw: unknown = calendarBackendResponse(query), options: unknown = calendarBackendOptions(query)) =>
  adaptCalendarReportResponse(raw, options, { request: query, scopeKey: calendarWorkspaceScopeKey });

describe('Calendar backend-to-canonical host adapter', () => {
  it('builds only the selected view with the independent filter draft and no date predicate for queues', () => {
    const dated = { participants: ['blair'], recordTypes: ['work_order'] }, undated = { participants: ['alex'], recordTypes: ['job'] };
    expect(request('scheduled', { filters: { dated, unscheduled: undated } }).filters).toEqual(dated);
    const queue = request('unscheduled', { filters: { dated, unscheduled: undated }, range: { from: 'bad', to: 'bad' } });
    expect(queue.filters).toEqual(undated);
    expect(queue).not.toHaveProperty('period');
    expect(() => request('scheduled', { pageSize: 1 })).toThrow();
    expect(() => request('review', { range: { from: 'bad', to: 'bad' } })).toThrow();
  });
  it('adapts every canonical view/evidence shape and preserves actual record identities for navigation', () => {
    for (const query of [
      request('scheduled'), request('scheduled', { evidence: { scheduled: 'busy-person-days', review: 'overlaps', unscheduled: 'visits' } }),
      request('review'), request('review', { evidence: { scheduled: 'visits', review: 'past', unscheduled: 'visits' } }),
      ...(['visits', 'jobs', 'workOrders'] as const).map(unscheduled => request('unscheduled', {
        evidence: { scheduled: 'visits', review: 'overlaps', unscheduled },
      })),
    ]) {
      const { projection, filterOptions } = adapt(query);
      expect(validCalendarReportProjection(projection, query.filters, filterOptions, filterOptions.scope,
        calendarWorkspaceScopeKey, calendarWorkspaceRange)).toBe(true);
      if (projection.state.kind !== 'ready') throw new Error('Expected ready Calendar response.');
      expect(projection.state.result.snapshotLabel).toContain('America/New_York');
      for (const visit of projection.attribution) {
        expect(visit.visitId).toMatch(/^[a-f0-9-]{36}$/);
        expect(visit.records.every(record => /^[a-f0-9-]{36}$/.test(record.id))).toBe(true);
      }
    }
  });
  it('maps record-level participants without borrowing a shared visit union, for filtered and own views', () => {
    for (const view of ['scheduled', 'review', 'unscheduled'] as const) {
      const query = request(view, {
        filters: { dated: { participants: ['blair'], recordTypes: ['work_order'] }, unscheduled: { participants: ['blair'], recordTypes: ['work_order'] } },
        evidence: { scheduled: 'visits', review: 'past', unscheduled: 'visits' },
      });
      const { projection } = adapt(query);
      expect(projection.attribution).toHaveLength(1);
      expect(projection.attribution[0]?.records).toHaveLength(1);
      expect(projection.attribution[0]?.records[0]?.participantIds).toEqual(['blair']);
      expect(JSON.stringify(projection)).not.toContain('alex');
      const scope = { kind: 'own', viewerId: 'blair' } as const;
      const own = adapt(query, calendarBackendResponse(query, scope), calendarBackendOptions(query, scope));
      expect(own.projection.state.kind).toBe('ready');
      expect(own.filterOptions.participants).toEqual([{ value: 'blair', label: 'Me' }]);
    }
    const projection = adapt(request('scheduled')).projection;
    const records = projection.attribution[0]!.records;
    expect(records.find(record => record.type === 'job')?.participantIds).toEqual(['alex']);
    expect(records.find(record => record.participantIds.includes('blair'))?.type).toBe('work_order');
  });
  it('rejects stale workspace, range, evidence, page size, filters, scope and options', () => {
    const query = request('scheduled'), raw = calendarBackendResponse(query), options = calendarBackendOptions(query);
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000099' }, { view: 'calendar-unscheduled' },
      { filters: { participants: ['alex'], recordTypes: [] } }, { from: '2026-11-02' },
      { pageSize: 50 }, { scope: { kind: 'own', viewerId: 'blair' } },
    ]) expect(() => adapt(query, { ...raw, ...patch })).toThrow();
    for (const patch of [
      { workspaceId: '00000000-0000-4000-8000-000000000099' }, { context: 'unscheduled' },
      { participants: [{ value: 'blair', label: 'Blair' }] }, { recordTypes: [{ value: 'work_order', label: 'Work Order' }] },
    ]) expect(() => adapt(query, raw, { ...options, ...patch })).toThrow();
    expect(() => adaptCalendarReportResponse(raw, options, { request: query, scopeKey: '' })).toThrow();
  });
  it('rejects missing or fabricated record attribution instead of inferring participants', () => {
    const query = request('scheduled'), raw = calendarScheduledResultSchema.parse(calendarBackendResponse(query));
    if (raw.evidence.kind !== 'visits') throw new Error('Expected visit evidence.');
    const recordPatches = [undefined, ['hidden']];
    for (const participantIds of recordPatches) {
      const rows = raw.evidence.rows.map((visit, index) => index ? visit : {
        ...visit, records: visit.records.map((record, index) => index ? record : { ...record, participantIds }),
      });
      expect(() => adapt(query, { ...raw, evidence: { kind: 'visits', rows } })).toThrow();
    }
    const selected = request('scheduled', { filters: { dated: { participants: ['blair'], recordTypes: ['work_order'] }, unscheduled: empty } });
    const response = calendarScheduledResultSchema.parse(calendarBackendResponse(selected));
    if (response.evidence.kind !== 'visits') throw new Error('Expected selected visit evidence.');
    const rows = response.evidence.rows.map(visit => ({ ...visit,
      records: visit.records.map(record => ({ ...record, participantIds: ['alex', 'blair'] })),
    }));
    expect(() => adapt(selected, { ...response, evidence: { kind: 'visits', rows } })).toThrow();
  });
  it('rejects an unrelated evidence response and accepts backend final-page clamping', () => {
    const query = request('scheduled');
    const busy = request('scheduled', { evidence: { scheduled: 'busy-person-days', review: 'overlaps', unscheduled: 'visits' } });
    expect(() => adapt(query, calendarBackendResponse(busy))).toThrow();
    const clamped = { ...query, page: 999 };
    expect(adapt(clamped, calendarBackendResponse(query)).projection.state.kind).toBe('ready');
  });
  it('accepts actual service zero-work rosters and empty own evidence without inventing attribution', () => {
    for (const view of ['scheduled', 'review', 'unscheduled'] as const) {
      const query = request(view, { filters: {
        dated: { participants: ['blair'], recordTypes: ['job'] },
        unscheduled: { participants: ['blair'], recordTypes: ['job'] },
      } });
      const response = calendarBackendResponse(query);
      const raw = { ...response, members: [{ id: 'blair', label: 'Blair',
        ...(view === 'scheduled' && 'days' in response ? { counts: response.days.map(() => 0) } : {}) }] };
      const { projection } = adapt(query, raw);
      expect(projection.attribution).toEqual([]);
      expect(projection.state.kind).toBe('ready');
      const scope = { kind: 'own', viewerId: 'blair' } as const;
      expect(adapt(query, { ...raw, scope }, calendarBackendOptions(query, scope)).projection.attribution).toEqual([]);
    }
  });
  it('does not require calendar or parent navigation authority to adapt Work Order-only evidence', () => {
    for (const view of ['scheduled', 'review', 'unscheduled'] as const) {
      const query = request(view, { filters: {
        dated: { participants: [], recordTypes: ['work_order'] },
        unscheduled: { participants: [], recordTypes: ['work_order'] },
      }, evidence: { scheduled: 'visits', review: 'past', unscheduled: 'workOrders' } });
      const { projection } = adapt(query);
      expect(projection.attribution.every(visit => visit.records.every(record => record.type === 'work_order'))).toBe(true);
      expect(projection.attribution.flatMap(visit => visit.records).length).toBeGreaterThan(0);
    }
  });
});

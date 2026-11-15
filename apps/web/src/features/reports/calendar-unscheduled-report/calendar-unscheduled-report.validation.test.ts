import { describe, expect, it } from 'vitest';
import { calendarUnscheduledResponse, calendarUnscheduledVisits, calendarUnscheduledWorkOrders } from './calendar-unscheduled-report.fixtures';
import { validCalendarUnscheduledResult } from './calendar-unscheduled-report.validation';

describe('unscheduled reporting', () => {
  it('matches C04: one visit, one Job and two Work Orders despite duplicate visit/crew joins', () => {
    for (const kind of ['visits', 'jobs', 'workOrders'] as const) {
      const result = calendarUnscheduledResponse([...calendarUnscheduledVisits, ...calendarUnscheduledVisits], { kind });
      expect(result.counts).toEqual({ visits: 1, jobs: 1, workOrders: 2 });
      expect(result.visits[0]!.participantIds).toEqual(['alex', 'blair']);
      expect(validCalendarUnscheduledResult(result)).toBe(true);
    }
  });
  it('excludes scheduled, closed and archived records before counting, retaining authorized drafts', () => {
    const first = calendarUnscheduledVisits[0]!;
    const result = calendarUnscheduledResponse([
      { ...first, id: 'dated', scheduledDate: '2026-11-06' },
      { ...first, records: first.records.map(record => ({ ...record, status: 'completed' })) },
      { ...first, id: 'canceled', records: first.records.map(record => ({ ...record, status: 'canceled' })) },
      { ...calendarUnscheduledWorkOrders[0]!, id: 'archived', records: calendarUnscheduledWorkOrders[0]!.records.map(record => ({ ...record, archived: true })) },
      { ...calendarUnscheduledWorkOrders[0]!, id: 'draft', records: calendarUnscheduledWorkOrders[0]!.records.map(record => ({ ...record, status: 'draft' })) },
    ]);
    expect(result.counts).toEqual({ visits: 1, jobs: 0, workOrders: 2 });
    expect(validCalendarUnscheduledResult(result)).toBe(true);
  });
  it('does not confuse a Scheduled Job status with a canonical visit date', () => {
    const first = calendarUnscheduledVisits[0]!;
    const result = calendarUnscheduledResponse([{ ...first, records: [{ id: 'job', type: 'job', label: 'Job', status: 'scheduled' }] }]);
    expect(result.counts.jobs).toBe(1);
    expect(validCalendarUnscheduledResult(result)).toBe(true);
  });
  it('does not infer sharing from equal display labels', () => {
    const first = calendarUnscheduledVisits[0]!;
    const result = calendarUnscheduledResponse([first, { ...first, id: 'other:U1', records: first.records.map(record => ({ ...record, id: `other:${record.id}` })) }]);
    expect(result.counts).toEqual({ visits: 2, jobs: 2, workOrders: 4 });
    expect(validCalendarUnscheduledResult(result)).toBe(true);
  });
  it('preserves Work Order-only and own scope with no parent Job or unrelated crew', () => {
    const result = calendarUnscheduledResponse(calendarUnscheduledWorkOrders, { kind: 'workOrders' });
    expect(result.counts.jobs).toBe(0);
    expect(JSON.stringify(result.visits)).not.toMatch(/Job|blair/);
    expect(validCalendarUnscheduledResult(result)).toBe(true);
    const own = calendarUnscheduledResponse(undefined, { scope: { kind: 'own', viewerId: 'blair' } });
    expect(own.members.map(member => member.id)).toEqual(['blair']);
    expect(own.visits[0]!.participantIds).toEqual(['blair']);
    expect(validCalendarUnscheduledResult(own)).toBe(true);
    expect(validCalendarUnscheduledResult({ ...own, members: calendarUnscheduledResponse().members })).toBe(false);
    expect(validCalendarUnscheduledResult(calendarUnscheduledResponse([], { scope: { kind: 'own', viewerId: 'alex' } }))).toBe(true);
  });
  it('pages record units independently from visit counts, and accepts empty queues', () => {
    for (const page of [1, 2]) {
      const result = calendarUnscheduledResponse(undefined, { kind: 'workOrders', page, pageSize: 1 });
      expect(result.visits).toHaveLength(1);
      expect(result.counts.workOrders).toBe(2);
      expect(validCalendarUnscheduledResult(result)).toBe(true);
    }
    for (const kind of ['visits', 'jobs', 'workOrders'] as const) expect(validCalendarUnscheduledResult(calendarUnscheduledResponse([], { kind }))).toBe(true);
  });
  it('rejects invalid counts, context and pagination', () => {
    const result = calendarUnscheduledResponse();
    for (const invalid of [
      { ...result, counts: { ...result.counts, visits: -1 } },
      { ...result, counts: { ...result.counts, jobs: 0 } },
      { ...result, counts: { ...result.counts, jobs: Number.MAX_SAFE_INTEGER } },
      { ...result, counts: { visits: 4, jobs: 1, workOrders: 2 } },
      { ...result, today: '2026-02-30' }, { ...result, timezone: 'bad/zone' },
      { ...result, page: 2 }, { ...result, pageSize: 0 },
      { ...result, evidence: { kind: 'visits' as const, visitIds: ['hidden'] } },
      { ...result, scope: { kind: 'own' as const, viewerId: 'alex' } },
    ]) expect(validCalendarUnscheduledResult(invalid)).toBe(false);
  });
  it('rejects duplicate visits, records, participants and hidden member references', () => {
    const result = calendarUnscheduledResponse(), first = result.visits[0]!;
    for (const visit of [
      { ...first, participantIds: ['alex', 'alex'] }, { ...first, participantIds: ['hidden'] },
      { ...first, records: [] }, { ...first, records: [first.records[0]!, first.records[0]!] },
      { ...first, records: first.records.map(record => ({ ...record, status: 'completed' as const })) },
      { ...first, records: first.records.map(record => record.type === 'job' ? record : { ...record, archived: true }) },
    ]) expect(validCalendarUnscheduledResult({ ...result, visits: [visit] })).toBe(false);
    expect(validCalendarUnscheduledResult({ ...result, visits: [first, first] })).toBe(false);
  });
  it('rejects record evidence with the wrong type, duplicate target or wrong visit', () => {
    const result = calendarUnscheduledResponse(undefined, { kind: 'workOrders' });
    if (result.evidence.kind === 'visits') throw new Error('Expected record evidence');
    const row = result.evidence.records[0]!;
    for (const records of [[row, row], [{ ...row, visitId: 'hidden' }, result.evidence.records[1]!],
      [{ ...row, recordId: 'workspace-fixture:J1' }, result.evidence.records[1]!]]) {
      expect(validCalendarUnscheduledResult({ ...result, evidence: { kind: 'workOrders', records } })).toBe(false);
    }
  });
});

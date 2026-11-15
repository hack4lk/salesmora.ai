import { describe, expect, it } from 'vitest';
import { calendarReviewResponse, calendarReviewVisits, calendarReviewWorkOrders } from './calendar-review-report.fixtures';
import { calendarArrivalWindowsOverlap, calendarOverlapKey, validCalendarArrivalWindow, validCalendarReviewResult } from './calendar-review-report.validation';

describe('schedule review', () => {
  it('matches C02: one A/V1/V2 pair, no adjacent V2/V3 pair and one unknown window', () => {
    const result = calendarReviewResponse();
    expect(result.counts).toEqual({ scheduledVisits: 4, missingWindows: 1, overlapPairs: 1, pastVisits: 4 });
    expect(result.evidence).toEqual({ kind: 'overlaps', rows: [{ personId: 'alex', leftVisitId: 'workspace-fixture:V1', rightVisitId: 'workspace-fixture:V2' }] });
    expect(result.visits).toHaveLength(2);
    expect(validCalendarReviewResult(result)).toBe(true);
  });
  it('uses strict intersection in either order; validates spans without assuming today’s preset list', () => {
    expect(validCalendarArrivalWindow('11:00-13:00')).toBe(true);
    for (const window of ['11:00-11:00', '13:00-11:00', '8:00-10:00', '08:60-10:00', '24:00-25:00']) expect(validCalendarArrivalWindow(window)).toBe(false);
    expect(calendarArrivalWindowsOverlap('08:00-10:00', '09:00-11:00')).toBe(true);
    expect(calendarArrivalWindowsOverlap('09:00-11:00', '08:00-10:00')).toBe(true);
    expect(calendarArrivalWindowsOverlap('08:00-14:00', '09:00-11:00')).toBe(true);
    expect(calendarArrivalWindowsOverlap('09:00-11:00', '11:00-13:00')).toBe(false);
    expect(calendarArrivalWindowsOverlap('23:00-01:00', '00:00-02:00')).toBe(false);
  });
  it('deduplicates explicit shared visits/crew and counts pairs independently per person', () => {
    const visits = calendarReviewVisits.map(visit => ({ ...visit, participantIds: ['alex', 'blair', 'alex'] }));
    const result = calendarReviewResponse([...visits, visits[0]!]);
    expect(result.counts.overlapPairs).toBe(2);
    expect(result.counts.pastVisits).toBe(4);
    expect(validCalendarReviewResult(result)).toBe(true);
    expect(calendarOverlapKey({ personId: 'alex', leftVisitId: 'one', rightVisitId: 'two' }))
      .toBe(calendarOverlapKey({ personId: 'alex', leftVisitId: 'two', rightVisitId: 'one' }));
  });
  it('only treats dates before business-local today as past, using the exact selected range', () => {
    const sameDay = calendarReviewResponse(undefined, { kind: 'past', today: '2026-11-05' });
    expect(sameDay.counts.pastVisits).toBe(0);
    expect(validCalendarReviewResult(sameDay)).toBe(true);
    const before = calendarReviewResponse(undefined, { kind: 'past', today: '2026-11-04' });
    expect(before.counts.pastVisits).toBe(0);
    expect(validCalendarReviewResult(before)).toBe(true);
    const outside = calendarReviewResponse(undefined, { from: '2026-11-06' });
    expect(outside.counts).toEqual({ scheduledVisits: 0, missingWindows: 0, overlapPairs: 0, pastVisits: 0 });
    expect(validCalendarReviewResult(outside)).toBe(true);
    const past = calendarReviewResponse(undefined, { kind: 'past', from: '2026-11-05', to: '2026-11-05' });
    expect(past.counts.pastVisits).toBe(4);
    expect(validCalendarReviewResult(past)).toBe(true);
  });
  it('never classifies missing windows as conflicts or a proven free schedule', () => {
    const result = calendarReviewResponse(calendarReviewVisits.map(visit => ({ ...visit, arrivalWindow: null })));
    expect(result.counts.missingWindows).toBe(4);
    expect(result.counts.overlapPairs).toBe(0);
    expect(validCalendarReviewResult(result)).toBe(true);
    expect(validCalendarReviewResult({ ...result, counts: { ...result.counts, overlapPairs: 1 } })).toBe(false);
  });
  it('preserves independent own and Work Order scopes without parent Job or crew leakage', () => {
    for (const kind of ['overlaps', 'past'] as const) {
      const own = calendarReviewResponse(undefined, { kind, scope: { kind: 'own', viewerId: 'blair' } });
      expect(own.counts.overlapPairs).toBe(0);
      expect(own.counts.pastVisits).toBe(1);
      expect(own.members.map(member => member.id)).toEqual(['blair']);
      expect(JSON.stringify(own.visits)).not.toContain('alex');
      expect(validCalendarReviewResult(own)).toBe(true);
      const orders = calendarReviewResponse(calendarReviewWorkOrders, { kind });
      expect(orders.counts.overlapPairs).toBe(0);
      expect(orders.counts.pastVisits).toBe(2);
      expect(JSON.stringify(orders.visits)).not.toMatch(/Job|blair/);
      expect(validCalendarReviewResult(orders)).toBe(true);
    }
  });
  it('supports all evidence pages and empty results', () => {
    for (const page of [1, 2, 3, 4]) expect(validCalendarReviewResult(calendarReviewResponse(undefined, { kind: 'past', page, pageSize: 1 }))).toBe(true);
    const shared = calendarReviewVisits.map(visit => ({ ...visit, participantIds: ['alex', 'blair'] }));
    for (const page of [1, 2]) expect(validCalendarReviewResult(calendarReviewResponse(shared, { page, pageSize: 1 }))).toBe(true);
    for (const kind of ['overlaps', 'past'] as const) expect(validCalendarReviewResult(calendarReviewResponse([], { kind }))).toBe(true);
  });
  it('reconciles all observable pairs when past evidence contains the full schedule', () => {
    const result = calendarReviewResponse(undefined, { kind: 'past' });
    expect(validCalendarReviewResult({ ...result, counts: { ...result.counts, overlapPairs: 0 } })).toBe(false);
    expect(validCalendarReviewResult({ ...result, counts: { ...result.counts, overlapPairs: 2 } })).toBe(false);
    const first = result.visits[0]!;
    expect(validCalendarReviewResult({ ...result, visits: result.visits.map((visit, index) => index ? visit : { ...visit,
      records: result.visits[1]!.records }) })).toBe(false);
    expect(validCalendarReviewResult({ ...result, visits: [...result.visits, { ...first, id: 'hidden-extra' }] })).toBe(false);
  });
  it('rejects reverse duplicate pairs, self-pairs, unknown/shared-person mismatch, adjacency and wrong dates', () => {
    const result = calendarReviewResponse();
    if (result.evidence.kind !== 'overlaps') throw new Error('Expected overlaps');
    const pair = result.evidence.rows[0]!;
    const reversed = { ...pair, leftVisitId: pair.rightVisitId, rightVisitId: pair.leftVisitId };
    expect(validCalendarReviewResult({ ...result, counts: { ...result.counts, overlapPairs: 2 },
      evidence: { kind: 'overlaps', rows: [pair, reversed] } })).toBe(false);
    for (const row of [{ ...pair, rightVisitId: pair.leftVisitId }, { ...pair, rightVisitId: 'hidden' },
      { ...pair, personId: 'blair' }, { ...pair, personId: 'hidden' }]) {
      expect(validCalendarReviewResult({ ...result, evidence: { kind: 'overlaps', rows: [row] } })).toBe(false);
    }
    expect(validCalendarReviewResult({ ...result, visits: result.visits.map((visit, index) => index ? { ...visit, arrivalWindow: '10:00-12:00' } : visit) })).toBe(false);
    expect(validCalendarReviewResult({ ...result, visits: result.visits.map((visit, index) => index ? { ...visit, date: '2026-11-04' } : visit) })).toBe(false);
  });
  it('rejects extra/missing visits, duplicate records/participants and invalid window projections', () => {
    const result = calendarReviewResponse();
    const first = result.visits[0]!;
    expect(validCalendarReviewResult({ ...result, visits: [] })).toBe(false);
    expect(validCalendarReviewResult({ ...result, visits: [...result.visits, first] })).toBe(false);
    for (const visit of [{ ...first, arrivalWindow: 'bad' }, { ...first, arrivalWindow: null },
      { ...first, participantIds: ['alex', 'alex'] }, { ...first, records: [] },
      { ...first, records: [first.records[0]!, first.records[0]!] }]) {
      expect(validCalendarReviewResult({ ...result, visits: [visit, ...result.visits.slice(1)] })).toBe(false);
    }
  });
  it('rejects invalid counts, scope, dates, past membership and paging', () => {
    const result = calendarReviewResponse(undefined, { kind: 'past' });
    for (const invalid of [
      { ...result, counts: { ...result.counts, scheduledVisits: -1 } },
      { ...result, counts: { ...result.counts, missingWindows: 5 } },
      { ...result, counts: { ...result.counts, missingWindows: 0 } },
      { ...result, counts: { ...result.counts, pastVisits: 5 } },
      { ...result, counts: { ...result.counts, overlapPairs: Number.MAX_SAFE_INTEGER } },
      { ...result, scope: { kind: 'own' as const, viewerId: 'alex' } },
      { ...result, members: [...result.members, result.members[0]!] },
      { ...result, today: '2026-11-05' }, { ...result, today: '2026-02-30' },
      { ...result, from: '2026-11-12' }, { ...result, timezone: 'invalid/zone' },
      { ...result, page: 2 }, { ...result, pageSize: 0 },
      { ...result, evidence: { kind: 'past' as const, visitIds: ['hidden', ...result.visits.slice(1).map(visit => visit.id)] } },
    ]) expect(validCalendarReviewResult(invalid)).toBe(false);
  });
});

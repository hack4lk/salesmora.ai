import { describe, expect, it } from 'vitest';
import { calendarReportArrivalWindowSchema, calendarReportWindowsOverlap, calendarReviewQuerySchema, calendarReviewResultSchema } from './calendar-review';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const visits = ['08:00-10:00', '09:00-11:00', '11:00-13:00', null].map((arrivalWindow, index) => ({
  id: uuid(index + 10), label: 'Visit', date: '2026-11-05', arrivalWindow, participantIds: ['a', 'b'],
  records: [{ id: uuid(index + 20), recordId: uuid(index + 20), type: 'job', label: 'Job' }],
}));
const pair = { personId: 'a', leftVisitId: visits[0]!.id, rightVisitId: visits[1]!.id };
const result = {
  workspaceId: uuid(1), view: 'calendar-review', from: '2026-11-05', to: '2026-11-07', today: '2026-11-06',
  asOf: '2026-11-06T16:00:00Z', timezone: 'America/New_York', scopeLabel: 'Authorized current schedule.',
  scope: { kind: 'workspace' }, members: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
  counts: { scheduledVisits: 4, missingWindows: 1, overlapPairs: 2, pastVisits: 4 },
  visits: visits.slice(0, 2), evidence: { kind: 'overlaps', rows: [pair, { ...pair, personId: 'b' }] },
  evidenceTotal: 2, page: 1, pageSize: 25,
};
describe('Calendar schedule-review contracts', () => {
  it('reuses inclusive bounded schedule periods with no client clock, scope or scheduling actions', () => {
    const query = { workspaceId: uuid(1), view: 'calendar-review', period: { from: '2026-11-05', to: '2026-11-07' }, selected: 'overlaps' };
    expect(calendarReviewQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [
      { today: '2027-01-01' }, { scope: 'workspace' }, { selected: 'visits' }, { pageSize: 10 }, { page: 0 },
      { period: { from: '2026-11-07', to: '2026-11-05' } }, { period: { from: '2026-01-01', to: '2027-01-02' } },
    ]) expect(calendarReviewQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    expect(calendarReviewQuerySchema.safeParse({ ...query, period: { from: '2099-01-01', to: '2099-01-02' } }).success).toBe(true);
  });
  it('validates persisted spans beyond presets and uses strict intersection, not adjacency', () => {
    expect(calendarReportArrivalWindowSchema.safeParse('11:00-13:00').success).toBe(true);
    for (const span of ['11:00-11:00', '13:00-11:00', '8:00-10:00', '08:60-10:00', '24:00-25:00', '23:00-01:00', 'bad']) {
      expect(calendarReportArrivalWindowSchema.safeParse(span).success).toBe(false);
      expect(calendarReportWindowsOverlap(span, '09:00-11:00')).toBe(false);
    }
    expect(calendarReportWindowsOverlap('08:00-10:00', '09:00-11:00')).toBe(true);
    expect(calendarReportWindowsOverlap('09:00-11:00', '08:00-10:00')).toBe(true);
    expect(calendarReportWindowsOverlap('08:00-14:00', '09:00-11:00')).toBe(true);
    expect(calendarReportWindowsOverlap('09:00-11:00', '11:00-13:00')).toBe(false);
  });
  it('counts an unordered shared visit pair separately per person, not per linked record', () => {
    expect(calendarReviewResultSchema.safeParse(result).success).toBe(true);
    const linked = { ...result, visits: result.visits.map((visit, index) => index ? visit : {
      ...visit, records: [...visit.records, { id: uuid(80), recordId: uuid(80), type: 'work_order', label: 'Order' }],
    }) };
    expect(calendarReviewResultSchema.safeParse(linked).success).toBe(true);
    expect(calendarReviewResultSchema.safeParse({ ...result, counts: { ...result.counts, overlapPairs: 1 } }).success).toBe(false);
  });
  it('rejects reverse duplicates, self-pairs, hidden/mismatched participants, unknown windows and different dates', () => {
    for (const row of [
      { ...pair, rightVisitId: pair.leftVisitId }, { ...pair, rightVisitId: uuid(99) }, { ...pair, personId: 'hidden' },
      { ...pair, leftVisitId: pair.rightVisitId, rightVisitId: pair.leftVisitId },
    ]) expect(calendarReviewResultSchema.safeParse({
      ...result, evidence: { kind: 'overlaps', rows: [pair, row] },
    }).success).toBe(false);
    for (const patch of [{ arrivalWindow: null }, { arrivalWindow: '10:00-12:00' }, { date: '2026-11-06' }, { participantIds: ['b'] }]) {
      expect(calendarReviewResultSchema.safeParse({
        ...result, visits: [result.visits[0], { ...result.visits[1], ...patch }],
      }).success).toBe(false);
    }
  });
  it('reconciles every observable pair when the full schedule is supporting past evidence', () => {
    const past = { ...result, visits, evidence: { kind: 'past', visitIds: visits.map(visit => visit.id) }, evidenceTotal: 4 };
    expect(calendarReviewResultSchema.safeParse(past).success).toBe(true);
    for (const patch of [
      { counts: { ...result.counts, overlapPairs: 3 } }, { counts: { ...result.counts, missingWindows: 0 } },
      { today: '2026-11-05' }, { visits: [...visits, visits[0]] }, { visits: visits.slice(1) }, { page: 2 },
    ]) expect(calendarReviewResultSchema.safeParse({ ...past, ...patch }).success).toBe(false);
  });
  it('enforces self-only own evidence and roster, including empty schedules', () => {
    const mine = { ...result, scope: { kind: 'own', viewerId: 'a' }, members: [result.members[0]],
      visits: result.visits.map(visit => ({ ...visit, participantIds: ['a'] })),
      counts: { ...result.counts, overlapPairs: 1 }, evidenceTotal: 1, evidence: { kind: 'overlaps', rows: [pair] } };
    expect(calendarReviewResultSchema.safeParse(mine).success).toBe(true);
    for (const patch of [{ members: result.members }, { visits: result.visits }, { evidence: { kind: 'overlaps', rows: [{ ...pair, personId: 'b' }] } }]) {
      expect(calendarReviewResultSchema.safeParse({ ...mine, ...patch }).success).toBe(false);
    }
    expect(calendarReviewResultSchema.safeParse({
      ...mine, counts: { scheduledVisits: 0, missingWindows: 0, overlapPairs: 0, pastVisits: 0 },
      visits: [], evidence: { kind: 'overlaps', rows: [] }, evidenceTotal: 0,
    }).success).toBe(true);
  });
  it('treats missing windows as unknown and limits pair counts safely even for large totals', () => {
    const unknown = { ...result, counts: { scheduledVisits: 4, missingWindows: 4, overlapPairs: 0, pastVisits: 4 },
      visits: [], evidence: { kind: 'overlaps', rows: [] }, evidenceTotal: 0 };
    expect(calendarReviewResultSchema.safeParse(unknown).success).toBe(true);
    expect(calendarReviewResultSchema.safeParse({ ...unknown, counts: { ...unknown.counts, overlapPairs: 1 } }).success).toBe(false);
    expect(calendarReviewResultSchema.safeParse({ ...result, counts: { ...result.counts, overlapPairs: Number.MAX_SAFE_INTEGER } }).success).toBe(false);
  });
  it('requires exactly the selected supporting visits, unique records and participants, bounded pages and valid counts', () => {
    for (const patch of [
      { visits: [] }, { visits }, { evidenceTotal: 3 }, { page: 2 },
      { counts: { ...result.counts, missingWindows: 5 } }, { counts: { ...result.counts, pastVisits: 5 } },
      { counts: { ...result.counts, overlapPairs: -1 } }, { counts: { ...result.counts, scheduledVisits: 1.5 } },
      { visits: result.visits.map(visit => ({ ...visit, participantIds: ['a', 'a', 'b'] })) },
      { visits: result.visits.map(visit => ({ ...visit, records: visits[0]!.records })) },
      { visits: result.visits.map(visit => ({ ...visit, arrivalWindow: 'bad' })) },
    ]) expect(calendarReviewResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('enforces strictly past membership and whole-range past/future counts', () => {
    const future = { ...result, from: '2026-11-06', today: '2026-11-06', visits: [],
      counts: { scheduledVisits: 4, missingWindows: 1, overlapPairs: 0, pastVisits: 0 },
      evidence: { kind: 'past', visitIds: [] }, evidenceTotal: 0 };
    expect(calendarReviewResultSchema.safeParse(future).success).toBe(true);
    expect(calendarReviewResultSchema.safeParse({ ...result, to: '2026-11-05', counts: { ...result.counts, pastVisits: 3 } }).success).toBe(false);
  });
});

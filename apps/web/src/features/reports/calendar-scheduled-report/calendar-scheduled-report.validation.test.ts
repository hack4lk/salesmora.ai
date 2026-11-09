import { describe, expect, it } from 'vitest';
import { calendarScheduledResponse, calendarScheduledVisits, calendarWorkOrderOnlyVisits } from './calendar-scheduled-report.fixtures';
import { validCalendarScheduledResult } from './calendar-scheduled-report.validation';

describe('scheduled visit reporting', () => {
  it('matches C01: four distinct visits, A=4, B=1 and one busy person-day despite duplicate crew', () => {
    const result = calendarScheduledResponse();
    expect(result.counts).toEqual({ visits: 4, busyPersonDays: 1 });
    expect(result.members.map(member => member.counts[0])).toEqual([4, 1]);
    expect(result.days.map(day => day.count)).toEqual([4, 0, 0, 0, 0, 0, 0]);
    expect(validCalendarScheduledResult(result)).toBe(true);
    if (result.evidence.kind !== 'visits') throw new Error('Expected visit evidence');
    expect(result.evidence.rows[0]!.records).toHaveLength(3);
    expect(result.evidence.rows[0]!.participantIds).toEqual(['alex', 'blair']);
  });
  it('deduplicates explicit visit/record identities, never matching dates or display labels', () => {
    const first = calendarScheduledVisits[0]!;
    const result = calendarScheduledResponse([...calendarScheduledVisits, first, { ...first, id: 'other-workspace:V1',
      records: first.records.map(record => ({ ...record, id: `other:${record.id}` })) }]);
    expect(result.counts).toEqual({ visits: 5, busyPersonDays: 1 });
    expect(validCalendarScheduledResult(result)).toBe(true);
  });
  it('uses four visits, not four records or three visits, as the busy threshold', () => {
    expect(calendarScheduledResponse(calendarScheduledVisits.slice(0, 3)).counts.busyPersonDays).toBe(0);
    const result = calendarScheduledResponse(undefined, { kind: 'busy-person-days' });
    expect(result.evidence.rows).toEqual([{ personId: 'alex', date: '2026-11-05' }]);
    expect(validCalendarScheduledResult(result)).toBe(true);
  });
  it('counts exact inclusive dates across partial Calendar weeks, excluding both outside dates', () => {
    const visit = calendarScheduledVisits[1]!;
    const extra = ['2026-11-04', '2026-11-11', '2026-11-12'].map(date => ({ ...visit, id: `workspace-fixture:${date}`, date,
      records: visit.records.map(record => ({ ...record, id: `${record.id}:${date}` })) }));
    const result = calendarScheduledResponse([...calendarScheduledVisits, ...extra]);
    expect(result.counts.visits).toBe(5);
    expect(result.days[6]).toEqual({ date: '2026-11-11', count: 1, unassignedCount: 0 });
    expect(validCalendarScheduledResult(result)).toBe(true);
    const dst = calendarScheduledResponse([], { from: '2026-10-31', to: '2026-11-02' });
    expect(dst.days).toHaveLength(3);
    expect(validCalendarScheduledResult(dst)).toBe(true);
  });
  it('preserves non-additive people and a separate authorized-participant-free count', () => {
    const visit = calendarScheduledVisits[1]!;
    const result = calendarScheduledResponse([...calendarScheduledVisits, { ...visit, id: 'workspace-fixture:none', participantIds: [],
      records: visit.records.map(record => ({ ...record, id: `${record.id}:none` })) }]);
    expect(result.counts.visits).toBe(5);
    expect(result.days[0]!.unassignedCount).toBe(1);
    expect(validCalendarScheduledResult(result)).toBe(true);
    expect(validCalendarScheduledResult({ ...result, days: result.days.map(day => ({ ...day, unassignedCount: 0 })) })).toBe(false);
  });
  it('withholds parent Job and unrelated participant data in Work Order-only and own projections', () => {
    const restricted = calendarScheduledResponse(calendarWorkOrderOnlyVisits);
    expect(restricted.counts.visits).toBe(2);
    expect(JSON.stringify(restricted.evidence)).not.toContain('Job');
    expect(JSON.stringify(restricted.evidence)).not.toContain('blair');
    expect(validCalendarScheduledResult(restricted)).toBe(true);
    const own = calendarScheduledResponse(undefined, { scope: { kind: 'own', viewerId: 'blair' } });
    expect(own.counts.visits).toBe(1);
    expect(own.members.map(member => member.id)).toEqual(['blair']);
    expect(JSON.stringify(own.evidence)).not.toContain('alex');
    expect(validCalendarScheduledResult(own)).toBe(true);
    expect(validCalendarScheduledResult({ ...own, members: calendarScheduledResponse().members })).toBe(false);
    expect(validCalendarScheduledResult(calendarScheduledResponse([], { scope: { kind: 'own', viewerId: 'alex' } }))).toBe(true);
  });
  it('reconciles all pages against full aggregates and busy-day membership', () => {
    for (const page of [1, 2, 3, 4]) expect(validCalendarScheduledResult(calendarScheduledResponse(undefined, { page, pageSize: 1 }))).toBe(true);
    expect(validCalendarScheduledResult(calendarScheduledResponse([]))).toBe(true);
    expect(validCalendarScheduledResult(calendarScheduledResponse([], { kind: 'busy-person-days' }))).toBe(true);
    const busy = calendarScheduledResponse(undefined, { kind: 'busy-person-days' });
    expect(validCalendarScheduledResult({ ...busy, evidence: { kind: 'busy-person-days', rows: [{ personId: 'blair', date: '2026-11-05' }] } })).toBe(false);
  });
  it('rejects invalid counts, dates, timezone, day coverage and paging', () => {
    const result = calendarScheduledResponse();
    for (const invalid of [
      { ...result, counts: { visits: -1, busyPersonDays: 1 } },
      { ...result, counts: { visits: 4, busyPersonDays: 2 } },
      { ...result, counts: { visits: Number.MAX_SAFE_INTEGER + 1, busyPersonDays: 1 } },
      { ...result, days: result.days.slice(1) },
      { ...result, days: [...result.days].reverse() },
      { ...result, members: result.members.map(member => ({ ...member, counts: member.counts.map(() => 0) })) },
      { ...result, members: [result.members[0]!, result.members[0]!] },
      { ...result, page: 2 }, { ...result, pageSize: 0 },
      { ...result, today: '2026-02-30' }, { ...result, from: '2026-11-12' }, { ...result, to: '2028-01-01' },
      { ...result, timezone: 'invalid/zone' },
    ]) expect(validCalendarScheduledResult(invalid)).toBe(false);
  });
  it('rejects duplicate visits, participants, records, outside dates and unknown members', () => {
    const result = calendarScheduledResponse();
    if (result.evidence.kind !== 'visits') throw new Error('Expected visit evidence');
    const rows = result.evidence.rows, first = rows[0]!;
    for (const row of [
      { ...first, participantIds: ['alex', 'alex'] },
      { ...first, participantIds: ['hidden'] },
      { ...first, records: [first.records[0]!, first.records[0]!] },
      { ...first, records: [] },
      { ...first, date: '2026-11-12' },
      { ...first, date: '2026-11-06' },
      { ...first, participantIds: [] },
    ]) expect(validCalendarScheduledResult({ ...result, evidence: { kind: 'visits', rows: [row, ...rows.slice(1)] } })).toBe(false);
    expect(validCalendarScheduledResult({ ...result, evidence: { kind: 'visits', rows: [first, first, ...rows.slice(2)] } })).toBe(false);
    expect(validCalendarScheduledResult({ ...result, evidence: { kind: 'visits', rows: rows.map(row => ({ ...row, records: first.records })) } })).toBe(false);
  });
});

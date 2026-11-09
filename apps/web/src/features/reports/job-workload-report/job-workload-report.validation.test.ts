import { describe, expect, it } from 'vitest';
import { jobMatchesWorkload, jobWorkloadGroupId, validJobWorkloadResult, type JobWorkloadRow } from './job-workload-report.validation';
import { workloadResult as result, workloadRows as rows } from './job-workload-report.fixtures';

const row: JobWorkloadRow = rows[0]!;
describe('current Job deadline boundaries', () => {
  it('matches the exact discovery totals, including Waiting and no deadline', () => {
    expect(validJobWorkloadResult(result)).toBe(true);
    expect(rows.filter(row => jobMatchesWorkload(row, 'overdue', result.today)).map(row => row.id)).toEqual(['d0']);
    expect(rows.filter(row => jobMatchesWorkload(row, 'dueSoon', result.today)).map(row => row.id)).toEqual(['d1', 'd2']);
    expect(rows.filter(row => jobMatchesWorkload(row, 'noDeadline', result.today)).map(row => row.id)).toEqual(['d3']);
  });
  it.each([
    ['2026-11-04', true, false], ['2026-11-05', false, true], ['2026-11-12', false, true], ['2026-11-13', false, false],
  ])('classifies %s relative to local today', (date, overdue, dueSoon) => {
    expect(jobMatchesWorkload({ ...row, completionDeadline: String(date) }, 'overdue', result.today)).toBe(overdue);
    expect(jobMatchesWorkload({ ...row, completionDeadline: String(date) }, 'dueSoon', result.today)).toBe(dueSoon);
  });
  it('excludes Completed and Canceled Jobs despite past deadlines', () => {
    for (const status of ['completed', 'canceled'] as const) {
      expect(jobMatchesWorkload({ ...row, status }, 'active', result.today)).toBe(false);
      expect(jobMatchesWorkload({ ...row, status }, 'overdue', result.today)).toBe(false);
    }
  });
  it('does not treat missing deadlines or past scheduled dates as overdue', () => {
    expect(jobMatchesWorkload({ ...row, completionDeadline: null }, 'overdue', result.today)).toBe(false);
    expect(jobMatchesWorkload(rows[4]!, 'overdue', result.today)).toBe(false);
    expect(jobMatchesWorkload(rows[4]!, 'dueSoon', result.today)).toBe(false);
  });
  it('uses calendar-date windows across month/year and DST boundaries', () => {
    expect(jobMatchesWorkload({ ...row, completionDeadline: '2027-01-03' }, 'dueSoon', '2026-12-27')).toBe(true);
    expect(jobMatchesWorkload({ ...row, completionDeadline: '2026-03-30' }, 'dueSoon', '2026-03-23')).toBe(true);
    expect(jobMatchesWorkload({ ...row, completionDeadline: '2026-03-31' }, 'dueSoon', '2026-03-23')).toBe(false);
  });
  it('rejects invalid local dates, never treating them as unset', () => {
    expect(jobMatchesWorkload({ ...row, completionDeadline: '2026-02-30' }, 'active', result.today)).toBe(false);
    expect(jobMatchesWorkload(row, 'active', '0000-01-01')).toBe(false);
    expect(jobMatchesWorkload(row, 'active', '9999-12-31')).toBe(false);
  });
});
describe('current Job evidence reconciliation', () => {
  it('keeps arbitrary member identities separate from unassigned group IDs', () => {
    expect(jobWorkloadGroupId({ ...row, primaryOwnerId: 'unassigned' }, 'owner')).toBe('member:unassigned');
    expect(jobWorkloadGroupId({ ...row, primaryOwnerId: null }, 'owner')).toBe('unassigned');
  });
  it('accepts metric and group projections with matching distinct rows', () => {
    expect(validJobWorkloadResult({ ...result, selected: { kind: 'metric', metric: 'dueSoon' }, rows: [rows[1]!, rows[2]!] })).toBe(true);
    expect(validJobWorkloadResult({ ...result, selected: { kind: 'group', group: 'waitingReason', id: 'materials' }, rows: [rows[2]!] })).toBe(true);
    expect(validJobWorkloadResult({ ...result, selected: { kind: 'group', group: 'owner', id: 'unassigned' }, rows: [rows[3]!] })).toBe(true);
  });
  it('rejects wrong projection, closed evidence, duplicate Jobs and invalid pagination', () => {
    expect(validJobWorkloadResult({ ...result, selected: { kind: 'metric', metric: 'overdue' }, rows: [rows[1]!] })).toBe(false);
    expect(validJobWorkloadResult({ ...result, rows: [{ ...row, status: 'completed' }, ...rows.slice(1)] })).toBe(false);
    expect(validJobWorkloadResult({ ...result, rows: [row, row, ...rows.slice(2)] })).toBe(false);
    expect(validJobWorkloadResult({ ...result, page: 2 })).toBe(false);
    expect(validJobWorkloadResult({ ...result, pageSize: 0 })).toBe(false);
  });
  it('requires group/metric reconciliation and a recorded Waiting reason', () => {
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, waiting: 2 } })).toBe(false);
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, unassigned: 0 } })).toBe(false);
    expect(validJobWorkloadResult({ ...result, groups: { ...result.groups, service: [] } })).toBe(false);
    expect(validJobWorkloadResult({ ...result, rows: rows.map(row => row.status === 'waiting' ? { ...row, waitingReason: null } : row) })).toBe(false);
  });
  it('rejects impossible disjoint deadline counts and unsafe values', () => {
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, overdue: 4, dueSoon: 2 } })).toBe(false);
    for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, overdue: value } })).toBe(false);
    }
  });
  it('reconciles complete evidence to groups and metrics, not just row count', () => {
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, dueSoon: 1 } })).toBe(false);
    expect(validJobWorkloadResult({ ...result, rows: rows.map(row => ({ ...row, completionDeadline: null })) })).toBe(false);
    expect(validJobWorkloadResult({ ...result, rows: rows.map(row => ({ ...row, serviceId: 'repair' })) })).toBe(false);
  });
  it('accepts valid partial pages but rejects observed counts exceeding snapshot totals', () => {
    expect(validJobWorkloadResult({ ...result, pageSize: 2, rows: rows.slice(0, 2) })).toBe(true);
    expect(validJobWorkloadResult({ ...result, pageSize: 2, page: 3, rows: rows.slice(4) })).toBe(true);
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, overdue: 0 }, pageSize: 2, rows: rows.slice(0, 2) })).toBe(false);
    expect(validJobWorkloadResult({ ...result, counts: { ...result.counts, noDeadline: 5 }, pageSize: 2, rows: rows.slice(0, 2) })).toBe(false);
  });
});

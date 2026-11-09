import { describe, expect, it } from 'vitest';
import { jobLifecycleViews, validJobLifecycleResult, type JobLifecycleResult } from './job-lifecycle-report.validation';

const row = { id: 'job-a', cells: { date: 'Oct 10, 2026', status: 'Active', owner: null, service: 'Installation' }, label: 'Job A' };
const result: JobLifecycleResult = {
  periodLabel: 'October 2026', snapshotLabel: 'Nov 5, 2026 / Europe/Warsaw', scopeLabel: 'Authorized Jobs',
  counts: { created: 2, completed: 1, canceled: 1, reopened: 1 },
  coverage: { created: { kind: 'complete' }, completed: { kind: 'complete' }, canceled: { kind: 'complete' }, reopened: { kind: 'complete' } },
  evidenceIds: {}, selectedView: 'completed', rows: [row], page: 1, pageSize: 25,
};
describe('validJobLifecycleResult', () => {
  it('accepts overlapping lifecycle counts without an exclusive-total constraint', () => {
    expect(validJobLifecycleResult(result)).toBe(true);
  });
  it('accepts an empty authorized projection and explicit incomplete coverage', () => {
    expect(validJobLifecycleResult({ ...result, counts: { ...result.counts, completed: 0 }, rows: [] })).toBe(true);
    expect(validJobLifecycleResult({ ...result, coverage: { ...result.coverage, completed: { kind: 'partial', explanation: 'Missing recorded history.' } } })).toBe(true);
  });
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid count %s for every view', count => {
    for (const view of jobLifecycleViews) expect(validJobLifecycleResult({ ...result, counts: { ...result.counts, [view]: count } })).toBe(false);
  });
  it('rejects missing coverage explanations for any metric', () => {
    for (const view of jobLifecycleViews) expect(validJobLifecycleResult({ ...result, coverage: { ...result.coverage, [view]: { kind: 'partial', explanation: ' ' } } })).toBe(false);
  });
  it('requires an exact selected page, valid pagination and distinct Job IDs', () => {
    expect(validJobLifecycleResult({ ...result, rows: [] })).toBe(false);
    expect(validJobLifecycleResult({ ...result, page: 2 })).toBe(false);
    expect(validJobLifecycleResult({ ...result, pageSize: 0 })).toBe(false);
    expect(validJobLifecycleResult({ ...result, counts: { ...result.counts, completed: 2 }, rows: [row, row] })).toBe(false);
    expect(validJobLifecycleResult({ ...result, rows: [{ ...row, id: ' ' }] })).toBe(false);
  });
  it('requires dated evidence but allows unknown current ownership', () => {
    expect(validJobLifecycleResult(result)).toBe(true);
    for (const date of [null, '', ' ']) expect(validJobLifecycleResult({ ...result, rows: [{ ...row, cells: { ...row.cells, date } }] })).toBe(false);
    expect(validJobLifecycleResult({ ...result, rows: [{ ...row, cells: { date: 'Oct 10' } }] })).toBe(false);
  });
  it('accepts a correctly sized later page', () => {
    expect(validJobLifecycleResult({ ...result, counts: { ...result.counts, completed: 26 }, page: 2 })).toBe(true);
  });
});

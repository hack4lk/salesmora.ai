import { describe, expect, it } from 'vitest';
import { completionElapsedDays, validJobCompletionResult, type JobCompletionResult } from './job-completion-report.validation';

const row = { id: 'a', label: 'Job A', createdDate: '2026-09-30', completionDate: '2026-10-01', cells: { status: 'Active', owner: null } };
const result: JobCompletionResult = { from: '2026-10-01', to: '2026-10-02', periodLabel: 'Two dates', snapshotLabel: 'Snapshot', scopeLabel: 'Authorized',
  total: 1, coverage: { kind: 'complete' }, duration: { sampleSize: 1, totalElapsedDays: 1 }, days: [{ date: '2026-10-01', count: 1 }, { date: '2026-10-02', count: 0 }],
  rows: [row], page: 1, pageSize: 25 };
describe('completion elapsed days', () => {
  it.each([['2026-09-30', '2026-10-10', 10], ['2026-10-02', '2026-10-07', 5], ['2026-10-10', '2026-10-10', 0],
    ['2026-03-28', '2026-03-30', 2], ['2024-02-28', '2024-03-01', 2], ['2024-01-01', '2026-01-01', 731]])('counts local labels %s to %s', (from, to, expected) => {
    expect(completionElapsedDays(String(from), String(to))).toBe(expected);
  });
  it('rejects invalid dates and completion before creation', () => {
    expect(completionElapsedDays('2026-02-30', '2026-03-01')).toBeUndefined();
    expect(completionElapsedDays('2026-10-02', '2026-10-01')).toBeUndefined();
  });
});
describe('completion projection reconciliation', () => {
  it('accepts full, selected-day and empty-day evidence without changing enclosing sample', () => {
    expect(validJobCompletionResult(result)).toBe(true);
    expect(validJobCompletionResult({ ...result, selectedDate: '2026-10-01' })).toBe(true);
    expect(validJobCompletionResult({ ...result, selectedDate: '2026-10-02', rows: [] })).toBe(true);
  });
  it('rejects missing zero days, wrong day selection and duplicate Jobs', () => {
    expect(validJobCompletionResult({ ...result, days: result.days.slice(0, 1) })).toBe(false);
    expect(validJobCompletionResult({ ...result, selectedDate: '2026-10-02' })).toBe(false);
    expect(validJobCompletionResult({ ...result, selectedDate: '2026-10-03' })).toBe(false);
    expect(validJobCompletionResult({ ...result, total: 2, rows: [row, row], days: [{ date: '2026-10-01', count: 2 }, result.days[1]!] })).toBe(false);
  });
  it('rejects incorrect sample/sum and requires incomplete explanation', () => {
    expect(validJobCompletionResult({ ...result, duration: { sampleSize: 1, totalElapsedDays: 2 } })).toBe(false);
    expect(validJobCompletionResult({ ...result, duration: { sampleSize: 2, totalElapsedDays: 1 } })).toBe(false);
    expect(validJobCompletionResult({ ...result, duration: { sampleSize: 0, totalElapsedDays: 0 } })).toBe(false);
  });
  it('accepts missing creation evidence only with reconciled explicit coverage', () => {
    expect(validJobCompletionResult({ ...result, rows: [{ ...row, createdDate: null }], duration: { sampleSize: 0, totalElapsedDays: 0, explanation: 'Missing creation date.' } })).toBe(true);
    expect(validJobCompletionResult({ ...result, rows: [{ ...row, createdDate: null }] })).toBe(false);
  });
  it('rejects unsafe duration sums and invalid chronology', () => {
    expect(validJobCompletionResult({ ...result, duration: { sampleSize: 1, totalElapsedDays: Number.MAX_SAFE_INTEGER + 1 } })).toBe(false);
    expect(validJobCompletionResult({ ...result, rows: [{ ...row, createdDate: '2026-10-02' }] })).toBe(false);
  });
});

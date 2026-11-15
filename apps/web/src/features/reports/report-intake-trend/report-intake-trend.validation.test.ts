import { describe, expect, it } from 'vitest';
import { intakeTrendSpans, validIntakeTrend } from './report-intake-trend.validation';

describe('intake trend date coverage', () => {
  it.each([
    ['2026-01-01', '2026-01-31', 'daily'],
    ['2026-01-01', '2026-02-01', 'weekly'],
    ['2026-01-01', '2026-04-03', 'weekly'],
    ['2026-01-01', '2026-04-04', 'monthly'],
  ])('selects exact interval threshold %s to %s', (from, to, interval) => {
    expect(intakeTrendSpans({ from, to })?.interval).toBe(interval);
  });
  it('clips Monday-Sunday weeks and includes DST-adjacent dates without elapsed-hour math', () => {
    const spans = intakeTrendSpans({ from: '2026-03-05', to: '2026-04-05' })?.spans;
    expect(spans?.[0]).toEqual({ from: '2026-03-05', to: '2026-03-08' });
    expect(spans?.[1]).toEqual({ from: '2026-03-09', to: '2026-03-15' });
    expect(spans?.at(-1)).toEqual({ from: '2026-03-30', to: '2026-04-05' });
  });
  it('clips months and covers leap day', () => {
    const spans = intakeTrendSpans({ from: '2024-01-15', to: '2024-05-02' })?.spans;
    expect(spans?.[0]).toEqual({ from: '2024-01-15', to: '2024-01-31' });
    expect(spans?.[1]).toEqual({ from: '2024-02-01', to: '2024-02-29' });
    expect(spans?.at(-1)).toEqual({ from: '2024-05-01', to: '2024-05-02' });
  });
  it('accepts 366 inclusive dates and rejects 367 or invalid dates', () => {
    expect(intakeTrendSpans({ from: '2024-01-01', to: '2024-12-31' })).toBeDefined();
    for (const range of [{ from: '2024-01-01', to: '2025-01-01' }, { from: '2026-02-30', to: '2026-03-01' }, { from: '2026-03-02', to: '2026-03-01' }]) {
      expect(intakeTrendSpans(range)).toBeUndefined();
    }
  });
  it('requires every ordered bucket including zeros and exact reconciliation', () => {
    const range = { from: '2026-01-01', to: '2026-01-02' };
    const buckets = [{ from: range.from, to: range.from, count: 1 }, { from: range.to, to: range.to, count: 0 }];
    expect(validIntakeTrend(range, 1, buckets)).toBe(true);
    expect(validIntakeTrend(range, 0, buckets)).toBe(false);
    expect(validIntakeTrend(range, 1, buckets.slice(0, 1))).toBe(false);
    expect(validIntakeTrend(range, 1, [...buckets].reverse())).toBe(false);
    expect(validIntakeTrend(range, 1, [{ ...buckets[0]!, to: range.to }, buckets[1]!])).toBe(false);
  });
});

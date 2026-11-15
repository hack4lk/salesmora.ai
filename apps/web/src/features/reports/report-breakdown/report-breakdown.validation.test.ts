import { describe, expect, it } from 'vitest';
import { validReportBreakdown } from './report-breakdown.validation';

describe('validReportBreakdown', () => {
  it('accepts reconciled groups and genuine zero counts', () => {
    expect(validReportBreakdown(4, [{ id: 'a', count: 4 }, { id: 'b', count: 0 }])).toBe(true);
    expect(validReportBreakdown(0, [])).toBe(true);
    expect(validReportBreakdown(0, [{ id: 'a', count: 0 }])).toBe(true);
  });
  it('accepts the maximum safe total', () => {
    expect(validReportBreakdown(Number.MAX_SAFE_INTEGER, [{ id: 'a', count: Number.MAX_SAFE_INTEGER }])).toBe(true);
  });
  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid total %s', total => {
    expect(validReportBreakdown(total, [])).toBe(false);
  });
  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid group count %s', count => {
    expect(validReportBreakdown(4, [{ id: 'a', count }])).toBe(false);
  });
  it('rejects missing groups, undercounts and overcounts', () => {
    expect(validReportBreakdown(4, [])).toBe(false);
    expect(validReportBreakdown(4, [{ id: 'a', count: 3 }])).toBe(false);
    expect(validReportBreakdown(4, [{ id: 'a', count: 5 }])).toBe(false);
  });
  it('rejects duplicate and blank group identifiers', () => {
    expect(validReportBreakdown(4, [{ id: 'a', count: 2 }, { id: 'a', count: 2 }])).toBe(false);
    expect(validReportBreakdown(0, [{ id: ' ', count: 0 }])).toBe(false);
  });
  it('rejects sums beyond the safe integer ceiling', () => {
    expect(validReportBreakdown(Number.MAX_SAFE_INTEGER, [{ id: 'a', count: Number.MAX_SAFE_INTEGER }, { id: 'b', count: 1 }])).toBe(false);
  });
});

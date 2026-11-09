import { describe, expect, it } from 'vitest';
import { formatLeadConversionRate, validLeadConversionCounts } from './lead-conversion-report.validation';

describe('lead conversion counts and rates', () => {
  it('accepts zero, complete and maximum safe counts', () => {
    for (const [cohort, converted] of [[0, 0], [4, 2], [4, 4], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]]) {
      expect(validLeadConversionCounts(cohort, converted)).toBe(true);
    }
  });
  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid counts %s', count => {
    expect(validLeadConversionCounts(count, 0)).toBe(false);
    expect(validLeadConversionCounts(4, count)).toBe(false);
  });
  it('rejects a numerator above the denominator', () => {
    expect(validLeadConversionCounts(4, 5)).toBe(false);
  });
  it.each([[4, 2, '50%'], [4, 0, '0%'], [4, 4, '100%'], [3, 1, '33.3%']])('formats %s / %s as %s', (cohort, converted, expected) => {
    expect(formatLeadConversionRate(Number(cohort), Number(converted))).toBe(expected);
  });
  it('never formats an absent or invalid denominator as zero percent', () => {
    expect(() => formatLeadConversionRate(0, 0)).toThrow(RangeError);
    expect(() => formatLeadConversionRate(1, 2)).toThrow(RangeError);
  });
});

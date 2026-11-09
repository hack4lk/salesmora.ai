import { describe, expect, it } from 'vitest';
import { validLeadAttentionCounts } from './lead-attention-report.validation';

describe('validLeadAttentionCounts', () => {
  it.each([
    { inactive: 0, unowned: 0, combined: 0 },
    { inactive: 1, unowned: 1, combined: 1 },
    { inactive: 2, unowned: 3, combined: 5 },
    { inactive: 2, unowned: 3, combined: 4 },
    { inactive: Number.MAX_SAFE_INTEGER, unowned: Number.MAX_SAFE_INTEGER, combined: Number.MAX_SAFE_INTEGER },
  ])('accepts valid distinct unions %j', counts => {
    expect(validLeadAttentionCounts(counts)).toBe(true);
  });
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid count %s in every metric', value => {
    for (const key of ['inactive', 'unowned', 'combined'] as const) {
      expect(validLeadAttentionCounts({ inactive: 1, unowned: 1, combined: 1, [key]: value })).toBe(false);
    }
  });
  it('rejects a union smaller than either count or greater than their sum', () => {
    expect(validLeadAttentionCounts({ inactive: 2, unowned: 1, combined: 1 })).toBe(false);
    expect(validLeadAttentionCounts({ inactive: 1, unowned: 2, combined: 1 })).toBe(false);
    expect(validLeadAttentionCounts({ inactive: 1, unowned: 1, combined: 3 })).toBe(false);
  });
});

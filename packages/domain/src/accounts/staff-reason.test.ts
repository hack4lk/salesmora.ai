import { describe, expect, it } from 'vitest';
import { normalizeStaffReason, staffReasonMaxLength } from './staff-reason';

describe('normalizeStaffReason', () => {
  it('trims and requires a reason', () => {
    expect(normalizeStaffReason('  Customer request  ')).toBe('Customer request');
    expect(() => normalizeStaffReason('   ')).toThrow(RangeError);
    expect(() => normalizeStaffReason(undefined)).toThrow(RangeError);
  });

  it('limits the length', () => {
    expect(normalizeStaffReason('x'.repeat(staffReasonMaxLength))).toHaveLength(staffReasonMaxLength);
    expect(() => normalizeStaffReason('x'.repeat(staffReasonMaxLength + 1))).toThrow(RangeError);
  });
});

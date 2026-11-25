import { describe, expect, it } from 'vitest';
import { normalizeJobZip, parseWorkZipCodes } from './postal-code';

describe('US work coverage normalization', () => {
  it('preserves leading zeros and matches ZIP+4 to the base ZIP', () => {
    expect(normalizeJobZip(' 00501-1234 ')).toBe('00501');
    expect(parseWorkZipCodes('00501,00501-1234;10001\n10002')).toEqual({ codes: ['00501', '10001', '10002'], invalid: [] });
  });
  it.each(['', '501', '10001 Main St', '100011234', '10001-', 'K1A 0B1', '1000*'])('does not guess US coverage from %j', value => {
    expect(normalizeJobZip(value)).toBeNull();
  });
  it('reports invalid entries without dropping the valid entries or treating an empty list as all ZIPs', () => {
    expect(parseWorkZipCodes('10001, Manhattan')).toEqual({ codes: ['10001'], invalid: ['Manhattan'] });
    expect(parseWorkZipCodes(' \n, ')).toEqual({ codes: [], invalid: [] });
  });
});

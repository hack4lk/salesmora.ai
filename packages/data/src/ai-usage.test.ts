import { describe, expect, it } from 'vitest';
import { defaultMonthlyAITokens } from './ai-usage';
describe('AI allowance configuration', () => {
  it('accepts zero to stop new calls and a configurable integer allowance', () => {
    expect(defaultMonthlyAITokens('0')).toBe(0);
    expect(defaultMonthlyAITokens('5000000')).toBe(5_000_000);
  });
  it('rejects malformed and unsafe allowances rather than disabling enforcement', () => {
    for (const value of ['', '-1', 'NaN', 'Infinity', '5e6', ' 5000000', '1.5', '1000000000001']) expect(() => defaultMonthlyAITokens(value)).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { recordedMaterialLineCostCents } from './material-cost';

describe('recorded material exact cost', () => {
  it('rounds each line half up, including zero costs and fractional quantities', () => {
    expect(recordedMaterialLineCostCents('0.005', 100)).toBe(1);
    expect(recordedMaterialLineCostCents('0.004', 100)).toBe(0);
    expect(recordedMaterialLineCostCents('1.125', 100)).toBe(113);
    expect(recordedMaterialLineCostCents('999999.999', 2_147_483_647)).toBe(2_147_483_644_852_516);
    expect(recordedMaterialLineCostCents('1.000', 0)).toBe(0);
    expect(recordedMaterialLineCostCents('1', null)).toBeNull();
  });
  it('rejects malformed quantities, unsupported precision and invalid cost integers', () => {
    for (const quantity of ['0', '-1', '1e3', 'NaN', '1.0001', '1000000', '']) {
      expect(recordedMaterialLineCostCents(quantity, 1)).toBeUndefined();
      expect(recordedMaterialLineCostCents(quantity, null)).toBeUndefined();
    }
    for (const cost of [-1, 1.5, NaN, Infinity, 2_147_483_648]) {
      expect(recordedMaterialLineCostCents('1', cost)).toBeUndefined();
    }
  });
});

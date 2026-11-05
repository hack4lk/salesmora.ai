import { describe, expect, it } from 'vitest';
import { validCaptureSourceConfiguration as valid } from './capture-source-details.validation';
const source = { id: 'source', name: 'Website', type: 'website' as const, status: 'active' as const };
const configuration = { kind: 'approved' as const, version: 2, rows: [{ label: 'Destination', value: 'SalesMora' }] };
describe('source details configuration boundary', () => {
  it('separates the approved version from a newer draft revision', () => {
    expect(valid(source, configuration)).toBe(true); expect(valid(source, configuration, 3)).toBe(true);
    for (const version of [0, 1, 2, NaN, 2.5]) expect(valid(source, configuration, version)).toBe(false);
  });
  it('never labels a draft configuration as approved', () => {
    expect(valid(source, { ...configuration, kind: 'draft' })).toBe(false);
    expect(valid({ ...source, status: 'draft' }, configuration)).toBe(false);
    expect(valid({ ...source, status: 'draft' }, { ...configuration, kind: 'draft' })).toBe(true);
    expect(valid({ ...source, status: 'draft' }, { ...configuration, kind: 'draft' }, 3)).toBe(false);
  });
  it('rejects missing and incomplete configuration', () => {
    expect(valid(source, undefined)).toBe(false); expect(valid(source, { ...configuration, version: 0 })).toBe(false);
    expect(valid(source, { ...configuration, rows: [] })).toBe(false); expect(valid(source, { ...configuration, rows: [{ label: ' ', value: 'value' }] })).toBe(false);
    expect(valid({ ...source, id: '' }, configuration)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { leadAgeBand } from './lead-pipeline-report.validation';

describe('leadAgeBand', () => {
  it.each([
    [0, '0-7'], [7, '0-7'], [8, '8-14'], [14, '8-14'],
    [15, '15-30'], [30, '15-30'], [31, '31+'], [Number.MAX_SAFE_INTEGER, '31+'],
  ])('maps %s business-local days to %s', (age, band) => {
    expect(leadAgeBand(Number(age))).toBe(band);
  });
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid or future-created age %s', age => {
    expect(leadAgeBand(age)).toBeUndefined();
  });
});

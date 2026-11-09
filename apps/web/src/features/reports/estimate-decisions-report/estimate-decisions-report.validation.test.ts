import { describe, expect, it } from 'vitest';
import { estimateDecisionFamilies, estimateDecisionsResponse, invalidSnapshotFamilies, revisedWithoutDecisionFamilies } from './estimate-decisions-report.fixtures';
import { formatEstimateAcceptance, validEstimateDecisionsResult } from './estimate-decisions-report.validation';

describe('effective estimate decision reporting', () => {
  it('counts one effective issued decision per family and frozen discounted values', () => {
    const result = estimateDecisionsResponse();
    expect(validEstimateDecisionsResult(result, true)).toBe(true);
    expect(result.counts).toEqual({ accepted: 1, declined: 1 });
    expect(result.money).toEqual({ kind: 'available', preTaxCents: 9000, customerTotalCents: 9900 });
    expect(result.rows.map(row => [row.estimateNumber, row.revision, row.outcome, row.decisionVersion]))
      .toEqual([['E2', 2, 'accepted', 1], ['E3', 1, 'declined', 2]]);
    expect(formatEstimateAcceptance(1, 1)).toBe('50%');
  });
  it('keeps backdated archived corrections in the decision period, not the recording period', () => {
    const october = estimateDecisionsResponse();
    expect(october.rows[1]).toMatchObject({ decisionDate: '2026-10-13', recordedDate: '2026-11-02', archived: true });
    expect(estimateDecisionsResponse(estimateDecisionFamilies, 'decided', 1, 25, '2026-11-01', '2026-11-05').counts)
      .toEqual({ accepted: 0, declined: 0 });
  });
  it('restates the denominator when a newer issued revision has no decision', () => {
    const result = estimateDecisionsResponse(revisedWithoutDecisionFamilies);
    expect(result.counts).toEqual({ accepted: 1, declined: 0 });
    expect(formatEstimateAcceptance(1, 0)).toBe('100%');
    expect(validEstimateDecisionsResult(result, true)).toBe(true);
  });
  it('ignores an unissued draft without erasing the last issued decision', () => {
    const families = estimateDecisionFamilies.map(family => family.number === 'E2'
      ? { ...family, revisions: [...family.revisions, { ...family.revisions[1]!, revision: 3, issuedDate: undefined, decisions: [] }] } : family);
    expect(estimateDecisionsResponse(families).counts).toEqual({ accepted: 1, declined: 1 });
  });
  it('preserves counts while disclosing an invalid snapshot instead of substituting zero/current money', () => {
    const result = estimateDecisionsResponse(invalidSnapshotFamilies);
    expect(result.counts).toEqual({ accepted: 1, declined: 1 });
    expect(result.money.kind).toBe('unavailable');
    expect(validEstimateDecisionsResult(result, true)).toBe(true);
  });
  it('rejects inconsistent totals, unknown money claimed complete and unsafe integer arithmetic', () => {
    const result = estimateDecisionsResponse();
    expect(validEstimateDecisionsResult({ ...result, money: { kind: 'available', preTaxCents: 10000, customerTotalCents: 9900 } }, true)).toBe(false);
    expect(validEstimateDecisionsResult({ ...estimateDecisionsResponse(invalidSnapshotFamilies), money: result.money }, true)).toBe(false);
    expect(validEstimateDecisionsResult({ ...result, rows: result.rows.map(row => row.outcome === 'accepted'
      ? { ...row, money: { kind: 'available', preTaxCents: Number.MAX_SAFE_INTEGER, taxCents: 1, customerTotalCents: Number.MAX_SAFE_INTEGER } } : row) }, true)).toBe(false);
    expect(validEstimateDecisionsResult({ ...result, counts: { accepted: Number.MAX_SAFE_INTEGER, declined: 1 } }, true)).toBe(false);
  });
  it('allows legitimate zero accepted values and empty decided sets, but no rate with zero denominator', () => {
    const result = estimateDecisionsResponse([]);
    expect(result.money).toEqual({ kind: 'available', preTaxCents: 0, customerTotalCents: 0 });
    expect(validEstimateDecisionsResult(result, true)).toBe(true);
    expect(() => formatEstimateAcceptance(0, 0)).toThrow(RangeError);
    expect(formatEstimateAcceptance(0, 1)).toBe('0%');
    const zero = estimateDecisionsResponse(estimateDecisionFamilies.map(family => ({
      ...family, revisions: family.revisions.map(revision => ({ ...revision, subtotalCents: 0, discountCents: 0, taxCents: 0, customerTotalCents: 0 })),
    })));
    expect(zero.counts.accepted).toBe(1);
    expect(zero.money).toEqual({ kind: 'available', preTaxCents: 0, customerTotalCents: 0 });
    expect(validEstimateDecisionsResult(zero, true)).toBe(true);
  });
  it('rejects duplicate families, mismatched outcomes/dates, pagination and impossible observed counts', () => {
    const result = estimateDecisionsResponse();
    const invalid = [
      { ...result, rows: [result.rows[0]!, result.rows[0]!] },
      { ...result, rows: result.rows.map(row => ({ ...row, decisionDate: '2026-11-01' })) },
      { ...result, from: '2026-10-31', to: '2026-10-01' },
      { ...result, rows: result.rows.map(row => ({ ...row, revision: 0 })) },
      { ...result, page: 2 },
      { ...result, counts: { accepted: 2, declined: 0 } },
    ];
    for (const projection of invalid) expect(validEstimateDecisionsResult(projection, true)).toBe(false);
  });
  it('validates each selected projection/page without requiring unseen financial details', () => {
    for (const selected of ['accepted', 'declined', 'decided'] as const) {
      expect(validEstimateDecisionsResult(estimateDecisionsResponse(estimateDecisionFamilies, selected), true)).toBe(true);
    }
    for (const page of [1, 2]) expect(validEstimateDecisionsResult(estimateDecisionsResponse(estimateDecisionFamilies, 'decided', page, 1), true)).toBe(true);
    const result = estimateDecisionsResponse();
    expect(validEstimateDecisionsResult({ ...result, money: { kind: 'unavailable', explanation: '' } }, false)).toBe(true);
    expect(validEstimateDecisionsResult({ ...result, money: { kind: 'unavailable', explanation: '' } }, true)).toBe(false);
  });
});

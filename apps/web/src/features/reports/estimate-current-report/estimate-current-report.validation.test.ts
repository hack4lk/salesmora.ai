import { describe, expect, it } from 'vitest';
import { completionElapsedDays } from '../job-completion-report/job-completion-report.validation';
import { estimateCurrentFamilies, estimateCurrentResponse, unavailableHandoffFamilies, invalidCurrentSnapshotFamilies } from './estimate-current-report.fixtures';
import { validEstimateCurrentResult } from './estimate-current-report.validation';

describe('current issued Estimates and proven handoff', () => {
  it('keeps E1 issued quote despite newer draft and reconciles E01 count/value', () => {
    const result = estimateCurrentResponse(estimateCurrentFamilies.filter(family => ['E1', 'E4'].includes(family.number)));
    expect(result.counts).toEqual({ awaiting: 2, expired: 0 });
    expect(result.awaitingMoney).toEqual({ kind: 'available', preTaxCents: 25000, customerTotalCents: 27500 });
    expect(result.rows[0]).toMatchObject({ estimateNumber: 'E1', revision: 1, issuedDate: '2026-09-25' });
    expect(completionElapsedDays(result.rows[0]!.issuedDate, result.today)).toBe(41);
    expect(validEstimateCurrentResult(result, true, true)).toBe(true);
  });
  it('uses strict local expiry boundary, accepts missing expiry and ignores drafts/archives/void', () => {
    const result = estimateCurrentResponse();
    expect(result.counts).toEqual({ awaiting: 4, expired: 1 });
    expect(result.rows.map(row => row.estimateNumber)).toEqual(['E1', 'E4', 'TODAY', 'NO-EXPIRY']);
    const expired = estimateCurrentResponse(estimateCurrentFamilies, 'expired');
    expect(expired.rows.map(row => row.estimateNumber)).toEqual(['YESTERDAY']);
    expect(validEstimateCurrentResult(expired, true, true)).toBe(true);
  });
  it('counts only accepted active lead-parent quotes with proven no existing Job', () => {
    const result = estimateCurrentResponse(estimateCurrentFamilies, 'handoff');
    expect(result.handoff).toMatchObject({ kind: 'available', count: 1 });
    expect(result.rows.map(row => row.estimateNumber)).toEqual(['HANDOFF']);
    expect(validEstimateCurrentResult(result, true, true)).toBe(true);
  });
  it('makes incomplete handoff unavailable and does not infer zero or expose its rows', () => {
    const result = estimateCurrentResponse(unavailableHandoffFamilies, 'handoff');
    expect(result.handoff.kind).toBe('unavailable');
    expect(result.rows).toEqual([]);
    expect(validEstimateCurrentResult(result, true, true)).toBe(true);
    expect(validEstimateCurrentResult({ ...result, handoff: { kind: 'unavailable', explanation: '' } }, true, true)).toBe(false);
  });
  it('preserves count with invalid snapshot but rejects claiming unknown value as complete', () => {
    const result = estimateCurrentResponse(invalidCurrentSnapshotFamilies);
    expect(result.counts.awaiting).toBe(4);
    expect(result.awaitingMoney.kind).toBe('unavailable');
    expect(validEstimateCurrentResult(result, true, true)).toBe(true);
    expect(validEstimateCurrentResult({ ...result, awaitingMoney: estimateCurrentResponse().awaitingMoney }, true, true)).toBe(false);
  });
  it('rejects duplicate/wrong-state/expired/archived evidence, future issuance and invalid pagination', () => {
    const result = estimateCurrentResponse();
    const invalid = [
      { ...result, rows: [result.rows[0]!, result.rows[0]!, ...result.rows.slice(2)] },
      { ...result, rows: result.rows.map(row => ({ ...row, archived: true })) },
      { ...result, rows: result.rows.map(row => ({ ...row, issuedDate: '2026-11-06' })) },
      { ...result, rows: result.rows.map(row => ({ ...row, validUntil: '2026-11-04' })) },
      { ...result, page: 2 }, { ...result, today: '2026-02-30' }, { ...result, counts: { awaiting: -1, expired: 1 } },
    ];
    for (const projection of invalid) expect(validEstimateCurrentResult(projection, true, true)).toBe(false);
    expect(validEstimateCurrentResult({ ...result, selected: 'handoff' }, true, true)).toBe(false);
  });
  it('rejects inconsistent frozen totals but omits revoked money/handoff validation', () => {
    const result = estimateCurrentResponse();
    const invalidMoney = { ...result, awaitingMoney: { kind: 'available' as const, preTaxCents: 1, customerTotalCents: 1 } };
    expect(validEstimateCurrentResult(invalidMoney, true, true)).toBe(false);
    expect(validEstimateCurrentResult(invalidMoney, false, true)).toBe(true);
    const handoff = estimateCurrentResponse(estimateCurrentFamilies, 'handoff');
    expect(validEstimateCurrentResult({ ...handoff, rows: result.rows, page: -1 }, false, false)).toBe(true);
  });
  it('accepts empty current results and each authorized paginated projection', () => {
    expect(validEstimateCurrentResult(estimateCurrentResponse([]), true, true)).toBe(true);
    for (const page of [1, 2, 3, 4]) {
      expect(validEstimateCurrentResult(estimateCurrentResponse(estimateCurrentFamilies, 'awaiting', page, 1), true, true)).toBe(true);
    }
  });
  it('does not count new declined/void issued revisions or reset age on resends', () => {
    const families = estimateCurrentFamilies.map(family => family.number === 'E1' ? { ...family,
      revisions: [...family.revisions, { ...family.revisions[0]!, revision: 3, issuedDate: '2026-11-01', status: 'declined' as const }] } : family);
    expect(estimateCurrentResponse(families).counts.awaiting).toBe(3);
    expect(completionElapsedDays('2026-10-31', '2026-11-02')).toBe(2);
  });
});

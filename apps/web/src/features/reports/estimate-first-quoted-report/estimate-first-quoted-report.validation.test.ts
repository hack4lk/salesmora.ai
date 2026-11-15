import { describe, expect, it } from 'vitest';
import { estimateIssuanceFamilies, estimateFirstQuotedResponse } from './estimate-first-quoted-report.fixtures';
import { validEstimateFirstQuotedResult } from './estimate-first-quoted-report.validation';

describe('first-quoted family reporting', () => {
  it('matches E04: four families once, excluding E1 resend and unissued draft', () => {
    const result = estimateFirstQuotedResponse();
    expect(result.total).toBe(4);
    expect(result.rows.map(row => [row.estimateNumber, row.firstIssuedDate]))
      .toEqual([['E2', '2026-10-02'], ['E3', '2026-10-05'], ['E4', '2026-10-03'], ['E5', '2026-10-04']]);
    expect(validEstimateFirstQuotedResult(result)).toBe(true);
    const september = estimateFirstQuotedResponse(estimateIssuanceFamilies, 1, 25, '2026-09-01', '2026-09-30');
    expect(september.total).toBe(1);
    expect(september.rows[0]).toMatchObject({ estimateNumber: 'E1', currentIssuedRevision: 1 });
  });
  it('retains original superseded issuance, archived decisions and later void', () => {
    const result = estimateFirstQuotedResponse();
    expect(result.rows[0]).toMatchObject({ firstIssuedRevision: 1, currentIssuedRevision: 2, currentIssuedDate: '2026-10-20' });
    expect(result.rows[1]).toMatchObject({ archived: true, currentStatus: 'declined' });
    expect(result.rows[3]).toMatchObject({ currentStatus: 'void', firstIssuedDate: '2026-10-04' });
  });
  it('selects first issuance before filtering dates, including both boundaries', () => {
    expect(estimateFirstQuotedResponse(estimateIssuanceFamilies, 1, 25, '2026-10-02', '2026-10-05').total).toBe(4);
    expect(estimateFirstQuotedResponse(estimateIssuanceFamilies, 1, 25, '2026-10-20', '2026-10-20').total).toBe(0);
  });
  it('never guesses first issuance from resends when initial events are missing', () => {
    const families = estimateIssuanceFamilies.map(family => ({ ...family, events: family.events.filter(event => !event.initial) }));
    expect(estimateFirstQuotedResponse(families).total).toBe(0);
    const result = estimateFirstQuotedResponse();
    expect(validEstimateFirstQuotedResult({ ...result, coverage: { kind: 'partial', explanation: 'Earlier issuance events are unavailable.' } })).toBe(true);
    expect(validEstimateFirstQuotedResult({ ...result, coverage: { kind: 'partial', explanation: '' } })).toBe(false);
  });
  it('rejects duplicate family identity but allows equal display numbers in qualified identities', () => {
    const result = estimateFirstQuotedResponse();
    expect(validEstimateFirstQuotedResult({ ...result, rows: [result.rows[0]!, result.rows[0]!, ...result.rows.slice(2)] })).toBe(false);
    expect(validEstimateFirstQuotedResult({ ...result, rows: result.rows.map(row => ({ ...row, estimateNumber: 'SAME' })) })).toBe(true);
  });
  it('rejects invalid dates, reversed issuance/revisions, unsafe counts and pagination', () => {
    const result = estimateFirstQuotedResponse();
    for (const invalid of [
      { ...result, total: -1 }, { ...result, total: Number.MAX_SAFE_INTEGER + 1 }, { ...result, page: 2 },
      { ...result, to: '2026-02-30' }, { ...result, from: '2026-11-01', to: '2026-10-01' },
      { ...result, rows: result.rows.map(row => ({ ...row, firstIssuedDate: '2026-09-30' })) },
      { ...result, rows: result.rows.map(row => ({ ...row, currentIssuedDate: '2026-11-06' })) },
      { ...result, rows: result.rows.map(row => ({ ...row, firstIssuedRevision: 99 })) },
      { ...result, rows: result.rows.map(row => ({ ...row, currentIssuedDate: '2026-10-01' })) },
    ]) expect(validEstimateFirstQuotedResult(invalid)).toBe(false);
  });
  it('accepts each observed page and empty results', () => {
    for (const page of [1, 2, 3, 4]) expect(validEstimateFirstQuotedResult(estimateFirstQuotedResponse(estimateIssuanceFamilies, page, 1))).toBe(true);
    expect(validEstimateFirstQuotedResult(estimateFirstQuotedResponse([]))).toBe(true);
  });
});

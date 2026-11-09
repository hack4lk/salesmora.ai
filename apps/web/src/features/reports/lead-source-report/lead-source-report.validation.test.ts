import { describe, expect, it } from 'vitest';
import { leadSources } from '@salesmora/contracts';
import { leadSourceResponse, leadSourceCohort, relabelLeadSource } from './lead-source-report.fixtures';
import { formatLeadSourceRate, validLeadSourceResult } from './lead-source-report.validation';

describe('lead-source effectiveness', () => {
  it('matches L07: four leads reconcile across all five current source groups', () => {
    const result = leadSourceResponse();
    expect(result.cohort).toBe(4);
    expect(result.groups.map(group => [group.source, group.cohort, group.converted])).toEqual([
      ['website', 1, 1], ['referral', 1, 0], ['phone', 1, 1], ['gmail', 1, 0], ['other', 0, 0],
    ]);
    expect(result.conversion).toMatchObject({ kind: 'available', converted: 2 });
    expect(result.acceptedValue).toMatchObject({
      kind: 'available', preTaxCents: 265000, estimateCount: 4,
      unattributedPreTaxCents: 40000, unattributedCount: 1,
    });
    expect(result.groups.map(group => [group.source, group.acceptedEstimateCount, group.acceptedValueCents])).toEqual([
      ['website', 2, 150000], ['referral', 0, 0], ['phone', 1, 75000], ['gmail', 0, 0], ['other', 0, 0],
    ]);
    expect(validLeadSourceResult(result, true, true)).toBe(true);
    expect(result.groups.map(group => group.source)).toEqual([...leadSources]);
  });
  it('recomputes group membership from the current editable source label, not capture provenance', () => {
    const changed = leadSourceResponse(relabelLeadSource('L1', 'referral'));
    expect(changed.groups.map(group => [group.source, group.cohort, group.converted])).toEqual([
      ['website', 0, 0], ['referral', 2, 1], ['phone', 1, 1], ['gmail', 1, 0], ['other', 0, 0],
    ]);
    expect(changed.acceptedValue).toMatchObject({ kind: 'available', preTaxCents: 265000 });
    expect(changed.groups.find(group => group.source === 'referral')).toMatchObject({
      acceptedEstimateCount: 2, acceptedValueCents: 150000,
    });
    expect(validLeadSourceResult(changed, true, true)).toBe(true);
  });
  it('keeps cohort count while withholding conversion groups, evidence, and rates', () => {
    const result = leadSourceResponse(leadSourceCohort, { canReadConversion: false });
    expect(result.cohort).toBe(4);
    expect(result.groups.every(group => group.converted === null)).toBe(true);
    expect(validLeadSourceResult(result, false, true)).toBe(true);
    expect(validLeadSourceResult(leadSourceResponse(), false, true)).toBe(true);
    expect(validLeadSourceResult({ ...result, evidence: { kind: 'converted', rows: [] } }, false, true)).toBe(false);
    expect(validLeadSourceResult(leadSourceResponse(leadSourceCohort, { kind: 'converted' }), false, true)).toBe(false);
  });
  it('uses the creation cohort and includes both date boundaries and archived leads', () => {
    const result = leadSourceResponse();
    expect(result.groups.reduce((sum, group) => sum + group.cohort, 0)).toBe(4);
    expect(result.evidence.kind).toBe('cohort');
    expect(leadSourceResponse(leadSourceCohort, { from: '2026-10-15', to: '2026-10-20' }).cohort).toBe(2);
    expect(leadSourceResponse(leadSourceCohort, { from: '2026-10-01', to: '2026-10-01' }).cohort).toBe(1);
    expect(leadSourceResponse(leadSourceCohort, { from: '2026-10-31', to: '2026-10-31' }).cohort).toBe(1);
  });
  it('switches between cohort and converted evidence while keeping conversion distinct-lead counts', () => {
    const converted = leadSourceResponse(leadSourceCohort, { kind: 'converted' });
    expect(converted.evidence.kind).toBe('converted');
    if (converted.evidence.kind !== 'converted') throw new Error('Expected converted evidence');
    expect(converted.evidence.rows.map(row => row.id)).toEqual(['L1', 'L3']);
    expect(validLeadSourceResult(converted, true, true)).toBe(true);
    const convertedRows = converted.evidence.rows;
    const multipleJobs = { ...converted, evidence: { kind: 'converted' as const,
      rows: convertedRows.map(row => ({ ...row, linkedJobs: 'J-001 / canceled; J-004 / active' })) } };
    expect(validLeadSourceResult(multipleJobs, true, true)).toBe(true);
  });
  it('handles empty, zero-conversion, and zero-denominator source rates explicitly', () => {
    const empty = leadSourceResponse([]);
    expect(empty.groups.every(group => group.cohort === 0 && group.converted === 0)).toBe(true);
    expect(validLeadSourceResult(empty, true, true)).toBe(true);
    expect(formatLeadSourceRate(4, 0)).toBe('0%');
    expect(formatLeadSourceRate(4, 4)).toBe('100%');
    expect(formatLeadSourceRate(3, 1)).toBe('33.3%');
    expect(() => formatLeadSourceRate(0, 0)).toThrow(RangeError);
  });
  it('validates independently paged cohort and converted evidence', () => {
    for (const kind of ['cohort', 'converted', 'accepted-estimates'] as const) {
      const total = kind === 'cohort' ? 4 : kind === 'converted' ? 2 : 4;
      for (let page = 1; page <= total; page++)
        expect(validLeadSourceResult(leadSourceResponse(leadSourceCohort, { kind, page, pageSize: 1 }), true, true)).toBe(true);
    }
    expect(validLeadSourceResult(leadSourceResponse([], { page: 1 }), true, true)).toBe(true);
  });
  it('rejects invalid totals, missing/duplicate source groups and inconsistent conversion values', () => {
    const result = leadSourceResponse();
    for (const invalid of [
      { ...result, cohort: -1 }, { ...result, cohort: Number.MAX_SAFE_INTEGER + 1 },
      { ...result, groups: result.groups.slice(1) },
      { ...result, groups: [...result.groups, result.groups[0]!] },
      { ...result, groups: result.groups.map((group, index) => index ? group : { ...group, cohort: 2 }) },
      { ...result, groups: result.groups.map((group, index) => index ? group : { ...group, converted: 2 }) },
      { ...result, conversion: { kind: 'available' as const, converted: 3 } },
      { ...result, page: 2 }, { ...result, pageSize: 0 },
      { ...result, from: '2026-02-30' }, { ...result, from: '2026-11-07', to: '2026-11-08' },
    ]) expect(validLeadSourceResult(invalid, true, true)).toBe(false);
  });
  it('rejects duplicate or invalid cohort identities, dates, source labels and conversion evidence', () => {
    const result = leadSourceResponse();
    if (result.evidence.kind !== 'cohort') throw new Error('Expected cohort evidence');
    const rows = result.evidence.rows, first = rows[0]!;
    for (const row of [
      { ...first, createdDate: '2026-09-30' }, { ...first, createdDate: '2026-02-30' },
      { ...first, source: 'capture-origin' as never }, { ...first, id: ' ' }, { ...first, recordId: ' ' },
    ]) expect(validLeadSourceResult({ ...result, evidence: { kind: 'cohort', rows: [row, ...rows.slice(1)] } }, true, true)).toBe(false);
    expect(validLeadSourceResult({ ...result, evidence: { kind: 'cohort', rows: [first, first, ...rows.slice(2)] } }, true, true)).toBe(false);
    const converted = leadSourceResponse(leadSourceCohort, { kind: 'converted' });
    if (converted.evidence.kind !== 'converted') throw new Error('Expected conversion evidence');
    expect(validLeadSourceResult({ ...converted, evidence: { kind: 'converted',
      rows: converted.evidence.rows.map(row => ({ ...row, linkedJobs: '' })) } }, true, true)).toBe(false);
  });
  it('keeps cohort-reachable ambiguous families once in the unattributed bucket', () => {
    const result = leadSourceResponse(leadSourceCohort, { kind: 'accepted-estimates' });
    expect(result.evidence.kind).toBe('accepted-estimates');
    if (result.evidence.kind !== 'accepted-estimates') throw new Error('Expected estimate evidence');
    const ambiguous = result.evidence.rows.find(row => row.familyId === 'EF-003')!;
    expect(ambiguous).toMatchObject({ source: null, preTaxCents: 40000 });
    expect(ambiguous).not.toHaveProperty('linkedLead');
    expect(validLeadSourceResult(result, true, true)).toBe(true);
  });
  it('includes only estimate families reachable from the selected creation cohort', () => {
    const result = leadSourceResponse(leadSourceCohort, { from: '2026-10-01', to: '2026-10-01' });
    expect(result.acceptedValue).toMatchObject({ kind: 'available', preTaxCents: 150000, estimateCount: 2 });
    expect(result.groups.find(group => group.source === 'website')).toMatchObject({
      acceptedEstimateCount: 2, acceptedValueCents: 150000,
    });
    expect(validLeadSourceResult(result, true, true)).toBe(true);
  });
  it('withholds all accepted value and evidence when money access is revoked', () => {
    const stale = leadSourceResponse();
    expect(validLeadSourceResult(stale, true, false)).toBe(true);
    expect(validLeadSourceResult(leadSourceResponse(leadSourceCohort, {
      canReadAcceptedValue: false,
    }), true, false)).toBe(true);
    const estimateResult = leadSourceResponse(leadSourceCohort, { kind: 'accepted-estimates' });
    if (estimateResult.evidence.kind !== 'accepted-estimates') throw new Error('Expected estimate evidence');
    const staleEvidence = { ...stale, evidence: { kind: 'accepted-estimates' as const, rows: estimateResult.evidence.rows } };
    expect(validLeadSourceResult(staleEvidence, true, false)).toBe(false);
  });
  it('rejects inconsistent value totals, duplicate family evidence and invalid accepted rows', () => {
    const result = leadSourceResponse(leadSourceCohort, { kind: 'accepted-estimates' });
    if (result.evidence.kind !== 'accepted-estimates') throw new Error('Expected estimate evidence');
    const first = result.evidence.rows[0]!;
    for (const invalid of [
      { ...result, acceptedValue: { ...result.acceptedValue, preTaxCents: 1 } },
      { ...result, groups: result.groups.map((group, index) => index
        ? group : { ...group, acceptedValueCents: 1 }) },
      { ...result, evidence: { kind: 'accepted-estimates' as const, rows: [first, first, ...result.evidence.rows.slice(2)] } },
      { ...result, evidence: { kind: 'accepted-estimates' as const, rows: result.evidence.rows.map((row, index) => index
        ? row : { ...row, preTaxCents: -1 }) } },
      { ...result, evidence: { kind: 'accepted-estimates' as const, rows: result.evidence.rows.map((row, index) => index
        ? row : { ...row, acceptedDate: '2026-11-07' }) } },
    ]) expect(validLeadSourceResult(invalid, true, true)).toBe(false);
  });
});

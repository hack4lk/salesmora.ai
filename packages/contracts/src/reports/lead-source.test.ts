import { describe, expect, it } from 'vitest';
import { leadSources } from '../lead-read';
import { leadSourceQuerySchema, leadSourceResultSchema } from './lead-source';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const rows = leadSources.map((source, index) => ({
  id: uuid(index + 10), recordId: uuid(index + 10), label: 'Lead', createdDate: '2026-11-01', source, archived: source === 'phone',
}));
const result = {
  workspaceId: uuid(1), view: 'lead-source', from: '2026-11-01', to: '2026-11-02', today: '2026-11-07',
  asOf: '2026-11-07T16:00:00Z', timezone: 'America/New_York', scopeLabel: 'Current recorded source.',
  scope: 'workspace', archiveVisibility: 'included', cohort: 5, conversion: { kind: 'available', converted: 2 },
  acceptedValue: { kind: 'unavailable', reason: 'implementation-pending', explanation: 'Separate slice pending.' },
  groups: leadSources.map(source => ({
    source, cohort: 1, converted: ['website', 'phone'].includes(source) ? 1 : 0,
    acceptedEstimateCount: null, acceptedValueCents: null,
  })),
  evidence: { kind: 'cohort', rows }, evidenceTotal: 5, page: 1, pageSize: 25,
};
const acceptedRows = [
  { familyId: `${uuid(1)}:EST-0001`, recordId: uuid(40), estimateNumber: 'EST-0001', revision: 1, decisionVersion: 3,
    label: 'Frozen quote', acceptedDate: '2026-11-04', preTaxCents: 9000, source: 'website',
    linkedLead: { recordId: uuid(10), label: 'Lead' } },
  { familyId: `${uuid(1)}:EST-0002`, recordId: uuid(41), estimateNumber: 'EST-0002', revision: 2, decisionVersion: 3,
    label: 'Ambiguous quote', acceptedDate: '2026-11-05', preTaxCents: 9000, source: null },
];
const acceptedResult = {
  ...result, acceptedValue: { kind: 'available', preTaxCents: 18000, estimateCount: 2,
    unattributedPreTaxCents: 9000, unattributedCount: 1 },
  groups: result.groups.map(group => ({ ...group, acceptedEstimateCount: group.source === 'website' ? 1 : 0,
    acceptedValueCents: group.source === 'website' ? 9000 : 0 })),
  evidence: { kind: 'accepted-estimates', rows: acceptedRows }, evidenceTotal: 2,
};
describe('Lead-source cohort contracts', () => {
  it('allows only bounded creation periods and supported evidence with server-owned scopes and clock', () => {
    const query = { workspaceId: uuid(1), view: 'lead-source', period: { from: '2026-11-01', to: '2026-11-02' }, selected: 'cohort' };
    expect(leadSourceQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [
      { today: '2026-11-07' }, { scope: 'workspace' }, { selected: 'unknown' }, { pageSize: 10 },
      { period: { from: '2026-11-02', to: '2026-11-01' } }, { period: { from: '2025-01-01', to: '2026-01-02' } },
      { period: { from: '2026-02-30', to: '2026-03-01' } },
    ]) expect(leadSourceQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    expect(leadSourceQuerySchema.safeParse({ ...query, selected: 'accepted-estimates' }).success).toBe(true);
  });
  it('reconciles every broad source including zero groups and archived cohort evidence', () => {
    expect(leadSourceResultSchema.safeParse(result).success).toBe(true);
    const converted = { ...result, evidence: { kind: 'converted', rows: [rows[0], rows[2]].map(row => ({ ...row, linkedJobs: 'J-0001' })) }, evidenceTotal: 2 };
    expect(leadSourceResultSchema.safeParse(converted).success).toBe(true);
    for (const patch of [
      { groups: result.groups.slice(1) }, { groups: [result.groups[0], ...result.groups.slice(0, 4)] },
      { cohort: 6 }, { conversion: { kind: 'available', converted: 1 } }, { evidenceTotal: 4 }, { page: 2 },
    ]) expect(leadSourceResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('withholds numeric conversion and converted evidence when supporting authority is incomplete', () => {
    const unavailable = { ...result, conversion: { kind: 'unavailable', explanation: 'No complete authority.' },
      groups: result.groups.map(group => ({ ...group, converted: null })) };
    expect(leadSourceResultSchema.safeParse(unavailable).success).toBe(true);
    expect(leadSourceResultSchema.safeParse({ ...unavailable, groups: result.groups }).success).toBe(false);
    expect(leadSourceResultSchema.safeParse({ ...unavailable, evidence: { kind: 'converted', rows: [] }, evidenceTotal: 0 }).success).toBe(false);
    expect(leadSourceResultSchema.safeParse({ ...result, scope: 'assigned' }).success).toBe(false);
    expect(leadSourceResultSchema.safeParse({ ...result, archiveVisibility: 'excluded' }).success).toBe(false);
  });
  it('rejects duplicate, out-of-period or stale-group evidence and unavailable money disguised as zero', () => {
    for (const patch of [
      { evidence: { kind: 'cohort', rows: [rows[0], rows[0], ...rows.slice(2)] } },
      { evidence: { kind: 'cohort', rows: rows.map(row => ({ ...row, createdDate: '2026-10-31' })) } },
      { evidence: { kind: 'cohort', rows: rows.map(row => ({ ...row, source: 'website' })) } },
      { evidence: { kind: 'cohort', rows: rows.map(row => ({ ...row, recordId: uuid(99) })) } },
      { acceptedValue: { kind: 'unavailable', reason: 'implementation-pending', explanation: 'Pending', preTaxCents: 0 } },
      { groups: result.groups.map(group => ({ ...group, acceptedValueCents: 0 })) },
      { today: '2026-10-31' },
    ]) expect(leadSourceResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('represents empty cohorts with explicit five-source zeros and no percentage denominator', () => {
    expect(leadSourceResultSchema.safeParse({
      ...result, cohort: 0, conversion: { kind: 'available', converted: 0 }, evidenceTotal: 0,
      groups: result.groups.map(group => ({ ...group, cohort: 0, converted: 0 })), evidence: { kind: 'cohort', rows: [] },
    }).success).toBe(true);
  });
  it('reconciles partial evidence against the selected source totals and final-page row count', () => {
    const partial = { ...result, cohort: 26, groups: result.groups.map(group => ({ ...group,
      cohort: group.source === 'website' ? 22 : 1,
    })), evidenceTotal: 26, page: 2, evidence: { kind: 'cohort', rows: [rows[0]] } };
    expect(leadSourceResultSchema.safeParse(partial).success).toBe(true);
    expect(leadSourceResultSchema.safeParse({ ...partial, evidence: { kind: 'cohort', rows: [] } }).success).toBe(false);
  });
  it('reconciles frozen accepted-family value including unattributed families and acceptance after the creation period', () => {
    expect(leadSourceResultSchema.safeParse(acceptedResult).success).toBe(true);
    expect(leadSourceResultSchema.safeParse({ ...acceptedResult, evidence: result.evidence, evidenceTotal: 5 }).success).toBe(true);
    for (const acceptedValue of [
      { ...acceptedResult.acceptedValue, preTaxCents: 18001 },
      { ...acceptedResult.acceptedValue, estimateCount: 3 },
      { ...acceptedResult.acceptedValue, unattributedPreTaxCents: 0 },
    ]) expect(leadSourceResultSchema.safeParse({ ...acceptedResult, acceptedValue }).success).toBe(false);
  });
  it('rejects duplicate family identity, invented attribution, future decisions and unverified monetary evidence', () => {
    for (const evidenceRows of [
      [acceptedRows[0], acceptedRows[0]],
      [acceptedRows[0], { ...acceptedRows[1], familyId: 'wrong-family' }],
      [{ ...acceptedRows[0], linkedLead: undefined }, acceptedRows[1]],
      [acceptedRows[0], { ...acceptedRows[1], linkedLead: { recordId: uuid(20), label: 'Guess' } }],
      [{ ...acceptedRows[0], acceptedDate: '2026-11-08' }, acceptedRows[1]],
      [{ ...acceptedRows[0], preTaxCents: 9001 }, acceptedRows[1]],
    ]) expect(leadSourceResultSchema.safeParse({ ...acceptedResult, evidence: { kind: 'accepted-estimates', rows: evidenceRows } }).success).toBe(false);
    expect(leadSourceResultSchema.safeParse({ ...acceptedResult, acceptedValue: result.acceptedValue }).success).toBe(false);
  });
  it('never presents redacted or invalid money as zero and rejects value on zero-family groups', () => {
    for (const reason of ['permissions', 'invalid-money']) {
      const unavailable = { ...result, acceptedValue: { kind: 'unavailable', reason, explanation: 'Unavailable.' } };
      expect(leadSourceResultSchema.safeParse(unavailable).success).toBe(true);
      expect(leadSourceResultSchema.safeParse({ ...unavailable, groups: acceptedResult.groups }).success).toBe(false);
    }
    expect(leadSourceResultSchema.safeParse({ ...acceptedResult,
      groups: acceptedResult.groups.map(group => ({ ...group, acceptedEstimateCount: group.source === 'website' ? 0 : group.source === 'phone' ? 1 : 0 })),
    }).success).toBe(false);
  });
  it('reconciles partial accepted evidence counts and monetary bounds without requiring full totals on each page', () => {
    const partial = { ...acceptedResult,
      acceptedValue: { kind: 'available', preTaxCents: 234000, estimateCount: 26, unattributedPreTaxCents: 9000, unattributedCount: 1 },
      groups: acceptedResult.groups.map(group => ({ ...group, acceptedEstimateCount: group.source === 'website' ? 25 : 0,
        acceptedValueCents: group.source === 'website' ? 225000 : 0 })),
      evidenceTotal: 26, page: 2, evidence: { kind: 'accepted-estimates', rows: [acceptedRows[1]] },
    };
    expect(leadSourceResultSchema.safeParse(partial).success).toBe(true);
    expect(leadSourceResultSchema.safeParse({ ...partial, evidence: { kind: 'accepted-estimates', rows: [] } }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { estimateDecisionsQuerySchema, estimateDecisionsResultSchema } from './estimate-decisions';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const result = {
  workspaceId, view: 'estimate-decisions', asOf: '2026-11-07T17:00:00.000Z',
  from: '2026-10-01', to: '2026-10-31', timezone: 'America/New_York',
  scope: 'workspace', scopeLabel: 'Authorized quotes.', archiveVisibility: 'included',
  counts: { accepted: 1, declined: 0 },
  filters: { owners: [], parents: [] },
  money: { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 },
  selected: 'decided', page: 1, pageSize: 25, evidenceTotal: 1,
  rows: [{
    ownerKey: 'unassigned', parentType: 'job',
    familyId: `${workspaceId}:EST-0001`, recordId: '00000000-0000-4000-8000-000000000002',
    estimateNumber: 'EST-0001', revision: 2, decisionVersion: 4, label: 'Quote',
    outcome: 'accepted', decisionDate: '2026-10-15', recordedDate: '2026-11-01', archived: true,
    money: { kind: 'available', preTaxCents: 9000, taxCents: 720, customerTotalCents: 9720 },
  }],
} as const;

describe('Estimate decision report contracts', () => {
  it('bounds periods and evidence pages and rejects unknown input', () => {
    const query = { workspaceId, view: result.view, period: { from: result.from, to: result.to }, selected: 'decided' };
    expect(estimateDecisionsQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [
      { period: { from: '2025-01-01', to: '2026-01-02' } }, { period: { from: result.to, to: result.from } },
      { pageSize: 26 }, { selected: 'sent' }, { moneyAccess: true },
    ]) expect(estimateDecisionsQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });

  it('preserves archived corrected outcomes by business decision date', () => {
    expect(estimateDecisionsResultSchema.safeParse(result).success).toBe(true);
    expect(estimateDecisionsResultSchema.safeParse({ ...result, archiveVisibility: 'excluded' }).success).toBe(false);
    expect(estimateDecisionsResultSchema.safeParse({
      ...result, rows: [{ ...result.rows[0], decisionDate: '2026-11-01' }],
    }).success).toBe(false);
  });

  it('keeps counts when frozen values are explicitly unavailable', () => {
    const unavailable = { kind: 'unavailable', explanation: 'Snapshot validation failed.' };
    expect(estimateDecisionsResultSchema.safeParse({
      ...result, money: unavailable, rows: [{ ...result.rows[0], money: unavailable }],
    }).success).toBe(true);
    expect(estimateDecisionsResultSchema.safeParse({
      ...result, rows: [{ ...result.rows[0], money: unavailable }],
    }).success).toBe(false);
  });

  it('rejects mismatched money, identities, outcomes and stale or duplicate evidence', () => {
    for (const patch of [
      { filters: { owners: ['member:a'], parents: [] } },
      { filters: { owners: [], parents: ['lead'] } },
      { filters: undefined },
      { money: { ...result.money, preTaxCents: 8999 } }, { page: 2 }, { evidenceTotal: 2 },
      { selected: 'declined' }, { rows: [result.rows[0], result.rows[0]] },
      { rows: [{ ...result.rows[0], familyId: 'foreign:EST-0001' }] },
      { rows: [{ ...result.rows[0], money: { ...result.rows[0].money, taxCents: 0 } }] },
    ]) expect(estimateDecisionsResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });

  it('represents an empty denominator and zero accepted commitments truthfully', () => {
    expect(estimateDecisionsResultSchema.safeParse({
      ...result, counts: { accepted: 0, declined: 0 }, evidenceTotal: 0, rows: [],
      money: { kind: 'available', preTaxCents: 0, customerTotalCents: 0 },
    }).success).toBe(true);
  });
});

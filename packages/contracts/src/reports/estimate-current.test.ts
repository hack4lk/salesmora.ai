import { describe, expect, it } from 'vitest';
import { estimateCurrentQuerySchema, estimateCurrentResultSchema } from './estimate-current';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const row = {
  ownerKey: 'unassigned', parentType: 'job',
  familyId: `${workspaceId}:EST-0001`, recordId: '00000000-0000-4000-8000-000000000002',
  estimateNumber: 'EST-0001', revision: 1, label: 'Quote', status: 'published',
  issuedDate: '2026-10-01', validUntil: '2026-11-07', archived: false,
  money: { kind: 'available', preTaxCents: 9000, taxCents: 720, customerTotalCents: 9720 },
} as const;
const result = {
  workspaceId, view: 'estimate-current', today: '2026-11-07', asOf: '2026-11-07T18:00:00.000Z',
  timezone: 'America/New_York', scope: 'workspace', scopeLabel: 'Current authorized Estimates.',
  counts: { awaiting: 1, expired: 0 }, awaitingMoney: { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 },
  filters: { owners: [], parents: [] },
  handoff: { kind: 'available', count: 0 }, selected: 'awaiting', page: 1, pageSize: 25, evidenceTotal: 1, rows: [row],
} as const;

describe('Current Estimate report contracts', () => {
  it('accepts current bounded queries without period controls or client access flags', () => {
    const query = { workspaceId, view: result.view, selected: result.selected };
    expect(estimateCurrentQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [{ pageSize: 26 }, { selected: 'accepted' }, { period: {} }, { canHandoff: true }]) {
      expect(estimateCurrentQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    }
  });
  it('keeps expiry today and missing expiry awaiting; only earlier dates expire', () => {
    expect(estimateCurrentResultSchema.safeParse(result).success).toBe(true);
    expect(estimateCurrentResultSchema.safeParse({ ...result, rows: [{ ...row, validUntil: null }] }).success).toBe(true);
    expect(estimateCurrentResultSchema.safeParse({ ...result, rows: [{ ...row, validUntil: '2026-11-06' }] }).success).toBe(false);
    expect(estimateCurrentResultSchema.safeParse({
      ...result, selected: 'expired', counts: { awaiting: 0, expired: 1 },
      awaitingMoney: { kind: 'available', preTaxCents: 0, customerTotalCents: 0 },
      rows: [{ ...row, validUntil: '2026-11-06' }],
    }).success).toBe(true);
  });
  it('requires accepted active lead-parent evidence with proven absent linkage for handoff', () => {
    const handoff = { ...result, selected: 'handoff', handoff: { kind: 'available', count: 1 },
      rows: [{ ...row, status: 'accepted', parentType: 'lead', decisionDate: '2026-10-15',
        leadArchived: false, linkage: 'confirmed-absent' }] };
    expect(estimateCurrentResultSchema.safeParse(handoff).success).toBe(true);
    for (const patch of [
      { parentType: 'job' }, { leadArchived: true }, { linkage: 'unknown' }, { decisionDate: '2026-09-30' },
    ]) expect(estimateCurrentResultSchema.safeParse({
      ...handoff, rows: [{ ...handoff.rows[0], ...patch }],
    }).success).toBe(false);
    expect(estimateCurrentResultSchema.safeParse({ ...handoff, scope: 'assigned_job' }).success).toBe(false);
  });
  it('returns explicit unavailable handoff without retaining stale selected evidence', () => {
    const denied = { ...result, scope: 'assigned_job', selected: 'handoff',
      handoff: { kind: 'unavailable', explanation: 'Complete linkage access is required.' }, evidenceTotal: 0, rows: [] };
    expect(estimateCurrentResultSchema.safeParse(denied).success).toBe(true);
    expect(estimateCurrentResultSchema.safeParse({ ...denied, rows: [row] }).success).toBe(false);
  });
  it('keeps counts when frozen money is invalid and rejects invented aggregates or stale pages', () => {
    const unavailable = { kind: 'unavailable', explanation: 'Invalid snapshot.' };
    expect(estimateCurrentResultSchema.safeParse({
      ...result, awaitingMoney: unavailable, rows: [{ ...row, money: unavailable }],
    }).success).toBe(true);
    for (const patch of [
      { filters: { owners: ['member:a'], parents: [] } },
      { filters: { owners: [], parents: ['lead'] } },
      { filters: undefined },
      { awaitingMoney: { ...result.awaitingMoney, preTaxCents: 1 } }, { rows: [row, row] }, { page: 2 },
      { rows: [{ ...row, archived: true }] }, { rows: [{ ...row, issuedDate: '2026-11-08' }] },
      { rows: [{ ...row, familyId: 'foreign:EST-0001' }] },
    ]) expect(estimateCurrentResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
  it('represents empty queues and zero frozen value without inventing a handoff', () => {
    expect(estimateCurrentResultSchema.safeParse({
      ...result, counts: { awaiting: 0, expired: 0 }, evidenceTotal: 0, rows: [],
      awaitingMoney: { kind: 'available', preTaxCents: 0, customerTotalCents: 0 },
    }).success).toBe(true);
  });
});

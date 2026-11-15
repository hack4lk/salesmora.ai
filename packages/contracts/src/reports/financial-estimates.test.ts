import { describe, expect, it } from 'vitest';
import { financialEstimatesQuerySchema, financialEstimatesResultSchema } from './financial-estimates';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const period = { from: '2026-10-01', to: '2026-10-31' };
const query = { workspaceId, view: 'financial-estimates', period, selected: 'accepted' };
const native = {
  workspaceId, view: 'estimate-decisions', asOf: '2026-11-07T18:00:00Z', from: period.from, to: period.to,
  timezone: 'America/New_York', scopeLabel: 'Authorized Estimate commitments.', scope: 'workspace',
  archiveVisibility: 'included', filters: { owners: [], parents: [] }, counts: { accepted: 0, declined: 0 },
  money: { kind: 'available', preTaxCents: 0, customerTotalCents: 0 },
  selected: 'accepted', page: 1, pageSize: 25, evidenceTotal: 0, rows: [],
};
describe('Financial Estimate composition contracts', () => {
  it('accepts bounded selections and rejects invalid dates, facets and invented access inputs', () => {
    expect(financialEstimatesQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [{ selected: 'declined' }, { selected: 'handoff' }, { pageSize: 1 }, { canRead: true },
      { period: { from: '2026-02-30', to: period.to } },
      { filters: { owners: [], parents: ['customer'] } }]) {
      expect(financialEstimatesQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    }
  });
  it('requires native selection, workspace and decision period to match the Financial wrapper', () => {
    const result = { workspaceId, view: 'financial-estimates', ...period, selected: 'accepted',
      estimates: { kind: 'accepted', report: native } };
    expect(financialEstimatesResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [{ selected: 'awaiting' }, { from: '2026-09-01' },
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { rawSnapshot: {} },
      { estimates: { kind: 'accepted', report: { ...native, selected: 'declined' } } }]) {
      expect(financialEstimatesResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    }
  });
  it('distinguishes denied subsections from authorized empty commitments', () => {
    const result = { workspaceId, view: 'financial-estimates', ...period, selected: 'awaiting',
      estimates: { kind: 'unavailable', reason: 'permissions', explanation: 'Estimate authority unavailable.' } };
    expect(financialEstimatesResultSchema.safeParse(result).success).toBe(true);
    expect(financialEstimatesResultSchema.safeParse({ ...result, estimates: { ...result.estimates, count: 0 } }).success).toBe(false);
  });
});

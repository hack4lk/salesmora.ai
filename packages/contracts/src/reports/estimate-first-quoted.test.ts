import { describe, expect, it } from 'vitest';
import { estimateFirstQuotedQuerySchema, estimateFirstQuotedResultSchema } from './estimate-first-quoted';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const row = {
  ownerKey: 'unassigned', parentType: 'job',
  familyId: `${workspaceId}:EST-0001`, estimateNumber: 'EST-0001',
  recordId: '00000000-0000-4000-8000-000000000002', label: 'First quote',
  firstIssuedDate: '2026-10-01', firstIssuedRevision: 1, firstIssuedVia: 'send',
  currentIssuedRevision: 2, currentIssuedDate: '2026-11-01', currentStatus: 'void', archived: true,
} as const;
const result = {
  workspaceId, view: 'estimate-first-quoted', asOf: '2026-11-07T18:00:00.000Z',
  from: '2026-10-01', to: '2026-10-31', today: '2026-11-07', timezone: 'America/New_York',
  scope: 'workspace', scopeLabel: 'Authorized first issuance.', archiveVisibility: 'included',
  total: 1, page: 1, pageSize: 25, coverage: { kind: 'complete' }, rows: [row],
  filters: { owners: [], parents: [] },
} as const;
describe('First-quoted Estimate contracts', () => {
  it('bounds periods and pages without monetary, decision or client authority input', () => {
    const query = { workspaceId, view: result.view, period: { from: result.from, to: result.to } };
    expect(estimateFirstQuotedQuerySchema.parse(query).pageSize).toBe(25);
    for (const patch of [{ selected: 'accepted' }, { canRead: true }, { pageSize: 26 },
      { period: { from: '2025-01-01', to: '2026-01-02' } }]) {
      expect(estimateFirstQuotedQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
    }
  });
  it('retains archived later-voided history and later-revision context outside the period', () => {
    expect(estimateFirstQuotedResultSchema.safeParse(result).success).toBe(true);
    expect(estimateFirstQuotedResultSchema.safeParse({ ...result, archiveVisibility: 'excluded' }).success).toBe(false);
  });
  it('requires coherent issuance dates, revisions and workspace-qualified identities', () => {
    for (const patch of [
      { firstIssuedDate: '2026-09-30' }, { firstIssuedRevision: 3 }, { currentIssuedDate: '2026-09-01' },
      { currentIssuedDate: '2026-11-08' }, { currentIssuedRevision: 1 }, { firstIssuedVia: 'resend' },
      { familyId: 'foreign:EST-0001' }, { currentStatus: 'draft' },
    ]) expect(estimateFirstQuotedResultSchema.safeParse({ ...result, rows: [{ ...row, ...patch }] }).success).toBe(false);
  });
  it('allows explicit partial coverage and empty scopes without inventing dates', () => {
    expect(estimateFirstQuotedResultSchema.safeParse({
      ...result, total: 0, rows: [], coverage: { kind: 'partial', explanation: 'Initial issuance history is missing.' },
    }).success).toBe(true);
    expect(estimateFirstQuotedResultSchema.safeParse({ ...result, total: 0, rows: [] }).success).toBe(true);
  });
  it('rejects duplicate families, stale pages, future periods and extra monetary fields', () => {
    for (const patch of [{ rows: [row, row] }, { total: 2 }, { page: 2 }, { money: 100 },
      { filters: { owners: ['member:a'], parents: [] } }, { filters: { owners: [], parents: ['lead'] } }, { filters: undefined },
      { to: '2026-11-08' }]) expect(estimateFirstQuotedResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
});

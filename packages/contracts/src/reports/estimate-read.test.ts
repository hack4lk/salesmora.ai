import { describe, expect, it } from 'vitest';
import { estimateReportQuerySchema, estimateReportReadResultSchema } from './estimate-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const recordId = '00000000-0000-4000-8000-000000000002';
const common = { workspaceId, asOf: '2026-11-07T18:00:00.000Z', timezone: 'America/New_York',
  scope: 'workspace', scopeLabel: 'Authorized Estimates.', filters: { owners: [], parents: [] }, page: 1, pageSize: 25 };
const period = { from: '2026-10-01', to: '2026-10-31' };
const row = { ownerKey: 'unassigned', parentType: 'job', familyId: `${workspaceId}:EST-0001`,
  recordId, estimateNumber: 'EST-0001', label: 'Quote', archived: false };
const money = { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 };
const rowMoney = { ...money, taxCents: 720 };
const decisions = {
  ...common, view: 'estimate-decisions', ...period, archiveVisibility: 'included',
  counts: { accepted: 1, declined: 0 }, money, selected: 'accepted', evidenceTotal: 1,
  rows: [{ ...row, revision: 2, decisionVersion: 4, outcome: 'accepted', decisionDate: '2026-10-15',
    recordedDate: '2026-11-01', money: rowMoney }],
};
const current = {
  ...common, view: 'estimate-current', today: '2026-11-07', counts: { awaiting: 1, expired: 0 },
  awaitingMoney: money, handoff: { kind: 'available', count: 0 }, selected: 'awaiting', evidenceTotal: 1,
  rows: [{ ...row, revision: 2, status: 'published', issuedDate: '2026-10-01', validUntil: '2026-11-07', money: rowMoney }],
};
const first = {
  ...common, view: 'estimate-first-quoted', today: '2026-11-07', ...period, archiveVisibility: 'included',
  total: 1, coverage: { kind: 'complete' }, rows: [{ ...row, firstIssuedDate: '2026-10-01',
    firstIssuedRevision: 1, firstIssuedVia: 'send', currentIssuedRevision: 2, currentIssuedDate: '2026-11-01', currentStatus: 'published' }],
};
function envelope<T extends { view: string; selected?: string }>(report: T) {
  const query = estimateReportQuerySchema.parse({ workspaceId, view: report.view,
    ...('from' in report ? { period } : {}), ...('selected' in report ? { selected: report.selected } : {}) });
  return { workspaceId, viewerId: 'viewer', policyRevision: 1, today: '2026-11-07',
    authority: { scope: 'workspace', archives: 'included', money: true, handoff: true }, exportAccess: null,
    query, report, options: { context: report.view === 'estimate-current' ? 'current' : 'period',
      owners: [{ value: 'unassigned', label: 'No current owner' }], parents: [{ value: 'job', label: 'Job' }] } };
}
describe('Estimates authority read envelope', () => {
  it('preserves all native views, corrected decisions, latest-issued context and frozen values', () => {
    for (const report of [decisions, current, first]) {
      expect(estimateReportReadResultSchema.parse(envelope(report)).report).toEqual(report);
      const original = envelope(report);
      expect(estimateReportReadResultSchema.safeParse({ ...original, query: { ...original.query, page: 999 } }).success).toBe(true);
    }
  });
  it('keeps counts with explicit invalid-snapshot money instead of inventing zero amounts', () => {
    const unavailable = { kind: 'unavailable', explanation: 'Snapshot could not be verified.' };
    for (const report of [
      { ...decisions, money: unavailable, rows: [{ ...decisions.rows[0], money: unavailable }] },
      { ...current, awaitingMoney: unavailable, rows: [{ ...current.rows[0], money: unavailable }] },
    ]) {
      const original = envelope(report);
      expect(estimateReportReadResultSchema.safeParse(original).success).toBe(true);
    }
  });
  it('binds assigned-job scope and unavailable handoff while allowing unrelated current owner attribution', () => {
    const original = envelope(current);
    const assigned = { ...original, authority: { ...original.authority, scope: 'assigned_job', handoff: false },
      report: { ...current, scope: 'assigned_job', handoff: { kind: 'unavailable', explanation: 'Complete linkage authority is required.' } } };
    expect(estimateReportReadResultSchema.safeParse(assigned).success).toBe(true);
    expect(estimateReportReadResultSchema.safeParse({ ...assigned, authority: { ...assigned.authority, handoff: true } }).success).toBe(false);
    expect(estimateReportReadResultSchema.safeParse({ ...assigned,
      options: { ...assigned.options, parents: [{ value: 'lead', label: 'Lead' }, ...assigned.options.parents] } }).success).toBe(false);
  });
  it('accepts only export authority no broader than the read envelope', () => {
    const original = envelope(current);
    for (const exportAccess of [null, { scope: 'workspace', handoff: true }, { scope: 'assigned_job', handoff: false }]) {
      expect(estimateReportReadResultSchema.safeParse({ ...original, exportAccess }).success).toBe(true);
    }
    expect(estimateReportReadResultSchema.safeParse({ ...original,
      exportAccess: { scope: 'assigned_job', handoff: true } }).success).toBe(false);
    const assigned = { ...original, authority: { ...original.authority, scope: 'assigned_job', handoff: false },
      report: { ...current, scope: 'assigned_job', handoff: { kind: 'unavailable', explanation: 'Complete linkage authority is required.' } } };
    expect(estimateReportReadResultSchema.safeParse({ ...assigned,
      exportAccess: { scope: 'workspace', handoff: false } }).success).toBe(false);
    expect(estimateReportReadResultSchema.safeParse({ ...assigned,
      exportAccess: { scope: 'assigned_job', handoff: false } }).success).toBe(true);
  });
  it('rejects forged authority, stale facets, workspace, selection, period, clock and private fields', () => {
    for (const report of [decisions, current, first]) {
      const original = envelope(report);
      for (const patch of [{ workspaceId: recordId }, { policyRevision: Number.MAX_SAFE_INTEGER + 1 },
        { today: '2026-11-08' }, { authority: { ...original.authority, money: false } },
        { authority: { ...original.authority, scope: 'assigned_job' } },
        { query: { ...original.query, pageSize: 50 } },
        { query: { ...original.query, filters: { owners: ['member:missing'], parents: [] } } },
        { options: { ...original.options, owners: [] } },
        { options: { ...original.options, owners: [...original.options.owners, ...original.options.owners] } },
        { options: { ...original.options, context: original.options.context === 'current' ? 'period' : 'current' } },
        { report: { ...report, timezone: 'Invalid/Zone' } }, { report: { ...report, notes: 'private' } }]) {
        expect(estimateReportReadResultSchema.safeParse({ ...original, ...patch }).success).toBe(false);
      }
      for (const patch of [{ viewerId: 'forged' }, { canReadMoney: true }, { filters: { owners: ['unassigned', 'unassigned'] } }]) {
        expect(estimateReportQuerySchema.safeParse({ ...original.query, ...patch }).success).toBe(false);
      }
    }
    expect(estimateReportReadResultSchema.safeParse({ ...envelope(decisions),
      authority: { ...envelope(decisions).authority, archives: 'excluded' } }).success).toBe(false);
    expect(estimateReportReadResultSchema.safeParse({ ...envelope(decisions),
      query: { ...envelope(decisions).query, selected: 'declined' } }).success).toBe(false);
    expect(estimateReportQuerySchema.safeParse({ ...envelope(current).query, period }).success).toBe(false);
  });
});

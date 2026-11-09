import { describe, expect, it } from 'vitest';
import { leadSources } from '../lead-read';
import { leadSourceQuerySchema } from './lead-source';
import { leadSourceReadResultSchema } from './lead-source-read';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const query = leadSourceQuerySchema.parse({ workspaceId, view: 'lead-source',
  period: { from: '2026-11-01', to: '2026-11-05' }, selected: 'cohort' });
const result = {
  workspaceId, viewerId: 'text-user-id', policyRevision: 0, scope: 'workspace', archiveVisibility: 'included',
  canReadConversion: true, canReadAcceptedValue: true, canExport: true, query,
  report: { workspaceId, view: 'lead-source', ...query.period, today: '2026-11-05',
    timezone: 'Europe/Warsaw', asOf: '2026-11-05T10:00:00Z', scopeLabel: 'Current authorized cohort.',
    scope: 'workspace', archiveVisibility: 'included', cohort: 0,
    conversion: { kind: 'available', converted: 0 },
    acceptedValue: { kind: 'available', preTaxCents: 0, estimateCount: 0, unattributedPreTaxCents: 0, unattributedCount: 0 },
    groups: leadSources.map(source => ({ source, cohort: 0, converted: 0, acceptedEstimateCount: 0, acceptedValueCents: 0 })),
    evidence: { kind: 'cohort', rows: [] }, page: 1, pageSize: 25, evidenceTotal: 0 },
};
describe('Sources authority envelope', () => {
  it('preserves text identity, zero policy revision and readable zero values', () => {
    expect(leadSourceReadResultSchema.safeParse(result).success).toBe(true);
  });
  it('rejects mismatched request, scope, workspace, clock, capabilities and private content', () => {
    for (const patch of [{ workspaceId: '00000000-0000-4000-8000-000000000002' }, { scope: 'assigned' },
      { canReadConversion: false }, { canReadAcceptedValue: false }, { canExport: false, extra: true }, { privateNotes: 'hidden' },
      { query: { ...query, selected: 'converted' } }, { report: { ...result.report, pageSize: 50 } },
      { report: { ...result.report, asOf: '2026-11-04T10:00:00Z' } }, { viewerId: 'bad\u0000id' }]) {
      expect(leadSourceReadResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    }
  });
  it('distinguishes invalid money from revoked value permission without claiming available money', () => {
    const report = { ...result.report,
      acceptedValue: { kind: 'unavailable', reason: 'invalid-money', explanation: 'Frozen value is unverified.' },
      groups: result.report.groups.map(group => ({ ...group, acceptedEstimateCount: null, acceptedValueCents: null })) };
    expect(leadSourceReadResultSchema.safeParse({ ...result, report }).success).toBe(true);
    expect(leadSourceReadResultSchema.safeParse({ ...result, report, canReadAcceptedValue: false }).success).toBe(false);
    const revoked = { ...result, report: { ...report, acceptedValue: { kind: 'unavailable', reason: 'permissions', explanation: 'Value access unavailable.' } },
      canReadAcceptedValue: false };
    expect(leadSourceReadResultSchema.safeParse(revoked).success).toBe(true);
  });
});

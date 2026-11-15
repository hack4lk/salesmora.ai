import { describe, expect, it } from 'vitest';
import { activityReportExportColumns, activityReportExportInputSchema,
  activityReportExportPreviewSchema, activityReportExportGenerationSchema } from './activity-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const input = activityReportExportInputSchema.parse({ dataset: 'evidence', query: {
  workspaceId, view: 'activity', period: { from: '2026-10-01', to: '2026-10-31' },
  filters: { domains: [], actions: [], actors: [] },
} });
const metadata = { workspaceId, policyRevision: 1, asOf: '2026-11-05T12:00:00.000Z', today: '2026-11-05', timezone: 'UTC',
  includedDomains: [{ domain: 'lead', scope: 'assigned', archiveVisibility: 'excluded' }],
  omittedDomains: ['customer', 'job', 'estimate', 'work-order'].map(domain => ({ domain, reason: 'permissions' })),
  count: 2, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: 'viewer', columns: activityReportExportColumns(input), coverage: 'Authorized domains.' };
describe('Activity CSV contracts', () => {
  it('accepts explicit domain coverage and rejects paginated or forged input', () => {
    expect(activityReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [{ page: 1 }, { pageSize: 25 }, { scope: 'workspace' }]) {
      expect(activityReportExportInputSchema.safeParse({ ...input, query: { ...input.query, ...patch } }).success).toBe(false);
    }
    expect(activityReportExportPreviewSchema.safeParse({ ...preview,
      input: { ...input, query: { ...input.query, filters: { ...input.query.filters, domains: ['job'] } } } }).success).toBe(false);
  });
  it('rejects duplicated, missing or misleading domain scopes and mismatched clocks', () => {
    for (const patch of [
      { omittedDomains: metadata.omittedDomains.slice(1) },
      { omittedDomains: [...metadata.omittedDomains, metadata.omittedDomains[0]] },
      { today: '2026-11-06' }, { columns: ['forged'] },
      { includedDomains: [{ domain: 'customer', scope: 'assigned', archiveVisibility: 'included' }],
        omittedDomains: ['lead', 'job', 'estimate', 'work-order'].map(domain => ({ domain, reason: 'permissions' })) },
    ]) expect(activityReportExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    expect(activityReportExportGenerationSchema.safeParse({ ...metadata,
      id: '00000000-0000-4000-8000-000000000099' }).success).toBe(true);
    expect(activityReportExportGenerationSchema.safeParse({ ...metadata, count: 50001,
      id: '00000000-0000-4000-8000-000000000099' }).success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { businessOverviewExportColumns, businessOverviewExportInputSchema, businessOverviewExportPreviewSchema,
  businessOverviewExportGenerationSchema } from './business-overview-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const input = businessOverviewExportInputSchema.parse({ dataset: 'summary',
  query: { workspaceId, view: 'business-overview', period: { from: '2026-10-01', to: '2026-10-31' } } });
const metadata = { workspaceId, policyRevision: 1, asOf: '2026-11-05T12:00:00.000Z', today: '2026-11-05', timezone: 'UTC',
  scopes: { lead: null, job: 'assigned', estimate: null, calendar: null }, count: 8,
  limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: 'viewer', columns: businessOverviewExportColumns, coverage: 'Partial scope.' };
describe('Overview CSV contract', () => {
  it('accepts a partial summary and rejects forged controls, dates and columns', () => {
    expect(businessOverviewExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [{ dataset: 'evidence' }, { scope: 'workspace' }]) {
      expect(businessOverviewExportInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
    }
    for (const patch of [{ today: '2026-11-06' }, { columns: ['value'] },
      { scopes: { lead: null, job: null, estimate: null, calendar: null } },
      { scopes: { ...metadata.scopes, calendar: { scope: 'own', jobs: null, workOrders: null } } }]) {
      expect(businessOverviewExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    }
    const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
    expect(businessOverviewExportGenerationSchema.safeParse(generation).success).toBe(true);
    expect(businessOverviewExportGenerationSchema.safeParse({ ...generation, count: 50001 }).success).toBe(false);
  });
});

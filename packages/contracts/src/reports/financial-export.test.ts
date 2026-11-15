import { describe, expect, it } from 'vitest';
import { financialReportExportColumns, financialReportExportInputSchema,
  financialReportExportPreviewSchema, financialReportExportGenerationSchema } from './financial-export';

const workspaceId = '00000000-0000-4000-8000-000000000001';
const input = financialReportExportInputSchema.parse({ dataset: 'summary', query: {
  workspaceId, view: 'financial', period: { from: '2026-10-01', to: '2026-10-31' }, selected: 'materials',
} });
const metadata = { workspaceId, policyRevision: 1, asOf: '2026-11-05T12:00:00.000Z', today: '2026-11-05', timezone: 'UTC',
  section: 'materials', scope: 'workspace', jobScope: 'assigned', archiveVisibility: 'excluded',
  count: 1, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
const preview = { ...metadata, input, viewerId: 'viewer', columns: financialReportExportColumns(input), coverage: 'Recorded costs.' };
describe('Financial CSV contracts', () => {
  it('binds selected sections, dates and fixed columns without pagination', () => {
    expect(financialReportExportPreviewSchema.safeParse(preview).success).toBe(true);
    for (const patch of [{ page: 1 }, { pageSize: 25 }, { scope: 'workspace' }]) {
      expect(financialReportExportInputSchema.safeParse({ ...input, query: { ...input.query, ...patch } }).success).toBe(false);
    }
    for (const patch of [{ section: 'accepted' }, { today: '2026-11-06' }, { columns: ['forged'] },
      { archiveVisibility: 'included' }, { count: 2 }]) {
      expect(financialReportExportPreviewSchema.safeParse({ ...preview, ...patch }).success).toBe(false);
    }
    expect(financialReportExportGenerationSchema.safeParse({ ...metadata,
      id: '00000000-0000-4000-8000-000000000099' }).success).toBe(true);
    expect(financialReportExportGenerationSchema.safeParse({ ...metadata, count: 50001,
      id: '00000000-0000-4000-8000-000000000099' }).success).toBe(false);
    expect(financialReportExportGenerationSchema.safeParse({ ...metadata, archiveVisibility: 'included',
      id: '00000000-0000-4000-8000-000000000099' }).success).toBe(false);
  });
  it('does not include other Estimate metrics in selected summaries', () => {
    const accepted = financialReportExportInputSchema.parse({ ...input, query: { ...input.query, selected: 'accepted' } });
    const awaiting = financialReportExportInputSchema.parse({ ...input, query: { ...input.query, selected: 'awaiting' } });
    expect(financialReportExportColumns(accepted)).not.toContain('declined');
    expect(financialReportExportColumns(awaiting)).not.toContain('handoff');
    expect(financialReportExportColumns(awaiting)).not.toContain('expired');
  });
});

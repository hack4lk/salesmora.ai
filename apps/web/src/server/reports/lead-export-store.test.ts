import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ preview: vi.fn(), download: vi.fn(), db: {} }));
vi.mock('server-only', () => ({}));
vi.mock('../workspaces/store', () => ({ database: () => mocks.db }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(),
  previewLeadReportExport: mocks.preview, createLeadReportCSVExport: mocks.download }));
import { previewWorkspaceLeadReportExport, exportWorkspaceLeadReport } from './lead-export';
import { enabledPermissions } from '../authorization/permissions';
import { leadReportExportInputSchema } from '@salesmora/contracts';

const input = leadReportExportInputSchema.parse({ dataset: 'evidence', query: {
  workspaceId: '00000000-0000-4000-8000-000000000001', view: 'pipeline', selection: { kind: 'pipeline' },
  filters: { stages: [], owners: [], sources: [] },
} });
beforeEach(() => { vi.clearAllMocks(); });
describe('Leads report CSV session-bound store', () => {
  it('passes unchanged application permissions and session identity to native preview and generation', () => {
    previewWorkspaceLeadReportExport('session-user', input);
    expect(mocks.preview).toHaveBeenCalledWith(mocks.db, { userId: 'session-user', workspaceId: input.query.workspaceId }, enabledPermissions, input);
    const signal = new AbortController().signal;
    exportWorkspaceLeadReport('session-user', input, signal);
    expect(mocks.download).toHaveBeenCalledWith(mocks.db, { userId: 'session-user', workspaceId: input.query.workspaceId }, enabledPermissions, input, signal);
    expect(enabledPermissions).not.toContain('reports.export');
  });
  it('rejects invalid input before native data access and propagates authority failures', async () => {
    const invalid = { ...input, query: { ...input.query, workspaceId: 'invalid' } };
    expect(() => previewWorkspaceLeadReportExport('session-user', invalid)).toThrow();
    expect(() => exportWorkspaceLeadReport('session-user', invalid, new AbortController().signal)).toThrow();
    expect(mocks.preview).not.toHaveBeenCalled(); expect(mocks.download).not.toHaveBeenCalled();
    mocks.download.mockRejectedValueOnce(new Error('Access denied.'));
    await expect(exportWorkspaceLeadReport('session-user', input, new AbortController().signal)).rejects.toThrow('Access denied.');
  });
});

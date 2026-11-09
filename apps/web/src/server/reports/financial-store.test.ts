import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ authorized: vi.fn(), read: vi.fn(), initial: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorized }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(),
  readFinancialReportWithAuthorityInTransaction: mocks.read, initialFinancialReportWithAuthorityInTransaction: mocks.initial }));
import { workspaceFinancialReport, initialWorkspaceFinancialReport } from './store';
import { initialFinancialQuery } from '../../features/reports/financial-report/financial-read.fixtures';
beforeEach(() => {
  vi.clearAllMocks(); mocks.authorized.mockImplementation((_user, _workspace, _write, use) => use('transaction', 'context'));
});
describe('session-bound Financial store', () => {
  it('binds native read and initial orchestration to unchanged authorized workspace', async () => {
    await workspaceFinancialReport('session-user', initialFinancialQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialFinancialQuery.workspaceId, false, expect.any(Function));
    expect(mocks.read).toHaveBeenCalledWith('transaction', 'context', initialFinancialQuery);
    await initialWorkspaceFinancialReport('session-user', initialFinancialQuery.workspaceId);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialFinancialQuery.workspaceId, false, mocks.initial);
    expect(mocks.initial).toHaveBeenCalledWith('transaction', 'context');
  });
  it('rejects malformed input before authorization and propagates native errors', async () => {
    await expect(workspaceFinancialReport('session-user', { ...initialFinancialQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.read.mockRejectedValueOnce(new Error('Financial denied'));
    await expect(workspaceFinancialReport('session-user', initialFinancialQuery)).rejects.toThrow('Financial denied');
  });
});

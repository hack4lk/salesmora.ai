import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), workspace: vi.fn(), context: vi.fn(), reports: vi.fn(),
  financial: vi.fn(), initial: vi.fn(), chat: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NOT_FOUND'); }, redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); },
}));
vi.mock('next/headers', () => ({ headers: vi.fn() }));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('../chat/config', () => ({ workspaceChatAvailable: mocks.chat }));
vi.mock('../auth/auth', () => ({ auth: { api: { signOut: vi.fn() } } }));
vi.mock('../workspaces/store', () => ({ findWorkspace: mocks.workspace }));
vi.mock('../authorization/permissions', () => ({ workspaceAuthorization: mocks.context,
  workspaceCapabilities: () => ({ assistant: false }), workspaceNavigationPages: vi.fn() }));
vi.mock('./store', () => ({ initialWorkspaceFinancialReport: mocks.initial }));
vi.mock('@salesmora/domain', async original => ({ ...await original<typeof import('@salesmora/domain')>(),
  authorize: mocks.financial, resolveAuthorizedCollectionScope: mocks.reports }));
vi.mock('../../features/workspace/workspace-shell/workspace-shell', () => ({ WorkspaceShell: vi.fn() }));
vi.mock('../../features/reports/financial-report/financial-report-page', () => ({ FinancialReportRoute: vi.fn() }));
import { renderFinancialReportsPage } from './read-page';
import { AuthorizationAccessError } from '@salesmora/data';
import { financialReadResponse, initialFinancialQuery } from '../../features/reports/financial-report/financial-read.fixtures';
const workspaceId = initialFinancialQuery.workspaceId;
beforeEach(() => {
  vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-user' } });
  mocks.workspace.mockResolvedValue({ id: workspaceId }); mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
  mocks.reports.mockReturnValue({ allowed: false }); mocks.financial.mockReturnValue({ allowed: false });
  mocks.initial.mockResolvedValue(financialReadResponse());
});
describe('direct Financial page authorization', () => {
  it('denies unsigned sessions, disabled Reports and malformed controls before loading', async () => {
    mocks.session.mockResolvedValueOnce(null); await expect(renderFinancialReportsPage({})).rejects.toThrow('REDIRECT:/login');
    for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: 'invalid' },
      { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
      await expect(renderFinancialReportsPage(params)).rejects.toThrow('NOT_FOUND');
    }
    expect(mocks.initial).not.toHaveBeenCalled();
  });
  it('requires explicit Financial entrance but leaves domain availability to native readers', async () => {
    mocks.reports.mockReturnValue({ allowed: true });
    await expect(renderFinancialReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initial).not.toHaveBeenCalled();
    mocks.financial.mockReturnValue({ allowed: true });
    const result = await renderFinancialReportsPage({ workspace: workspaceId });
    expect(mocks.financial).toHaveBeenCalledWith({ membership: { role: 'owner' } }, { permission: 'reports.financial.read' });
    expect(mocks.initial).toHaveBeenCalledWith('session-user', workspaceId);
    expect(result).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false,
      children: { props: { initial: financialReadResponse() } } } });
  });
  it('handles missing workspaces and native revocation but propagates invalid frozen/cost failures', async () => {
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderFinancialReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null); await expect(renderFinancialReportsPage({})).rejects.toThrow('REDIRECT:/setup');
    mocks.reports.mockReturnValue({ allowed: true }); mocks.financial.mockReturnValue({ allowed: true });
    mocks.initial.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderFinancialReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.initial.mockRejectedValueOnce(new Error('Invalid recorded cost'));
    await expect(renderFinancialReportsPage({ workspace: workspaceId })).rejects.toThrow('Invalid recorded cost');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ session: vi.fn(), workspace: vi.fn(), context: vi.fn(), reports: vi.fn(), authorized: vi.fn(), templates: vi.fn(), selectedLead: vi.fn(), selectedJob: vi.fn(), selectedCalendar: vi.fn(), initial: vi.fn(), initialSource: vi.fn(), initialOverview: vi.fn(), initialCalendar: vi.fn(), initialJobs: vi.fn(), initialTeam: vi.fn(), initialEstimates: vi.fn(), initialActivity: vi.fn(), capabilities: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NOT_FOUND'); }), redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`); }) }));
vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, redirect: mocks.redirect }));
vi.mock('next/headers', () => ({ headers: vi.fn() }));
vi.mock('../auth/session', () => ({ getSession: mocks.session }));
vi.mock('../auth/auth', () => ({ auth: { api: { signOut: vi.fn() } } }));
vi.mock('../workspaces/store', () => ({ findWorkspace: mocks.workspace }));
vi.mock('../authorization/permissions', () => ({ workspaceAuthorization: mocks.context, authorizedWorkspace: mocks.authorized, workspaceCapabilities: mocks.capabilities, workspaceNavigationPages: vi.fn() }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(), listReportTemplatesInTransaction: mocks.templates }));
vi.mock('./store', () => ({ workspaceLeadReport: mocks.selectedLead, workspaceJobReport: mocks.selectedJob, workspaceCalendarReport: mocks.selectedCalendar,
  initialWorkspaceLeadReport: mocks.initial, initialWorkspaceLeadSourceReport: mocks.initialSource,
  initialWorkspaceBusinessOverview: mocks.initialOverview, initialWorkspaceCalendarReport: mocks.initialCalendar,
  initialWorkspaceJobReport: mocks.initialJobs, initialWorkspaceTeamReport: mocks.initialTeam,
  initialWorkspaceEstimateReport: mocks.initialEstimates, initialWorkspaceActivityReport: mocks.initialActivity }));
vi.mock('@salesmora/domain', async original => ({ ...await original<typeof import('@salesmora/domain')>(), resolveAuthorizedCollectionScope: mocks.reports,
  authorize: vi.fn(() => ({ allowed: false })) }));
vi.mock('../../features/workspace/workspace-shell/workspace-shell', () => ({ WorkspaceShell: vi.fn() }));
vi.mock('../../features/reports/lead-report-workspace/lead-report-route', () => ({ LeadReportRoute: vi.fn() }));
vi.mock('../../features/reports/lead-source-report/lead-source-route', () => ({ LeadSourceRoute: vi.fn() }));
vi.mock('../../features/reports/business-overview/business-overview-read-page', () => ({ BusinessOverviewRoute: vi.fn() }));
vi.mock('../../features/reports/calendar-report-workspace/calendar-report-page', () => ({ CalendarReportRoute: vi.fn() }));
vi.mock('../../features/reports/job-report-workspace/job-report-page', () => ({ JobReportRoute: vi.fn() }));
vi.mock('../../features/reports/team-report-workspace/team-report-page', () => ({ TeamReportRoute: vi.fn() }));
vi.mock('../../features/reports/estimate-report-workspace/estimate-report-page', () => ({ EstimateReportRoute: vi.fn() }));
vi.mock('../../features/reports/activity-report/activity-report-page', () => ({ ActivityReportRoute: vi.fn() }));
import { renderLeadReportsPage, renderSourcesReportsPage, renderBusinessOverviewPage, renderCalendarReportsPage, renderJobReportsPage, renderTeamReportsPage, renderEstimateReportsPage, renderActivityReportsPage, renderReportCatalogPage } from './read-page';
import { AuthorizationAccessError } from '@salesmora/data';
import { initialLeadReportQuery, leadReportBackendResponse } from '../../features/reports/lead-report-workspace/lead-report.adapter.fixtures';
import { initialLeadSourceQuery, sourceReadResponse } from '../../features/reports/lead-source-report/lead-source-read.fixtures';
import { initialOverviewQuery, overviewReadResponse } from '../../features/reports/business-overview/business-overview-read.fixtures';
import { initialJobQuery, jobReadResponse } from '../../features/reports/job-report-workspace/job-read.fixtures';
import { initialTeamQuery, teamReadResponse, teamWorkspaceAuthority } from '../../features/reports/team-report-workspace/team-read.fixtures';
import { initialEstimateQuery, estimateReadResponse } from '../../features/reports/estimate-report-workspace/estimate-read.fixtures';
import { activityReadResponse } from '../../features/reports/activity-report/activity-read.fixtures';
import { overviewAttentionHref } from '../../features/reports/business-overview/business-overview-navigation';
const workspaceId = '00000000-0000-4000-8000-000000000001';
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: 'session-user' } });
  mocks.workspace.mockResolvedValue({ id: workspaceId }); mocks.context.mockResolvedValue({});
  mocks.reports.mockReturnValue({ allowed: false }); mocks.capabilities.mockReturnValue({});
  mocks.initial.mockResolvedValue(leadReportBackendResponse(initialLeadReportQuery));
  mocks.initialSource.mockResolvedValue(sourceReadResponse(initialLeadSourceQuery));
  mocks.initialOverview.mockResolvedValue(overviewReadResponse(initialOverviewQuery));
  mocks.initialJobs.mockResolvedValue(jobReadResponse(initialJobQuery));
  mocks.initialTeam.mockResolvedValue(teamReadResponse(initialTeamQuery));
  mocks.initialEstimates.mockResolvedValue(estimateReadResponse(initialEstimateQuery));
  mocks.initialActivity.mockResolvedValue(activityReadResponse()); });
describe.each([
  ['stale-leads', renderLeadReportsPage, mocks.selectedLead],
  ['overdue-jobs', renderJobReportsPage, mocks.selectedJob],
  ['waiting-jobs', renderJobReportsPage, mocks.selectedJob],
  ['upcoming-visits', renderCalendarReportsPage, mocks.selectedCalendar],
] as const)('Overview %s destination', (id, renderPage, reader) => {
  const params = () => Object.fromEntries(new URL(overviewAttentionHref(id, workspaceId, '2026-11-09'), 'http://localhost').searchParams);
  beforeEach(() => {
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { lead: 'workspace', job: 'workspace' } });
    reader.mockResolvedValue({ selected: true });
  });
  it('loads the validated native query under the authenticated identity', async () => {
    const controls = params();
    const page = await renderPage(controls);
    expect(reader).toHaveBeenCalledWith('session-user', JSON.parse(controls.query));
    expect(page.props.children.props.initial).toEqual({ selected: true });
  });
  it('rejects malformed, duplicate, oversized and cross-workspace queries before loading', async () => {
    const controls = params(), query = JSON.parse(controls.query);
    for (const value of ['{', '', 'x'.repeat(16001), [controls.query, controls.query],
      JSON.stringify({ ...query, workspaceId: '00000000-0000-4000-8000-000000000002' }),
      JSON.stringify({ ...query, role: 'owner' })]) {
      await expect(renderPage({ ...controls, query: value })).rejects.toThrow('NOT_FOUND');
    }
    expect(reader).not.toHaveBeenCalled();
  });
  it('rechecks report authority and propagates native access denial as not found', async () => {
    mocks.reports.mockReturnValueOnce({ allowed: false });
    await expect(renderPage(params())).rejects.toThrow('NOT_FOUND');
    expect(reader).not.toHaveBeenCalled();
    reader.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderPage(params())).rejects.toThrow('NOT_FOUND');
  });
});
describe('direct Activity report page authorization', () => {
  it('rejects unsigned sessions, disabled Reports and malformed controls before native loading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expect(renderActivityReportsPage({})).rejects.toThrow('REDIRECT:/login');
    for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: 'invalid' },
      { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
      await expect(renderActivityReportsPage(params)).rejects.toThrow('NOT_FOUND');
    }
    expect(mocks.initialActivity).not.toHaveBeenCalled();
  });
  describe('report catalog', () => {
    it('uses the current workspace and only enables areas with current authority', async () => {
      const context = { membership: { role: 'owner' } };
      mocks.context.mockResolvedValue(context);
      mocks.reports.mockImplementation((_context, permission) => permission === 'reports.read'
        ? { allowed: true, resourceKind: 'report', scope: 'assigned', sourceScopes: { lead: 'assigned' } }
        : { allowed: false });
      mocks.authorized.mockImplementation(async (_user, _workspace, _write, callback) => callback({}, context));
      mocks.templates.mockResolvedValue([{}, {}]);
      const page = await renderReportCatalogPage({ workspace: workspaceId });
      expect(mocks.authorized).toHaveBeenCalledWith('session-user', workspaceId, false, expect.any(Function));
      const areas = page.props.children.props.areas;
      expect(areas).toHaveLength(9);
      expect(areas.find((area: { id: string }) => area.id === 'leads').access).toEqual({ allowed: true, templateCount: 2 });
      expect(areas.find((area: { id: string }) => area.id === 'jobs').access.allowed).toBe(false);
      expect(areas.find((area: { id: string }) => area.id === 'financial').access.allowed).toBe(false);
    });
  });
  it('allows partial native domain coverage without forcing Lead, Job or financial access', async () => {
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.reports.mockImplementation((_context, permission) => ({ allowed: permission === 'reports.read' }));
    const page = await renderActivityReportsPage({ workspace: workspaceId });
    expect(mocks.initialActivity).toHaveBeenCalledWith('session-user', workspaceId);
    expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false,
      children: { props: { initial: activityReadResponse() } } } });
  });
  it('maps missing workspace and native denial without hiding unsupported-history failures', async () => {
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderActivityReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderActivityReportsPage({})).rejects.toThrow('REDIRECT:/setup');
    mocks.reports.mockReturnValue({ allowed: true });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.initialActivity.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderActivityReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.initialActivity.mockRejectedValueOnce(new Error('Unsupported native event'));
    await expect(renderActivityReportsPage({ workspace: workspaceId })).rejects.toThrow('Unsupported native event');
  });
});
describe('direct Estimates report page authorization', () => {
  it('denies unsigned sessions, disabled Reports and malformed controls before loading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expect(renderEstimateReportsPage({})).rejects.toThrow('REDIRECT:/login');
    for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: 'invalid' },
      { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
      await expect(renderEstimateReportsPage(params)).rejects.toThrow('NOT_FOUND');
    }
    expect(mocks.initialEstimates).not.toHaveBeenCalled();
  });
  it('requires Estimate authority without forcing Lead plus Job linkage or Financial Reports', async () => {
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.reports.mockImplementation((_context, permission) => ({ allowed: permission === 'reports.read' }));
    await expect(renderEstimateReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initialEstimates).not.toHaveBeenCalled();
    mocks.reports.mockImplementation((_context, permission) => ({ allowed: ['reports.read', 'estimates.read'].includes(permission) }));
    const page = await renderEstimateReportsPage({ workspace: workspaceId });
    expect(mocks.initialEstimates).toHaveBeenCalledWith('session-user', workspaceId);
    expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false,
      children: { props: { initial: estimateReadResponse(initialEstimateQuery) } } } });
  });
  it('handles missing workspaces and native scope failures without fallback or hiding unexpected errors', async () => {
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderEstimateReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderEstimateReportsPage({})).rejects.toThrow('REDIRECT:/setup');
    mocks.reports.mockReturnValue({ allowed: true });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.initialEstimates.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderEstimateReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.initialEstimates.mockRejectedValueOnce(new Error('Native failure'));
    await expect(renderEstimateReportsPage({ workspace: workspaceId })).rejects.toThrow('Native failure');
  });
});
describe('direct Team report page authorization', () => {
  it('rejects unsigned sessions, disabled Reports and malformed workspace controls before loading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expect(renderTeamReportsPage({})).rejects.toThrow('REDIRECT:/login');
    for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: 'invalid' },
      { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
      await expect(renderTeamReportsPage(params)).rejects.toThrow('NOT_FOUND');
    }
    expect(mocks.initialTeam).not.toHaveBeenCalled();
  });
  it('loads either independently authorized native domain without requiring both', async () => {
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    for (const source of ['lead', 'job']) {
      mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { [source]: 'workspace' } });
      const initial = source === 'lead' ? teamReadResponse(initialTeamQuery, { leads: teamWorkspaceAuthority.leads, jobs: null })
        : teamReadResponse({ ...initialTeamQuery, view: 'team-jobs', selected: { kind: 'queue', queue: 'active' } },
          { leads: null, jobs: teamWorkspaceAuthority.jobs });
      mocks.initialTeam.mockResolvedValueOnce(initial);
      const page = await renderTeamReportsPage({ workspace: workspaceId });
      expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false,
        children: { props: { initial } } } });
    }
    expect(mocks.initialTeam).toHaveBeenCalledWith('session-user', workspaceId);
    expect(mocks.initial).not.toHaveBeenCalled();
    expect(mocks.initialJobs).not.toHaveBeenCalled();
  });
  it('handles missing workspaces, native denial and unexpected failures without fallback', async () => {
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderTeamReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderTeamReportsPage({})).rejects.toThrow('REDIRECT:/setup');
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { job: 'workspace' } });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.initialTeam.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderTeamReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.initialTeam.mockRejectedValueOnce(new Error('Native failure'));
    await expect(renderTeamReportsPage({ workspace: workspaceId })).rejects.toThrow('Native failure');
  });
});
describe('direct Jobs report page authorization', () => {
  it('rejects unsigned sessions, disabled Reports and malformed workspace controls before loading', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expect(renderJobReportsPage({})).rejects.toThrow('REDIRECT:/login');
    for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: 'invalid' },
      { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
      await expect(renderJobReportsPage(params)).rejects.toThrow('NOT_FOUND');
    }
    expect(mocks.initialJobs).not.toHaveBeenCalled();
  });
  it('requires the current Reports Job source and does not require Lead authority', async () => {
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.reports.mockReturnValueOnce({ allowed: true, sourceScopes: { lead: 'workspace' } });
    await expect(renderJobReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initialJobs).not.toHaveBeenCalled();
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { job: 'assigned' } });
    const page = await renderJobReportsPage({ workspace: workspaceId });
    expect(mocks.initialJobs).toHaveBeenCalledWith('session-user', workspaceId);
    expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false,
      children: { props: { initial: jobReadResponse(initialJobQuery) } } } });
    expect(mocks.initial).not.toHaveBeenCalled();
  });
  it('handles inaccessible/default workspaces, fresh native denial and unexpected failures explicitly', async () => {
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderJobReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderJobReportsPage({})).rejects.toThrow('REDIRECT:/setup');
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { job: 'workspace' } });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    mocks.initialJobs.mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderJobReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.initialJobs.mockRejectedValueOnce(new Error('Native failure'));
    await expect(renderJobReportsPage({ workspace: workspaceId })).rejects.toThrow('Native failure');
  });
});
describe.each([['Leads', renderLeadReportsPage], ['Sources', renderSourcesReportsPage]] as const)('direct %s report page authorization', (_name, renderPage) => {
  it('redirects signed-out users and rejects malformed or duplicate workspace parameters', async () => {
    mocks.session.mockResolvedValueOnce(null);
    await expect(renderPage({})).rejects.toThrow('REDIRECT:/login');
    await expect(renderPage({ workspace: ['a', 'b'] })).rejects.toThrow('NOT_FOUND');
    await expect(renderPage({ workspace: 'invalid' })).rejects.toThrow('NOT_FOUND');
    await expect(renderPage({ workspace: '' })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initial).not.toHaveBeenCalled();
    expect(mocks.initialSource).not.toHaveBeenCalled();
  });
  describe('direct Calendar report page authorization', () => {
    it('denies signed-out users, disabled Reports and malformed workspace controls before reading', async () => {
      mocks.session.mockResolvedValueOnce(null);
      await expect(renderCalendarReportsPage({})).rejects.toThrow('REDIRECT:/login');
      for (const params of [{ workspace: workspaceId }, { workspace: '' }, { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
        await expect(renderCalendarReportsPage(params)).rejects.toThrow('NOT_FOUND');
      }
      expect(mocks.initialCalendar).not.toHaveBeenCalled();
    });
    it('requires Calendar plus at least one supporting domain but never requires a Lead or hidden parent Job', async () => {
      mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
      for (const permission of ['calendar.read', 'workorders.read', 'reports.read']) {
        mocks.reports.mockImplementation((_context, requested) => ({ allowed: requested !== permission && requested !== 'jobs.read' }));
        await expect(renderCalendarReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
      }
      expect(mocks.initialCalendar).not.toHaveBeenCalled();
      mocks.reports.mockImplementation((_context, requested) => ({ allowed: ['reports.read', 'calendar.read', 'workorders.read'].includes(requested) }));
      const page = await renderCalendarReportsPage({ workspace: workspaceId });
      expect(mocks.initialCalendar).toHaveBeenCalledWith('session-user', workspaceId);
      expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false } });
      expect(mocks.initial).not.toHaveBeenCalled();
    });
    it('handles fresh native denial and inaccessible requested workspace without stale output', async () => {
      mocks.workspace.mockResolvedValueOnce(null);
      await expect(renderCalendarReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
      mocks.reports.mockReturnValue({ allowed: true }); mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
      mocks.initialCalendar.mockRejectedValueOnce(new AuthorizationAccessError());
      await expect(renderCalendarReportsPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    });
  });
  describe('direct Overview page authorization', () => {
    it('denies disabled Reports and malformed URLs before reading any domain', async () => {
      await expect(renderBusinessOverviewPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
      for (const params of [{ workspace: '' }, { workspace: [workspaceId, workspaceId] }, { workspace: workspaceId, role: 'owner' }]) {
        await expect(renderBusinessOverviewPage(params)).rejects.toThrow('NOT_FOUND');
      }
      mocks.session.mockResolvedValueOnce(null);
      await expect(renderBusinessOverviewPage({})).rejects.toThrow('REDIRECT:/login');
      expect(mocks.initialOverview).not.toHaveBeenCalled();
    });
    it('does not require a Lead source when current Reports authority provides another native domain', async () => {
      mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { job: 'workspace' } });
      mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
      const page = await renderBusinessOverviewPage({ workspace: workspaceId });
      expect(mocks.initialOverview).toHaveBeenCalledWith('session-user', workspaceId);
      expect(page).toMatchObject({ props: { currentPage: 'reports', assistantAvailable: false, chatEnabled: false } });
      expect(mocks.initial).not.toHaveBeenCalled();
      expect(mocks.initialSource).not.toHaveBeenCalled();
    });
    it('rejects inaccessible workspaces and fresh native authorization denial without returning stale metrics', async () => {
      mocks.workspace.mockResolvedValueOnce(null);
      await expect(renderBusinessOverviewPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
      mocks.reports.mockReturnValue({ allowed: true });
      mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
      mocks.initialOverview.mockRejectedValueOnce(new AuthorizationAccessError());
      await expect(renderBusinessOverviewPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    });
  });
  it('keeps direct URLs unavailable while Reports is disabled and when the Lead source is absent', async () => {
    await expect(renderPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    mocks.reports.mockReturnValueOnce({ allowed: true, sourceScopes: { job: 'workspace' } });
    await expect(renderPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initial).not.toHaveBeenCalled();
    expect(mocks.initialSource).not.toHaveBeenCalled();
  });
  it('rejects unknown URL controls and inaccessible requested workspaces without reading reports', async () => {
    await expect(renderPage({ workspace: workspaceId, role: 'owner' })).rejects.toThrow('NOT_FOUND');
    mocks.workspace.mockResolvedValueOnce(null);
    await expect(renderPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
    expect(mocks.initial).not.toHaveBeenCalled();
    expect(mocks.initialSource).not.toHaveBeenCalled();
  });
  it('composes the canonical route only after current Report and Lead source authority and keeps assistant integration off', async () => {
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { lead: 'workspace' } });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    const page = await renderPage({ workspace: workspaceId });
    const reader = _name === 'Sources' ? mocks.initialSource : mocks.initial;
    expect(reader).toHaveBeenCalledWith('session-user', workspaceId);
    expect(page).toMatchObject({ props: { currentPage: 'reports', workspaceId, assistantAvailable: false, chatEnabled: false,
      children: { props: { initial: _name === 'Sources' ? sourceReadResponse(initialLeadSourceQuery) : leadReportBackendResponse(initialLeadReportQuery) } } } });
  });
  it('maps a fresh native read denial to notFound rather than rendering stale authorized data', async () => {
    mocks.reports.mockReturnValue({ allowed: true, sourceScopes: { lead: 'workspace' } });
    mocks.context.mockResolvedValue({ membership: { role: 'owner' } });
    (_name === 'Sources' ? mocks.initialSource : mocks.initial).mockRejectedValueOnce(new AuthorizationAccessError());
    await expect(renderPage({ workspace: workspaceId })).rejects.toThrow('NOT_FOUND');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ authorized: vi.fn(), read: vi.fn(), source: vi.fn(), initialSource: vi.fn(), overview: vi.fn(), initialOverview: vi.fn(), calendar: vi.fn(), initialCalendar: vi.fn(), jobs: vi.fn(), initialJobs: vi.fn(), team: vi.fn(), initialTeam: vi.fn(), estimates: vi.fn(), initialEstimates: vi.fn(), activity: vi.fn(), initialActivity: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorized }));
vi.mock('@salesmora/data', async original => ({ ...await original<typeof import('@salesmora/data')>(),
  readLeadReportWithAuthorityInTransaction: mocks.read, readLeadSourceReportWithAuthorityInTransaction: mocks.source,
  initialLeadSourceReportWithAuthorityInTransaction: mocks.initialSource, readBusinessOverviewWithAuthorityInTransaction: mocks.overview,
  initialBusinessOverviewWithAuthorityInTransaction: mocks.initialOverview, readCalendarReportWithAuthorityInTransaction: mocks.calendar,
  initialCalendarReportWithAuthorityInTransaction: mocks.initialCalendar, readJobReportWithAuthorityInTransaction: mocks.jobs,
  initialJobReportWithAuthorityInTransaction: mocks.initialJobs, readTeamReportWithAuthorityInTransaction: mocks.team,
  initialTeamReportWithAuthorityInTransaction: mocks.initialTeam, readEstimateReportWithAuthorityInTransaction: mocks.estimates,
  initialEstimateReportWithAuthorityInTransaction: mocks.initialEstimates, readActivityReportWithAuthorityInTransaction: mocks.activity,
  initialActivityReportWithAuthorityInTransaction: mocks.initialActivity }));
import { workspaceLeadReport, initialWorkspaceLeadReport, workspaceLeadSourceReport, initialWorkspaceLeadSourceReport,
  workspaceBusinessOverview, initialWorkspaceBusinessOverview, workspaceCalendarReport, initialWorkspaceCalendarReport,
  workspaceJobReport, initialWorkspaceJobReport, workspaceTeamReport, initialWorkspaceTeamReport,
  workspaceEstimateReport, initialWorkspaceEstimateReport, workspaceActivityReport, initialWorkspaceActivityReport } from './store';
import { initialLeadReportQuery, leadReportBackendResponse } from '../../features/reports/lead-report-workspace/lead-report.adapter.fixtures';
import { initialLeadSourceQuery, sourceReadResponse } from '../../features/reports/lead-source-report/lead-source-read.fixtures';
import { initialOverviewQuery, overviewReadResponse } from '../../features/reports/business-overview/business-overview-read.fixtures';
import { initialCalendarQuery } from '../../features/reports/calendar-report-workspace/calendar-read.fixtures';
import { initialJobQuery } from '../../features/reports/job-report-workspace/job-read.fixtures';
import { initialTeamQuery } from '../../features/reports/team-report-workspace/team-read.fixtures';
import { initialEstimateQuery } from '../../features/reports/estimate-report-workspace/estimate-read.fixtures';
import { initialActivityQuery } from '../../features/reports/activity-report/activity-read.fixtures';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.authorized.mockImplementation((_user, _workspace, _write, use) => use('transaction', 'server-context'));
  mocks.read.mockResolvedValue(leadReportBackendResponse(initialLeadReportQuery));
  mocks.source.mockResolvedValue(sourceReadResponse(initialLeadSourceQuery));
  mocks.initialSource.mockResolvedValue(sourceReadResponse(initialLeadSourceQuery));
  mocks.overview.mockResolvedValue(overviewReadResponse(initialOverviewQuery));
  mocks.initialOverview.mockResolvedValue(overviewReadResponse(initialOverviewQuery));
});
describe('session-bound Reports server store', () => {
  it('binds Activity reads and native initial dates to unchanged session authorization', async () => {
    await workspaceActivityReport('session-user', initialActivityQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialActivityQuery.workspaceId, false, expect.any(Function));
    expect(mocks.activity).toHaveBeenCalledWith('transaction', 'server-context', initialActivityQuery);
    await initialWorkspaceActivityReport('session-user', initialActivityQuery.workspaceId);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialActivityQuery.workspaceId, false, mocks.initialActivity);
    expect(mocks.initialActivity).toHaveBeenCalledWith('transaction', 'server-context');
  });
  it('rejects malformed Activity requests before authorization and propagates native failures', async () => {
    await expect(workspaceActivityReport('session-user', { ...initialActivityQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.activity.mockRejectedValueOnce(new Error('Unsupported event'));
    await expect(workspaceActivityReport('session-user', initialActivityQuery)).rejects.toThrow('Unsupported event');
  });
  it('binds Estimates and native initial-period orchestration to unchanged session authorization', async () => {
    await workspaceEstimateReport('session-user', initialEstimateQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialEstimateQuery.workspaceId, false, expect.any(Function));
    expect(mocks.estimates).toHaveBeenCalledWith('transaction', 'server-context', initialEstimateQuery);
    await initialWorkspaceEstimateReport('session-user', initialEstimateQuery.workspaceId);
    expect(mocks.initialEstimates).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialEstimateQuery.workspaceId, false, mocks.initialEstimates);
  });
  it('rejects malformed Estimates requests before authorization and propagates native denial', async () => {
    await expect(workspaceEstimateReport('session-user', { ...initialEstimateQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.estimates.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceEstimateReport('session-user', initialEstimateQuery)).rejects.toThrow('Unavailable');
  });
  it('binds Team reads and independent-domain initial selection to the unchanged permission boundary', async () => {
    await workspaceTeamReport('session-user', initialTeamQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialTeamQuery.workspaceId, false, expect.any(Function));
    expect(mocks.team).toHaveBeenCalledWith('transaction', 'server-context', initialTeamQuery);
    await initialWorkspaceTeamReport('session-user', initialTeamQuery.workspaceId);
    expect(mocks.initialTeam).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialTeamQuery.workspaceId, false, mocks.initialTeam);
  });
  it('rejects malformed Team input before authorization and propagates fresh native denial', async () => {
    await expect(workspaceTeamReport('session-user', { ...initialTeamQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.team.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceTeamReport('session-user', initialTeamQuery)).rejects.toThrow('Unavailable');
  });
  it('uses the standard current authorization boundary without overriding implemented permissions', async () => {
    await workspaceLeadReport('session-user', initialLeadReportQuery);
    expect(mocks.authorized).toHaveBeenCalledWith('session-user', initialLeadReportQuery.workspaceId, false, expect.any(Function));
    expect(mocks.read).toHaveBeenCalledWith('transaction', 'server-context', initialLeadReportQuery);
  });
  it('builds the initial rolling intake window from the native business-local clock, not the machine date', async () => {
    await initialWorkspaceLeadReport('session-user', initialLeadReportQuery.workspaceId);
    expect(mocks.read.mock.calls[0][2]).toMatchObject({ view: 'pipeline' });
    expect(mocks.read.mock.calls[1][2]).toMatchObject({ view: 'intake', period: { from: '2026-10-07', to: '2026-11-05' } });
  });
  it('rejects malformed requests before authorization and propagates access failures', async () => {
    await expect(workspaceLeadReport('session-user', { ...initialLeadReportQuery, workspaceId: 'bad' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.authorized.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceLeadReport('session-user', initialLeadReportQuery)).rejects.toThrow('Unavailable');
  });
  it('binds Sources and its native initial period to the unchanged implemented permission boundary', async () => {
    await workspaceLeadSourceReport('session-user', initialLeadSourceQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialLeadSourceQuery.workspaceId, false, expect.any(Function));
    expect(mocks.source).toHaveBeenCalledWith('transaction', 'server-context', initialLeadSourceQuery);
    await initialWorkspaceLeadSourceReport('session-user', initialLeadSourceQuery.workspaceId);
    expect(mocks.initialSource).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialLeadSourceQuery.workspaceId, false, mocks.initialSource);
  });
  it('rejects unsupported Sources controls before authorization and propagates denial', async () => {
    await expect(workspaceLeadSourceReport('session-user', { ...initialLeadSourceQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.authorized.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceLeadSourceReport('session-user', initialLeadSourceQuery)).rejects.toThrow('Unavailable');
  });
  it('binds Overview and its native initial clock to current session authorization without enabling permissions', async () => {
    await workspaceBusinessOverview('session-user', initialOverviewQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialOverviewQuery.workspaceId, false, expect.any(Function));
    expect(mocks.overview).toHaveBeenCalledWith('transaction', 'server-context', initialOverviewQuery);
    await initialWorkspaceBusinessOverview('session-user', initialOverviewQuery.workspaceId);
    expect(mocks.initialOverview).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialOverviewQuery.workspaceId, false, mocks.initialOverview);
  });
  it('rejects invalid Overview requests before authorization and propagates native access failure', async () => {
    await expect(workspaceBusinessOverview('session-user', { ...initialOverviewQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.authorized.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceBusinessOverview('session-user', initialOverviewQuery)).rejects.toThrow('Unavailable');
  });
  it('binds Calendar reads and the native initial week to the unchanged permission boundary', async () => {
    await workspaceCalendarReport('session-user', initialCalendarQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialCalendarQuery.workspaceId, false, expect.any(Function));
    expect(mocks.calendar).toHaveBeenCalledWith('transaction', 'server-context', initialCalendarQuery);
    await initialWorkspaceCalendarReport('session-user', initialCalendarQuery.workspaceId);
    expect(mocks.initialCalendar).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialCalendarQuery.workspaceId, false, mocks.initialCalendar);
  });
  it('rejects malformed Calendar input before authorization and propagates native denial', async () => {
    await expect(workspaceCalendarReport('session-user', { ...initialCalendarQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.authorized.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceCalendarReport('session-user', initialCalendarQuery)).rejects.toThrow('Unavailable');
  });
  it('binds Jobs and native initial-period orchestration to unchanged session authorization', async () => {
    await workspaceJobReport('session-user', initialJobQuery);
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialJobQuery.workspaceId, false, expect.any(Function));
    expect(mocks.jobs).toHaveBeenCalledWith('transaction', 'server-context', initialJobQuery);
    await initialWorkspaceJobReport('session-user', initialJobQuery.workspaceId);
    expect(mocks.initialJobs).toHaveBeenCalledWith('transaction', 'server-context');
    expect(mocks.authorized).toHaveBeenLastCalledWith('session-user', initialJobQuery.workspaceId, false, mocks.initialJobs);
  });
  it('rejects malformed Jobs controls before authorization and propagates native denial', async () => {
    await expect(workspaceJobReport('session-user', { ...initialJobQuery, workspaceId: 'invalid' })).rejects.toThrow();
    expect(mocks.authorized).not.toHaveBeenCalled();
    mocks.authorized.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(workspaceJobReport('session-user', initialJobQuery)).rejects.toThrow('Unavailable');
  });
});

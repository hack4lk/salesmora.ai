import 'server-only';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AuthorizationAccessError, listReportTemplatesInTransaction } from '@salesmora/data';
import { leadDetailQuerySchema, leadReportQuerySchema, jobReportQuerySchema, calendarReportQuerySchema } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { getSession } from '../auth/session';
import { auth } from '../auth/auth';
import { findWorkspace } from '../workspaces/store';
import { authorizedWorkspace, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { initialWorkspaceLeadReport, initialWorkspaceLeadSourceReport, initialWorkspaceBusinessOverview, initialWorkspaceCalendarReport, initialWorkspaceJobReport, initialWorkspaceTeamReport, initialWorkspaceEstimateReport, initialWorkspaceActivityReport, initialWorkspaceFinancialReport } from './store';
import { workspaceLeadReport, workspaceJobReport, workspaceCalendarReport } from './store';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { LeadReportRoute } from '../../features/reports/lead-report-workspace/lead-report-route';
import { LeadSourceRoute } from '../../features/reports/lead-source-report/lead-source-route';
import { BusinessOverviewRoute } from '../../features/reports/business-overview/business-overview-read-page';
import { CalendarReportRoute } from '../../features/reports/calendar-report-workspace/calendar-report-page';
import { JobReportRoute } from '../../features/reports/job-report-workspace/job-report-page';
import { TeamReportRoute } from '../../features/reports/team-report-workspace/team-report-page';
import { EstimateReportRoute } from '../../features/reports/estimate-report-workspace/estimate-report-page';
import { ActivityReportRoute } from '../../features/reports/activity-report/activity-report-page';
import { FinancialReportRoute } from '../../features/reports/financial-report/financial-report-page';
import { ReportAreaCatalogRoute } from '../../features/reports/report-area-catalog/report-area-catalog-route';
import { reportAreaDefinitions } from '../../features/reports/report-area-catalog/report-area-catalog.definitions';

async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
async function renderReportsPage(params: Record<string, string | string[] | undefined>,
  load: (userId: string, workspaceId: string) => Promise<ReactNode>, requiredSource: 'lead' | 'job' | 'calendar' | 'estimate' | 'financial' | null,
  allowQuery = false) {
  const session = await getSession();
  if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (params.workspace !== undefined && (!requested || !leadDetailQuerySchema.shape.workspaceId.safeParse(requested).success) ||
    Object.keys(params).some(key => key !== 'workspace' && !(allowQuery && key === 'query')) ||
    params.query !== undefined && (!allowQuery || typeof params.query !== 'string' || params.query.length > 16000)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    const reports = resolveAuthorizedCollectionScope(context, 'reports.read');
    if (!reports.allowed || (requiredSource === 'lead' || requiredSource === 'job') && !reports.sourceScopes?.[requiredSource]) notFound();
    if (requiredSource === 'estimate' && !resolveAuthorizedCollectionScope(context, 'estimates.read').allowed) notFound();
    if (requiredSource === 'financial' && !authorize(context, { permission: 'reports.financial.read' }).allowed) notFound();
    if (requiredSource === 'calendar' && (!resolveAuthorizedCollectionScope(context, 'calendar.read').allowed ||
      !resolveAuthorizedCollectionScope(context, 'jobs.read').allowed && !resolveAuthorizedCollectionScope(context, 'workorders.read').allowed)) notFound();
    const capabilities = workspaceCapabilities(context), content = await load(session.user.id, workspace.id);
    return <WorkspaceShell currentPage="reports" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }}
      authorizedPages={workspaceNavigationPages(context)} assistantAvailable={false} chatEnabled={false}
      jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions}
      ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing} contentWidth="full" onSignOut={signOut}>
      {content}
    </WorkspaceShell>;
  } catch (error) { if (error instanceof AuthorizationAccessError) notFound(); throw error; }
}
function reportPageQuery<T extends { workspaceId: string }>(raw: string | string[] | undefined, workspaceId: string,
  schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false } }): T | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') notFound();
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch (error) { if (error instanceof SyntaxError) notFound(); throw error; }
  const parsed = schema.safeParse(value);
  if (!parsed.success || parsed.data.workspaceId !== workspaceId) notFound();
  return parsed.data;
}
export function renderLeadReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) => {
    const query = reportPageQuery(params.query, workspaceId, leadReportQuerySchema);
    return <LeadReportRoute initial={query ? await workspaceLeadReport(userId, query) : await initialWorkspaceLeadReport(userId, workspaceId)} />;
  }, 'lead', true);
}
export function renderSourcesReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <LeadSourceRoute initial={await initialWorkspaceLeadSourceReport(userId, workspaceId)} />, 'lead');
}
export function renderBusinessOverviewPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <BusinessOverviewRoute initial={await initialWorkspaceBusinessOverview(userId, workspaceId)} />, null);
}
export function renderCalendarReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) => {
    const query = reportPageQuery(params.query, workspaceId, calendarReportQuerySchema);
    return <CalendarReportRoute initial={query ? await workspaceCalendarReport(userId, query) : await initialWorkspaceCalendarReport(userId, workspaceId)} />;
  }, 'calendar', true);
}
export function renderJobReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) => {
    const query = reportPageQuery(params.query, workspaceId, jobReportQuerySchema);
    return <JobReportRoute initial={query ? await workspaceJobReport(userId, query) : await initialWorkspaceJobReport(userId, workspaceId)} />;
  }, 'job', true);
}
export function renderTeamReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <TeamReportRoute initial={await initialWorkspaceTeamReport(userId, workspaceId)} />, null);
}
export function renderEstimateReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <EstimateReportRoute initial={await initialWorkspaceEstimateReport(userId, workspaceId)} />, 'estimate');
}
export function renderActivityReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <ActivityReportRoute initial={await initialWorkspaceActivityReport(userId, workspaceId)} />, null);
}
export function renderFinancialReportsPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) =>
    <FinancialReportRoute initial={await initialWorkspaceFinancialReport(userId, workspaceId)} />, 'financial');
}
export function renderReportCatalogPage(params: Record<string, string | string[] | undefined>) {
  return renderReportsPage(params, async (userId, workspaceId) => authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    const reports = resolveAuthorizedCollectionScope(context, 'reports.read');
    if (!reports.allowed || reports.resourceKind !== 'report') throw new AuthorizationAccessError();
    const calendar = resolveAuthorizedCollectionScope(context, 'calendar.read').allowed &&
      (resolveAuthorizedCollectionScope(context, 'jobs.read').allowed || resolveAuthorizedCollectionScope(context, 'workorders.read').allowed);
    const access = {
      overview: true, leads: !!reports.sourceScopes?.lead, sources: !!reports.sourceScopes?.lead,
      jobs: !!reports.sourceScopes?.job, team: !!reports.sourceScopes?.lead || !!reports.sourceScopes?.job,
      estimates: resolveAuthorizedCollectionScope(context, 'estimates.read').allowed,
      calendar, activity: true, financial: authorize(context, { permission: 'reports.financial.read' }).allowed,
    };
    const areas = await Promise.all(reportAreaDefinitions.map(async area => ({
      ...area, access: access[area.id]
        ? { allowed: true as const, templateCount: (await listReportTemplatesInTransaction(trx, context, area.id)).length }
        : { allowed: false as const, reason: 'The required report or underlying permission is unavailable.' },
    })));
    return <ReportAreaCatalogRoute workspaceId={workspaceId} areas={areas} />;
  }), null);
}

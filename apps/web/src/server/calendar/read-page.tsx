import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { calendarQueryFromURL, jobIdSchema, CalendarContractError } from '@salesmora/contracts';
import { AuthorizationAccessError, readCalendar, readCalendarVisit } from '@salesmora/data';
import { auth } from '../auth/auth';
import { getSession } from '../auth/session';
import { database, findWorkspace } from '../workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { CalendarRoute } from '../../features/calendar/calendar-page/calendar-route';
import { chatRuntimeAvailable } from '../chat/config';
async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
export async function renderCalendarPage(params: Record<string, string | string[] | undefined>) {
  const session = await getSession(); if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (params.workspace && (!requested || !jobIdSchema.safeParse(requested).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id), caps = workspaceCapabilities(context);
    if (!caps.readCalendar) notFound();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (typeof value === 'string') search.set(key, value);
    const identity = { userId: session.user.id, workspaceId: workspace.id };
    const initial = await readCalendar(database(), identity, enabledPermissions, calendarQueryFromURL(workspace.id, search));
    const initialVisit = search.has('visit') ? await readCalendarVisit(database(), identity, enabledPermissions, jobIdSchema.parse(search.get('visit'))) : undefined;
    return <WorkspaceShell currentPage="calendar" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)}
      jobNotificationsAvailable={caps.jobNotifications} permissionsAvailable={caps.permissions} ganttAvailable={caps.readGantt} billingAvailable={caps.billing} assistantAvailable={caps.assistant} chatEnabled={chatRuntimeAvailable()}
      chatSurface="calendar" contentWidth="full" onSignOut={signOut}>
      <CalendarRoute key={`calendar:${workspace.id}`} initial={initial} initialVisit={initialVisit}/>
    </WorkspaceShell>;
  } catch (error) { if (error instanceof AuthorizationAccessError || error instanceof CalendarContractError) notFound(); throw error; }
}

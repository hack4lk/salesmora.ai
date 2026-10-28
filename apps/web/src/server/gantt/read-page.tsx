import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { jobIdSchema } from '@salesmora/contracts';
import { AuthorizationAccessError, readGantt } from '@salesmora/data';
import { auth } from '../auth/auth';
import { getSession } from '../auth/session';
import { database, findWorkspace } from '../workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { GanttChart } from '../../features/gantt-chart/gantt-chart/gantt-chart';
import { chatRuntimeAvailable } from '../chat/config';
async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
export async function renderGanttPage(params: Record<string, string | string[] | undefined>) {
  const session = await getSession(); if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (params.workspace && (!requested || !jobIdSchema.safeParse(requested).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id), caps = workspaceCapabilities(context);
    if (!caps.readGantt) notFound();
    const gantt = await readGantt(database(), { userId: session.user.id, workspaceId: workspace.id }, enabledPermissions);
    return <WorkspaceShell currentPage="calendar" currentCalendarPage="gantt" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)}
      jobNotificationsAvailable={caps.jobNotifications} permissionsAvailable={caps.permissions} ganttAvailable={caps.readGantt} billingAvailable={caps.billing} assistantAvailable={caps.assistant} chatEnabled={chatRuntimeAvailable()}
      contentWidth="full" onSignOut={signOut}>
      <GanttChart key={`gantt:${workspace.id}`} jobs={gantt.jobs} teamMembers={gantt.teamMembers} customers={gantt.customers} today={gantt.today} truncated={gantt.truncated} workspaceId={workspace.id} />
    </WorkspaceShell>;
  } catch (error) { if (error instanceof AuthorizationAccessError) notFound(); throw error; }
}

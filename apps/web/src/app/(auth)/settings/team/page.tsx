import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthorizationAccessError, readTeamSettingsInTransaction } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace } from '../../../../server/workspaces/store';
import { authorizedWorkspace, workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { workspaceChatAvailable } from '../../../../server/chat/config';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { TeamSettingsRoute } from '../../../../features/settings/team-settings-page/team-settings-route';


export const metadata = { title: 'Team | SalesMora.ai' };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function TeamSettingsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const { context, initial } = await authorizedWorkspace(session.user.id, workspace.id, false, async (trx, context) => ({ context, initial: await readTeamSettingsInTransaction(trx, context) })).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  return <WorkspaceShell currentPage="settings" currentSettingsPage="team" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} onSignOut={signOut}
    authorizedPages={workspaceNavigationPages(context)} billingAvailable={capabilities.billing} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} assistantAvailable={capabilities.assistant} chatEnabled={await workspaceChatAvailable(workspace.id)} chatSurface="settings.overview" contentWidth="full">
    <TeamSettingsRoute key={`team-settings-${workspace.id}`} initial={initial} />
  </WorkspaceShell>;
}

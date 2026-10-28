import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthorizationAccessError, readJobNotificationSettings } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace, database } from '../../../../server/workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { chatRuntimeAvailable } from '../../../../server/chat/config';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { JobNotificationSettingsRoute } from '../../../../features/settings/job-notification-settings-page/job-notification-settings-route';
import { jobNotificationSettingsPageData as copy } from '../../../../features/settings/job-notification-settings-page/job-notification-settings-page.data';

export const metadata = { title: `${copy.title} settings | SalesMora.ai` };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function JobNotificationSettingsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const identity = { userId: session.user.id, workspaceId: workspace.id };
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const initial = await readJobNotificationSettings(database(), identity, enabledPermissions).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  return <WorkspaceShell currentPage="settings" currentSettingsPage="job-notifications" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} onSignOut={signOut}
    authorizedPages={workspaceNavigationPages(context)} billingAvailable={capabilities.billing} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} assistantAvailable={capabilities.assistant} chatEnabled={chatRuntimeAvailable()} chatSurface="settings.overview" contentWidth="full">
    <JobNotificationSettingsRoute key={`job-notifications-${workspace.id}`} workspaceId={workspace.id} initial={initial} />
  </WorkspaceShell>;
}

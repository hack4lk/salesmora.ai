import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthorizationAccessError } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace } from '../../../../server/workspaces/store';
import { workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { chatRuntimeAvailable } from '../../../../server/chat/config';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { authorize } from '@salesmora/domain';
import { AccountRoute } from '../../../../features/settings/account-page/account-route';
import { accountPageData as copy } from '../../../../features/settings/account-page/account-page.data';

export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function AccountSettingsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  const user = { name: session.user.name, email: session.user.email, role: context.membership.role };
  return <WorkspaceShell currentPage="settings" currentSettingsPage="account" workspaceId={workspace.id} workspaceName={workspace.businessName} user={user} onSignOut={signOut} authorizedPages={workspaceNavigationPages(context)} billingAvailable={capabilities.billing} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} assistantAvailable={capabilities.assistant} chatEnabled={chatRuntimeAvailable()} chatSurface="settings.overview" contentWidth="full">
    <AccountRoute workspaceId={workspace.id} deletionAllowed={context.membership.role !== 'owner' || authorize(context, { permission: 'workspace.delete' }).allowed} viewerRole={user.role} account={{ name: user.name, email: user.email, workspace: workspace.businessName }} settingsHref={`/settings?workspace=${encodeURIComponent(workspace.id)}`} billingHref={`/settings/billing?workspace=${encodeURIComponent(workspace.id)}`} />
  </WorkspaceShell>;
}

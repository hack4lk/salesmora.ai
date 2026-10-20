import { chatRuntimeAvailable } from '../../../../server/chat/config';
import { AuthorizationAccessError } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace } from '../../../../server/workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { PermissionsRoute } from '../../../../features/settings/permissions-page/permissions-route';
import { permissionsRouteData as copy } from '../../../../features/settings/permissions-page/permissions-route.data';

export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function PermissionsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  if (!capabilities.permissions) notFound();
  return <WorkspaceShell chatEnabled={chatRuntimeAvailable()} chatSurface="settings.permissions" currentPage="settings" currentSettingsPage="permissions" billingAvailable={capabilities.billing} permissionsAvailable={capabilities.permissions} authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} contentWidth="full" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} onSignOut={signOut}>
    <PermissionsRoute email={session.user.email} userId={session.user.id} workspaceName={workspace.businessName} viewerRole={context.membership.role} policy={context.policy} defaultPolicy={createDefaultWorkspacePolicy(workspace.id)} availablePermissions={enabledPermissions} />
  </WorkspaceShell>;
}

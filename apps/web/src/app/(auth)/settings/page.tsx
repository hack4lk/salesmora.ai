import { chatRuntimeAvailable } from '../../../server/chat/config';
import { AuthorizationAccessError } from '@salesmora/data';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '../../../server/auth/session';
import { auth } from '../../../server/auth/auth';
import { findWorkspace } from '../../../server/workspaces/store';
import { workspaceSettings } from '../../../server/workspaces/settings';
import { workspaceCapabilities, workspaceNavigationPages } from '../../../server/authorization/permissions';
import { WorkspaceShell } from '../../../features/workspace/workspace-shell/workspace-shell';
import { SettingsOverview } from '../../../features/settings/settings-overview/settings-overview';
import { settingsOverviewData as copy } from '../../../features/settings/settings-overview/settings-overview.data';

export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const { context, profile } = await workspaceSettings(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) redirect(`/settings/account?workspace=${encodeURIComponent(workspace.id)}`); throw error; });
  const capabilities = workspaceCapabilities(context);
  return <WorkspaceShell chatEnabled={chatRuntimeAvailable()} chatSurface="settings.overview" currentPage="settings" billingAvailable={capabilities.billing} permissionsAvailable={capabilities.permissions} authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} contentWidth="full" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} onSignOut={signOut}>
    <SettingsOverview accountHref={`/settings/account?workspace=${encodeURIComponent(workspace.id)}`} billingHref={capabilities.billing ? `/settings/billing?workspace=${encodeURIComponent(workspace.id)}` : undefined} aiUsageHref={context.membership.role === 'owner' ? `/settings/ai-usage?workspace=${encodeURIComponent(workspace.id)}` : undefined} workspaceName={workspace.businessName} profile={profile} workOrdersHref={profile ? `/settings/work-orders?workspace=${encodeURIComponent(workspace.id)}` : undefined} permissionsHref={capabilities.permissions ? `/settings/permissions?workspace=${encodeURIComponent(workspace.id)}` : undefined} />
  </WorkspaceShell>;
}

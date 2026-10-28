import { chatRuntimeAvailable } from '../../../../server/chat/config';
import { AuthorizationAccessError } from '@salesmora/data';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace } from '../../../../server/workspaces/store';
import { workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { AIUsageRoute } from '../../../../features/settings/ai-usage-page/ai-usage-route';
import { readWorkspaceAIUsage } from '../../../../server/workspaces/ai-usage';
import { aiUsageRouteData as copy } from '../../../../features/settings/ai-usage-page/ai-usage-route.data';

export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function AIUsageSettingsPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const { context, usage } = await readWorkspaceAIUsage(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  return <WorkspaceShell chatEnabled={chatRuntimeAvailable()} chatSurface="settings.overview" currentPage="settings" currentSettingsPage="ai-usage" billingAvailable={capabilities.billing} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} contentWidth="full" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} onSignOut={signOut}>
    <AIUsageRoute key={`${workspace.id}:${usage.usedOrReservedTokens}:${usage.monthlyTokens}:${usage.resetAt}`} workspaceId={workspace.id} workspaceName={workspace.businessName} initialUsage={usage}/>
  </WorkspaceShell>;
}

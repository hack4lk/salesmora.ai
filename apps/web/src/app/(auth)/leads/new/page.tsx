import { chatRuntimeAvailable } from '../../../../server/chat/config';
import { AuthorizationAccessError } from '@salesmora/data';
import { authorize } from '@salesmora/domain';
import { workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../../../../server/authorization/permissions';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '../../../../server/auth/session';
import { auth } from '../../../../server/auth/auth';
import { findWorkspace } from '../../../../server/workspaces/store';
import { leadOwners, LeadAccessError } from '../../../../server/leads/store';
import { WorkspaceShell } from '../../../../features/workspace/workspace-shell/workspace-shell';
import { CreateLeadRoute } from '../../../../features/leads/create-lead-form/create-lead-route';
import { createLeadRouteData as copy } from '../../../../features/leads/create-lead-form/create-lead-route.data';
export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
export default async function CreateLeadPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) { if (workspaceId) notFound(); redirect('/setup'); }
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  if (!authorize(context, { permission: 'leads.create' }).allowed) notFound();
  const capabilities = workspaceCapabilities(context);
  const owners = await leadOwners(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError || error instanceof LeadAccessError) notFound(); throw error; });
  return <WorkspaceShell chatEnabled={chatRuntimeAvailable()} chatSurface="leads.create" billingAvailable={capabilities.billing} permissionsAvailable={capabilities.permissions} authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} currentPage="leads" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} title={copy.title} description={copy.description} onSignOut={signOut}>
    <CreateLeadRoute workspaceId={workspace.id} owners={owners} />
  </WorkspaceShell>;
}

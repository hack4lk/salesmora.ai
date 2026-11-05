import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { captureIdSchema, intakeQuerySchema } from '@salesmora/contracts';
import { AuthorizationAccessError } from '@salesmora/data';
import { listIntakeItems, readIntakeItem } from '@salesmora/data/lead-capture/intake-store';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { auth } from '../auth/auth';
import { getSession } from '../auth/session';
import { database, findWorkspace } from '../workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { IntakeListRoute, IntakeDetailRoute } from '../../features/lead-capture/connected/intake-routes';
import type { CaptureSearchParams } from './read-page';
async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
export async function renderIntakePage(params: CaptureSearchParams, intakeId?: string) {
  const session = await getSession(); if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (Object.values(params).some(Array.isArray) || params.workspace && !captureIdSchema.safeParse(requested).success || intakeId && !captureIdSchema.safeParse(intakeId).success) notFound();
  const workspace = await findWorkspace(session.user.id, requested); if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  try {
    const identity = { userId: session.user.id, workspaceId: workspace.id }, context = await workspaceAuthorization(session.user.id, workspace.id), capabilities = workspaceCapabilities(context);
    if (!resolveAuthorizedCollectionScope(context, 'intake.read').allowed) notFound();
    const parsed = intakeQuerySchema.safeParse({ workspaceId: workspace.id, search: params.search, sourceId: params.sourceId, status: params.status, flag: params.flag, page: params.page === undefined ? 1 : Number(params.page), pageSize: params.pageSize === undefined ? 25 : Number(params.pageSize) });
    if (!parsed.success) notFound();
    const content = intakeId ? <IntakeDetailRoute key={intakeId} initial={await readIntakeItem(database(), identity, enabledPermissions, { workspaceId: workspace.id, intakeId })} /> : <IntakeListRoute key={JSON.stringify(parsed.data)} query={parsed.data} initial={await listIntakeItems(database(), identity, enabledPermissions, parsed.data)} />;
    return <WorkspaceShell currentPage="intake" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing} contentWidth="full" onSignOut={signOut}>{content}</WorkspaceShell>;
  } catch (error) { if (error instanceof AuthorizationAccessError) notFound(); throw error; }
}

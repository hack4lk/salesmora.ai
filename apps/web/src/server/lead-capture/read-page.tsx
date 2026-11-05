import { workspaceChatAvailable } from '../chat/config';
import type { CaptureAssistantContext } from '@salesmora/contracts';
import { CaptureAssistantPageContext } from '../../features/lead-capture/connected/capture-assistant-context';
import { captureDeliveryAuthority } from './delivery';
import { captureInstallationOrigin } from './submission-policy';
import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { captureIdSchema, captureSourceListQuerySchema } from '@salesmora/contracts';
import { AuthorizationAccessError, captureDraftStartContext, listCaptureSources, readCaptureSource } from '@salesmora/data';
import { auth } from '../auth/auth';
import { getSession } from '../auth/session';
import { database, findWorkspace } from '../workspaces/store';
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { CaptureListRoute, CaptureNewRoute, CaptureDetailRoute } from '../../features/lead-capture/connected/capture-routes';
import { CaptureWizardRoute } from '../../features/lead-capture/connected/capture-wizard-route';
export type CaptureSearchParams = Record<string, string | string[] | undefined>;
async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
export async function renderCapturePage(params: CaptureSearchParams, mode: 'list' | 'new' | 'detail' | 'setup', sourceId?: string) {
  const session = await getSession(); if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (params.workspace && (!requested || !captureIdSchema.safeParse(requested).success) || sourceId && !captureIdSchema.safeParse(sourceId).success) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  try {
    const identity = { userId: session.user.id, workspaceId: workspace.id };
    const context = await workspaceAuthorization(session.user.id, workspace.id), capabilities = workspaceCapabilities(context);
    if (!capabilities.readCaptureSources) notFound();
    let content;
    let captureContext: CaptureAssistantContext = mode === 'new' ? { surface: 'lead_capture.new' } : sourceId ? { surface: mode === 'setup' ? 'lead_capture.setup' : 'lead_capture.detail', sourceId } : { surface: 'lead_capture.list', filters: { search: '', archived: false } };
    if (mode === 'new') content = <CaptureNewRoute initial={await captureDraftStartContext(database(), identity, enabledPermissions)} />;
    else if (sourceId) {
      const initial = await readCaptureSource(database(), identity, enabledPermissions, { workspaceId: workspace.id, sourceId }, captureInstallationOrigin(process.env, identity.workspaceId), captureDeliveryAuthority());
      content = mode === 'setup' ? <CaptureWizardRoute key={sourceId} initial={initial} /> : <CaptureDetailRoute key={`${sourceId}-${initial.detail.source.version}`} initial={initial} />;
    } else {
      const parsed = captureSourceListQuerySchema.safeParse({ workspaceId: workspace.id, search: params.search, type: params.type, status: params.status, archived: params.archived === undefined ? false : params.archived === 'true' ? true : params.archived === 'false' ? false : null, page: params.page === undefined ? 1 : Number(params.page), pageSize: params.pageSize === undefined ? 25 : Number(params.pageSize) });
      if (!parsed.success || Object.values(params).some(value => Array.isArray(value))) notFound();
      const filters = { search: parsed.data.search, archived: parsed.data.archived, ...(parsed.data.type ? { type: parsed.data.type } : {}), ...(parsed.data.status ? { status: parsed.data.status } : {}) };
      captureContext = { surface: 'lead_capture.list', filters };
      content = <CaptureListRoute key={JSON.stringify(parsed.data)} initial={await listCaptureSources(database(), identity, enabledPermissions, parsed.data)} query={parsed.data} />;
    }
    return <WorkspaceShell assistantAvailable={capabilities.assistant} chatEnabled={await workspaceChatAvailable(workspace.id)} chatSurface={captureContext.surface as "lead_capture.list" | "lead_capture.new" | "lead_capture.setup" | "lead_capture.detail"} chatContext={{ key: JSON.stringify(captureContext), label: sourceId ? "Selected capture source" : "Lead Capture", captureContext }} currentPage="campaigns" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing} contentWidth="full" onSignOut={signOut}><CaptureAssistantPageContext context={captureContext} />{content}</WorkspaceShell>;
  } catch (error) { if (error instanceof AuthorizationAccessError) notFound(); throw error; }
}

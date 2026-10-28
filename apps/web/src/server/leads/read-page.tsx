import 'server-only';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthorizationAccessError } from '@salesmora/data';
import { leadDetailQuerySchema, leadQueryFromURL, type LeadListResult, type LeadDetailResult } from '@salesmora/contracts';
import { auth } from '../auth/auth';
import { getSession } from '../auth/session';
import { findWorkspace } from '../workspaces/store';
import { workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../authorization/permissions';
import { workspaceLeads, workspaceLead } from './read';
import { chatRuntimeAvailable } from '../chat/config';
import { WorkspaceShell } from '../../features/workspace/workspace-shell/workspace-shell';
import { leadAssistantContext } from '../../features/leads/leads-page/lead-assistant-context';
import { LeadsReadRoute } from '../../features/leads/leads-page/leads-read-route';
export type LeadSearchParams = Record<string, string | string[] | undefined>;
async function signOut() { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/login'); }
export async function renderLeadsPage(params: LeadSearchParams, leadId?: string) {
  const session = await getSession(); if (!session) redirect('/login');
  const requested = typeof params.workspace === 'string' ? params.workspace : undefined;
  if (params.workspace && (!requested || !leadDetailQuerySchema.shape.workspaceId.safeParse(requested).success) || leadId && !leadDetailQuerySchema.shape.leadId.safeParse(leadId).success) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect('/setup'); }
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context); if (!capabilities.readLeads) notFound();
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) urlParams.append(key, item);
  const query = { ...leadQueryFromURL(workspace.id, urlParams), column: undefined, columnPage: 1 };
  let initial: LeadListResult, detail: LeadDetailResult | undefined;
  try {
    if (leadId) { detail = await workspaceLead(session.user.id, workspace.id, leadId); initial = { rows: [], total: 0, columns: [], page: 1, pageSize: query.pageSize, owners: detail.owners, canAssign: detail.canAssign, canExport: detail.canExport, exportScope: detail.exportScope, timezone: detail.timezone, scope: detail.scope, canCreate: detail.canCreate, canShowArchived: detail.canShowArchived, policyRevision: detail.policyRevision }; }
    else initial = await workspaceLeads(session.user.id, query);
  } catch (error) { if (error instanceof AuthorizationAccessError) notFound(); throw error; }
  return <WorkspaceShell currentPage="leads" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{ name: session.user.name, email: session.user.email, role: context.membership.role }}
    authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} chatEnabled={chatRuntimeAvailable()} chatSurface={leadId ? 'lead.detail' : 'leads.list'} chatContext={leadAssistantContext(query, detail?.lead)} jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing} contentWidth="full" onSignOut={signOut}>
    <LeadsReadRoute key={`${workspace.id}-${leadId ?? 'list'}-${detail?.lead.version ?? 0}-${detail?.activityTotal ?? 0}`} workspaceId={workspace.id} viewerId={session.user.id} initial={initial} initialDetail={detail} initialQuery={query}/>
  </WorkspaceShell>;
}

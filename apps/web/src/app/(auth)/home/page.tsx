import { chatRuntimeAvailable } from '../../../server/chat/config';
import { AuthorizationAccessError } from '@salesmora/data';
import { workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from '../../../server/authorization/permissions';
import { workspaceLeadPipelineCounts } from '../../../server/leads/store';
import { LeadPipelineWidget } from '../../../features/workspace/lead-pipeline-widget/lead-pipeline-widget';
import { revalidatePath } from 'next/cache';
import { safelyDeliverOwnerInvitations } from '../../../server/invitations/store';
import { EmailVerificationRoute } from '../../../features/auth/email-verification-notice/email-verification-route';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { SubmitButton } from '@salesmora/ui';
import { getSession } from '../../../server/auth/session';
import { auth } from '../../../server/auth/auth';
import { findWorkspace, workspaceSummary } from '../../../server/workspaces/store';
import { onboardingFlowData as flowCopy } from '../../../features/onboarding/onboarding-flow/onboarding-flow.data';
import { HomeOverview } from '../../../features/workspace/home-overview/home-overview';
import { WorkspaceShell } from '../../../features/workspace/workspace-shell/workspace-shell';
const copy = flowCopy.home;
export const metadata = { title: copy.documentTitle };
async function signOut() {
  'use server';
  await auth.api.signOut({ headers: await headers() });
  redirect('/login');
}
async function retryInvitations() {
  'use server';
  const session = await getSession();
  if (!session) redirect('/login');
  await safelyDeliverOwnerInvitations(session.user.id);
  revalidatePath('/home');
}
export default async function HomePage({ searchParams }: { searchParams: Promise<{workspace?:string}> }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) redirect('/home');
  const workspace = await findWorkspace(session.user.id,workspaceId);
  if (!workspace) redirect(workspaceId?'/home':'/setup');
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(error => { if (error instanceof AuthorizationAccessError) notFound(); throw error; });
  const capabilities = workspaceCapabilities(context);
  if (!capabilities.home) notFound();
  const isOwner = workspace.ownerId === session.user.id;
  const summary = isOwner && capabilities.inviteField ? await workspaceSummary(session.user.id, workspace.id) : { invitations: [] };
  const pipelineCounts = capabilities.readLeads ? await workspaceLeadPipelineCounts(session.user.id, workspace.id) : null;
  const hasLeads = Object.values(pipelineCounts ?? {}).some(count => count > 0);
  return <WorkspaceShell chatEnabled={chatRuntimeAvailable()} chatSurface="home" billingAvailable={capabilities.billing} permissionsAvailable={capabilities.permissions} authorizedPages={workspaceNavigationPages(context)} assistantAvailable={capabilities.assistant} contentWidth="full" workspaceId={workspace.id} workspaceName={workspace.businessName} user={{name:session.user.name,email:session.user.email,role:context.membership.role}} onSignOut={signOut}>
    {/* Campaign and activity storage are not implemented yet. Lead existence is scoped to this workspace. */}
    <HomeOverview headingLevel={1} userName={session.user.name} workspaceName={workspace.businessName} role={context.membership.role} canCreateLead={capabilities.createLead} canCreateCampaign={false} createLeadHref={`/leads/new?workspace=${encodeURIComponent(workspace.id)}`} activity={{hasLeads,hasCampaigns:false,hasActivity:false}} entry={isOwner?'created':'joined'} />
    {hasLeads && pipelineCounts && <div className="mt-6"><LeadPipelineWidget counts={pipelineCounts} pipelineHref={`/leads?workspace=${encodeURIComponent(workspace.id)}`} /></div>}
    {isOwner && summary.invitations.length > 0 && <p className="mt-4 text-sm leading-6 text-muted">{session.user.emailVerified ? copy.delivery : copy.verification}</p>}
    {isOwner && session.user.emailVerified && summary.invitations.some(row => ['queued','pending_verification'].includes(row.status)) && <form action={retryInvitations} className="mt-4 grid gap-3"><p className="m-0 text-sm leading-6 text-muted">{copy.retryNote}</p><SubmitButton label={copy.retryInvitations} /></form>}
    {!session.user.emailVerified && <div className="mt-6"><EmailVerificationRoute email={session.user.email} verified={false} /></div>}
  </WorkspaceShell>;
}

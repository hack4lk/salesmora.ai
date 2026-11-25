import { availableWorkflowRecipes } from "@salesmora/domain";
import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { serviceDuePageSchema,cancellationOpeningResultSchema,workOrderIdSchema, workflowBriefingSchema, workflowListSchema } from "@salesmora/contracts";
import { readServiceDueInTransaction,readCancellationOpeningInTransaction, AuthorizationAccessError, readWorkflowsInTransaction, readWorkflowBriefingInTransaction } from "@salesmora/data";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { WorkflowBriefingRoute } from "../../features/workflows/workflow-briefing-route";
import {WorkflowServiceDueRoute} from "../../features/workflows/workflow-service-due/workflow-service-due-route";
import {WorkflowCancellationOpeningRoute} from "../../features/workflows/workflow-cancellation-opening/workflow-cancellation-opening-route";
import { WorkflowsRoute } from "../../features/workflows/workflows-route";
import { workspaceChatAvailable } from "../chat/config";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import { authorizedWorkspace, workspaceCapabilities, workspaceNavigationPages } from "../authorization/permissions";
import { findWorkspace } from "../workspaces/store";

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function renderWorkflowsPage(params: Record<string, string | string[] | undefined>, briefingId?: string, openingId?:string,serviceWorkflowId?:string) {
  if(serviceWorkflowId&&!workOrderIdSchema.safeParse(serviceWorkflowId).success)notFound();
  if(openingId&&!workOrderIdSchema.safeParse(openingId).success)notFound();
  if (briefingId && !workOrderIdSchema.safeParse(briefingId).success) notFound();
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = typeof params.workspace === "string" ? params.workspace : undefined;
  if (params.workspace && (!requested || !workOrderIdSchema.safeParse(requested).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) {
    if (requested) notFound();
    redirect("/setup");
  }

  try {
    const { context, initial } = await authorizedWorkspace(session.user.id, workspace.id, false, async (trx, context) => ({
      context,
      initial: serviceWorkflowId?await readServiceDueInTransaction(trx,context,serviceWorkflowId):openingId?await readCancellationOpeningInTransaction(trx,context,openingId):briefingId ? await readWorkflowBriefingInTransaction(trx, context, briefingId) : await readWorkflowsInTransaction(trx, context),
    }));
    const capabilities = workspaceCapabilities(context);
    const chatEnabled = await workspaceChatAvailable(workspace.id);
    if (!briefingId && !openingId && !serviceWorkflowId && !capabilities.readWorkflows) notFound();
    return (
      <WorkspaceShell currentPage="workflows" workspaceId={workspace.id} workspaceName={workspace.businessName}
        user={{ name: session.user.name, email: session.user.email, role: context.membership.role }}
        authorizedPages={workspaceNavigationPages(context)}
        jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions}
        ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing}
        assistantAvailable={(availableWorkflowRecipes(context).length > 0)} chatEnabled={chatEnabled} chatSurface="workflows.list" workflowRecipes={availableWorkflowRecipes(context)} onSignOut={signOut}>
        {serviceWorkflowId?<WorkflowServiceDueRoute viewerId={session.user.id} workspaceId={workspace.id} initial={serviceDuePageSchema.parse(initial)} initialUpdatedAt={Date.now()} canGenerate={chatEnabled&&capabilities.assistant}/>:openingId?<WorkflowCancellationOpeningRoute viewerId={session.user.id} workspaceId={workspace.id} initial={cancellationOpeningResultSchema.parse(initial)} initialUpdatedAt={Date.now()}/>:briefingId ? <WorkflowBriefingRoute viewerId={session.user.id} workspaceId={workspace.id} initial={workflowBriefingSchema.parse(initial)} initialUpdatedAt={Date.now()} /> : <WorkflowsRoute viewerId={session.user.id} workspaceId={workspace.id} initial={workflowListSchema.parse(initial)} initialUpdatedAt={Date.now()} assistantEnabled={chatEnabled && (availableWorkflowRecipes(context).length > 0)} />}
      </WorkspaceShell>
    );
  } catch (error) {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  }
}

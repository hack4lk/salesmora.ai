import "server-only";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { estimateIdSchema } from "@salesmora/contracts";
import type { ChatSurfaceKey } from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  EstimateDraftConflictError,
  estimateCreationAvailability,
  readEstimateCreationSeed,
  readEstimateEditor,
  readEstimateSharingReview,
  readEstimateCustomerSources,
  readEstimateChatDraftEditor,
  type EstimateEditorSeed,
} from "@salesmora/data";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import {
  enabledPermissions,
  workspaceAuthorization,
  workspaceCapabilities,
  workspaceNavigationPages,
} from "../authorization/permissions";
import { database, findWorkspace } from "../workspaces/store";
import { EstimateEditorRoute } from "../../features/estimates/estimate-editor-page/estimate-editor-route";
import { EstimateParentPicker } from "../../features/estimates/estimate-parent-picker/estimate-parent-picker";
import { EstimateDraftPreviewPage } from "../../features/estimates/estimate-draft-preview-page/estimate-draft-preview-page";
import { estimateDraftPaperSource } from "../../features/estimates/estimate-draft-preview-page/estimate-draft-preview-page.preview";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { staffEstimatePaper } from "./sharing";
import { chatRuntimeAvailable } from "../chat/config";
import type { AssistantPageContext } from "../../features/assistant/workspace-assistant/workspace-assistant";
import { EstimateDraftProposalEditor } from "../../features/assistant/estimate-result/estimate-draft-editor";

export type EstimateEditorSearchParams = Record<string, string | string[] | undefined>;

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

async function authorizedPage(params: EstimateEditorSearchParams) {
  const session = await getSession();
  if (!session) redirect("/login");
  const rawWorkspace = params.workspace;
  const workspaceId = typeof rawWorkspace === "string" ? rawWorkspace : undefined;
  if (
    rawWorkspace !== undefined &&
    (typeof rawWorkspace !== "string" || !estimateIdSchema.safeParse(rawWorkspace).success)
  ) {
    notFound();
  }
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) {
    if (workspaceId) notFound();
    redirect("/setup");
  }
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  const capabilities = workspaceCapabilities(context);
  if (!capabilities.readEstimates) notFound();
  return { session, workspace, context, capabilities };
}

function shell(
  page: Awaited<ReturnType<typeof authorizedPage>>,
  children: ReactNode,
  printChromeHidden = false,
  chatSurface: ChatSurfaceKey = "estimate.editor",
  chatContext?: AssistantPageContext,
) {
  const { session, workspace, context, capabilities } = page;
  return (
    <WorkspaceShell
      currentPage="estimates"
      workspaceId={workspace.id}
      workspaceName={workspace.businessName}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: context.membership.role,
      }}
      title={printChromeHidden ? undefined : "Estimates"}
      description={printChromeHidden ? undefined : "Review scope, pricing and customer decisions across your leads and jobs."}
      authorizedPages={workspaceNavigationPages(context)}
      assistantAvailable={capabilities.assistant && !printChromeHidden}
      chatEnabled={chatRuntimeAvailable()}
      chatSurface={chatSurface}
      chatContext={chatContext}
      jobNotificationsAvailable={capabilities.jobNotifications}
      permissionsAvailable={capabilities.permissions}
      ganttAvailable={capabilities.readGantt}
      billingAvailable={capabilities.billing}
      contentWidth="full"
      printChromeHidden={printChromeHidden}
      onSignOut={signOut}
    >
      {children}
    </WorkspaceShell>
  );
}

export async function renderNewEstimatePage(params: EstimateEditorSearchParams) {
  const page = await authorizedPage(params);
  if (params.proposal !== undefined) return renderProposalEditor(page, params, null);
  const { session, workspace, capabilities } = page;
  const leadId = params.leadId;
  const jobId = params.jobId;
  const customerId = params.customerId;
  if (
    (leadId !== undefined && typeof leadId !== "string") ||
    (jobId !== undefined && typeof jobId !== "string") ||
    (leadId !== undefined && jobId !== undefined) ||
    (customerId !== undefined && (typeof customerId !== "string" || !estimateIdSchema.safeParse(customerId).success))
  ) {
    notFound();
  }
  const parentId = leadId ?? jobId;
  if (!parentId) {
    if (typeof customerId === "string") {
      const sources = await readEstimateCustomerSources(database(),
        { userId: session.user.id, workspaceId: workspace.id }, enabledPermissions, customerId,
      ).catch((error) => {
        if (error instanceof AuthorizationAccessError) notFound();
        throw error;
      });
      return shell(page, <EstimateParentPicker key={`${workspace.id}:${customerId}`} workspaceId={workspace.id}
        customerId={customerId} {...sources} />);
    }
    const creation = await estimateCreationAvailability(
      database(),
      { userId: session.user.id, workspaceId: workspace.id },
      enabledPermissions,
    );
    return shell(
      page,
      <EstimateParentPicker
        workspaceId={workspace.id}
        canReadLeads={capabilities.readLeads && creation.workspace}
        canReadJobs={capabilities.readJobs && (creation.workspace || creation.assignedJob)}
      />,
    );
  }
  if (!estimateIdSchema.safeParse(parentId).success) notFound();
  const parentType = leadId ? "lead" : "job";
  const seed: EstimateEditorSeed = await readEstimateCreationSeed(
    database(),
    { userId: session.user.id, workspaceId: workspace.id },
    enabledPermissions,
    parentType,
    parentId,
    typeof customerId === "string" ? customerId : undefined,
  ).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  return shell(
    page,
    <EstimateEditorRoute
      key={`${workspace.id}:new:${parentType}:${parentId}`}
      workspaceId={workspace.id}
      currentUserId={session.user.id}
      seed={seed}
    />,
  );
}

export async function renderEstimateDetailPage(
  estimateId: string,
  params: EstimateEditorSearchParams,
) {
  if (!estimateIdSchema.safeParse(estimateId).success) notFound();
  const page = await authorizedPage(params);
  if (params.proposal !== undefined) return renderProposalEditor(page, params, estimateId);
  const { session, workspace } = page;
  const seed: EstimateEditorSeed = await readEstimateEditor(
    database(),
    { userId: session.user.id, workspaceId: workspace.id },
    enabledPermissions,
    estimateId,
  ).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  return shell(
    page,
    <EstimateEditorRoute
      key={`${workspace.id}:${estimateId}:${seed.estimate?.version ?? 0}`}
      initialReview={params.review === "1" && seed.estimate?.status === "draft"}
      workspaceId={workspace.id}
      currentUserId={session.user.id}
      seed={seed}
    />,
    false,
    "estimate.detail",
    {
      key: `estimate:${workspace.id}:${estimateId}`,
      label: `Estimate ${seed.estimate?.number ?? estimateId}`,
      recordRefs: [{ type: "estimate", id: estimateId }],
    },
  );
}

async function renderProposalEditor(
  page: Awaited<ReturnType<typeof authorizedPage>>, params: EstimateEditorSearchParams, estimateId: string | null,
) {
  if (typeof params.proposal !== "string" || !estimateIdSchema.safeParse(params.proposal).success) notFound();
  const result = await readEstimateChatDraftEditor(database(), {
    userId: page.session.user.id, workspaceId: page.workspace.id,
  }, enabledPermissions, params.proposal).catch(error => {
    if (error instanceof AuthorizationAccessError || error instanceof EstimateDraftConflictError) notFound();
    throw error;
  });
  const draft = result.view.draft;
  if ((draft.actionType === "estimate.update" ? draft.estimate.id : null) !== estimateId) notFound();
  return shell(page, <EstimateDraftProposalEditor
    key={draft.id} workspaceId={page.workspace.id} initial={result.view}
    seed={{ timezone: result.seed.timezone, paymentPresets: result.seed.paymentPresets }}
    initialReviewed={params.review === "1"} />);
}

export async function renderEstimatePreviewPage(
  estimateId: string,
  params: EstimateEditorSearchParams,
) {
  if (!estimateIdSchema.safeParse(estimateId).success) notFound();
  const page = await authorizedPage(params);
  const { session, workspace } = page;
  const seed: EstimateEditorSeed = await readEstimateEditor(
    database(),
    { userId: session.user.id, workspaceId: workspace.id },
    enabledPermissions,
    estimateId,
  ).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  const sharing = seed.estimate?.status !== "draft"
    ? await readEstimateSharingReview(
      database(), { userId: session.user.id, workspaceId: workspace.id }, enabledPermissions, estimateId,
    ).catch(error => {
      if (error instanceof AuthorizationAccessError) notFound();
      throw error;
    })
    : null;
  const source = sharing?.paper ? staffEstimatePaper(sharing.paper) : estimateDraftPaperSource(seed);
  if (!source) notFound();
  const query = `?workspace=${encodeURIComponent(workspace.id)}`;
  return shell(
    page,
    <EstimateDraftPreviewPage
      source={source}
      backHref={`/estimates/${encodeURIComponent(estimateId)}${query}`}
    />,
    true,
  );
}

import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  estimateListQueryFromURL,
  estimateListQuerySchema,
} from "@salesmora/contracts";
import { AuthorizationAccessError } from "@salesmora/data";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import {
  workspaceAuthorization,
  workspaceCapabilities,
  workspaceNavigationPages,
} from "../authorization/permissions";
import { findWorkspace } from "../workspaces/store";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { estimatesPageData as copy } from "../../features/estimates/estimates-page/estimates-page.data";
import { EstimatesReadRoute } from "../../features/estimates/estimates-page/estimates-read-route";
import { chatRuntimeAvailable } from "../chat/config";

export type EstimateSearchParams = Record<
  string,
  string | string[] | undefined
>;

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function renderEstimatesPage(params: EstimateSearchParams) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested =
    typeof params.workspace === "string" ? params.workspace : undefined;
  if (
    params.workspace &&
    (!requested ||
      !estimateListQuerySchema.shape.workspaceId.safeParse(requested).success)
  ) {
    notFound();
  }
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) {
    if (requested) notFound();
    redirect("/setup");
  }

  const context = await workspaceAuthorization(session.user.id, workspace.id).catch(
    (error) => {
      if (error instanceof AuthorizationAccessError) notFound();
      throw error;
    },
  );
  const capabilities = workspaceCapabilities(context);
  if (!capabilities.readEstimates) notFound();

  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value]) {
      urlParams.append(key, item);
    }
  }
  const query = estimateListQueryFromURL(workspace.id, urlParams);

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
      title={copy.title}
      description={
        context.membership.role === "field"
          ? copy.fieldDescription
          : copy.description
      }
      authorizedPages={workspaceNavigationPages(context)}
      assistantAvailable={capabilities.assistant}
      chatEnabled={chatRuntimeAvailable()}
      chatSurface="estimates.list"
      jobNotificationsAvailable={capabilities.jobNotifications}
      permissionsAvailable={capabilities.permissions}
      ganttAvailable={capabilities.readGantt}
      billingAvailable={capabilities.billing}
      contentWidth="full"
      onSignOut={signOut}
    >
      <EstimatesReadRoute
        key={workspace.id}
        workspaceId={workspace.id}
        viewerId={session.user.id}
        initialQuery={query}
        canReadLeads={capabilities.readLeads}
        canReadJobs={capabilities.readJobs}
      />
    </WorkspaceShell>
  );
}

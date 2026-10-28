import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { estimateIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, readEstimateBusinessProfile } from "@salesmora/data";
import { getSession } from "../../../../server/auth/session";
import { auth } from "../../../../server/auth/auth";
import { database, findWorkspace } from "../../../../server/workspaces/store";
import {
  enabledPermissions,
  workspaceAuthorization,
  workspaceCapabilities,
  workspaceNavigationPages,
} from "../../../../server/authorization/permissions";
import { chatRuntimeAvailable } from "../../../../server/chat/config";
import { WorkspaceShell } from "../../../../features/workspace/workspace-shell/workspace-shell";
import { EstimateSettingsRoute } from "../../../../features/settings/estimate-settings-page/estimate-settings-route";
import { estimateSettingsPageData as copy } from "../../../../features/settings/estimate-settings-page/estimate-settings-page.data";

export const metadata = { title: `${copy.title} settings | SalesMora.ai` };

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export default async function EstimateSettingsPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { workspace: workspaceId } = await searchParams;
  if (workspaceId && !estimateIdSchema.safeParse(workspaceId).success) notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) {
    if (workspaceId) notFound();
    redirect("/setup");
  }
  const identity = { userId: session.user.id, workspaceId: workspace.id };
  const context = await workspaceAuthorization(session.user.id, workspace.id).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  const result = await readEstimateBusinessProfile(
    database(),
    identity,
    enabledPermissions,
  ).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  const workspaceDetails = await database()("workspaces")
    .where({ id: workspace.id })
    .first("timezone");
  if (!workspaceDetails || typeof workspaceDetails.timezone !== "string") notFound();
  const capabilities = workspaceCapabilities(context);
  return <WorkspaceShell
    currentPage="settings"
    currentSettingsPage="estimates"
    workspaceId={workspace.id}
    workspaceName={workspace.businessName}
    user={{ name: session.user.name, email: session.user.email, role: context.membership.role }}
    onSignOut={signOut}
    authorizedPages={workspaceNavigationPages(context)}
    billingAvailable={capabilities.billing}
    jobNotificationsAvailable={capabilities.jobNotifications}
    permissionsAvailable={capabilities.permissions}
    ganttAvailable={capabilities.readGantt}
    assistantAvailable={capabilities.assistant}
    chatEnabled={chatRuntimeAvailable()}
    chatSurface="settings.overview"
    contentWidth="full"
  >
    <EstimateSettingsRoute
      key={`estimate-settings-${workspace.id}`}
      workspaceId={workspace.id}
      workspaceName={workspace.businessName}
      timezone={workspaceDetails.timezone}
      initial={result.record}
      canManage={result.canManage}
      role={result.role}
    />
  </WorkspaceShell>;
}

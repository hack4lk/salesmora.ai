import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { MaterialContractError, materialQueryFromURL, workOrderIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, MaterialValidationError, readMaterials } from "@salesmora/data";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import { database, findWorkspace } from "../workspaces/store";
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from "../authorization/permissions";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { MaterialsRoute } from "../../features/materials/materials-route/materials-route";
import { chatRuntimeAvailable } from "../chat/config";
async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
export async function renderMaterialsPage(params: Record<string, string | string[] | undefined>) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = typeof params.workspace === "string" ? params.workspace : undefined;
  if (params.workspace && (!requested || !workOrderIdSchema.safeParse(requested).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect("/setup"); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    const capabilities = workspaceCapabilities(context);
    if (!capabilities.materials) notFound();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (typeof value === "string") search.set(key, value);
    const query = materialQueryFromURL(workspace.id, search);
    const initial = await readMaterials(database(), { userId: session.user.id, workspaceId: workspace.id }, enabledPermissions, query);
    return <WorkspaceShell currentPage="materials" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)}
      permissionsAvailable={capabilities.permissions} billingAvailable={capabilities.billing} assistantAvailable={capabilities.assistant}
      chatEnabled={chatRuntimeAvailable()} chatSurface="materials.list" contentWidth="full" onSignOut={signOut}>
      <MaterialsRoute key={workspace.id} workspaceId={workspace.id} initial={initial} initialQuery={query} />
    </WorkspaceShell>;
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof MaterialContractError || error instanceof MaterialValidationError) notFound();
    throw error;
  }
}

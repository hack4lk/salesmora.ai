import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { WorkOrderContractError, workOrderIdSchema, workOrderQueryFromURL } from "@salesmora/contracts";
import { AuthorizationAccessError, WorkOrderValidationError, readWorkOrders, readWorkOrderDetail } from "@salesmora/data";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import { database, findWorkspace } from "../workspaces/store";
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from "../authorization/permissions";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { WorkOrdersRoute } from "../../features/work-orders/work-orders-route/work-orders-route";
import { chatRuntimeAvailable } from "../chat/config";
async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
export async function renderWorkOrdersPage(params: Record<string, string | string[] | undefined>, workOrderId?: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = typeof params.workspace === "string" ? params.workspace : undefined;
  if ((params.workspace && (!requested || !workOrderIdSchema.safeParse(requested).success)) || (workOrderId && !workOrderIdSchema.safeParse(workOrderId).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect("/setup"); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    const capabilities = workspaceCapabilities(context);
    if (!capabilities.readWorkOrders) notFound();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (typeof value === "string") search.set(key, value);
    const query = workOrderQueryFromURL(workspace.id, search);
    const identity = { userId: session.user.id, workspaceId: workspace.id };
    const initial = await readWorkOrders(database(), identity, enabledPermissions, query);
    const detail = workOrderId ? await readWorkOrderDetail(database(), identity, enabledPermissions, workOrderId) : undefined;
    return <WorkspaceShell currentPage="work-orders" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)}
      jobNotificationsAvailable={capabilities.jobNotifications} permissionsAvailable={capabilities.permissions} ganttAvailable={capabilities.readGantt} billingAvailable={capabilities.billing} assistantAvailable={capabilities.assistant}
      chatEnabled={chatRuntimeAvailable()} chatSurface={workOrderId ? "work_order.detail" : "work_order.list"} contentWidth="full" onSignOut={signOut}>
      <WorkOrdersRoute key={`${workspace.id}:${workOrderId ?? "list"}`} workspaceId={workspace.id} field={context.membership.role === "field"} initial={initial} initialQuery={query} initialDetail={detail} createForJobId={typeof params.newForJob === "string" && workOrderIdSchema.safeParse(params.newForJob).success ? params.newForJob : undefined} />
    </WorkspaceShell>;
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof WorkOrderContractError || error instanceof WorkOrderValidationError) notFound();
    throw error;
  }
}

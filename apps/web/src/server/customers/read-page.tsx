import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CustomerContractError, customerIdSchema } from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  readCustomers,
  readCustomer,
} from "@salesmora/data";
import { customerQueryFromURL } from "@salesmora/contracts";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import { database, findWorkspace } from "../workspaces/store";
import {
  enabledPermissions,
  workspaceAuthorization,
  workspaceCapabilities,
  workspaceNavigationPages,
} from "../authorization/permissions";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { CustomersRoute } from "../../features/customers/customers-page/customers-route";
import { chatRuntimeAvailable } from "../chat/config";
async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
export async function renderCustomersPage(
  params: Record<string, string | string[] | undefined>,
  customerId?: string,
) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested =
    typeof params.workspace === "string" ? params.workspace : undefined;
  if (
    (params.workspace &&
      (!requested || !customerIdSchema.safeParse(requested).success)) ||
    (customerId && !customerIdSchema.safeParse(customerId).success)
  )
    notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) {
    if (requested) notFound();
    redirect("/setup");
  }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    const capabilities = workspaceCapabilities(context);
    if (!capabilities.readCustomers) notFound();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params))
      if (typeof value === "string") search.set(key, value);
    const query = customerQueryFromURL(workspace.id, search);
    const identity = { userId: session.user.id, workspaceId: workspace.id };
    const initial = await readCustomers(
      database(),
      identity,
      enabledPermissions,
      query,
    );
    const detail = customerId
      ? await readCustomer(database(), identity, enabledPermissions, customerId)
      : undefined;
    return (
      <WorkspaceShell
        chatSurface={customerId ? "customer.detail" : "customers.list"}
        currentPage="customers"
        workspaceId={workspace.id}
        workspaceName={workspace.businessName}
        user={{
          name: session.user.name,
          email: session.user.email,
          role: context.membership.role,
        }}
        authorizedPages={workspaceNavigationPages(context)}
        permissionsAvailable={capabilities.permissions}
        billingAvailable={capabilities.billing}
        assistantAvailable={capabilities.assistant}
        chatEnabled={chatRuntimeAvailable()}
        contentWidth="full"
        onSignOut={signOut}
      >
        <CustomersRoute
          key={`${workspace.id}:${customerId ?? "list"}`}
          workspaceId={workspace.id}
          initial={initial}
          initialQuery={query}
          initialDetail={detail}
          initialTab={typeof params.tab === "string" ? params.tab : undefined}
        />
      </WorkspaceShell>
    );
  } catch (error) {
    if (
      error instanceof AuthorizationAccessError ||
      error instanceof CustomerContractError
    )
      notFound();
    throw error;
  }
}

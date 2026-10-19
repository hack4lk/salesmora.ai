import { chatRuntimeAvailable } from "../../../../server/chat/config";
import {
  AuthorizationAccessError,
  readWorkspaceBilling,
  sandboxBillingEnabled,
} from "@salesmora/data";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "../../../../server/auth/session";
import { auth } from "../../../../server/auth/auth";
import { findWorkspace } from "../../../../server/workspaces/store";
import {
  enabledPermissions,
  workspaceCapabilities,
  workspaceNavigationPages,
} from "../../../../server/authorization/permissions";
import { WorkspaceShell } from "../../../../features/workspace/workspace-shell/workspace-shell";
import { BillingRoute } from "../../../../features/settings/billing-page/billing-route";
import { database } from "../../../../server/workspaces/store";
import { billingPageData as copy } from "../../../../features/settings/billing-page/billing-page.data";

// Billing is enabled at runtime; image builds intentionally have no Stripe configuration.
export const dynamic = "force-dynamic";
export const metadata = { title: copy.documentTitle };
async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  if (!sandboxBillingEnabled()) notFound();
  const session = await getSession();
  if (!session) redirect("/login");
  const { workspace: workspaceId } = await searchParams;
  if (
    workspaceId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      workspaceId,
    )
  )
    notFound();
  const workspace = await findWorkspace(session.user.id, workspaceId);
  if (!workspace) {
    if (workspaceId) notFound();
    redirect("/setup");
  }
  const { context, snapshot } = await readWorkspaceBilling(
    database(),
    session.user.id,
    workspace.id,
    enabledPermissions,
  ).catch((error) => {
    if (error instanceof AuthorizationAccessError) notFound();
    throw error;
  });
  const capabilities = workspaceCapabilities(context);
  return (
    <WorkspaceShell
      chatEnabled={chatRuntimeAvailable()}
      chatSurface="settings.overview"
      currentPage="settings"
      currentSettingsPage="billing"
      billingAvailable={capabilities.billing}
      permissionsAvailable={capabilities.permissions}
      authorizedPages={workspaceNavigationPages(context)}
      assistantAvailable={capabilities.assistant}
      contentWidth="full"
      workspaceId={workspace.id}
      workspaceName={workspace.businessName}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: context.membership.role,
      }}
      onSignOut={signOut}
    >
      <BillingRoute
        key={`billing:${workspace.id}`}
        publishableKey={
          process.env.STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")
            ? process.env.STRIPE_PUBLISHABLE_KEY
            : undefined
        }
        workspaceId={workspace.id}
        workspaceName={workspace.businessName}
        viewerRole={context.membership.role}
        initialSnapshot={snapshot}
      />
    </WorkspaceShell>
  );
}

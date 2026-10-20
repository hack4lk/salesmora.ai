import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { JobContractError } from "@salesmora/contracts";
import { jobIdSchema, jobQueryFromURL } from "@salesmora/contracts";
import { AuthorizationAccessError, JobValidationError, readJobs, readJob, readWorkOrders, getJobMessages } from "@salesmora/data";
import { auth } from "../auth/auth";
import { getSession } from "../auth/session";
import { database, findWorkspace } from "../workspaces/store";
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities, workspaceNavigationPages } from "../authorization/permissions";
import { WorkspaceShell } from "../../features/workspace/workspace-shell/workspace-shell";
import { JobsRoute } from "../../features/jobs/jobs-page/jobs-route";
import { chatRuntimeAvailable } from "../chat/config";
async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
export async function renderJobsPage(params: Record<string, string | string[] | undefined>, jobId?: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = typeof params.workspace === "string" ? params.workspace : undefined;
  if ((params.workspace && (!requested || !jobIdSchema.safeParse(requested).success)) || (jobId && !jobIdSchema.safeParse(jobId).success)) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect("/setup"); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    const capabilities = workspaceCapabilities(context);
    if (!capabilities.readJobs) notFound();
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (typeof value === "string") search.set(key, value);
    const query = jobQueryFromURL(workspace.id, search);
    const identity = { userId: session.user.id, workspaceId: workspace.id };
    const initial = await readJobs(database(), identity, enabledPermissions, query);
    const detail = jobId ? await readJob(database(), identity, enabledPermissions, jobId) : undefined;
    const jobWorkOrders = jobId && capabilities.readWorkOrders
      ? await readWorkOrders(database(), identity, enabledPermissions, { workspaceId: workspace.id, jobId, pageSize: 100, sort: "number", direction: "asc" }).catch(error => { if (error instanceof AuthorizationAccessError) return undefined; throw error; })
      : undefined;
    const jobMessages = jobId
      ? await getJobMessages(database(), identity, enabledPermissions, jobId, 50).catch(error => { if (error instanceof AuthorizationAccessError) return undefined; throw error; })
      : undefined;
    return <WorkspaceShell currentPage="jobs" workspaceId={workspace.id} workspaceName={workspace.businessName}
      user={{ name: session.user.name, email: session.user.email, role: context.membership.role }} authorizedPages={workspaceNavigationPages(context)}
      permissionsAvailable={capabilities.permissions} billingAvailable={capabilities.billing} assistantAvailable={capabilities.assistant}
      chatEnabled={chatRuntimeAvailable()} contentWidth="full" onSignOut={signOut}>
      <JobsRoute key={`${workspace.id}:${jobId ?? "list"}`} workspaceId={workspace.id} userId={session.user.id} field={context.membership.role === "field"}
        initial={initial} initialQuery={query} initialDetail={detail}
        workOrders={jobWorkOrders && { rows: jobWorkOrders.rows.map(w => ({ id: w.id, number: w.number, title: w.title, status: w.status, assigneeName: w.assigneeName, scheduledDate: w.scheduledDate, tasksDone: w.tasksDone, tasksTotal: w.tasksTotal, overdue: w.overdue })), canCreate: jobWorkOrders.canCreate }}
        initialMessages={jobMessages} />
    </WorkspaceShell>;
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof JobContractError || error instanceof JobValidationError) notFound();
    throw error;
  }
}

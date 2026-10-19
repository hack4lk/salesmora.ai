import "server-only";
import { notFound, redirect } from "next/navigation";

import { WorkOrderContractError, workOrderIdSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, WorkOrderValidationError, readWorkOrderDetail } from "@salesmora/data";
import { getSession } from "../auth/session";
import { database, findWorkspace } from "../workspaces/store";
import { enabledPermissions, workspaceAuthorization, workspaceCapabilities } from "../authorization/permissions";
import { WorkOrderPrintPaper } from "../../features/work-orders/work-order-print-paper/work-order-print-paper";
import { WorkOrderPrintToolbar } from "../../features/work-orders/work-order-print-paper/work-order-print-toolbar";

/** The crew sheet shares the detail read, so permissions apply; only the fields the sheet needs are mapped, so prices and costs never reach the page. */
export async function renderWorkOrderPrintPage(params: Record<string, string | string[] | undefined>, workOrderId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = typeof params.workspace === "string" ? params.workspace : undefined;
  if ((params.workspace && (!requested || !workOrderIdSchema.safeParse(requested).success)) || !workOrderIdSchema.safeParse(workOrderId).success) notFound();
  const workspace = await findWorkspace(session.user.id, requested);
  if (!workspace) { if (requested) notFound(); redirect("/setup"); }
  try {
    const context = await workspaceAuthorization(session.user.id, workspace.id);
    if (!workspaceCapabilities(context).readWorkOrders) notFound();
    const detail = await readWorkOrderDetail(database(), { userId: session.user.id, workspaceId: workspace.id }, enabledPermissions, workOrderId);
    const { workOrder: w, completion, contact } = detail;
    const data = {
      businessName: workspace.businessName, businessPhone: detail.businessPhone, number: w.number, title: w.title, status: w.status, jobNumber: w.jobNumber,
      customerName: contact.name, customerPhone: contact.phone, address: contact.address, assigneeName: w.assigneeName, crewNames: w.crewNames,
      scheduledDate: w.scheduledDate, scheduledWindow: w.arrivalWindow,
      instructions: { instructions: w.instructions, accessNotes: w.accessNotes, safetyNotes: w.safetyNotes },
      tasks: detail.tasks.map(t => ({ id: t.id, label: t.label, required: t.required, done: t.done })),
      materials: detail.materials.map(m => ({ id: m.id, name: m.name, quantity: m.quantity, unit: m.unit, note: m.note })),
      printedAt: new Date().toISOString(),
      signoff: completion && { summary: completion.summary, completedByName: completion.completedByName, completedAt: completion.completedAt, signerName: completion.signerName, signedAt: completion.signedAt, signatureUrl: completion.signatureImage },
    };
    return <main className="min-h-screen bg-canvas p-4 print:bg-paper print:p-0 sm:p-8">
      <WorkOrderPrintToolbar backHref={`/work-orders/${workOrderId}?workspace=${workspace.id}`} />
      <WorkOrderPrintPaper data={data} />
    </main>;
  } catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof WorkOrderContractError || error instanceof WorkOrderValidationError) notFound();
    throw error;
  }
}

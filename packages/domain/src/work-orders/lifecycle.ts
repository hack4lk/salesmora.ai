import type { WorkOrderMutation, WorkOrderStatus } from "@salesmora/contracts";

export class WorkOrderLifecycleError extends Error {}
export const workOrderTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  draft: ["issued", "canceled"], issued: ["in-progress", "canceled"], "in-progress": ["completed", "canceled"], completed: [], canceled: [],
};
export const isClosedWorkOrder = (status: WorkOrderStatus) => status === "completed" || status === "canceled";
/** Reopening resumes work after completion, and returns a canceled order to Draft so it must be issued again. */
export const reopenTarget = (status: WorkOrderStatus): WorkOrderStatus => {
  if (status === "completed") return "in-progress";
  if (status === "canceled") return "draft";
  throw new WorkOrderLifecycleError("Only completed or canceled work orders can be reopened.");
};
type State = { status: WorkOrderStatus; archived: boolean };

/** Content is frozen once closed or archived; Reopen and Unarchive are the only way back. */
export function assertEditable({ status, archived }: State) {
  if (archived) throw new WorkOrderLifecycleError("Unarchive this work order before changing it.");
  if (isClosedWorkOrder(status)) throw new WorkOrderLifecycleError("Reopen this work order before changing it.");
}
/** Content edits after issue are allowed but must be logged and flagged to the crew. */
export const editsChangeIssuedContent = (status: WorkOrderStatus) => status === "issued" || status === "in-progress";

export function validateStatusChange(current: State & { assigneeId: string | null }, input: Extract<WorkOrderMutation, { action: "status" }>) {
  if (current.archived) throw new WorkOrderLifecycleError("Unarchive this work order before changing its status.");
  if (!workOrderTransitions[current.status].includes(input.to)) throw new WorkOrderLifecycleError(`A ${current.status} work order cannot move to ${input.to}.`);
  if (input.to === "canceled" && !input.reason) throw new WorkOrderLifecycleError("Canceling requires a reason.");
  if (input.to !== "canceled" && input.reason) throw new WorkOrderLifecycleError("Reasons apply only to cancellation.");
  if (input.to === "issued" && !current.assigneeId && !input.confirmed) throw new WorkOrderLifecycleError("Confirm issuing a work order with no assignee.");
}

export type CompletionContext = { status: WorkOrderStatus; archived: boolean; tasks: { required: boolean; done: boolean }[]; signoffRequired: boolean; canOverride: boolean };
/** Completion needs the required tasks done (or an office override with a reason) and a signature when the workspace requires one. */
export function validateCompletion(ctx: CompletionContext, input: Extract<WorkOrderMutation, { action: "complete" }>) {
  if (ctx.archived) throw new WorkOrderLifecycleError("Unarchive this work order before completing it.");
  if (ctx.status !== "in-progress") throw new WorkOrderLifecycleError("Only a work order in progress can be completed.");
  const open = ctx.tasks.filter(task => task.required && !task.done).length;
  if (open > 0) {
    if (!input.overrideReason) throw new WorkOrderLifecycleError(`${open} required task${open === 1 ? " is" : "s are"} not done.`);
    if (!ctx.canOverride) throw new WorkOrderLifecycleError("Only office roles can complete with required tasks open.");
  } else if (input.overrideReason) throw new WorkOrderLifecycleError("An override reason applies only when required tasks are open.");
  if (ctx.signoffRequired && !input.signatureImage) throw new WorkOrderLifecycleError("This workspace requires a customer signature.");
}

export function validateReopen(current: State) {
  if (current.archived) throw new WorkOrderLifecycleError("Unarchive this work order before reopening it.");
  return reopenTarget(current.status);
}
export function validateArchive(current: State, archived: boolean) {
  if (archived && !isClosedWorkOrder(current.status)) throw new WorkOrderLifecycleError("Only completed or canceled work orders can be archived.");
  if (archived === current.archived) throw new WorkOrderLifecycleError(archived ? "Already archived." : "Not archived.");
}
export function validateDelete(current: State) {
  if (current.status !== "draft" || current.archived) throw new WorkOrderLifecycleError("Only draft work orders can be deleted. Cancel or archive it instead.");
}
/** A work order is overdue when its scheduled date has passed and work is not closed. */
export const isOverdue = (status: WorkOrderStatus, scheduledDate: string | null, today: string) => !!scheduledDate && !isClosedWorkOrder(status) && scheduledDate < today;

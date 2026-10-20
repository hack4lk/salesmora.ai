import type { JobMutation, JobStatus } from "@salesmora/contracts";

export class JobLifecycleError extends Error {}
export const isClosedJob = (status: JobStatus) => status === "completed" || status === "canceled";

export function scheduledJobStatus(status: JobStatus, scheduledDate: string | null): JobStatus {
  if (isClosedJob(status)) throw new JobLifecycleError("Reopen this job before changing its schedule.");
  if (scheduledDate && status === "needs-scheduling") return "scheduled";
  if (!scheduledDate && status === "scheduled") return "needs-scheduling";
  return status;
}

/** Lifecycle is enforced separately from permissions, equally for direct and confirmed assistant actions. */
export function validateJobTransition(current: { status: JobStatus; scheduledDate: string | null }, input: Extract<JobMutation, {action: "status"}>) {
  if (current.status === input.to) throw new JobLifecycleError("Choose a different job status.");
  if (isClosedJob(current.status)) {
    if (isClosedJob(input.to)) throw new JobLifecycleError("Reopen into an active status.");
    if (!input.confirmed || input.reopenDeadline === undefined) throw new JobLifecycleError("Confirm reopening and review the completion deadline.");
  } else if (input.reopenDeadline !== undefined) throw new JobLifecycleError("Deadline review is only accepted when reopening.");
  if (input.to === "scheduled" && !current.scheduledDate) throw new JobLifecycleError("Set a scheduled work date first.");
  if (input.to === "needs-scheduling" && current.scheduledDate) throw new JobLifecycleError("Clear the scheduled work date first.");
  if (input.to === "waiting" && !input.waitingReason) throw new JobLifecycleError("Choose a waiting reason.");
  if (input.to !== "waiting" && input.waitingReason !== undefined) throw new JobLifecycleError("Waiting reasons apply only to Waiting.");
  if (input.to === "canceled" && (!input.confirmed || !input.cancellationReason)) throw new JobLifecycleError("Choose a cancellation reason and confirm cancellation.");
  if (input.to !== "canceled" && input.cancellationReason !== undefined) throw new JobLifecycleError("Cancellation reasons apply only to Canceled.");
  if (input.to === "completed" && !input.confirmed) throw new JobLifecycleError("Confirm completion.");
}

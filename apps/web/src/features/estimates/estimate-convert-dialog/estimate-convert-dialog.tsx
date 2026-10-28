"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ConfirmDialog, FormFeedback, MoneyText } from "@salesmora/ui";
import { JobCreateDialog, type JobCreateValues } from "../../jobs/job-create-dialog/job-create-dialog";
import { estimateButton } from "../estimate-ui";
import { estimateConvertDialogData as c } from "./estimate-convert-dialog.data";
import {
  estimateConversionJobHref, getEstimateConversionIssues, isEstimateConversionReviewCurrent, reviewEstimateConversion,
  type EstimateConversionInput, type EstimateConversionJobRef, type EstimateConversionRequest,
} from "./estimate-convert-dialog.preview";

export type EstimateConvertDialogProps = EstimateConversionInput & {
  open: boolean;
  /** Authorized parent reference only; never confuse it with a job created by conversion. */
  parentJob?: EstimateConversionJobRef;
  pending?: boolean;
  error?: { kind: "error" | "conflict"; message: string };
  onConfirm?: (request: EstimateConversionRequest) => void | Promise<void>;
  onResolveCustomer?: () => void | Promise<void>;
  onReload?: () => void | Promise<void>;
  onClose: () => void;
};

export function EstimateConvertDialog(props: EstimateConvertDialogProps) {
  return <ConversionReview key={`${props.open}:${props.review.estimateId}:${props.review.job.customerId}`} {...props} />;
}

function ConversionReview(props: EstimateConvertDialogProps) {
  const { open, estimate, capabilities, customer, review, members, parentJob, pending = false, error, onConfirm, onResolveCustomer, onReload, onClose } = props;
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState<string>();
  const inFlight = useRef(false);
  const [initialBinding] = useState(`${review.expectedVersion}:${review.expectedLeadVersion}:${review.expectedCustomerVersion}:${review.snapshotHash}`);
  const busy = pending || working;
  const issues = getEstimateConversionIssues(props);
  const conflict = error?.kind === "conflict" || !isEstimateConversionReviewCurrent(props);
  const existingJob = estimate.convertedJob ?? (estimate.parentType === "job" && parentJob?.id === estimate.parentId ? parentJob : undefined);
  async function operation(action: (() => void | Promise<void>) | undefined, message: string) {
    if (!action || busy || inFlight.current || !capabilities.read) return;
    inFlight.current = true; setWorking(true); setFailure(undefined);
    try { await action(); }
    catch { setFailure(message); }
    finally { inFlight.current = false; setWorking(false); }
  }
  async function confirm(job: JobCreateValues) {
    const result = reviewEstimateConversion(props, job);
    if (!onConfirm || conflict || !result.request) throw new Error(result.issues.join(" ") || c.noHandler);
    await onConfirm(result.request);
  }
  function context() {
    return <div className="grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4">
      <p className="m-0 text-sm font-semibold">{c.estimate}</p>
      <p className="m-0 text-sm leading-6 wrap-anywhere">{estimate.number} · {c.revision(estimate.revision)} · {estimate.name}</p>
      <dl className="m-0 text-sm"><dt className="font-semibold text-muted">{c.amount}</dt><dd className="m-0 mt-1"><MoneyText cents={estimate.totalCents} /></dd></dl>
      <p className="m-0 text-sm leading-6 text-muted">{c.amountHint}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.customerHint}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.effects}</p>
      {initialBinding !== `${review.expectedVersion}:${review.expectedLeadVersion}:${review.expectedCustomerVersion}:${review.snapshotHash}` && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.reloaded}</p>}
      {!onConfirm && <p className="m-0 text-sm leading-6 text-muted">{c.noHandler}</p>}
      {failure && <FormFeedback kind="error" message={failure} />}
    </div>;
  }
  if (!issues.some((issue) => issue !== c.errors.binding) && customer.state === "ready") {
    return <JobCreateDialog open={open} members={members} customers={[{ id: customer.id, name: customer.name }]}
      initialValues={review.job} initialReview allowNewCustomer={false} lockCustomer canSchedule={props.canScheduleCreation}
      reviewContext={{ title: c.title, description: c.description, confirmLabel: c.confirm, content: context() }}
      closeOnConfirm={false} pending={busy} error={error?.message}
      conflict={conflict} onReload={onReload ? () => { void operation(onReload, c.reloadFailed); } : undefined}
      validateValues={(job) => reviewEstimateConversion(props, job).issues[0]}
      confirmDisabled={!onConfirm} onClose={onClose} onConfirm={confirm} />;
  }
  const jobHref = existingJob ? estimateConversionJobHref(existingJob) : null;
  const canResolve = capabilities.read && props.canCreateJob && estimate.status === "accepted" && estimate.parentType === "lead"
    && !estimate.archived && !estimate.convertedJobExists && customer.state === "missing" && !conflict
    && issues.every((issue) => issue === c.customerMissing);
  return <ConfirmDialog open={open} title={c.title} description={c.description}
    confirmLabel={c.close} cancelLabel={c.cancel} pendingLabel={c.pending} pending={busy} onClose={onClose} onConfirm={onClose}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      {context()}
      {issues.map((issue, index) => <FormFeedback key={index} kind="error" message={issue} />)}
      {(estimate.convertedJobExists || estimate.parentType === "job") && (existingJob && jobHref ? <Link href={jobHref} aria-disabled={busy} tabIndex={busy ? -1 : undefined}
        onClick={(event) => { if (busy) event.preventDefault(); }}
        className={`${estimateButton} inline-flex items-center justify-center`}>{c.openJob(existingJob.number)}</Link>
        : <p className="m-0 text-sm leading-6 text-muted">{c.jobUnavailable}</p>)}
      {canResolve && <>
        <p className="m-0 text-sm leading-6 text-muted">{c.customerBoundary}</p>
        {onResolveCustomer ? <button type="button" disabled={busy} className={estimateButton}
          onClick={() => { void operation(onResolveCustomer, c.resolveFailed); }}>{c.resolveCustomer}</button>
          : <p className="m-0 text-sm leading-6 text-muted">{c.resolveUnavailable}</p>}
      </>}
      {error && <FormFeedback kind="error" message={error.message} />}
      {onReload && !existingJob && <button type="button" disabled={busy} className={estimateButton}
        onClick={() => { void operation(onReload, c.reloadFailed); }}>{c.reload}</button>}
    </div>}
  </ConfirmDialog>;
}

"use client";

import { isValidElement, useId, useState } from "react";
import { ConfirmDialog, FormFeedback, MoneyText, TextField } from "@salesmora/ui";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { EstimateSharingPreview } from "../estimate-sharing-review";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimateButton, estimateDate } from "../estimate-ui";
import { EstimateRevisionReview } from "../estimate-revision-review/estimate-revision-review";
import { reviewEstimateRevisionSharing, type EstimateRevisionReplacement, type EstimateRevisionReviewValue } from "../estimate-revision-review/estimate-revision-review.preview";
import { estimateSendDialogData as c } from "./estimate-send-dialog.data";
import {
  isEstimateSendPreviewCurrent, reviewEstimateSend,
  type EstimateSendReadiness, type EstimateSendRecord,
  type EstimateSendRequest, type EstimateSendReviewInput,
} from "./estimate-send-dialog.preview";

export type EstimateSendPreview = EstimateSharingPreview;
export type EstimateSendDialogProps = {
  open: boolean;
  estimate: EstimateSendRecord;
  capabilities: EstimateCapabilities;
  today: string;
  subject: string;
  /** Host validates items, terms, business profile and remaining send requirements. */
  readiness: EstimateSendReadiness;
  preview: EstimateSendPreview | null;
  revision?: EstimateRevisionReplacement | null;
  paymentLink?: string;
  pending?: boolean;
  printHidden?: boolean;
  container?: () => HTMLElement;
  error?: { kind: "error" | "conflict"; message: string };
  onClose: () => void;
  onConfirm?: (request: EstimateSendRequest) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
} & (
  | { mode?: "send" }
  | {
    mode: "resend";
    delivery: EstimateSendReviewInput["delivery"];
    recipientEmail: string;
    onRecipientEmailChange: (email: string) => void;
    reviewedRecipientEmail?: string;
    onReviewRecipient?: (email: string) => void | Promise<void>;
  }
);

export function EstimateSendDialog(props: EstimateSendDialogProps) {
  return <SendReview key={`${props.open}:${props.estimate.id}:${props.mode ?? "send"}`} {...props} />;
}

function SendReview(props: EstimateSendDialogProps) {
  const { open, estimate, capabilities, today, subject, readiness, preview, pending = false, error, onClose, onConfirm, onReload } = props;
  const mode = props.mode ?? "send";
  const id = useId();
  const [working, setWorking] = useState(false);
  const [reloadFailed, setReloadFailed] = useState(false);
  const [revisionValue, setRevisionValue] = useState<EstimateRevisionReviewValue | null>(null);
  const busy = pending || working;
  const conflict = error?.kind === "conflict";
  const recipientChanged = props.mode === "resend" && props.reviewedRecipientEmail !== undefined &&
    props.recipientEmail.trim() !== props.reviewedRecipientEmail;
  const review = reviewEstimateSend({
    mode, estimate, capabilities, today, subject, readiness, preview,
    delivery: props.mode === "resend" ? props.delivery : undefined,
    resendEmail: props.mode === "resend" ? props.recipientEmail : undefined,
  });
  const previewCurrent = isEstimateSendPreviewCurrent(estimate, preview);
  const previewUsable = preview?.state === "ready" && previewCurrent && isValidElement(preview.content);
  const revisionInput = mode === "send" && props.revision ? {
    estimate, preview, revision: props.revision, paymentLink: props.paymentLink ?? "",
    canRead: capabilities.read, canSend: capabilities.send, value: revisionValue,
  } : null;
  const revisionReview = revisionInput ? reviewEstimateRevisionSharing(revisionInput) : null;
  const blocked = !review.request || !previewUsable || conflict || !onConfirm || (revisionReview !== null && !revisionReview.confirmation);
  async function confirm() {
    if (busy || blocked || !review.request || !onConfirm) return;
    setWorking(true);
    try {
      if (recipientChanged && props.mode === "resend") {
        await props.onReviewRecipient?.(props.recipientEmail.trim());
      } else await onConfirm({ ...review.request, ...(revisionReview?.confirmation ? { revisionReview: revisionReview.confirmation } : {}) });
    }
    finally { setWorking(false); }
  }
  async function reload() {
    if (busy || !onReload) return;
    setWorking(true);
    setReloadFailed(false);
    try { await onReload(); }
    catch { setReloadFailed(true); }
    finally { setWorking(false); }
  }
  return <ConfirmDialog open={open} container={props.container} printHidden={props.printHidden} title={c.title[mode]} description={c.description[mode]}
    initialFocus="content"
    confirmLabel={recipientChanged ? c.reviewRecipient : c.confirm[mode]} pendingLabel={c.pending[mode]} cancelLabel={c.cancel}
    pending={busy} confirmDisabled={blocked || (recipientChanged && props.mode === "resend" && !props.onReviewRecipient)} error={capabilities.read ? error?.message : undefined}
    onClose={onClose} onConfirm={confirm}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.record}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere"><span>{estimate.number} · {c.revision(estimate.revision)}</span><span>{estimate.name}</span></dd></div>
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.recipientName}</dt><dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientName || c.unavailable}</dd></div>
        {mode === "send" && <div className="min-w-0"><dt className="font-semibold text-muted">{c.recipientEmail}</dt><dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientEmail || c.unavailable}</dd></div>}
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.subject}</dt><dd className="m-0 mt-1 wrap-anywhere">{subject || c.unavailable}</dd></div>
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.total}</dt><dd className="m-0 mt-1"><MoneyText cents={estimate.totalCents} /></dd></div>
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.validUntil}</dt><dd className="m-0 mt-1">{isEstimateLocalDate(estimate.validUntil) ? estimateDate(`${estimate.validUntil}T00:00:00Z`) : c.unavailable}</dd></div>
      </dl>
      {props.mode === "resend" && <TextField label={c.recipientEmail} type="email" required
        value={props.recipientEmail} disabled={busy || !capabilities.send || estimate.archived || conflict}
        error={!!review.emailError} helperText={review.emailError || c.resendEmailHelp}
        onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
        onChange={(event) => {
          if (!busy && capabilities.send && !estimate.archived && !conflict) props.onRecipientEmailChange(event.target.value);
        }}
        autoComplete="email" slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 254 } }} />}
      {mode === "send" && review.emailError && <FormFeedback kind="error" message={review.emailError} />}
      {review.issues.map((issue, index) => <FormFeedback key={index} kind="error" message={issue} />)}
      {revisionInput && <EstimateRevisionReview {...revisionInput} pending={busy || conflict} onChange={setRevisionValue} />}
      {previewUsable && preview?.state === "ready" ? <section aria-labelledby={`${id}-preview`} className="grid min-w-0 gap-3">
        <h3 id={`${id}-preview`} className="m-0 text-base font-semibold">{c.preview}</h3>
        <p className="m-0 text-sm leading-6 text-muted">{c.previewBoundary}</p>
        {preview.content}
      </section> : preview?.state === "loading" ? <p role="status" className="m-0 text-sm leading-6 text-muted">{c.previewLoading}</p>
        : preview?.state === "ready" && previewCurrent && <FormFeedback kind="error" message={c.errors.previewMissing} />}
      {reloadFailed && <FormFeedback kind="error" message={c.reloadFailed} />}
      {onReload && (conflict || !previewUsable) && <button type="button" disabled={busy} className={estimateButton}
        onClick={() => { void reload(); }}>{c.reload}</button>}
      {!onConfirm && <p className="m-0 text-sm leading-6 text-muted">{c.noHandler}</p>}
      <p className="m-0 text-sm leading-6 text-muted">{mode === "send" ? c.sendHint : c.resendHint}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.confirmationHint}</p>
    </div>}
  </ConfirmDialog>;
}

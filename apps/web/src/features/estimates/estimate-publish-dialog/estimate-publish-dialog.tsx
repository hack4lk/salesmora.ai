"use client";

import { isValidElement, useId, useRef, useState } from "react";
import { ConfirmDialog, FormFeedback, MoneyText, StatusBadge } from "@salesmora/ui";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { EstimateDeliveryLink } from "../estimate-delivery-card/estimate-delivery-card.preview";
import { isEstimateSharingPreviewCurrent, type EstimateSharingPreview, type EstimateSharingReadiness, type EstimateSharingRecord } from "../estimate-sharing-review";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimateButton, estimateDate } from "../estimate-ui";
import { EstimateRevisionReview } from "../estimate-revision-review/estimate-revision-review";
import { reviewEstimateRevisionSharing, type EstimateRevisionReplacement, type EstimateRevisionReviewValue } from "../estimate-revision-review/estimate-revision-review.preview";
import { estimatePublishDialogData as c } from "./estimate-publish-dialog.data";
import { canCopyPublishedEstimate, isEstimatePublicationCurrent, reviewEstimatePublish, type EstimatePublishReceipt, type EstimatePublishRequest } from "./estimate-publish-dialog.preview";

export type EstimatePublishView =
  | {
    state: "review"; today: string; readiness: EstimateSharingReadiness; preview: EstimateSharingPreview | null;
    revision?: EstimateRevisionReplacement | null;
    paymentLink?: string;
    error?: { kind: "error" | "conflict"; message: string };
    onConfirm?: (request: EstimatePublishRequest) => void | Promise<void>;
    onReload?: () => void | Promise<void>;
  }
  | {
    state: "published"; receipt: EstimatePublishReceipt; link: EstimateDeliveryLink;
    copyState?: "idle" | "pending" | "copied" | "error"; copyError?: string;
    onCopyLink?: () => void;
  };
export type EstimatePublishDialogProps = {
  open: boolean;
  estimate: EstimateSharingRecord;
  capabilities: EstimateCapabilities;
  pending?: boolean;
  printHidden?: boolean;
  container?: () => HTMLElement;
  /** The host, not a resolved callback or local state, replaces Review with Published. */
  view: EstimatePublishView;
  onClose: () => void;
};

export function EstimatePublishDialog(props: EstimatePublishDialogProps) {
  return <PublishReview key={`${props.open}:${props.estimate.id}:${props.view.state}`} {...props} />;
}

function PublishReview({ open, estimate, capabilities, pending = false, printHidden = false, container, view, onClose }: EstimatePublishDialogProps) {
  const id = useId();
  const [working, setWorking] = useState(false);
  const [reloadFailed, setReloadFailed] = useState(false);
  const [revisionValue, setRevisionValue] = useState<EstimateRevisionReviewValue | null>(null);
  const inFlight = useRef(false);
  const busy = pending || working || (view.state === "published" && view.copyState === "pending");
  if (view.state === "published") {
    const receiptCurrent = isEstimatePublicationCurrent(estimate, view.receipt);
    const visible = capabilities.read && receiptCurrent;
    const canCopy = visible && canCopyPublishedEstimate({ estimate, capabilities, receipt: view.receipt, link: view.link });
    return <ConfirmDialog open={open} container={container} printHidden={printHidden} initialFocus="content"
      title={visible ? c.publishedTitle : c.title} description={visible ? c.publishedDescription : c.successUnavailable}
      confirmLabel={c.done} cancelLabel={c.close} pendingLabel={view.copyState === "pending" ? c.copying : c.busy} pending={busy}
      onClose={onClose} onConfirm={() => { if (!busy) onClose(); }}>
      {!visible ? <FormFeedback kind="error" message={capabilities.read ? c.successMismatch : c.errors.read} />
        : <div className="grid min-w-0 gap-5">
          <div><StatusBadge label={c.publishedLabel} tone="info" /></div>
          <p className="m-0 text-sm leading-6 wrap-anywhere">{estimate.number} · {c.revision(estimate.revision)} · {estimate.name}</p>
          {estimate.archived ? <p className="m-0 text-sm leading-6 text-muted">{c.archived}</p>
            : !canCopy && <p className="m-0 text-sm leading-6 text-muted">{c.inactiveLink}</p>}
          {canCopy && <>
            <p className="m-0 text-sm leading-6 text-muted">{c.linkPrivacy}</p>
            {view.onCopyLink ? <button type="button" disabled={busy} className={estimateButton}
              onClick={() => { if (!busy) view.onCopyLink?.(); }}>{view.copyState === "pending" ? c.copying : c.copy}</button>
              : <p className="m-0 text-sm leading-6 text-muted">{c.copyUnavailable}</p>}
            {view.copyState === "copied" && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.copied}</p>}
            {view.copyState === "error" && <FormFeedback kind="error" message={view.copyError || c.copyError} />}
          </>}
        </div>}
    </ConfirmDialog>;
  }
  const { preview, error, onConfirm, onReload } = view;
  const review = reviewEstimatePublish({ estimate, capabilities, ...view });
  const previewCurrent = isEstimateSharingPreviewCurrent(estimate, preview);
  const previewUsable = preview?.state === "ready" && previewCurrent && isValidElement(preview.content);
  const conflict = error?.kind === "conflict";
  const revisionInput = view.revision ? {
    estimate, preview, revision: view.revision, paymentLink: view.paymentLink ?? "",
    canRead: capabilities.read, canSend: capabilities.send, value: revisionValue,
  } : null;
  const revisionReview = revisionInput ? reviewEstimateRevisionSharing(revisionInput) : null;
  const blocked = !review.request || !previewUsable || conflict || !onConfirm || (revisionReview !== null && !revisionReview.confirmation);
  async function confirm() {
    if (busy || inFlight.current || blocked || !review.request || !onConfirm) return;
    inFlight.current = true;
    setWorking(true);
    try { await onConfirm({ ...review.request, ...(revisionReview?.confirmation ? { revisionReview: revisionReview.confirmation } : {}) }); }
    finally { inFlight.current = false; setWorking(false); }
  }
  async function reload() {
    if (busy || inFlight.current || !onReload) return;
    inFlight.current = true;
    setWorking(true);
    setReloadFailed(false);
    try { await onReload(); }
    catch { setReloadFailed(true); }
    finally { inFlight.current = false; setWorking(false); }
  }
  return <ConfirmDialog open={open} container={container} printHidden={printHidden} title={c.title} description={c.description} initialFocus="content"
    confirmLabel={c.confirm} cancelLabel={c.cancel} pendingLabel={c.pending} pending={busy}
    confirmDisabled={blocked} error={capabilities.read ? error?.message : undefined} onClose={onClose} onConfirm={confirm}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.record}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere"><span>{estimate.number} · {c.revision(estimate.revision)}</span><span>{estimate.name}</span></dd></div>
        <div className="min-w-0"><dt className="font-semibold text-muted">{c.preparedFor}</dt><dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientName || c.unavailable}</dd></div>
        <div><dt className="font-semibold text-muted">{c.total}</dt><dd className="m-0 mt-1"><MoneyText cents={estimate.totalCents} /></dd></div>
        <div><dt className="font-semibold text-muted">{c.validUntil}</dt>
          <dd className="m-0 mt-1">{isEstimateLocalDate(estimate.validUntil) ? estimateDate(`${estimate.validUntil}T00:00:00Z`) : c.unavailable}</dd></div>
      </dl>
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
      <p className="m-0 text-sm leading-6 text-muted">{c.effects}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.linkPrivacy}</p>
    </div>}
  </ConfirmDialog>;
}

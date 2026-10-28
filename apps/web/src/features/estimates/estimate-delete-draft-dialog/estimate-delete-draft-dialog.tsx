"use client";

import { useRef, useState } from "react";
import { ConfirmDialog, FormFeedback } from "@salesmora/ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton } from "../estimate-ui";
import { estimateDeleteDraftDialogData as c } from "./estimate-delete-draft-dialog.data";
import {
  isEstimateDeleteDraftReviewCurrent, reviewEstimateDeleteDraft,
  type EstimateDeleteDraftRequest, type EstimateDeleteDraftReviewInput, type EstimateDeleteDraftValues,
} from "./estimate-delete-draft-dialog.preview";

export type EstimateDeleteDraftDialogProps = EstimateDeleteDraftReviewInput & {
  open: boolean;
  pending?: boolean;
  pendingLabel?: string;
  error?: { kind: "error" | "conflict"; message: string };
  onChange: (value: EstimateDeleteDraftValues) => void;
  onConfirm?: (request: EstimateDeleteDraftRequest) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
  onClose: () => void;
};

export function EstimateDeleteDraftDialog(props: EstimateDeleteDraftDialogProps) {
  return <DeleteDraftReview key={`${props.open}:${props.estimate.id}`} {...props} />;
}

function DeleteDraftReview(props: EstimateDeleteDraftDialogProps) {
  const { open, estimate, capabilities, value, pending = false, error, onChange, onConfirm, onReload, onClose } = props;
  const inFlight = useRef(false);
  const [working, setWorking] = useState<"confirm" | "reload" | null>(null);
  const [reloadFailed, setReloadFailed] = useState(false);
  const review = reviewEstimateDeleteDraft(props);
  const busy = pending || working !== null;
  const conflict = error?.kind === "conflict" || !isEstimateDeleteDraftReviewCurrent(props);
  const editable = review.eligible && !conflict && !!onConfirm;
  const blocked = !review.request || conflict || !onConfirm;
  async function confirm() {
    if (busy || inFlight.current || blocked || !review.request || !onConfirm) return;
    inFlight.current = true;
    setWorking("confirm");
    try { await onConfirm(review.request); }
    finally { inFlight.current = false; setWorking(null); }
  }
  async function reload() {
    if (busy || inFlight.current || !onReload || !capabilities.read) return;
    inFlight.current = true;
    setWorking("reload");
    setReloadFailed(false);
    try { await onReload(); }
    catch { setReloadFailed(true); }
    finally { inFlight.current = false; setWorking(null); }
  }
  return <ConfirmDialog open={open} title={c.title} description={c.description} destructive
    confirmLabel={c.confirm} cancelLabel={c.cancel} pendingLabel={working === "reload" ? c.reloading : props.pendingLabel ?? c.pending}
    pending={busy} confirmDisabled={blocked} error={capabilities.read ? error?.message : undefined} onClose={onClose} onConfirm={confirm}
    confirmation={editable ? { label: c.type, expectedValue: estimate.number, value: value.typedConfirmation,
      onChange: (typedConfirmation) => {
        if (!busy && !inFlight.current) onChange({ ...value, typedConfirmation });
      } } : undefined}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div><dt className="font-semibold text-muted">{c.record}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere"><span>{estimate.number} · {c.revision(estimate.revision)}</span><span>{estimate.name}</span></dd></div>
        <div><dt className="font-semibold text-muted">{c.preparedFor}</dt>
          <dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientName.trim() ? estimate.recipientName : c.recipientNotSet}</dd></div>
        <div><dt className="font-semibold text-muted">{c.status}</dt>
          <dd className="m-0 mt-1"><EstimateStatusBadge status={estimate.status} archived={estimate.archived} /></dd></div>
      </dl>
      {review.issues.map((issue, index) => <FormFeedback key={index} kind="error" message={issue} />)}
      <p className="m-0 text-sm leading-6">{c.impact}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.numberEffect}</p>
      {reloadFailed && <FormFeedback kind="error" message={c.reloadFailed} />}
      {onReload && (conflict || review.issues.length > 0) && <button type="button" disabled={busy} className={estimateButton}
        onClick={() => { void reload(); }}>{c.reload}</button>}
      {conflict && !onReload && <p className="m-0 text-sm leading-6 text-muted">{c.reloadUnavailable}</p>}
      {!onConfirm && <p className="m-0 text-sm leading-6 text-muted">{c.noHandler}</p>}
    </div>}
  </ConfirmDialog>;
}

"use client";

import { useRef, useState } from "react";
import MuiTextField from "@mui/material/TextField";
import { ConfirmDialog, FormFeedback, fieldClasses } from "@salesmora/ui";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton } from "../estimate-ui";
import { estimateVoidDialogData as c } from "./estimate-void-dialog.data";
import { reviewEstimateVoid, type EstimateVoidRequest, type EstimateVoidReviewInput, type EstimateVoidValues } from "./estimate-void-dialog.preview";

export type EstimateVoidDialogProps = EstimateVoidReviewInput & {
  open: boolean;
  pending?: boolean;
  pendingLabel?: string;
  error?: { kind: "error" | "conflict"; message: string };
  onChange: (value: EstimateVoidValues) => void;
  onConfirm?: (request: EstimateVoidRequest) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
  onClose: () => void;
};

export function EstimateVoidDialog(props: EstimateVoidDialogProps) {
  return <VoidReview key={`${props.open}:${props.estimate.id}`} {...props} />;
}

function VoidReview(props: EstimateVoidDialogProps) {
  const { open, estimate, capabilities, value, pending = false, pendingLabel, error, onChange, onConfirm, onReload, onClose } = props;
  const inFlight = useRef(false);
  const [working, setWorking] = useState<"confirm" | "reload" | null>(null);
  const [reloadFailed, setReloadFailed] = useState(false);
  const review = reviewEstimateVoid(props);
  const busy = pending || working !== null;
  const conflict = error?.kind === "conflict" || value.estimateId !== estimate.id || value.expectedVersion !== estimate.version;
  const editable = review.eligible && !busy && !conflict;
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
    confirmLabel={c.confirm} cancelLabel={c.cancel} pendingLabel={working === "reload" ? c.reloading : pendingLabel ?? c.pending}
    pending={busy} confirmDisabled={blocked} error={capabilities.read ? error?.message : undefined} onClose={onClose} onConfirm={confirm}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div><dt className="font-semibold text-muted">{c.record}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere"><span>{estimate.number} · {c.revision(estimate.revision)}</span><span>{estimate.name}</span></dd></div>
        <div><dt className="font-semibold text-muted">{c.preparedFor}</dt><dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientName}</dd></div>
        <div><dt className="font-semibold text-muted">{c.status}</dt><dd className="m-0 mt-1"><EstimateStatusBadge status={estimate.status} archived={estimate.archived} /></dd></div>
      </dl>
      {review.issues.map((issue, index) => <FormFeedback key={index} kind="error" message={issue} />)}
      <MuiTextField label={c.reason} value={value.reason} required multiline rows={3} fullWidth size="small"
        className={fieldClasses} disabled={!editable} error={!!review.fieldErrors.reason}
        helperText={`${review.fieldErrors.reason ? `${review.fieldErrors.reason} ` : ""}${c.reasonHint} ${c.count(value.reason.length)}`}
        slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.limit } }}
        onChange={(event) => { if (editable && !inFlight.current) onChange({ ...value, reason: event.target.value }); }} />
      <p className="m-0 text-sm leading-6">{c.linkEffect}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.recordEffect}</p>
      {reloadFailed && <FormFeedback kind="error" message={c.reloadFailed} />}
      {onReload && (conflict || review.issues.length > 0) && <button type="button" disabled={busy} className={estimateButton}
        onClick={() => { void reload(); }}>{c.reload}</button>}
      {conflict && !onReload && <p className="m-0 text-sm leading-6 text-muted">{c.reloadUnavailable}</p>}
      {!onConfirm && <p className="m-0 text-sm leading-6 text-muted">{c.noHandler}</p>}
    </div>}
  </ConfirmDialog>;
}

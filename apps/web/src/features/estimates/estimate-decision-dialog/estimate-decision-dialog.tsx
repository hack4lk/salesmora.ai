"use client";

import { useId, useRef, useState } from "react";
import MuiTextField from "@mui/material/TextField";
import Link from "next/link";
import { ConfirmDialog, FormFeedback, MoneyText, fieldClasses } from "@salesmora/ui";
import { estimateDecisionChannels, estimateDecisionOutcomes } from "../estimate-preview.types";
import { estimateButton, estimateDate, estimateInput } from "../estimate-ui";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimateDecisionDialogData as c } from "./estimate-decision-dialog.data";
import {
  isEstimateDecisionChannel, isEstimateDecisionOutcome, isEstimateRecordedDecisionCurrent, reviewEstimateDecision,
  type EstimateDecisionRequest, type EstimateDecisionReviewInput, type EstimateDecisionValues,
} from "./estimate-decision-dialog.preview";

export type EstimateDecisionDialogProps = EstimateDecisionReviewInput & {
  open: boolean;
  pending?: boolean;
  pendingLabel?: string;
  convertedJob?: { number: string; href?: string } | null;
  error?: { kind: "error" | "conflict"; message: string };
  onChange: (value: EstimateDecisionValues) => void;
  onConfirm?: (request: EstimateDecisionRequest) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
  onClose: () => void;
};

export function EstimateDecisionDialog(props: EstimateDecisionDialogProps) {
  return <DecisionReview key={`${props.open}:${props.estimate.id}:${props.mode}`} {...props} />;
}

function DecisionReview(props: EstimateDecisionDialogProps) {
  const { open, estimate, capabilities, mode, value, today, timezone, pending = false, error, onChange, onConfirm, onReload, onClose } = props;
  const id = useId();
  const inFlight = useRef(false);
  const [working, setWorking] = useState(false);
  const [reloadFailed, setReloadFailed] = useState(false);
  const review = reviewEstimateDecision(props);
  const busy = pending || working;
  const conflict = error?.kind === "conflict" || value.estimateId !== estimate.id || value.expectedVersion !== estimate.version;
  const editable = review.eligible && !busy && !conflict;
  const blocked = !review.request || conflict || !onConfirm;
  function change(patch: Partial<EstimateDecisionValues>) {
    if (editable && !inFlight.current) onChange({ ...value, ...patch });
  }
  async function confirm() {
    if (busy || inFlight.current || blocked || !review.request || !onConfirm) return;
    inFlight.current = true;
    setWorking(true);
    try { await onConfirm(review.request); }
    finally { inFlight.current = false; setWorking(false); }
  }
  async function reload() {
    if (busy || inFlight.current || !onReload || !capabilities.read) return;
    inFlight.current = true;
    setWorking(true);
    setReloadFailed(false);
    try { await onReload(); }
    catch { setReloadFailed(true); }
    finally { inFlight.current = false; setWorking(false); }
  }
  return <ConfirmDialog open={open} title={mode === "correct" ? c.correctionTitle : c.title}
    description={mode === "correct" ? c.correctionDescription : c.description}
    confirmLabel={mode === "correct" ? c.confirmCorrection : c.confirm} cancelLabel={c.cancel} pendingLabel={props.pendingLabel ?? c.pending}
    pending={busy} confirmDisabled={blocked} error={capabilities.read ? error?.message : undefined} onClose={onClose} onConfirm={confirm}>
    {!capabilities.read ? <FormFeedback kind="error" message={c.errors.read} /> : <div className="grid min-w-0 gap-5">
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div><dt className="font-semibold text-muted">{c.record}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere"><span>{estimate.number} · {c.revision(estimate.revision)}</span><span>{estimate.name}</span></dd></div>
        <div><dt className="font-semibold text-muted">{c.preparedFor}</dt><dd className="m-0 mt-1 wrap-anywhere">{estimate.recipientName}</dd></div>
        <div><dt className="font-semibold text-muted">{c.total}</dt><dd className="m-0 mt-1"><MoneyText cents={estimate.totalCents} /></dd></div>
      </dl>
      {props.convertedJob && <div className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-4">
        {props.convertedJob.href
          ? <Link href={props.convertedJob.href} className="text-sm font-semibold text-primary underline focus-visible:focus-ring">{props.convertedJob.number}</Link>
          : <p className="m-0 text-sm font-semibold wrap-anywhere">{props.convertedJob.number}</p>}
        <p className="m-0 text-sm leading-6">{c.jobUnchanged}</p>
      </div>}
      {mode === "correct" && estimate.decision && isEstimateRecordedDecisionCurrent(estimate) && <section aria-labelledby={`${id}-previous`}
        className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-4">
        <h3 id={`${id}-previous`} className="m-0 text-base font-semibold">{c.current}</h3>
        <p className="m-0 text-sm leading-6">{c.outcomes[estimate.decision.outcome]} · {estimateDate(`${estimate.decision.decisionDate}T00:00:00Z`)} · {c.channels[estimate.decision.channel]}</p>
        {estimate.decision.note && <p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{estimate.decision.note}</p>}
      </section>}
      {review.issues.map((issue, index) => <FormFeedback key={index} kind="error" message={issue} />)}
      <fieldset disabled={!editable} className="m-0 grid min-w-0 gap-5 border-0 p-0">
        <legend className="sr-only">{mode === "correct" ? c.correctionTitle : c.title}</legend>
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-outcome`} className="text-sm font-semibold">{c.outcome}</label>
          <select id={`${id}-outcome`} value={value.outcome} required disabled={!editable} className={estimateInput}
            aria-invalid={!!review.fieldErrors.outcome} aria-describedby={review.fieldErrors.outcome ? `${id}-outcome-error` : undefined}
            onChange={(event) => { if (isEstimateDecisionOutcome(event.target.value)) change({ outcome: event.target.value }); }}>
            <option value="" disabled>{c.chooseOutcome}</option>
            {estimateDecisionOutcomes.map((outcome) => <option key={outcome} value={outcome}>{c.outcomes[outcome]}</option>)}
          </select>
          {review.fieldErrors.outcome && <p id={`${id}-outcome-error`} className="m-0 text-sm text-error">{review.fieldErrors.outcome}</p>}
        </div>
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-date`} className="text-sm font-semibold">{c.date}</label>
          <input id={`${id}-date`} type="date" value={value.decisionDate} required disabled={!editable}
            max={isEstimateLocalDate(today) ? today : undefined} className={estimateInput} aria-invalid={!!review.fieldErrors.decisionDate}
            aria-describedby={`${id}-date-hint`}
            onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
            onChange={(event) => change({ decisionDate: event.target.value })} />
          <p id={`${id}-date-hint`} className={`m-0 text-sm leading-6 wrap-anywhere ${review.fieldErrors.decisionDate ? "text-error" : "text-muted"}`}>
            {review.fieldErrors.decisionDate ?? c.dateHint(timezone)}
          </p>
        </div>
        <div className="grid min-w-0 gap-2">
          <label htmlFor={`${id}-channel`} className="text-sm font-semibold">{c.channel}</label>
          <select id={`${id}-channel`} value={value.channel} required disabled={!editable} className={estimateInput}
            aria-invalid={!!review.fieldErrors.channel} aria-describedby={review.fieldErrors.channel ? `${id}-channel-error` : undefined}
            onChange={(event) => { if (isEstimateDecisionChannel(event.target.value)) change({ channel: event.target.value }); }}>
            <option value="" disabled>{c.chooseChannel}</option>
            {estimateDecisionChannels.map((channel) => <option key={channel} value={channel}>{c.channels[channel]}</option>)}
          </select>
          {review.fieldErrors.channel && <p id={`${id}-channel-error`} className="m-0 text-sm text-error">{review.fieldErrors.channel}</p>}
        </div>
        <MuiTextField label={c.note} value={value.note} multiline rows={3} fullWidth size="small" className={fieldClasses} disabled={!editable}
          error={!!review.fieldErrors.note} helperText={review.fieldErrors.note ?? `${c.noteHint} ${c.count(value.note.length)}`}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.limit } }}
          onChange={(event) => change({ note: event.target.value })} />
        {mode === "correct" && <MuiTextField label={c.reason} value={value.reason} required multiline rows={3} fullWidth size="small"
          className={fieldClasses} disabled={!editable} error={!!review.fieldErrors.reason}
          helperText={review.fieldErrors.reason ?? `${c.reasonHint} ${c.count(value.reason.length)}`}
          slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.limit } }}
          onChange={(event) => change({ reason: event.target.value })} />}
      </fieldset>
      <p className="m-0 text-sm leading-6 text-muted">{value.outcome === "accepted" ? c.acceptedEffect : value.outcome === "declined" ? c.declinedEffect : c.description}</p>
      <p className="m-0 text-sm leading-6 text-muted">{c.effects}</p>
      {reloadFailed && <FormFeedback kind="error" message={c.reloadFailed} />}
      {onReload && (conflict || review.issues.length > 0) && <button type="button" disabled={busy} className={estimateButton}
        onClick={() => { void reload(); }}>{c.reload}</button>}
      {!onConfirm && <p className="m-0 text-sm leading-6 text-muted">{c.noHandler}</p>}
    </div>}
  </ConfirmDialog>;
}

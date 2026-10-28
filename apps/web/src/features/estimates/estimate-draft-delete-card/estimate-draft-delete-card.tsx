"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ConfirmDialog, type EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateDraftDeleteCardData as c } from "./estimate-draft-delete-card.data";
import { estimateDraftDeleteCardRequest, reviewEstimateDraftDeleteCard } from "./estimate-draft-delete-card.preview";
import type {
  EstimateDraftDeleteCardCommand,
  EstimateDraftDeleteCardProps,
} from "./estimate-draft-delete-card.types";

function currentTime() {
  return Date.now();
}

export type { EstimateDraftDeleteCardProps } from "./estimate-draft-delete-card.types";

export function EstimateDraftDeleteCard(props: EstimateDraftDeleteCardProps) {
  return <Review key={JSON.stringify({
    view: props.view,
    context: props.context,
    grants: props.grants,
    disabled: !!props.disabled,
    connected: !!props.onOperate,
  })} {...props} />;
}

function Review(props: EstimateDraftDeleteCardProps) {
  const id = useId();
  const mounted = useRef(false);
  const lock = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState<EstimateDraftDeleteCardCommand["decision"] | null>(null);
  const [error, setError] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const review = reviewEstimateDraftDeleteCard(props, clock);
  const expires = review.visible && review.state === "pending" ? review.expires : null;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (expires === null) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const now = Date.now();
      if (now < expires) timer = setTimeout(check, expires - now);
      else setClock(now);
    };
    timer = setTimeout(check, Math.max(0, expires - Date.now()));
    return () => clearTimeout(timer);
  }, [expires]);

  function allowed(decision: EstimateDraftDeleteCardCommand["decision"], value?: string) {
    const current = reviewEstimateDraftDeleteCard(props, currentTime());
    return current.visible && current.state === "pending" &&
      (decision === "confirm" ? value === current.view.ticket.estimate.number : current.canCancel);
  }

  async function operate(decision: EstimateDraftDeleteCardCommand["decision"], value?: string) {
    if (lock.current || submitted || !props.onOperate || !props.context) return;
    if (!allowed(decision, value)) {
      setClock(currentTime());
      setError(c.changed);
      return;
    }
    lock.current = true;
    setWorking(true);
    setError("");
    try {
      const command = estimateDraftDeleteCardRequest(
        review.visible ? review.view : props.view,
        props.context.workspaceId,
        decision,
        value,
      );
      const result: EstimateDraftOperationResult = await props.onOperate(command);
      if (!mounted.current) return;
      if (!allowed(decision, value)) {
        setClock(currentTime());
        setError(c.changed);
      } else if (result.ok) {
        setSubmitted(decision);
        if (decision === "confirm") setConfirmationOpen(false);
      } else {
        setError(result.message.trim() || c.failure);
      }
    } catch {
      if (mounted.current && allowed(decision, value)) setError(c.failure);
    } finally {
      if (mounted.current) {
        lock.current = false;
        setWorking(false);
      }
    }
  }

  const panel = "grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden";
  if (!review.visible) return <section aria-labelledby={id} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <p role="status" className="m-0 text-sm leading-6">{review.issue}</p>
  </section>;

  const { view, state } = review;
  const { ticket } = view;
  const active = state === "pending";
  const busy = working || submitted !== null || !props.onOperate;
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  const actionStatus = state === "confirmed" ? c.confirmed
    : state === "cancelled" ? c.cancelled
      : state === "superseded" ? c.superseded
        : state === "expired" ? c.expired
          : working ? c.working
            : submitted ? c.requested : c.pending;

  return <section aria-labelledby={id} aria-busy={working} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <dl className="m-0 grid min-w-0 gap-4 text-sm">
      <div className="min-w-0">
        <dt className="font-semibold text-assistant-muted">{c.source}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">
          {ticket.estimate.number} · {c.dialog.revision(ticket.estimate.revision)} · {view.review.name}
        </dd>
      </div>
      {active && <>
        <div className="min-w-0">
          <dt className="font-semibold text-assistant-muted">{c.parent[view.review.parent.type]}</dt>
          <dd className="m-0 mt-1 leading-6 wrap-anywhere">
            {view.review.parent.number} · {view.review.parent.name}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-assistant-muted">{c.recipient}</dt>
          <dd className="m-0 mt-1 leading-6 wrap-anywhere">
            {view.review.recipientName.trim() ? view.review.recipientName : c.notSpecified}
          </dd>
        </div>
      </>}
      {state === "confirmed" && view.receipt && <div>
        <dt className="font-semibold text-assistant-muted">{c.dialog.estimate}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">
          {view.receipt.number} · {c.dialog.revision(view.receipt.revision)}
        </dd>
      </div>}
    </dl>
    {active && <>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.description}</p>
      <p className="m-0 rounded-xl border border-assistant-border p-4 text-sm leading-6">{c.impact}</p>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.numberEffect}</p>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.editHint}</p>
      <p className="m-0 text-xs leading-5 text-assistant-muted">{c.expires}: <time dateTime={ticket.expiresAt}>
        {new Date(ticket.expiresAt).toISOString().replace("T", " ").replace("Z", " UTC")}
      </time></p>
    </>}
    {state === "confirmed" && <p className="m-0 text-sm leading-6">{c.confirmedEffect}</p>}
    <p role="status" className="m-0 text-sm font-semibold leading-6">{actionStatus}</p>
    {error && !confirmationOpen && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {!props.onOperate && active && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {active && <div className="flex min-w-0 flex-wrap gap-3">
      <button type="button" className={`${button} bg-error text-white`}
        disabled={busy || !review.canConfirm}
        onClick={() => {
          setTypedConfirmation("");
          setError("");
          setConfirmationOpen(true);
        }}>{c.reviewDelete}</button>
      <button type="button" className={`${button} border border-assistant-border text-assistant-accent`}
        disabled={busy || !review.canCancel}
        onClick={() => { void operate("cancel"); }}>{c.cancel}</button>
    </div>}
    {review.visible && state === "pending" && <ConfirmDialog
      open={confirmationOpen && review.state === "pending"}
      container={props.container}
      title={c.dialog.title}
      description={c.dialog.description}
      confirmLabel={c.dialog.confirm}
      cancelLabel={c.dialog.back}
      pending={working}
      pendingLabel={c.dialog.pending}
      destructive
      printHidden
      confirmation={{
        label: c.dialog.type,
        expectedValue: ticket.estimate.number,
        value: typedConfirmation,
        onChange: setTypedConfirmation,
      }}
      onClose={() => {
        if (!working) {
          setConfirmationOpen(false);
          setTypedConfirmation("");
        }
      }}
      onConfirm={() => operate("confirm", typedConfirmation)}>
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        <div className="min-w-0">
          <dt className="font-semibold text-muted">{c.dialog.estimate}</dt>
          <dd className="m-0 mt-1 grid gap-1 wrap-anywhere">
            <span>{ticket.estimate.number} · {c.dialog.revision(ticket.estimate.revision)}</span>
            <span>{view.review.name}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted">{c.dialog.parent}</dt>
          <dd className="m-0 mt-1 wrap-anywhere">
            {view.review.parent.number} · {view.review.parent.name}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted">{c.dialog.preparedFor}</dt>
          <dd className="m-0 mt-1 wrap-anywhere">
            {view.review.recipientName.trim() ? view.review.recipientName : c.dialog.notSpecified}
          </dd>
        </div>
      </dl>
      <p className="mb-0 mt-5 text-sm leading-6">{c.impact}</p>
      <p className="mb-0 mt-3 text-sm leading-6 text-muted">{c.numberEffect}</p>
      {error && <p role="alert" className="mb-0 mt-5 text-sm leading-6">{error}</p>}
    </ConfirmDialog>}
  </section>;
}

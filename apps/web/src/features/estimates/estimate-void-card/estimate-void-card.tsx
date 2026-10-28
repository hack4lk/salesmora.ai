"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoneyText } from "@salesmora/ui";
import { estimateVoidCardData as c } from "./estimate-void-card.data";
import { estimateVoidCardRequest, reviewEstimateVoidCard } from "./estimate-void-card.preview";
import type { EstimateVoidCardCommand, EstimateVoidCardProps } from "./estimate-void-card.types";

export type { EstimateVoidCardProps } from "./estimate-void-card.types";

export function EstimateVoidCard(props: EstimateVoidCardProps) {
  return <Review key={JSON.stringify({
    view: props.view, context: props.context, grants: props.grants, disabled: !!props.disabled, connected: !!props.onOperate,
  })} {...props} />;
}
function Review(props: EstimateVoidCardProps) {
  const id = useId(), mounted = useRef(false), lock = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState<EstimateVoidCardCommand["decision"] | null>(null);
  const [error, setError] = useState("");
  const review = reviewEstimateVoidCard(props, clock);
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
  function allowed(decision: EstimateVoidCardCommand["decision"]) {
    const current = reviewEstimateVoidCard(props, Date.now());
    return current.visible && (decision === "confirm" ? current.canConfirm : decision === "cancel" ? current.canCancel : current.canOpen);
  }
  async function operate(decision: EstimateVoidCardCommand["decision"]) {
    if (lock.current || submitted || !props.onOperate || !props.context) return;
    if (!allowed(decision)) { setClock(Date.now()); setError(c.changed); return; }
    lock.current = true; setWorking(true); setError("");
    try {
      const result = await props.onOperate(estimateVoidCardRequest(props.view, props.context.workspaceId, decision));
      if (!mounted.current) return;
      if (!allowed(decision)) { setClock(Date.now()); return; }
      if (result.ok) setSubmitted(decision);
      else setError(result.message.trim() || c.failure);
    } catch {
      if (mounted.current && allowed(decision)) setError(c.failure);
    } finally {
      if (mounted.current) { lock.current = false; setWorking(false); }
    }
  }
  const panel = "grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden";
  if (!review.visible) return <section aria-labelledby={id} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <p role="status" className="m-0 text-sm leading-6">{review.issue}</p>
  </section>;
  const { view, state } = review, { ticket } = view;
  const active = state === "pending", busy = working || submitted !== null || !props.onOperate;
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-labelledby={id} aria-busy={working} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <dl className="m-0 grid min-w-0 gap-4 text-sm">
      <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.source}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{c.reference(ticket.estimate.number, ticket.estimate.revision)}{" \u00b7 "}{ticket.estimate.name}</dd></div>
      {active && <>
        <div><dt className="font-semibold text-assistant-muted">{c.status}</dt>
          <dd className="m-0 mt-1">{c.statuses[ticket.estimate.status]}</dd></div>
        <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.parent[view.review.parent.type]}</dt>
          <dd className="m-0 mt-1 leading-6 wrap-anywhere">{view.review.parent.number}{" \u00b7 "}{view.review.parent.name}</dd></div>
        <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.recipient}</dt>
          <dd className="m-0 mt-1 leading-6 wrap-anywhere">{view.review.recipientName}</dd></div>
        <div><dt className="font-semibold text-assistant-muted">{c.total}</dt>
          <dd className="m-0 mt-1"><MoneyText cents={view.review.totalCents} /></dd></div>
      </>}
    </dl>
    {active && <>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.description}</p>
      <section aria-labelledby={`${id}-private`} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border p-4">
        <h4 id={`${id}-private`} className="m-0 text-base font-semibold">{c.privateTitle}</h4>
        <p className="m-0 text-sm leading-6 text-assistant-muted">{c.privateHint}</p>
        <p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{view.review.reason || c.missingReason}</p>
      </section>
      <div className="grid min-w-0 gap-3 rounded-xl border border-error bg-error/10 p-4">
        <p className="m-0 text-sm leading-6">{c.linkEffect}</p>
        <p className="m-0 text-sm leading-6">{c.deliveryEffect}</p>
      </div>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.editHint}</p>
      <p className="m-0 text-xs leading-5 text-assistant-muted">{c.expires}: <time dateTime={ticket.expiresAt}>
        {new Date(ticket.expiresAt).toISOString().replace("T", " ").replace("Z", " UTC")}
      </time></p>
    </>}
    {(active || state === "confirmed") && <p className="m-0 text-sm leading-6 text-assistant-muted">{c.recordEffect}</p>}
    {state === "confirmed" && <p className="m-0 text-sm leading-6">{c.confirmedEffect}</p>}
    <p role="status" className="m-0 text-sm font-semibold leading-6">{state !== "pending" && state !== "confirmed" ? c[state]
      : working ? c.working : submitted ? submitted === "open" ? c.openRequested : c.requested
        : state === "confirmed" ? c.confirmed : c.pending}</p>
    {error && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {!props.onOperate && (active || state === "confirmed") && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {active && <div className="flex min-w-0 flex-wrap gap-3">
      <button type="button" className={`${button} bg-error text-white`} disabled={busy || !review.canConfirm}
        onClick={() => { void operate("confirm"); }}>{c.confirm}</button>
      <button type="button" className={`${button} border border-assistant-border text-assistant-accent`} disabled={busy || !review.canCancel}
        onClick={() => { void operate("cancel"); }}>{c.cancel}</button>
    </div>}
    {state === "confirmed" && <button type="button" className={`${button} justify-self-start border border-assistant-border text-assistant-accent`}
      disabled={busy || !review.canOpen} onClick={() => { void operate("open"); }}>{c.open}</button>}
  </section>;
}

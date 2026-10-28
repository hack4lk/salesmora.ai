"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EstimateDraftContentReview } from "@salesmora/ui";
import { estimateDraftActionCardData as c } from "./estimate-draft-action-card.data";
import { estimateDraftActionCardRequest, reviewEstimateDraftActionCard } from "./estimate-draft-action-card.preview";
import type { EstimateDraftActionCardCommand, EstimateDraftActionCardProps } from "./estimate-draft-action-card.types";

export type { EstimateDraftActionCardProps } from "./estimate-draft-action-card.types";

export function EstimateDraftActionCard(props: EstimateDraftActionCardProps) {
  return <Review key={JSON.stringify({
    view: props.view, context: props.context, grants: props.grants, disabled: props.disabled, connected: !!props.onOperate,
  })} {...props} />;
}
function Review(props: EstimateDraftActionCardProps) {
  const id = useId(), mounted = useRef(false), lock = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState<EstimateDraftActionCardCommand["decision"] | null>(null);
  const [error, setError] = useState("");
  const review = reviewEstimateDraftActionCard(props, clock);
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
  async function operate(decision: EstimateDraftActionCardCommand["decision"]) {
    if (lock.current || working || submitted || !props.onOperate || !props.context) return;
    const current = reviewEstimateDraftActionCard(props, Date.now());
    if (!current.visible || !(decision === "confirm" ? current.canConfirm : decision === "cancel" ? current.canCancel : current.canOpen)) {
      setClock(Date.now()); setError(c.changed); return;
    }
    lock.current = true; setWorking(true); setError("");
    try {
      const result = await props.onOperate(estimateDraftActionCardRequest(current.view, props.context.workspaceId, decision));
      if (!mounted.current) return;
      if (result.ok) setSubmitted(decision);
      else setError(result.message.trim() || c.failure);
    } catch {
      if (mounted.current) setError(c.failure);
    } finally {
      if (mounted.current) { lock.current = false; setWorking(false); }
    }
  }
  const panel = "grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden";
  if (!review.visible) return <section aria-labelledby={id} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <p role="status" className="m-0 text-sm leading-6">{review.issue}</p>
  </section>;
  const { view, kind, state, content, contentReview } = review;
  const { ticket, receipt } = view, { values, parent } = view.review;
  const active = state === "pending";
  const busy = working || submitted !== null || !props.onOperate;
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-labelledby={id} aria-busy={working} className={panel}>
    <h3 id={id} className="m-0 text-lg font-semibold">{c.titles[kind]}</h3>
    <dl className="m-0 grid min-w-0 gap-4 text-sm">
      <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.source}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{c.reference(ticket.source.number, ticket.source.revision)} · {ticket.source.name}</dd></div>
      {active && <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.parent[parent.type]}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{parent.number} · {parent.name}</dd></div>}
      {active && <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{kind === "reuse" ? c.existing : c.proposed}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{kind === "duplicate" ? c.duplicateNumber
          : kind === "reuse" ? c.reference(ticket.source.number, ticket.plan.revision)
            : c.revision(ticket.source.number, ticket.plan.revision)}</dd></div>}
      {state === "confirmed" && receipt && <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.result}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{c.reference(receipt.number, receipt.revision)}</dd></div>}
    </dl>
    {active && <>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.description}</p>
      <p className="m-0 text-sm leading-6">{kind === "duplicate" ? c.duplicateRules : kind === "reuse" ? c.reuseRules : c.reviseRules}</p>
      <dl className="m-0 grid min-w-0 gap-4 text-sm">
        {([
          [c.fields.recipientName, values.details.recipientName],
          [c.fields.recipientEmail, values.details.recipientEmail],
          [c.fields.serviceAddress, values.details.serviceAddress],
          [c.fields.owner, values.details.ownerId ? c.savedTeammate : c.unassigned],
          [c.fields.paymentLink, values.paymentLink ?? ""],
        ] as const).map(([label, value]) => <div key={label} className="min-w-0">
          <dt className="font-semibold text-assistant-muted">{label}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{value || (kind === "duplicate" && label !== c.fields.serviceAddress ? c.cleared : c.empty)}</dd>
        </div>)}
      </dl>
      {kind !== "duplicate" && values.paymentLink && <p className="m-0 text-sm leading-6">{c.paymentHint}</p>}
      <EstimateDraftContentReview content={content} label={kind === "reuse" ? c.existing : c.proposed} review={contentReview} />
      <section aria-labelledby={`${id}-private`} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border p-4">
        <h4 id={`${id}-private`} className="m-0 text-base font-semibold">{c.privateTitle}</h4>
        <p className="m-0 text-sm leading-6 text-assistant-muted">{c.privateHint}</p>
        <dl className="m-0 min-w-0 text-sm"><dt className="font-semibold text-assistant-muted">{c.fields.internalNotes}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{kind === "revise" ? c.noNotesCopied : values.internalNotes || c.empty}</dd></dl>
      </section>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.editHint}</p>
      {review.expires !== null && <p className="m-0 text-xs leading-5 text-assistant-muted">{c.expires}: <time dateTime={ticket.expiresAt}>
        {new Date(review.expires).toISOString().replace("T", " ").replace("Z", " UTC")}
      </time></p>}
    </>}
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.effects}</p>
    <p role="status" className="m-0 text-sm font-semibold leading-6">{working ? c.working : submitted
      ? submitted === "open" ? c.openRequested : c.requested
      : state === "confirmed" ? c.confirmed[kind] : state === "pending" ? c.pending : c[state]}</p>
    {error && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {!props.onOperate && (active || state === "confirmed") && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {active && <div className="flex min-w-0 flex-wrap gap-3">
      <button type="button" className={`${button} bg-assistant-accent text-assistant-surface`} disabled={busy || !review.canConfirm}
        onClick={() => { void operate("confirm"); }}>{c.confirm[kind]}</button>
      <button type="button" className={`${button} border border-assistant-border text-assistant-accent`} disabled={busy || !review.canCancel}
        onClick={() => { void operate("cancel"); }}>{c.cancel}</button>
    </div>}
    {state === "confirmed" && receipt && <button type="button"
      className={`${button} justify-self-start border border-assistant-border text-assistant-accent`}
      disabled={busy || !review.canOpen} onClick={() => { void operate("open"); }}>{c.open}</button>}
  </section>;
}

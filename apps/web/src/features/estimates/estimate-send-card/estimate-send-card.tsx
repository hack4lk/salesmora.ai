"use client";

import { isValidElement, useEffect, useId, useRef, useState } from "react";
import { MoneyText } from "@salesmora/ui";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimateSendCardData as c } from "./estimate-send-card.data";
import { estimateSendCardRequest, reviewEstimateSendCard } from "./estimate-send-card.preview";
import type { EstimateSendCardProps } from "./estimate-send-card.types";

export type { EstimateSendCardProps } from "./estimate-send-card.types";

export function EstimateSendCard(props: EstimateSendCardProps) {
  const id = useId();
  if (!props.capabilities.read || !props.parentAccess || props.proposal.state === "forbidden") {
    return <section aria-labelledby={id} className="rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
      <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
      <p role="status" className="mb-0 mt-3 text-sm leading-6">{c.unavailable}</p>
    </section>;
  }
  const { preview, ...context } = props.context ?? {};
  const previewMetadata = preview?.state === "ready"
    ? { state: preview.state, estimateId: preview.estimateId, version: preview.version, snapshotHash: preview.snapshotHash, hasContent: isValidElement(preview.content) }
    : preview;
  const session = JSON.stringify({
    proposal: props.proposal, context, previewMetadata,
    capabilities: props.capabilities, parentAccess: props.parentAccess,
    disabled: props.disabled, handler: !!props.onDecide,
  });
  return <SendReview key={session} {...props} />;
}

/** Callback acknowledgement is not a send outcome; terminal status is supplied by the host. */
function SendReview(props: EstimateSendCardProps) {
  const { proposal, context, onDecide, disabled = false } = props;
  const id = useId(), locked = useRef(false), mounted = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const review = reviewEstimateSendCard(props, clock);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (review.expires === null) return;
    const expires = review.expires;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const now = Date.now();
      if (expires <= now) setClock(now);
      else timer = setTimeout(check, Math.min(2147483647, expires - now));
    };
    check();
    return () => clearTimeout(timer);
  }, [review.expires]);
  const state = proposal.state === "pending" && review.expired ? "expired" : proposal.state;
  const active = state === "pending" && !submitted;
  const busy = working || disabled;
  async function decide(decision: "confirm" | "cancel") {
    if (locked.current || busy || !active || !onDecide) return;
    const current = reviewEstimateSendCard(props, Date.now());
    if (current.expired) { setClock(Date.now()); return; }
    if (!(decision === "confirm" ? current.canConfirm : current.canCancel)) {
      setError(current.issues[0] ?? c.failure);
      return;
    }
    locked.current = true; setWorking(true); setError("");
    try {
      const result = await onDecide({ ...estimateSendCardRequest(proposal), decision });
      if (!mounted.current) return;
      if (!result.ok) setError(result.message.trim() || c.failure);
      else setSubmitted(true);
    } catch {
      if (mounted.current) setError(c.failure);
    } finally {
      if (mounted.current) { locked.current = false; setWorking(false); }
    }
  }
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  const record = proposal.estimate;
  return <section aria-labelledby={id} aria-busy={working} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
    <h3 id={id} className="m-0 text-lg font-semibold">{c.title}</h3>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.description}</p>
    <dl className="m-0 grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-message p-4 text-sm">
      {(Object.keys(c.labels) as (keyof typeof c.labels)[]).map((field) => <div key={field} className="min-w-0">
        <dt className="font-semibold text-assistant-muted">{c.labels[field]}</dt>
        <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{field === "totalCents"
          ? record.totalCents === null || !Number.isSafeInteger(record.totalCents) || record.totalCents < 0 ? c.empty : <MoneyText cents={record.totalCents} />
          : field === "number" ? <>{record.number || c.empty} · {c.revision(record.revision)}</>
            : field === "subject" ? proposal.subject || c.empty
              : field === "validUntil" ? isEstimateLocalDate(record.validUntil) ? <time dateTime={record.validUntil}>{record.validUntil}</time> : c.empty
                : record[field] || c.empty}
        </dd>
      </div>)}
    </dl>
    {review.issues.length > 0 && <ul aria-label={c.issuesLabel} className="m-0 grid min-w-0 gap-2 pl-5 text-sm leading-6">
      {review.issues.map((issue) => <li key={issue} className="wrap-anywhere">{issue}</li>)}
    </ul>}
    {review.previewUsable && context?.preview?.state === "ready" ? <details open className="min-w-0 rounded-xl border border-assistant-border">
      <summary className="min-h-11 cursor-pointer rounded-xl p-3 text-sm font-semibold focus-visible:focus-ring">{c.preview}</summary>
      <div className="grid min-w-0 gap-3 p-3">
        <p className="m-0 text-sm leading-6 text-assistant-muted">{c.previewHint}</p>
        {context.preview.content}
      </div>
    </details> : context?.preview?.state === "loading" && <p role="status" className="m-0 text-sm leading-6">{c.previewLoading}</p>}
    {review.expires !== null && <p className="m-0 text-xs leading-5 text-assistant-muted">
      {c.expires}: <time dateTime={proposal.expiresAt}>{new Date(review.expires).toISOString().replace("T", " ").replace("Z", " UTC")}</time>
    </p>}
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.effects}</p>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.editorHint}</p>
    <p role="status" className="m-0 text-sm font-semibold leading-6">{working ? c.working
      : state !== "pending" ? c.states[state] : submitted ? c.requested : c.states.pending}</p>
    {error && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {!onDecide && state === "pending" && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {active && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy || !review.canConfirm} className={`${button} bg-assistant-accent text-assistant-surface`}
        onClick={() => { void decide("confirm"); }}>{c.confirm}</button>
      <button type="button" disabled={busy || !review.canCancel} className={`${button} border border-assistant-border text-assistant-accent`}
        onClick={() => { void decide("cancel"); }}>{c.cancel}</button>
    </div>}
  </section>;
}

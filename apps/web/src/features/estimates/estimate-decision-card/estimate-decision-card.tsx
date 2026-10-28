"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoneyText } from "@salesmora/ui";
import { isEstimateDecisionChannel, isEstimateDecisionOutcome, isEstimateRecordedDecisionCurrent } from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimateDecisionCardData as c } from "./estimate-decision-card.data";
import { estimateDecisionCardRequest, reviewEstimateDecisionCard } from "./estimate-decision-card.preview";
import type { EstimateDecisionCardProps } from "./estimate-decision-card.types";

export type { EstimateDecisionCardProps } from "./estimate-decision-card.types";

function DecisionDetails({ label, value }: {
  label: string;
  value: Pick<EstimateDecisionCardProps["proposal"]["value"], "outcome" | "decisionDate" | "channel" | "note">;
}) {
  const id = useId();
  return <section aria-labelledby={id} className="grid min-w-0 content-start gap-4 rounded-xl border border-assistant-border bg-assistant-message p-4">
    <h4 id={id} className="m-0 text-base font-semibold">{label}</h4>
    <dl className="m-0 grid min-w-0 gap-4 text-sm">
      {([
        [c.outcome, isEstimateDecisionOutcome(value.outcome) ? c.outcomes[value.outcome] : c.missing],
        [c.date, isEstimateLocalDate(value.decisionDate) ? <time dateTime={value.decisionDate}>{value.decisionDate}</time> : c.missing],
        [c.channel, isEstimateDecisionChannel(value.channel) ? c.channels[value.channel] : c.missing],
        [c.note, value.note || c.missing],
      ] as const).map(([label, content]) => <div key={label} className="min-w-0">
        <dt className="font-semibold text-assistant-muted">{label}</dt>
        <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{content}</dd>
      </div>)}
    </dl>
  </section>;
}

export function EstimateDecisionCard(props: EstimateDecisionCardProps) {
  const id = useId();
  if (!props.capabilities.read || !props.parentAccess || props.proposal.state === "forbidden") {
    return <section aria-labelledby={id} className="rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
      <h3 id={id} className="m-0 text-lg font-semibold">{c.titles.record}</h3>
      <p role="status" className="mb-0 mt-3 text-sm leading-6">{c.unavailable}</p>
    </section>;
  }
  const session = JSON.stringify({
    proposal: props.proposal, context: props.context, capabilities: props.capabilities, parentAccess: props.parentAccess,
    canCorrectDecision: props.canCorrectDecision, handler: !!props.onDecide,
  });
  return <DecisionReview key={session} {...props} />;
}

/** Only an authoritative host status can mark this proposal saved or cancelled. */
function DecisionReview(props: EstimateDecisionCardProps) {
  const { proposal, context, disabled = false, onDecide } = props;
  const id = useId(), locked = useRef(false), mounted = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const review = reviewEstimateDecisionCard(props, clock);
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
  const busy = disabled || working;
  async function decide(decision: "confirm" | "cancel") {
    if (locked.current || busy || !active || !onDecide) return;
    const current = reviewEstimateDecisionCard(props, Date.now());
    if (current.expired) { setClock(Date.now()); return; }
    if (!(decision === "confirm" ? current.canConfirm : current.canCancel)) {
      setError(current.issues[0] ?? c.failure);
      return;
    }
    locked.current = true; setWorking(true); setError("");
    try {
      const result = await onDecide({ ...estimateDecisionCardRequest(proposal), decision });
      if (!mounted.current) return;
      if (!result.ok) setError(result.message.trim() || c.failure);
      else setSubmitted(true);
    } catch {
      if (mounted.current) setError(c.failure);
    } finally {
      if (mounted.current) { locked.current = false; setWorking(false); }
    }
  }
  const record = proposal.estimate;
  const previous = proposal.mode === "correct" && isEstimateRecordedDecisionCurrent(record) ? record.decision : null;
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-labelledby={id} aria-busy={working} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
    <h3 id={id} className="m-0 text-lg font-semibold">{c.titles[proposal.mode]}</h3>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.descriptions[proposal.mode]}</p>
    <dl className="m-0 grid min-w-0 gap-4 text-sm">
      {(Object.keys(c.labels) as (keyof typeof c.labels)[]).map((field) => <div key={field} className="min-w-0">
        <dt className="font-semibold text-assistant-muted">{c.labels[field]}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{field === "totalCents"
          ? record.totalCents === null || !Number.isSafeInteger(record.totalCents) || record.totalCents < 0 ? c.missing : <MoneyText cents={record.totalCents} />
          : field === "number" ? <>{record.number || c.missing} · {c.revision(record.revision)}</> : record[field] || c.missing}
        </dd>
      </div>)}
      <div className="min-w-0"><dt className="font-semibold text-assistant-muted">{c.timezone}</dt>
        <dd className="m-0 mt-1 leading-6 wrap-anywhere">{context?.timezone || c.missing}</dd></div>
    </dl>
    <div className={`grid min-w-0 gap-4 ${proposal.mode === "correct" ? "sm:grid-cols-2" : ""}`}>
      {proposal.mode === "correct" && (previous ? <DecisionDetails label={c.current} value={previous} />
        : <p className="m-0 text-sm leading-6">{c.previousUnavailable}</p>)}
      <DecisionDetails label={c.proposed} value={proposal.value} />
    </div>
    {proposal.mode === "correct" && <dl className="m-0 min-w-0 text-sm">
      <dt className="font-semibold text-assistant-muted">{c.reason}</dt>
      <dd className="m-0 mt-1 whitespace-pre-wrap leading-6 wrap-anywhere">{proposal.value.reason || c.missing}</dd>
    </dl>}
    {review.issues.length > 0 && <ul aria-label={c.issuesLabel} className="m-0 grid min-w-0 gap-2 pl-5 text-sm leading-6">
      {review.issues.map((issue) => <li key={issue} className="wrap-anywhere">{issue}</li>)}
    </ul>}
    {review.expires !== null && <p className="m-0 text-xs leading-5 text-assistant-muted">
      {c.expires}: <time dateTime={proposal.expiresAt}>{new Date(review.expires).toISOString().replace("T", " ").replace("Z", " UTC")}</time>
    </p>}
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.effects}</p>
    {isEstimateDecisionOutcome(proposal.value.outcome) && <p className="m-0 text-sm leading-6 text-assistant-muted">
      {proposal.value.outcome === "accepted" ? c.acceptedEffect : c.declinedEffect}
    </p>}
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.reviewHint}</p>
    <p role="status" className="m-0 text-sm font-semibold leading-6">{working ? c.working : state !== "pending"
      ? c.states[state] : submitted ? c.requested : c.states.pending}</p>
    {error && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {!onDecide && state === "pending" && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {active && onDecide && <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy || !review.canConfirm} className={`${button} bg-assistant-accent text-assistant-surface`}
        onClick={() => { void decide("confirm"); }}>{c.confirm[proposal.mode]}</button>
      <button type="button" disabled={busy || !review.canCancel} className={`${button} border border-assistant-border text-assistant-accent`}
        onClick={() => { void decide("cancel"); }}>{c.cancel}</button>
    </div>}
  </section>;
}

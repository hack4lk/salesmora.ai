"use client";

import { useEffect, useId, useRef, useState } from "react";
import { estimateItemLimits, type EstimateAdjustment } from "@salesmora/domain";
import { MoneyText } from "../../data-display/money-text/money-text";
import { estimateDraftCardData as c } from "./estimate-draft-card.data";
import { estimateDraftRequest, reviewEstimateDraft, reviewEstimateDraftContent } from "./estimate-draft-card.preview";
import type {
  EstimateDraftContent, EstimateDraftContext, EstimateDraftDecisionRequest, EstimateDraftGrants,
  EstimateDraftOperationResult, EstimateDraftProposal, EstimateDraftRequest,
} from "./estimate-draft-card.types";

export type EstimateDraftCardProps = {
  draft: EstimateDraftProposal;
  /** Current scoped grants and binding come from the authorized host, not proposal text. */
  context: EstimateDraftContext | null;
  grants: EstimateDraftGrants;
  disabled?: boolean;
  onDecide?: (request: EstimateDraftDecisionRequest) => Promise<EstimateDraftOperationResult>;
  onReviewInEditor?: (request: EstimateDraftRequest) => Promise<EstimateDraftOperationResult>;
};

function adjustment(value: EstimateAdjustment) {
  return value.type === "none" ? c.adjustmentNone : value.type === "percent" ? c.percent(value.value) : c.amount(value.value);
}

export function EstimateDraftContentReview({ content, label, review }: {
  content: EstimateDraftContent; label: string; review: ReturnType<typeof reviewEstimateDraftContent>;
}) {
  const id = useId();
  return <section aria-labelledby={id} className="grid min-w-0 content-start gap-4 rounded-xl border border-assistant-border bg-assistant-message p-4">
    <h4 id={id} className="m-0 text-base font-semibold">{label}</h4>
    <dl className="m-0 grid min-w-0 gap-4">
      {(Object.keys(c.fields) as (keyof typeof c.fields)[]).map((field) => <div key={field} className="min-w-0">
        <dt className="text-sm font-semibold text-assistant-muted">{c.fields[field]}</dt>
        <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">
          {field === "discount" || field === "deposit" ? adjustment(content[field])
            : field === "taxRate" ? c.percent(content[field])
              : field === "validUntil" && content[field] ? <time dateTime={content[field]}>{content[field]}</time>
                : content[field] || c.empty}
        </dd>
      </div>)}
    </dl>
    <h5 className="m-0 text-sm font-semibold">{c.items}</h5>
    {content.items.length ? <ol className="m-0 grid min-w-0 list-none gap-4 p-0" role="list" aria-label={`${label}: ${c.items}`}>
      {content.items.slice(0, estimateItemLimits.count).map((line, index) => {
        const invalid = Object.keys(review.calculation.items.items[index]?.errors ?? {}).length > 0;
        return <li key={`${line.id}:${index}`} className="grid min-w-0 gap-3 border-t border-assistant-border pt-4">
          <h6 className="m-0 text-sm font-semibold">{c.line(index + 1)}</h6>
          <dl className="m-0 grid min-w-0 grid-cols-2 gap-3 text-sm">
            {([
              [c.descriptionLabel, line.description || c.empty],
              [c.quantity, line.quantity || c.empty],
              [c.unit, line.unit || c.empty],
            ] as const).map(([name, value], position) => <div key={name} className={`min-w-0 ${position === 0 ? "col-span-2" : ""}`}>
              <dt className="font-semibold text-assistant-muted">{name}</dt>
              <dd className="m-0 mt-1 whitespace-pre-wrap wrap-anywhere">{value}</dd>
            </div>)}
            <div><dt className="font-semibold text-assistant-muted">{c.unitPrice}</dt>
              <dd className="m-0 mt-1">{review.needsPrice[index] ? c.needsPrice : <MoneyText cents={review.unitPrices[index]} />}</dd></div>
            <div><dt className="font-semibold text-assistant-muted">{c.lineAmount}</dt>
              <dd className="m-0 mt-1">{review.calculation.items.items[index]?.amountCents == null ? c.amountUnavailable
                : <MoneyText cents={review.calculation.items.items[index]?.amountCents} />}</dd></div>
          </dl>
          <p className="m-0 text-sm text-assistant-muted">{line.taxable ? c.taxable : c.notTaxable}</p>
          {line.included && <p className="m-0 text-sm font-semibold">{c.included}</p>}
          {!review.needsPrice[index] && <p className="m-0 text-sm text-assistant-muted wrap-anywhere">
            {line.priceSource.type === "catalog" || line.priceSource.type === "rule" ? c.sources[line.priceSource.type](line.priceSource.name)
              : line.priceSource.type === "user" || line.priceSource.type === "saved" ? c.sources[line.priceSource.type] : c.needsPrice}
          </p>}
          {invalid && <p className="m-0 text-sm leading-6">{c.invalidLine}</p>}
        </li>;
      })}
    </ol> : <p className="m-0 text-sm leading-6 text-assistant-muted">{c.noItems}</p>}
    <dl aria-label={`${label}: ${c.totals.totalCents}`} className="m-0 grid gap-3 border-t border-assistant-border pt-4 text-sm">
      {(Object.keys(c.totals) as (keyof typeof c.totals)[]).map((field) => {
        const cents = field === "subtotalCents" ? review.calculation.items.subtotalCents : review.calculation[field];
        return <div key={field} className="grid min-w-0 grid-cols-2 gap-3">
          <dt className="font-semibold text-assistant-muted">{c.totals[field]}</dt>
          <dd className="m-0 text-right">{cents === null ? c.amountUnavailable : <MoneyText cents={cents} />}</dd>
        </div>;
      })}
    </dl>
  </section>;
}

/** The host owns persistence/status. Resolving an operation never marks the proposal confirmed. */
export function EstimateDraftCard(props: EstimateDraftCardProps) {
  const id = useId();
  if (!props.grants.read || !props.grants.parentAccess || props.draft.state === "forbidden") {
    return <section aria-labelledby={id} className="rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
      <h3 id={id} className="m-0 text-lg font-semibold">{c.stories.title}</h3>
      <p role="status" className="mb-0 mt-3 text-sm leading-6">{c.unavailable}</p>
    </section>;
  }
  const session = JSON.stringify({
    draft: props.draft, context: props.context, grants: props.grants, disabled: props.disabled,
    decide: !!props.onDecide, editor: !!props.onReviewInEditor,
  });
  return <Review key={session} {...props} />;
}

function Review({ draft, context, grants, disabled = false, onDecide, onReviewInEditor }: EstimateDraftCardProps) {
  const id = useId(), lock = useRef(false), mounted = useRef(false);
  const [clock, setClock] = useState(Date.now);
  const [working, setWorking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editorRequested, setEditorRequested] = useState(false);
  const [error, setError] = useState("");
  const review = reviewEstimateDraft(draft, context, clock);
  const expires = review.expires;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (expires === null || expires <= Date.now()) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const now = Date.now();
      if (expires <= now) setClock(now);
      else timer = setTimeout(check, Math.min(2147483647, expires - now));
    };
    check();
    return () => clearTimeout(timer);
  }, [expires]);
  const state = draft.state === "pending" && review.expired ? "expired" : draft.state;
  const canApply = draft.actionType === "estimate.create" ? grants.create : grants.update;
  const active = state === "pending" && !submitted;
  const busy = disabled || working || submitted;
  const editorEligible = active && canApply && review.bound && review.targetReady && review.validMetadata;
  async function operate(operation: "confirm" | "cancel" | "editor") {
    if (lock.current || busy || !active) return;
    const current = reviewEstimateDraft(draft, context, Date.now());
    if (current.expired) { setClock(Date.now()); return; }
    if (!current.validMetadata || !current.bound) {
      setError(!current.validMetadata ? c.issues.metadata : c.issues.binding);
      return;
    }
    if (operation !== "cancel" && (!canApply || !current.bound || !current.targetReady || !current.validMetadata)) return;
    if (operation === "confirm" && !current.canConfirm) return;
    const handler = operation === "editor" ? onReviewInEditor : onDecide;
    if (!handler) return;
    lock.current = true; setWorking(true); setError("");
    const request = estimateDraftRequest(draft);
    try {
      const result = operation === "editor" ? await onReviewInEditor!(request) : await onDecide!({ ...request, decision: operation });
      if (!mounted.current) return;
      if (!result.ok) setError(result.message.trim() || c.failure);
      else if (operation === "editor") setEditorRequested(true);
      else setSubmitted(true);
    } catch {
      if (mounted.current) setError(c.failure);
    } finally {
      if (mounted.current) { lock.current = false; setWorking(false); }
    }
  }
  const button = "min-h-11 max-w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-labelledby={id} aria-busy={working} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground print:hidden">
    <h3 id={id} className="m-0 text-lg font-semibold">{c.titles[draft.actionType]}</h3>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.description}</p>
    <p className="m-0 text-sm font-semibold wrap-anywhere">{c.parent[draft.parent.type]}: {draft.parent.number} · {draft.parent.name}</p>
    <p className="m-0 text-sm leading-6 wrap-anywhere">{draft.actionType === "estimate.update"
      ? c.reference(draft.estimate.number, draft.estimate.revision) : c.newNumber}</p>
    <div className={`grid min-w-0 gap-4 ${draft.actionType === "estimate.update" ? "sm:grid-cols-2" : ""}`}>
      {draft.actionType === "estimate.update" && review.current && <EstimateDraftContentReview content={draft.current} label={c.before} review={review.current} />}
      <EstimateDraftContentReview content={draft.proposed} label={c.after} review={review.proposed} />
    </div>
    {review.issues.length > 0 && <ul aria-label={c.editorHint} className="m-0 grid min-w-0 gap-2 pl-5 text-sm leading-6">
      {review.issues.map((issue) => <li key={issue} className="wrap-anywhere">{issue}</li>)}
    </ul>}
    {review.expires !== null && <p className="m-0 text-xs leading-5 text-assistant-muted">
      {c.expires}: <time dateTime={draft.expiresAt}>{new Date(review.expires).toISOString().replace("T", " ").replace(".000Z", " UTC").replace("Z", " UTC")}</time>
    </p>}
    <p className="m-0 text-sm leading-6 text-assistant-muted">{c.effects}</p>
    {state === "pending" && <p className="m-0 text-sm leading-6 text-assistant-muted">{c.editorHint}</p>}
    <p role="status" className="m-0 text-sm font-semibold leading-6">{working ? c.working : state !== "pending" ? c.states[state]
      : submitted ? c.requested : !review.changed ? c.unchanged : c.states.pending}</p>
    {editorRequested && active && <p role="status" className="m-0 text-sm leading-6">{c.editorRequested}</p>}
    {error && <p role="alert" className="m-0 text-sm leading-6">{error}</p>}
    {state === "pending" && !canApply && <p className="m-0 text-sm leading-6">{c.noPermission}</p>}
    {state === "pending" && !onDecide && <p className="m-0 text-sm leading-6">{c.noHandler}</p>}
    {state === "pending" && !onReviewInEditor && <p className="m-0 text-sm leading-6">{c.noEditor}</p>}
    {active && <div className="flex flex-wrap gap-3">
      {onReviewInEditor && <button type="button" disabled={busy || !editorEligible} className={`${button} border border-assistant-border text-assistant-accent`}
        onClick={() => { void operate("editor"); }}>{c.review}</button>}
      {onDecide && <>
        <button type="button" disabled={busy || !canApply || !review.canConfirm} className={`${button} bg-assistant-accent text-assistant-surface`}
          onClick={() => { void operate("confirm"); }}>{c.confirm[draft.actionType]}</button>
        <button type="button" disabled={busy || !review.validMetadata || !review.bound} className={`${button} border border-assistant-border text-assistant-accent`}
          onClick={() => { void operate("cancel"); }}>{c.cancel}</button>
      </>}
    </div>}
  </section>;
}

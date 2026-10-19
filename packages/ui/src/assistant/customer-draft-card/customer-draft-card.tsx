"use client";
import { useEffect, useId, useRef, useState } from "react";
import { customerDraftCardData as c } from "./customer-draft-card.data";
export type CustomerDraftAction = keyof typeof c.actions;
export type CustomerDraftState = keyof typeof c.states;
export type CustomerDraftProposal = {
  id: string;
  customer: { name: string; number: string };
  action: CustomerDraftAction;
  changes: readonly { label: string; before: string; after: string }[];
  state: CustomerDraftState;
  expiresAt: string;
  impact?: string;
  unlinkLeadCount?: number;
  activeJobCount?: number;
};
export type CustomerDraftCardProps = {
  draft: CustomerDraftProposal;
  disabled?: boolean;
  onDecide?: (
    draft: CustomerDraftProposal,
    decision: "confirm" | "cancel",
    deletionConsent?: { typedCustomerNumber: string; unlinkOpenLeads: boolean },
  ) => Promise<void>;
};
export function CustomerDraftCard(props: CustomerDraftCardProps) {
  return (
    <CustomerReview
      key={`${props.draft.id}:${props.draft.expiresAt}:${props.draft.action}`}
      {...props}
    />
  );
}
function CustomerReview({ draft, disabled, onDecide }: CustomerDraftCardProps) {
  const id = useId(),
    lock = useRef(false),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [typed, setTyped] = useState(""),
    [unlinkConsent, setUnlinkConsent] = useState(false);
  const deadline = Date.parse(draft.expiresAt),
    [expired, setExpired] = useState(
      () => !Number.isFinite(deadline) || deadline <= Date.now(),
    );
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if (deadline <= Date.now()) setExpired(true);
      else
        timer = setTimeout(check, Math.min(2147483647, deadline - Date.now()));
    };
    check();
    return () => clearTimeout(timer);
  }, [deadline]);
  const state = draft.state === "pending" && expired ? "expired" : draft.state;
  const pending = working || state === "confirming";
  const unchanged =
    draft.action === "update" &&
    !draft.changes.some((change) => change.before !== change.after);
  const deletionBlocked =
    draft.action === "delete" &&
    ((draft.activeJobCount ?? 0) > 0 ||
      typed !== draft.customer.number ||
      !draft.customer.number.trim() ||
      ((draft.unlinkLeadCount ?? 0) > 0 && !unlinkConsent));
  async function decide(decision: "confirm" | "cancel") {
    if (lock.current || disabled || pending || state !== "pending" || !onDecide)
      return;
    if (!Number.isFinite(deadline) || deadline <= Date.now()) {
      setExpired(true);
      return;
    }
    if (decision === "confirm" && (unchanged || deletionBlocked)) return;
    lock.current = true;
    setWorking(true);
    setError("");
    try {
      if (draft.action === "delete" && decision === "confirm")
        await onDecide(draft, decision, {
          typedCustomerNumber: typed,
          unlinkOpenLeads: unlinkConsent,
        });
      else await onDecide(draft, decision);
    } catch {
      setError(c.failed);
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  return (
    <section
      aria-labelledby={id}
      aria-busy={pending}
      className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
    >
      <h3 id={id} className="m-0 text-lg font-semibold">
        {c.actions[draft.action]}
      </h3>
      <p className="m-0 text-sm font-semibold wrap-anywhere">
        {draft.customer.number} · {draft.customer.name}
      </p>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.hint}</p>
      <dl className="m-0 grid min-w-0 gap-4">
        {draft.changes.map((change, index) => (
          <div
            key={`${change.label}:${index}`}
            className="min-w-0 rounded-xl border border-assistant-border p-4"
          >
            <dt className="text-sm font-semibold wrap-anywhere">
              {change.label}
            </dt>
            <dd className="m-0 mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-1 mt-0 text-assistant-muted">{c.before}</p>
                <p className="m-0 whitespace-pre-wrap wrap-anywhere">
                  {change.before || c.empty}
                </p>
              </div>
              <div className="min-w-0 rounded-lg bg-assistant-message p-3">
                <p className="mb-1 mt-0 text-assistant-muted">{c.after}</p>
                <p className="m-0 whitespace-pre-wrap wrap-anywhere">
                  {change.after || c.cleared}
                </p>
              </div>
            </dd>
          </div>
        ))}
      </dl>
      {draft.impact && (
        <p className="m-0 text-sm leading-6 wrap-anywhere">{draft.impact}</p>
      )}
      {draft.action === "delete" && (draft.activeJobCount ?? 0) > 0 && (
        <p role="alert" className="m-0 text-sm">
          {c.blocked}
        </p>
      )}
      {draft.action === "delete" &&
        (draft.unlinkLeadCount ?? 0) > 0 &&
        state === "pending" && (
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={unlinkConsent}
              disabled={disabled || pending || (draft.activeJobCount ?? 0) > 0}
              onChange={(event) => setUnlinkConsent(event.target.checked)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-assistant-accent focus-visible:focus-ring"
            />
            <span>{c.unlinkConsent(draft.unlinkLeadCount!)}</span>
          </label>
        )}
      {draft.action === "delete" && state === "pending" && (
        <label className="grid gap-2 text-sm font-semibold">
          {c.type(draft.customer.number)}
          <input
            value={typed}
            disabled={disabled || pending}
            autoComplete="off"
            onChange={(e) => setTyped(e.target.value)}
            className="min-h-11 w-full min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3 text-assistant-foreground focus-visible:focus-ring"
          />
        </label>
      )}
      <p role="status" className="m-0 text-sm font-semibold">
        {pending
          ? c.states.confirming
          : unchanged && state === "pending"
            ? c.unchanged
            : c.states[state]}
      </p>
      {error && (
        <p role="alert" className="m-0 text-sm">
          {error}
        </p>
      )}
      {state === "pending" && onDecide && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={disabled || pending || unchanged || deletionBlocked}
            onClick={() => void decide("confirm")}
            className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {c.confirm}
          </button>
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => void decide("cancel")}
            className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-foreground focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {c.cancel}
          </button>
        </div>
      )}
    </section>
  );
}

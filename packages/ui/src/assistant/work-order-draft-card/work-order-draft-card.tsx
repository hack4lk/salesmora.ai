"use client";
import { useEffect, useId, useRef, useState } from "react";
import { workOrderDraftCardData as c } from "./work-order-draft-card.data";
export type WorkOrderDraftAction = keyof typeof c.actions;
export type WorkOrderDraftState = keyof typeof c.states;
export type WorkOrderDraftProposal = {
  id: string;
  workOrder: { id?: string; number: string; title: string };
  action: WorkOrderDraftAction;
  changes: readonly { label: string; before: string; after: string }[];
  state: WorkOrderDraftState;
  expiresAt: string;
  warnings?: readonly string[];
  impact?: string;
  count?: number;
  columns?: readonly string[];
};
export type WorkOrderDraftCardProps = {
  draft: WorkOrderDraftProposal;
  disabled?: boolean;
  onDecide?: (draft: WorkOrderDraftProposal, decision: "confirm" | "cancel") => Promise<void>;
  onOpen?: (workOrderId: string) => void;
};
export function WorkOrderDraftCard(props: WorkOrderDraftCardProps) {
  return <Review key={`${props.draft.id}:${props.draft.expiresAt}:${props.draft.action}`} {...props} />;
}
function Review({ draft, disabled, onDecide, onOpen }: WorkOrderDraftCardProps) {
  const id = useId(),
    lock = useRef(false),
    [working, setWorking] = useState(false),
    [error, setError] = useState("");
  const deadline = Date.parse(draft.expiresAt),
    [expired, setExpired] = useState(() => !Number.isFinite(deadline) || deadline <= Date.now());
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if (deadline <= Date.now()) setExpired(true);
      else timer = setTimeout(check, Math.min(2147483647, deadline - Date.now()));
    };
    check();
    return () => clearTimeout(timer);
  }, [deadline]);
  const state = draft.state === "pending" && expired ? "expired" : draft.state;
  const isExport = draft.action === "export" || draft.action === "material-export";
  const unchanged = !isExport && draft.action === "edit" && !draft.changes.some((x) => x.before !== x.after);
  async function decide(decision: "confirm" | "cancel") {
    if (lock.current || disabled || working || state !== "pending" || !onDecide) return;
    if (!Number.isFinite(deadline) || deadline <= Date.now()) {
      setExpired(true);
      return;
    }
    if (decision === "confirm" && unchanged) return;
    lock.current = true;
    setWorking(true);
    setError("");
    try {
      await onDecide(draft, decision);
    } catch {
      setError(c.failed);
    } finally {
      lock.current = false;
      setWorking(false);
    }
  }
  const button = "min-h-11 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <section aria-labelledby={id} aria-busy={working} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground">
      <h3 id={id} className="m-0 text-lg font-semibold">{c.actions[draft.action]}</h3>
      <p className="m-0 text-sm font-semibold wrap-anywhere">
        {draft.workOrder.number} · {draft.workOrder.title}
      </p>
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.hint}</p>
      {isExport ? (
        <div className="grid gap-2 text-sm">
          <p className="m-0">{c.exportCount(draft.count ?? 0)}</p>
          {draft.columns && draft.columns.length > 0 && (
            <p className="m-0 text-assistant-muted wrap-anywhere">{c.exportColumns}: {draft.columns.join(", ")}</p>
          )}
        </div>
      ) : (
        <dl className="m-0 grid min-w-0 gap-4">
          {draft.changes.map((change, index) => (
            <div key={`${change.label}:${index}`} className="min-w-0 rounded-xl border border-assistant-border p-4">
              <dt className="text-sm font-semibold wrap-anywhere">{change.label}</dt>
              <dd className="m-0 mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-1 mt-0 text-assistant-muted">{c.before}</p>
                  <p className="m-0 whitespace-pre-wrap wrap-anywhere">{change.before || c.empty}</p>
                </div>
                <div className="min-w-0 rounded-lg bg-assistant-message p-3">
                  <p className="mb-1 mt-0 text-assistant-muted">{c.after}</p>
                  <p className="m-0 whitespace-pre-wrap wrap-anywhere">{change.after || c.cleared}</p>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {draft.warnings?.map((warning, index) => (
        <p key={index} role="alert" className="m-0 text-sm font-semibold wrap-anywhere">{warning}</p>
      ))}
      {draft.impact && <p className="m-0 text-sm leading-6 wrap-anywhere">{draft.impact}</p>}
      <p role="status" className="m-0 text-sm font-semibold">
        {working ? c.states.confirming : unchanged && state === "pending" ? c.unchanged : c.states[state]}
      </p>
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {state === "pending" && onDecide && (
          <>
            <button type="button" disabled={disabled || working || unchanged} onClick={() => void decide("confirm")} className={`${button} bg-assistant-accent text-assistant-surface`}>
              {isExport ? c.download : c.confirm}
            </button>
            <button type="button" disabled={disabled || working} onClick={() => void decide("cancel")} className={`${button} border border-assistant-border text-assistant-foreground`}>
              {c.cancel}
            </button>
          </>
        )}
        {state === "confirmed" && !isExport && draft.workOrder.id && onOpen && (
          <button type="button" disabled={disabled} onClick={() => onOpen(draft.workOrder.id!)} className={`${button} border border-assistant-border text-assistant-foreground`}>
            {c.open}
          </button>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateDecisionChatTicket, EstimateDecisionChatView } from "@salesmora/contracts";
import { EstimateDecisionCard } from "../../estimates/estimate-decision-card/estimate-decision-card";
import { EstimateLeadStageConnected } from "../../estimates/estimate-lead-stage-suggestion/estimate-lead-stage-connected";
import { estimateLeadStageSuggestionData } from "../../estimates/estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.data";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateDecisionResultData as c, estimateDecisionRequest } from "./estimate-decision-client";

type Props = {
  ticket: EstimateDecisionChatTicket; workspaceId: string; disabled?: boolean;
  onRefresh: () => Promise<void>; onNavigate: (href: string) => void;
};
export function ConnectedEstimateDecision(props: Props) {
  return <DecisionResult key={`${props.workspaceId}:${props.ticket.id}:${props.ticket.inputHash}:${props.ticket.authorizationVersion}:${!!props.disabled}`} {...props} />;
}
function DecisionResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }: Props) {
  const [view, setView] = useState<EstimateDecisionChatView | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [expired, setExpired] = useState(false);
  const [leadStageOpen, setLeadStageOpen] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const lock = useRef(false), mounted = useRef(false), sequence = useRef(0);
  const root = useRef<HTMLElement>(null);
  const live = useRef({ ticket, workspaceId, disabled });
  useEffect(() => { live.current = { ticket, workspaceId, disabled }; }, [ticket, workspaceId, disabled]);
  function isCurrent(expected: typeof live.current, request: number) {
    return mounted.current && !live.current.disabled && live.current.workspaceId === expected.workspaceId &&
      live.current.ticket.id === expected.ticket.id && live.current.ticket.inputHash === expected.ticket.inputHash &&
      live.current.ticket.authorizationVersion === expected.ticket.authorizationVersion && sequence.current === request;
  }
  async function load(signal?: AbortSignal) {
    if (lock.current || live.current.disabled || signal?.aborted) return;
    const expected = live.current, request = ++sequence.current;
    try {
      const result = await estimateDecisionRequest(workspaceId, ticket, "GET", undefined, signal);
      if (!isCurrent(expected, request)) return;
      setView(result.view); setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(expected, request)) return;
      setView(null); setLeadStageOpen(false); setError(caught instanceof Error ? caught.message : c.unavailable);
    }
  }
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    const check = () => { void load(abort.signal); };
    const initial = setTimeout(check, 0);
    const timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => { mounted.current = false; abort.abort(); clearTimeout(initial); clearInterval(timer); window.removeEventListener("focus", check); };
    // The outer key owns proposal/workspace changes; disabled hosts must revalidate before reuse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
  useEffect(() => {
    if (!view || view.ticket.state !== "pending") return;
    const timer = setTimeout(() => setExpired(true), Math.max(0, Date.parse(view.ticket.expiresAt) - Date.now()));
    return () => clearTimeout(timer);
  }, [view]);
  async function operate(decision: "confirm" | "cancel" | "open"): Promise<EstimateDraftOperationResult> {
    if (disabled || lock.current || !view) return { ok: false, message: c.unavailable };
    if (view.ticket.state === "pending" && Date.parse(view.ticket.expiresAt) <= Date.now()) {
      setExpired(true); return { ok: false, message: c.expired };
    }
    const expected = live.current, request = ++sequence.current;
    lock.current = true; setPending(true); setError(""); setNotice("");
    try {
      const result = await estimateDecisionRequest(workspaceId, view.ticket, "POST", decision);
      if (!isCurrent(expected, request)) return { ok: false, message: c.unavailable };
      setView(result.view);
      if (decision === "open" && result.href) onNavigate(result.href);
      try { await onRefresh(); }
      catch { if (isCurrent(expected, request)) setError(c.historyError); }
      return { ok: true };
    } catch (caught) {
      if (isCurrent(expected, request)) {
        setView(null); setLeadStageOpen(false); setError(caught instanceof Error ? caught.message : c.error);
      }
      return { ok: false, message: caught instanceof Error ? caught.message : c.error };
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  const current = view?.ticket ?? ticket;
  const busy = pending || disabled;
  const container = () => root.current?.closest("dialog") ?? document.body;
  const receipt = view?.receipt;
  const suggestLost = !!view && view.review.parent.type === "lead" && receipt?.status === "declined" &&
    (current.mode === "record" || view.review.estimate.decision?.outcome !== "declined");
  return <section ref={root} aria-label={c.title} className="grid min-w-0 gap-3 text-assistant-foreground print:hidden">
    {disabled || !view ? <div className="rounded-xl border border-assistant-border bg-assistant-surface p-4">
      <p role="status" className="m-0 text-sm">{disabled ? c.unavailable : error || c.loading}</p>
      {error && !disabled && <button className={estimateButton} disabled={busy} onClick={() => { void load(); }}>{c.retry}</button>}
    </div> : current.state === "pending" && !expired ? <EstimateDecisionCard
      proposal={{ ...current, estimate: view.review.estimate, value: view.value }}
      context={{
        proposalId: current.id, inputHash: current.inputHash, authorizationVersion: current.authorizationVersion,
        mode: current.mode, estimate: view.review.estimate, snapshotHash: current.snapshotHash,
        value: view.value, today: view.review.today, timezone: view.review.timezone,
      }}
      capabilities={{ read: true, create: false, update: false, send: false, decide: view.review.canDecide,
        void: false, archive: false, delete: false, export: false }}
      parentAccess canCorrectDecision={view.review.canCorrectDecision} disabled={busy}
      onDecide={request => operate(request.decision)} /> : <div className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-4">
      <h3 className="m-0 text-lg font-semibold">{c.title}</h3>
      <p className="m-0 text-sm wrap-anywhere">{current.estimate.number} · Revision {current.estimate.revision} · {current.estimate.name}</p>
      <p role="status" className="m-0 text-sm">{current.state === "confirmed"
        ? current.mode === "correct" ? c.corrected : receipt?.status === "accepted" ? c.accepted : c.declined
        : current.state === "cancelled" ? c.cancelled : current.state === "superseded" ? c.superseded : c.expired}</p>
      {current.state === "confirmed" && receipt && <>
        <p className="m-0 text-sm">{c.boundary}</p>
        <button type="button" className={estimateButton} disabled={busy} onClick={() => { void operate("open"); }}>{c.open}</button>
      </>}
    </div>}
    {!disabled && current.state === "confirmed" && receipt && suggestLost && !leadDismissed && <EstimateLeadStageConnected
      container={container} printHidden
      binding={{ workspaceId, estimateId: current.estimate.id, sourceSubmissionId: current.id, expectedEstimateVersion: receipt.version }}
      estimate={{ ...current.estimate, version: receipt.version, status: receipt.status }}
      canRead pending={busy} open={leadStageOpen} onOpenChange={setLeadStageOpen}
      onDismiss={() => { setLeadDismissed(true); setLeadStageOpen(false); }}
      onMoved={() => { setLeadDismissed(true); setLeadStageOpen(false); setNotice(estimateLeadStageSuggestionData.live.moved); }} />}
    {notice && !disabled && <p role="status" className="m-0 text-sm">{notice}</p>}
    {error && view && !disabled && <p role="alert" className="m-0 text-sm">{error}</p>}
  </section>;
}

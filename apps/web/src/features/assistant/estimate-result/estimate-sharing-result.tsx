"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateShareChatTicket, EstimateShareChatView } from "@salesmora/contracts";
import { EstimateSendCard } from "../../estimates/estimate-send-card/estimate-send-card";
import { EstimateSendDialog } from "../../estimates/estimate-send-dialog/estimate-send-dialog";
import { EstimatePublishDialog } from "../../estimates/estimate-publish-dialog/estimate-publish-dialog";
import { EstimatePreviewPaper } from "../../estimates/estimate-preview-paper/estimate-preview-paper";
import { EstimateLeadStageConnected } from "../../estimates/estimate-lead-stage-suggestion/estimate-lead-stage-connected";
import { estimateLeadStageSuggestionData } from "../../estimates/estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.data";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateSharingData as c, estimateSharingRequest } from "./estimate-sharing-client";

const capabilities = { read: true, create: false, update: false, send: true, decide: false, void: false, archive: false, delete: false, export: false };
export function ConnectedEstimateSharing({
  ticket, workspaceId, disabled = false, onRefresh, onNavigate,
}: {
  ticket: EstimateShareChatTicket; workspaceId: string; disabled?: boolean;
  onRefresh: () => Promise<void>; onNavigate: (href: string) => void;
}) {
  const [view, setView] = useState<EstimateShareChatView | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(false);
  const [leadStageOpen, setLeadStageOpen] = useState(false);
  const [leadSuggestionDismissed, setLeadSuggestionDismissed] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [pending, setPending] = useState(false);
  const [expiredId, setExpiredId] = useState<string | null>(null);
  const lock = useRef(false), mounted = useRef(false), sequence = useRef(0);
  const root = useRef<HTMLElement>(null);
  const live = useRef({ ticket, workspaceId, disabled });
  const active = useRef<EstimateShareChatTicket>(ticket);
  useEffect(() => {
    live.current = { ticket, workspaceId, disabled };
  }, [ticket, workspaceId, disabled]);
  function isCurrent(expected: typeof live.current, request: number) {
    return mounted.current && !live.current.disabled && live.current.workspaceId === expected.workspaceId &&
      live.current.ticket.id === expected.ticket.id && live.current.ticket.inputHash === expected.ticket.inputHash &&
      live.current.ticket.authorizationVersion === expected.ticket.authorizationVersion && sequence.current === request;
  }
  async function load(signal?: AbortSignal) {
    if (lock.current || live.current.disabled) return;
    const expected = live.current, request = ++sequence.current;
    try {
      const result = await estimateSharingRequest(workspaceId, active.current, "GET", {}, signal);
      if (!isCurrent(expected, request)) return;
      active.current = result.view.ticket; setView(result.view);
      setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(expected, request)) return;
      setView(null); setDialog(false); setError(caught instanceof Error ? caught.message : c.unavailable);
    }
  }
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    void load(abort.signal);
    const check = () => { void load(abort.signal); };
    const timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => { mounted.current = false; abort.abort(); clearInterval(timer); window.removeEventListener("focus", check); };
    // The host keys this review by proposal identity; the ref also tracks recipient refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id, ticket.inputHash, ticket.authorizationVersion, workspaceId, disabled]);
  useEffect(() => {
    if (!view || view.ticket.state !== "pending") return;
    const timer = setTimeout(() => { setExpiredId(view.ticket.id); setDialog(false); }, Math.max(0, Date.parse(view.ticket.expiresAt) - Date.now()));
    return () => clearTimeout(timer);
  }, [view]);
  async function operate(decision: "confirm" | "cancel" | "open", paymentLinkReviewed = false): Promise<EstimateDraftOperationResult> {
    if (disabled || lock.current || !view || (decision !== "open" && Date.parse(view.ticket.expiresAt) <= Date.now())) return { ok: false, message: c.expired };
    const expected = live.current, request = ++sequence.current;
    lock.current = true; setPending(true); setError(""); setNotice("");
    try {
      const result = await estimateSharingRequest(workspaceId, view.ticket, "POST", { decision, paymentLinkReviewed });
      if (!isCurrent(expected, request)) return { ok: false, message: c.unavailable };
      active.current = result.view.ticket; setView(result.view); setDialog(false);
      if (decision === "open" && result.href) onNavigate(result.href);
      try { await onRefresh(); }
      catch { if (isCurrent(expected, request)) setError(c.historyError); }
      return { ok: true };
    } catch (caught) {
      if (isCurrent(expected, request)) {
        setView(null); setDialog(false); setError(caught instanceof Error ? caught.message : c.error);
      }
      return { ok: false, message: caught instanceof Error ? caught.message : c.error };
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  async function refreshRecipient(email: string) {
    if (disabled || lock.current || !view) return;
    const expected = live.current, request = ++sequence.current;
    lock.current = true; setPending(true); setError("");
    try {
      const result = await estimateSharingRequest(workspaceId, view.ticket, "PATCH", { recipientEmail: email });
      if (!isCurrent(expected, request)) return;
      active.current = result.view.ticket; setView(result.view); setRecipient(result.view.review.recipientEmail); setNotice(c.refreshed);
    } catch (caught) {
      if (isCurrent(expected, request)) { setView(null); setDialog(false); setError(caught instanceof Error ? caught.message : c.error); }
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  const current = view?.ticket ?? ticket;
  const expired = current.id === expiredId;
  const terminal = current.state !== "pending";
  const busy = pending || disabled;
  const ready = !!view && !disabled && !expired;
  const review = view?.review;
  const record = review ? { ...current.estimate, recipientName: review.recipientName, recipientEmail: review.recipientEmail } : null;
  const preview = ready && review ? {
    state: "ready" as const, estimateId: current.estimate.id, version: current.estimate.version, snapshotHash: current.snapshotHash,
    content: <EstimatePreviewPaper showPrintControl={false} source={{
      state: "snapshot", estimateId: current.estimate.id, version: current.estimate.version, snapshotHash: current.snapshotHash,
      content: { ...review.snapshot.content, business: { ...review.snapshot.content.business,
        logoPath: current.actionType === "estimate.resend" && review.snapshot.content.business.logoPath
          ? `/api/estimates/${current.estimate.id}/logo` : review.snapshot.content.business.logoPath } },
      amounts: review.snapshot.amounts,
    }} />,
  } : null;
  const container = () => root.current?.closest("dialog") ?? document.body;
  return <section ref={root} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground print:hidden" aria-label={c.title[ticket.actionType]}>
    {!view ? <>
      <p role="status" className="m-0 text-sm">{disabled ? c.unavailable : error || c.loading}</p>
      {error && <button className={estimateButton} disabled={busy} onClick={() => { void load(); }}>{c.retry}</button>}
    </> : <>
      {ready && !terminal && record && review && current.actionType === "estimate.send" && !current.requiresDialog ? <EstimateSendCard
        proposal={{ ...current, actionType: "estimate.send", estimate: record, subject: review.subject }}
        context={{
          proposalId: current.id, inputHash: current.inputHash, authorizationVersion: current.authorizationVersion,
          estimate: record, subject: review.subject, snapshotHash: current.snapshotHash, unsavedChanges: false,
          today: review.today, readiness: { state: "ready" }, preview,
        }} capabilities={capabilities} parentAccess disabled={busy}
        onDecide={request => operate(request.decision)} /> : <div className="grid gap-3">
          <h3 className="m-0 text-lg font-semibold">{c.title[current.actionType]}</h3>
          {!disabled && <p className="m-0 text-sm wrap-anywhere">{current.estimate.number} · Revision {current.estimate.revision} · {current.estimate.name}</p>}
          {disabled ? <p role="status" className="m-0 text-sm">{c.unavailable}</p>
            : current.state === "confirmed" ? <p role="status" className="m-0 text-sm">{current.actionType === "estimate.publish" ? c.published : c.queued}</p>
            : current.state === "cancelled" ? <p role="status" className="m-0 text-sm">{c.cancelled}</p>
            : current.state === "superseded" ? <p role="status" className="m-0 text-sm">{c.superseded}</p>
            : expired || current.state === "expired" ? <p role="status" className="m-0 text-sm">{c.expired}</p>
            : <>
              <p className="m-0 text-sm">{c.boundary}</p>
              <button type="button" className={estimateButton} disabled={busy} onClick={() => { if (!busy) { setRecipient(view.review.recipientEmail); setDialog(true); } }}>{c.review[current.actionType]}</button>
              <button type="button" className={estimateButton} disabled={busy} onClick={() => { void operate("cancel"); }}>{c.cancel}</button>
            </>}
        </div>}
      {!disabled && current.state === "confirmed" && view.receipt && <button type="button" className={estimateButton} disabled={busy}
        onClick={() => { void operate("open"); }}>{c.open}</button>}
      {current.state === "confirmed" && current.actionType === "estimate.send" && review?.parent.type === "lead" && view.receipt && !leadSuggestionDismissed &&
        <EstimateLeadStageConnected container={container} printHidden
          binding={{ workspaceId, estimateId: current.estimate.id, sourceSubmissionId: current.id, expectedEstimateVersion: view.receipt.version }}
          estimate={{ ...current.estimate, version: view.receipt.version, status: view.receipt.status }}
          canRead={!disabled} pending={busy} open={leadStageOpen} onOpenChange={setLeadStageOpen}
          onDismiss={() => { setLeadSuggestionDismissed(true); setLeadStageOpen(false); }}
          onMoved={() => { setLeadSuggestionDismissed(true); setLeadStageOpen(false); setNotice(estimateLeadStageSuggestionData.live.moved); }} />}
    </>}
    {notice && !disabled && <p role="status" className="m-0 text-sm">{notice}</p>}
    {error && view && !disabled && <p role="alert" className="m-0 text-sm">{error}</p>}
    {ready && !terminal && record && review && dialog && current.actionType === "estimate.publish" && <EstimatePublishDialog
      open printHidden container={container} estimate={record} capabilities={capabilities} pending={busy}
      onClose={() => setDialog(false)} view={{
        state: "review", today: review.today, readiness: { state: "ready" }, preview, revision: review.revision,
        paymentLink: review.snapshot.content.paymentLink ?? "",
        onConfirm: async request => { await operate("confirm", request.revisionReview?.paymentLinkReviewed ?? false); },
      }} />}
    {ready && !terminal && record && review && dialog && current.actionType !== "estimate.publish" && <EstimateSendDialog
      key={current.id} open printHidden container={container} estimate={record} capabilities={capabilities} today={review.today} subject={review.subject}
      readiness={{ state: "ready" }} preview={preview} revision={review.revision} paymentLink={review.snapshot.content.paymentLink ?? ""}
      pending={busy} onClose={() => setDialog(false)}
      onConfirm={async request => { await operate("confirm", request.revisionReview?.paymentLinkReviewed ?? false); }}
      {...(current.actionType === "estimate.resend" ? {
        mode: "resend" as const, delivery: review.delivery, recipientEmail: recipient, onRecipientEmailChange: setRecipient,
        reviewedRecipientEmail: review.recipientEmail, onReviewRecipient: refreshRecipient,
      } : { mode: "send" as const })} />}
  </section>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { EstimateDraftCard } from "@salesmora/ui";
import type { EstimateDraftChatView } from "@salesmora/contracts";
import { estimateDraftConnectedData as c, estimateDraftRequest, estimateDraftBinding } from "./estimate-draft-client";
import { estimateButton } from "../../estimates/estimate-ui";

export function ConnectedEstimateDraft({
  view, workspaceId, disabled = false, onRefresh, onNavigate,
}: {
  view: EstimateDraftChatView; workspaceId: string; disabled?: boolean;
  onRefresh: () => Promise<void>; onNavigate: (href: string) => void;
}) {
  const [outcome, setOutcome] = useState<EstimateDraftChatView | null>(null);
  const current = outcome?.draft.id === view.draft.id && outcome.draft.inputHash === view.draft.inputHash ? outcome : view;
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  const openLock = useRef(false);
  const session = useRef(view);
  const host = useRef({ workspaceId, disabled });
  const mounted = useRef(true);
  useEffect(() => { session.current = view; host.current = { workspaceId, disabled }; }, [view, workspaceId, disabled]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function isCurrent(expected: EstimateDraftChatView) {
    return mounted.current && !host.current.disabled && host.current.workspaceId === workspaceId &&
      session.current.draft.id === expected.draft.id &&
      session.current.draft.inputHash === expected.draft.inputHash &&
      session.current.draft.authorizationVersion === expected.draft.authorizationVersion;
  }
  async function refreshHistory(completed = false) {
    try { await onRefresh(); }
    catch { if (mounted.current) setError(completed ? c.refreshFailed : c.error); }
  }
  async function openSaved() {
    if (disabled || openLock.current) return;
    const expected = session.current;
    openLock.current = true; setOpening(true); setError("");
    try {
      const result = await estimateDraftRequest("POST", { workspaceId, ...estimateDraftBinding(current), decision: "open" });
      if (!result.href) throw new Error(c.error);
      if (isCurrent(expected)) onNavigate(result.href);
    } catch (caught) {
      if (isCurrent(expected)) setError(caught instanceof Error ? caught.message : c.error);
      await refreshHistory(true);
    } finally { openLock.current = false; if (mounted.current) setOpening(false); }
  }
  return <div className="grid min-w-0 gap-3 print:hidden">
    <EstimateDraftCard {...current} disabled={disabled}
      onDecide={async request => {
        const expected = session.current;
        try {
          const result = await estimateDraftRequest("POST", { workspaceId, ...request });
          if (isCurrent(expected)) setOutcome(result.view);
          await refreshHistory();
          return { ok: true };
        } catch (error) {
          await refreshHistory();
          return { ok: false, message: error instanceof Error ? error.message : c.error };
        }
      }}
      onReviewInEditor={async request => {
        const expected = session.current;
        try {
          const result = await estimateDraftRequest("POST", { workspaceId, ...request, decision: "editor" });
          if (!result.href) throw new Error(c.error);
          if (!isCurrent(expected)) return { ok: false, message: c.error };
          onNavigate(result.href);
          return { ok: true };
        } catch (error) {
          await refreshHistory();
          return { ok: false, message: error instanceof Error ? error.message : c.error };
        }
      }} />
    {current.draft.state === "confirmed" && current.receipt && <button type="button" className={estimateButton}
      disabled={disabled || opening} onClick={() => { void openSaved(); }}>{c.saved}</button>}
    {error && <p role="alert" className="m-0 text-sm">{error}</p>}
  </div>;
}

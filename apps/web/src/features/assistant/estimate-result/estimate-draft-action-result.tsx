"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateDraftActionChatDecisionSchema, type EstimateDraftActionChatTicket, type EstimateDraftActionChatView } from "@salesmora/contracts";
import { EstimateDraftActionCard } from "../../estimates/estimate-draft-action-card/estimate-draft-action-card";
import type { EstimateDraftActionCardCommand } from "../../estimates/estimate-draft-action-card/estimate-draft-action-card.types";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateDraftActionBinding, estimateDraftActionRequest } from "./estimate-draft-action-client";
import { estimateDraftActionResultData as c } from "./estimate-draft-action-result.data";

type Props = {
  ticket: EstimateDraftActionChatTicket; workspaceId: string; disabled?: boolean;
  onRefresh: () => Promise<void>; onNavigate: (href: string) => void;
};
export function ConnectedEstimateDraftAction(props: Props) {
  return <DraftActionResult key={JSON.stringify({
    ticket: props.ticket, workspaceId: props.workspaceId, disabled: !!props.disabled,
  })} {...props} />;
}
function DraftActionResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }: Props) {
  const [view, setView] = useState<EstimateDraftActionChatView | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const mounted = useRef(false), lock = useRef(false), sequence = useRef(0);
  function isCurrent(request: number) {
    return mounted.current && !disabled && sequence.current === request;
  }
  async function load(signal?: AbortSignal) {
    if (lock.current || disabled || signal?.aborted) return;
    const request = ++sequence.current;
    try {
      const result = await estimateDraftActionRequest(workspaceId, ticket, "GET", undefined, signal);
      if (!isCurrent(request)) return;
      setView(result.view); setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(request)) return;
      setView(null); setError(caught instanceof Error ? caught.message : c.unavailable);
    }
  }
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    const check = () => { void load(abort.signal); };
    const initial = setTimeout(check, 0), timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => {
      mounted.current = false; abort.abort(); clearTimeout(initial); clearInterval(timer); window.removeEventListener("focus", check);
    };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function operate(command: EstimateDraftActionCardCommand): Promise<EstimateDraftOperationResult> {
    if (disabled || lock.current || !view || command.workspaceId !== workspaceId ||
        JSON.stringify(command.request) !== JSON.stringify(estimateDraftActionBinding(view.ticket))) {
      return { ok: false, message: c.unavailable };
    }
    const parsed = estimateDraftActionChatDecisionSchema.parse(command);
    const request = ++sequence.current;
    lock.current = true; setPending(true); setError("");
    try {
      const result = await estimateDraftActionRequest(workspaceId, view.ticket, "POST", parsed.decision);
      if (!isCurrent(request)) return { ok: false, message: c.unavailable };
      setView(result.view);
      if (parsed.decision === "open" && result.href) onNavigate(result.href);
      try { await onRefresh(); }
      catch { if (isCurrent(request)) setError(c.historyError); }
      return { ok: true };
    } catch (caught) {
      if (isCurrent(request)) { setView(null); setError(caught instanceof Error ? caught.message : c.error); }
      return { ok: false, message: caught instanceof Error ? caught.message : c.error };
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  }
  return <section aria-label={c.title} aria-busy={pending} className="grid min-w-0 gap-3 text-assistant-foreground print:hidden">
    {disabled || !view ? <div className="rounded-xl border border-assistant-border bg-assistant-surface p-4">
      <p role="status" className="m-0 text-sm">{disabled ? c.unavailable : error || c.loading}</p>
      {error && !disabled && <button type="button" className={estimateButton} disabled={pending} onClick={() => { void load(); }}>{c.retry}</button>}
    </div> : <>
      <EstimateDraftActionCard view={view} context={{ workspaceId, view }}
        grants={{ read: true, parentAccess: true, create: true, update: true }}
        onOperate={operate} />
      {error && <p role="alert" className="m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6">{error}</p>}
    </>}
  </section>;
}

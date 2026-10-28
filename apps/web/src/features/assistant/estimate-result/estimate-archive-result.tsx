"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import { estimateArchiveChatDecisionSchema, type EstimateArchiveChatTicket, type EstimateArchiveChatView } from "@salesmora/contracts";
import { EstimateArchiveCard } from "../../estimates/estimate-archive-card/estimate-archive-card";
import type { EstimateArchiveCardCommand } from "../../estimates/estimate-archive-card/estimate-archive-card.types";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateArchiveBinding, estimateArchiveRequest } from "./estimate-archive-client";
import { estimateArchiveResultData as c } from "./estimate-archive-result.data";

type Props = {
  ticket: EstimateArchiveChatTicket; workspaceId: string; disabled?: boolean;
  onRefresh: () => Promise<void>; onNavigate: (href: string) => void;
};
export function ConnectedEstimateArchive(props: Props) {
  return <ArchiveResult key={JSON.stringify({
    ticket: props.ticket, workspaceId: props.workspaceId, disabled: !!props.disabled,
  })} {...props} />;
}
function ArchiveResult({ ticket, workspaceId, disabled = false, onRefresh, onNavigate }: Props) {
  const [view, setView] = useState<EstimateArchiveChatView | null>(null);
  const [error, setError] = useState(""), [pending, setPending] = useState(false);
  const mounted = useRef(false), lock = useRef(false), sequence = useRef(0);
  function isCurrent(request: number) {
    return mounted.current && !disabled && sequence.current === request;
  }
  async function load(signal?: AbortSignal) {
    if (lock.current || disabled || signal?.aborted) return;
    const request = ++sequence.current;
    try {
      const result = await estimateArchiveRequest(workspaceId, ticket, "GET", undefined, signal);
      if (!isCurrent(request)) return;
      setView(result.view); setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(request)) return;
      setView(null); setError(caught instanceof Error ? caught.message : c.unavailable);
    }
  }
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController(), check = () => { void load(abort.signal); };
    const initial = setTimeout(check, 0), timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => {
      mounted.current = false; abort.abort(); clearTimeout(initial); clearInterval(timer); window.removeEventListener("focus", check);
    };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function operate(command: EstimateArchiveCardCommand): Promise<EstimateDraftOperationResult> {
    if (disabled || lock.current || !view || command.workspaceId !== workspaceId ||
        JSON.stringify(command.request) !== JSON.stringify(estimateArchiveBinding(view.ticket))) {
      return { ok: false, message: c.unavailable };
    }
    const parsed = estimateArchiveChatDecisionSchema.parse(command), request = ++sequence.current;
    lock.current = true; setPending(true); setError("");
    try {
      const result = await estimateArchiveRequest(workspaceId, view.ticket, "POST", parsed.decision);
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
      <EstimateArchiveCard view={view} context={{ workspaceId, view }}
        grants={{ read: true, parentAccess: true, archive: true }} onOperate={operate} />
      {error && <p role="alert" className="m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6">{error}</p>}
    </>}
  </section>;
}

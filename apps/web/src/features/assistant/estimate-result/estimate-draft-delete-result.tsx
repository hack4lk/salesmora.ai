"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import {
  estimateDraftDeleteChatDecisionSchema,
  type EstimateDraftDeleteChatTicket,
  type EstimateDraftDeleteChatView,
} from "@salesmora/contracts";
import { EstimateDraftDeleteCard } from "../../estimates/estimate-draft-delete-card/estimate-draft-delete-card";
import type { EstimateDraftDeleteCardCommand } from "../../estimates/estimate-draft-delete-card/estimate-draft-delete-card.types";
import { estimateButton } from "../../estimates/estimate-ui";
import { estimateDraftDeleteBinding, estimateDraftDeleteRequest } from "./estimate-draft-delete-client";
import { estimateDraftDeleteResultData as c } from "./estimate-draft-delete-result.data";

type Props = {
  ticket: EstimateDraftDeleteChatTicket;
  workspaceId: string;
  disabled?: boolean;
  onRefresh: () => Promise<void>;
};

export function ConnectedEstimateDraftDelete(props: Props) {
  return <DraftDeleteResult key={JSON.stringify({
    ticket: props.ticket,
    workspaceId: props.workspaceId,
    disabled: !!props.disabled,
  })} {...props} />;
}

function DraftDeleteResult({ ticket, workspaceId, disabled = false, onRefresh }: Props) {
  const [view, setView] = useState<EstimateDraftDeleteChatView | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const mounted = useRef(false);
  const lock = useRef(false);
  const sequence = useRef(0);
  const root = useRef<HTMLElement>(null);

  function isCurrent(request: number) {
    return mounted.current && !disabled && sequence.current === request;
  }

  async function load(signal?: AbortSignal) {
    if (lock.current || disabled || signal?.aborted) return;
    const request = ++sequence.current;
    try {
      const result = await estimateDraftDeleteRequest(
        workspaceId, ticket, "GET", undefined, undefined, signal,
      );
      if (!isCurrent(request)) return;
      setView(result.view);
      setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(request)) return;
      setView(null);
      setError(caught instanceof Error ? caught.message : c.unavailable);
    }
  }

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    const check = () => { void load(abort.signal); };
    const initial = setTimeout(check, 0);
    const timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => {
      mounted.current = false;
      abort.abort();
      clearTimeout(initial);
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
    // The full outer key gives each authorized ticket/workspace/disabled state its own lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function operate(command: EstimateDraftDeleteCardCommand): Promise<EstimateDraftOperationResult> {
    if (disabled || lock.current || !view || command.workspaceId !== workspaceId ||
        JSON.stringify(command.request) !== JSON.stringify(estimateDraftDeleteBinding(view.ticket))) {
      return { ok: false, message: c.unavailable };
    }
    const parsed = estimateDraftDeleteChatDecisionSchema.parse(command);
    const request = ++sequence.current;
    lock.current = true;
    setPending(true);
    setError("");
    try {
      const result = await estimateDraftDeleteRequest(
        workspaceId,
        view.ticket,
        "POST",
        parsed.decision,
        parsed.typedConfirmation,
      );
      if (!isCurrent(request)) return { ok: false, message: c.unavailable };
      setView(result.view);
      try {
        await onRefresh();
      } catch {
        if (isCurrent(request)) setError(c.historyError);
      }
      return { ok: true };
    } catch (caught) {
      if (isCurrent(request)) {
        setView(null);
        setError(caught instanceof Error ? caught.message : c.error);
      }
      return { ok: false, message: caught instanceof Error ? caught.message : c.error };
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  }

  const container = () => root.current?.closest("dialog") ?? document.body;
  return <section ref={root} aria-label={c.title} aria-busy={pending} className="grid min-w-0 gap-3 text-assistant-foreground print:hidden">
    {disabled || !view ? <div className="rounded-xl border border-assistant-border bg-assistant-surface p-4">
      <p role="status" className="m-0 text-sm">{disabled ? c.unavailable : error || c.loading}</p>
      {error && !disabled && <button type="button" className={estimateButton} disabled={pending} onClick={() => { void load(); }}>{c.retry}</button>}
    </div> : <>
      <EstimateDraftDeleteCard view={view} context={{ workspaceId, view }}
        grants={{ read: true, parentAccess: true, delete: true }} container={container} onOperate={operate} />
      {error && <p role="alert" className="m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6">{error}</p>}
    </>}
  </section>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { EstimateDraftOperationResult } from "@salesmora/ui";
import type { EstimateCapabilities } from "../../estimates/estimate-preview.types";
import { EstimateConvertCard } from "../../estimates/estimate-convert-card/estimate-convert-card";
import type { EstimateConvertCardDecision } from "../../estimates/estimate-convert-card/estimate-convert-card.types";
import { EstimateConvertConnected } from "../../estimates/estimate-convert-dialog/estimate-convert-connected";
import {
  estimateConversionChatDecisionSchema,
  type EstimateConversionChatTicket,
  type EstimateConversionChatView,
} from "@salesmora/contracts";
import {
  estimateConversionChatBinding,
  estimateConversionChatRequest,
} from "./estimate-convert-client";
import { estimateConvertResultData as copy } from "./estimate-convert-result.data";

type Props = {
  ticket: EstimateConversionChatTicket;
  workspaceId: string;
  disabled?: boolean;
  onRefresh: () => Promise<void>;
  onOpenReview: () => void;
  onNavigate: (href: string) => void;
};

const cardCapabilities: EstimateCapabilities = {
  read: true,
  create: false,
  update: false,
  send: false,
  decide: false,
  void: false,
  archive: false,
  delete: false,
  export: false,
};

export function ConnectedEstimateConversion(props: Props) {
  return <ConversionResult key={JSON.stringify({
    ticket: props.ticket,
    workspaceId: props.workspaceId,
    disabled: !!props.disabled,
  })} {...props} />;
}

function ConversionResult({
  ticket,
  workspaceId,
  disabled = false,
  onRefresh,
  onOpenReview,
  onNavigate,
}: Props) {
  const [view, setView] = useState<EstimateConversionChatView | null>(null);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const mounted = useRef(false);
  const lock = useRef(false);
  const sequence = useRef(0);

  function isCurrent(request: number) {
    return mounted.current && !disabled && sequence.current === request;
  }

  async function load(signal?: AbortSignal) {
    if (lock.current || disabled || signal?.aborted) return;
    const request = ++sequence.current;
    try {
      const result = await estimateConversionChatRequest(
        workspaceId,
        ticket,
        "GET",
        undefined,
        signal,
      );
      if (!isCurrent(request)) return;
      setView(result.view);
      setError("");
    } catch (caught) {
      if (signal?.aborted || !isCurrent(request)) return;
      setView(null);
      setError(caught instanceof Error ? caught.message : copy.unavailable);
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

  async function operate(command: EstimateConvertCardDecision): Promise<EstimateDraftOperationResult> {
    const { decision, ...binding } = command;
    if (disabled || lock.current || !view ||
        JSON.stringify(binding) !== JSON.stringify(estimateConversionChatBinding(view.ticket)) ||
        !estimateConversionChatDecisionSchema.shape.decision.safeParse(decision).success) {
      return { ok: false, message: copy.unavailable };
    }
    const requestId = ++sequence.current;
    lock.current = true;
    setPending(true);
    setError("");
    try {
      const result = await estimateConversionChatRequest(
        workspaceId,
        view.ticket,
        "POST",
        decision,
      );
      if (!isCurrent(requestId)) return { ok: false, message: copy.unavailable };
      setView(result.view);
      if (decision === "review") {
        onOpenReview();
        setDialogOpen(true);
      } else {
        try {
          await onRefresh();
        } catch {
          if (isCurrent(requestId)) setError(copy.error);
        }
      }
      return { ok: true };
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.error;
      if (isCurrent(requestId)) {
        setError(message);
        setView(null);
      }
      return { ok: false, message };
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  }

  const context = view ? {
    proposalId: view.ticket.id,
    inputHash: view.ticket.inputHash,
    authorizationVersion: view.ticket.authorizationVersion,
    estimate: view.review.estimate,
    customer: view.review.customer,
    parentJob: view.review.parentJob ?? undefined,
  } : null;

  return <section aria-label={copy.title} aria-busy={pending} className="grid min-w-0 gap-3 text-assistant-foreground print:hidden">
    {disabled || !view ? <div className="rounded-xl border border-assistant-border bg-assistant-surface p-4">
      <p role="status" className="m-0 text-sm">{disabled ? copy.unavailable : error || copy.loading}</p>
      {error && !disabled && <button type="button" className="min-h-11 rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold"
        disabled={pending} onClick={() => { void load(); }}>{copy.retry}</button>}
    </div> : <>
      <EstimateConvertCard
        proposal={view.ticket}
        context={context}
        capabilities={cardCapabilities}
        parentAccess
        canCreateJob={view.review.canCreateJob}
        disabled={disabled || pending}
        onDecide={operate}
      />
      {error && <p role="alert" className="m-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-sm leading-6">{error}</p>}
      {dialogOpen && <EstimateConvertConnected
        workspaceId={workspaceId}
        estimateId={view.ticket.estimate.id}
        expectedVersion={view.ticket.estimate.version}
        expectedSnapshotHash={view.ticket.estimate.snapshotHash}
        open
        onClose={() => setDialogOpen(false)}
        onConverted={(receipt) => {
          setDialogOpen(false);
          onNavigate(receipt.job.href);
        }}
        onAccessLost={() => {
          setDialogOpen(false);
          void load();
        }}
      />}
    </>}
  </section>;
}

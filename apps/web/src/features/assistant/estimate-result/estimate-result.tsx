"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import { estimateChatDestinationSchema, type EstimateChatResult } from "@salesmora/contracts";
import { EstimateSummaryCard } from "../../estimates/estimate-summary-card/estimate-summary-card";
import { estimateResultData as c } from "./estimate-result.data";
import { EstimateReadResult } from "./estimate-read-result";
import { useEstimateAssistantRequest } from "./use-estimate-assistant-request";
import { isApiAccessError } from "../../api/api-query";

export function ConnectedEstimateResult({
  result, workspaceId, disabled, onRefresh, onNavigate,
}: {
  result: EstimateChatResult;
  workspaceId: string;
  disabled: boolean;
  onRefresh: () => Promise<void>;
  onNavigate: (href: string) => void;
}) {
  const transport = useEstimateAssistantRequest(workspaceId);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const latest = useRef({ disabled, result, workspaceId, onNavigate }), mounted = useRef(false);
  useLayoutEffect(() => { latest.current = { disabled, result, workspaceId, onNavigate }; }, [disabled, result, workspaceId, onNavigate]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function navigate(
    resultId: string,
    estimateId?: string,
    destination: "list" | "export" = "list",
  ) {
    if (latest.current.disabled || unavailable || lock.current) return;
    const expected = latest.current;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const destinationResult = await transport("/api/chat/estimates/navigate", {
        method: "POST",
        failureMessage: c.failed,
        body: {
          workspaceId,
          turnId: result.turnId,
          resultId,
          estimateId,
          ...(destination === "export" ? { destination } : {}),
        },
        parse: raw => {
          const next = estimateChatDestinationSchema.parse(raw), url = new URL(next.href, "http://assistant.local");
          if (url.searchParams.get("workspace") !== workspaceId || url.pathname !== (estimateId ? `/estimates/${estimateId}` : "/estimates") ||
            (destination === "export" && url.searchParams.get("export") !== "review")) throw new Error(c.failed);
          return next;
        },
      });
      if (mounted.current && !latest.current.disabled && latest.current.result === expected.result &&
        latest.current.workspaceId === workspaceId) latest.current.onNavigate(destinationResult.href);
    } catch (error) {
      if (!mounted.current || latest.current.result !== expected.result || latest.current.workspaceId !== workspaceId) return;
      setError(c.failed);
      if (isApiAccessError(error)) setUnavailable(true);
      try {
        await onRefresh();
      } catch {
        setError(c.refreshFailed);
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  if (unavailable) return <FormFeedback kind="error" message={c.failed} />;
  return <div className="grid min-w-0 gap-4">
    {error && <FormFeedback kind="error" message={error} />}
    {result.detail && <EstimateReadResult
      card={result.detail}
      disabled={disabled || busy}
      onOpenEstimate={id => { if (result.detail) void navigate(result.detail.id, id); }}
    />}
    {result.summaries.map(summary => <EstimateSummaryCard
      key={summary.id}
      result={summary}
      disabled={disabled || busy}
      onOpenEstimate={id => void navigate(summary.id, id)}
      onOpenList={summary.canOpenList ? id => void navigate(id) : undefined}
      onReviewExport={summary.canReviewExport ? id => void navigate(id, undefined, "export") : undefined}
    />)}
  </div>;
}

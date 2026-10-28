"use client";

import { useRef, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import { estimateChatDestinationSchema, type EstimateChatResult } from "@salesmora/contracts";
import { EstimateSummaryCard } from "../../estimates/estimate-summary-card/estimate-summary-card";
import { estimateResultData as c } from "./estimate-result.data";
import { EstimateReadResult } from "./estimate-read-result";

export function ConnectedEstimateResult({
  result, workspaceId, disabled, onRefresh, onNavigate,
}: {
  result: EstimateChatResult;
  workspaceId: string;
  disabled: boolean;
  onRefresh: () => Promise<void>;
  onNavigate: (href: string) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  async function navigate(
    resultId: string,
    estimateId?: string,
    destination: "list" | "export" = "list",
  ) {
    if (disabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/chat/estimates/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          turnId: result.turnId,
          resultId,
          estimateId,
          ...(destination === "export" ? { destination } : {}),
        }),
      });
      if (!response.ok) throw new Error(c.failed);
      const destinationResult = estimateChatDestinationSchema.parse(await response.json());
      onNavigate(destinationResult.href);
    } catch {
      setError(c.failed);
      try {
        await onRefresh();
      } catch {
        setError(c.refreshFailed);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

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

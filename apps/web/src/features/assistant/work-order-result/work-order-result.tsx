"use client";
import { useRef, useState } from "react";
import { FormFeedback, WorkOrderDraftCard } from "@salesmora/ui";
import { workOrderChatDraftSchema, type WorkOrderChatDraft, type WorkOrderChatResult } from "@salesmora/contracts";
import { workOrderResultData as c } from "./work-order-result.data";
export function ConnectedWorkOrderResult({
  result,
  workspaceId,
  disabled,
  onRefresh,
  onNavigate,
}: {
  result: WorkOrderChatResult;
  workspaceId: string;
  disabled: boolean;
  onRefresh: () => Promise<void>;
  onNavigate: (href: string) => void;
}) {
  const [error, setError] = useState(""),
    lock = useRef(false);
  async function decide(draft: WorkOrderChatDraft, decision: "confirm" | "cancel") {
    if (disabled || lock.current) throw Error(c.failed);
    lock.current = true;
    setError("");
    try {
      const response = await fetch("/api/chat/work-orders/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, draftId: draft.id, inputHash: draft.inputHash, decision }),
      });
      if (!response.ok) {
        await onRefresh();
        throw Error(c.failed);
      }
      if (draft.action === "export" && decision === "confirm") {
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.download = c.downloadName;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else workOrderChatDraftSchema.parse((await response.json()).draft);
      await onRefresh();
    } catch {
      setError(c.failed);
      throw Error(c.failed);
    } finally {
      lock.current = false;
    }
  }
  const draft = result.draft;
  return (
    <div className="grid min-w-0 gap-4">
      {error && <FormFeedback kind="error" message={error} />}
      {draft ? (
        <WorkOrderDraftCard
          draft={draft}
          disabled={disabled}
          onDecide={(_proposal, decision) => decide(draft, decision)}
          onOpen={(id) => onNavigate(`/work-orders/${id}?workspace=${workspaceId}`)}
        />
      ) : (
        <section aria-label={result.title} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground">
          <h3 className="m-0 text-lg font-semibold wrap-anywhere">{result.title}</h3>
        </section>
      )}
    </div>
  );
}

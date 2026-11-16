"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FormFeedback, WorkOrderDraftCard } from "@salesmora/ui";
import { type WorkOrderChatDraft, type WorkOrderChatResult } from "@salesmora/contracts";
import { workOrderResultData as c } from "./work-order-result.data";
import { useAssistantResultRequest } from "../use-assistant-result-request";
import { workOrderDecisionResponse } from "../record-result.requests";
import { ApiRequestError } from "../../api/api-request";
import { isApiAccessError } from "../../api/api-query";
type Props = {
  result: WorkOrderChatResult;
  workspaceId: string;
  disabled: boolean;
  onRefresh: () => Promise<void>;
  onNavigate: (href: string) => void;
};
export function ConnectedWorkOrderResult(props: Props) {
  return <WorkOrderResult key={`${props.workspaceId}:${props.result.turnId}:${props.result.draft?.id}:${props.result.draft?.inputHash}`} {...props} />;
}
function WorkOrderResult({
  result,
  workspaceId,
  disabled,
  onRefresh,
  onNavigate,
}: Props) {
  const api = useAssistantResultRequest<WorkOrderChatDraft>(workspaceId, "assistant-history", c.failed);
  const [unavailable, setUnavailable] = useState(false);
  const mounted = useRef(false), controllers = useRef(new Set<AbortController>()), latestDisabled = useRef(disabled);
  useLayoutEffect(() => { latestDisabled.current = disabled; }, [disabled]);
  useEffect(() => {
    mounted.current = true;
    const active = controllers.current;
    return () => { mounted.current = false; for (const controller of active) controller.abort(); };
  }, []);
  const [error, setError] = useState(""),
    lock = useRef(false);
  async function decide(draft: WorkOrderChatDraft, decision: "confirm" | "cancel") {
    if (latestDisabled.current || unavailable || lock.current) throw Error(c.failed);
    lock.current = true;
    setError("");
    const controller = new AbortController(); controllers.current.add(controller);
    let completed = false;
    try {
      const body = { workspaceId, draftId: draft.id, inputHash: draft.inputHash, decision };
      if ((draft.action === "export" || draft.action === "material-export") && decision === "confirm") {
        const response = await fetch("/api/chat/work-orders/actions", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body), signal: controller.signal, redirect: "error",
        });
        if (!response.ok) throw new ApiRequestError(c.failed, response.status, undefined);
        const url = URL.createObjectURL(await response.blob());
        if (!mounted.current || controller.signal.aborted || latestDisabled.current) { URL.revokeObjectURL(url); return; }
        const link = document.createElement("a");
        link.href = url;
        link.download = draft.action === "material-export" ? c.materialsDownloadName : c.downloadName;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else await api.write("/api/chat/work-orders/actions", body,
        raw => workOrderDecisionResponse(draft, decision, raw), controller.signal, true);
      if (!mounted.current || controller.signal.aborted) return;
      completed = true;
      await onRefresh();
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) throw Error(c.failed);
      setError(c.failed);
      if (isApiAccessError(error)) setUnavailable(true);
      if (!completed && error instanceof ApiRequestError) await onRefresh();
      throw Error(c.failed);
    } finally {
      controllers.current.delete(controller);
      lock.current = false;
    }
  }
  const draft = result.draft;
  if (unavailable) return <FormFeedback kind="error" message={c.failed} />;
  return (
    <div className="grid min-w-0 gap-4">
      {error && <FormFeedback kind="error" message={error} />}
      {draft ? (
        <WorkOrderDraftCard
          draft={draft}
          disabled={disabled}
          onDecide={(_proposal, decision) => decide(draft, decision)}
          onOpen={(id) => { if (!latestDisabled.current) onNavigate(`/work-orders/${id}?workspace=${workspaceId}`); }}
        />
      ) : (
        <section aria-label={result.title} className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground">
          <h3 className="m-0 text-lg font-semibold wrap-anywhere">{result.title}</h3>
        </section>
      )}
    </div>
  );
}

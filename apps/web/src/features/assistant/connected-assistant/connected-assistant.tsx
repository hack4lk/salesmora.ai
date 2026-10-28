"use client";
import { ConnectedCalendarSchedule } from '../calendar-schedule-draft-card/connected-calendar-schedule';
import { ConnectedCalendarResult } from "../calendar-results-card/connected-calendar-result";
import { ConnectedCustomerResult } from "../customer-result/customer-result";
import { ConnectedWorkOrderResult } from "../work-order-result/work-order-result";
import { ConnectedEstimateResult } from "../estimate-result/estimate-result";
import { ConnectedEstimateDraft } from "../estimate-result/estimate-draft-result";
import { ConnectedEstimateSharing } from "../estimate-result/estimate-sharing-result";
import { ConnectedEstimateDecision } from "../estimate-result/estimate-decision-result";
import { ConnectedEstimateDraftAction } from "../estimate-result/estimate-draft-action-result";
import { ConnectedEstimateVoid } from "../estimate-result/estimate-void-result";
import { ConnectedEstimateArchive } from "../estimate-result/estimate-archive-result";
import { ConnectedEstimateDraftDelete } from "../estimate-result/estimate-draft-delete-result";
import { ConnectedEstimateConversion } from "../estimate-result/estimate-convert-result";
import type {
  CustomerChatResult,
  CalendarChatResult,
  CalendarProposalTicket,
  WorkOrderChatResult,
  EstimateChatResult,
  EstimateDraftChatView,
  EstimateShareChatTicket,
  EstimateDecisionChatTicket,
  EstimateDraftActionChatTicket,
  EstimateVoidChatTicket,
  EstimateArchiveChatTicket,
  EstimateDraftDeleteChatTicket,
  EstimateConversionChatTicket,
} from "@salesmora/contracts";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AssistantPanel,
  type AssistantMessage,
  type AssistantPanelProps,
} from "@salesmora/ui";
import {
  chatHistoryResponseSchema,
  chatReplayResponseSchema,
  chatActionResponseSchema,
  type ChatSurfaceKey,
  type ChatTurnRequest,
} from "@salesmora/contracts";
import { useWorkspaceAssistant } from "../workspace-assistant/workspace-assistant";
import { readChatStream } from "../chat-stream";
import { connectedAssistantData as copy } from "./connected-assistant.data";
const storageKey = (workspaceId: string) => `salesmora-chat:${workspaceId}`;
const rememberedThread = (workspaceId: string) => {
  try {
    return sessionStorage.getItem(storageKey(workspaceId)) ?? undefined;
  } catch {
    return undefined;
  }
};
const rememberThread = (workspaceId: string, id?: string) => {
  try {
    if (id) sessionStorage.setItem(storageKey(workspaceId), id);
    else sessionStorage.removeItem(storageKey(workspaceId));
  } catch {}
};
export function ConnectedAssistant({
  workspaceId,
  surfaceKey,
}: {
  workspaceId: string;
  surfaceKey: ChatSurfaceKey;
}) {
  const router = useRouter();
  const workspaceAssistant = useWorkspaceAssistant();
  const setAssistantStatus = workspaceAssistant?.setStatus;
  const [pendingContextLabel, setPendingContextLabel] = useState<string>();
  const [messages, setMessages] = useState<
    (AssistantMessage & {
      customerResult?: CustomerChatResult;
      calendarResult?: CalendarChatResult;
      calendarProposal?: CalendarProposalTicket;
      calendarTurnId?: string;
      workOrderResult?: WorkOrderChatResult;
      estimateResult?: EstimateChatResult;
      estimateDraft?: EstimateDraftChatView;
      estimateSharing?: EstimateShareChatTicket;
      estimateDecision?: EstimateDecisionChatTicket;
      estimateDraftAction?: EstimateDraftActionChatTicket;
      estimateVoid?: EstimateVoidChatTicket;
      estimateArchive?: EstimateArchiveChatTicket;
      estimateDraftDelete?: EstimateDraftDeleteChatTicket;
      estimateConversion?: EstimateConversionChatTicket;
    })[]
  >([]);
  const [runStatus, setRunStatus] =
    useState<AssistantPanelProps["runStatus"]>();
  const [loading, setLoading] = useState(true);
  const [canRetry, setCanRetry] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const thread = useRef<string | undefined>(undefined);
  const turn = useRef<string | undefined>(undefined);
  const abort = useRef<AbortController | undefined>(undefined);
  const pending = useRef(false);
  const stopRequested = useRef(false);
  const mounted = useRef(true);
  const lastRequest = useRef<ChatTurnRequest | undefined>(undefined);
  const recoveryRequired = useRef(false);
  useEffect(() => {
    setAssistantStatus?.(
      blocked || recoveryRequired.current
        ? "unavailable"
        : loading || runStatus === "thinking" || runStatus === "streaming"
          ? "busy"
          : "ready",
    );
  }, [setAssistantStatus, blocked, loading, runStatus]);
  const restore = useCallback(
    async (id: string) => {
      const response = await fetch(
        `/api/chat/threads?workspace=${encodeURIComponent(workspaceId)}&thread=${encodeURIComponent(id)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw Error("History unavailable");
      const history = chatHistoryResponseSchema.parse(await response.json());
      if (!mounted.current) return history;
      thread.current = history.threadId;
      rememberThread(workspaceId, history.threadId);
      setMessages(
        history.messages.map((message) => {
          const state = history.turns.find(
            (turn) => turn.id === message.turnId,
          );
          return {
            id: message.id,
            role: message.role,
            text: message.text,
            calendarProposal: message.role === "assistant" ? state?.calendarProposal : undefined,
            calendarResult: message.role === "assistant" ? state?.calendarResult : undefined,
            calendarTurnId: message.role === "assistant" ? message.turnId : undefined,
            customerResult:
              message.role === "assistant" ? state?.customerResult : undefined,
            workOrderResult:
              message.role === "assistant" ? state?.workOrderResult : undefined,
            estimateResult:
              message.role === "assistant" ? state?.estimateResult : undefined,
            estimateDraft:
              message.role === "assistant" ? state?.estimateDraft : undefined,
            estimateSharing:
              message.role === "assistant" ? state?.estimateSharing : undefined,
            estimateDecision:
              message.role === "assistant" ? state?.estimateDecision : undefined,
            estimateDraftAction:
              message.role === "assistant" ? state?.estimateDraftAction : undefined,
            estimateVoid:
              message.role === "assistant" ? state?.estimateVoid : undefined,
            estimateArchive:
              message.role === "assistant" ? state?.estimateArchive : undefined,
            estimateDraftDelete:
              message.role === "assistant" ? state?.estimateDraftDelete : undefined,
            estimateConversion:
              message.role === "assistant" ? state?.estimateConversion : undefined,
            action: message.role === "assistant" ? state?.action : undefined,
            detailsResult:
              message.role === "assistant" ? state?.detailsResult : undefined,
            historyResult:
              message.role === "assistant" ? state?.historyResult : undefined,
            searchResult:
              message.role === "assistant" ? state?.searchResult : undefined,
            sources: message.role === "assistant" ? state?.sources : undefined,
            interrupted:
              message.role === "assistant" &&
              !!state &&
              ["failed", "cancelled", "interrupted"].includes(state.state),
          };
        }),
      );
      const latest = history.turns.at(-1);
      if (
        latest &&
        ["failed", "cancelled", "interrupted"].includes(latest.state) &&
        !lastRequest.current
      ) {
        const message = history.messages
          .filter((message) => message.role === "user")
          .at(-1)?.text;
        if (message) {
          lastRequest.current = {
            workspaceId,
            threadId: history.threadId,
            surfaceKey: latest.surfaceKey ?? surfaceKey,
            ...latest.pageContext,
            clientTurnId: latest.clientTurnId,
            message,
          };
          setCanRetry(true);
        }
      }
      if (latest && ["accepted", "running"].includes(latest.state)) {
        turn.current = latest.id;
        setRunStatus("thinking");
      } else {
        turn.current = undefined;
        setRunStatus(
          latest?.state === "completed"
            ? "completed"
            : latest?.state === "cancelled"
              ? "cancelled"
              : latest
                ? "failed"
                : undefined,
        );
      }
      return history;
    },
    [workspaceId, surfaceKey],
  );
  useEffect(() => {
    mounted.current = true;
    const id = rememberedThread(workspaceId);
    thread.current = id;
    void Promise.resolve()
      .then(() => (id ? restore(id) : undefined))
      .catch(() => {
        if (mounted.current) {
          setBlocked(true);
          setRunStatus("failed");
        }
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => {
      mounted.current = false;
      abort.current?.abort();
    };
  }, [workspaceId, restore]);
  // Reopen/focus and bounded idle refresh reauthorize cached customer cards without model calls.
  useEffect(() => {
    if (!workspaceAssistant?.open || loading) return;
    const refresh = () => {
      if (
        pending.current ||
        !thread.current ||
        document.visibilityState === "hidden"
      )
        return;
      void restore(thread.current).catch(() => {
        setMessages([]);
        setBlocked(true);
      });
    };
    refresh();
    window.addEventListener("focus", refresh);
    const timer = setInterval(refresh, 15000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [workspaceAssistant?.open, loading, restore]);
  // A disconnected accepted run can still be settling on the server. Read only; never regenerate.
  useEffect(() => {
    if (
      pending.current ||
      !thread.current ||
      !["thinking", "streaming"].includes(runStatus ?? "")
    )
      return;
    const timer = setInterval(() => {
      if (thread.current)
        void restore(thread.current).catch(() => {
          setBlocked(true);
          setRunStatus("failed");
        });
    }, 1500);
    return () => clearInterval(timer);
  }, [runStatus, restore]);
  async function send(message: string, reconciliation?: ChatTurnRequest) {
    if (pending.current || blocked)
      return { ok: false as const, message: copy.unavailable };
    if (recoveryRequired.current && !reconciliation)
      return { ok: false as const, message: copy.interrupted };
    pending.current = true;
    stopRequested.current = false;
    const request: ChatTurnRequest = reconciliation ?? {
      workspaceId,
      threadId: thread.current,
      surfaceKey,
      clientTurnId: crypto.randomUUID(),
      ...(workspaceAssistant?.pageContext?.recordRefs
        ? { recordRefs: workspaceAssistant.pageContext.recordRefs }
        : {}),
      ...(workspaceAssistant?.pageContext?.uiState
        ? { uiState: workspaceAssistant.pageContext.uiState }
        : {}),
      ...(workspaceAssistant?.pageContext?.customerFilters
        ? { customerFilters: workspaceAssistant.pageContext.customerFilters }
        : {}),
      ...(workspaceAssistant?.pageContext?.calendarVisit ? { calendarVisit:workspaceAssistant.pageContext.calendarVisit } : {}),
      ...(workspaceAssistant?.pageContext?.calendarFilters ? { calendarFilters: workspaceAssistant.pageContext.calendarFilters } : {}),
      ...(workspaceAssistant?.pageContext?.estimateFilters
        ? { estimateFilters: workspaceAssistant.pageContext.estimateFilters }
        : {}),
      message,
    };
    const selected = workspaceAssistant?.pageContext;
    const sameContext =
      JSON.stringify({
        recordRefs: request.recordRefs,
        uiState: request.uiState,
        customerFilters: request.customerFilters,
        estimateFilters: request.estimateFilters,
        calendarFilters: request.calendarFilters,
        calendarVisit: request.calendarVisit,
      }) ===
      JSON.stringify({
        recordRefs: selected?.recordRefs,
        uiState: selected?.uiState,
        customerFilters: selected?.customerFilters,
        estimateFilters: selected?.estimateFilters,
        calendarFilters: selected?.calendarFilters,
        calendarVisit: selected?.calendarVisit,
      });
    setPendingContextLabel(
      sameContext
        ? selected?.label
        : request.recordRefs?.length ||
            request.uiState ||
            request.customerFilters ||
            request.estimateFilters || request.calendarFilters || request.calendarVisit
          ? copy.previousContext
          : undefined,
    );
    lastRequest.current = request;
    setCanRetry(true);
    abort.current = new AbortController();
    const localUser = `user-${request.clientTurnId}`;
    const localAssistant = `assistant-${request.clientTurnId}`;
    setMessages((current) => [
      ...current.filter(
        (item) => item.id !== localUser && item.id !== localAssistant,
      ),
      { id: localUser, role: "user", text: message },
      { id: localAssistant, role: "assistant", text: "" },
    ]);
    setRunStatus("thinking");
    let terminal = false;
    let result: { ok: true } | { ok: false; message: string } = {
      ok: false,
      message: copy.interrupted,
    };
    try {
      const response = await fetch("/api/chat/turns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: abort.current.signal,
      });
      if (!response.ok) {
        terminal = true; // Known rejection: no accepted run to reconcile.
        if (response.status === 409 && (await response.json().catch(() => null))?.error === 'calendar_context_changed') throw Error(copy.calendarContextChanged);
        if ([401, 403].includes(response.status)) {
          setBlocked(true);
          throw Error(copy.denied);
        }
        if (response.status === 429) throw Error(copy.limited);
        throw Error(copy.unavailable);
      }
      if (response.headers.get("content-type")?.includes("application/json")) {
        const replay = chatReplayResponseSchema.parse(await response.json());
        thread.current = replay.threadId;
        rememberThread(workspaceId, replay.threadId);
        await restore(replay.threadId);
        recoveryRequired.current = false;
        terminal = true;
        result =
          replay.state === "completed" ||
          ["accepted", "running"].includes(replay.state)
            ? { ok: true }
            : { ok: false, message: copy.interrupted };
        return result;
      }
      if (
        !response.headers.get("content-type")?.includes("text/event-stream") ||
        !response.body
      )
        throw Error(copy.interrupted);
      for await (const event of readChatStream(response.body)) {
        if (!mounted.current) break;
        switch (event.type) {
          case "turn.accepted":
            thread.current = event.threadId;
            turn.current = event.turnId;
            rememberThread(workspaceId, event.threadId);
            if (stopRequested.current) void stop();
            break;
          case "status":
            setRunStatus("thinking");
            break;
          case "message.delta":
            setRunStatus("streaming");
            setMessages((current) =>
              current.map((item) =>
                item.id === localAssistant
                  ? { ...item, text: item.text + event.text }
                  : item,
              ),
            );
            break;
          case "sources":
            setMessages((current) =>
              current.map((item) =>
                item.id === localAssistant
                  ? { ...item, sources: event.sources }
                  : item,
              ),
            );
            break;
          case "customers.result":
            setMessages((items) =>
              items.map((item) =>
                item.id === localAssistant
                  ? { ...item, customerResult: event.result }
                  : item,
              ),
            );
            break;
          case "calendar.proposal":
            setMessages(items => items.map(item => item.id === localAssistant ? { ...item,calendarProposal:event.result } : item));
            break;
          case "calendar.result":
            setMessages(items => items.map(item => item.id === localAssistant ? { ...item, calendarResult: event.result, calendarTurnId: event.turnId } : item));
            break;
          case "work_orders.result":
            setMessages((items) =>
              items.map((item) =>
                item.id === localAssistant
                  ? { ...item, workOrderResult: event.result }
                  : item,
              ),
            );
            break;
          case "estimates.result":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateResult: event.result } : item,
            ));
            break;
          case "estimates.draft":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateDraft: event.result } : item,
            ));
            break;
          case "estimates.draft_action":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateDraftAction: event.result } : item,
            ));
            break;
          case "estimates.void":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateVoid: event.result } : item,
            ));
            break;
          case "estimates.archive":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateArchive: event.result } : item,
            ));
            break;
          case "estimates.draft_delete":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateDraftDelete: event.result } : item,
            ));
            break;
          case "estimates.convert":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateConversion: event.result } : item,
            ));
            break;
          case "estimates.decision":
            setMessages((items) => items.map(item =>
              item.id === localAssistant ? { ...item, estimateDecision: event.result } : item,
            ));
            break;
          case "estimates.sharing":
            setMessages(items => items.map(item =>
              item.id === localAssistant ? { ...item, estimateSharing: event.result } : item,
            ));
            break;
          case "lead.history":
            setMessages((items) =>
              items.map((item) =>
                item.id === localAssistant
                  ? { ...item, historyResult: event.result }
                  : item,
              ),
            );
            break;
          case "lead.details":
            setMessages((current) =>
              current.map((item) =>
                item.id === localAssistant
                  ? { ...item, detailsResult: event.result }
                  : item,
              ),
            );
            break;
          case "leads.results":
            setMessages((current) =>
              current.map((item) =>
                item.id === localAssistant
                  ? { ...item, searchResult: event.result }
                  : item,
              ),
            );
            break;
          case "action.proposed":
            setMessages((current) =>
              current.map((item) =>
                item.id === localAssistant
                  ? { ...item, action: event.action }
                  : item,
              ),
            );
            break;
          case "turn.completed":
            terminal = true;
            setRunStatus("completed");
            result = { ok: true };
            break;
          case "turn.cancelled":
            terminal = true;
            setRunStatus("cancelled");
            result = { ok: true };
            break;
          case "turn.failed":
            terminal = true;
            setRunStatus("failed");
            if (event.code === "access_denied") setBlocked(true);
            result = {
              ok: false,
              message:
                event.code === "budget_exceeded"
                  ? copy.budgetExceeded
                  : event.code === "access_denied"
                    ? copy.denied
                    : copy.interrupted,
            };
            break;
        }
      }
    } catch (error) {
      if (mounted.current) {
        setRunStatus("failed");
        result = {
          ok: false,
          message:
            error instanceof Error &&
            [copy.denied, copy.limited, copy.unavailable, copy.calendarContextChanged].some(
              (message) => message === error.message,
            )
              ? error.message
              : copy.interrupted,
        };
      }
    } finally {
      pending.current = false;
      abort.current = undefined;
      if (mounted.current) {
        if (!terminal) recoveryRequired.current = true;
        setMessages((current) =>
          current.map((item) =>
            item.id === localAssistant
              ? { ...item, interrupted: !terminal || !result.ok }
              : item,
          ),
        );
      }
      turn.current = undefined;
      if (terminal && thread.current && mounted.current && !blocked)
        await restore(thread.current).catch(() => {});
    }
    return result;
  }
  async function stop() {
    stopRequested.current = true;
    if (!turn.current) return; // Cancel immediately once acceptance supplies the durable run ID.
    try {
      const response = await fetch("/api/chat/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, turnId: turn.current }),
      });
      if (!response.ok) abort.current?.abort();
    } catch {
      abort.current?.abort();
    }
  }
  async function retry() {
    if (!lastRequest.current)
      return { ok: false as const, message: copy.interrupted };
    if (thread.current) {
      try {
        const history = await restore(thread.current);
        if (
          history.turns.some((turn) =>
            ["accepted", "running"].includes(turn.state),
          )
        )
          return { ok: false as const, message: copy.interrupted };
        if (history.turns.at(-1)?.state === "completed") {
          recoveryRequired.current = false;
          return { ok: true as const };
        }
      } catch {
        return { ok: false as const, message: copy.denied };
      }
    } else if (recoveryRequired.current)
      return send(lastRequest.current.message, lastRequest.current);
    recoveryRequired.current = false;
    return send(lastRequest.current.message, {
      ...lastRequest.current,
      threadId: thread.current,
      clientTurnId: crypto.randomUUID(),
    });
  }
  function newConversation() {
    if (pending.current) return;
    thread.current = undefined;
    turn.current = undefined;
    lastRequest.current = undefined;
    recoveryRequired.current = false;
    rememberThread(workspaceId);
    setCanRetry(false);
    setMessages([]);
    setRunStatus(undefined);
    setBlocked(false);
  }
  async function openLeadResult(
    resultId: string,
    leadId: string | undefined,
    changedMessage: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    if (pending.current || blocked)
      return { ok: false, message: copy.unavailable };
    try {
      const response = await fetch("/api/chat/leads/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          resultId,
          ...(leadId ? { leadId } : {}),
        }),
      });
      if (!response.ok) {
        // Clear cached content immediately if a snapshot is no longer authorized/current.
        setMessages([]);
        if (thread.current) await restore(thread.current).catch(() => {});
        return { ok: false, message: changedMessage };
      }
      const body: { href?: unknown } = await response.json();
      // Only the app route generates destinations. Never follow arbitrary model/client URLs.
      if (
        typeof body.href !== "string" ||
        !/^\/leads(?:\/[0-9a-f-]{36})?\?/.test(body.href)
      )
        throw Error("Invalid destination");
      workspaceAssistant?.setOpen(false);
      workspaceAssistant?.clearPageContext();
      router.push(body.href);
      return { ok: true };
    } catch {
      return { ok: false, message: copy.unavailable };
    }
  }
  return (
    <AssistantPanel
      open={workspaceAssistant?.open}
      onOpenChange={workspaceAssistant?.setOpen}
      draft={workspaceAssistant?.draft}
      onDraftChange={workspaceAssistant?.setDraft}
      returnFocusRef={workspaceAssistant?.returnFocusRef}
      contextLabel={
        runStatus === "thinking" || runStatus === "streaming"
          ? pendingContextLabel
          : workspaceAssistant?.pageContext?.label
      }
      onClearContext={workspaceAssistant?.clearPageContext}
      messages={messages}
      renderMessageSupplement={(message) => {
        const calendar = messages.find(item => item.id === message.id);
        const customer = messages.find(
          (item) => item.id === message.id,
        )?.customerResult;
        const workOrder = messages.find(
          (item) => item.id === message.id,
        )?.workOrderResult;
        const estimate = messages.find(item => item.id === message.id)?.estimateResult;
        const estimateDraft = messages.find(item => item.id === message.id)?.estimateDraft;
        const estimateSharing = messages.find(item => item.id === message.id)?.estimateSharing;
        const estimateDecision = messages.find(item => item.id === message.id)?.estimateDecision;
        const estimateDraftAction = messages.find(item => item.id === message.id)?.estimateDraftAction;
        const estimateVoid = messages.find(item => item.id === message.id)?.estimateVoid;
        const estimateArchive = messages.find(item => item.id === message.id)?.estimateArchive;
        const estimateDraftDelete = messages.find(item => item.id === message.id)?.estimateDraftDelete;
        const estimateConversion = messages.find(item => item.id === message.id)?.estimateConversion;
        if (!calendar?.calendarProposal && !calendar?.calendarResult && !customer && !workOrder && !estimate && !estimateDraft && !estimateSharing && !estimateDecision && !estimateDraftAction && !estimateVoid && !estimateArchive && !estimateDraftDelete && !estimateConversion) return null;
        return <div className="grid min-w-0 gap-4">
          {calendar?.calendarProposal && <ConnectedCalendarSchedule ticket={calendar.calendarProposal} workspaceId={workspaceId} disabled={blocked || runStatus === "thinking" || runStatus === "streaming"} onRefresh={async () => { if (thread.current) await restore(thread.current);router.refresh(); }}/>}
          {calendar?.calendarResult && calendar.calendarTurnId && <ConnectedCalendarResult key={`${workspaceId}:${calendar.calendarTurnId}:${calendar.calendarResult.id}`} result={calendar.calendarResult} workspaceId={workspaceId} turnId={calendar.calendarTurnId} disabled={blocked || runStatus === 'thinking' || runStatus === 'streaming'} onNavigate={href => { workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href); }}/>}

          {workOrder && (
            <ConnectedWorkOrderResult
              result={workOrder}
              workspaceId={workspaceId}
              disabled={
                blocked || runStatus === "thinking" || runStatus === "streaming"
              }
              onRefresh={async () => {
                if (thread.current) await restore(thread.current);
                router.refresh();
              }}
              onNavigate={(href) => {
                workspaceAssistant?.setOpen(false);
                workspaceAssistant?.clearPageContext();
                router.push(href);
              }}
            />
          )}
        {customer && (
          <ConnectedCustomerResult
            result={customer}
            workspaceId={workspaceId}
            disabled={
              blocked || runStatus === "thinking" || runStatus === "streaming"
            }
            onRefresh={async (deleted) => {
              if (deleted) {
                setMessages([]);
                lastRequest.current = undefined;
                setCanRetry(false);
                workspaceAssistant?.clearPageContext();
              }
              try {
                if (thread.current) await restore(thread.current);
              } catch (error) {
                if (!deleted) throw error;
              }
              if (
                deleted &&
                window.location.pathname.startsWith("/customers/")
              ) {
                workspaceAssistant?.setOpen(false);
                workspaceAssistant?.clearPageContext();
                router.replace(`/customers?workspace=${workspaceId}`);
                return;
              }
              router.refresh();
            }}
            onNavigate={(href) => {
              workspaceAssistant?.setOpen(false);
              workspaceAssistant?.clearPageContext();
              router.push(href);
            }}
          />
        )}
        {estimate && <ConnectedEstimateResult
          key={estimate.turnId}
          result={estimate}
          workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => {
            if (thread.current) await restore(thread.current);
          }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false);
            workspaceAssistant?.clearPageContext();
            router.push(href);
          }}
        />}
        {estimateDraft && <ConnectedEstimateDraft
          key={estimateDraft.draft.id} view={estimateDraft} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateSharing && <ConnectedEstimateSharing
          key={estimateSharing.id} ticket={estimateSharing} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateVoid && <ConnectedEstimateVoid
          key={estimateVoid.id} ticket={estimateVoid} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateDraftAction && <ConnectedEstimateDraftAction
          key={estimateDraftAction.id} ticket={estimateDraftAction} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateDecision && <ConnectedEstimateDecision
          key={estimateDecision.id} ticket={estimateDecision} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateArchive && <ConnectedEstimateArchive
          key={estimateArchive.id} ticket={estimateArchive} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false); workspaceAssistant?.clearPageContext(); router.push(href);
          }}
        />}
        {estimateDraftDelete && <ConnectedEstimateDraftDelete
          key={estimateDraftDelete.id} ticket={estimateDraftDelete} workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); router.refresh(); }}
        />}
        {estimateConversion && <ConnectedEstimateConversion
          key={estimateConversion.id}
          ticket={estimateConversion}
          workspaceId={workspaceId}
          disabled={blocked || runStatus === "thinking" || runStatus === "streaming"}
          onRefresh={async () => { if (thread.current) await restore(thread.current); }}
          onOpenReview={() => workspaceAssistant?.setOpen(false)}
          onNavigate={href => {
            workspaceAssistant?.setOpen(false);
            workspaceAssistant?.clearPageContext();
            router.push(href);
          }}
        />}
        </div>;
      }}
      runStatus={runStatus}
      disabled={loading}
      sendDisabled={blocked}
      badge={loading ? copy.loading : undefined}
      onOpenSearchResult={(resultId, leadId) =>
        openLeadResult(resultId, leadId, copy.searchChanged)
      }
      onOpenHistoryResult={(resultId, leadId) =>
        openLeadResult(resultId, leadId, copy.historyChanged)
      }
      onOpenDetailsResult={(resultId, leadId) =>
        openLeadResult(resultId, leadId, copy.detailsChanged)
      }
      onAction={async (draft, decision, typedConfirmation) => {
        if (pending.current || blocked)
          return { ok: false, message: copy.unavailable };
        try {
          const isDelete =
            "actionType" in draft && draft.actionType === "lead.delete";
          const isExport =
            "actionType" in draft &&
            draft.actionType === "lead.export" &&
            decision === "confirm";
          const response = await fetch(
            isDelete
              ? "/api/chat/deletions"
              : isExport
                ? "/api/chat/exports"
                : "/api/chat/actions",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                workspaceId,
                draftId: draft.id,
                inputHash: draft.inputHash,
                decision,
                ...(isDelete
                  ? { typedConfirmation: typedConfirmation ?? "" }
                  : {}),
              }),
            },
          );
          if (!response.ok) {
            const failure = await response.json().catch(() => null);
            if (thread.current) await restore(thread.current);
            return {
              ok: false,
              message:
                failure?.error === "plan_limit"
                  ? copy.leadLimit
                  : response.status === 403
                    ? copy.denied
                    : response.status === 409
                      ? copy.draftChanged
                      : copy.interrupted,
            };
          }
          if (isExport) {
            // Await the complete body: never download a partial CSV after a stream failure.
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `salesmora-leads-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            setMessages((current) =>
              current.map((item) =>
                item.action?.id === draft.id
                  ? { ...item, action: { ...draft, state: "confirmed" } }
                  : item,
              ),
            );
            return { ok: true };
          }
          const { action } = chatActionResponseSchema.parse(
            await response.json(),
          );
          if (
            "actionType" in action &&
            action.actionType === "lead.delete" &&
            action.state === "confirmed"
          ) {
            // Remove cached lead-derived cards/text immediately, even if the protected history refresh fails.
            setMessages([
              {
                id: action.id,
                role: "assistant",
                text: copy.leadDeleted,
                action,
              },
            ]);
            lastRequest.current = undefined;
            setCanRetry(false);
            workspaceAssistant?.clearPageContext();
            try {
              if (thread.current) await restore(thread.current);
            } catch {
              /* Keep only the non-content receipt. */
            }
          } else
            setMessages((current) =>
              current.map((item) =>
                item.action?.id === action.id ? { ...item, action } : item,
              ),
            );
          if (decision === "confirm" && action.state === "confirmed") {
            if (
              "actionType" in action &&
              action.actionType === "lead.delete" &&
              window.location.pathname.toLowerCase() ===
                `/leads/${action.lead.id.toLowerCase()}`
            ) {
              workspaceAssistant?.clearPageContext();
              router.replace(
                `/leads?workspace=${encodeURIComponent(workspaceId)}`,
              );
            } else router.refresh();
          }
          return { ok: true };
        } catch {
          return { ok: false, message: copy.decisionInterrupted };
        }
      }}
      onSend={send}
      onStop={() => void stop()}
      onRetry={canRetry && !blocked ? retry : undefined}
      onNewConversation={newConversation}
    />
  );
}

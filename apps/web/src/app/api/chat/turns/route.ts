import {
  AIBudgetExceededError,
  chatStreamEventSchema,
  chatTurnRequestSchema,
  type ChatStreamEvent,
} from "@salesmora/contracts";
import { AuthorizationAccessError, createAIUsageSession, createDatabaseMeasurement, isFeatureFlagEnabled, withDatabasePhase } from "@salesmora/data";
import { randomUUID } from "node:crypto";
import { getAuthenticatedSession } from "../../../../server/auth/session";
import { database } from "../../../../server/workspaces/store";
import {
  acceptTurn,
  ChatCancelledError,
  ChatLimitError,
  finishTurn,
} from "../../../../server/chat/store";
import {
  chatBody,
  chatError,
  chatReply,
  validChatOrigin,
} from "../../../../server/chat/http";
import { chatRuntimeAvailable } from "../../../../server/chat/config";
import { liveChatResponse } from "../../../../server/chat/runtime";
import { createTranscriptDelivery } from "../../../../server/chat/transcript-delivery";
import { watchChatTurnCancellation } from "../../../../server/chat/cancellation";
import { withChatRequest } from "../../../../server/chat/request-context";
import {
  testChatProviderEnabled,
  testChatResponse,
  testDraftModel,
} from "../../../../server/chat/test-provider";

export const runtime = "nodejs";
export const maxDuration = 100;
class ChatProviderUnavailableError extends Error {}
export async function POST(request: Request) {
  if (process.env.CHAT_DB_METRICS !== "true") return postTurn(request);
  const measurement = createDatabaseMeasurement();
  const measurementId = randomUUID();
  let reported = false;
  const report = () => {
    if (reported) return;
    reported = true;
    console.info("chat_database " + JSON.stringify({ measurementId, ...measurement.snapshot() }));
  };
  return measurement.run(async () => {
    try {
      const response = await postTurn(request, report);
      response.headers.set("X-Chat-Database-Metrics-Id", measurementId);
      if (!response.headers.get("Content-Type")?.startsWith("text/event-stream")) report();
      return response;
    } catch (error) {
      report();
      throw error;
    }
  });
}
async function postTurn(request: Request, reportDatabase?: () => void) {
  if (!validChatOrigin(request))
    return chatReply({ error: "invalid_origin" }, 403);
  const session = await getAuthenticatedSession();
  if (!session) return chatReply({ error: "authentication_required" }, 401);
  const sessionId = session.session.id;
  try {
    let body: unknown;
    try {
      body = await chatBody(request);
    } catch (error) {
      if (error instanceof ChatLimitError)
        return chatReply({ error: "payload_too_large" }, 413);
      throw error;
    }
    const parsed = chatTurnRequestSchema.safeParse(body);
    if (!parsed.success) return chatReply({ error: "invalid_request" }, 422);
    const input = parsed.data;
    const identity = {
      userId: session.user.id,
      workspaceId: input.workspaceId,
    };
    const admission = await withDatabasePhase("accept", () => acceptTurn(identity, input, async trx => {
      if (!chatRuntimeAvailable() || !await isFeatureFlagEnabled(database(), "chat.enabled", input.workspaceId, trx))
        throw new ChatProviderUnavailableError();
    }));
    const { turn, replay, authority, clock } = admission;
    if (replay)
      return chatReply({
        replay: true,
        threadId: turn.threadId,
        turnId: turn.id,
        state: turn.state,
      });
    const usage = createAIUsageSession(database(), { ...identity, turnId: turn.id });
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort("timeout"), 90_000);
    const disconnected = () => abort.abort("disconnect");
    request.signal.addEventListener("abort", disconnected, { once: true });
    if (request.signal.aborted) disconnected();
    const encoder = new TextEncoder();
    let sequence = 0;
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        return withChatRequest({ authority, turn, sessionId, clock, usage,
          reference: 'reference' in admission ? admission.reference : undefined,
          calendarFocus: 'calendarFocus' in admission ? admission.calendarFocus : undefined }, async () => {
        const heartbeat = setInterval(() => {
          if (!closed) controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 10_000);
        const cancellation = watchChatTurnCancellation(identity, turn.id, abort);
        const send = (event: object) => {
          if (closed) return;
          const parsedEvent: ChatStreamEvent = chatStreamEventSchema.parse({
            version: 1,
            runId: turn.id,
            turnId: turn.id,
            sequence: ++sequence,
            ...event,
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(parsedEvent)}\n\n`),
          );
        };
        let customerResult;
        let workOrderResult;
        let calendarResult;
        let reportResult;
        let captureResult;
        let workflowDraft;
        let calendarProposal;
        let captureSetup;
        let captureSource;
        let estimateResult;
        let estimateDraft;
        let estimateSharing;
        let estimateDecision;
        let estimateDraftAction;
        let estimateVoid;
        let estimateArchive;
        let estimateDraftDelete;
        let estimateConversion;
        let proposedAction;
        let searchResult;
        let historyResult;
        let detailsResult;
        let sources: Extract<ChatStreamEvent, { type: "sources" }>["sources"] | undefined;
        const delivery = createTranscriptDelivery({
          signal: abort.signal,
          authorize: async () => {
            abort.signal.throwIfAborted();
          },
          persist: text => withDatabasePhase("finalize", async () => {
            abort.signal.throwIfAborted();
            await finishTurn(identity, turn.id, "completed", text, sessionId);
          }),
          send: text => send({ type: "message.delta", messageId: turn.messageId, text }),
          onFailure: () => abort.abort("delivery_failed"),
        });
        try {
          await cancellation.ready;
          abort.signal.throwIfAborted();
          send({
            type: "turn.accepted",
            threadId: turn.threadId,
            messageId: turn.messageId,
          });
          send({ type: "status", status: "thinking" });
          const emit = async (
            event:
              | { type: "status"; status: "retrieving" | "preparing_draft" }
              | { type: "text"; text: string },
          ) => {
            if (event.type === "text") {
              await delivery.push(event.text);
              return;
            }
            abort.signal.throwIfAborted();
            send(event);
          };
          const fixtureModel = testDraftModel(input.message, { ...identity, turnId: turn.id });
          if (testChatProviderEnabled() && !fixtureModel) {
            for await (const text of testChatResponse(
              input.message,
              abort.signal,
              { ...identity, turnId: turn.id },
            ))
              await emit({ type: "text", text });
          } else {
            const result = await withDatabasePhase("runtime", () => liveChatResponse(
              identity,
              input,
              turn,
              abort.signal,
              emit,
              sessionId,
              fixtureModel,
            ));
            customerResult = result.customerResult;
            workOrderResult = result.workOrderResult;
            calendarResult = result.calendarResult;
            reportResult = result.reportResult;
            captureSource = result.captureSource;
            captureSetup = result.captureSetup;
            captureResult = result.captureResult;
            workflowDraft = result.workflowDraft;
            calendarProposal = result.calendarProposal;
            estimateResult = result.estimateResult;
            estimateDraft = result.estimateDraft;
            estimateSharing = result.estimateSharing;
            estimateDecision = result.estimateDecision;
            estimateDraftAction = result.estimateDraftAction;
            estimateVoid = result.estimateVoid;
            estimateArchive = result.estimateArchive;
            estimateDraftDelete = result.estimateDraftDelete;
            estimateConversion = result.estimateConversion;
            proposedAction = result.action;
            searchResult = result.searchResult;
            detailsResult = result.detailsResult;
            historyResult = result.historyResult;
            sources = result.sources;
          }
          await withDatabasePhase("runtime", () => usage.flush());
          await delivery.finish();
          abort.signal.throwIfAborted();
          // Admission covers this answer; later history/navigation requests authorize independently.
          if (sources?.length)
            send({ type: "sources", messageId: turn.messageId, sources });
          if (historyResult) {
            send({
              type: "lead.history",
              messageId: turn.messageId,
              result: historyResult,
            });
          }
          if (detailsResult) {
            send({
              type: "lead.details",
              messageId: turn.messageId,
              result: detailsResult,
            });
          }
          if (searchResult) {
            send({
              type: "leads.results",
              messageId: turn.messageId,
              result: searchResult,
            });
          }
          if (customerResult) {
            send({
              type: "customers.result",
              messageId: turn.messageId,
              result: customerResult,
            });
          }
          if (workflowDraft) send({ type: "workflow.draft", messageId: turn.messageId, result: workflowDraft });
          if (calendarProposal) send({ type:"calendar.proposal",messageId:turn.messageId,result:calendarProposal });
          if (captureSource) send({ type: "capture.source", messageId: turn.messageId, result: captureSource });
          if (captureSetup) send({ type: "capture.setup", messageId: turn.messageId, result: captureSetup });
          if (captureResult) send({ type: "capture.result", messageId: turn.messageId, result: captureResult });
          if (calendarResult) send({ type: "calendar.result", messageId: turn.messageId, result: calendarResult });
          if (reportResult) send({ type: "report.result", messageId: turn.messageId, result: reportResult });
          if (workOrderResult) {
            send({
              type: "work_orders.result",
              messageId: turn.messageId,
              result: workOrderResult,
            });
          }
          if (proposedAction) {
            send({
              type: "action.proposed",
              messageId: turn.messageId,
              action: proposedAction,
            });
          }
          if (estimateResult) {
            send({
              type: "estimates.result",
              messageId: turn.messageId,
              result: estimateResult,
            });
          }
          if (estimateDraft) {
            send({ type: "estimates.draft", messageId: turn.messageId, result: estimateDraft });
          }
          if (estimateSharing) {
            send({ type: "estimates.sharing", messageId: turn.messageId, result: estimateSharing });
          }
          if (estimateDraftAction) {
            send({ type: "estimates.draft_action", messageId: turn.messageId, result: estimateDraftAction });
          }
          if (estimateVoid) {
            send({ type: "estimates.void", messageId: turn.messageId, result: estimateVoid });
          }
          if (estimateArchive) {
            send({ type: "estimates.archive", messageId: turn.messageId, result: estimateArchive });
          }
          if (estimateDraftDelete) {
            send({ type: "estimates.draft_delete", messageId: turn.messageId, result: estimateDraftDelete });
          }
          if (estimateConversion) {
            send({ type: "estimates.convert", messageId: turn.messageId, result: estimateConversion });
          }
          if (estimateDecision) {
            send({ type: "estimates.decision", messageId: turn.messageId, result: estimateDecision });
          }
          send({ type: "turn.completed", messageId: turn.messageId });
        } catch (error) {
          try {
            await delivery.stop();
          } catch (deliveryError) {
            error = deliveryError;
          }
          const reason = abort.signal.reason;
          abort.abort("failed");
          const cancelled =
            error instanceof ChatCancelledError ||
            ["disconnect", "cancelled"].includes(reason);
          try {
            await withDatabasePhase("runtime", () => usage.flush(cancelled ? "cancelled" : "failed"));
          } catch (usageError) {
            console.error("Chat usage settlement failed.", usageError instanceof Error ? usageError.name : "UnknownError");
            error = usageError;
          }
          try {
            await finishTurn(
              identity,
              turn.id,
              cancelled ? "cancelled" : "failed",
            );
          } catch {
            // Do not claim a durable terminal state when the database is unavailable.
            if (!closed) {
              closed = true;
              controller.error(new Error("Chat stream interrupted"));
            }
            return;
          }
          send(
            cancelled
              ? { type: "turn.cancelled", messageId: turn.messageId }
              : {
                  type: "turn.failed",
                  messageId: turn.messageId,
                  code:
                    error instanceof AIBudgetExceededError
                      ? "budget_exceeded"
                      : error instanceof AuthorizationAccessError
                        ? "access_denied"
                        : reason === "timeout"
                          ? "timeout"
                          : "provider_unavailable",
                },
          );
        } finally {
          console.info("chat_delivery", delivery.metrics);
          clearTimeout(timeout);
          clearInterval(heartbeat);
          void cancellation.stop().then(() => reportDatabase?.());
          request.signal.removeEventListener("abort", disconnected);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
        });
      },
      cancel() {
        closed = true;
        abort.abort("disconnect");
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof ChatProviderUnavailableError)
      return chatReply({ error: "provider_unavailable" }, 503);
    return chatError(error);
  }
}

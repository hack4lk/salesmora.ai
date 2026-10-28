import {
  AIBudgetExceededError,
  chatStreamEventSchema,
  chatTurnRequestSchema,
  type ChatStreamEvent,
} from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import { AuthorizationAccessError } from "@salesmora/data";
import { getSession } from "../../../../server/auth/session";
import { workspaceAuthorization } from "../../../../server/authorization/permissions";
import {
  acceptTurn,
  appendDelta,
  ChatCancelledError,
  ChatLimitError,
  finishTurn,
  turnStillActive,
} from "../../../../server/chat/store";
import {
  chatBody,
  chatError,
  chatReply,
  validChatOrigin,
} from "../../../../server/chat/http";
import { chatRuntimeAvailable } from "../../../../server/chat/config";
import { liveChatResponse } from "../../../../server/chat/runtime";
import { validateTurnEvidence } from "../../../../server/chat/store";
import {
  testChatProviderEnabled,
  testChatResponse,
  testDraftModel,
} from "../../../../server/chat/test-provider";

export const runtime = "nodejs";
export const maxDuration = 100;
export async function POST(request: Request) {
  if (!validChatOrigin(request))
    return chatReply({ error: "invalid_origin" }, 403);
  const session = await getSession();
  if (!session) return chatReply({ error: "authentication_required" }, 401);
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
    const context = await workspaceAuthorization(
      identity.userId,
      identity.workspaceId,
    );
    if (!authorize(context, { permission: "assistant.use" }).allowed)
      throw new AuthorizationAccessError();
    if (!chatRuntimeAvailable())
      return chatReply({ error: "provider_unavailable" }, 503);
    const { turn, replay } = await acceptTurn(identity, input);
    if (replay)
      return chatReply({
        replay: true,
        threadId: turn.threadId,
        turnId: turn.id,
        state: turn.state,
      });
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
        const heartbeat = setInterval(() => {
          if (!closed) controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 10_000);
        // A persisted Stop must abort upstream even while no provider token is arriving.
        let checking = false;
        const cancellation = setInterval(async () => {
          if (checking || closed || abort.signal.aborted) return;
          checking = true;
          try {
            if (!(await turnStillActive(identity, turn.id)))
              abort.abort("cancelled");
          } catch {
            abort.abort("unavailable");
          } finally {
            checking = false;
          }
        }, 250);
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
        let calendarProposal;
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
        try {
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
            if (abort.signal.aborted) throw new ChatCancelledError();
            if ((await getSession())?.user.id !== identity.userId)
              throw new AuthorizationAccessError();
            if (event.type === "text") {
              await appendDelta(identity, turn.id, event.text);
              send({
                type: "message.delta",
                messageId: turn.messageId,
                text: event.text,
              });
            } else {
              await validateTurnEvidence(identity, turn.id);
              send(event);
            }
          };
          const fixtureModel = testDraftModel(input.message);
          if (testChatProviderEnabled() && !fixtureModel) {
            for await (const text of testChatResponse(
              input.message,
              abort.signal,
              { ...identity, turnId: turn.id },
            ))
              await emit({ type: "text", text });
          } else {
            const result = await liveChatResponse(
              identity,
              input,
              turn,
              abort.signal,
              emit,
              fixtureModel,
            );
            customerResult = result.customerResult;
            workOrderResult = result.workOrderResult;
            calendarResult = result.calendarResult;
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
            await validateTurnEvidence(identity, turn.id);
            if ((await getSession())?.user.id !== identity.userId)
              throw new AuthorizationAccessError();
            if (result.sources.length)
              send({
                type: "sources",
                messageId: turn.messageId,
                sources: result.sources,
              });
          }
          if ((await getSession())?.user.id !== identity.userId)
            throw new AuthorizationAccessError();
          await finishTurn(identity, turn.id, "completed");
          if (historyResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "lead.history",
              messageId: turn.messageId,
              result: historyResult,
            });
          }
          if (detailsResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "lead.details",
              messageId: turn.messageId,
              result: detailsResult,
            });
          }
          if (searchResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "leads.results",
              messageId: turn.messageId,
              result: searchResult,
            });
          }
          if (customerResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "customers.result",
              messageId: turn.messageId,
              result: customerResult,
            });
          }
          if (calendarProposal) { await validateTurnEvidence(identity,turn.id);send({ type:"calendar.proposal",messageId:turn.messageId,result:calendarProposal }); }
          if (calendarResult) { await validateTurnEvidence(identity, turn.id); send({ type: "calendar.result", messageId: turn.messageId, result: calendarResult }); }
          if (workOrderResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "work_orders.result",
              messageId: turn.messageId,
              result: workOrderResult,
            });
          }
          if (proposedAction)
            send({
              type: "action.proposed",
              messageId: turn.messageId,
              action: proposedAction,
            });
          if (estimateResult) {
            await validateTurnEvidence(identity, turn.id);
            send({
              type: "estimates.result",
              messageId: turn.messageId,
              result: estimateResult,
            });
          }
          if (estimateDraft) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.draft", messageId: turn.messageId, result: estimateDraft });
          }
          if (estimateSharing) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.sharing", messageId: turn.messageId, result: estimateSharing });
          }
          if (estimateDraftAction) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.draft_action", messageId: turn.messageId, result: estimateDraftAction });
          }
          if (estimateVoid) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.void", messageId: turn.messageId, result: estimateVoid });
          }
          if (estimateArchive) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.archive", messageId: turn.messageId, result: estimateArchive });
          }
          if (estimateDraftDelete) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.draft_delete", messageId: turn.messageId, result: estimateDraftDelete });
          }
          if (estimateConversion) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.convert", messageId: turn.messageId, result: estimateConversion });
          }
          if (estimateDecision) {
            await validateTurnEvidence(identity, turn.id);
            send({ type: "estimates.decision", messageId: turn.messageId, result: estimateDecision });
          }
          send({ type: "turn.completed", messageId: turn.messageId });
        } catch (error) {
          const reason = abort.signal.reason;
          abort.abort("failed");
          const cancelled =
            error instanceof ChatCancelledError ||
            ["disconnect", "cancelled"].includes(reason);
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
          clearTimeout(timeout);
          clearInterval(cancellation);
          clearInterval(heartbeat);
          request.signal.removeEventListener("abort", disconnected);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
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
    return chatError(error);
  }
}

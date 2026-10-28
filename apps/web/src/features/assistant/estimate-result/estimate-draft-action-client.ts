import {
  estimateDraftActionChatBindingSchema, estimateDraftActionChatDecisionSchema, estimateDraftActionChatResponseSchema,
  estimateDraftActionChatTicketSchema, type EstimateDraftActionChatTicket,
} from "@salesmora/contracts";
import { estimateDraftActionResultData } from "./estimate-draft-action-result.data";

export function estimateDraftActionBinding(ticket: EstimateDraftActionChatTicket) {
  return estimateDraftActionChatBindingSchema.parse({
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
    estimateId: ticket.source.id, expectedVersion: ticket.source.version,
  });
}
export async function estimateDraftActionRequest(
  workspaceId: string, ticket: EstimateDraftActionChatTicket, method: "GET" | "POST",
  decision?: "confirm" | "cancel" | "open", signal?: AbortSignal,
) {
  const binding = estimateDraftActionBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  const response = await fetch(`/api/chat/estimates/draft-actions?${query}`, {
    method, signal, cache: "no-store",
    ...(method === "GET" ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estimateDraftActionChatDecisionSchema.parse({ workspaceId, request: binding, decision })),
    }),
  });
  const raw: unknown = await response.json();
  if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string"
    ? raw.error : estimateDraftActionResultData.error);
  const result = estimateDraftActionChatResponseSchema.parse(raw), next = result.view.ticket;
  const expected = estimateDraftActionChatTicketSchema.parse({ ...ticket, state: next.state });
  if (JSON.stringify(expected) !== JSON.stringify(next) ||
      (method === "POST" && decision === "confirm" && next.state !== "confirmed") ||
      (method === "POST" && decision === "cancel" && next.state !== "cancelled") ||
      (decision === "open" && (next.state !== "confirmed" || !result.view.receipt ||
        result.href !== `/estimates/${result.view.receipt.id}?workspace=${workspaceId}`)) ||
      (decision !== "open" && result.href !== undefined)) {
    throw new Error(estimateDraftActionResultData.error);
  }
  return result;
}

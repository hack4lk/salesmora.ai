import {
  estimateDraftActionChatBindingSchema, estimateDraftActionChatDecisionSchema, estimateDraftActionChatResponseSchema,
  estimateDraftActionChatTicketSchema, type EstimateDraftActionChatTicket,
} from "@salesmora/contracts";
import { estimateDraftActionResultData } from "./estimate-draft-action-result.data";
import { apiRequest } from "../../api/api-request";

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
  request: typeof apiRequest = apiRequest,
) {
  const binding = estimateDraftActionBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  return request(`/api/chat/estimates/draft-actions?${query}`, {
    method, signal, failureMessage: estimateDraftActionResultData.error,
    body: method === "GET" ? undefined : estimateDraftActionChatDecisionSchema.parse({ workspaceId, request: binding, decision }),
    parse: raw => {
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
    },
  });
}

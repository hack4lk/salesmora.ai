import {
  estimateVoidChatBindingSchema, estimateVoidChatDecisionSchema, estimateVoidChatResponseSchema,
  estimateVoidChatTicketSchema, type EstimateVoidChatTicket,
} from "@salesmora/contracts";
import { estimateVoidResultData as c } from "./estimate-void-result.data";
import { apiRequest } from "../../api/api-request";

export function estimateVoidBinding(ticket: EstimateVoidChatTicket) {
  return estimateVoidChatBindingSchema.parse({
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash, snapshotHash: ticket.snapshotHash,
    estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
  });
}
export async function estimateVoidRequest(
  workspaceId: string, ticket: EstimateVoidChatTicket, method: "GET" | "POST",
  decision?: "confirm" | "cancel" | "open", signal?: AbortSignal,
  request: typeof apiRequest = apiRequest,
) {
  estimateVoidChatDecisionSchema.shape.workspaceId.parse(workspaceId);
  const binding = estimateVoidBinding(ticket), query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  return request(`/api/chat/estimates/voids?${query}`, {
    method, signal, failureMessage: c.error,
    body: method === "GET" ? undefined : estimateVoidChatDecisionSchema.parse({ workspaceId, request: binding, decision }),
    parse: raw => {
      const result = estimateVoidChatResponseSchema.parse(raw), next = result.view.ticket;
      const expected = estimateVoidChatTicketSchema.parse({ ...ticket, state: next.state });
      if (JSON.stringify(expected) !== JSON.stringify(next) ||
      (method === "POST" && decision === "confirm" && next.state !== "confirmed") ||
      (method === "POST" && decision === "cancel" && next.state !== "cancelled") ||
      (decision === "open" && (next.state !== "confirmed" || !result.view.receipt ||
        result.href !== `/estimates/${result.view.receipt.estimateId}?workspace=${workspaceId}`)) ||
      (decision !== "open" && result.href !== undefined)) {
        throw new Error(c.error);
      }
      return result;
    },
  });
}

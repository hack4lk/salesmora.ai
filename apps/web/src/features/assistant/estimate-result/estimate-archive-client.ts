import {
  estimateArchiveChatBindingSchema,
  estimateArchiveChatDecisionSchema,
  estimateArchiveChatResponseSchema,
  estimateArchiveChatTicketSchema,
  type EstimateArchiveChatTicket,
} from "@salesmora/contracts";
import { estimateArchiveResultData as c } from "./estimate-archive-result.data";
import { apiRequest } from "../../api/api-request";

export function estimateArchiveBinding(ticket: EstimateArchiveChatTicket) {
  return estimateArchiveChatBindingSchema.parse({
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
    estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
  });
}
export async function estimateArchiveRequest(
  workspaceId: string, ticket: EstimateArchiveChatTicket, method: "GET" | "POST",
  decision?: "confirm" | "cancel" | "open", signal?: AbortSignal,
  request: typeof apiRequest = apiRequest,
) {
  estimateArchiveChatDecisionSchema.shape.workspaceId.parse(workspaceId);
  const binding = estimateArchiveBinding(ticket), query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  return request(`/api/chat/estimates/archives?${query}`, {
    method, signal, failureMessage: c.error,
    body: method === "GET" ? undefined : estimateArchiveChatDecisionSchema.parse({ workspaceId, request: binding, decision }),
    parse: raw => {
      const result = estimateArchiveChatResponseSchema.parse(raw), next = result.view.ticket;
      const expected = estimateArchiveChatTicketSchema.parse({ ...ticket, state: next.state });
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

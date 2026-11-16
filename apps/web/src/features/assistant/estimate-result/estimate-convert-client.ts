import {
  estimateConversionChatBindingSchema,
  estimateConversionChatDecisionSchema,
  estimateConversionChatResponseSchema,
  estimateConversionChatTicketSchema,
  type EstimateConversionChatTicket,
} from "@salesmora/contracts";
import { estimateConvertResultData as copy } from "./estimate-convert-result.data";
import { apiRequest } from "../../api/api-request";

export function estimateConversionChatBinding(ticket: EstimateConversionChatTicket) {
  return estimateConversionChatBindingSchema.parse({
    proposalId: ticket.id,
    actionType: ticket.actionType,
    inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion,
    estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version,
    snapshotHash: ticket.estimate.snapshotHash,
    sourceLeadId: ticket.estimate.parentId,
  });
}

export async function estimateConversionChatRequest(
  workspaceId: string,
  ticket: EstimateConversionChatTicket,
  method: "GET" | "POST",
  decision?: "review" | "cancel",
  signal?: AbortSignal,
  transport: typeof apiRequest = apiRequest,
) {
  estimateConversionChatDecisionSchema.shape.workspaceId.parse(workspaceId);
  const binding = estimateConversionChatBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") {
    for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  }
  const request = method === "POST"
    ? estimateConversionChatDecisionSchema.parse({ workspaceId, request: binding, decision })
    : undefined;
  return transport(`/api/chat/estimates/conversions?${query}`, {
    method, signal, body: request, failureMessage: copy.error,
    parse: raw => {
      const result = estimateConversionChatResponseSchema.parse(raw);
      const next = result.view.ticket;
      const expected = estimateConversionChatTicketSchema.parse({
        ...ticket,
        state: method === "POST" && decision === "cancel" ? "cancelled" : ticket.state,
      });
      if (JSON.stringify(expected) !== JSON.stringify(next) ||
      (method === "POST" && decision === "cancel" && next.state !== "cancelled") ||
      (method === "POST" && decision === "review" && next.state !== "pending")) {
        throw new Error(copy.error);
      }
      return result;
    },
  });
}

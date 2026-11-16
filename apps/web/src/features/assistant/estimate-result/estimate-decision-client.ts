import {
  estimateDecisionChatResponseSchema, estimateDecisionChatTicketSchema, type EstimateDecisionChatTicket,
} from "@salesmora/contracts";
import { apiRequest } from "../../api/api-request";

export const estimateDecisionResultData = {
  title: "Customer decision review",
  loading: "Loading the current decision review...",
  unavailable: "This decision proposal is unavailable. Access, the estimate or the saved decision may have changed. Request a fresh review.",
  error: "The decision operation could not be confirmed. Review its current status before retrying.",
  historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
  expired: "Proposal expired. Request a fresh decision review.",
  cancelled: "Proposal cancelled. No customer decision was recorded or corrected by this proposal.",
  superseded: "Replaced by a newer proposal. Review the latest proposal.",
  accepted: "Customer decision recorded: Accepted.",
  declined: "Customer decision recorded: Declined.",
  corrected: "Customer decision correction recorded. The previous entry remains in history.",
  boundary: "The customer was not notified. No signature, payment, Job creation or Lead-stage change occurred.",
  retry: "Reload decision review",
  open: "Open saved estimate",
} as const;
export function estimateDecisionBinding(ticket: EstimateDecisionChatTicket) {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version, snapshotHash: ticket.snapshotHash,
  };
}
export async function estimateDecisionRequest(
  workspaceId: string, ticket: EstimateDecisionChatTicket, method: "GET" | "POST",
  decision?: "confirm" | "cancel" | "open", signal?: AbortSignal,
  request: typeof apiRequest = apiRequest,
) {
  const binding = estimateDecisionBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  return request(`/api/chat/estimates/decisions?${query}`, {
    method, signal, failureMessage: estimateDecisionResultData.error,
    body: method === "GET" ? undefined : { workspaceId, request: binding, decision },
    parse: raw => {
      const result = estimateDecisionChatResponseSchema.parse(raw), next = result.view.ticket;
      const expected = estimateDecisionChatTicketSchema.parse({ ...ticket, state: next.state });
      if (JSON.stringify(expected) !== JSON.stringify(next) ||
      (method === "POST" && decision === "confirm" && next.state !== "confirmed") ||
      (method === "POST" && decision === "cancel" && next.state !== "cancelled") ||
      (decision === "open" && (next.state !== "confirmed" || result.href !== `/estimates/${ticket.estimate.id}?workspace=${workspaceId}`)) ||
      (decision !== "open" && result.href !== undefined)) {
        throw new Error(estimateDecisionResultData.error);
      }
      return result;
    },
  });
}

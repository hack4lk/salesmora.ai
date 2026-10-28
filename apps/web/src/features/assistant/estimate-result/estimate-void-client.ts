import {
  estimateVoidChatBindingSchema, estimateVoidChatDecisionSchema, estimateVoidChatResponseSchema,
  estimateVoidChatTicketSchema, type EstimateVoidChatTicket,
} from "@salesmora/contracts";
import { estimateVoidResultData as c } from "./estimate-void-result.data";

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
) {
  estimateVoidChatDecisionSchema.shape.workspaceId.parse(workspaceId);
  const binding = estimateVoidBinding(ticket), query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  const response = await fetch(`/api/chat/estimates/voids?${query}`, {
    method, signal, cache: "no-store",
    ...(method === "GET" ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estimateVoidChatDecisionSchema.parse({ workspaceId, request: binding, decision })),
    }),
  });
  const raw: unknown = await response.json();
  if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string"
    ? raw.error : c.error);
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
}

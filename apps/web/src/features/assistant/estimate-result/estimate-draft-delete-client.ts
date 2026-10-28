import {
  estimateDraftDeleteChatBindingSchema,
  estimateDraftDeleteChatDecisionSchema,
  estimateDraftDeleteChatResponseSchema,
  estimateDraftDeleteChatTicketSchema,
  type EstimateDraftDeleteChatTicket,
} from "@salesmora/contracts";
import { estimateDraftDeleteResultData as r } from "./estimate-draft-delete-result.data";

export function estimateDraftDeleteBinding(ticket: EstimateDraftDeleteChatTicket) {
  return estimateDraftDeleteChatBindingSchema.parse({
    proposalId: ticket.id,
    actionType: ticket.actionType,
    inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion,
    reviewHash: ticket.reviewHash,
    estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version,
  });
}

export async function estimateDraftDeleteRequest(
  workspaceId: string,
  ticket: EstimateDraftDeleteChatTicket,
  method: "GET" | "POST",
  decision?: "confirm" | "cancel",
  typedConfirmation?: string,
  signal?: AbortSignal,
) {
  estimateDraftDeleteChatDecisionSchema.shape.workspaceId.parse(workspaceId);
  const binding = estimateDraftDeleteBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") {
    for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  }
  const request = method === "POST"
    ? estimateDraftDeleteChatDecisionSchema.parse({
      workspaceId,
      request: binding,
      decision,
      ...(decision === "confirm" ? { typedConfirmation } : {}),
    })
    : undefined;
  const response = await fetch(`/api/chat/estimates/draft-deletions?${query}`, {
    method,
    signal,
    cache: "no-store",
    ...(request ? {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    } : {}),
  });
  const raw: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string"
        ? raw.error
        : r.error,
    );
  }
  const result = estimateDraftDeleteChatResponseSchema.parse(raw);
  const next = result.view.ticket;
  const expected = estimateDraftDeleteChatTicketSchema.parse({ ...ticket, state: next.state });
  if (JSON.stringify(expected) !== JSON.stringify(next) ||
      (method === "POST" && decision === "confirm" && next.state !== "confirmed") ||
      (method === "POST" && decision === "cancel" && next.state !== "cancelled")) {
    throw new Error(r.error);
  }
  return result;
}

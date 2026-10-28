import { estimateShareChatResponseSchema, type EstimateShareChatTicket } from "@salesmora/contracts";

export const estimateSharingData = {
  title: { "estimate.send": "Send estimate", "estimate.publish": "Publish estimate", "estimate.resend": "Resend estimate" },
  review: { "estimate.send": "Review revision send", "estimate.publish": "Review publication", "estimate.resend": "Review resend" },
  loading: "Loading the current sharing review...",
  unavailable: "This sharing proposal is unavailable. Access, the saved estimate or its review may have changed. Request a fresh proposal.",
  error: "The sharing operation could not be confirmed. Review its current status before retrying.",
  historyError: "The operation completed, but chat history could not be refreshed. Reload to check the current status.",
  expired: "Proposal expired. Request a fresh sharing review.",
  cancelled: "Proposal cancelled. Nothing was shared or queued by this proposal.",
  superseded: "Replaced by a newer proposal. Review the latest proposal.",
  queued: "Email queued. This is not a delivery confirmation. Open the saved estimate for delivery status.",
  published: "Estimate published without email. Open the saved estimate to manage its customer link.",
  boundary: "Reviewing does not share anything. Only the final confirmation publishes or queues email. It does not accept the estimate, collect payment or change the lead stage.",
  refreshed: "Delivery recipient updated in a new proposal. Review it and confirm again to queue email. The frozen customer paper is unchanged.",
  cancel: "Cancel proposal",
  open: "Open saved estimate",
  retry: "Reload sharing review",
} as const;
export function estimateSharingBinding(ticket: EstimateShareChatTicket) {
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
    authorizationVersion: ticket.authorizationVersion, estimateId: ticket.estimate.id,
    expectedVersion: ticket.estimate.version, snapshotHash: ticket.snapshotHash,
  };
}
export async function estimateSharingRequest(
  workspaceId: string, ticket: EstimateShareChatTicket, method: "GET" | "POST" | "PATCH",
  extra: { decision?: "confirm" | "cancel" | "open"; paymentLinkReviewed?: boolean; recipientEmail?: string } = {},
  signal?: AbortSignal,
) {
  const binding = estimateSharingBinding(ticket);
  const query = new URLSearchParams({ workspace: workspaceId });
  if (method === "GET") for (const [key, value] of Object.entries(binding)) query.set(key, String(value));
  const response = await fetch(`/api/chat/estimates/sharing?${query}`, {
    method, signal, cache: "no-store",
    ...(method === "GET" ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, request: binding, ...extra }),
    }),
  });
  const raw: unknown = await response.json();
  if (!response.ok) throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string" ? raw.error : estimateSharingData.error);
  const result = estimateShareChatResponseSchema.parse(raw);
  const next = result.view.ticket;
  const expected = method === "PATCH"
    ? next.id !== ticket.id && next.actionType === ticket.actionType && next.authorizationVersion === ticket.authorizationVersion &&
      next.estimate.id === ticket.estimate.id && next.estimate.version === ticket.estimate.version &&
      next.snapshotHash === ticket.snapshotHash && result.view.review.recipientEmail === extra.recipientEmail && next.state === "pending"
    : JSON.stringify(estimateSharingBinding(next)) === JSON.stringify(binding);
  if (!expected || (method === "POST" && extra.decision === "confirm" && next.state !== "confirmed") ||
      (method === "POST" && extra.decision === "cancel" && next.state !== "cancelled") ||
      (extra.decision === "open" && (!result.href || result.href !== `/estimates/${ticket.estimate.id}?workspace=${workspaceId}`))) {
    throw new Error(estimateSharingData.error);
  }
  return result;
}

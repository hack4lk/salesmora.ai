import { estimateDraftChatResponseSchema, type EstimateDraftChatView } from "@salesmora/contracts";
import type { EstimateDraftRequest } from "@salesmora/ui";

export const estimateDraftConnectedData = {
  error: "This proposal could not be checked. Nothing is marked as saved. Refresh the conversation and try again.",
  refreshFailed: "The proposal action completed, but assistant history could not refresh. Reload to check the latest history.",
  editorTitle: "Review unsaved Estimate proposal",
  editorNotice: "These are unsaved proposal contents. Editing here changes no Estimate. Review a refreshed proposal before confirming in the assistant.",
  refresh: "Review refreshed proposal",
  refreshed: "Proposal refreshed. Review the card below and confirm explicitly to save.",
  name: "Estimate name",
  saved: "Open saved Draft",
} as const;

export function estimateDraftBinding(view: EstimateDraftChatView): EstimateDraftRequest {
  const draft = view.draft;
  return {
    proposalId: draft.id, inputHash: draft.inputHash, authorizationVersion: draft.authorizationVersion,
    actionType: draft.actionType, parentType: draft.parent.type, parentId: draft.parent.id, parentVersion: draft.parent.version,
    estimateId: draft.actionType === "estimate.update" ? draft.estimate.id : null,
    expectedVersion: draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null,
  };
}

export async function estimateDraftRequest(method: "POST" | "PATCH", body: object, signal?: AbortSignal) {
  const response = await fetch("/api/chat/estimates/draft", {
    method, signal, cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const raw: unknown = await response.json();
  if (!response.ok) {
    throw new Error(raw && typeof raw === "object" && "error" in raw && typeof raw.error === "string"
      ? raw.error : estimateDraftConnectedData.error);
  }
  return estimateDraftChatResponseSchema.parse(raw);
}

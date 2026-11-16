import { estimateDraftChatDecisionSchema, estimateDraftChatRefreshSchema, estimateDraftChatResponseSchema, type EstimateDraftChatView } from "@salesmora/contracts";
import type { EstimateDraftRequest } from "@salesmora/ui";
import { apiRequest } from "../../api/api-request";

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

export async function estimateDraftRequest(method: "POST" | "PATCH", body: object, signal?: AbortSignal, request: typeof apiRequest = apiRequest) {
  const command = method === "POST" ? estimateDraftChatDecisionSchema.parse(body) : estimateDraftChatRefreshSchema.parse(body);
  const binding = "request" in command ? command.request : command;
  return request("/api/chat/estimates/draft", {
    method, signal, body: command, failureMessage: estimateDraftConnectedData.error,
    parse: raw => {
      const result = estimateDraftChatResponseSchema.parse(raw), next = estimateDraftBinding(result.view);
      const target = ({ actionType, parentType, parentId, parentVersion, estimateId, expectedVersion }: EstimateDraftRequest) =>
        ({ actionType, parentType, parentId, parentVersion, estimateId, expectedVersion });
      if (JSON.stringify(target(next)) !== JSON.stringify(target(binding)) ||
        (method === "POST" && JSON.stringify(next) !== JSON.stringify(estimateDraftBindingFromRequest(binding))) ||
        (method === "PATCH" && (next.proposalId === binding.proposalId || result.view.draft.state !== "pending"))) throw new Error(estimateDraftConnectedData.error);
      if ("decision" in command) {
        const state = result.view.draft.state;
        const href = command.decision === "open" && result.view.receipt
          ? `/estimates/${result.view.receipt.id}?workspace=${command.workspaceId}`
          : command.decision === "editor" ? `/estimates/${next.estimateId ?? "new"}?workspace=${command.workspaceId}&proposal=${next.proposalId}` : undefined;
        if ((command.decision === "confirm" || command.decision === "open") && state !== "confirmed" ||
          command.decision === "cancel" && state !== "cancelled" ||
          result.href !== href) throw new Error(estimateDraftConnectedData.error);
      } else if (result.href !== undefined) throw new Error(estimateDraftConnectedData.error);
      return result;
    },
  });
}

function estimateDraftBindingFromRequest(request: EstimateDraftRequest): EstimateDraftRequest {
  const { proposalId, inputHash, authorizationVersion, actionType, parentType, parentId, parentVersion, estimateId, expectedVersion } = request;
  return { proposalId, inputHash, authorizationVersion, actionType, parentType, parentId, parentVersion, estimateId, expectedVersion };
}

import { estimateArchiveChatDecisionSchema, estimateArchiveChatViewSchema } from "@salesmora/contracts";
import { reviewAssistantProposalWindow } from "@salesmora/ui";
import { estimateArchiveCardData as c } from "./estimate-archive-card.data";
import type { EstimateArchiveCardCommand, EstimateArchiveCardProps } from "./estimate-archive-card.types";

export function estimateArchiveCardRequest(
  view: EstimateArchiveCardProps["view"], workspaceId: string, decision: EstimateArchiveCardCommand["decision"],
): EstimateArchiveCardCommand {
  const { ticket } = view;
  return estimateArchiveChatDecisionSchema.parse({
    workspaceId, decision, request: {
      proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
      estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
    },
  });
}
/** Presentation validation only; the server independently checks authority, hashes and current eligibility. */
export function reviewEstimateArchiveCard({ view, context, grants, disabled }: EstimateArchiveCardProps, now: number) {
  if (disabled || !grants.read || !grants.parentAccess || !grants.archive) {
    return { visible: false as const, issue: c.unavailable };
  }
  const parsed = estimateArchiveChatViewSchema.safeParse(view);
  const expected = context && estimateArchiveChatViewSchema.safeParse(context.view);
  if (!parsed.success || !expected?.success || JSON.stringify(parsed.data) !== JSON.stringify(expected.data) ||
      !estimateArchiveChatDecisionSchema.shape.workspaceId.safeParse(context?.workspaceId).success) {
    return { visible: false as const, issue: c.changed };
  }
  const checked = parsed.data;
  const window = reviewAssistantProposalWindow(checked.ticket.createdAt, checked.ticket.expiresAt, now);
  if (!window.valid || !checked.ticket.estimate.name.trim() ||
      !checked.review.parent.name.trim() || !checked.review.parent.number.trim()) {
    return { visible: false as const, issue: c.invalid };
  }
  const state = checked.ticket.state === "pending" && window.expired ? "expired" : checked.ticket.state;
  return {
    visible: true as const, view: checked, state, ...window,
    operation: checked.ticket.actionType === "estimate.archive" ? "archive" as const : "restore" as const,
    canConfirm: state === "pending", canCancel: state === "pending", canOpen: state === "confirmed",
  };
}

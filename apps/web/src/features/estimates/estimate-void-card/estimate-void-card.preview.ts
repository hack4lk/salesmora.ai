import { estimateVoidChatDecisionSchema, estimateVoidChatViewSchema } from "@salesmora/contracts";
import { reviewAssistantProposalWindow } from "@salesmora/ui";
import { estimateVoidCardData as c } from "./estimate-void-card.data";
import type { EstimateVoidCardCommand, EstimateVoidCardProps } from "./estimate-void-card.types";

export function estimateVoidCardRequest(
  view: EstimateVoidCardProps["view"], workspaceId: string, decision: EstimateVoidCardCommand["decision"],
): EstimateVoidCardCommand {
  const { ticket } = view;
  return estimateVoidChatDecisionSchema.parse({
    workspaceId, decision, request: {
      proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash, snapshotHash: ticket.snapshotHash,
      estimateId: ticket.estimate.id, expectedVersion: ticket.estimate.version,
    },
  });
}
/** Presentation validation only; the server independently checks authority, hashes and current eligibility. */
export function reviewEstimateVoidCard({ view, context, grants, disabled }: EstimateVoidCardProps, now: number) {
  if (disabled || !grants.read || !grants.parentAccess || !grants.void) {
    return { visible: false as const, issue: c.unavailable };
  }
  const parsed = estimateVoidChatViewSchema.safeParse(view);
  const expected = context && estimateVoidChatViewSchema.safeParse(context.view);
  if (!parsed.success || !expected?.success || JSON.stringify(parsed.data) !== JSON.stringify(expected.data) ||
      !estimateVoidChatDecisionSchema.shape.workspaceId.safeParse(context?.workspaceId).success) {
    return { visible: false as const, issue: c.changed };
  }
  const checked = parsed.data;
  const window = reviewAssistantProposalWindow(checked.ticket.createdAt, checked.ticket.expiresAt, now);
  if (!window.valid || !checked.ticket.estimate.name.trim() || !checked.review.recipientName.trim() ||
      !checked.review.parent.name.trim() || !checked.review.parent.number.trim()) {
    return { visible: false as const, issue: c.invalid };
  }
  const state = checked.ticket.state === "pending" && window.expired ? "expired" : checked.ticket.state;
  return {
    visible: true as const, view: checked, state, ...window,
    canConfirm: state === "pending" && checked.canConfirm,
    canCancel: state === "pending", canOpen: state === "confirmed",
  };
}

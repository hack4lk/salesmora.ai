import {
  estimateDraftDeleteChatDecisionSchema,
  estimateDraftDeleteChatViewSchema,
} from "@salesmora/contracts";
import { reviewAssistantProposalWindow } from "@salesmora/ui";
import { estimateDraftDeleteCardData as c } from "./estimate-draft-delete-card.data";
import type {
  EstimateDraftDeleteCardCommand,
  EstimateDraftDeleteCardProps,
} from "./estimate-draft-delete-card.types";

export function estimateDraftDeleteCardRequest(
  view: EstimateDraftDeleteCardProps["view"],
  workspaceId: string,
  decision: EstimateDraftDeleteCardCommand["decision"],
  typedConfirmation?: string,
): EstimateDraftDeleteCardCommand {
  const { ticket } = view;
  if (decision === "confirm" && typedConfirmation !== ticket.estimate.number) {
    throw new Error("Type the exact Estimate number before requesting deletion.");
  }
  return estimateDraftDeleteChatDecisionSchema.parse({
    workspaceId,
    decision,
    request: {
      proposalId: ticket.id,
      actionType: ticket.actionType,
      inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion,
      reviewHash: ticket.reviewHash,
      estimateId: ticket.estimate.id,
      expectedVersion: ticket.estimate.version,
    },
    ...(decision === "confirm" ? { typedConfirmation } : {}),
  });
}

/** Presentation validation only; the server independently checks authority and eligibility. */
export function reviewEstimateDraftDeleteCard(
  { view, context, grants, disabled }: EstimateDraftDeleteCardProps,
  now: number,
) {
  if (disabled || !grants.read || !grants.parentAccess || !grants.delete) {
    return { visible: false as const, issue: c.unavailable };
  }
  const parsed = estimateDraftDeleteChatViewSchema.safeParse(view);
  const expected = context && estimateDraftDeleteChatViewSchema.safeParse(context.view);
  if (!parsed.success || !expected?.success ||
      JSON.stringify(parsed.data) !== JSON.stringify(expected.data) ||
      !estimateDraftDeleteChatDecisionSchema.shape.workspaceId.safeParse(context?.workspaceId).success) {
    return { visible: false as const, issue: c.changed };
  }
  const checked = parsed.data;
  const window = reviewAssistantProposalWindow(checked.ticket.createdAt, checked.ticket.expiresAt, now);
  if (!window.valid || !checked.review.name.trim() ||
      !checked.review.parent.name.trim() || !checked.review.parent.number.trim()) {
    return { visible: false as const, issue: c.invalid };
  }
  const state = checked.ticket.state === "pending" && window.expired ? "expired" : checked.ticket.state;
  return {
    visible: true as const,
    view: checked,
    state,
    ...window,
    canConfirm: state === "pending",
    canCancel: state === "pending",
  };
}

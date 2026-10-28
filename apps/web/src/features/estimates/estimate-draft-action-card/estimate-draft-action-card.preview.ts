import { estimateDraftActionChatDecisionSchema, estimateDraftActionChatViewSchema } from "@salesmora/contracts";
import { reviewAssistantProposalWindow, reviewEstimateDraftContent, type EstimateDraftContent } from "@salesmora/ui";
import { estimateDraftActionCardData as c } from "./estimate-draft-action-card.data";
import type { EstimateDraftActionCardCommand, EstimateDraftActionCardProps } from "./estimate-draft-action-card.types";

export function estimateDraftActionCardRequest(
  view: EstimateDraftActionCardProps["view"], workspaceId: string, decision: EstimateDraftActionCardCommand["decision"],
): EstimateDraftActionCardCommand {
  const { ticket } = view;
  return estimateDraftActionChatDecisionSchema.parse({
    workspaceId, decision, request: {
      proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash,
      authorizationVersion: ticket.authorizationVersion, reviewHash: ticket.reviewHash,
      estimateId: ticket.source.id, expectedVersion: ticket.source.version,
    },
  });
}
export function estimateDraftActionContent(view: EstimateDraftActionCardProps["view"]): EstimateDraftContent {
  const { values } = view.review;
  return {
    name: values.details.name, scope: values.scope, message: values.terms.message,
    paymentTerms: values.terms.paymentTerms, termsNote: values.terms.termsNote, validUntil: values.terms.validUntil,
    discount: values.totals.discount, taxRate: values.totals.taxRate, deposit: values.terms.deposit,
    items: values.items.map((item, index) => ({
      ...item, id: `saved-${index + 1}`, unit: item.catalog?.unit ?? item.unit ?? "", priceSource: { type: "saved" },
    })),
  };
}
/** Presentation validation only. The server independently rehashes, authorizes and executes stored values. */
export function reviewEstimateDraftActionCard(props: EstimateDraftActionCardProps, now: number) {
  const { view, context, grants, disabled } = props;
  const parsed = estimateDraftActionChatViewSchema.safeParse(view);
  const expected = context && estimateDraftActionChatViewSchema.safeParse(context.view);
  if (disabled || !grants.read || !grants.parentAccess || !grants.create ||
      (parsed.success && parsed.data.ticket.actionType === "estimate.revise" && !grants.update)) {
    return { visible: false as const, issue: c.unavailable };
  }
  if (!parsed.success || !expected?.success || JSON.stringify(parsed.data) !== JSON.stringify(expected.data) ||
      !estimateDraftActionChatDecisionSchema.shape.workspaceId.safeParse(context?.workspaceId).success) {
    return { visible: false as const, issue: c.changed };
  }
  const checked = parsed.data;
  const window = reviewAssistantProposalWindow(checked.ticket.createdAt, checked.ticket.expiresAt, now);
  const content = estimateDraftActionContent(checked);
  const contentReview = reviewEstimateDraftContent(content, content);
  if (!window.valid || contentReview.issues.length || checked.review.totalCents !== contentReview.calculation.totalCents) {
    return { visible: false as const, issue: c.invalid };
  }
  const kind: "duplicate" | "reuse" | "revise" = checked.ticket.actionType === "estimate.duplicate"
    ? "duplicate" : checked.ticket.plan.kind === "reuse" ? "reuse" : "revise";
  const state = checked.ticket.state === "pending" && window.expired ? "expired" : checked.ticket.state;
  return {
    visible: true as const, view: checked, kind, state, ...window, content, contentReview,
    canConfirm: state === "pending", canCancel: state === "pending", canOpen: state === "confirmed",
  };
}

import type { EstimateActionContext } from "../estimate-actions";

export type EstimateEmailState = "queued" | "sent" | "failed" | "bounced";
export type EstimateDeliveryEmail =
  | { state: "not-sent" }
  | {
    state: EstimateEmailState;
    recipientEmail: string;
    updatedAt: string;
    /** Safe staff-facing explanation, not raw transport responses. */
    failureMessage?: string;
    attemptCount?: number;
    nextAttemptAt?: string | null;
  };
export type EstimateShareLinkState = "not-created" | "active" | "expired" | "revoked" | "replaced" | "unavailable";
export type EstimateDeliveryLink = {
  state: EstimateShareLinkState;
  expiresAt: string | null;
  firstViewedAt: string | null;
};
/** Authorized staff presentation only; never pass share tokens or customer URLs into this card. */
export type EstimateDeliverySummary = {
  email: EstimateDeliveryEmail;
  link: EstimateDeliveryLink;
};
export type EstimateDeliveryAction = "copy-link" | "review-resend";

/** Presentation rules only. Confirmation must recheck permissions, status and token validity. */
export function getEstimateDeliveryActions({
  status, archived = false, capabilities, delivery,
}: EstimateActionContext & { delivery: EstimateDeliverySummary }): EstimateDeliveryAction[] {
  if (!capabilities.read || archived || delivery.link.state !== "active"
    || !["sent", "published", "accepted", "declined"].includes(status)) return [];
  const actions: EstimateDeliveryAction[] = ["copy-link"];
  if (status === "sent" && capabilities.send && delivery.email.state !== "not-sent" && delivery.email.state !== "queued") {
    actions.push("review-resend");
  }
  return actions;
}

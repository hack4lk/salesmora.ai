import { leadSchema, type EstimateRevisionSharing } from "@salesmora/contracts";
import { getEstimateStatusActions } from "../estimate-actions";
import { getEstimateDeliveryActions, type EstimateDeliverySummary } from "../estimate-delivery-card/estimate-delivery-card.preview";
import type { EstimateCapabilities } from "../estimate-preview.types";
import {
  getEstimateSharingIssues, isEstimateSharingPreviewCurrent,
  type EstimateSharingRecord, type EstimateSharingPreviewMetadata, type EstimateSharingReadiness,
} from "../estimate-sharing-review";
import { estimateSendDialogData as c } from "./estimate-send-dialog.data";

export type EstimateSendMode = "send" | "resend";
export type EstimateSendRecord = EstimateSharingRecord & {
  recipientEmail: string;
};
export type EstimateSendPreviewMetadata = EstimateSharingPreviewMetadata;
export type EstimateSendReadiness = EstimateSharingReadiness;
export { isEstimateSharingPreviewCurrent as isEstimateSendPreviewCurrent } from "../estimate-sharing-review";
export type EstimateSendRequest = {
  mode: EstimateSendMode;
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
  recipientEmail: string;
  subject: string;
  revisionReview?: EstimateRevisionSharing;
};
export type EstimateSendReviewInput = {
  mode: EstimateSendMode;
  estimate: EstimateSendRecord;
  capabilities: EstimateCapabilities;
  /** Workspace-local date supplied by the host, not the browser clock. */
  today: string;
  subject: string;
  readiness: EstimateSendReadiness;
  preview: EstimateSendPreviewMetadata | null;
  delivery?: EstimateDeliverySummary | null;
  /** Only used for the separately controlled resend destination. */
  resendEmail?: string;
};

/** UI readiness only. The server must reauthorize and verify version, snapshot and idempotency on confirmation. */
export function reviewEstimateSend(input: EstimateSendReviewInput): {
  issues: string[]; emailError?: string; request: EstimateSendRequest | null;
} {
  const { mode, estimate, capabilities, today, subject, readiness, preview, delivery, resendEmail } = input;
  if (!capabilities.read) return { issues: [c.errors.read], request: null };
  const issues: string[] = [];
  if (!capabilities.send) issues.push(c.errors.permission);
  if (estimate.archived) issues.push(c.errors.archived);
  if (mode === "send") {
    if (capabilities.send && !getEstimateStatusActions({ status: estimate.status, capabilities }).includes("send")) issues.push(c.errors.sendStatus);
  } else if (capabilities.send && (!delivery || !getEstimateDeliveryActions({ ...estimate, capabilities, delivery }).includes("review-resend"))) {
    issues.push(c.errors.resendStatus);
  }
  issues.push(...getEstimateSharingIssues({ estimate, today, readiness, preview }, c.errors));
  const parsedEmail = leadSchema.shape.email.safeParse(mode === "resend" ? resendEmail ?? "" : estimate.recipientEmail);
  const emailError = !parsedEmail.success || !parsedEmail.data ? c.errors.recipientEmail : undefined;
  if (!subject.trim() || /[\r\n]/.test(subject)) issues.push(c.errors.subject);
  if (issues.length || emailError || !isEstimateSharingPreviewCurrent(estimate, preview) || !parsedEmail.success || !parsedEmail.data) {
    return { issues, emailError, request: null };
  }
  return { issues, request: {
    mode, estimateId: estimate.id, expectedVersion: estimate.version, snapshotHash: preview.snapshotHash,
    recipientEmail: parsedEmail.data, subject: subject.trim(),
  } };
}

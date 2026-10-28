import type { EstimateRevisionSharing } from "@salesmora/contracts";
import { getEstimateStatusActions } from "../estimate-actions";
import { getEstimateDeliveryActions, type EstimateDeliveryLink } from "../estimate-delivery-card/estimate-delivery-card.preview";
import type { EstimateCapabilities } from "../estimate-preview.types";
import { getEstimateSharingIssues, isEstimateSharingPreviewCurrent, type EstimateSharingRecord, type EstimateSharingReview } from "../estimate-sharing-review";
import { estimatePublishDialogData as c } from "./estimate-publish-dialog.data";

export type EstimatePublishRequest = {
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
  revisionReview?: EstimateRevisionSharing;
};
export type EstimatePublishReceipt = { estimateId: string; version: number; snapshotHash: string };

export function reviewEstimatePublish(
  input: EstimateSharingReview & { capabilities: EstimateCapabilities },
): { issues: string[]; request: EstimatePublishRequest | null } {
  const { estimate, capabilities, preview } = input;
  if (!capabilities.read) return { issues: [c.errors.read], request: null };
  const issues: string[] = [];
  if (!capabilities.send) issues.push(c.errors.permission);
  if (estimate.archived) issues.push(c.errors.archived);
  if (capabilities.send && !getEstimateStatusActions({ status: estimate.status, capabilities }).includes("publish")) issues.push(c.errors.status);
  issues.push(...getEstimateSharingIssues(input, c.errors));
  if (issues.length || !isEstimateSharingPreviewCurrent(estimate, preview)) return { issues, request: null };
  return { issues, request: { estimateId: estimate.id, expectedVersion: estimate.version, snapshotHash: preview.snapshotHash } };
}

/** Only a host-supplied receipt and matching current Published record can show the success view. */
export function isEstimatePublicationCurrent(estimate: EstimateSharingRecord, receipt: EstimatePublishReceipt): boolean {
  return estimate.status === "published" && Number.isSafeInteger(estimate.revision) && estimate.revision > 0
    && !!estimate.id.trim() && !!estimate.number.trim()
    && isEstimateSharingPreviewCurrent(estimate, { ...receipt, state: "ready" });
}

export function canCopyPublishedEstimate({
  estimate, capabilities, receipt, link,
}: {
  estimate: EstimateSharingRecord; capabilities: EstimateCapabilities;
  receipt: EstimatePublishReceipt; link: EstimateDeliveryLink;
}): boolean {
  return isEstimatePublicationCurrent(estimate, receipt)
    && getEstimateDeliveryActions({ ...estimate, capabilities, delivery: { email: { state: "not-sent" }, link } }).includes("copy-link");
}

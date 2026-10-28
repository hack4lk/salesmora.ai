import { estimatePaymentLinkSchema, estimateRevisionSharingSchema, type EstimateRevisionSharing, type EstimateStatus } from "@salesmora/contracts";
import { isEstimateSharingPreviewCurrent, type EstimateSharingPreviewMetadata, type EstimateSharingRecord } from "../estimate-sharing-review";
import { estimateRevisionReviewData as c } from "./estimate-revision-review.data";

export type EstimateRevisionReplacement = {
  sourceEstimateId: string;
  sourceVersion: number;
  sourceRevision: number;
  sourceStatus: EstimateStatus;
  requiresPaymentLinkReview: boolean;
};
export type EstimateRevisionReviewValue = EstimateRevisionSharing & {
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
  paymentLink: string;
};
export type EstimateRevisionReviewInput = {
  estimate: EstimateSharingRecord;
  preview: EstimateSharingPreviewMetadata | null;
  revision: EstimateRevisionReplacement;
  paymentLink: string;
  canRead: boolean;
  canSend: boolean;
  value: EstimateRevisionReviewValue | null;
};

export function estimateRevisionAcknowledgement(
  input: Pick<EstimateRevisionReviewInput, "estimate" | "preview" | "revision" | "paymentLink">,
  checked: boolean,
): EstimateRevisionReviewValue | null {
  if (!isEstimateSharingPreviewCurrent(input.estimate, input.preview)) return null;
  return {
    estimateId: input.estimate.id, expectedVersion: input.estimate.version, snapshotHash: input.preview.snapshotHash,
    sourceEstimateId: input.revision.sourceEstimateId, sourceVersion: input.revision.sourceVersion,
    paymentLink: input.paymentLink, paymentLinkReviewed: checked,
  };
}

export function isEstimateRevisionAcknowledgementCurrent(input: EstimateRevisionReviewInput): boolean {
  const expected = estimateRevisionAcknowledgement(input, true);
  const { value } = input;
  return !!expected && !!value && value.paymentLinkReviewed &&
    value.estimateId === expected.estimateId && value.expectedVersion === expected.expectedVersion &&
    value.snapshotHash === expected.snapshotHash && value.sourceEstimateId === expected.sourceEstimateId &&
    value.sourceVersion === expected.sourceVersion && value.paymentLink === expected.paymentLink;
}

export function reviewEstimateRevisionSharing(input: EstimateRevisionReviewInput): {
  issues: string[];
  confirmation: EstimateRevisionSharing | null;
} {
  if (!input.canRead) return { issues: [c.unavailable], confirmation: null };
  const { estimate, revision, preview } = input;
  const source = estimateRevisionSharingSchema.safeParse({
    sourceEstimateId: revision.sourceEstimateId, sourceVersion: revision.sourceVersion, paymentLinkReviewed: false,
  });
  if (!input.canSend || estimate.archived || estimate.status !== "draft" ||
      !isEstimateSharingPreviewCurrent(estimate, preview) || !/^[0-9a-f]{64}$/.test(preview.snapshotHash) ||
      !source.success || revision.sourceEstimateId === estimate.id ||
      !Number.isSafeInteger(revision.sourceRevision) || revision.sourceRevision < 1 ||
      !Number.isSafeInteger(estimate.revision) || revision.sourceRevision >= estimate.revision ||
      !["sent", "published", "declined", "expired"].includes(revision.sourceStatus) ||
      !estimatePaymentLinkSchema.safeParse(input.paymentLink).success ||
      (revision.requiresPaymentLinkReview && !input.paymentLink)) {
    return { issues: [c.invalid], confirmation: null };
  }
  const reviewed = isEstimateRevisionAcknowledgementCurrent(input);
  if (revision.requiresPaymentLinkReview && !reviewed) return { issues: [c.required], confirmation: null };
  return {
    issues: [],
    confirmation: { ...source.data, paymentLinkReviewed: revision.requiresPaymentLinkReview && reviewed },
  };
}

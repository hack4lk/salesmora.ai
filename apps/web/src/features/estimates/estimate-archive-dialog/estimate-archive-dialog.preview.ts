import { getEstimateRowActions } from "../estimate-actions";
import type { EstimateCapabilities, EstimateRow } from "../estimate-preview.types";
import { estimateArchiveDialogData as c } from "./estimate-archive-dialog.data";

export type EstimateArchiveMode = "archive" | "restore";
export type EstimateArchiveRecord = Pick<EstimateRow, "id" | "number" | "revision" | "version" | "name" | "status" | "archived"> & {
  recipientName: string;
};
export type EstimateArchiveReview = {
  estimateId: string;
  expectedVersion: number;
  mode: EstimateArchiveMode;
};
export type EstimateArchiveRequest = EstimateArchiveReview;
export type EstimateArchiveReviewInput = {
  estimate: EstimateArchiveRecord;
  /** Host-scoped archive grant, restricted to Owner/Admin/Office; restore uses the same permission. */
  capabilities: EstimateCapabilities;
  mode: EstimateArchiveMode;
  review: EstimateArchiveReview;
};

export function initialEstimateArchiveReview(estimate: EstimateArchiveRecord, mode: EstimateArchiveMode): EstimateArchiveReview {
  return { estimateId: estimate.id, expectedVersion: estimate.version, mode };
}

export function isEstimateArchiveReviewCurrent({ estimate, mode, review }: EstimateArchiveReviewInput): boolean {
  return review.estimateId === estimate.id && review.expectedVersion === estimate.version && review.mode === mode;
}

/** Presentation only; the host reauthorizes, checks the version and commits the flag/activity idempotently. */
export function reviewEstimateArchive(input: EstimateArchiveReviewInput): {
  issues: string[]; request: EstimateArchiveRequest | null;
} {
  const { estimate, capabilities, mode } = input;
  if (!capabilities.read) return { issues: [c.errors.read], request: null };
  const issues: string[] = [];
  if (!capabilities.archive) issues.push(c.errors.permission);
  if (mode === "archive") {
    if (estimate.archived) issues.push(c.errors.archived);
    if (!["declined", "expired", "superseded", "void"].includes(estimate.status)) issues.push(c.errors.status);
  } else if (!estimate.archived) issues.push(c.errors.notArchived);
  if (!estimate.id.trim() || !estimate.number.trim() || !estimate.name.trim() || estimate.name.length > 120
    || !estimate.recipientName.trim() || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1
    || !Number.isSafeInteger(estimate.version) || estimate.version < 1) issues.push(c.errors.record);
  if (!isEstimateArchiveReviewCurrent(input)) issues.push(c.errors.binding);
  return {
    issues,
    request: !issues.length && getEstimateRowActions({ ...estimate, capabilities }).includes(mode)
      ? { estimateId: estimate.id, expectedVersion: input.review.expectedVersion, mode } : null,
  };
}

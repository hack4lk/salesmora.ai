import type { ReactElement } from "react";
import type { EstimateRow } from "./estimate-preview.types";
import { isEstimateLocalDate } from "./estimate-timestamp";

export type EstimateSharingRecord = Pick<EstimateRow, "id" | "number" | "revision" | "name" | "status" | "archived" | "version"> & {
  recipientName: string;
  totalCents: number | null;
  validUntil: string;
};
export type EstimateSharingPreviewMetadata =
  | { state: "ready"; estimateId: string; version: number; snapshotHash: string }
  | { state: "loading" | "error" | "stale"; message?: string };
export type EstimateSharingPreview =
  | (Extract<EstimateSharingPreviewMetadata, { state: "ready" }> & { content: ReactElement })
  | Exclude<EstimateSharingPreviewMetadata, { state: "ready" }>;
export type EstimateSharingReadiness =
  | { state: "ready" }
  | { state: "blocked"; issues: readonly string[] };
export type EstimateSharingReview = {
  estimate: EstimateSharingRecord;
  today: string;
  readiness: EstimateSharingReadiness;
  preview: EstimateSharingPreviewMetadata | null;
};
type IssueCopy = Record<
  "record" | "name" | "recipientName" | "total" | "date" | "today" | "past"
  | "readiness" | "previewMissing" | "previewStale" | "previewError", string
>;

export function isEstimateSharingPreviewCurrent(
  estimate: Pick<EstimateSharingRecord, "id" | "version">, preview: EstimateSharingPreviewMetadata | null,
): preview is Extract<EstimateSharingPreviewMetadata, { state: "ready" }> {
  return preview?.state === "ready" && preview.estimateId === estimate.id
    && preview.version === estimate.version && Number.isSafeInteger(preview.version) && preview.version > 0
    && !!preview.snapshotHash.trim();
}

/** Shared presentation checks; callers gate read access before supplying any private issue text. */
export function getEstimateSharingIssues(
  { estimate, today, readiness, preview }: EstimateSharingReview, copy: IssueCopy,
): string[] {
  const issues: string[] = [];
  if (!estimate.id.trim() || !estimate.number.trim() || !Number.isSafeInteger(estimate.version) || estimate.version < 1
    || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1) issues.push(copy.record);
  if (!estimate.name.trim() || estimate.name.length > 120) issues.push(copy.name);
  if (!estimate.recipientName.trim()) issues.push(copy.recipientName);
  if (estimate.totalCents === null || !Number.isSafeInteger(estimate.totalCents) || estimate.totalCents < 0) issues.push(copy.total);
  if (!isEstimateLocalDate(estimate.validUntil)) issues.push(copy.date);
  else if (!isEstimateLocalDate(today)) issues.push(copy.today);
  else if (estimate.validUntil < today) issues.push(copy.past);
  if (readiness.state === "blocked") {
    const visibleIssues = readiness.issues.filter((issue) => issue.trim());
    issues.push(...(visibleIssues.length ? visibleIssues : [copy.readiness]));
  }
  if (!preview) issues.push(copy.previewMissing);
  else if (preview.state === "error") issues.push(preview.message || copy.previewError);
  else if (preview.state === "stale" || (preview.state === "ready" && !isEstimateSharingPreviewCurrent(estimate, preview))) issues.push(copy.previewStale);
  return issues;
}

import { getEstimateRowActions } from "../estimate-actions";
import type { EstimateCapabilities, EstimateRow } from "../estimate-preview.types";
import { estimateDeleteDraftDialogData as c } from "./estimate-delete-draft-dialog.data";

export type EstimateDeleteDraftRecord = Pick<EstimateRow, "id" | "number" | "revision" | "version" | "name" | "status" | "archived"> & {
  recipientName: string;
  /** Authoritative host summary for this revision, not inferred from Draft status or the revision number. */
  sharing: "never-shared" | "shared" | "unavailable";
};
export type EstimateDeleteDraftValues = {
  estimateId: string;
  expectedVersion: number;
  typedConfirmation: string;
};
export type EstimateDeleteDraftRequest = EstimateDeleteDraftValues;
export type EstimateDeleteDraftReviewInput = {
  estimate: EstimateDeleteDraftRecord;
  /** Host-scoped delete grant, restricted to Owner/Admin/Office. */
  capabilities: EstimateCapabilities;
  value: EstimateDeleteDraftValues;
};

export function initialEstimateDeleteDraftValues(estimate: EstimateDeleteDraftRecord): EstimateDeleteDraftValues {
  return { estimateId: estimate.id, expectedVersion: estimate.version, typedConfirmation: "" };
}

export function isEstimateDeleteDraftReviewCurrent({ estimate, value }: EstimateDeleteDraftReviewInput): boolean {
  return value.estimateId === estimate.id && value.expectedVersion === estimate.version;
}

/** Presentation only; the server rechecks grants, sharing history, version and exact confirmation before deleting. */
export function reviewEstimateDeleteDraft(input: EstimateDeleteDraftReviewInput): {
  issues: string[]; eligible: boolean; request: EstimateDeleteDraftRequest | null;
} {
  const { estimate, capabilities, value } = input;
  if (!capabilities.read) return { issues: [c.errors.read], eligible: false, request: null };
  const issues: string[] = [];
  if (!capabilities.delete) issues.push(c.errors.permission);
  if (estimate.archived) issues.push(c.errors.archived);
  if (estimate.status !== "draft") issues.push(c.errors.status);
  if (estimate.sharing === "shared") issues.push(c.errors.shared);
  else if (estimate.sharing !== "never-shared") issues.push(c.errors.sharingUnavailable);
  if (!estimate.id.trim() || !estimate.number.trim() || !estimate.name.trim() || estimate.name.length > 120
    || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1
    || !Number.isSafeInteger(estimate.version) || estimate.version < 1) issues.push(c.errors.record);
  if (!isEstimateDeleteDraftReviewCurrent(input)) issues.push(c.errors.binding);
  const eligible = !issues.length && getEstimateRowActions({ ...estimate, capabilities }).includes("delete-draft");
  return {
    issues, eligible,
    request: eligible && value.typedConfirmation === estimate.number
      ? { estimateId: estimate.id, expectedVersion: value.expectedVersion, typedConfirmation: value.typedConfirmation } : null,
  };
}

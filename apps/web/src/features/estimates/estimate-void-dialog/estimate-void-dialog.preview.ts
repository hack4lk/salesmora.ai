import { getEstimateRowActions } from "../estimate-actions";
import type { EstimateCapabilities, EstimateRow } from "../estimate-preview.types";
import { estimateVoidDialogData as c } from "./estimate-void-dialog.data";

export type EstimateVoidRecord = Pick<EstimateRow, "id" | "number" | "revision" | "name" | "status" | "archived" | "version"> & {
  recipientName: string;
};
export type EstimateVoidValues = {
  estimateId: string;
  expectedVersion: number;
  reason: string;
};
export type EstimateVoidRequest = {
  estimateId: string;
  expectedVersion: number;
  reason: string;
};
export type EstimateVoidReviewInput = {
  estimate: EstimateVoidRecord;
  /** Host-scoped capabilities; void is restricted to Owner/Admin/Office. */
  capabilities: EstimateCapabilities;
  value: EstimateVoidValues;
};

export function initialEstimateVoidValues(estimate: EstimateVoidRecord): EstimateVoidValues {
  return { estimateId: estimate.id, expectedVersion: estimate.version, reason: "" };
}

/** Presentation only; the host must reauthorize and commit the version-checked, idempotent withdrawal. */
export function reviewEstimateVoid({ estimate, capabilities, value }: EstimateVoidReviewInput): {
  issues: string[]; fieldErrors: { reason?: string }; eligible: boolean; request: EstimateVoidRequest | null;
} {
  if (!capabilities.read) return { issues: [c.errors.read], fieldErrors: {}, eligible: false, request: null };
  const issues: string[] = [], fieldErrors: { reason?: string } = {};
  const eligible = getEstimateRowActions({ ...estimate, capabilities }).includes("void");
  if (!capabilities.void) issues.push(c.errors.permission);
  if (estimate.archived) issues.push(c.errors.archived);
  if (!["sent", "published"].includes(estimate.status)) issues.push(c.errors.status);
  if (!estimate.id.trim() || !estimate.number.trim() || !estimate.name.trim() || estimate.name.length > 120
    || !estimate.recipientName.trim() || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1
    || !Number.isSafeInteger(estimate.version) || estimate.version < 1) issues.push(c.errors.record);
  if (value.estimateId !== estimate.id || value.expectedVersion !== estimate.version) issues.push(c.errors.binding);
  if (!value.reason.trim() || value.reason.length > c.limit) fieldErrors.reason = c.errors.reason;
  return {
    issues, fieldErrors, eligible,
    request: eligible && !issues.length && !fieldErrors.reason
      ? { estimateId: estimate.id, expectedVersion: value.expectedVersion, reason: value.reason.trim() } : null,
  };
}

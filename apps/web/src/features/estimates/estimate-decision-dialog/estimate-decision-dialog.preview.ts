import { getEstimateStatusActions } from "../estimate-actions";
import {
  estimateDecisionChannels, estimateDecisionOutcomes,
  type EstimateCapabilities, type EstimateDecisionChannel, type EstimateDecisionOutcome, type EstimateRow,
} from "../estimate-preview.types";
import { createEstimateTimestampFormatter, isEstimateLocalDate } from "../estimate-timestamp";
import { estimateDecisionDialogData as c } from "./estimate-decision-dialog.data";
import type { EstimateRecordedDecision } from "@salesmora/contracts";

export type { EstimateRecordedDecision } from "@salesmora/contracts";
export type EstimateDecisionRecord = Pick<EstimateRow, "id" | "number" | "revision" | "name" | "status" | "archived" | "version"> & {
  recipientName: string;
  totalCents: number | null;
  decision: EstimateRecordedDecision | null;
};
export type EstimateDecisionMode = "record" | "correct";
/** Bind controlled edits to the record/version the user actually reviewed. */
export type EstimateDecisionValues = {
  estimateId: string;
  expectedVersion: number;
  outcome: EstimateDecisionOutcome | "";
  decisionDate: string;
  channel: EstimateDecisionChannel | "";
  note: string;
  reason: string;
};
export type EstimateDecisionRequest = {
  estimateId: string; expectedVersion: number;
  outcome: EstimateDecisionOutcome; decisionDate: string; channel: EstimateDecisionChannel; note: string;
} & ({ mode: "record" } | { mode: "correct"; reason: string });
export type EstimateDecisionReviewInput = {
  estimate: EstimateDecisionRecord;
  capabilities: EstimateCapabilities;
  mode: EstimateDecisionMode;
  /** Host-derived Owner/Admin/Office grant, never inferred from update or send permission. */
  canCorrectDecision?: boolean;
  value: EstimateDecisionValues;
  today: string;
  timezone: string;
};
export type EstimateDecisionFieldErrors = Partial<Record<"outcome" | "decisionDate" | "channel" | "note" | "reason", string>>;

export function isEstimateDecisionOutcome(value: string): value is EstimateDecisionOutcome {
  return estimateDecisionOutcomes.some((outcome) => outcome === value);
}
export function isEstimateDecisionChannel(value: string): value is EstimateDecisionChannel {
  return estimateDecisionChannels.some((channel) => channel === value);
}
export function initialEstimateDecisionValues(
  estimate: EstimateDecisionRecord, today: string, outcome: EstimateDecisionOutcome = "accepted",
): EstimateDecisionValues {
  return {
    estimateId: estimate.id, expectedVersion: estimate.version,
    outcome: estimate.decision?.outcome ?? outcome, decisionDate: estimate.decision?.decisionDate ?? today,
    channel: estimate.decision?.channel ?? "", note: estimate.decision?.note ?? "", reason: "",
  };
}
export function isEstimateRecordedDecisionCurrent(estimate: EstimateDecisionRecord): boolean {
  const previous = estimate.decision;
  return !!previous && isEstimateDecisionOutcome(previous.outcome) && previous.outcome === estimate.status
    && isEstimateLocalDate(previous.decisionDate) && isEstimateDecisionChannel(previous.channel) && previous.note.length <= c.limit;
}

/** Presentation only; the host must reauthorize and commit the version-checked, idempotent decision. */
export function reviewEstimateDecision(input: EstimateDecisionReviewInput): {
  issues: string[]; fieldErrors: EstimateDecisionFieldErrors; eligible: boolean; request: EstimateDecisionRequest | null;
} {
  const { estimate, capabilities, mode, canCorrectDecision = false, value, today, timezone } = input;
  if (!capabilities.read) return { issues: [c.errors.read], fieldErrors: {}, eligible: false, request: null };
  const issues: string[] = [], fieldErrors: EstimateDecisionFieldErrors = {};
  const action = mode === "correct" ? "correct-decision" : "mark-accepted";
  const eligible = getEstimateStatusActions({ ...estimate, capabilities, canCorrectDecision }).includes(action);
  if (!capabilities.decide) issues.push(c.errors.permission);
  if (mode === "correct" && !canCorrectDecision) issues.push(c.errors.correctionPermission);
  if (estimate.archived) issues.push(c.errors.archived);
  if (mode === "record" && !["sent", "published"].includes(estimate.status)) issues.push(c.errors.status);
  if (mode === "correct" && !["accepted", "declined"].includes(estimate.status)) issues.push(c.errors.correctionStatus);
  if (!estimate.id.trim() || !estimate.number.trim() || !estimate.name.trim() || estimate.name.length > 120
    || !estimate.recipientName.trim() || !Number.isSafeInteger(estimate.revision) || estimate.revision < 1
    || !Number.isSafeInteger(estimate.version) || estimate.version < 1) issues.push(c.errors.record);
  if (estimate.totalCents === null || !Number.isSafeInteger(estimate.totalCents) || estimate.totalCents < 0) issues.push(c.errors.total);
  if (value.estimateId !== estimate.id || value.expectedVersion !== estimate.version) issues.push(c.errors.binding);
  if (mode === "correct" ? !isEstimateRecordedDecisionCurrent(estimate) : estimate.decision !== null) issues.push(c.errors.previous);
  if (!isEstimateLocalDate(today)) issues.push(c.errors.today);
  if (!timezone.trim() || !createEstimateTimestampFormatter(timezone)) issues.push(c.errors.timezone);
  if (!isEstimateDecisionOutcome(value.outcome)) fieldErrors.outcome = c.errors.outcome;
  if (!isEstimateLocalDate(value.decisionDate)) fieldErrors.decisionDate = c.errors.date;
  else if (isEstimateLocalDate(today) && value.decisionDate > today) fieldErrors.decisionDate = c.errors.future;
  if (!isEstimateDecisionChannel(value.channel)) fieldErrors.channel = c.errors.channel;
  if (value.note.length > c.limit) fieldErrors.note = c.errors.note;
  if (mode === "correct" && (!value.reason.trim() || value.reason.length > c.limit)) fieldErrors.reason = c.errors.reason;
  if (!eligible || issues.length || Object.keys(fieldErrors).length || !isEstimateDecisionOutcome(value.outcome) || !isEstimateDecisionChannel(value.channel)) {
    return { issues, fieldErrors, eligible, request: null };
  }
  const request = {
    estimateId: estimate.id, expectedVersion: value.expectedVersion,
    outcome: value.outcome, decisionDate: value.decisionDate, channel: value.channel, note: value.note.trim(),
  };
  return { issues, fieldErrors, eligible, request: mode === "correct"
    ? { ...request, mode, reason: value.reason.trim() } : { ...request, mode } };
}

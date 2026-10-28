import type { EstimateCapabilities, EstimateParentType, EstimateStatus } from "./estimate-preview.types";

export type EstimateRowAction =
  | "open" | "duplicate" | "revise" | "void" | "archive" | "restore" | "delete-draft";
export type EstimateStatusAction =
  | "send" | "publish" | "mark-accepted" | "mark-declined" | "revise" | "correct-decision" | "convert";
export type EstimateActionContext = {
  status: EstimateStatus;
  archived?: boolean;
  capabilities: EstimateCapabilities;
};
export type EstimateStatusActionContext = EstimateActionContext & {
  /** Host-derived grant: decision correction is limited to Owner/Admin/Office. */
  canCorrectDecision?: boolean;
  /** Host-derived grant: requires jobs.create and current customer access. */
  canConvertToJob?: boolean;
  /** Conversion creates a new job only for a lead-linked estimate. */
  parentType?: EstimateParentType;
  hasConvertedJob?: boolean;
};

/** Presentation eligibility only; server transitions and scoped authorization arrive during connection. */
export function getEstimateRowActions({ status, archived = false, capabilities: caps }: EstimateActionContext): EstimateRowAction[] {
  if (!caps.read) return [];
  const actions: EstimateRowAction[] = ["open"];
  if (caps.create) actions.push("duplicate");
  if (archived) {
    if (caps.archive) actions.push("restore");
    return actions;
  }
  if (["sent", "published", "declined", "expired"].includes(status) && caps.update) actions.push("revise");
  if (["sent", "published"].includes(status) && caps.void) actions.push("void");
  if (["declined", "expired", "superseded", "void"].includes(status) && caps.archive) actions.push("archive");
  if (status === "draft" && caps.delete) actions.push("delete-draft");
  return actions;
}

export function getEstimateStatusActions({
  status, archived = false, capabilities: caps, canCorrectDecision = false,
  canConvertToJob = false, hasConvertedJob = false, parentType,
}: EstimateStatusActionContext): EstimateStatusAction[] {
  if (!caps.read || archived) return [];
  if (status === "draft") return caps.send ? ["send", "publish"] : [];
  const actions: EstimateStatusAction[] = [];
  if ((status === "sent" || status === "published") && caps.decide) actions.push("mark-accepted", "mark-declined");
  if (getEstimateRowActions({ status, capabilities: caps }).includes("revise")) actions.push("revise");
  if (status === "accepted" && parentType === "lead" && canConvertToJob && !hasConvertedJob) actions.push("convert");
  if ((status === "accepted" || status === "declined") && caps.decide && canCorrectDecision) actions.push("correct-decision");
  return actions;
}

import type { EstimateDraftOperationResult, EstimateDraftState } from "@salesmora/ui";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { EstimateDecisionMode, EstimateDecisionRecord, EstimateDecisionValues } from "../estimate-decision-dialog/estimate-decision-dialog.preview";

export type EstimateDecisionProposal = {
  id: string;
  actionType: "estimate.decision";
  inputHash: string;
  authorizationVersion: string;
  createdAt: string;
  expiresAt: string;
  state: EstimateDraftState;
  mode: EstimateDecisionMode;
  estimate: EstimateDecisionRecord;
  snapshotHash: string;
  value: EstimateDecisionValues;
};
/** Current record and stored proposal values loaded independently by the authorized host. */
export type EstimateDecisionCardContext = {
  proposalId: string;
  inputHash: string;
  authorizationVersion: string;
  mode: EstimateDecisionMode;
  estimate: EstimateDecisionRecord;
  snapshotHash: string | null;
  value: EstimateDecisionValues;
  today: string;
  timezone: string;
};
export type EstimateDecisionCardRequest = {
  proposalId: string;
  actionType: "estimate.decision";
  inputHash: string;
  authorizationVersion: string;
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
};
export type EstimateDecisionCardDecision = EstimateDecisionCardRequest & { decision: "confirm" | "cancel" };
export type EstimateDecisionCardProps = {
  proposal: EstimateDecisionProposal;
  context: EstimateDecisionCardContext | null;
  capabilities: EstimateCapabilities;
  parentAccess: boolean;
  /** Host-derived Owner/Admin/Office correction grant, separate from estimates.decide. */
  canCorrectDecision: boolean;
  disabled?: boolean;
  onDecide?: (request: EstimateDecisionCardDecision) => Promise<EstimateDraftOperationResult>;
};

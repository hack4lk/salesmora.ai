import type { EstimateDraftOperationResult, EstimateDraftState } from "@salesmora/ui";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { EstimateConversionCustomer, EstimateConversionJobRef, EstimateConversionRecord } from "../estimate-convert-dialog/estimate-convert-dialog.preview";

export type EstimateConvertProposal = {
  id: string;
  actionType: "estimate.convert";
  inputHash: string;
  authorizationVersion: string;
  createdAt: string;
  expiresAt: string;
  state: EstimateDraftState;
  estimate: EstimateConversionRecord;
  customer: EstimateConversionCustomer;
};
/** Current record, customer and stored proposal reference loaded independently by the authorized host. */
export type EstimateConvertCardContext = {
  proposalId: string;
  inputHash: string;
  authorizationVersion: string;
  estimate: EstimateConversionRecord;
  customer: EstimateConversionCustomer;
  parentJob?: EstimateConversionJobRef;
};
export type EstimateConvertCardRequest = {
  proposalId: string;
  actionType: "estimate.convert";
  inputHash: string;
  authorizationVersion: string;
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
  sourceLeadId: string;
};
export type EstimateConvertCardDecision = EstimateConvertCardRequest & { decision: "review" | "cancel" };
export type EstimateConvertCardProps = {
  proposal: EstimateConvertProposal;
  context: EstimateConvertCardContext | null;
  capabilities: EstimateCapabilities;
  parentAccess: boolean;
  canCreateJob: boolean;
  disabled?: boolean;
  /** Review opens the approved conversion form; it must never create a job. */
  onDecide?: (request: EstimateConvertCardDecision) => Promise<EstimateDraftOperationResult>;
};

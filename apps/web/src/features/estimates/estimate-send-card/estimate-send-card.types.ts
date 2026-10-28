import type { EstimateDraftOperationResult, EstimateDraftState } from "@salesmora/ui";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { EstimateSendPreview } from "../estimate-send-dialog/estimate-send-dialog";
import type { EstimateSendReadiness, EstimateSendRecord } from "../estimate-send-dialog/estimate-send-dialog.preview";

export type EstimateSendProposal = {
  id: string;
  actionType: "estimate.send";
  inputHash: string;
  authorizationVersion: string;
  createdAt: string;
  expiresAt: string;
  state: EstimateDraftState;
  estimate: EstimateSendRecord;
  subject: string;
  snapshotHash: string;
};

/** Independently loaded by the authorized host, never inferred from proposal text. */
export type EstimateSendCardContext = {
  proposalId: string;
  inputHash: string;
  authorizationVersion: string;
  estimate: EstimateSendRecord;
  subject: string;
  /** The same reviewed snapshot as preview.content. */
  snapshotHash: string;
  unsavedChanges: boolean;
  today: string;
  readiness: EstimateSendReadiness;
  /** Immutable customer-only JSX from the owning host, never assistant-provided markup. */
  preview: EstimateSendPreview | null;
};
export type EstimateSendCardRequest = {
  proposalId: string;
  actionType: "estimate.send";
  inputHash: string;
  authorizationVersion: string;
  estimateId: string;
  expectedVersion: number;
  snapshotHash: string;
};
export type EstimateSendCardDecision = EstimateSendCardRequest & { decision: "confirm" | "cancel" };
export type EstimateSendCardProps = {
  proposal: EstimateSendProposal;
  context: EstimateSendCardContext | null;
  capabilities: EstimateCapabilities;
  parentAccess: boolean;
  disabled?: boolean;
  onDecide?: (request: EstimateSendCardDecision) => Promise<EstimateDraftOperationResult>;
};

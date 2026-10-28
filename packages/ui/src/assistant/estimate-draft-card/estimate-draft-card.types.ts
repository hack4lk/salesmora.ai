import type { EstimateAdjustment, EstimateItemInput } from "@salesmora/domain";

export type EstimateDraftPriceSource =
  | { type: "missing" | "user" | "saved" }
  | { type: "catalog" | "rule"; name: string };
export type EstimateDraftLine = EstimateItemInput & {
  id: string;
  unit: string;
  priceSource: EstimateDraftPriceSource;
};
export type EstimateDraftContent = {
  name: string; scope: string; message: string; paymentTerms: string; termsNote: string; validUntil: string;
  items: readonly EstimateDraftLine[];
  discount: EstimateAdjustment; taxRate: string; deposit: EstimateAdjustment;
};
export type EstimateDraftParent = { type: "lead" | "job"; id: string; number: string; name: string; version: number };
export type EstimateDraftState = "pending" | "confirmed" | "cancelled" | "expired" | "superseded" | "conflict" | "forbidden";
export type EstimateDraftProposal = {
  id: string; inputHash: string; authorizationVersion: string; createdAt: string; expiresAt: string; state: EstimateDraftState;
  parent: EstimateDraftParent;
  proposed: EstimateDraftContent;
} & (
  | { actionType: "estimate.create" }
  | {
    actionType: "estimate.update";
    estimate: { id: string; number: string; revision: number; expectedVersion: number };
    current: EstimateDraftContent;
  }
);
/** Authorized host binding, reloaded independently of assistant-produced proposal text. */
export type EstimateDraftContext = {
  proposalId: string; inputHash: string; authorizationVersion: string;
  parent: Pick<EstimateDraftParent, "type" | "id" | "version">;
  estimate: { id: string; version: number; status: string; archived: boolean } | null;
};
export type EstimateDraftGrants = {
  read: boolean; parentAccess: boolean; create: boolean; update: boolean;
};
export type EstimateDraftRequest = {
  proposalId: string; inputHash: string; authorizationVersion: string; actionType: EstimateDraftProposal["actionType"];
  parentType: EstimateDraftParent["type"]; parentId: string; parentVersion: number;
  estimateId: string | null; expectedVersion: number | null;
};
export type EstimateDraftDecisionRequest = EstimateDraftRequest & { decision: "confirm" | "cancel" };
export type EstimateDraftOperationResult = { ok: true } | { ok: false; message: string };

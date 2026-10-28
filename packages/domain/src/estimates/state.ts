import type { EstimateStatus } from "@salesmora/contracts";

const transitions: Record<EstimateStatus, readonly EstimateStatus[]> = {
  draft: ["sent", "published"],
  sent: ["accepted", "declined", "expired", "superseded", "void"],
  published: ["accepted", "declined", "expired", "superseded", "void"],
  accepted: ["declined"],
  declined: ["accepted", "superseded"],
  expired: ["superseded"],
  superseded: [],
  void: [],
};

export function canTransitionEstimate(
  from: EstimateStatus,
  to: EstimateStatus,
): boolean {
  return transitions[from].includes(to);
}

export function estimateStatusAtDate(
  status: EstimateStatus,
  validUntil: string | null,
  today: string,
): EstimateStatus {
  if (
    (status === "sent" || status === "published") &&
    validUntil !== null &&
    validUntil < today
  ) {
    return "expired";
  }
  return status;
}

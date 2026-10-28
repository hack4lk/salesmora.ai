import type { EstimateLeadStageEvent, EstimateLeadStageTarget, EstimateStatus, LeadInput } from "@salesmora/contracts";

export type EstimateLeadStageContext = {
  event: EstimateLeadStageEvent | null;
  parentType: "lead" | "job";
  status: EstimateStatus;
  archived?: boolean;
  canRead?: boolean;
  lead?: { stage: LeadInput["stage"]; canMove: boolean; archived: boolean };
};

/** Eligibility only; a mutation must separately reauthorize and verify the reviewed versions. */
export function getEstimateLeadStageTarget({
  event, parentType, status, archived = false, canRead = false, lead,
}: EstimateLeadStageContext): EstimateLeadStageTarget | null {
  if (!canRead || parentType !== "lead" || archived || !lead?.canMove || lead.archived
    || lead.stage === "won" || lead.stage === "lost") return null;
  if (event?.kind === "send" && status === "sent"
    && (lead.stage === "new" || lead.stage === "contacted")) return "estimate-sent";
  if (event?.kind === "decision" && event.outcome === "declined"
    && event.previousOutcome !== "declined" && status === "declined") return "lost";
  return null;
}

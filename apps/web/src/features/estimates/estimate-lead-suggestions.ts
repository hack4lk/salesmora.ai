import type { EstimateLeadStageContext as DomainContext } from "@salesmora/domain";
import type { MoveStageLead } from "../leads/move-stage-dialog/move-stage-dialog";

export { getEstimateLeadStageTarget } from "@salesmora/domain";
export type { EstimateLeadStageEvent, EstimateLeadStageTarget } from "@salesmora/contracts";
export type EstimateLeadStageContext = Omit<DomainContext, "lead"> & {
  lead?: MoveStageLead;
};

import type { estimateVoidChatDecisionSchema, EstimateVoidChatView } from "@salesmora/contracts";
import type { EstimateDraftOperationResult } from "@salesmora/ui";

export type EstimateVoidCardContext = { workspaceId: string; view: EstimateVoidChatView };
export type EstimateVoidCardGrants = { read: boolean; parentAccess: boolean; void: boolean };
export type EstimateVoidCardCommand = ReturnType<typeof estimateVoidChatDecisionSchema.parse>;
export type EstimateVoidCardProps = {
  view: EstimateVoidChatView;
  /** The host supplies the independently authorized review and current grants, never model text. */
  context: EstimateVoidCardContext | null;
  grants: EstimateVoidCardGrants;
  disabled?: boolean;
  onOperate?: (command: EstimateVoidCardCommand) => Promise<EstimateDraftOperationResult>;
};

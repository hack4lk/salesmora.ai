import type { estimateArchiveChatDecisionSchema, EstimateArchiveChatView } from "@salesmora/contracts";
import type { EstimateDraftOperationResult } from "@salesmora/ui";

export type EstimateArchiveCardContext = { workspaceId: string; view: EstimateArchiveChatView };
export type EstimateArchiveCardGrants = { read: boolean; parentAccess: boolean; archive: boolean };
export type EstimateArchiveCardCommand = ReturnType<typeof estimateArchiveChatDecisionSchema.parse>;
export type EstimateArchiveCardProps = {
  view: EstimateArchiveChatView;
  /** The host supplies the independently authorized review and current grants, never model text. */
  context: EstimateArchiveCardContext | null;
  grants: EstimateArchiveCardGrants;
  disabled?: boolean;
  onOperate?: (command: EstimateArchiveCardCommand) => Promise<EstimateDraftOperationResult>;
};

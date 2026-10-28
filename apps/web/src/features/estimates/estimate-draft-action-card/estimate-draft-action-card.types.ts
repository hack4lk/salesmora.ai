import type { estimateDraftActionChatDecisionSchema, EstimateDraftActionChatView } from "@salesmora/contracts";
import type { EstimateDraftOperationResult } from "@salesmora/ui";

export type EstimateDraftActionCardContext = {
  workspaceId: string;
  view: EstimateDraftActionChatView;
};
export type EstimateDraftActionCardGrants = {
  read: boolean; parentAccess: boolean; create: boolean; update: boolean;
};
export type EstimateDraftActionCardCommand = ReturnType<typeof estimateDraftActionChatDecisionSchema.parse>;
export type EstimateDraftActionCardProps = {
  view: EstimateDraftActionChatView;
  /** Independently checked private review and current grants come from the host, never model text. */
  context: EstimateDraftActionCardContext | null;
  grants: EstimateDraftActionCardGrants;
  disabled?: boolean;
  onOperate?: (command: EstimateDraftActionCardCommand) => Promise<EstimateDraftOperationResult>;
};

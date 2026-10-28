import type {
  estimateDraftDeleteChatDecisionSchema,
  EstimateDraftDeleteChatView,
} from "@salesmora/contracts";
import type { EstimateDraftOperationResult } from "@salesmora/ui";

export type EstimateDraftDeleteCardContext = {
  workspaceId: string;
  view: EstimateDraftDeleteChatView;
};
export type EstimateDraftDeleteCardGrants = {
  read: boolean;
  parentAccess: boolean;
  delete: boolean;
};
export type EstimateDraftDeleteCardCommand = ReturnType<typeof estimateDraftDeleteChatDecisionSchema.parse>;
export type EstimateDraftDeleteCardProps = {
  view: EstimateDraftDeleteChatView;
  /** The host supplies the independently authorized review and current grants. */
  context: EstimateDraftDeleteCardContext | null;
  grants: EstimateDraftDeleteCardGrants;
  disabled?: boolean;
  container?: () => HTMLElement;
  onOperate?: (command: EstimateDraftDeleteCardCommand) => Promise<EstimateDraftOperationResult>;
};

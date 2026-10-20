import 'server-only';
import { moveLeadStage } from '@salesmora/data';
import type { MoveLeadStageInput } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function moveWorkspaceLeadStage(userId: string, input: MoveLeadStageInput) {
  return moveLeadStage(database(), { userId, workspaceId: input.workspaceId }, enabledPermissions, input);
}

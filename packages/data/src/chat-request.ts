import { AsyncLocalStorage } from 'node:async_hooks';
import type {
  ChatLeadEvidence, ChatPageContext, ChatRunState, ChatSurfaceKey, CustomerChatResult,
  HelpSource, WorkOrderChatResult,
  WorkOrderListResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from './authorization/store';

export interface AdmittedChatTurn extends WorkspaceIdentity {
  id: string;
  threadId: string;
  surfaceKey: ChatSurfaceKey;
  pageContext: ChatPageContext;
  state: ChatRunState;
  leaseUntil: Date;
  accessHash: string | null;
  leadEvidence: ChatLeadEvidence;
  leadSearchEvidence: string[];
  leadSearchSnapshot: unknown;
  leadHistoryResult: unknown;
  leadDetailsResult: unknown;
  sources: HelpSource[];
  historyEvidence?: string[];
  proposalFamilies?: string[] | null;
  customerStamp?: string | null;
  customerResult?: CustomerChatResult;
  workOrderResult?: WorkOrderChatResult;
  workOrderReadEvidence?: { ids: string[]; counts?: Pick<WorkOrderListResult['metrics'], 'inProgress' | 'overdue' | 'awaitingSignoff'> };
  reportEvidence?: unknown;
  reportSnapshot?: unknown;
  calendarStamp?: string | null;
  calendarResult?: unknown;
  calendarProposalEvidence?: string[];
  captureStamp?: string | null;
  captureResult?: unknown;
  captureSourceEvidence?: string[];
  captureSetupEvidence?: string[];
  estimateStamp?: string | null;
  estimateResult?: unknown;
  estimateDecisionEvidence?: string[];
  estimateDraftActionEvidence?: string[];
  estimateVoidEvidence?: string[];
  estimateArchiveEvidence?: string[];
  estimateDraftDeleteEvidence?: string[];
  estimateConversionEvidence?: string[];
}
export type ChatTurnEvidenceUpdate = Partial<Omit<AdmittedChatTurn,
  keyof WorkspaceIdentity | 'id' | 'threadId' | 'surfaceKey' | 'pageContext' | 'state' | 'leaseUntil' | 'accessHash'>>;
const turns = new AsyncLocalStorage<{
  turn: AdmittedChatTurn;
  stage: (update: ChatTurnEvidenceUpdate) => void;
  clock?: { timezone: string; today: string };
}>();

/** Enter only after session authentication and workspace/turn admission. */
export function withAdmittedChatTurn<T>(
  turn: AdmittedChatTurn, stage: (update: ChatTurnEvidenceUpdate) => void, run: () => T,
  clock?: { timezone: string; today: string },
): T {
  return turns.run({ turn, stage, clock }, run);
}
export function admittedChatClock(identity: WorkspaceIdentity) {
  const request = turns.getStore();
  if (!request) return;
  admittedChatTurn(identity, request.turn.id);
  return request.clock;
}
export function admittedChatTurn(identity: WorkspaceIdentity, id: string) {
  const request = turns.getStore();
  if (!request) return;
  if (request.turn.userId !== identity.userId || request.turn.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return request.turn.id === id ? request.turn : undefined;
}
export function stageAdmittedChatTurn(identity: WorkspaceIdentity, id: string, update: ChatTurnEvidenceUpdate) {
  if (!admittedChatTurn(identity, id)) return false;
  turns.getStore()!.stage(update);
  return true;
}

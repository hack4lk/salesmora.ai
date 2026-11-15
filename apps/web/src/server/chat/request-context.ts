import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthorizationAccessError, withWorkspaceAuthoritySnapshot, withAdmittedChatTurn, stageAdmittedChatTurn,
  createAIUsageRecorder, type AIUsageSession,
  type ChatTurnEvidenceUpdate, type readCalendarFocusForChat } from '@salesmora/data';
import type { AuthorizationContext } from '@salesmora/contracts';
import { database } from '../workspaces/store';
import type { ChatIdentity, StoredTurn } from './store';

export interface ChatRequestContext {
  authority: AuthorizationContext;
  turn: StoredTurn;
  sessionId: string;
  clock?: { timezone: string; today: string };
  reference?: unknown;
  calendarFocus?: Awaited<ReturnType<typeof readCalendarFocusForChat>>;
  staged?: ChatEvidenceUpdate;
  usage?: AIUsageSession;
}
export type ChatEvidenceUpdate = ChatTurnEvidenceUpdate;
const requests = new AsyncLocalStorage<ChatRequestContext>();

export function withChatRequest<T>(request: ChatRequestContext, run: () => T): T {
  if (request.authority.userId !== request.turn.userId || request.authority.workspaceId !== request.turn.workspaceId ||
      !request.sessionId) throw new AuthorizationAccessError();
  return requests.run(request, () => withWorkspaceAuthoritySnapshot(database(), request.authority,
    () => withAdmittedChatTurn(request.turn, update => {
      if (update.workOrderReadEvidence && request.turn.workOrderReadEvidence) {
        update = { ...update, workOrderReadEvidence: {
          ...request.turn.workOrderReadEvidence, ...update.workOrderReadEvidence,
          ids: [...new Set([...request.turn.workOrderReadEvidence.ids, ...update.workOrderReadEvidence.ids])],
        } };
      }
      Object.assign(request.staged ??= {}, update);
      Object.assign(request.turn, update);
    }, run, request.clock)));
}
export function admittedChatRequest(identity: ChatIdentity, turnId: string) {
  const request = requests.getStore();
  if (!request) return;
  if (request.authority.userId !== identity.userId || request.authority.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return request.turn.id === turnId ? request : undefined;
}
export function stageChatEvidence(identity: ChatIdentity, turnId: string, update: ChatEvidenceUpdate) {
  return stageAdmittedChatTurn(identity, turnId, update);
}
export function chatUsageRecorder(identity: ChatIdentity, turnId?: string) {
  return (turnId ? admittedChatRequest(identity, turnId)?.usage?.recorder : undefined) ??
    createAIUsageRecorder(database(), { ...identity, turnId });
}

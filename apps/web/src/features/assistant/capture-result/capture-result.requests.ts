import {
  captureChatResultSchema, type CaptureAssistantProposalTicket, type CaptureChatTicket,
  type CaptureAssistantProposalDecision,
} from '@salesmora/contracts';
import { captureAssistantReferenceKey } from './capture-result.validation';
import { captureAssistantResultData as copy } from './capture-result.data';

export function captureReadResponse(ticket: CaptureChatTicket, raw: unknown) {
  if (!raw || typeof raw !== 'object' || !('result' in raw)) throw Error(copy.unavailable);
  const result = captureChatResultSchema.parse(raw.result);
  if (result.id !== ticket.resultId || result.workspaceId !== ticket.workspaceId || result.operation !== ticket.operation) throw Error(copy.unavailable);
  return result;
}

export function captureProposalResponse<T extends { ticket: CaptureAssistantProposalTicket }>(
  ticket: CaptureAssistantProposalTicket, parse: (raw: unknown) => T, raw: unknown,
  decision?: CaptureAssistantProposalDecision['decision'],
) {
  if (!raw || typeof raw !== 'object' || !('view' in raw)) throw Error(copy.unavailable);
  const view = parse(raw.view);
  const key = (value: CaptureAssistantProposalTicket) => {
    const { workspaceId, proposalId, inputHash, operation, target, transition } = value;
    return captureAssistantReferenceKey({ kind: 'proposal', binding: { workspaceId, proposalId, inputHash, operation, target, ...(transition ? { transition } : {}) } });
  };
  if (key(view.ticket) !== key(ticket) ||
    decision && view.ticket.state !== (decision === 'confirm' ? 'confirmed' : 'cancelled')) throw Error(copy.stale);
  return view;
}

export function captureNavigationResponse(workspaceId: string, sourceId: string, raw: unknown, origin: string) {
  if (!raw || typeof raw !== 'object' || !('href' in raw) || typeof raw.href !== 'string') throw Error(copy.unavailable);
  const url = new URL(raw.href, origin);
  if (url.origin !== origin || url.pathname !== `/lead-capture/${sourceId}` ||
    url.search !== `?workspace=${workspaceId}` || url.hash || url.username || url.password) throw Error(copy.unavailable);
  return url.pathname + url.search;
}

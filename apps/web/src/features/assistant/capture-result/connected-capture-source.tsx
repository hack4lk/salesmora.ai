'use client';
import { useMemo } from 'react';
import { captureSourceProposalViewSchema, type CaptureAssistantProposalTicket, type CaptureSourceProposalView, type CaptureAssistantProposalDecision } from '@salesmora/contracts';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient } from './capture-result.types';
import { captureProposalResponse } from './capture-result.requests';
import { useAssistantResultRequest } from '../use-assistant-result-request';
const titles: Record<string, string> = { publish: 'Publish saved capture source', change_schedule: 'Change scheduled launch', cancel_schedule: 'Cancel scheduled launch', pause: 'Pause capture intake', resume: 'Resume capture intake', archive: 'Archive capture source', restore: 'Restore source with intake paused', duplicate: 'Duplicate source into a new draft' };
export function ConnectedCaptureSource({ ticket, disabled, onSaved }: {
  ticket: CaptureAssistantProposalTicket;
  disabled: boolean;
  onSaved?: () => void;
}) {
  const api = useAssistantResultRequest<CaptureSourceProposalView>(ticket.workspaceId, 'assistant-capture-source', 'This source review changed or is unavailable. Request a fresh review.', JSON.stringify(ticket));
  const reference = useMemo(() => ({ kind: 'proposal' as const, binding: { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash, operation: ticket.operation, target: ticket.target, ...(ticket.transition ? { transition: ticket.transition } : {}) } }), [ticket]);
  const client = useMemo<CaptureAssistantClient>(() => {
    const binding = { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash };
    function project(view: CaptureSourceProposalView) { const op = view.ticket.operation; return { kind: 'proposal' as const, reference, ticket: view.ticket, retrievedAt: view.ticket.createdAt, title: titles[op], content: { kind: 'source_action' as const, view }, outcome: op === 'duplicate' ? 'New source draft created. Publication requires a separate review.' : op === 'restore' ? 'Source restored with intake paused.' : op === 'cancel_schedule' ? 'Pending launch cancelled. Existing receipts are retained.' : op === 'change_schedule' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch schedule changed. Delivery has not started.' : op === 'publish' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch scheduled. Delivery has not started.' : op === 'pause' ? 'Capture intake paused.' : op === 'archive' ? 'Capture source archived.' : op === 'resume' ? 'Approved capture intake resumed.' : 'Saved capture configuration published. Real request delivery remains subject to its current checks.' }; }
    async function request(signal: AbortSignal, decision?: CaptureAssistantProposalDecision) {
      const parse = (raw: unknown) => captureProposalResponse(ticket, raw => captureSourceProposalViewSchema.parse(raw), raw, decision?.decision);
      return decision
        ? api.write('/api/chat/lead-capture/sources', decision, parse, signal, true)
        : api.read(`/api/chat/lead-capture/sources?${new URLSearchParams(binding)}`, parse, signal);
    }
    return { async read(_reference, signal) { return project(await request(signal)); }, async decide(_reference, decision, signal) { const view = await request(signal, decision); if (view.ticket.state === 'confirmed')
        onSaved?.(); return project(view); } };
  }, [ticket, reference, onSaved, api]);
  return <CaptureAssistantResult reference={reference} client={client} disabled={disabled} onRefresh={async () => { }} onOpen={() => { }}/>;
}

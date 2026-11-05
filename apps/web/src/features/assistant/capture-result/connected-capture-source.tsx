'use client';
import { useMemo } from 'react';
import { captureSourceProposalViewSchema, type CaptureAssistantProposalTicket, type CaptureSourceProposalView } from '@salesmora/contracts';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient } from './capture-result.types';
const titles: Record<string, string> = { publish: 'Publish saved capture source', change_schedule: 'Change scheduled launch', cancel_schedule: 'Cancel scheduled launch', pause: 'Pause capture intake', resume: 'Resume capture intake', archive: 'Archive capture source', restore: 'Restore source with intake paused', duplicate: 'Duplicate source into a new draft' };
export function ConnectedCaptureSource({ ticket, disabled, onSaved }: {
  ticket: CaptureAssistantProposalTicket;
  disabled: boolean;
  onSaved?: () => void;
}) {
  const reference = useMemo(() => ({ kind: 'proposal' as const, binding: { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash, operation: ticket.operation, target: ticket.target, ...(ticket.transition ? { transition: ticket.transition } : {}) } }), [ticket]);
  const client = useMemo<CaptureAssistantClient>(() => {
    const binding = { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash };
    function project(view: CaptureSourceProposalView) { const op = view.ticket.operation; return { kind: 'proposal' as const, reference, ticket: view.ticket, retrievedAt: view.ticket.createdAt, title: titles[op], content: { kind: 'source_action' as const, view }, outcome: op === 'duplicate' ? 'New source draft created. Publication requires a separate review.' : op === 'restore' ? 'Source restored with intake paused.' : op === 'cancel_schedule' ? 'Pending launch cancelled. Existing receipts are retained.' : op === 'change_schedule' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch schedule changed. Delivery has not started.' : op === 'publish' && view.receipt?.kind === 'publication' && view.receipt.status !== 'active' ? 'Launch scheduled. Delivery has not started.' : op === 'pause' ? 'Capture intake paused.' : op === 'archive' ? 'Capture source archived.' : op === 'resume' ? 'Approved capture intake resumed.' : 'Saved capture configuration published. Real request delivery remains subject to its current checks.' }; }
    async function request(method: 'GET' | 'POST', signal: AbortSignal, body?: unknown) { const response = await fetch(`/api/chat/lead-capture/sources${method === 'GET' ? `?${new URLSearchParams(binding)}` : ''}`, { method, cache: 'no-store', signal, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) }); if (!response.ok)
      throw Error('This source review changed or is unavailable. Request a fresh review.'); const view = captureSourceProposalViewSchema.parse((await response.json()).view); if (view.ticket.proposalId !== ticket.proposalId || view.ticket.inputHash !== ticket.inputHash)
      throw Error('Invalid source review.'); return view; }
    return { async read(_reference, signal) { return project(await request('GET', signal)); }, async decide(_reference, decision, signal) { const view = await request('POST', signal, decision); if (view.ticket.state === 'confirmed')
        onSaved?.(); return project(view); } };
  }, [ticket, reference, onSaved]);
  return <CaptureAssistantResult reference={reference} client={client} disabled={disabled} onRefresh={async () => { }} onOpen={() => { }}/>;
}

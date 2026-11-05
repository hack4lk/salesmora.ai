'use client';
import { useMemo } from 'react';
import { captureSetupViewSchema, type CaptureAssistantProposalTicket, type CaptureSetupView } from '@salesmora/contracts';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient } from './capture-result.types';
export function ConnectedCaptureSetup({ ticket, disabled, apply, onSaved }: { ticket: CaptureAssistantProposalTicket; disabled: boolean; apply?: (view: CaptureSetupView, checkOnly?: boolean) => boolean; onSaved?: (sourceId: string) => void }) {
  const reference = useMemo(() => { const { workspaceId, proposalId, inputHash, operation, target } = ticket; return { kind: 'proposal' as const, binding: { workspaceId, proposalId, inputHash, operation, target } }; }, [ticket]);
  const client = useMemo<CaptureAssistantClient>(() => {
    const binding = { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash };
    const application = ['suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample'].includes(ticket.operation);
    function project(view: CaptureSetupView, applied = false) {
      return { kind: 'proposal' as const, reference, ticket: view.ticket, retrievedAt: view.ticket.createdAt, title: ({ create_source: 'Create source draft', begin_revision: 'Begin source revision', save_draft: 'Save source draft', suggest_website_fields: 'Apply suggested fields', suggest_workflow: 'Apply suggested workflow', extract_sample: 'Review extracted sample', refine_mapping: 'Review refined mapping', approve_sample: 'Approve pasted sample' } as Record<string, string>)[view.ticket.operation], content: { kind: 'setup' as const, view }, outcome: view.receipt?.kind === 'saved' ? 'Draft saved. Publication requires a separate review.' : applied ? 'Suggestions applied to the unsaved setup. Save separately to keep them.' : 'Review confirmed. Reopen the matching setup to apply the suggestions; they have not been saved.' };
    }
    async function request(method: 'GET' | 'POST', signal: AbortSignal, body?: unknown) {
      const response = await fetch(`/api/chat/lead-capture/setup${method === 'GET' ? `?${new URLSearchParams(binding)}` : ''}`, { method, cache: 'no-store', signal, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
      if (!response.ok) throw Error('This setup review is unavailable or changed. Ask for a fresh review.');
      const view = captureSetupViewSchema.parse((await response.json()).view);
      if (view.ticket.proposalId !== ticket.proposalId || view.ticket.inputHash !== ticket.inputHash) throw Error('Invalid setup binding.');
      return view;
    }
    return {
      async read(_reference, signal) { return project(await request('GET', signal)); },
      async decide(_reference, decision, signal) {
        if (decision.decision === 'confirm' && application) {
          const current = await request('GET', signal);
          if (!apply?.(current, true)) throw Error('The unsaved setup changed. Request a fresh suggestion.');
        }
        const view = await request('POST', signal, decision);
        const applied = view.ticket.state === 'confirmed' && view.receipt?.kind === 'suggestions' && !!apply?.(view);
        if (view.ticket.state === 'confirmed' && view.receipt?.kind === 'saved') onSaved?.(view.receipt.sourceId);
        return project(view, applied);
      },
    };
  }, [ticket, reference, apply, onSaved]);
  return <CaptureAssistantResult reference={reference} client={client} disabled={disabled} onRefresh={async () => {}} onOpen={() => {}} />;
}

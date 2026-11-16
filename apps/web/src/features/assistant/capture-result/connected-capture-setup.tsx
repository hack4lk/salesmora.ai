'use client';
import { useMemo } from 'react';
import { captureSetupViewSchema, type CaptureAssistantProposalTicket, type CaptureSetupView, type CaptureAssistantProposalDecision } from '@salesmora/contracts';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient } from './capture-result.types';
import { captureProposalResponse } from './capture-result.requests';
import { useAssistantResultRequest } from '../use-assistant-result-request';
export function ConnectedCaptureSetup({ ticket, disabled, apply, onSaved }: { ticket: CaptureAssistantProposalTicket; disabled: boolean; apply?: (view: CaptureSetupView, checkOnly?: boolean) => boolean; onSaved?: (sourceId: string) => void }) {
  const api = useAssistantResultRequest<CaptureSetupView>(ticket.workspaceId, 'assistant-capture-setup', 'This setup review is unavailable or changed. Ask for a fresh review.', JSON.stringify(ticket));
  const reference = useMemo(() => { const { workspaceId, proposalId, inputHash, operation, target } = ticket; return { kind: 'proposal' as const, binding: { workspaceId, proposalId, inputHash, operation, target } }; }, [ticket]);
  const client = useMemo<CaptureAssistantClient>(() => {
    const binding = { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash };
    const application = ['suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample'].includes(ticket.operation);
    function project(view: CaptureSetupView, applied = false) {
      return { kind: 'proposal' as const, reference, ticket: view.ticket, retrievedAt: view.ticket.createdAt, title: ({ create_source: 'Create source draft', begin_revision: 'Begin source revision', save_draft: 'Save source draft', suggest_website_fields: 'Apply suggested fields', suggest_workflow: 'Apply suggested workflow', extract_sample: 'Review extracted sample', refine_mapping: 'Review refined mapping', approve_sample: 'Approve pasted sample' } as Record<string, string>)[view.ticket.operation], content: { kind: 'setup' as const, view }, outcome: view.receipt?.kind === 'saved' ? 'Draft saved. Publication requires a separate review.' : applied ? 'Suggestions applied to the unsaved setup. Save separately to keep them.' : 'Review confirmed. Reopen the matching setup to apply the suggestions; they have not been saved.' };
    }
    async function request(signal: AbortSignal, decision?: CaptureAssistantProposalDecision) {
      const parse = (raw: unknown) => captureProposalResponse(ticket, raw => captureSetupViewSchema.parse(raw), raw, decision?.decision);
      return decision
        ? api.write('/api/chat/lead-capture/setup', decision, parse, signal, true)
        : api.read(`/api/chat/lead-capture/setup?${new URLSearchParams(binding)}`, parse, signal);
    }
    return {
      async read(_reference, signal) { return project(await request(signal)); },
      async decide(_reference, decision, signal) {
        if (decision.decision === 'confirm' && application) {
          const current = await request(signal);
          if (!apply?.(current, true)) throw Error('The unsaved setup changed. Request a fresh suggestion.');
        }
        const view = await request(signal, decision);
        const applied = view.ticket.state === 'confirmed' && view.receipt?.kind === 'suggestions' && !!apply?.(view);
        if (view.ticket.state === 'confirmed' && view.receipt?.kind === 'saved') onSaved?.(view.receipt.sourceId);
        return project(view, applied);
      },
    };
  }, [ticket, reference, apply, onSaved, api]);
  return <CaptureAssistantResult reference={reference} client={client} disabled={disabled} onRefresh={async () => {}} onOpen={() => {}} />;
}

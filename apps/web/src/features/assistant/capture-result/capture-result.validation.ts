import { captureAssistantProposalBindingSchema, captureAssistantProposalTicketSchema, captureIdSchema, captureChatResultSchema, captureSetupViewSchema, captureSourceProposalViewSchema } from '@salesmora/contracts';
import { validateCaptureFormFields } from '../../lead-capture/capture-form-field-editor/capture-form-field-editor.validation';
import { validateCaptureLeadWorkflow } from '../../lead-capture/capture-lead-workflow/capture-lead-workflow.validation';
import { validCaptureDashboardSource, validCaptureSourceTotals } from '../../lead-capture/capture-dashboard-summary/capture-dashboard-summary.validation';
import { validCapturePublication } from '../../lead-capture/capture-publication-instructions/capture-publication-instructions.validation';
import { validIntakeEvidenceSnapshot } from '../../lead-capture/intake-source-evidence/intake-source-evidence.validation';
import type { CaptureAssistantReference, CaptureAssistantView } from './capture-result.types';

export function captureAssistantReferenceKey(reference: CaptureAssistantReference): string {
  if (reference.kind === 'result') {
    captureIdSchema.parse(reference.workspaceId); captureIdSchema.parse(reference.resultId);
    if (!/^[a-f0-9]{64}$/.test(reference.snapshotHash)) throw Error('Invalid result binding.');
    return JSON.stringify(['result', reference.workspaceId, reference.resultId, reference.snapshotHash]);
  }
  return JSON.stringify(['proposal', captureAssistantProposalBindingSchema.parse(reference.binding)]);
}
function ticketBinding(ticket: Extract<CaptureAssistantView, { kind: 'proposal' }>['ticket']) {
  return { workspaceId: ticket.workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash, operation: ticket.operation, target: ticket.target, ...(ticket.transition ? { transition: ticket.transition } : {}) };
}
/** Supplemental presentation binding; current server authorization remains mandatory. */
export function captureAssistantViewMatches(reference: CaptureAssistantReference, view: CaptureAssistantView): boolean {
  try {
    if (captureAssistantReferenceKey(reference) !== captureAssistantReferenceKey(view.reference) || view.kind !== reference.kind || !Number.isFinite(Date.parse(view.retrievedAt))) return false;
    if (view.kind === 'result') {
      const content = view.content;
      switch (content.kind) {
        case 'capture_read': return reference.kind === 'result' && captureChatResultSchema.safeParse(content.result).success && content.result.workspaceId === reference.workspaceId && content.result.id === reference.resultId;
        case 'sources':
          new Intl.DateTimeFormat('en', { timeZone: content.timezone });
          return content.rows.length <= 20 && Number.isSafeInteger(content.total) && content.total >= content.rows.length && new Set(content.rows.map(row => row.id)).size === content.rows.length && content.rows.every(row => captureIdSchema.safeParse(row.id).success && !!row.name.trim() && ['website', 'gmail'].includes(row.source) && ['draft', 'active', 'paused', 'scheduled', 'archived'].includes(row.status) && Number.isSafeInteger(row.captured) && Number.isSafeInteger(row.awaitingReview) && row.captured >= row.awaitingReview && row.awaitingReview >= 0 && (!row.lastActivityAt || Number.isFinite(Date.parse(row.lastActivityAt))));
        case 'summary': return validCaptureDashboardSource(content.source) && validCaptureSourceTotals(content.totals);
        case 'installation': return content.publication === null || validCapturePublication(content.publication);
        case 'intake_evidence': return validIntakeEvidenceSnapshot(content.snapshot);
      }
    }
    const ticket = captureAssistantProposalTicketSchema.parse(view.ticket);
    if (reference.kind !== 'proposal' || captureAssistantReferenceKey({ kind: 'proposal', binding: ticketBinding(ticket) }) !== captureAssistantReferenceKey(reference)) return false;
    const target = ticket.target, content = view.content;
    switch (content.kind) {
      case 'source_action': return captureSourceProposalViewSchema.safeParse(content.view).success && JSON.stringify(content.view.ticket) === JSON.stringify(ticket);
      case 'setup': return captureSetupViewSchema.safeParse(content.view).success && JSON.stringify(content.view.ticket) === JSON.stringify(ticket);
      case 'fields': return ticket.operation === 'suggest_website_fields' && target.kind === 'source' && validateCaptureFormFields(content.value).length === 0;
      case 'workflow': return ticket.operation === 'suggest_workflow' && target.kind === 'source' && Object.keys(validateCaptureLeadWorkflow(content.value, content.teammates)).length === 0;
      case 'publication': return ticket.operation === 'publish' && target.kind === 'source' && content.draft.id === target.sourceId && content.draft.version === target.draftVersion;
      case 'lifecycle': return ticket.operation === content.action && target.kind === 'source' && content.source.id === target.sourceId && content.source.version === target.sourceVersion;
      case 'intake': {
        if (target.kind !== 'intake' || content.review.intakeId !== target.intakeId || content.review.intakeVersion !== target.intakeVersion || content.review.revision !== target.reviewId || content.review.definitionVersion !== target.definitionVersion || content.review.workflowVersion !== target.workflowVersion) return false;
        const decision = content.review.decision, kind = typeof decision === 'string' ? decision : decision.kind;
        const operations = { create: 'create_lead', separate: 'create_separate_lead', link: 'link_lead', dismiss: 'dismiss_intake' };
        return operations[kind] === ticket.operation && (kind !== 'link' || typeof decision !== 'string' && decision.kind === 'link' && target.lead?.leadId === decision.leadId && target.lead.leadVersion === decision.leadVersion);
      }
    }
  } catch { return false; }
}

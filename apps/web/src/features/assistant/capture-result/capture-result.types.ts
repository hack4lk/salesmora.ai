import type { CaptureChatResult } from '@salesmora/contracts';
import type { CaptureAssistantProposalBinding, CaptureAssistantProposalTicket, CaptureAssistantProposalDecision } from '@salesmora/contracts';
import type { CaptureSourceListProps } from '../../lead-capture/capture-source-list/capture-source-list';
import type { CaptureDashboardSummaryProps } from '../../lead-capture/capture-dashboard-summary/capture-dashboard-summary';
import type { CapturePublication } from '../../lead-capture/capture-publication-instructions/capture-publication-instructions.validation';
import type { IntakeEvidenceSnapshot } from '../../lead-capture/intake-source-evidence/intake-source-evidence.validation';
import type { CaptureFormFieldEditorValue } from '../../lead-capture/capture-form-field-editor/capture-form-field-editor.validation';
import type { CaptureLeadWorkflowValue, CaptureWorkflowTeammate } from '../../lead-capture/capture-lead-workflow/capture-lead-workflow.validation';
import type { CaptureSetupReviewDraft, CaptureLaunchValue } from '../../lead-capture/capture-setup-review/capture-setup-review.validation';
import type { CaptureIntakeSource, CaptureIntakeAction } from '../../lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog.validation';
import type { IntakeDecisionReviewModel } from '../../lead-capture/intake-decision-review/intake-decision-review.validation';

export type CaptureAssistantReference =
  | { kind: 'result'; workspaceId: string; resultId: string; snapshotHash: string }
  | { kind: 'proposal'; binding: CaptureAssistantProposalBinding };
export type CaptureAssistantReadContent =
  | { kind: 'capture_read'; result: CaptureChatResult }
  | { kind: 'sources'; rows: CaptureSourceListProps['rows']; total: number; timezone: string; archived: boolean }
  | { kind: 'summary'; source: CaptureDashboardSummaryProps['source']; totals: CaptureDashboardSummaryProps['totals'] }
  | { kind: 'installation'; publication: CapturePublication | null }
  | { kind: 'intake_evidence'; snapshot: IntakeEvidenceSnapshot; timezone: string };
export type CaptureAssistantReviewContent =
  | { kind: 'source_action'; view: import('@salesmora/contracts').CaptureSourceProposalView }
  | { kind: 'setup'; view: import('@salesmora/contracts').CaptureSetupView }
  | { kind: 'fields'; value: CaptureFormFieldEditorValue }
  | { kind: 'workflow'; value: CaptureLeadWorkflowValue; source: 'website' | 'gmail'; teammates: readonly CaptureWorkflowTeammate[] }
  | { kind: 'publication'; draft: CaptureSetupReviewDraft; timing: CaptureLaunchValue }
  | { kind: 'lifecycle'; source: CaptureIntakeSource; action: CaptureIntakeAction }
  | { kind: 'intake'; review: IntakeDecisionReviewModel };
export type CaptureAssistantView = {
  reference: CaptureAssistantReference; retrievedAt: string;
} & (
  | { kind: 'result'; content: CaptureAssistantReadContent }
  | { kind: 'proposal'; ticket: CaptureAssistantProposalTicket; title: string; content: CaptureAssistantReviewContent; outcome?: string }
);
/** The authenticated host parses wire contracts and applies current evidence/access checks.
 * Stories mock this same client boundary; no alternate card implementation exists. */
export interface CaptureAssistantClient {
  read: (reference: CaptureAssistantReference, signal: AbortSignal) => Promise<CaptureAssistantView>;
  decide: (reference: CaptureAssistantReference, decision: CaptureAssistantProposalDecision, signal: AbortSignal) => Promise<CaptureAssistantView>;
}

import type { CaptureSourceSelectionValue } from '../capture-source-selection/capture-source-selection';
import type { GmailCaptureAccount, GmailCaptureScopeValue } from '../gmail-capture-scope/gmail-capture-scope';
import { validateGmailCaptureRules, type GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
import { validateGmailEmailExample, type GmailEmailExampleValue } from '../gmail-email-example/gmail-email-example.validation';
import type { GmailMappingSample, GmailMappingTarget } from '../gmail-field-mapping/gmail-field-mapping.validation';
import { findingsIssues, type GmailFindingsValue } from '../gmail-field-mapping/gmail-field-mapping.findings';
import { checkGmailSample } from '../gmail-sample-check/gmail-sample-check.validation';
import { validateCaptureLeadWorkflow, type CaptureLeadWorkflowValue, type CaptureWorkflowTeammate } from '../capture-lead-workflow/capture-lead-workflow.validation';
export type GmailSetupPanel = 'account' | 'rules' | 'fields' | 'workflow';
/** Local selection evidence only; the publication service must validate provider provenance independently. */
export type GmailExampleOrigin = { retrievalId?: string; reference: string; accountId: string; accountVersion: number; sourceVersion: number; draftVersion: number; subject: string; body: string };
export type GmailSetupDraft = { exampleOrigin?: GmailExampleOrigin; contactRequired?: boolean; configurationFields?: readonly import('@salesmora/contracts').CaptureField[]; approvedSampleId?: string; selection: CaptureSourceSelectionValue; account: GmailCaptureScopeValue; rules: GmailCaptureRulesValue; example: GmailEmailExampleValue; sample: GmailMappingSample | null; targets: readonly GmailMappingTarget[]; findings: GmailFindingsValue; approvedKey: string | null; workflow: CaptureLeadWorkflowValue };
export type GmailSetupSave = { draftId: string; expectedVersion: number; selection: CaptureSourceSelectionValue; gmail?: Omit<GmailSetupDraft, 'selection'> };
export type GmailSetupSaved = { draftId: string; version: number };
export type GmailExtractionResult = { sample: GmailMappingSample; value: GmailFindingsValue };
export function gmailSetupInputKey(draft: GmailSetupDraft): string { return JSON.stringify([draft.account.accountId, draft.rules, draft.example, draft.targets]); }
/** UI freshness marker only; the server must independently bind/revalidate the reviewed snapshot. */
export function gmailSetupApprovalKey(draft: GmailSetupDraft): string { return JSON.stringify([gmailSetupInputKey(draft), draft.sample, draft.findings]); }
export function gmailExtractionBound(result: GmailExtractionResult, example: GmailEmailExampleValue): boolean {
  return !Object.keys(validateGmailEmailExample(example)).length && !!result.sample.id && Number.isSafeInteger(result.sample.version) && result.sample.version > 0 && result.sample.subject === example.subject && result.sample.body === example.body && result.value.sampleId === result.sample.id && result.value.sampleVersion === result.sample.version;
}
export function gmailSetupIssue(draft: GmailSetupDraft, panel: 'source' | GmailSetupPanel | 'all', accounts: readonly GmailCaptureAccount[], teammates: readonly CaptureWorkflowTeammate[], access = true): 'source' | 'account' | 'access' | 'rules' | 'fields' | 'workflow' | null {
  if (!draft.selection.name.trim() || draft.selection.name.length > 80 || !['gmail', 'website'].includes(draft.selection.source ?? '')) return 'source';
  if (panel === 'source') return draft.selection.source === 'gmail' && !access ? 'access' : null;
  if (draft.selection.source !== 'gmail') return 'source';
  if (!access) return 'access';
  if (!accounts.some(account => account.id === draft.account.accountId && account.status === 'connected')) return 'account';
  if (panel === 'account') return null;
  if (validateGmailCaptureRules(draft.rules).length) return 'rules';
  if (panel === 'rules') return null;
  if (!draft.sample || !gmailExtractionBound({ sample: draft.sample, value: draft.findings }, draft.example) || findingsIssues(draft.findings, draft.targets, draft.sample).length || checkGmailSample(draft.rules, draft.sample).status !== 'matches' || draft.approvedKey !== gmailSetupApprovalKey(draft)) return 'fields';
  if ((panel === 'workflow' || panel === 'all') && Object.keys(validateCaptureLeadWorkflow(draft.workflow, teammates)).length) return 'workflow';
  return null;
}
export function gmailSetupSave(draftId: string, version: number, draft: GmailSetupDraft): GmailSetupSave | null {
  if (!draftId.trim() || !Number.isSafeInteger(version) || version < 1 || gmailSetupIssue(draft, 'source', [], [])) return null;
  const { selection, ...gmail } = draft;
  return structuredClone({ draftId, expectedVersion: version, selection: { ...selection, name: selection.name.trim() }, ...(selection.source === 'gmail' ? { gmail } : {}) });
}

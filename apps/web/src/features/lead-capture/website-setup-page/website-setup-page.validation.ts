import type { CaptureSourceSelectionValue } from '../capture-source-selection/capture-source-selection';
import type { CaptureFormContent } from '../capture-form-content-editor/capture-form-content-editor';
import { validateCaptureFormFields, type CaptureFormFieldEditorValue } from '../capture-form-field-editor/capture-form-field-editor.validation';
import { validateCaptureLeadWorkflow, type CaptureLeadWorkflowValue, type CaptureWorkflowTeammate } from '../capture-lead-workflow/capture-lead-workflow.validation';
export type WebsiteSetupPanel = 'brief' | 'fields' | 'preview' | 'workflow';
export type WebsiteSetupDraft = { selection: CaptureSourceSelectionValue; brief: string; form: CaptureFormFieldEditorValue; content: CaptureFormContent; workflow: CaptureLeadWorkflowValue };
export type WebsiteSetupSave = { draftId: string; expectedVersion: number; selection: CaptureSourceSelectionValue; website?: Omit<WebsiteSetupDraft, 'selection'> };
export type WebsiteSetupSaved = { draftId: string; version: number };
export function websiteSetupIssue(draft: WebsiteSetupDraft, panel: 'source' | WebsiteSetupPanel | 'all', teammates: readonly CaptureWorkflowTeammate[]): 'sourceError' | 'briefError' | 'fieldsError' | 'contentError' | 'workflowError' | null {
  if (!draft.selection.name.trim() || draft.selection.name.length > 80 || !['website', 'gmail'].includes(draft.selection.source ?? '')) return 'sourceError';
  if (panel === 'source') return null;
  if (draft.selection.source !== 'website') return 'sourceError';
  if ((panel === 'brief' || panel === 'all') && (!draft.brief.trim() || draft.brief.length > 2000)) return 'briefError';
  if ((panel === 'fields' || panel === 'preview' || panel === 'all') && validateCaptureFormFields(draft.form).length) return 'fieldsError';
  if ((panel === 'preview' || panel === 'all') && !draft.content.title.trim()) return 'contentError';
  if ((panel === 'workflow' || panel === 'all') && Object.keys(validateCaptureLeadWorkflow(draft.workflow, teammates)).length) return 'workflowError';
  return null;
}
/** A Gmail handoff saves only source identity, never website form/workflow contents. */
export function websiteSetupSave(draftId: string, version: number, draft: WebsiteSetupDraft): WebsiteSetupSave | null {
  if (!draftId.trim() || !Number.isSafeInteger(version) || version < 1 || websiteSetupIssue(draft, 'source', [])) return null;
  const selection = { ...draft.selection, name: draft.selection.name.trim() };
  return structuredClone({ draftId, expectedVersion: version, selection, ...(selection.source === 'website' ? { website: { brief: draft.brief, form: draft.form, content: draft.content, workflow: draft.workflow } } : {}) });
}

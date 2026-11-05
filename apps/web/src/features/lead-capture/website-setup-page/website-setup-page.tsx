'use client';

import { useEffect, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { CaptureSetupHeader, type CaptureSetupDestination } from '../capture-setup-header/capture-setup-header';
import { CaptureSourceSelection } from '../capture-source-selection/capture-source-selection';
import { WebsiteCaptureBrief, type WebsiteCaptureBriefProps } from '../website-capture-brief/website-capture-brief';
import { CaptureFormFieldEditor } from '../capture-form-field-editor/capture-form-field-editor';
import { CaptureFormContentEditor } from '../capture-form-content-editor/capture-form-content-editor';
import { CaptureFormPreview } from '../capture-form-preview/capture-form-preview';
import { CaptureLeadWorkflow } from '../capture-lead-workflow/capture-lead-workflow';
import type { CaptureWorkflowTeammate } from '../capture-lead-workflow/capture-lead-workflow.validation';
import type { VisitorCaptureDefinition } from '../visitor-capture-form/visitor-capture-form.validation';
import { websiteSetupPageData as copy } from './website-setup-page.data';
import { websiteSetupIssue, websiteSetupSave, type WebsiteSetupDraft, type WebsiteSetupPanel, type WebsiteSetupSave, type WebsiteSetupSaved } from './website-setup-page.validation';
export type WebsiteSetupPageProps = {
  draftId: string; version: number; draft: WebsiteSetupDraft; dirty: boolean; step: 'source' | 'intake'; panel: WebsiteSetupPanel;
  canRead: boolean; canEdit: boolean; canSuggest?: boolean; pending?: boolean; revision?: boolean;
  gmailAccess: 'available' | 'upgrade-required' | 'unavailable' | 'loading';
  context: NonNullable<WebsiteCaptureBriefProps['context']>; suggestion?: WebsiteCaptureBriefProps['suggestion']; acceptedSuggestionId?: string; suggesting?: boolean; suggestionError?: string;
  teammates: readonly CaptureWorkflowTeammate[];
  previewContent?: Pick<VisitorCaptureDefinition, 'privacy' | 'consent' | 'submitLabel' | 'thankYou'>;
  previewIdentity: Pick<VisitorCaptureDefinition, 'businessName' | 'businessEmail' | 'businessPhone'>;
  onDraft: (draft: WebsiteSetupDraft) => void; onStep: (step: 'source' | 'intake') => void; onPanel: (panel: WebsiteSetupPanel) => void;
  /** Header calls navigation only after discard confirmation; host restores its saved snapshot. */
  onNavigate: (destination: CaptureSetupDestination) => void;
  onSave: (request: WebsiteSetupSave) => Promise<WebsiteSetupSaved>;
  onReview: (saved: WebsiteSetupSaved) => void; onGmailSetup: (saved: WebsiteSetupSaved) => void;
  onSuggest: WebsiteCaptureBriefProps['onSuggest']; onUseFields: WebsiteCaptureBriefProps['onUseFields']; onReviewPlans?: () => void;
};
const panels = ['brief', 'fields', 'preview', 'workflow'] as const;
export function WebsiteSetupPage(props: WebsiteSetupPageProps) {
  const { draft, step, panel, canRead, canEdit, pending = false, teammates } = props;
  const lock = useRef(false), [working, setWorking] = useState(false), [attempted, setAttempted] = useState(false), [failed, setFailed] = useState(false);
  const session = useRef({ id: props.draftId, canRead, canEdit });
  useEffect(() => { session.current = { id: props.draftId, canRead, canEdit }; }, [props.draftId, canRead, canEdit]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = pending || working || !!props.suggesting;
  const issue = websiteSetupIssue(draft, step === 'source' ? 'source' : panel, teammates) || (step === 'source' && draft.selection.source === 'gmail' && props.gmailAccess !== 'available' ? 'sourceError' : null);
  const update = (patch: Partial<WebsiteSetupDraft>) => { if (canEdit && !busy) props.onDraft({ ...draft, ...patch }); };
  const save = async (): Promise<WebsiteSetupSaved> => {
    const request = websiteSetupSave(props.draftId, props.version, draft);
    if (!canEdit || busy || lock.current || !request) { setAttempted(true); throw new Error(copy.sourceError); }
    lock.current = true; setWorking(true); setFailed(false);
    try {
      const result = await props.onSave(request);
      if (result.draftId !== props.draftId || !Number.isSafeInteger(result.version) || result.version <= props.version) throw new Error(copy.failed);
      return result;
    } finally { lock.current = false; setWorking(false); }
  };
  const next = async () => {
    if (!canEdit || busy || lock.current) return;
    setAttempted(true);
    const finalIssue = step === 'intake' && panel === 'workflow' ? websiteSetupIssue(draft, 'all', teammates) : issue;
    if (finalIssue) return;
    try {
      const saved = await save();
      if (session.current.id !== saved.draftId || !session.current.canRead || !session.current.canEdit) return;
      setAttempted(false);
      if (step === 'source') { if (draft.selection.source === 'gmail') props.onGmailSetup(saved); else { props.onPanel('brief'); props.onStep('intake'); } }
      else if (panel === 'workflow') props.onReview(saved);
      else props.onPanel(panels[panels.indexOf(panel) + 1]);
    } catch { setFailed(true); }
  };
  const displayedIssue = attempted ? step === 'intake' && panel === 'workflow' ? websiteSetupIssue(draft, 'all', teammates) : issue : null;
  const preview: VisitorCaptureDefinition = { ...props.previewContent, ...props.previewIdentity, id: props.draftId, version: props.version, ...draft.form, ...draft.content };
  return <div className="grid min-w-0 gap-6">
    <CaptureSetupHeader name={draft.selection.name} source={draft.selection.source ?? undefined} step={step} completedSteps={step === 'intake' ? ['source'] : []} dirty={props.dirty} revision={props.revision} canEdit={canEdit} pending={busy} continueHint={copy.continueHint}
      onNavigate={props.onNavigate} onSave={async () => { await save(); }} onContinue={() => { void next(); }}>
    {failed && <FormFeedback kind="error" message={copy.failed} />}
    {displayedIssue && <FormFeedback kind="error" message={copy[displayedIssue]} />}
    {step === 'source' ? <CaptureSourceSelection value={draft.selection} canRead canEdit={canEdit && !props.revision} gmailAccess={props.gmailAccess} pending={busy} onChange={selection => update({ selection })} onReviewPlans={props.onReviewPlans} errors={attempted && issue ? { name: copy.sourceError } : undefined} /> : <>
      <div role="group" aria-label={copy.sectionsLabel} className="flex min-w-0 flex-wrap gap-2">{panels.map(key => <button key={key} type="button" disabled={busy} aria-pressed={panel === key} className={`min-h-11 max-w-full cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${panel === key ? 'border-primary bg-primary text-paper' : 'border-line bg-paper text-primary hover:bg-canvas'}`} onClick={() => { setAttempted(false); if (!busy) props.onPanel(key); }}>{copy.sections[key]}</button>)}</div>
      {panel === 'brief' && <WebsiteCaptureBrief canSuggest={props.canSuggest} brief={draft.brief} context={props.context} suggestion={props.suggestion} acceptedSuggestionId={props.acceptedSuggestionId} canRead canEdit={canEdit} pending={busy} error={props.suggestionError} briefError={attempted && issue === 'briefError' ? copy.briefError : undefined} onBriefChange={brief => update({ brief })} onSuggest={props.onSuggest} onUseFields={props.onUseFields} />}
      {panel === 'fields' && <CaptureFormFieldEditor value={draft.form} canRead canEdit={canEdit} pending={busy} showErrors={attempted} onChange={form => update({ form })} />}
      {panel === 'preview' && <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2"><CaptureFormContentEditor value={draft.content} canRead canEdit={canEdit} pending={busy} showErrors={attempted} onChange={content => update({ content })} /><CaptureFormPreview definition={preview} canRead /></div>}
      {panel === 'workflow' && <CaptureLeadWorkflow value={draft.workflow} source="website" teammates={teammates} canRead canEdit={canEdit} pending={busy} showErrors={attempted} onChange={workflow => update({ workflow })} />}
    </>}
    </CaptureSetupHeader>
  </div>;
}

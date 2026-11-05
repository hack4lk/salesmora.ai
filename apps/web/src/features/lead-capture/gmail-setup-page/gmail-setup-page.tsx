'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { CaptureSetupHeader, type CaptureSetupDestination } from '../capture-setup-header/capture-setup-header';
import { CaptureSourceSelection } from '../capture-source-selection/capture-source-selection';
import { GmailCaptureScope, type GmailCaptureScopeProps } from '../gmail-capture-scope/gmail-capture-scope';
import { GmailCaptureRules } from '../gmail-capture-rules/gmail-capture-rules';
import { GmailEmailExample, type GmailEmailExampleProps } from '../gmail-email-example/gmail-email-example';
import { GmailFieldMapping } from '../gmail-field-mapping/gmail-field-mapping';
import { findingsIssues, type GmailFindingsMessage, type GmailFindingsValue } from '../gmail-field-mapping/gmail-field-mapping.findings';
import { checkGmailSample } from '../gmail-sample-check/gmail-sample-check.validation';
import { CaptureLeadWorkflow } from '../capture-lead-workflow/capture-lead-workflow';
import type { CaptureWorkflowTeammate } from '../capture-lead-workflow/capture-lead-workflow.validation';
import { gmailSetupPageData as copy } from './gmail-setup-page.data';
import { gmailSetupApprovalKey, gmailSetupInputKey, gmailSetupIssue, gmailSetupSave, gmailExtractionBound, type GmailExtractionResult, type GmailSetupDraft, type GmailSetupPanel, type GmailSetupSave, type GmailSetupSaved } from './gmail-setup-page.validation';
export type GmailSetupExtractionRequest = { draftId: string; draftVersion: number; accountId: string; inputKey: string; example: GmailSetupDraft['example']; rules: GmailSetupDraft['rules']; targets: GmailSetupDraft['targets'] };
export type GmailSetupAssistantResult = { value: GmailFindingsValue; targets: GmailSetupDraft['targets']; reply: string; suggestions?: readonly string[] };
export type GmailSetupPageProps = {
  draftId: string; version: number; draft: GmailSetupDraft; dirty: boolean; step: 'source' | 'intake'; panel: GmailSetupPanel; screen: 'example' | 'findings';
  onRequestExtract?: () => void;
  onRequestAssistant?: (message: string) => void;
  onApproveSample?: (draft: GmailSetupDraft) => Promise<void>;
  connectionAvailable?: boolean; sampleSetupAvailable?: boolean;
  mailbox?: GmailEmailExampleProps['mailbox']; mailboxNotice?: string; extractionAvailable?: boolean;
  canRead: boolean; canEdit: boolean; pending?: boolean; revision?: boolean;
  accounts: GmailCaptureScopeProps['accounts']; accountsStatus: NonNullable<GmailCaptureScopeProps['accountsStatus']>; gmailAccess: GmailCaptureScopeProps['gmailAccess']; connectionError?: string;
  teammates: readonly CaptureWorkflowTeammate[]; messages: readonly GmailFindingsMessage[]; suggestions?: readonly string[];
  onDraft: (draft: GmailSetupDraft) => void; onStep: (step: 'source' | 'intake') => void; onPanel: (panel: GmailSetupPanel) => void; onScreen: (screen: 'example' | 'findings') => void; onNavigate: (destination: CaptureSetupDestination) => void;
  onSave: (request: GmailSetupSave) => Promise<GmailSetupSaved>; onReview: (saved: GmailSetupSaved) => void; onWebsiteSetup: (saved: GmailSetupSaved) => void;
  onExtract: (request: GmailSetupExtractionRequest) => Promise<GmailExtractionResult>;
  onAssistant: (message: string, snapshot: GmailFindingsValue) => Promise<GmailSetupAssistantResult>; onMessages: (messages: readonly GmailFindingsMessage[]) => void; onSuggestions: (suggestions: readonly string[]) => void;
  onConnect: () => void; onReconnect: (id: string) => void; onRetryAccounts: () => void; onReviewPlans?: () => void;
  onSelectAccount?: (id: string) => void; onDisconnect?: (id: string) => void;
  accountCapabilities?: { canConnect: boolean; canSelect: boolean; canDisconnect: boolean };
};
const panels = ['account', 'rules', 'fields', 'workflow'] as const;
export function GmailSetupPage(props: GmailSetupPageProps) {
  const { draft, canRead, canEdit, step, panel, screen } = props;
  const tabsId = useId();
  const tabList = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null), previousView = useRef(`${step}:${panel}:${screen}`);
  useEffect(() => {
    const view = `${step}:${panel}:${screen}`;
    if (view !== previousView.current && !tabList.current?.contains(document.activeElement)) { const heading = host.current?.querySelector('h2'); heading?.setAttribute('tabindex', '-1'); heading?.focus(); }
    previousView.current = view;
  }, [step, panel, screen]);
  const lock = useRef(false), [working, setWorking] = useState(false), [attempted, setAttempted] = useState(false), [failed, setFailed] = useState(false);
  const inputKey = gmailSetupInputKey(draft), availability = JSON.stringify([props.accounts, props.accountsStatus, props.gmailAccess]), reviewKey = JSON.stringify([draft.sample, draft.findings]);
  const session = useRef({ id: props.draftId, key: inputKey, availability, reviewKey, canRead, canEdit });
  useEffect(() => { session.current = { id: props.draftId, key: inputKey, availability, reviewKey, canRead, canEdit }; }, [props.draftId, inputKey, availability, reviewKey, canRead, canEdit]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = !!props.pending || working, access = props.gmailAccess === 'available' && props.accountsStatus === 'ready';
  const canReviewFindings = draft.sample && draft.findings.findings.length > 0
    && gmailExtractionBound({ sample: draft.sample, value: draft.findings }, draft.example);
  const issue = gmailSetupIssue(draft, step === 'source' ? 'source' : panel, props.accounts, props.teammates, access);
  const current = () => session.current.id === props.draftId && session.current.key === inputKey && session.current.availability === availability && session.current.canRead && session.current.canEdit;
  const update = (patch: Partial<GmailSetupDraft>, invalidate = true) => { if (canEdit && !busy) props.onDraft({ ...draft, ...patch, ...(invalidate ? { approvedKey: null } : {}) }); };
  const save = async (next = draft): Promise<GmailSetupSaved> => {
    const request = gmailSetupSave(props.draftId, props.version, next);
    if (!request) throw new Error(copy.failed);
    const result = await props.onSave(request);
    if (result.draftId !== props.draftId || !Number.isSafeInteger(result.version) || result.version <= props.version) throw new Error(copy.failed);
    return result;
  };
  const run = async (operation: () => Promise<void>) => { if (!canEdit || busy || lock.current) return; lock.current = true; setWorking(true); try { await operation(); } finally { lock.current = false; setWorking(false); } };
  const next = async () => {
    setAttempted(true);
    if (gmailSetupIssue(draft, step === 'intake' && panel === 'workflow' ? 'all' : step === 'source' ? 'source' : panel, props.accounts, props.teammates, access)) return;
    try { await run(async () => { const saved = await save(); if (!current()) return; setAttempted(false); setFailed(false); if (step === 'source') { if (draft.selection.source === 'website') props.onWebsiteSetup(saved); else { props.onPanel('account'); props.onStep('intake'); } } else if (panel === 'workflow') props.onReview(saved); else props.onPanel(panels[panels.indexOf(panel) + 1]); }); } catch { setFailed(true); }
  };
  return <div ref={host} className="grid min-w-0 gap-6">
    <CaptureSetupHeader name={draft.selection.name} source={draft.selection.source ?? undefined} step={step} completedSteps={step === 'intake' ? ['source'] : []} dirty={props.dirty} revision={props.revision} canEdit={canEdit} pending={busy} continueHint={step === 'intake' && panel === 'fields' ? copy.fieldsHint : copy.hint} continueDisabled={step === 'intake' && panel === 'fields' && (screen === 'example' || !!issue)} onNavigate={props.onNavigate}
      onSave={async () => { await run(async () => { await save(); setFailed(false); }); }} onContinue={() => { void next(); }}>
    {failed && <FormFeedback kind="error" message={copy.failed} />}{attempted && issue && <FormFeedback kind="error" message={copy.issues[issue]} />}
    {step === 'source' ? <CaptureSourceSelection value={draft.selection} canRead canEdit={canEdit && !props.revision} gmailAccess={props.gmailAccess} pending={busy} onChange={selection => update({ selection }, false)} onReviewPlans={props.onReviewPlans} /> : <div className="min-w-0">
      <div ref={tabList} role="tablist" aria-label={copy.panelsLabel} className="flex min-w-0 border-b border-primary/35">{panels.map(key => <button key={key} id={`${tabsId}-${key}`} role="tab" type="button" disabled={busy} aria-selected={key === panel} aria-controls={`${tabsId}-panel`} tabIndex={key === panel ? 0 : -1}
        className={`relative min-h-12 min-w-0 flex-1 cursor-pointer rounded-t-xl border-x border-t border-b-[3px] px-0.5 py-3 text-center text-base leading-tight font-bold wrap-anywhere focus-visible:z-10 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xl ${key === panel ? 'border-primary/35 border-b-primary bg-paper text-primary' : 'border-transparent text-ink hover:bg-paper/60'}`}
        onClick={() => { if (!busy && key !== panel) { setAttempted(false); props.onPanel(key); } }}
        onKeyDown={event => {
          if (busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const tabs = tabList.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
          const index = panels.indexOf(key);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + panels.length) % panels.length;
          tabs?.[next]?.focus();
          tabs?.[next]?.click();
        }}>{copy.panels[key]}</button>)}</div>
      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${panel}`} tabIndex={0} className="grid min-w-0 gap-6 rounded-b-2xl border-x border-b border-primary/35 bg-paper p-2 focus-visible:focus-ring sm:p-4 lg:p-6">
        {panel === 'account' && <GmailCaptureScope {...props.accountCapabilities} onDisconnect={props.onDisconnect} connectionAvailable={props.connectionAvailable} value={draft.account} accounts={props.accounts} accountsStatus={props.accountsStatus} gmailAccess={props.gmailAccess} canRead canEdit={canEdit} pending={busy} showErrors={attempted} connectionError={props.connectionError} onChange={account => { if (account.accountId && props.onSelectAccount) props.onSelectAccount(account.accountId); else update({ account }); }} onConnect={props.onConnect} onReconnect={props.onReconnect} onRetryAccounts={props.onRetryAccounts} onReviewPlans={props.onReviewPlans} />}
        {panel === 'rules' && <GmailCaptureRules value={draft.rules} canRead canEdit={canEdit} pending={busy} showErrors={attempted} onChange={rules => update({ rules })} />}
        {panel === 'fields' && props.sampleSetupAvailable === false && <p role="status" className="m-0 rounded-xl border border-line bg-paper p-5 text-sm text-muted">{copy.sampleUnavailable}</p>}
        {panel === 'fields' && props.mailboxNotice && <p role="status" className="m-0 text-sm text-muted">{props.mailboxNotice}</p>}
        {panel === 'fields' && props.sampleSetupAvailable !== false && (screen === 'example' || !draft.sample ? <GmailEmailExample canExtract={props.extractionAvailable} mailbox={props.mailbox} value={draft.example} canRead canEdit={canEdit} pending={busy} onReviewFindings={canReviewFindings ? () => props.onScreen('findings') : undefined} onChange={example => update({ example, exampleOrigin: undefined, sample: null, findings: { sampleId: '', sampleVersion: 0, findings: [] }, approvedSampleId: undefined })} onExtract={async example => { if (props.onRequestExtract) { props.onRequestExtract(); return; } await run(async () => {
          if (gmailSetupIssue(draft, 'rules', props.accounts, props.teammates, access)) throw new Error(copy.issues.account);
          const result = await props.onExtract(structuredClone({ draftId: props.draftId, draftVersion: props.version, accountId: draft.account.accountId!, inputKey, example, rules: draft.rules, targets: draft.targets }));
          if (!current() || !gmailExtractionBound(result, example)) throw new Error(copy.issues.fields);
          props.onDraft({ ...draft, example, sample: result.sample, findings: result.value, approvedKey: null }); props.onScreen('findings');
        }); }} /> : <GmailFieldMapping approvalConfirmed={draft.approvedKey === gmailSetupApprovalKey(draft)} value={draft.findings} targets={draft.targets} sample={draft.sample} rules={draft.rules} messages={props.messages} suggestions={props.suggestions} canRead canEdit={canEdit} pending={busy}
          onChange={findings => update({ findings })} onBack={() => { if (!busy) props.onScreen('example'); }}
          onSend={async (message, value) => { if (props.onRequestAssistant) { props.onRequestAssistant(message); return; } await run(async () => { const result = await props.onAssistant(message, structuredClone(value)); if (!current() || session.current.reviewKey !== reviewKey || result.value.sampleId !== draft.sample!.id || result.value.sampleVersion !== draft.sample!.version) throw new Error(copy.issues.fields); props.onDraft({ ...draft, findings: result.value, targets: result.targets, approvedKey: null }); props.onMessages([...props.messages, { id: crypto.randomUUID(), role: 'user', text: message }, { id: crypto.randomUUID(), role: 'assistant', text: result.reply }]); props.onSuggestions(result.suggestions ?? []); }); }}
          onApprove={async approval => { await run(async () => {
            if (JSON.stringify(approval) !== JSON.stringify({ value: draft.findings, sample: draft.sample, targets: draft.targets, rules: draft.rules }) || findingsIssues(draft.findings, draft.targets, draft.sample).length || checkGmailSample(draft.rules, draft.sample).status !== 'matches') throw new Error(copy.issues.fields);
            if (props.onApproveSample) { await props.onApproveSample(structuredClone(draft)); return; }
            const approved = { ...draft, approvedKey: gmailSetupApprovalKey(draft) };
            if (gmailSetupIssue(approved, 'fields', props.accounts, props.teammates, access)) throw new Error(copy.issues.fields);
            await save(approved); if (!current()) return; props.onDraft(approved); props.onPanel('workflow'); setAttempted(false);
          }); }} />)}
        {panel === 'workflow' && <CaptureLeadWorkflow value={draft.workflow} source="gmail" teammates={props.teammates} canRead canEdit={canEdit} pending={busy} showErrors={attempted} onChange={workflow => update({ workflow }, false)} />}
      </div>
    </div>}
    </CaptureSetupHeader>
  </div>;
}

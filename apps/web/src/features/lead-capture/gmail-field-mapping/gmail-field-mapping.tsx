'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, HelpTooltip, StatusBadge, SubmitButton } from '@salesmora/ui';
import type { GmailMappingSample, GmailMappingTarget } from './gmail-field-mapping.validation';
import { findingsIssues, type GmailFinding, type GmailFindingsApproval, type GmailFindingsMessage, type GmailFindingsValue } from './gmail-field-mapping.findings';
import { gmailFieldMappingData as data } from './gmail-field-mapping.data';
import { GmailFieldSetupProgress } from '../gmail-field-setup-progress/gmail-field-setup-progress';
import { GmailSampleCheck } from '../gmail-sample-check/gmail-sample-check';
import { checkGmailSample } from '../gmail-sample-check/gmail-sample-check.validation';
import type { GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
const copy = data.findings;
export type GmailFieldMappingProps = {
  value: GmailFindingsValue; targets: readonly GmailMappingTarget[]; sample: GmailMappingSample | null;
  rules: GmailCaptureRulesValue;
  messages: readonly GmailFindingsMessage[]; suggestions?: readonly string[];
  readOnlyMessage?: string;
  canRead: boolean; canEdit: boolean; pending?: boolean;
  /** The connected host restores only a server-retained approval for this exact input key. */
  approvalConfirmed?: boolean;
  onChange: (value: GmailFindingsValue) => void;
  /** Return to the example screen; the host preserves the sample and draft. */
  onBack: () => void;
  onSend: (message: string, snapshot: GmailFindingsValue) => Promise<void>;
  onApprove: (snapshot: GmailFindingsApproval) => Promise<void>;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function Approval({ disabled, onApprove }: { disabled: boolean; onApprove: () => void }) {
  const [checked, setChecked] = useState(false);
  return <div className="grid gap-4"><label className="flex min-h-11 items-start gap-3 text-sm leading-6"><input type="checkbox" checked={checked} disabled={disabled} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => setChecked(event.target.checked)} /><span>{copy.confirm}</span></label>
    <button type="button" className="min-h-11 max-w-full justify-self-start cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled || !checked} onClick={() => { if (checked && !disabled) onApprove(); }}>{copy.approve}</button></div>;
}
/** Screen two: structured draft findings with a host-driven assistant, never email-driven tool execution. */
export function GmailFieldMapping({ readOnlyMessage, value, targets, sample, rules, messages, suggestions = [], canRead, canEdit, pending = false, approvalConfirmed = false, onChange, onBack, onSend, onApprove }: GmailFieldMappingProps) {
  const id = useId();
  const [draft, setDraft] = useState(''), [working, setWorking] = useState<'send' | 'approve' | null>(null), [failure, setFailure] = useState<'send' | 'approve' | null>(null), [approved, setApproved] = useState<string | null>(null);
  const returnFocus = useRef(false);
  const lock = useRef(false), composer = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!working && !pending && returnFocus.current) { returnFocus.current = false; composer.current?.focus(); } }, [working, pending]);
  if (!canRead) return <FormFeedback kind="error" message={data.denied} />;
  const busy = pending || !!working, disabled = !canEdit || busy;
  const issues = findingsIssues(value, targets, sample);
  const sampleMatches = checkGmailSample(rules, sample).status === 'matches';
  const signature = JSON.stringify([value, sample, targets, rules]);
  const isApproved = approvalConfirmed || approved === signature;
  const patch = (finding: GmailFinding, next: Partial<GmailFinding>) => {
    if (disabled) return; setApproved(null); setFailure(null);
    onChange({ ...value, findings: value.findings.map(field => field.id === finding.id ? { ...field, ...next } : field) });
  };
  const send = async (message: string) => {
    if (disabled || lock.current || !message.trim() || message.length > 4000) return;
    const clearDraft = message.trim() === draft.trim();
    lock.current = true; setWorking('send'); setFailure(null);
    try { await onSend(message.trim(), structuredClone(value)); if (clearDraft) setDraft(''); }
    catch { setFailure('send'); }
    finally { lock.current = false; returnFocus.current = true; setWorking(null); }
  };
  const approve = async () => {
    if (disabled || lock.current || issues.length || !sample || !sampleMatches || isApproved) return;
    lock.current = true; setWorking('approve'); setFailure(null);
    try { await onApprove(structuredClone({ value, sample, targets, rules })); setApproved(signature); }
    catch { setFailure('approve'); }
    finally { lock.current = false; setWorking(null); }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void send(draft); };
  return <section className="grid min-w-0 items-start gap-6 text-ink lg:grid-cols-2">
    <section aria-labelledby={`${id}-assistant`} className="grid min-w-0 gap-5 rounded-2xl border border-assistant-border bg-assistant-surface text-assistant-foreground p-4 sm:p-6">
      <header><h3 id={`${id}-assistant`} className="m-0 text-lg font-semibold">{copy.assistant}</h3><p className="mb-0 mt-2 text-sm leading-6 text-assistant-muted">{copy.assistantIntro}</p></header>
      <div role="log" aria-label={copy.assistant} aria-live="polite" aria-relevant="additions text" className="grid min-w-0 gap-3">{messages.map(message => <article key={message.id} className={`min-w-0 rounded-xl border border-assistant-border p-4 ${message.role === 'user' ? 'bg-assistant-header' : 'bg-assistant-message'}`}><p className="mb-2 mt-0 text-xs font-semibold text-assistant-muted">{message.role === 'user' ? copy.user : copy.agent}</p><p className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{message.text}</p></article>)}</div>
      {canEdit && <div className="flex flex-wrap gap-2">{[copy.add, copy.explain, ...suggestions].map(text => <button key={text} type="button" className={button} disabled={disabled || value.findings.length >= 50 && text === copy.add} onClick={() => { void send(text === copy.add ? copy.addPrompt : text === copy.explain ? copy.explainPrompt : text); }}>{text}</button>)}</div>}
      {(working === 'send' || pending) && <p role="status" className="m-0 text-sm font-semibold text-assistant-accent">{copy.thinking}</p>}
      {failure === 'send' && <FormFeedback kind="error" message={copy.sendFailure} />}
      {canEdit && <form onSubmit={submit} className="grid min-w-0 gap-3"><label className="grid min-w-0 gap-2 text-sm font-semibold text-assistant-foreground">{copy.composer}
        <textarea ref={composer} value={draft} disabled={disabled} rows={3} maxLength={4000} className="w-full min-w-0 resize-y rounded-xl border border-assistant-border bg-assistant-message p-3 text-base font-normal leading-6 text-assistant-foreground focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:opacity-50" onChange={event => setDraft(event.target.value)} />
      </label><div className="justify-self-start"><SubmitButton label={copy.send} pendingLabel={copy.thinking} pending={working === 'send'} disabled={disabled || !draft.trim()} /></div></form>}
    </section>
    <div className="grid min-w-0 gap-6">
      <GmailFieldSetupProgress step="findings" pending={busy} onBack={() => { if (!busy && !lock.current) onBack(); }} />
      <header className="flex min-w-0 items-center gap-1">
        <h2 className="m-0 min-w-0 text-xl font-semibold wrap-anywhere">{data.title}</h2>
        {sample && <HelpTooltip label={data.exampleHelpLabel} paragraphs={[sample.retrievalId ? data.retrievedExample : data.pastedExample]} />}
      </header>
      {!canEdit && <p className="m-0 text-sm text-muted">{readOnlyMessage ?? data.readOnly}</p>}
      <GmailSampleCheck rules={rules} sample={sample} canRead={canRead} />
      {sample && <details className="min-w-0 rounded-xl border border-line bg-paper p-4 text-ink"><summary className="min-h-11 cursor-pointer rounded-lg text-sm font-semibold focus-visible:focus-ring">{data.original}</summary><p className="mb-0 mt-3 text-sm font-semibold wrap-anywhere">{sample.subject}</p><p className="mb-0 mt-3 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{sample.body}</p></details>}
      <section aria-labelledby={`${id}-fields`} className="grid min-w-0 gap-4"><div className="flex min-w-0 items-center justify-between gap-3"><h3 id={`${id}-fields`} className="m-0 text-lg font-semibold">{copy.cards}</h3><p className="m-0 shrink-0 text-sm text-muted">{copy.count(value.findings.filter(field => field.included).length)}</p></div>
        {value.findings.map((finding, index) => {
          const target = targets.find(item => item.id === finding.fieldId), name = target?.label || data.choose;
          const fieldIssues = issues.filter(issue => issue.fieldId === finding.id);
          const edited = finding.sampleValue !== finding.suggestedValue;
          const label = !finding.included ? data.excluded : edited ? finding.evidence ? copy.edited : copy.userAdded : finding.confidence === 'uncertain' ? copy.uncertain : finding.confidence === 'missing' ? copy.missing : copy.found;
          return <section role="group" aria-labelledby={`${id}-field-${index}`} key={finding.id} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-h-11 min-w-0 flex-wrap items-center gap-3"><h4 id={`${id}-field-${index}`} className="m-0 text-base font-semibold wrap-anywhere">{name}</h4>
                <StatusBadge label={label} tone={!finding.included ? 'neutral' : fieldIssues.length || finding.confidence !== 'found' && !edited ? 'warning' : 'info'} /></div>
              <label className="flex min-h-11 shrink-0 items-center gap-3 text-sm"><input type="checkbox" checked={finding.included} disabled={disabled} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => patch(finding, { included: event.target.checked })} />{copy.include}</label>
            </div>
            <div className={`grid min-w-0 items-start gap-3 ${finding.evidence ? 'lg:grid-cols-2' : ''}`}>
              <MuiTextField label={copy.value} value={finding.sampleValue} disabled={disabled || !finding.included} multiline minRows={1} fullWidth size="small" variant="outlined" className={fieldClasses}
                slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => patch(finding, { sampleValue: event.target.value })} />
              {finding.evidence && <div className="min-w-0 rounded-xl bg-canvas p-3"><p className="m-0 text-xs font-semibold text-muted">{data.evidence}</p><blockquote className="mb-0 ml-0 mr-0 mt-2 border-l-2 border-primary/20 pl-3 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{finding.evidence.text}</blockquote></div>}
            </div>
            <details className="min-w-0"><summary className="min-h-11 cursor-pointer rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.future}</summary><div className="grid min-w-0 gap-4 pt-3">
              <MuiTextField label={copy.instruction} value={finding.instruction} disabled={disabled || !finding.included} multiline minRows={3} fullWidth size="small" variant="outlined" className={fieldClasses} helperText={copy.instructionHint} slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => patch(finding, { instruction: event.target.value })} />
              <label className="flex min-h-11 items-start gap-3 text-sm leading-6"><input type="checkbox" checked={!!target?.required || finding.required} disabled={disabled || !finding.included || !!target?.required} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => patch(finding, { required: event.target.checked })} /><span>{copy.required}</span></label><p className="m-0 text-sm leading-6 text-muted">{copy.requiredHint}</p>
              <MuiTextField label={data.field} select fullWidth size="small" variant="outlined" className={fieldClasses} value={finding.fieldId} disabled={disabled || !finding.included} slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => patch(finding, { fieldId: event.target.value })}>
                <option value="">{data.choose}</option>{finding.fieldId && !target && <option value={finding.fieldId} disabled>{data.removed}</option>}{targets.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </MuiTextField>
            </div></details>
            {fieldIssues.length > 0 && <p className="m-0 text-sm leading-6 text-error">{[...new Set(fieldIssues.map(issue => issue.message))].join(' ')}</p>}
          </section>;
        })}
      </section>
      <section className="grid gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        {issues.filter(issue => !issue.fieldId).map(issue => <p key={issue.message} role="alert" className="m-0 text-sm text-error">{issue.message}</p>)}
        {working === 'approve' && <p role="status" className="m-0 text-sm font-semibold text-primary-dark">{copy.approving}</p>}
        {failure === 'approve' && <FormFeedback kind="error" message={copy.approveFailure} />}
        {isApproved && <FormFeedback kind="success" message={copy.approved} />}
        {canEdit && <Approval key={signature} disabled={disabled || !!issues.length || !sampleMatches || isApproved} onApprove={() => { void approve(); }} />}
      </section>
    </div>
  </section>;
}

'use client';

import { useId, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, TextField } from '@salesmora/ui';
import { captureLeadWorkflowData as copy } from './capture-lead-workflow.data';
import { captureWorkflowTags, validateCaptureLeadWorkflow, type CaptureLeadWorkflowValue, type CaptureWorkflowTeammate } from './capture-lead-workflow.validation';

export type CaptureLeadWorkflowProps = {
  value: CaptureLeadWorkflowValue; source: 'website' | 'gmail'; teammates: readonly CaptureWorkflowTeammate[];
  teammatesState?: 'ready' | 'loading' | 'error'; canRead: boolean; canEdit: boolean; readOnlyMessage?: string; pending?: boolean; showErrors?: boolean;
  onChange: (value: CaptureLeadWorkflowValue) => void; onRetryTeammates?: () => void;
};
/** Controlled source draft. Saving and applying settings belong to the setup host. */
export function CaptureLeadWorkflow({ value, source, teammates, teammatesState = 'ready', canRead, canEdit, pending = false, showErrors = false, onChange, onRetryTeammates, readOnlyMessage = copy.readOnly }: CaptureLeadWorkflowProps) {
  const id = useId(), [touched, setTouched] = useState(false);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const disabled = !canEdit || pending, ready = teammatesState === 'ready';
  const errors = validateCaptureLeadWorkflow(value, teammates, ready), invalid = Object.keys(errors).length > 0;
  const teammate = teammates.find(member => member.id === value.teammateId);
  const tags = captureWorkflowTags(value.tagsText);
  const error = (key: keyof CaptureLeadWorkflowValue) => showErrors || touched ? errors[key] : undefined;
  const change = (next: CaptureLeadWorkflowValue) => { if (!disabled) { setTouched(true); onChange(next); } };
  return <section className="grid min-w-0 items-start gap-6 text-ink lg:grid-cols-2">
    <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></header>
      {!canEdit && <p className="m-0 text-sm text-muted">{readOnlyMessage}</p>}
      <fieldset disabled={disabled} aria-describedby={`${id}-assignment-help`} className="m-0 grid min-w-0 gap-3 border-0 p-0">
        <legend className="mb-3 text-base font-semibold">{copy.assignment}</legend>
        {(['default', 'teammate'] as const).map(mode => <label key={mode} className={`flex min-h-11 min-w-0 items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${value.assignment === mode ? 'border-primary bg-primary/10 text-primary-dark' : 'border-line bg-paper'}`}>
          <input type="radio" name={`${id}-assignment`} value={mode} checked={value.assignment === mode} disabled={disabled || mode === 'teammate' && (!ready || !teammates.length) && value.assignment !== 'teammate'} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => change({ ...value, assignment: mode, teammateId: mode === 'default' ? '' : value.teammateId })} />{mode === 'default' ? copy.defaultAssignment : copy.teammateAssignment}
        </label>)}
        <p id={`${id}-assignment-help`} className="m-0 text-sm leading-6 text-muted">{value.assignment === 'teammate' ? copy.teammateHint : copy.defaultHint}</p>
        {value.assignment === 'teammate' && <MuiTextField label={copy.teammate} select required fullWidth size="small" variant="outlined" className={fieldClasses} value={value.teammateId} disabled={disabled || !ready} error={!!error('teammateId')} helperText={error('teammateId')}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => change({ ...value, teammateId: event.target.value })}>
          <option value="">{copy.choose}</option>{value.teammateId && !teammate && <option value={value.teammateId} disabled>{copy.unavailable}</option>}{teammates.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
        </MuiTextField>}
        {teammatesState === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
        {teammatesState === 'error' && <div className="grid gap-3"><p role="alert" className="m-0 text-sm text-error">{copy.loadError}</p>{onRetryTeammates && <button type="button" disabled={disabled} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { if (!disabled) onRetryTeammates(); }}>{copy.retry}</button>}</div>}
        {canEdit && ready && !teammates.length && <p className="m-0 text-sm leading-6 text-muted">{copy.empty}</p>}
      </fieldset>
      <MuiTextField label={copy.stage} select required fullWidth size="small" variant="outlined" className={fieldClasses} value={value.stage} disabled={disabled} error={!!error('stage')} helperText={error('stage')}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => change({ ...value, stage: event.target.value as CaptureLeadWorkflowValue['stage'] })}>
        {!copy.stages.some(stage => stage.value === value.stage) && <option value={value.stage} disabled>{copy.errors.stage}</option>}{copy.stages.map(stage => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
      </MuiTextField>
      <TextField label={copy.tags} value={value.tagsText} disabled={disabled} error={!!error('tagsText')} helperText={error('tagsText') || copy.tagsHint} slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }} onBlur={() => setTouched(true)} onChange={event => change({ ...value, tagsText: event.target.value })} />
      <div className="grid gap-2"><label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={value.notifyAssigned} disabled={disabled} aria-describedby={`${id}-notify-help`} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => change({ ...value, notifyAssigned: event.target.checked })} />{copy.notify}</label><p id={`${id}-notify-help`} className="m-0 text-sm leading-6 text-muted">{copy.notifyHint}</p></div>
      {(showErrors || touched) && invalid && <FormFeedback kind="error" title={copy.errors.title} message={[...new Set(Object.values(errors))].join(' ')} />}
    </section>
    <section aria-labelledby={`${id}-summary`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <h2 id={`${id}-summary`} className="m-0 text-base font-semibold">{copy.summary}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{copy.applied[source]}</p>
      {invalid ? <p className="m-0 text-sm leading-6 text-muted">{copy.incomplete}</p> : <dl className="m-0 grid min-w-0 gap-3">{[
        [copy.summaryAssignment, value.assignment === 'default' ? copy.defaultAssignment : teammate!.name],
        [copy.summaryStage, copy.stages.find(stage => stage.value === value.stage)!.label],
        [copy.summaryNotify, value.notifyAssigned ? copy.enabled : copy.disabled],
      ].map(([label, text]) => <div key={label} className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-3"><dt className="text-xs font-semibold text-muted">{label}</dt><dd className="m-0 text-sm font-semibold leading-6 wrap-anywhere">{text}</dd></div>)}
        <div className="grid min-w-0 gap-2 rounded-xl border border-line bg-canvas p-3"><dt className="text-xs font-semibold text-muted">{copy.summaryTags}</dt><dd className="m-0">{tags.length ? <ul role="list" className="m-0 flex min-w-0 list-none flex-wrap gap-2 p-0">{tags.map(tag => <li key={tag.toLowerCase()} className="min-w-0 rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold wrap-anywhere">{tag}</li>)}</ul> : <span className="text-sm font-semibold">{copy.noTags}</span>}</dd></div>
      </dl>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.duplicate}</p>
    </section>
  </section>;
}

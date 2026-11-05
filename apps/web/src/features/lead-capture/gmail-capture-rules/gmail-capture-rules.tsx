'use client';

import { useEffect, useId, useRef, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { DeleteOutlineOutlined, fieldClasses, FormFeedback, TextField } from '@salesmora/ui';
import { gmailCaptureRulesData as copy } from './gmail-capture-rules.data';
import { validateGmailCaptureRules, type GmailCaptureRulesValue } from './gmail-capture-rules.validation';

export type GmailCaptureRulesProps = {
  value: GmailCaptureRulesValue;
  canRead: boolean; canEdit: boolean; pending?: boolean; showErrors?: boolean;
  onChange: (value: GmailCaptureRulesValue) => void;
};
const button = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function GmailCaptureRules({ value, canRead, canEdit, pending = false, showErrors = false, onChange }: GmailCaptureRulesProps) {
  const id = useId();
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fields = useRef(new Map<string, HTMLDivElement>());
  const add = useRef<HTMLButtonElement>(null);
  const focus = useRef<string | null>(null);
  useEffect(() => {
    if (focus.current === null) return;
    if (focus.current === '') add.current?.focus();
    else fields.current.get(focus.current)?.querySelector('input')?.focus();
    focus.current = null;
  }, [value]);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const disabled = !canEdit || pending;
  const issues = validateGmailCaptureRules(value);
  const change = (next: GmailCaptureRulesValue) => { if (!disabled) onChange(next); };
  const locationError = showErrors && issues.some(issue => issue.message === copy.errors.location);
  const modeError = showErrors && issues.some(issue => issue.message === copy.errors.mode);
  return <section className="grid min-w-0 items-start gap-6 text-ink lg:grid-cols-2">
    <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <div><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></div>
      {!canEdit && <p className="m-0 text-sm text-muted">{copy.readOnly}</p>}
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <MuiTextField label={copy.location} select fullWidth size="small" variant="outlined" className={fieldClasses} value={value.location} disabled={disabled}
          error={!!locationError} helperText={locationError ? copy.errors.location : undefined}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }}
          onChange={event => change({ ...value, location: event.target.value as GmailCaptureRulesValue['location'] })}>
          {Object.entries(copy.locations).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
        </MuiTextField>
        <MuiTextField label={copy.mode} select fullWidth size="small" variant="outlined" className={fieldClasses} value={value.mode} disabled={disabled}
          error={!!modeError} helperText={modeError ? copy.errors.mode : undefined}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }}
          onChange={event => change({ ...value, mode: event.target.value as GmailCaptureRulesValue['mode'] })}>
          {Object.entries(copy.modes).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
        </MuiTextField>
      </div>
      {value.location === 'both' && <p className="m-0 text-sm leading-6 text-muted">{copy.bothHint}</p>}
      <fieldset disabled={disabled} className="m-0 grid min-w-0 gap-4 border-0 p-0" aria-describedby={`${id}-hint`}>
        <legend className="mb-3 text-base font-semibold">{copy.phrases}</legend>
        <p id={`${id}-hint`} className="m-0 text-sm leading-6 text-muted">{copy.hint}</p>
        {value.phrases.map((phrase, index) => {
          const error = showErrors || touched.has(phrase.id) ? issues.find(issue => issue.phraseId === phrase.id)?.message : undefined;
          return <div key={phrase.id} className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1" ref={element => { if (element) fields.current.set(phrase.id, element); else fields.current.delete(phrase.id); }}>
              <TextField label={copy.phrase(index + 1)} required value={phrase.text} placeholder={copy.placeholder} error={!!error} helperText={error}
                slotProps={{ htmlInput: { maxLength: 200 }, input: { className: 'has-focus-visible:focus-ring' } }}
                onBlur={() => setTouched(current => new Set(current).add(phrase.id))}
                onChange={event => change({ ...value, phrases: value.phrases.map(item => item.id === phrase.id ? { ...item, text: event.target.value } : item) })} />
            </div>
            {canEdit && <button type="button" disabled={disabled || value.phrases.length <= 1} aria-label={copy.remove(index + 1)} title={copy.remove(index + 1)} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => {
              if (disabled || value.phrases.length <= 1) return;
              focus.current = value.phrases[index + 1]?.id ?? value.phrases[index - 1]?.id ?? '';
              change({ ...value, phrases: value.phrases.filter(item => item.id !== phrase.id) });
            }}><DeleteOutlineOutlined aria-hidden="true" className="size-5" /></button>}
          </div>;
        })}
        {canEdit && <div><button ref={add} type="button" disabled={disabled || value.phrases.length >= 20} className={button} onClick={() => {
          if (disabled || value.phrases.length >= 20) return;
          const phrase = { id: crypto.randomUUID(), text: '' }; focus.current = phrase.id;
          change({ ...value, phrases: [...value.phrases, phrase] });
        }}>{copy.add}</button></div>}
        {value.phrases.length >= 20 && <p className="m-0 text-sm text-muted">{copy.limit}</p>}
      </fieldset>
      {showErrors && issues.length > 0 && <FormFeedback kind="error" title={copy.errors.title} message={[...new Set(issues.map(issue => issue.message))].join(' ')} />}
    </section>
    <section aria-labelledby={`${id}-summary`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <h2 id={`${id}-summary`} className="m-0 text-base font-semibold">{copy.summary}</h2>
      {issues.length ? <p className="m-0 text-sm leading-6 text-muted">{copy.incomplete}</p> : <><p className="m-0 text-sm leading-6">{copy.summaryStart(copy.summaryModes[value.mode], copy.summaryLocations[value.location])}</p>
        <ol role="list" className="m-0 grid min-w-0 list-none gap-3 p-0">{value.phrases.map((phrase, index) => <li key={phrase.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-line bg-canvas p-3">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary-dark">{index + 1}</span>
          <span className="min-w-0 flex-1 py-1 text-sm font-semibold leading-6 wrap-anywhere">{phrase.text.trim()}</span>
        </li>)}</ol></>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.draft}</p>
    </section>
  </section>;
}

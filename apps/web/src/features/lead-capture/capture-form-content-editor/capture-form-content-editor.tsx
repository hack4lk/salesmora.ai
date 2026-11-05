'use client';

import { useId, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, TextField } from '@salesmora/ui';
import { captureFormContentEditorData as copy } from './capture-form-content-editor.data';

export type CaptureFormContent = { title: string; intro: string; unavailableMessage: string; showBusinessEmail: boolean; showBusinessPhone: boolean };
export type CaptureFormContentEditorProps = {
  value: CaptureFormContent;
  canRead: boolean;
  canEdit: boolean;
  pending?: boolean;
  showErrors?: boolean;
  onChange: (value: CaptureFormContent) => void;
};
/** Controlled draft text; the host shares this value with the visitor preview. */
export function CaptureFormContentEditor({ value, canRead, canEdit, pending = false, showErrors = false, onChange }: CaptureFormContentEditorProps) {
  const id = useId();
  const [titleTouched, setTitleTouched] = useState(false);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const disabled = !canEdit || pending;
  const titleError = (showErrors || titleTouched) && !value.title.trim() ? copy.titleError : undefined;
  return <section aria-labelledby={`${id}-heading`} className="grid min-w-0 content-start gap-5 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6">
    <div><h2 id={`${id}-heading`} className="m-0 text-xl font-semibold">{copy.heading}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></div>
    <TextField label={copy.title} required value={value.title} disabled={disabled} error={!!titleError} helperText={titleError}
      slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }} onBlur={() => setTitleTouched(true)}
      onChange={event => { if (!disabled) onChange({ ...value, title: event.target.value }); }} />
    <MuiTextField label={copy.intro} value={value.intro} disabled={disabled} multiline minRows={4} fullWidth size="small" variant="outlined" className={fieldClasses}
      helperText={copy.introHint} slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }}
      onChange={event => { if (!disabled) onChange({ ...value, intro: event.target.value }); }} />
    <MuiTextField label={copy.paused} value={value.unavailableMessage} disabled={disabled} multiline minRows={3} fullWidth size="small" variant="outlined" className={fieldClasses}
      helperText={copy.pausedHint} slotProps={{ input: { className: 'has-focus-visible:focus-ring' } }}
      onChange={event => { if (!disabled) onChange({ ...value, unavailableMessage: event.target.value }); }} />
    <fieldset disabled={disabled} className="m-0 grid min-w-0 gap-2 rounded-xl border border-line p-4">
      <legend className="px-2 text-sm font-semibold">{copy.pausedContacts}</legend>
      {(['showBusinessEmail', 'showBusinessPhone'] as const).map(key => <label key={key} className="flex min-h-11 min-w-0 items-center gap-3 text-sm leading-6">
        <input type="checkbox" checked={value[key]} className="size-5 shrink-0 accent-primary focus-visible:focus-ring"
          onChange={event => { if (!disabled) onChange({ ...value, [key]: event.target.checked }); }} /><span>{copy[key]}</span>
      </label>)}
      <p className="m-0 text-sm leading-6 text-muted">{copy.pausedContactsHint}</p>
    </fieldset>
    {!canEdit && <p className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>}
  </section>;
}

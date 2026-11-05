'use client';

import { useId } from 'react';
import MuiTextField from '@mui/material/TextField';
import { FormFeedback, StatusBadge, fieldClasses } from '@salesmora/ui';
import type { CaptureFormFieldEditorValue } from '../capture-form-field-editor/capture-form-field-editor.validation';
import { visitorFieldLimit } from '../visitor-capture-form/visitor-capture-form.validation';
import { intakeProposedLeadEditorData as copy } from './intake-proposed-lead-editor.data';
import { intakeAnswerEdited, validIntakeEditorDefinition, validateIntakeProposedAnswers, type IntakeEditorRecord, type IntakeProposedAnswers } from './intake-proposed-lead-editor.validation';
export type IntakeProposedLeadEditorProps = {
  /** Version-bound edit session. Host resets controlled values explicitly when switching items/definitions. */
  record: IntakeEditorRecord; definition: CaptureFormFieldEditorValue;
  originalAnswers: IntakeProposedAnswers; value: IntakeProposedAnswers;
  uncertainFieldIds?: readonly string[];
  canRead: boolean; canEdit: boolean; pending?: boolean; showErrors?: boolean;
  state?: 'ready' | 'loading' | 'error'; onChange: (value: IntakeProposedAnswers) => void; onRetry?: () => void;
};
export function IntakeProposedLeadEditor({ record, definition, originalAnswers, value, uncertainFieldIds = [], canRead, canEdit, pending = false, showErrors = false, state = 'ready', onChange, onRetry }: IntakeProposedLeadEditorProps) {
  const id = useId();
  const panel = 'grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-6';
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (state === 'loading') return <p role="status" aria-busy="true" className={panel}>{copy.loading}</p>;
  if (state === 'error') return <div className={panel}><FormFeedback kind="error" message={copy.error} />{onRetry && <button type="button" disabled={pending} onClick={onRetry} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.retry}</button>}</div>;
  if (!validIntakeEditorDefinition(record, definition)) return <FormFeedback kind="error" message={copy.invalid} />;
  const readonly = !canEdit || record.resolved, disabled = pending || readonly;
  const errors = showErrors ? validateIntakeProposedAnswers(definition, value) : {};
  const change = (fieldId: string, answer: string | string[]) => { if (!disabled) onChange({ ...value, [fieldId]: answer }); };
  return <section aria-labelledby={id} aria-busy={pending} className={panel}>
    <header className="grid gap-2"><h2 id={id} className="m-0 text-lg font-semibold">{copy.title}</h2><p className="m-0 text-sm leading-6 text-muted">{copy.description}</p></header>
    <p className="m-0 text-sm text-muted">{copy.contact}</p>
    {readonly && <p role="status" className="m-0 text-sm text-muted">{record.resolved ? copy.resolved : copy.readonly}</p>}
    {Object.keys(errors).length > 0 && <FormFeedback kind="error" message={copy.errors} />}
    <div className="grid min-w-0 gap-6 sm:grid-cols-2">{definition.fields.map(field => {
      const answer = Object.hasOwn(value, field.id) ? value[field.id] : '', text = typeof answer === 'string' ? answer : '';
      const original = Object.hasOwn(originalAnswers, field.id) ? originalAnswers[field.id] : undefined;
      const missing = !original || (Array.isArray(original) ? original.length === 0 : !original.trim());
      const edited = intakeAnswerEdited(original, answer), uncertain = uncertainFieldIds.includes(field.id);
      const error = Object.hasOwn(errors, field.id) ? errors[field.id] : undefined;
      const label = field.required ? field.label : copy.optional(field.label);
      return <div key={field.id} className={`grid min-w-0 content-start gap-3 ${field.type === 'long_text' || field.type === 'checkboxes' ? 'sm:col-span-2' : ''}`}>
        <div className="flex min-w-0 flex-wrap gap-2"><StatusBadge label={missing ? copy.missing : uncertain ? copy.uncertain : copy.found} tone={missing || uncertain ? 'warning' : 'neutral'} />{edited && <StatusBadge label={copy.edited} tone="info" />}</div>
        {field.type === 'checkboxes' ? <fieldset disabled={disabled} aria-describedby={error ? `${id}-${field.id}-error` : undefined} aria-invalid={!!error} className="m-0 grid min-w-0 gap-2 rounded-xl border border-line p-4"><legend className="px-2 text-sm font-semibold wrap-anywhere">{label}</legend>{field.options.map(option => <label key={option.id} className="flex min-h-11 min-w-0 items-center gap-3 text-sm"><input type="checkbox" disabled={disabled} checked={Array.isArray(answer) && answer.includes(option.id)} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={event => { const selected = Array.isArray(answer) ? answer : []; change(field.id, event.target.checked ? [...selected, option.id] : selected.filter(item => item !== option.id)); }} /><span className="wrap-anywhere">{option.label}</span></label>)}{error && <p id={`${id}-${field.id}-error`} className="m-0 text-sm text-error">{error}</p>}</fieldset>
          : <MuiTextField id={`${id}-${field.id}`} name={field.id} label={label} required={field.required} fullWidth size="small" className={fieldClasses} value={text} disabled={pending || readonly && field.type === 'dropdown'} error={!!error} helperText={error}
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : 'text'} multiline={field.type === 'long_text'} minRows={field.type === 'long_text' ? 3 : undefined} select={field.type === 'dropdown'}
            slotProps={{ input: { readOnly: readonly, className: 'has-focus-visible:focus-ring' }, inputLabel: field.type === 'date' || field.type === 'dropdown' ? { shrink: true } : undefined, select: field.type === 'dropdown' ? { native: true } : undefined, htmlInput: { maxLength: visitorFieldLimit(field) } }}
            onChange={event => change(field.id, event.target.value)}>{field.type === 'dropdown' ? <><option value="">{copy.choose}</option>{field.options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</> : undefined}</MuiTextField>}
      </div>;
    })}</div>
  </section>;
}

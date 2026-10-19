'use client';

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import MuiTextField from '@mui/material/TextField';
import { FormFeedback, SubmitButton, TextField, fieldClasses } from '@salesmora/ui';
import { useFormReady } from '../../auth/use-form-ready';
import { createLeadFormData as copy } from './create-lead-form.data';
import { emptyLead, normalizeCreateLead, validateCreateLead, type CreateLeadValues } from './create-lead-form.validation';

export type { CreateLeadValues } from './create-lead-form.validation';
export interface CreateLeadFormProps {
  variant?: 'full' | 'quick';
  blocked?: boolean;
  notice?: ReactNode;
  ownerControl?: (props: { value: string; disabled: boolean; onChange: (value: string) => void }) => ReactNode;
  owners: ReadonlyArray<{ id: string; name: string }>;
  initialValues?: Partial<CreateLeadValues>;
  onSubmit: (values: CreateLeadValues) => Promise<{ ok: true } | { ok: false; message?: string }>;
  onCancel: () => void;
  successMessage?: string;
}

export function CreateLeadForm({ variant = 'full', blocked = false, notice, ownerControl, owners, initialValues, onSubmit, onCancel, successMessage = copy.success }: CreateLeadFormProps) {
  const id = useId();
  const ready = useFormReady();
  const [values, setValues] = useState<CreateLeadValues>(() => ({ ...emptyLead, ...initialValues }));
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [submissionError, setSubmissionError] = useState<string>();
  const locked = useRef(false);
  const disabled = blocked || !ready || status !== 'idle';
  const errors = attempted ? validateCreateLead(values) : {};

  function change<Key extends keyof CreateLeadValues>(key: Key, value: CreateLeadValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmissionError(undefined);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || blocked || !ready || status !== 'idle') return;
    setAttempted(true);
    const firstInvalid = Object.keys(validateCreateLead(values))[0];
    if (firstInvalid) {
      const field = event.currentTarget.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    locked.current = true;
    setStatus('pending');
    setSubmissionError(undefined);
    try {
      const result = await onSubmit(normalizeCreateLead(values));
      if (result.ok) { setStatus('success'); return; }
      setSubmissionError(result.message?.trim() || copy.errors.submission);
    } catch { setSubmissionError(copy.errors.submission); }
    locked.current = false;
    setStatus('idle');
  }
  function section(key: keyof typeof copy.sections, children: ReactNode) {
    const content = copy.sections[key];
    return <section aria-labelledby={`${id}-${key}`} className="grid min-w-0 gap-6">
      <div><h2 id={`${id}-${key}`} className="text-lg font-semibold text-ink">{content.title}</h2><p className="mt-1 text-sm text-muted">{content.description}</p></div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">{children}</div>
    </section>;
  }
  function text(key: 'name' | 'email' | 'service' | 'address', required = false, fullRow = false) {
    const error = key === 'address' ? undefined : errors[key];
    return <TextField id={`${id}-${key}`} name={key} label={copy.labels[key]} placeholder={copy.placeholders[key]} type={key === 'email' ? 'email' : 'text'} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'address' ? 'street-address' : 'off'} required={required} disabled={disabled} value={values[key]} onChange={(event) => change(key, event.target.value)} error={!!error} helperText={error} className={fullRow ? 'sm:col-span-2' : undefined} />;
  }
  function textarea(key: 'details' | 'notes') {
    return <MuiTextField id={`${id}-${key}`} name={key} label={copy.optional(copy.labels[key])} placeholder={copy.placeholders[key]} multiline minRows={3} fullWidth size="small" disabled={disabled} value={values[key]} onChange={(event) => change(key, event.target.value)} className={`${fieldClasses} sm:col-span-2`} />;
  }
  function select(key: 'source' | 'stage' | 'ownerId', options: ReadonlyArray<{ value: string; label: string }>) {
    return <MuiTextField id={`${id}-${key}`} name={key} label={copy.labels[key]} select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} fullWidth size="small" disabled={disabled} value={values[key]} onChange={(event) => change(key, event.target.value as CreateLeadValues[typeof key])} className={`${fieldClasses} ${key === 'ownerId' ? 'sm:col-span-2' : ''}`}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </MuiTextField>;
  }
  return <form aria-label={copy.formLabel} aria-busy={status === 'pending'} noValidate onSubmit={submit} className={variant === 'quick' ? 'grid w-full min-w-0 gap-6' : 'grid w-full min-w-0 gap-8 rounded-2xl border border-line bg-paper p-6 sm:p-8'}>
    {submissionError && <FormFeedback kind="error" message={submissionError} />}
    {status === 'success' && <FormFeedback kind="success" title={copy.successTitle} message={successMessage} />}
    {notice}
    {variant === 'quick' ? <div className="grid min-w-0 gap-6">
      {text('name', true)}{text('service', true)}{text('email')}
      <MuiTextField name="phone" type="tel" autoComplete="tel" label={copy.optional(copy.labels.phone)} fullWidth size="small" disabled={disabled} value={values.phone} onChange={event => change('phone', event.target.value)} className={fieldClasses}/>
      {select('source', copy.sources)}
      {ownerControl ? ownerControl({ value: values.ownerId, disabled, onChange: value => change('ownerId', value) }) : select('ownerId', [{ value: '', label: copy.unassigned }, ...owners.map(owner => ({ value: owner.id, label: owner.name }))])}
    </div> : <div className="grid gap-8 [&>section:not(:first-child)]:border-t [&>section:not(:first-child)]:border-line [&>section:not(:first-child)]:pt-8">
      {section('contact', <>{text('name', true, true)}{text('email')}<MuiTextField id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" label={copy.optional(copy.labels.phone)} placeholder={copy.placeholders.phone} fullWidth size="small" disabled={disabled} value={values.phone} onChange={(event) => change('phone', event.target.value)} className={fieldClasses} /></>)}
      {section('service', <>{text('service', true)}{text('address')}{textarea('details')}</>)}
      {section('management', <>{select('source', copy.sources)}{select('stage', copy.stages)}{ownerControl ? <div className="sm:col-span-2">{ownerControl({ value: values.ownerId, disabled, onChange: value => change('ownerId', value) })}</div> : select('ownerId', [{ value: '', label: copy.unassigned }, ...owners.map((owner) => ({ value: owner.id, label: owner.name }))])}</>)}
      {section('notes', textarea('notes'))}
    </div>}
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
      <MuiButton type="button" variant="outlined" disabled={!ready || status === 'pending'} onClick={onCancel} className="min-h-11 rounded-xl border-line px-6 py-3 text-base font-semibold normal-case text-ink focus-visible:focus-ring">{copy.cancel}</MuiButton>
      <SubmitButton label={copy.submit} pendingLabel={copy.pending} pending={status === 'pending'} disabled={disabled} fullWidth={false} />
    </div>
  </form>;
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { ArrowUpwardOutlined, ArrowDownwardOutlined, DeleteOutlineOutlined, fieldClasses, FormFeedback, TextField } from '@salesmora/ui';
import { captureFormFieldEditorData as copy } from './capture-form-field-editor.data';
import { captureFieldTypesForKey, customCaptureFieldTypes, isChoiceField, standardCaptureFieldTypes, validateCaptureFormFields, type CaptureCustomFieldType, type CaptureFormField, type CaptureFormFieldEditorValue, type CaptureStandardField } from './capture-form-field-editor.validation';

export type CaptureFormFieldEditorProps = {
  value: CaptureFormFieldEditorValue;
  canRead: boolean;
  canEdit: boolean;
  readOnlyMessage?: string; heading?: string; description?: string;
  pending?: boolean;
  showErrors?: boolean;
  onChange: (value: CaptureFormFieldEditorValue) => void;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const input = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas';
const iconButton = 'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Controlled draft editor; the host preserves revision identity and enforces validation before publication. */
export function CaptureFormFieldEditor({ value, canRead, canEdit, pending = false, showErrors = false, onChange, readOnlyMessage = copy.readOnly, heading = copy.title, description = copy.description }: CaptureFormFieldEditorProps) {
  const id = useId();
  const [addType, setAddType] = useState('custom:short_text');
  const [announcement, setAnnouncement] = useState('');
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fieldRefs = useRef(new Map<string, HTMLFieldSetElement>());
  const addRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<string | null>(null);
  useEffect(() => {
    if (focusTarget.current === null) return;
    if (focusTarget.current === '') addRef.current?.focus();
    else fieldRefs.current.get(focusTarget.current)?.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    focusTarget.current = null;
  }, [value]);
  if (!canRead) return <p role="alert" className="m-0 rounded-2xl border border-line bg-paper p-6 text-sm text-error">{copy.forbidden}</p>;
  const disabled = !canEdit || pending;
  const issues = validateCaptureFormFields(value);
  const update = (fields: readonly CaptureFormField[]) => { if (!disabled) onChange({ ...value, fields }); };
  const patch = (fieldId: string, next: Partial<CaptureFormField>) => update(value.fields.map(field => field.id === fieldId ? { ...field, ...next } : field));
  const move = (index: number, direction: number) => {
    const to = index + direction;
    if (disabled || to < 0 || to >= value.fields.length) return;
    const next = [...value.fields], [field] = next.splice(index, 1); next.splice(to, 0, field);
    focusTarget.current = field.id; update(next); setAnnouncement(copy.moved(index + 1, to + 1));
  };
  const missingStandards = (Object.keys(copy.standards) as CaptureStandardField[]).filter(key => !value.fields.some(field => field.key === key));
  const add = () => {
    if (disabled || value.fields.length >= 50) return;
    const [kind, key] = addType.split(':');
    if (kind === 'standard' && !missingStandards.includes(key as CaptureStandardField)) return;
    const type = kind === 'standard' ? standardCaptureFieldTypes[key as CaptureStandardField] : key as CaptureCustomFieldType;
    if (kind !== 'standard' && !customCaptureFieldTypes.includes(type as CaptureCustomFieldType)) return;
    const field: CaptureFormField = { id: crypto.randomUUID(), key: kind === 'standard' ? key as CaptureStandardField : 'custom', type,
      label: kind === 'standard' ? copy.standards[key as CaptureStandardField] : copy.newField(copy.types[type]), required: kind === 'standard' && (key === 'name' || key === 'service'), options: [] };
    focusTarget.current = field.id; update([...value.fields, field]); setAddType('custom:short_text'); setAnnouncement(copy.added);
  };

  return <section className="grid min-w-0 gap-5 text-ink">
    <div><h2 className="m-0 text-xl font-semibold">{heading}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{description}</p></div>
    {!canEdit && <p className="m-0 text-sm text-muted">{readOnlyMessage}</p>}
    <div className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={value.contactRequired} disabled={disabled} className="size-5 shrink-0 accent-primary focus-visible:focus-ring"
        onChange={event => { if (!disabled) onChange({ ...value, contactRequired: event.target.checked }); }} />{copy.contact}</label>
      <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.contactHint}</p>
    </div>
    {showErrors && issues.length > 0 && <FormFeedback kind="error" title={copy.errors.title} message={[...new Set(issues.map(issue => issue.message))].join(' ')} />}
    {value.fields.length === 0 && <p className="m-0 text-sm text-muted">{copy.empty}</p>}
    <div className="grid min-w-0 gap-4">{value.fields.map((field, index) => {
      const visibleErrors = showErrors || touched.has(field.id);
      const labelError = visibleErrors ? issues.find(issue => issue.fieldId === field.id && issue.message === copy.errors.label)?.message : undefined;
      const fieldErrors = visibleErrors ? [...new Set(issues.filter(issue => issue.fieldId === field.id && issue.message !== copy.errors.label).map(issue => issue.message))] : [];
      return <div key={field.id} className="flex min-w-0 items-start gap-3">
        {canEdit && <div className="flex shrink-0 flex-col gap-2 pt-4">
          <button type="button" className={iconButton} disabled={disabled || index === 0} aria-label={copy.action(copy.up, copy.field(index + 1))} title={copy.up} onClick={() => move(index, -1)}><ArrowUpwardOutlined aria-hidden="true" className="size-5" /></button>
          <button type="button" className={iconButton} disabled={disabled || index === value.fields.length - 1} aria-label={copy.action(copy.down, copy.field(index + 1))} title={copy.down} onClick={() => move(index, 1)}><ArrowDownwardOutlined aria-hidden="true" className="size-5" /></button>
          <button type="button" className={iconButton} disabled={disabled} aria-label={copy.action(copy.remove, copy.field(index + 1))} title={copy.remove} onClick={() => {
            if (disabled) return; focusTarget.current = value.fields[index + 1]?.id ?? value.fields[index - 1]?.id ?? ''; update(value.fields.filter(item => item.id !== field.id)); setAnnouncement(copy.removed(index + 1));
          }}><DeleteOutlineOutlined aria-hidden="true" className="size-5" /></button>
        </div>}
        <fieldset ref={element => { if (element) fieldRefs.current.set(field.id, element); else fieldRefs.current.delete(field.id); }} disabled={disabled}
        className="m-0 grid min-w-0 flex-1 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        <legend className="px-2 text-sm font-semibold text-muted">{copy.field(index + 1)}</legend>
        <div className="grid min-w-0 gap-4 md:flex md:items-start">
          <div className="min-w-0 flex-1"><TextField label={copy.fieldLabel} required value={field.label} error={!!labelError} helperText={labelError} slotProps={{ htmlInput: { maxLength: 60, className: 'focus-visible:focus-ring' } }}
            onBlur={() => setTouched(current => new Set(current).add(field.id))} onChange={event => patch(field.id, { label: event.target.value })} /></div>
          <div className="min-w-0 flex-1"><MuiTextField label={copy.type} select fullWidth variant="outlined" size="small" className={fieldClasses}
            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} value={field.type} disabled={disabled} onChange={event => patch(field.id, { type: event.target.value as CaptureFormField['type'] })}>
              {captureFieldTypesForKey[field.key].map(type => <option key={type} value={type}>{copy.types[type]}</option>)}
          </MuiTextField></div>
          <label className="flex min-h-11 shrink-0 self-start items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={field.required} className="size-5 accent-primary focus-visible:focus-ring" onChange={event => patch(field.id, { required: event.target.checked })} />{copy.required}</label>
        </div>
        <p className="m-0 text-sm text-muted">{field.key === 'custom' ? copy.customHint : copy.fixed}</p>
        {isChoiceField(field) && <div className="grid min-w-0 gap-3">
          <h3 className="m-0 text-sm font-semibold">{copy.options}</h3>
          {field.options.map((option, optionIndex) => <div key={option.id} className="grid min-w-0 gap-3 sm:flex sm:items-start">
            <TextField label={copy.option} required value={option.label} error={visibleErrors && issues.some(issue => issue.fieldId === field.id && issue.optionId === option.id)} slotProps={{ htmlInput: { maxLength: 60, className: 'focus-visible:focus-ring' } }}
              onBlur={() => setTouched(current => new Set(current).add(field.id))} onChange={event => patch(field.id, { options: field.options.map(item => item.id === option.id ? { ...item, label: event.target.value } : item) })} />
            {canEdit && <button type="button" className={button} aria-label={copy.action(copy.removeOption, copy.choice(optionIndex + 1))} onClick={() => {
              if (disabled) return; focusTarget.current = field.id; patch(field.id, { options: field.options.filter(item => item.id !== option.id) });
            }}>{copy.removeOption}</button>}
          </div>)}
          {canEdit && <div><button type="button" disabled={disabled || field.options.length >= 50} className={button} onClick={() => patch(field.id, { options: [...field.options, { id: crypto.randomUUID(), label: '' }] })}>{copy.addOption}</button></div>}
          {fieldErrors.length > 0 && <p className="m-0 text-sm text-error">{fieldErrors.join(' ')}</p>}
        </div>}
      </fieldset></div>;
    })}</div>
    {canEdit && <div className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:flex sm:items-end sm:p-6">
      <label htmlFor={`${id}-add`} className="grid min-w-0 flex-1 gap-2 text-sm font-semibold">{copy.addType}<select id={`${id}-add`} disabled={disabled || value.fields.length >= 50} className={input} value={addType} onChange={event => setAddType(event.target.value)}>
        {missingStandards.length > 0 && <optgroup label={copy.standard}>{missingStandards.map(key => <option key={key} value={`standard:${key}`}>{copy.standards[key]}</option>)}</optgroup>}
        <optgroup label={copy.custom}>{customCaptureFieldTypes.map(type => <option key={type} value={`custom:${type}`}>{copy.types[type]}</option>)}</optgroup>
      </select></label>
      <button ref={addRef} type="button" className={button} disabled={disabled || value.fields.length >= 50} onClick={add}>{copy.add}</button>
    </div>}
    {value.fields.length >= 50 && <p className="m-0 text-sm text-muted">{copy.limit}</p>}
    <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
  </section>;
}

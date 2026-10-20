'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { leadSchema } from '@salesmora/contracts';
import { ConfirmDialog, FormFeedback, SubmitButton, TextField, fieldClasses } from '@salesmora/ui';
import type { CreateLeadValues } from '../create-lead-form/create-lead-form';
import { leadEditFormData as copy } from './lead-edit-form.data';

export type LeadEditValues = Pick<CreateLeadValues, 'name' | 'email' | 'phone' | 'service' | 'address' | 'details' | 'notes' | 'source'>;
export type LeadEditRecord = { id: string; version: number; values: LeadEditValues; canEdit: boolean; origin: 'manual' | 'gmail' | 'campaign' };
export type LeadEditError = { kind: 'error' | 'conflict'; message: string; changedFields?: readonly (keyof LeadEditValues)[] };
export type LeadEditRequest = { leadId: string; expectedVersion: number; values: Omit<LeadEditValues, 'source'> & { source?: LeadEditValues['source'] } };
export type LeadEditFormProps = {
  /** Frozen edit-session snapshot; background changes must become conflicts, not silently advance its version. */
  lead: LeadEditRecord; value: LeadEditValues; pending?: boolean; error?: LeadEditError;
  onChange: (value: LeadEditValues) => void; onCancel: () => void;
  onSubmit: (request: LeadEditRequest) => Promise<{ ok: true; lead: LeadEditRecord } | { ok: false; error: LeadEditError }>;
  onSaved: (lead: LeadEditRecord) => void;
  /** Explicitly replaces the draft with fresh details after discard confirmation. */
  onReload?: () => Promise<void>;
  /** Host uses this to guard in-app navigation; browser unload is guarded here. */
  onDirtyChange?: (dirty: boolean) => void;
};
const schema = leadSchema.pick({ name: true, email: true, phone: true, service: true, address: true, details: true, notes: true, source: true });
const keys: (keyof LeadEditValues)[] = ['name', 'email', 'phone', 'service', 'address', 'details', 'notes', 'source'];

export function LeadEditForm({ lead, value, pending = false, error, onChange, onCancel, onSubmit, onSaved, onReload, onDirtyChange }: LeadEditFormProps) {
  const id = useId(), lock = useRef(false);
  const [working, setWorking] = useState(false);
  const [failure, setFailure] = useState<LeadEditError>();
  const [errors, setErrors] = useState<Partial<Record<keyof LeadEditValues, string>>>({});
  const [discard, setDiscard] = useState<'cancel' | 'reload' | null>(null);
  const problem = failure ?? error;
  const conflict = problem?.kind === 'conflict';
  const busy = pending || working;
  const dirty = keys.some(key => value[key] !== lead.values[key]);
  const readOnly = !lead.canEdit || conflict;
  const sourceLocked = lead.origin !== 'manual';
  useEffect(() => {
    onDirtyChange?.(dirty);
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('beforeunload', warn); onDirtyChange?.(false); };
  }, [dirty, busy, onDirtyChange]);
  function change(key: keyof LeadEditValues, next: string) {
    if (busy || readOnly || (key === 'source' && sourceLocked)) return;
    onChange({ ...value, [key]: next }); setErrors({}); setFailure(undefined);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || busy || readOnly || !dirty) return;
    const parsed = schema.safeParse({ ...value, source: sourceLocked ? lead.values.source : value.source });
    if (!parsed.success) {
      const messages: Partial<Record<keyof LeadEditValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LeadEditValues;
        if (!keys.includes(key)) continue;
        messages[key] ??= issue.code === 'too_big' && typeof issue.maximum === 'number' ? copy.tooLong(copy.labels[key], issue.maximum) : key === 'name' || key === 'service' || key === 'email' ? copy.errors[key] : copy.invalid;
      }
      setErrors(messages);
      const first = event.currentTarget.elements.namedItem(Object.keys(messages)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    lock.current = true; setWorking(true); setFailure(undefined); setErrors({});
    try {
      const { source, ...editable } = parsed.data;
      const result = await onSubmit({ leadId: lead.id, expectedVersion: lead.version, values: sourceLocked ? editable : { ...editable, source } });
      if (result.ok) onSaved(result.lead); else setFailure(result.error);
    } catch { setFailure({ kind: 'error', message: copy.failed }); }
    finally { lock.current = false; setWorking(false); }
  }
  async function discardEdits() {
    if (busy || lock.current || !discard) return;
    if (discard === 'cancel') { setDiscard(null); onCancel(); return; }
    if (!onReload) return;
    lock.current = true; setWorking(true);
    try { await onReload(); setFailure(undefined); setErrors({}); setDiscard(null); }
    catch { setFailure({ kind: 'conflict', message: copy.reloadFailed, changedFields: problem?.changedFields }); setDiscard(null); }
    finally { lock.current = false; setWorking(false); }
  }
  function field(key: Exclude<keyof LeadEditValues, 'source'>, multiline = false) {
    const changed = conflict && problem?.changedFields?.includes(key);
    const helper = errors[key] ?? (changed ? copy.changed : undefined);
    const common = { name: key, value: value[key], disabled: busy, required: key === 'name' || key === 'service', error: !!errors[key], helperText: helper,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(key, event.target.value),
      slotProps: { input: { readOnly: !!readOnly } }, className: changed ? `${fieldClasses} [&_.MuiOutlinedInput-notchedOutline]:border-amber-700` : fieldClasses };
    return multiline || key === 'phone' ? <MuiTextField {...common} label={copy.optional(copy.labels[key])} type={key === 'phone' ? 'tel' : 'text'} multiline={multiline} minRows={multiline ? 3 : undefined} fullWidth size="small"/> : <TextField {...common} label={copy.labels[key]} type={key === 'email' ? 'email' : 'text'}/>;
  }
  return <>
    <form aria-label={copy.formLabel} aria-busy={busy} noValidate onSubmit={submit} className="grid min-w-0 gap-6">
      {!lead.canEdit && <FormFeedback kind="error" message={copy.denied}/>}
      {problem && <FormFeedback kind="error" title={conflict ? copy.conflictTitle : undefined} message={problem.message}/>}
      {conflict && onReload && <button type="button" disabled={busy} onClick={() => setDiscard('reload')} className="min-h-11 w-fit cursor-pointer rounded-xl border border-line px-4 font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.reload}</button>}
      <section aria-labelledby={`${id}-contact`} className="grid gap-6 rounded-2xl border border-line bg-paper p-6"><h2 id={`${id}-contact`} className="m-0 text-lg font-semibold text-ink">{copy.sections.contact.title}</h2>{field('name')}
        <div className="grid gap-6 sm:grid-cols-2">{field('email')}{field('phone')}</div>
      </section>
      <section aria-labelledby={`${id}-service`} className="grid gap-6 rounded-2xl border border-line bg-paper p-6"><h2 id={`${id}-service`} className="m-0 text-lg font-semibold text-ink">{copy.sections.service.title}</h2>{field('service')}{field('address')}{field('details', true)}</section>
      <section aria-labelledby={`${id}-notes`} className="grid gap-6 rounded-2xl border border-line bg-paper p-6"><h2 id={`${id}-notes`} className="m-0 text-lg font-semibold text-ink">{copy.sections.notes.title}</h2>{field('notes', true)}</section>
      <section aria-labelledby={`${id}-source`} className="grid gap-3 rounded-2xl border border-line bg-paper p-6"><h2 id={`${id}-source`} className="m-0 text-lg font-semibold text-ink">{copy.labels.source}</h2>
        <label htmlFor={`${id}-source-input`} className="sr-only">{copy.labels.source}</label>
        <select id={`${id}-source-input`} name="source" value={sourceLocked ? lead.values.source : value.source} disabled={busy || !!readOnly || sourceLocked} onChange={event => change('source', event.target.value)} aria-describedby={sourceLocked ? `${id}-source-help` : undefined} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
          {copy.sources.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
        </select>{conflict && problem?.changedFields?.includes('source') && <p className="m-0 text-sm text-amber-900">{copy.changed}</p>}{sourceLocked && <p id={`${id}-source-help`} className="m-0 text-sm leading-6 text-muted">{copy.sourceLocked}</p>}
      </section>
      <p role="status" className="m-0 text-sm text-muted">{dirty ? copy.dirty : copy.clean}</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={() => { if (dirty) setDiscard('cancel'); else onCancel(); }} className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-5 py-3 font-semibold text-muted focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.cancel}</button>
        {lead.canEdit && <SubmitButton label={copy.save} pendingLabel={copy.pending} pending={busy} disabled={!dirty || !!conflict} fullWidth={false}/>}
      </div>
    </form>
    <ConfirmDialog open={!!discard} title={copy.discardTitle} description={copy.discardDescription} confirmLabel={discard === 'reload' ? copy.reloadConfirm : copy.discard} destructive pending={busy} onClose={() => setDiscard(null)} onConfirm={discardEdits}/>
  </>;
}

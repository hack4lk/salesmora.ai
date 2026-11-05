'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, SubmitButton } from '@salesmora/ui';
import { defaultLeadAssignmentData as copy } from './default-lead-assignment.data';

export type DefaultLeadAssignmentValue = { kind: 'unassigned' } | { kind: 'teammate'; teammateId: string };
export type DefaultLeadAssignmentProps = {
  value: DefaultLeadAssignmentValue; savedValue: DefaultLeadAssignmentValue; revision: number;
  teammates: readonly { id: string; name: string }[]; teammatesState?: 'ready' | 'loading' | 'error';
  canRead: boolean; canManage: boolean; state?: 'ready' | 'loading' | 'error'; pending?: boolean; conflict?: boolean;
  onChange: (value: DefaultLeadAssignmentValue) => void; onDiscard: () => void; onReload: () => void; onRetryTeammates: () => void;
  /** The connected host must reauthorize, validate membership and compare the saved revision. */
  onSave: (request: { value: DefaultLeadAssignmentValue; expectedVersion: number }) => Promise<void>;
};
export function DefaultLeadAssignment(props: DefaultLeadAssignmentProps) {
  return <AssignmentSession key={`${props.revision}:${props.canRead}:${props.canManage}:${props.state}`} {...props} />;
}
function AssignmentSession({ value, savedValue, revision, teammates, teammatesState = 'ready', canRead, canManage, state = 'ready', pending = false, conflict = false, onChange, onDiscard, onReload, onRetryTeammates, onSave }: DefaultLeadAssignmentProps) {
  const id = useId(), lock = useRef(false), mounted = useRef(true), current = useRef('');
  const [saving, setSaving] = useState(false), [failed, setFailed] = useState(false), [saved, setSaved] = useState(false);
  const signature = JSON.stringify(value);
  useEffect(() => { current.current = signature; }, [signature]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const dirty = signature !== JSON.stringify(savedValue), busy = pending || saving;
  const allowed = canRead && canManage && state === 'ready' && !busy && !conflict;
  const eligible = value.kind === 'unassigned' || teammatesState === 'ready' && teammates.some(member => member.id === value.teammateId);
  const change = (next: DefaultLeadAssignmentValue) => { if (allowed) { setFailed(false); setSaved(false); onChange(next); } };
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!allowed || !dirty || !eligible || lock.current) return;
    lock.current = true; setSaving(true); setFailed(false); setSaved(false);
    try { await onSave({ value: structuredClone(value), expectedVersion: revision }); if (mounted.current && current.current === signature) setSaved(true); }
    catch { if (mounted.current) setFailed(true); }
    finally { lock.current = false; if (mounted.current) setSaving(false); }
  };
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-5 text-ink sm:p-8">
    <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
    {state !== 'ready' ? <div className="grid gap-3"><p role={state === 'loading' ? 'status' : 'alert'} className="m-0 text-sm text-muted">{state === 'loading' ? copy.loading : copy.loadError}</p>{state === 'error' && <button type="button" disabled={busy} className="min-h-11 justify-self-start rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={onReload}>{copy.reload}</button>}</div> : <form onSubmit={event => { void save(event); }} aria-busy={busy} className="grid min-w-0 gap-5">
      {!canManage && <p role="status" className="m-0 text-sm text-muted">{copy.readOnly}</p>}
      <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-3 border-0 p-0"><legend className="mb-3 text-base font-semibold">{copy.rule}</legend>
        {(['unassigned', 'teammate'] as const).map(kind => <label key={kind} className={`flex min-h-11 min-w-0 items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${value.kind === kind ? 'border-primary bg-primary/5' : 'border-line'}`}>
          <input type="radio" name={`${id}-kind`} checked={value.kind === kind} className="mt-1 size-4 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => change(kind === 'unassigned' ? { kind } : { kind, teammateId: '' })} /><span className="wrap-anywhere">{kind === 'unassigned' ? copy.unassigned : copy.teammate}</span>
        </label>)}
        {value.kind === 'teammate' && <MuiTextField label={copy.teammateLabel} select required fullWidth size="small" className={fieldClasses} value={value.teammateId} disabled={!allowed || teammatesState !== 'ready'} error={!eligible && teammatesState === 'ready'} helperText={!eligible && teammatesState === 'ready' ? copy.invalid : undefined}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => change({ kind: 'teammate', teammateId: event.target.value })}>
          <option value="">{copy.choose}</option>{value.teammateId && !teammates.some(member => member.id === value.teammateId) && <option value={value.teammateId} disabled>{copy.unavailable}</option>}{teammates.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
        </MuiTextField>}
      </fieldset>
      {teammatesState === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.teammatesLoading}</p>}
      {teammatesState === 'error' && <div className="grid gap-3"><FormFeedback kind="error" message={copy.teammatesError} /><button type="button" disabled={busy || !canManage} onClick={onRetryTeammates} className="min-h-11 justify-self-start rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring">{copy.retryTeammates}</button></div>}
      {teammatesState === 'ready' && !teammates.length && <p className="m-0 text-sm leading-6 text-muted">{copy.empty}</p>}
      <p className="m-0 rounded-xl bg-canvas p-4 text-sm leading-6 text-muted">{copy.scope}</p>{value.kind === 'unassigned' && <p className="m-0 text-sm leading-6 text-muted">{copy.notification}</p>}
      {failed && <FormFeedback kind="error" message={copy.failed} />}{conflict && <div className="grid gap-3"><FormFeedback kind="error" message={copy.conflict} /><button type="button" disabled={busy} onClick={onReload} className="min-h-11 justify-self-start rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring">{copy.reload}</button></div>}
      {saved && !dirty && <FormFeedback kind="success" message={copy.saved} />}
      <footer className="grid min-w-0 gap-4"><p role="status" className="m-0 text-sm text-muted">{dirty ? copy.dirty : copy.unchanged}</p><div className="flex flex-wrap gap-3"><button type="button" disabled={!allowed || !dirty} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring disabled:opacity-50" onClick={() => { if (allowed) { setFailed(false); setSaved(false); onDiscard(); } }}>{copy.discard}</button>
        <SubmitButton fullWidth={false} label={copy.save} pendingLabel={copy.saving} pending={busy} disabled={!allowed || !dirty || !eligible} /></div></footer>
    </form>}
  </section>;
}

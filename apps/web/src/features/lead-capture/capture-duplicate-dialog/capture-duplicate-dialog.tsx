'use client';

import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog, FormFeedback, TextField } from '@salesmora/ui';
import { captureDuplicateDialogData as copy } from './capture-duplicate-dialog.data';
import { captureDuplicateIssue, validCaptureDuplicateName, type CaptureDuplicateSource, type CaptureDuplicateRequest } from './capture-duplicate-dialog.validation';
export type CaptureDuplicateDialogProps = {
  nameReadOnly?: boolean;
  open: boolean; source: CaptureDuplicateSource; name: string; canRead: boolean; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string }; onClose: () => void; onNameChange: (name: string) => void;
  /** Resolve the exact authorized configuration, enforce draft-only copying and deduplicate by requestId. */
  onConfirm: (request: CaptureDuplicateRequest) => Promise<void>; onReload?: () => Promise<void>; container?: () => HTMLElement;
};
export function CaptureDuplicateDialog({ nameReadOnly = false, open, source, name, canRead, pending = false, error, onClose, onNameChange, onConfirm, onReload, container }: CaptureDuplicateDialogProps) {
  const lock = useRef(false), attempt = useRef<{ signature: string; id: string } | null>(null);
  const [working, setWorking] = useState<'confirm' | 'reload' | null>(null), [touched, setTouched] = useState(false), [failure, setFailure] = useState<{ signature: string; reload: boolean } | null>(null);
  useEffect(() => { if (!open) attempt.current = null; }, [open]);
  const signature = JSON.stringify([source, name.trim()]), busy = pending || !!working, conflict = error?.kind === 'conflict';
  const issue = captureDuplicateIssue(source), validName = validCaptureDuplicateName(name), disabled = busy || !source.canDuplicate || conflict;
  const confirm = async () => {
    if (!canRead || busy || lock.current || issue || conflict || !validName) return;
    lock.current = true; setWorking('confirm'); setFailure(null);
    try {
      if (attempt.current?.signature !== signature) attempt.current = { signature, id: crypto.randomUUID() };
      await onConfirm({ sourceId: source.id, expectedVersion: source.version, configuration: { kind: source.configuration.kind, version: source.configuration.version }, name: name.trim(), to: 'draft', requestId: attempt.current.id });
    } catch { setFailure({ signature, reload: false }); }
    finally { lock.current = false; setWorking(null); }
  };
  const reload = async () => {
    if (!canRead || busy || lock.current || !onReload) return;
    lock.current = true; setWorking('reload'); setFailure(null);
    try { await onReload(); }
    catch { setFailure({ signature, reload: true }); }
    finally { lock.current = false; setWorking(null); }
  };
  return <ConfirmDialog open={open} container={container} initialFocus="content" title={canRead ? copy.title : copy.deniedTitle} description={canRead ? copy.description : copy.denied}
    confirmLabel={copy.confirm} pendingLabel={working === 'reload' ? copy.reloading : copy.pending} cancelLabel={copy.cancel} pending={busy} confirmDisabled={!canRead || !!issue || conflict || !validName}
    error={canRead ? failure?.signature === signature ? failure.reload ? copy.reloadFailed : copy.failed : error?.message : undefined}
    onClose={() => { if (!busy && !lock.current) { attempt.current = null; setFailure(null); setTouched(false); onClose(); } }} onConfirm={confirm}>
    {canRead && <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-1 rounded-xl border border-line bg-canvas p-3"><p className="m-0 text-xs font-semibold text-muted">{copy.source}</p><p className="m-0 text-base font-semibold wrap-anywhere">{source.name}</p><p className="m-0 text-xs text-muted">{copy.configuration[source.configuration.kind]} · {copy.revision(source.configuration.version)}</p></div>
      <TextField label={copy.name} required value={name} disabled={disabled || nameReadOnly} error={touched && !validName} helperText={touched && !validName ? copy.nameError : copy.nameHint} slotProps={{ htmlInput: { maxLength: 80 }, input: { className: 'has-focus-visible:focus-ring' } }} onBlur={() => setTouched(true)} onChange={event => { if (!disabled) { setTouched(true); onNameChange(event.target.value); } }} />
      <section className="grid min-w-0 gap-3"><h3 className="m-0 text-base font-semibold">{copy.included}</h3><dl className="m-0 grid min-w-0 gap-3">{source.configuration.summary.map((row, index) => <div key={index} className="grid min-w-0 gap-1"><dt className="text-xs font-semibold text-muted">{row.label}</dt><dd className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{row.value}</dd></div>)}</dl></section>
      <section className="grid min-w-0 gap-2"><h3 className="m-0 text-base font-semibold">{copy.excluded}</h3><ul className="m-0 grid list-disc gap-2 pl-5 text-sm leading-6">{copy.excludedItems.map(item => <li key={item}>{item}</li>)}</ul></section>
      <p className="m-0 text-sm leading-6">{source.type === 'gmail' ? copy.gmail : copy.website}</p><p className="m-0 text-sm leading-6 text-muted">{copy.unchanged}</p>
      {issue === 'checking' ? <p role="status" className="m-0 text-sm text-muted">{copy.checking}</p> : issue && <FormFeedback kind="error" message={issue === 'blocked' ? source.reason || copy.blocked : copy[issue]} />}
      {conflict && onReload && <button type="button" disabled={busy} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { void reload(); }}>{copy.reload}</button>}
    </div>}
  </ConfirmDialog>;
}

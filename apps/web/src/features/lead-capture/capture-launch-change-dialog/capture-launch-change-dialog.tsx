'use client';

import { useEffect, useId, useRef, useState } from 'react';
import MuiTextField from '@mui/material/TextField';
import { ConfirmDialog, FormFeedback, fieldClasses } from '@salesmora/ui';
import type { CaptureLaunchValue } from '../capture-setup-review/capture-setup-review.validation';
import { captureLaunchChangeDialogData as copy } from './capture-launch-change-dialog.data';
import { captureScheduledSourceIssue, captureLaunchChangeTiming, type CaptureScheduledSource, type CaptureLaunchChangeRequest } from './capture-launch-change-dialog.validation';
export type CaptureLaunchChangeDialogProps = {
  timingReadOnly?: boolean;
  open: boolean; source: CaptureScheduledSource; value: CaptureLaunchValue; canRead: boolean; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string }; onClose: () => void; onChange: (value: CaptureLaunchValue) => void;
  /** Reauthorize/version-check and atomically replace the existing launch job without reserving a second source slot. */
  onConfirm: (request: CaptureLaunchChangeRequest) => Promise<void>; onReload?: () => Promise<void>; now?: () => number; container?: () => HTMLElement;
};
export function CaptureLaunchChangeDialog({ timingReadOnly = false, open, source, value, canRead, pending = false, error, onClose, onChange, onConfirm, onReload, now = Date.now, container }: CaptureLaunchChangeDialogProps) {
  const id = useId(), lock = useRef(false), [clock, setClock] = useState(now);
  const [working, setWorking] = useState<'confirm' | 'reload' | null>(null), [failure, setFailure] = useState<{ signature: string; reload: boolean } | null>(null);
  useEffect(() => { if (!open) return; const timer = setInterval(() => setClock(now()), 30000); return () => clearInterval(timer); }, [open, now]);
  const signature = JSON.stringify([source, value]), busy = pending || !!working, conflict = error?.kind === 'conflict';
  const issue = captureScheduledSourceIssue(source, clock), result = captureLaunchChangeTiming(source, value, clock);
  const blocked = !canRead || !!issue || conflict || !result.timing || result.unchanged;
  const disabled = busy || !source.canChange || source.status !== 'scheduled' && !(source.status === 'active' && source.pendingRevision) || conflict;
  const confirm = async () => {
    const instant = now(), latest = captureLaunchChangeTiming(source, value, instant);
    if (busy || lock.current || !canRead || conflict || captureScheduledSourceIssue(source, instant) || !latest.timing || latest.unchanged) { setClock(instant); return; }
    lock.current = true; setWorking('confirm'); setFailure(null);
    try { await onConfirm(structuredClone({ source, timing: latest.timing })); }
    catch { setFailure({ signature, reload: false }); }
    finally { lock.current = false; setWorking(null); }
  };
  const reload = async () => {
    if (!canRead || busy || lock.current || !onReload) return;
    lock.current = true; setWorking('reload'); setFailure(null);
    try { await onReload(); setClock(now()); }
    catch { setFailure({ signature, reload: true }); }
    finally { lock.current = false; setWorking(null); }
  };
  const date = (at: string) => { try { return new Intl.DateTimeFormat('en-US', { timeZone: source.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(at)); } catch { return copy.invalid; } };
  return <ConfirmDialog open={open} container={container} initialFocus="content" title={canRead ? copy.title : copy.deniedTitle} description={canRead ? copy.description : copy.denied}
    confirmLabel={value.mode === 'now' ? copy.launchNow : copy.confirm} pendingLabel={working === 'reload' ? copy.reloading : copy.pending} cancelLabel={copy.cancel} pending={busy} confirmDisabled={blocked}
    error={canRead ? failure?.signature === signature ? failure.reload ? copy.reloadFailed : copy.failed : error?.message : undefined}
    onClose={() => { if (!busy && !lock.current) { setFailure(null); onClose(); } }} onConfirm={confirm}>
    {canRead && <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-1 rounded-xl border border-line bg-canvas p-3"><p className="m-0 text-xs font-semibold text-muted">{copy.source}</p><p className="m-0 text-base font-semibold wrap-anywhere">{source.name}</p></div>
      <div className="grid gap-1"><p className="m-0 text-xs font-semibold text-muted">{copy.current}</p><p className="m-0 text-sm font-semibold">{date(source.scheduledAt)}</p><p className="m-0 text-xs text-muted wrap-anywhere">{copy.zone(source.timezone)}</p></div>
      <fieldset disabled={disabled || timingReadOnly} className="m-0 grid min-w-0 gap-3 border-0 p-0"><legend className="mb-3 text-sm font-semibold">{copy.proposed}</legend>
        {(['scheduled', 'now'] as const).map(mode => <label key={mode} className={`flex min-h-11 items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${value.mode === mode ? 'border-primary bg-primary/10 text-primary-dark' : 'border-line'}`}><input type="radio" name={`${id}-timing`} checked={value.mode === mode} className="size-5 shrink-0 accent-primary focus-visible:focus-ring" onChange={() => { if (!disabled) onChange({ ...value, mode }); }} />{mode === 'now' ? copy.now : copy.later}</label>)}
        {value.mode === 'scheduled' && <MuiTextField label={copy.date} type="datetime-local" value={value.localDateTime} required fullWidth size="small" className={fieldClasses} disabled={disabled || timingReadOnly} error={!!value.localDateTime && !!result.error} helperText={result.error || (result.unchanged ? copy.unchanged : undefined)} slotProps={{ inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }} onChange={event => { if (!disabled) onChange({ ...value, localDateTime: event.target.value }); }} />}
      </fieldset>
      {result.timing?.kind === 'scheduled' && !result.unchanged && <p className="m-0 text-sm font-semibold text-primary-dark"><time dateTime={result.timing.at}>{date(result.timing.at)}</time></p>}
      <p className="m-0 text-sm leading-6">{copy.effects[source.type]}</p><p className="m-0 text-sm leading-6 text-muted">{copy.approved}</p>
      {issue === 'checking' ? <p role="status" className="m-0 text-sm text-muted">{copy.checking}</p> : issue && <FormFeedback kind="error" message={issue === 'blocked' ? source.reason || copy.blocked : copy[issue]} />}
      {value.mode === 'now' && result.error && <FormFeedback kind="error" message={result.error} />}
      {(conflict || issue === 'elapsed' || issue === 'unavailable' || issue === 'invalid') && onReload && <button type="button" disabled={busy} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { void reload(); }}>{copy.reload}</button>}
    </div>}
  </ConfirmDialog>;
}

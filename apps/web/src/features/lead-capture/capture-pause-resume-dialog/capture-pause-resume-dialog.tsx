'use client';

import { useRef, useState } from 'react';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { capturePauseResumeDialogData as copy } from './capture-pause-resume-dialog.data';
import { captureIntakeIssue, type CaptureIntakeAction, type CaptureIntakeRequest, type CaptureIntakeSource } from './capture-pause-resume-dialog.validation';

export type CapturePauseResumeDialogProps = {
  open: boolean; action: CaptureIntakeAction; source: CaptureIntakeSource; canRead: boolean; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string }; onClose: () => void;
  /** The host reauthorizes/checks the version, performs the action and closes after success. */
  onConfirm: (request: CaptureIntakeRequest) => Promise<void>;
  onReload?: () => Promise<void>; container?: () => HTMLElement;
};
export function CapturePauseResumeDialog({ open, action, source, canRead, pending = false, error, onClose, onConfirm, onReload, container }: CapturePauseResumeDialogProps) {
  const lock = useRef(false), [working, setWorking] = useState<'confirm' | 'reload' | null>(null);
  const [failure, setFailure] = useState<{ signature: string; reload: boolean } | null>(null);
  const signature = JSON.stringify([source, action]);
  const busy = pending || !!working, issue = captureIntakeIssue(source, action), conflict = error?.kind === 'conflict';
  const change = async () => {
    if (!canRead || busy || lock.current || issue || conflict) return;
    lock.current = true; setWorking('confirm'); setFailure(null);
    try { await onConfirm(structuredClone({ source, action })); }
    catch { setFailure({ signature, reload: false }); }
    finally { lock.current = false; setWorking(null); }
  };
  const reload = async () => {
    if (!canRead || busy || lock.current || !onReload) return;
    lock.current = true; setWorking('reload'); setFailure(null);
    try { await onReload(); }
    catch { setFailure({ signature, reload: true }); }
    finally { lock.current = false; setWorking(null); }
  };
  return <ConfirmDialog open={open} container={container} initialFocus={action === 'resume' ? 'content' : 'cancel'} title={canRead ? copy.title[action] : copy.deniedTitle} description={canRead ? copy.description[action] : copy.denied}
    confirmLabel={copy.confirm[action]} pendingLabel={working === 'reload' ? copy.reloading : copy.pending[action]} cancelLabel={copy.cancel} pending={busy} confirmDisabled={!canRead || !!issue || conflict}
    error={canRead ? failure?.signature === signature ? failure.reload ? copy.reloadFailed : copy.failed : error?.message : undefined}
    onClose={() => { if (!busy && !lock.current) { setFailure(null); onClose(); } }} onConfirm={change}>
    {canRead && <div className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-1 rounded-xl border border-line bg-canvas p-3"><p className="m-0 text-xs font-semibold text-muted">{copy.source}</p><p className="m-0 text-base font-semibold wrap-anywhere">{source.name}</p><p className="m-0 text-sm text-muted">{copy.types[source.type]}</p></div>
      <p className="m-0 text-sm leading-6">{copy.consequences[source.type]?.[action]}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.preserved}</p>
      {action === 'resume' && <section className="grid min-w-0 gap-3"><h3 className="m-0 text-base font-semibold">{copy.approved}</h3><dl className="m-0 grid min-w-0 gap-3">{source.approved.map((row, index) => <div key={index} className="grid min-w-0 gap-1"><dt className="text-xs font-semibold text-muted">{row.label}</dt><dd className="m-0 text-sm leading-6 whitespace-pre-wrap wrap-anywhere">{row.value}</dd></div>)}</dl><p className="m-0 text-sm leading-6 text-muted">{copy.revision}</p></section>}
      {issue === 'checking' ? <p role="status" className="m-0 text-sm text-muted">{copy.checking}</p> : issue && <FormFeedback kind="error" message={issue === 'blocked' ? source.resumeReason || copy.blocked : copy[issue]} />}
      {conflict && onReload && <button type="button" disabled={busy} className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { void reload(); }}>{copy.reload}</button>}
    </div>}
  </ConfirmDialog>;
}

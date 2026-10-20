'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { TextField } from '../../forms/text-field/text-field';
import { FormFeedback } from '../../forms/form-feedback/form-feedback';
import { confirmDialogData as copy } from './confirm-dialog.data';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  error?: string;
  children?: ReactNode;
  /** Controlled by the feature; clear value when opening a new confirmation. */
  confirmation?: { label: string; expectedValue: string; value: string; onChange: (value: string) => void };
  onClose: () => void;
  /** Resolve after completion; reject to retain the dialog with retry feedback. */
  onConfirm: () => void | Promise<void>;
};

/** Reusable action boundary for UI. Authorization and actual mutations belong to the caller. */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = copy.cancel, destructive = false,
  confirmDisabled = false, pending = false, pendingLabel = copy.pending, error, children, confirmation, onClose, onConfirm }: ConfirmDialogProps) {
  const id = useId();
  const inFlight = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string>();
  const busy = pending || submitting;
  const matches = !confirmation || (confirmation.expectedValue.length > 0 && confirmation.value === confirmation.expectedValue);
  const close = () => { if (!pending && !inFlight.current) onClose(); };
  const submit = async () => {
    if (pending || inFlight.current || !matches || confirmDisabled) return;
    inFlight.current = true;
    setSubmitting(true);
    setFailure(undefined);
    try { await onConfirm(); }
    catch { setFailure(copy.failed); }
    finally { inFlight.current = false; setSubmitting(false); }
  };

  return <Dialog open={open} maxWidth="sm" fullWidth scroll="paper" onClose={(_event, reason) => { if (reason === 'escapeKeyDown') close(); }}
    slotProps={{ backdrop: { className: 'bg-ink/50' }, transition: { onExited: () => setFailure(undefined) },
      paper: { role: 'alertdialog', 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-description`, tabIndex: -1,
        className: 'm-4 w-full min-w-0 rounded-2xl bg-paper text-ink focus-visible:focus-ring sm:m-8' } }}>
    <form onSubmit={event => { event.preventDefault(); void submit(); }} className="min-w-0 p-6 sm:p-8">
      {destructive && <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-error/10 text-error"><WarningAmberOutlined aria-hidden="true"/></div>}
      <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold wrap-anywhere">{title}</h2>
      <p id={`${id}-description`} className="mb-0 mt-3 leading-6 text-muted wrap-anywhere">{description}</p>
      {children && <div className="mt-6 min-w-0 wrap-anywhere">{children}</div>}
      {confirmation && <div className="mt-6"><TextField label={confirmation.label} required value={confirmation.value} disabled={busy}
        onChange={event => confirmation.onChange(event.target.value)} helperText={copy.exactMatch(confirmation.expectedValue)}
        autoComplete="off" slotProps={{ htmlInput: { spellCheck: false } }}/></div>}
      {(error || failure) && <div className="mt-6"><FormFeedback kind="error" message={error || failure!}/></div>}
      {busy && <p role="status" className="mb-0 mt-5 text-sm text-muted">{pendingLabel}</p>}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" autoFocus disabled={busy} onClick={close}
          className="min-h-11 cursor-pointer rounded-xl border border-line px-5 py-3 font-semibold text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{cancelLabel}</button>
        <Button type="submit" variant="contained" color={destructive ? 'error' : 'primary'} disableElevation disabled={busy || !matches || confirmDisabled} aria-busy={busy}
          className="min-h-11 cursor-pointer rounded-xl px-5 py-3 text-base font-semibold normal-case whitespace-normal wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed">
          {busy ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </form>
  </Dialog>;
}

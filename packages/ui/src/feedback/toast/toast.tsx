'use client';

import { useId, useRef, type RefObject } from 'react';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { toastData as copy } from './toast.data';

export type ToastProps = {
  open: boolean;
  kind: 'success' | 'error' | 'conflict';
  message: string;
  title?: string;
  action?: { label: string; onClick: () => void; pending?: boolean; pendingLabel?: string };
  /** Only success without an action auto-dismisses. null keeps it open. */
  autoHideMs?: number | null;
  /** Optional origin for keyboard focus when dismissing from within the toast. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
};

/** Controlled notification. The feature owns action state, retry safety and message queuing. */
export function Toast({ open, kind, message, title = copy.titles[kind], action, autoHideMs = 6000, returnFocusRef, onClose }: ToastProps) {
  const id = useId();
  const content = useRef<HTMLDivElement>(null);
  const busy = action?.pending === true;
  const close = () => {
    if (busy) return;
    if (content.current?.contains(content.current.ownerDocument.activeElement)) returnFocusRef?.current?.focus();
    onClose();
  };
  const duration = autoHideMs === null ? null : Number.isFinite(autoHideMs) && autoHideMs >= 1000 ? autoHideMs : 6000;
  const Icon = kind === 'success' ? CheckCircleOutlined : kind === 'error' ? ErrorOutlineOutlined : WarningAmberOutlined;
  const tone = kind === 'success' ? 'border-success [&_.toast-icon]:text-success' : kind === 'error' ? 'border-error [&_.toast-icon]:text-error' : 'border-amber-700 [&_.toast-icon]:text-amber-800';

  return <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} autoHideDuration={kind === 'success' && !action ? duration : null}
    onClose={(_event, reason) => { if (reason !== 'clickaway') close(); }}
    className="bottom-24 left-4 right-4 max-w-reading md:bottom-6 md:left-6 md:right-auto">
    <div ref={content} className={`w-full min-w-0 rounded-2xl border bg-paper p-4 text-ink shadow-xl ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="toast-icon mt-2 shrink-0"/>
        <div role={kind === 'success' ? 'status' : 'alert'} aria-live={kind === 'success' ? 'polite' : 'assertive'} aria-atomic="true"
          aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} className="min-w-0 flex-1">
          <p id={`${id}-title`} className="m-0 text-base leading-6 font-semibold wrap-anywhere">{title}</p>
          <p id={`${id}-message`} className="mb-0 mt-1 text-sm leading-6 text-muted wrap-anywhere">{message}</p>
        </div>
        <button type="button" disabled={busy} onClick={close} aria-label={copy.close}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"><CloseOutlined aria-hidden="true"/></button>
      </div>
      {action && <div className="mt-3 flex justify-end"><button type="button" disabled={busy} aria-busy={busy}
        onClick={() => { if (!busy) action.onClick(); }}
        className="min-h-11 max-w-full cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">
        {busy ? action.pendingLabel ?? copy.pending : action.label}
      </button></div>}
    </div>
  </Snackbar>;
}

'use client';

import { useId, type ReactNode } from 'react';
import Drawer from '@mui/material/Drawer';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { sideDrawerData as copy } from './side-drawer.data';

export type SideDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  onClose: () => void;
};

/** Controlled modal shell. MUI traps/restores focus and locks background scrolling. */
export function SideDrawer({ open, title, description, children, footer, busy = false, onClose }: SideDrawerProps) {
  const id = useId();
  const close = () => { if (!busy) onClose(); };

  return (
    <Drawer open={open} anchor="right" variant="temporary" onClose={close}
      slotProps={{
        backdrop: { className: 'bg-ink/50' },
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': `${id}-title`,
          'aria-describedby': description ? `${id}-description` : undefined,
          tabIndex: -1,
          className: 'flex h-dvh max-h-dvh w-full min-w-0 flex-col bg-paper text-ink shadow-2xl sm:max-w-lg focus-visible:focus-ring',
        },
      }}>
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-6 sm:p-8">
        <div className="min-w-0 wrap-anywhere">
          <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{title}</h2>
          {description && <p id={`${id}-description`} className="mb-0 mt-2 text-base leading-6 text-muted">{description}</p>}
        </div>
        <button type="button" onClick={close} disabled={busy} aria-label={copy.close}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
          <CloseOutlined aria-hidden="true" />
        </button>
      </header>
      <div role="region" aria-label={copy.content} tabIndex={0} aria-busy={busy}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 wrap-anywhere focus-visible:focus-ring sm:p-8">
        {children}
      </div>
      {busy && <p role="status" className="m-0 shrink-0 px-6 py-3 text-sm text-muted sm:px-8">{copy.busy}</p>}
      {footer && <footer className="shrink-0 border-t border-line bg-paper p-6 sm:px-8">{footer}</footer>}
    </Drawer>
  );
}

'use client';
import { ConfirmDialog } from '@salesmora/ui';
import { copy } from './material-archive-dialog.data';

export type MaterialArchiveDialogProps = { open: boolean; name: string; restore?: boolean; pending?: boolean; error?: string; onClose: () => void; onConfirm: () => void };

export function MaterialArchiveDialog({ open, name, restore = false, pending, error, onClose, onConfirm }: MaterialArchiveDialogProps) {
  const text = restore ? copy.restore : copy.archive;
  return (
    <ConfirmDialog open={open} title={text.title} description={text.description(name)} confirmLabel={text.confirm} destructive={!restore} pending={pending} error={error} onClose={onClose} onConfirm={onConfirm}>
      <p className="m-0 text-sm text-muted">{text.impact}</p>
    </ConfirmDialog>
  );
}

'use client';
import { useState } from 'react';
import { ConfirmDialog } from '@salesmora/ui';
import { copy } from './work-order-delete-dialog.data';

export type WorkOrderDeleteDialogProps = { open: boolean; number: string; title: string; pending?: boolean; error?: string; onClose: () => void; onConfirm: () => void };

/** Deleting is permanent, so the work order number must be typed to confirm. */
export function WorkOrderDeleteDialog(props: WorkOrderDeleteDialogProps) {
  return <Review key={`${props.number}:${props.open}`} {...props} />;
}
function Review({ open, number, title, pending, error, onClose, onConfirm }: WorkOrderDeleteDialogProps) {
  const [value, setValue] = useState('');
  return <ConfirmDialog open={open} title={copy.title} description={copy.description(number, title)} confirmLabel={copy.confirm} destructive pending={pending} error={error}
    confirmation={{ label: copy.type, expectedValue: number, value, onChange: setValue }} onClose={onClose} onConfirm={onConfirm}>
    <p className="m-0 text-sm text-muted">{copy.impact}</p>
  </ConfirmDialog>;
}

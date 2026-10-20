'use client';
import { useState } from 'react';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woInput, woLabel } from '../work-order-ui';
import { copy, reasonLimit } from './work-order-reopen-dialog.data';

export type WorkOrderReopenDialogProps = { open: boolean; number: string; pending?: boolean; error?: string; conflict?: boolean; onReload?: () => void; onClose: () => void; onConfirm: (reason: string) => void | Promise<void> };
export function WorkOrderReopenDialog({ open, number, pending, error, conflict, onReload, onClose, onConfirm }: WorkOrderReopenDialogProps) {
  const [reason, setReason] = useState('');
  return <JobDialog open={open} title={copy.title(number)} description={copy.description} confirmLabel={copy.confirm} confirmDisabled={!reason.trim()} pending={pending} error={error} conflict={conflict} onReload={onReload} onClose={onClose} onSubmit={() => onConfirm(reason.trim())}>
    <div className="grid gap-1"><label className={woLabel}>{copy.reason}<textarea className={`${woInput} min-h-24`} maxLength={reasonLimit} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <span className="text-xs text-muted">{copy.count(reason.length, reasonLimit)}</span></div>
  </JobDialog>;
}

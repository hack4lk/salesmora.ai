'use client';
import { useState } from 'react';
import { JobDialog } from '../../jobs/job-dialog/job-dialog';
import { woInput, woLabel } from '../../work-orders/work-order-ui';
import { copy } from './material-reject-dialog.data';

export type MaterialRejectDialogProps = { open: boolean; name: string; pending?: boolean; error?: string; conflict?: boolean; onReload?: () => void; onClose: () => void; onSubmit: (reason: string) => void | Promise<void> };

export function MaterialRejectDialog(props: MaterialRejectDialogProps) {
  return <Reject key={`${props.open}:${props.name}`} {...props} />;
}
function Reject({ open, name, pending, error, conflict, onReload, onClose, onSubmit }: MaterialRejectDialogProps) {
  const [reason, setReason] = useState('');
  return (
    <JobDialog open={open} title={copy.title} description={copy.description(name)} confirmLabel={copy.confirm} confirmDisabled={reason.trim() === ''} pending={pending} error={error} conflict={conflict} onReload={onReload} closeOnSubmit={false} onClose={onClose} onSubmit={() => onSubmit(reason.trim())}>
      <label className={woLabel}>{copy.reason}<textarea className={woInput} rows={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} /></label>
    </JobDialog>
  );
}

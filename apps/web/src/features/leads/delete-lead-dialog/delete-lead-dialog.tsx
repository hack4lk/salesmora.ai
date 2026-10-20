'use client';

import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import type { LeadStage } from '../move-stage-dialog/move-stage-dialog';
import { deleteLeadDialogData as copy } from './delete-lead-dialog.data';

export type DeleteLeadSnapshot = {
  id: string; version: number; leadNumber: string; name: string; stage: LeadStage; canDelete: boolean;
};
export type DeleteLeadRequest = { leadId: string; expectedVersion: number; typedConfirmation: string };
export type DeleteLeadDialogProps = {
  open: boolean; lead: DeleteLeadSnapshot; value: string; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string };
  onChange: (value: string) => void; onClose: () => void;
  /** Host reauthorizes, checks version/stage/exact confirmation, deletes, and navigates away only after success. Reject on failure. */
  onConfirm: (request: DeleteLeadRequest) => void | Promise<void>;
};

/** Controlled review only. Freeze the snapshot and reset typed confirmation for each new review. */
export function DeleteLeadDialog({ open, lead, value, pending = false, error, onChange, onClose, onConfirm }: DeleteLeadDialogProps) {
  const conflict = error?.kind === 'conflict';
  const won = lead.stage === 'won';
  const blocked = !lead.canDelete || won || conflict;
  const matches = lead.leadNumber.length > 0 && value === lead.leadNumber;
  return <ConfirmDialog open={open} destructive title={copy.title} description={copy.description(lead.leadNumber, lead.name)}
    confirmLabel={copy.confirm} cancelLabel={copy.cancel} pendingLabel={copy.pending} pending={pending}
    confirmDisabled={blocked} error={error?.kind === 'error' ? error.message : undefined} onClose={onClose}
    confirmation={blocked ? undefined : { label: copy.confirmation, expectedValue: lead.leadNumber, value, onChange }}
    onConfirm={() => { if (!pending && !blocked && matches) return onConfirm({ leadId: lead.id, expectedVersion: lead.version, typedConfirmation: value }); }}>
    <div className="grid gap-4">
      <p className="m-0 leading-6 text-muted">{copy.alternative}</p>
      {!lead.canDelete && <FormFeedback kind="error" message={copy.forbidden}/>}
      {won && <FormFeedback kind="error" message={copy.won}/>}
      {conflict && <FormFeedback kind="error" message={copy.conflict}/>}
    </div>
  </ConfirmDialog>;
}

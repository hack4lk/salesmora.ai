'use client';

import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { archiveLeadDialogData as copy } from './archive-lead-dialog.data';

export type ArchiveLeadSnapshot = {
  id: string; version: number; leadNumber: string; name: string; canArchive: boolean; archived: boolean;
};
export type ArchiveLeadRequest = { leadId: string; expectedVersion: number };
export type ArchiveLeadDialogProps = {
  open: boolean; lead: ArchiveLeadSnapshot; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string };
  onClose: () => void;
  /** Host reauthorizes scope/capability, checks version, persists, and closes only after success. Reject on failure. */
  onConfirm: (request: ArchiveLeadRequest) => void | Promise<void>;
};

/** Review boundary only: callers freeze the snapshot while open and own authoritative lifecycle checks. */
export function ArchiveLeadDialog({ open, lead, pending = false, error, onClose, onConfirm }: ArchiveLeadDialogProps) {
  const conflict = error?.kind === 'conflict';
  const blocked = !lead.canArchive || lead.archived || conflict;
  return <ConfirmDialog open={open} title={copy.title} description={copy.description(lead.leadNumber, lead.name)}
    confirmLabel={copy.confirm} cancelLabel={copy.cancel} pendingLabel={copy.pending} pending={pending}
    confirmDisabled={blocked} error={error?.kind === 'error' ? error.message : undefined} onClose={onClose}
    onConfirm={() => { if (!pending && !blocked) return onConfirm({ leadId: lead.id, expectedVersion: lead.version }); }}>
    <div className="grid gap-4">
      <p className="m-0 leading-6 text-muted">{copy.retained}</p>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="m-0 text-sm leading-6 text-ink">{copy.allowance}</p></div>
      {!lead.canArchive && <FormFeedback kind="error" message={copy.forbidden}/>}
      {lead.archived && <FormFeedback kind="error" message={copy.archived}/>}
      {conflict && <FormFeedback kind="error" message={copy.conflict}/>}
    </div>
  </ConfirmDialog>;
}

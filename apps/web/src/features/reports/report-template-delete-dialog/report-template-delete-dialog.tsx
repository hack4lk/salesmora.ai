'use client';

import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { reportTemplateDeleteDialogData as copy } from './report-template-delete-dialog.data';

export type ReportTemplateDeleteDialogProps = {
  open: boolean;
  template: { id: string; name: string };
  canDelete: boolean;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  /** Revalidate ownership, workspace access and version before deleting. Resolve on success; reject on failure. */
  onConfirm: (templateId: string) => Promise<void>;
};

/** Confirms configuration deletion only; the host owns persistence and closes after success. */
export function ReportTemplateDeleteDialog({ open, template, canDelete, pending = false, error, onClose, onConfirm }: ReportTemplateDeleteDialogProps) {
  return <ConfirmDialog key={`${template.id}:${open}`} open={open} title={copy.title} description={copy.description(template.name)}
    destructive confirmLabel={copy.confirm} confirmDisabled={!canDelete} pending={pending} pendingLabel={copy.pending} error={error}
    onClose={onClose} onConfirm={async () => { if (canDelete && !pending) await onConfirm(template.id); }}>
    <div className="grid min-w-0 gap-4">
      <p className="m-0 text-sm leading-6 text-muted">{copy.impact}</p>
      {!canDelete && <FormFeedback kind="error" message={copy.denied} />}
    </div>
  </ConfirmDialog>;
}

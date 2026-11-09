'use client';

import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { reportTemplateUpdateDialogData as copy } from './report-template-update-dialog.data';

export type ReportTemplateUpdateDialogProps = {
  open: boolean;
  template: { id: string; name: string };
  canUpdate: boolean;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  /** Host supplies the reviewed configuration and revalidates ownership/access/version. Reject on failure. */
  onConfirm: (templateId: string) => Promise<void>;
};

/** Reviews replacement of saved settings; the host owns configuration, persistence and closing on success. */
export function ReportTemplateUpdateDialog({ open, template, canUpdate, pending = false, error, onClose, onConfirm }: ReportTemplateUpdateDialogProps) {
  return <ConfirmDialog key={`${template.id}:${open}`} open={open} title={copy.title} description={copy.description(template.name)}
    confirmLabel={copy.confirm} confirmAppearance="seafoam" confirmDisabled={!canUpdate} pending={pending} pendingLabel={copy.pending} error={error}
    onClose={onClose} onConfirm={async () => { if (canUpdate && !pending) await onConfirm(template.id); }}>
    {!canUpdate && <FormFeedback kind="error" message={copy.denied} />}
  </ConfirmDialog>;
}

'use client';

import { useId } from 'react';
import Dialog from '@mui/material/Dialog';
import { CloseOutlined, FormFeedback, SeafoamButton } from '@salesmora/ui';
import { reportRecordEvidenceDialogData as copy } from './report-record-evidence-dialog.data';

export type ReportRecordEvidenceState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'missing' }
  | { kind: 'ready'; evidence: {
    label: string;
    contextLabel: string;
    fields: readonly { label: string; value: string | null }[];
    /** Omit unless canonical-record navigation is currently authorized. */
    recordId?: string;
  } };
export type ReportRecordEvidenceDialogProps = {
  open: boolean;
  canRead: boolean;
  state: ReportRecordEvidenceState;
  pending?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onOpenRecord: (recordId: string) => void;
};

/** Host loads safe authorized evidence and owns canonical navigation; no raw history or editing. */
export function ReportRecordEvidenceDialog({ open, canRead, state, pending = false, onClose, onRetry, onOpenRecord }: ReportRecordEvidenceDialogProps) {
  const id = useId();
  const evidence = canRead && state.kind === 'ready' ? state.evidence : undefined;
  return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper"
    slotProps={{ paper: { 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-description`, className: 'm-4 min-w-0 rounded-2xl bg-paper text-ink sm:m-8' } }}>
    <section aria-busy={canRead && (state.kind === 'loading' || pending)} className="grid min-w-0 gap-5 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="grid min-w-0 gap-2">
          <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.title}</h2>
          <p id={`${id}-description`} className="m-0 text-sm leading-6 text-muted">{copy.description}</p>
        </div>
        <button type="button" autoFocus aria-label={copy.close}
          onClick={onClose}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-primary hover:bg-canvas focus-visible:focus-ring">
          <CloseOutlined aria-hidden="true" />
        </button>
      </header>
      {!canRead ? <FormFeedback kind="error" message={copy.denied} /> :
        state.kind === 'loading' ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p> :
        state.kind === 'error' ? <FormFeedback kind="error" message={copy.failed} /> :
        state.kind === 'missing' ? <FormFeedback kind="error" message={copy.missing} /> : null}
      {evidence && <div className="grid min-w-0 gap-4">
        <h3 className="m-0 text-lg font-semibold wrap-anywhere">{evidence.label}</h3>
        <p className="m-0 text-sm text-muted wrap-anywhere">{evidence.contextLabel}</p>
        <dl className="m-0 grid min-w-0 gap-4">
          {evidence.fields.map((field, index) => <div key={index} className="grid min-w-0 gap-1">
            <dt className="text-xs font-semibold text-muted wrap-anywhere">{field.label}</dt>
            <dd className="m-0 text-sm leading-6 wrap-anywhere">{field.value === null ? copy.unknown : field.value}</dd>
          </div>)}
        </dl>
      </div>}
      <div className="flex min-w-0 flex-wrap justify-end gap-3">
        {canRead && state.kind === 'error' && <SeafoamButton size={16} label={copy.retry} disabled={pending} onClick={() => { if (!pending) onRetry(); }} />}
        {evidence?.recordId !== undefined && <SeafoamButton size={16} label={copy.open} disabled={pending} onClick={() => { if (!pending && evidence.recordId !== undefined) onOpenRecord(evidence.recordId); }} />}
      </div>
    </section>
  </Dialog>;
}

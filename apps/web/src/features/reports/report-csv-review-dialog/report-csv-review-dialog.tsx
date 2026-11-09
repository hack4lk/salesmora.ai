'use client';

import type { ReactNode } from 'react';
import { ConfirmDialog, FormFeedback, HelpTooltip, SeafoamOutlineButton } from '@salesmora/ui';
import { reportCsvReviewDialogData as copy } from './report-csv-review-dialog.data';

export type ReportCsvPreview = {
  /** Host review identity; never an authorization capability. */
  id: string;
  reportLabel: string;
  viewLabel: string;
  periodLabel: string;
  dateBasisLabel: string;
  timezone: string;
  filtersLabel: string;
  scopeLabel: string;
  filename: string;
  expectedRows: number;
};
export type ReportCsvReviewState =
  | { kind: 'loading' }
  | { kind: 'error' | 'changed' | 'limit' }
  | { kind: 'ready'; preview: ReportCsvPreview };
export type ReportCsvReviewDialogProps = {
  open: boolean;
  canExport: boolean;
  deniedMessage?: string;
  description?: string;
  state: ReportCsvReviewState;
  pending?: boolean;
  allowEmpty?: boolean;
  rowLimit?: number;
  technicalLimits?: { rows: number; bytes: number; durationMs: number };
  children?: ReactNode;
  onClose: () => void;
  onRefresh: () => void;
  /** Host reauthorizes, recounts and enforces byte/time limits; reject failures, never return partial success. */
  onDownload: (previewId: string) => Promise<void>;
};

/** Review UI only. The host owns preview creation, safe filenames, streaming and completion feedback. */
export function ReportCsvReviewDialog({ open, canExport, deniedMessage, description = copy.description, state, pending = false, allowEmpty = false, rowLimit = 50_000, technicalLimits,
  children, onClose, onRefresh, onDownload }: ReportCsvReviewDialogProps) {
  const preview = canExport && state.kind === 'ready' ? state.preview : undefined;
  const valid = !!preview && preview.id.trim().length > 0 && Number.isSafeInteger(preview.expectedRows) &&
    preview.expectedRows >= (allowEmpty ? 0 : 1) && Number.isSafeInteger(rowLimit) && rowLimit > 0;
  const overLimit = valid && preview.expectedRows > rowLimit;
  const ready = valid && !overLimit;
  const message = !canExport ? deniedMessage ?? copy.denied : state.kind === 'error' ? copy.failed :
    state.kind === 'changed' ? copy.changed : state.kind === 'limit' || overLimit ? technicalLimits
      ? 'This export exceeds its technical CSV limits. No partial CSV will be offered. Narrow the date range or filters.' : copy.limit :
    state.kind === 'ready' && !valid ? copy.invalid : undefined;
  const limitsHelp = technicalLimits ? `Technical limits: ${technicalLimits.rows.toLocaleString('en-US')} rows,
    ${(technicalLimits.bytes / 1048576).toLocaleString('en-US')} MiB and ${technicalLimits.durationMs / 1000} seconds. These are not subscription quotas.` : copy.limits;
  return <ConfirmDialog key={preview?.id ?? state.kind} open={open} title={copy.title} description={description}
    titleAdornment={<HelpTooltip label="About CSV downloads" paragraphs={[copy.freshness, limitsHelp, copy.money]} />}
    confirmLabel={copy.confirm} confirmAppearance="seafoam" confirmDisabled={!ready} pending={pending} pendingLabel={copy.pending}
    onClose={onClose} onConfirm={async () => { if (ready && canExport && !pending && preview) await onDownload(preview.id); }}>
    <div className="grid min-w-0 gap-4">
      {children}
      {canExport && state.kind === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>}
      {message && <FormFeedback kind="error" message={message} />}
      {preview && valid && !overLimit && <dl className="m-0 grid min-w-0 gap-3">
        {[
          [copy.fields.report, `${preview.reportLabel} / ${preview.viewLabel}`],
          [copy.fields.period, preview.periodLabel],
          [copy.fields.basis, `${preview.dateBasisLabel} / ${preview.timezone}`],
          [copy.fields.filters, preview.filtersLabel],
          [copy.fields.scope, preview.scopeLabel],
          [copy.fields.file, preview.filename],
          [copy.fields.rows, new Intl.NumberFormat('en-US').format(preview.expectedRows)],
        ].map(([label, value]) => <div key={label} className="grid min-w-0 gap-1">
          <dt className="text-xs font-semibold text-muted">{label}</dt>
          <dd className="m-0 text-sm leading-6 wrap-anywhere">{value}</dd>
        </div>)}
      </dl>}
      {canExport && message && <SeafoamOutlineButton className="justify-self-start" label={copy.refresh} disabled={pending} onClick={() => { if (!pending) onRefresh(); }} />}
    </div>
  </ConfirmDialog>;
}

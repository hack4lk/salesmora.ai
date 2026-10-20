'use client';

import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import type { LeadsToolbarValues } from '../leads-toolbar/leads-toolbar';
import { exportLeadsDialogData as copy } from './export-leads-dialog.data';

export type ExportLeadFilters = Omit<LeadsToolbarValues, 'view'>;
export type ExportLeadsRequest = { filters: ExportLeadFilters };
export type ExportLeadsDialogProps = {
  open: boolean; filters: ExportLeadFilters; filterLabels: readonly string[];
  scope: 'workspace' | 'assigned'; count: number | null; rowLimit: number; canExport: boolean;
  loading?: boolean; pending?: boolean; error?: string;
  onClose: () => void;
  /** Host freezes filters/count for review, reauthorizes and recounts on export, streams the CSV, and owns success closure. Reject on failure. */
  onConfirm: (request: ExportLeadsRequest) => void | Promise<void>;
};

/** Scoped review only; the server owns authorization, row cap, escaping, audit and actual download. */
export function ExportLeadsDialog({ open, filters, filterLabels, scope, count, rowLimit, canExport, loading = false, pending = false, error, onClose, onConfirm }: ExportLeadsDialogProps) {
  const validCount = count !== null && Number.isSafeInteger(count) && count >= 0;
  const validLimit = Number.isSafeInteger(rowLimit) && rowLimit > 0;
  const overLimit = validCount && validLimit && count! > rowLimit;
  const blocked = !canExport || loading || !validCount || !validLimit || count === 0 || overLimit;
  return <ConfirmDialog open={open} title={copy.title} description={copy.description} confirmLabel={copy.confirm} cancelLabel={copy.cancel}
    pending={pending} pendingLabel={copy.pending} confirmDisabled={blocked} error={error} onClose={onClose}
    onConfirm={() => { if (!pending && !blocked) return onConfirm({ filters }); }}>
    {!canExport ? <FormFeedback kind="error" message={copy.forbidden}/> : <div className="grid gap-4">
      <dl className="m-0 grid gap-3 text-sm">
        <div><dt className="font-semibold text-ink">{copy.dataset}</dt><dd className="m-0 mt-1 text-muted">{copy.datasetValue}</dd></div>
        <div><dt className="font-semibold text-ink">{copy.scope}</dt><dd className="m-0 mt-1 text-muted">{scope === 'assigned' ? copy.assigned : copy.workspace}</dd></div>
        <div><dt className="font-semibold text-ink">{copy.filters}</dt><dd className="m-0 mt-1 text-muted">{filterLabels.length ? <ul className="m-0 grid list-disc gap-1 pl-5">{filterLabels.map((label, index) => <li key={index}>{label}</li>)}</ul> : copy.noFilters}</dd></div>
      </dl>
      {loading ? <p role="status" className="m-0 text-sm text-muted">{copy.loading}</p> : !validCount || !validLimit ? <FormFeedback kind="error" message={copy.unavailable}/> : <>
        <p role="status" className="m-0 rounded-xl border border-primary/20 bg-primary/5 p-4 font-semibold text-ink">{copy.count(count!)}</p>
        {count === 0 && <FormFeedback kind="error" message={copy.empty}/>}
        {overLimit && <FormFeedback kind="error" message={copy.overLimit(rowLimit)}/>}
      </>}
      <p className="m-0 text-sm leading-6 text-muted">{filters.archived ? copy.archivedIncluded : copy.archivedExcluded}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.format}</p>
      <details className="text-sm leading-6 text-muted"><summary tabIndex={0} className="min-h-11 cursor-pointer rounded-lg py-2 font-semibold text-primary focus-visible:focus-ring">{copy.columnsLabel}</summary><p className="mb-0 mt-2">{copy.columns}</p><p className="mb-0 mt-2">{copy.notes}</p></details>
    </div>}
  </ConfirmDialog>;
}

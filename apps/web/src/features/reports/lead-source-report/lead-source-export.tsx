'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import {
  leadSourceExportDatasets,
  type LeadSourceExportInput,
  type LeadSourceExportPreview,
  type LeadSourceReadResult,
} from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import {
  loadSourceCSVPreview,
  receiveSourceCSV,
  saveSourceCSV,
  sourceExportFilename,
  sourceExportInput,
  sourceExportLabels,
  SourceCSVChangedError,
  SourceCSVDeniedError,
} from './lead-source-export.client';

export function LeadSourceExport({ open, onClose, request, authority, onReload }: {
  open: boolean;
  onClose: () => void;
  request: Parameters<typeof sourceExportInput>[0];
  authority: LeadSourceReadResult;
  onReload: () => void;
}) {
  const [dataset, setDataset] = useState<LeadSourceExportInput['dataset']>('source-groups');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState }>({
    key: '', state: { kind: 'loading' },
  });
  const [deniedResult, setDeniedResult] = useState<{ key: string; denied: boolean }>({ key: '', denied: false });
  const [metadata, setMetadata] = useState<LeadSourceExportPreview | undefined>(undefined);
  const review = useRef<{ id: string; preview: LeadSourceExportPreview } | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined);
  const active = useRef(true);
  const requestKey = JSON.stringify([open, request, dataset, retry]);
  const state = resolved.key === requestKey ? resolved.state : { kind: 'loading' as const };
  const denied = deniedResult.key === requestKey && deniedResult.denied;
  const currentMetadata = metadata && JSON.stringify(metadata.input) ===
    JSON.stringify(sourceExportInput(request, dataset)) ? metadata : undefined;

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; operation.current?.abort(); };
  }, []);

  useEffect(() => {
    if (!open || !authority.canExport) return;
    const abort = new AbortController();
    operation.current = abort;
    review.current = undefined;
    void (async () => {
      try {
        const preview = await loadSourceCSVPreview(sourceExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID();
        review.current = { id, preview };
        setDeniedResult({ key: requestKey, denied: false });
        setMetadata(preview);
        setResolved({ key: requestKey, state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
          id,
          reportLabel: 'Sources',
          viewLabel: sourceExportLabels[dataset],
          periodLabel: `${preview.input.query.period.from} - ${preview.input.query.period.to}`,
          dateBasisLabel: 'Lead creation cohort; linked Jobs and accepted decisions are current at snapshot',
          timezone: preview.timezone,
          filtersLabel: dataset === 'accepted-estimates'
            ? 'Accepted Estimate families reachable from the selected cohort'
            : dataset === 'converted' ? 'Leads with surviving linked Jobs' : 'All authorized cohort Leads',
          scopeLabel: `${preview.leadScope} / Leads archived ${preview.leadArchiveVisibility}; ` +
            `conversion ${preview.conversion.kind}; accepted value ${preview.acceptedValue.kind}`,
          filename: sourceExportFilename(preview.input, preview.today),
          expectedRows: preview.count,
        } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setDeniedResult({ key: requestKey, denied: failure instanceof SourceCSVDeniedError });
        setResolved({ key: requestKey, state: { kind: failure instanceof SourceCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Sources CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [open, request, requestKey, authority, dataset, retry]);

  const download = async (id: string) => {
    const current = review.current;
    if (pending || denied || !current || current.id !== id) throw new Error('Refresh the Sources CSV review.');
    const abort = new AbortController();
    operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(current.preview.limits.durationMs)]);
    setPending(true);
    setError(undefined);
    try {
      const blob = await receiveSourceCSV(current.preview, signal);
      if (!active.current || signal.aborted || review.current !== current) throw new Error('CSV download cancelled.');
      saveSourceCSV(blob, sourceExportFilename(current.preview.input, current.preview.today));
      onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof SourceCSVChangedError) {
          review.current = undefined;
          setResolved({ key: requestKey, state: { kind: 'changed' } });
        }
        if (failure instanceof SourceCSVDeniedError) {
          review.current = undefined;
          setDeniedResult({ key: requestKey, denied: true });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Sources CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };

  return <ReportCsvReviewDialog open={open} canExport={authority.canExport && !denied} state={state}
    pending={pending} allowEmpty rowLimit={currentMetadata?.limits.rows} technicalLimits={currentMetadata?.limits}
    onClose={onClose} onRefresh={() => {
      review.current = undefined;
      setMetadata(undefined);
      setError(undefined);
      setRetry(value => value + 1);
    }} onDownload={download}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const selected = leadSourceExportDatasets.find(value => value === event.target.value);
          if (selected) {
            review.current = undefined;
            setMetadata(undefined);
            setError(undefined);
            setDataset(selected);
          }
        }}>
        {Object.entries(sourceExportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(denied || state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access" disabled={pending}
      onClick={() => { onClose(); onReload(); }} />}
    {currentMetadata && <div className="grid gap-2 text-sm text-muted">
      {currentMetadata.input.dataset === 'source-groups' && <p className="m-0">
        Unknown conversion or accepted-value metrics are blank with coverage labels, never treated as zero.
      </p>}
      {currentMetadata.input.dataset === 'accepted-estimates' && <p className="m-0">
        Multi-path or ambiguous Estimate attribution is marked unattributed; linked Lead identity is omitted.
        Amounts use verified frozen pre-tax cents (USD).
      </p>}
      {currentMetadata.input.dataset === 'converted' && <p className="m-0">
        Conversion reflects surviving linked Jobs at the snapshot, including Jobs created after the cohort period.
      </p>}
      <p className="m-0">Snapshot: {currentMetadata.asOf}. {currentMetadata.coverage}</p>
    </div>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

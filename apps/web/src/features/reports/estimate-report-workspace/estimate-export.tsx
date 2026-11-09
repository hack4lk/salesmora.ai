'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { EstimateReportExportInput, EstimateReportExportPreview, EstimateReportQuery, EstimateReportReadResult } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { estimateExportFilename, estimateExportInput, estimateExportLabels, EstimateCSVChangedError,
  EstimateCSVDeniedError, loadEstimateCSVPreview, receiveEstimateCSV, saveEstimateCSV } from './estimate-export.client';

export function EstimateExport({ request, authority, onClose, onReload }: {
  request: EstimateReportQuery; authority: EstimateReportReadResult; onClose: () => void; onReload: () => void;
}) {
  const [dataset, setDataset] = useState<EstimateReportExportInput['dataset']>('summary');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean;
    metadata?: EstimateReportExportPreview }>({ key: '', state: { kind: 'loading' }, denied: false });
  const review = useRef<{ id: string; preview: EstimateReportExportPreview } | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined), active = useRef(true);
  const key = JSON.stringify([request, dataset, retry]);
  const current = resolved.key === key ? resolved : { state: { kind: 'loading' as const }, denied: false, metadata: undefined };
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; operation.current?.abort(); };
  }, []);
  useEffect(() => {
    const abort = new AbortController(); operation.current = abort; review.current = undefined;
    void (async () => {
      try {
        const preview = await loadEstimateCSVPreview(estimateExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        setResolved({ key, denied: false, metadata: preview,
          state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
            id, reportLabel: 'Estimates', viewLabel: estimateExportLabels[dataset],
            periodLabel: 'period' in request ? `${request.period.from} - ${request.period.to}` : 'As of now',
            dateBasisLabel: preview.dateBasis, timezone: preview.timezone,
            filtersLabel: `Owners: ${request.filters.owners.length || 'all authorized'}; parents: ${request.filters.parents.join(', ') || 'all authorized'}`,
            scopeLabel: `${preview.scope}; archived records ${preview.archiveVisibility}`,
            filename: estimateExportFilename(preview.input, preview.today), expectedRows: preview.count,
          } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setResolved({ key, denied: failure instanceof EstimateCSVDeniedError,
          state: { kind: failure instanceof EstimateCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Estimate CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [request, authority, dataset, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Estimate CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveEstimateCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveEstimateCSV(blob, estimateExportFilename(selected.preview.input, selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof EstimateCSVChangedError || failure instanceof EstimateCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof EstimateCSVDeniedError,
            state: { kind: failure instanceof EstimateCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Estimate CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={!!authority.exportAccess && !current.denied} state={current.state}
    pending={pending} allowEmpty rowLimit={current.metadata?.limits.rows} technicalLimits={current.metadata?.limits}
    onClose={onClose} onDownload={download} onRefresh={() => {
      review.current = undefined; setError(undefined); setRetry(value => value + 1);
    }}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const next = event.target.value;
          if (next !== 'summary' && next !== 'evidence') throw new Error('Invalid Estimate CSV dataset.');
          if (next === dataset) return;
          review.current = undefined; setError(undefined); setDataset(next);
        }}>
        {(['summary', 'evidence'] as const).map(value => <option key={value} value={value}>{estimateExportLabels[value]}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(current.denied || current.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    <p className="m-0 text-sm text-muted">Export access may cover fewer Estimates than this report.
      Unverified frozen values and unavailable handoff evidence are not treated as zero.</p>
    {current.metadata && <p className="m-0 text-sm text-muted">Snapshot: {current.metadata.asOf}. {current.metadata.coverage}</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

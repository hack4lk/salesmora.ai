'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { JobReportExportInput, JobReportExportPreview, JobReportQuery, JobReportReadResult } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { jobExportDatasetsForView, jobExportFilename, jobExportInput, jobExportLabels, JobCSVChangedError,
  JobCSVDeniedError, loadJobCSVPreview, receiveJobCSV, saveJobCSV } from './job-export.client';

export function JobExport({ request, authority, onClose, onReload }: {
  request: JobReportQuery; authority: JobReportReadResult; onClose: () => void; onReload: () => void;
}) {
  const [dataset, setDataset] = useState<JobReportExportInput['dataset']>('summary');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean; metadata?: JobReportExportPreview }>({
    key: '', state: { kind: 'loading' }, denied: false,
  });
  const review = useRef<{ id: string; preview: JobReportExportPreview } | undefined>(undefined);
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
        const preview = await loadJobCSVPreview(jobExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        setResolved({ key, denied: false, metadata: preview,
          state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
            id, reportLabel: 'Jobs', viewLabel: jobExportLabels[dataset],
            periodLabel: 'period' in preview.input.query ? `${preview.input.query.period.from} - ${preview.input.query.period.to}` : 'As of now',
            dateBasisLabel: preview.dateBasis === 'current-snapshot' ? 'Current workload'
              : preview.dateBasis === 'completion-date' ? 'Recorded completion date' : 'Creation and recorded lifecycle dates',
            timezone: preview.timezone, filtersLabel: `Statuses: ${request.filters.statuses.length || 'all'}; ` +
              `owners: ${request.filters.owners.length || 'all'}; services: ${request.filters.services.length || 'all'}`,
            scopeLabel: `${preview.scope}; archived Jobs included`,
            filename: jobExportFilename(preview.input, preview.today), expectedRows: preview.count,
          } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setResolved({ key, denied: failure instanceof JobCSVDeniedError,
          state: { kind: failure instanceof JobCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Jobs CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [request, authority, dataset, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Jobs CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveJobCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveJobCSV(blob, jobExportFilename(selected.preview.input, selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof JobCSVChangedError || failure instanceof JobCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof JobCSVDeniedError,
            state: { kind: failure instanceof JobCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Jobs CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={!!authority.exportScope && !current.denied} state={current.state}
    pending={pending} allowEmpty rowLimit={current.metadata?.limits.rows} technicalLimits={current.metadata?.limits}
    onClose={onClose} onDownload={download} onRefresh={() => {
      review.current = undefined; setError(undefined); setRetry(value => value + 1);
    }}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const next = jobExportDatasetsForView(request.view).find(value => value === event.target.value);
          if (!next) throw new Error('Invalid Jobs CSV dataset.');
          if (next === dataset) return;
          review.current = undefined; setError(undefined); setDataset(next);
        }}>
        {jobExportDatasetsForView(request.view).map(value => <option key={value} value={value}>{jobExportLabels[value]}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(current.denied || current.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    <p className="m-0 text-sm text-muted">Lifecycle categories overlap. Completion uses the latest matching event per Job.
      Workload is current, not historical. Export access may cover fewer Jobs than this report.</p>
    {current.metadata && <p className="m-0 text-sm text-muted">Snapshot: {current.metadata.asOf}. {current.metadata.coverage}</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

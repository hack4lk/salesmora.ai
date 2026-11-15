'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { LeadReportQuery, LeadReportReadResult, LeadReportExportInput, LeadReportExportPreview } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { leadExportDatasets, leadExportLabels, leadExportInput, leadExportFilename, loadLeadCSVPreview,
  receiveLeadCSV, saveLeadCSV, LeadCSVChangedError, LeadCSVDeniedError } from './lead-report-export.client';

export function LeadReportExport({ open, onClose, onReload, request, authority }: {
  open: boolean; onClose: () => void; onReload: () => void; request: LeadReportQuery; authority: LeadReportReadResult;
}) {
  const [dataset, setDataset] = useState<LeadReportExportInput['dataset']>('evidence');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false), [denied, setDenied] = useState(false);
  const [error, setError] = useState<string>();
  const [state, setState] = useState<ReportCsvReviewState>({ kind: 'loading' });
  const [metadata, setMetadata] = useState<LeadReportExportPreview>();
  const review = useRef<{ id: string; preview: LeadReportExportPreview } | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; operation.current?.abort(); }; }, []);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController(); operation.current = abort;
    review.current = undefined;
    void (async () => {
      try {
        const preview = await loadLeadCSVPreview(leadExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        setDenied(false);
        const id = crypto.randomUUID();
        review.current = { id, preview };
        setMetadata(preview);
        setState(preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
          id, reportLabel: 'Leads', viewLabel: `${request.view} / ${leadExportLabels[dataset]}`,
          periodLabel: 'period' in preview.input.query ? `${preview.input.query.period.from} - ${preview.input.query.period.to}` : 'Current snapshot',
          dateBasisLabel: preview.dateBasis, timezone: preview.timezone,
          filtersLabel: (['stages', 'owners', 'sources'] as const).map(key =>
            `${key}: ${preview.input.query.filters[key].map(value => authority.options[key].find(option => option.value === value)?.label ?? value).join(', ') || 'All'}`).join('; '),
          scopeLabel: `${preview.scope} / archives ${preview.archiveVisibility}`,
          filename: leadExportFilename(preview.input, preview.today), expectedRows: preview.count,
        } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setDenied(failure instanceof LeadCSVDeniedError);
        setState({ kind: failure instanceof LeadCSVChangedError ? 'changed' : 'error' });
        setError(failure instanceof Error ? failure.message : 'Report CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [open, request, authority, dataset, retry]);
  const download = async (id: string) => {
    const current = review.current;
    if (pending || denied || !current || current.id !== id) throw new Error('Refresh the CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(current.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveLeadCSV(current.preview, signal);
      if (!active.current || signal.aborted || review.current !== current) throw new Error('CSV download cancelled.');
      saveLeadCSV(blob, leadExportFilename(current.preview.input, current.preview.today));
      onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof LeadCSVChangedError) { review.current = undefined; setState({ kind: 'changed' }); }
        if (failure instanceof LeadCSVDeniedError) { review.current = undefined; setDenied(true); }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Report CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open={open} canExport={!!authority.exportScope && !denied} state={state} pending={pending}
    allowEmpty rowLimit={metadata?.limits.rows} technicalLimits={metadata?.limits} onClose={onClose} onRefresh={() => {
      review.current = undefined; setMetadata(undefined); setState({ kind: 'loading' }); setError(undefined);
      setRetry(value => value + 1);
    }} onDownload={download}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
        const selected = leadExportDatasets(request.view).find(item => item === event.target.value);
        if (selected) { review.current = undefined; setMetadata(undefined); setError(undefined); setState({ kind: 'loading' }); setDataset(selected); }
      }}>{leadExportDatasets(request.view).map(value => <option key={value} value={value}>{leadExportLabels[value]}</option>)}</select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(denied || state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access" disabled={pending}
      onClick={() => { onClose(); onReload(); }} />}
    {metadata && <p className="m-0 text-sm text-muted">Technical limits: {metadata.limits.rows.toLocaleString('en-US')} rows,
      {' '}{(metadata.limits.bytes / 1048576).toLocaleString('en-US')} MiB,
      {' '}{metadata.limits.durationMs / 1000} seconds. Fresh snapshot: {metadata.asOf}.</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

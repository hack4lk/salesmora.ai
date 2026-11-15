'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { ActivityReportExportInput, ActivityReportExportPreview, ActivityReportQuery, ActivityReportReadResult } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { activityExportFilename, activityExportInput, activityExportLabels, ActivityCSVChangedError,
  ActivityCSVDeniedError, loadActivityCSVPreview, receiveActivityCSV, saveActivityCSV } from './activity-export.client';

export function ActivityExport({ request, authority, onClose, onReload }: {
  request: ActivityReportQuery; authority: ActivityReportReadResult; onClose: () => void; onReload: () => void;
}) {
  const [dataset, setDataset] = useState<ActivityReportExportInput['dataset']>('summary');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean;
    metadata?: ActivityReportExportPreview }>({ key: '', state: { kind: 'loading' }, denied: false });
  const review = useRef<{ id: string; preview: ActivityReportExportPreview } | undefined>(undefined);
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
        const preview = await loadActivityCSVPreview(activityExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        setResolved({ key, denied: false, metadata: preview,
          state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
            id, reportLabel: 'Activity', viewLabel: activityExportLabels[dataset],
            periodLabel: `${request.period.from} - ${request.period.to}`, dateBasisLabel: 'Recorded event time',
            timezone: preview.timezone, filtersLabel: `Domains: ${request.filters.domains.join(', ') || 'all authorized'}; actions: ${request.filters.actions.length || 'all'}; actors: ${request.filters.actors.length || 'all'}`,
            scopeLabel: preview.includedDomains.map(item => `${item.domain}: ${item.scope}, archives ${item.archiveVisibility}`).join('; '),
            filename: activityExportFilename(preview.input, preview.today), expectedRows: preview.count,
          } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setResolved({ key, denied: failure instanceof ActivityCSVDeniedError,
          state: { kind: failure instanceof ActivityCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Activity CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [request, authority, dataset, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Activity CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveActivityCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveActivityCSV(blob, activityExportFilename(selected.preview.input, selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof ActivityCSVChangedError || failure instanceof ActivityCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof ActivityCSVDeniedError,
            state: { kind: failure instanceof ActivityCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Activity CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={authority.exportScopes.length > 0 && !current.denied} state={current.state}
    pending={pending} allowEmpty rowLimit={current.metadata?.limits.rows} technicalLimits={current.metadata?.limits}
    onClose={onClose} onDownload={download} onRefresh={() => {
      review.current = undefined; setError(undefined); setRetry(value => value + 1);
    }}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const next = event.target.value;
          if (next !== 'summary' && next !== 'evidence') throw new Error('Invalid Activity CSV dataset.');
          if (next === dataset) return;
          review.current = undefined; setError(undefined); setDataset(next);
        }}>
        {(['summary', 'evidence'] as const).map(value => <option key={value} value={value}>{activityExportLabels[value]}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(current.denied || current.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    {current.metadata && <p className="m-0 text-sm text-muted">Snapshot: {current.metadata.asOf}. {current.metadata.coverage}
      {' '}Omitted domains: {current.metadata.omittedDomains.map(item => item.domain).join(', ') || 'none'}.</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

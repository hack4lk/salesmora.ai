'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { CalendarExportInput, CalendarExportPreview, CalendarReportQuery, CalendarReportReadResult } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { calendarExportDatasetsForView, calendarExportFilename, calendarExportInput, calendarExportLabels,
  CalendarCSVChangedError, CalendarCSVDeniedError, loadCalendarCSVPreview, receiveCalendarCSV, saveCalendarCSV } from './calendar-export.client';

export function CalendarExport({ request, authority, onClose, onReload }: {
  request: CalendarReportQuery; authority: CalendarReportReadResult; onClose: () => void; onReload: () => void;
}) {
  const [dataset, setDataset] = useState<CalendarExportInput['dataset']>('summary');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean; metadata?: CalendarExportPreview }>({
    key: '', state: { kind: 'loading' }, denied: false,
  });
  const review = useRef<{ id: string; preview: CalendarExportPreview } | undefined>(undefined);
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
        const preview = await loadCalendarCSVPreview(calendarExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        const scopes = preview.outputScopes;
        const scopeLabel = `${preview.scope.kind}; Jobs ${scopes.jobs.kind === 'available' ? scopes.jobs.scope : 'unavailable'}; ` +
          `Work Orders ${scopes.workOrders.kind === 'available' ? scopes.workOrders.scope : 'unavailable'}`;
        setResolved({ key, denied: false, metadata: preview,
          state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
            id, reportLabel: 'Calendar', viewLabel: calendarExportLabels[dataset],
            periodLabel: 'period' in preview.input.query ? `${preview.input.query.period.from} - ${preview.input.query.period.to}` : 'As of now',
            dateBasisLabel: preview.dateBasis === 'current-unscheduled' ? 'Current unscheduled work' : 'Current scheduled visit date',
            timezone: preview.timezone, filtersLabel: `Participants: ${request.filters.participants.length || 'all authorized'}; ` +
              `record types: ${request.filters.recordTypes.join(', ') || 'all export-authorized'}`,
            scopeLabel, filename: calendarExportFilename(preview.input, preview.today), expectedRows: preview.count,
          } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setResolved({ key, denied: failure instanceof CalendarCSVDeniedError,
          state: { kind: failure instanceof CalendarCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Calendar CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [request, authority, dataset, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Calendar CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveCalendarCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveCalendarCSV(blob, calendarExportFilename(selected.preview.input, selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof CalendarCSVChangedError || failure instanceof CalendarCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof CalendarCSVDeniedError,
            state: { kind: failure instanceof CalendarCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Calendar CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={authority.canExport && !current.denied} state={current.state}
    pending={pending} allowEmpty rowLimit={current.metadata?.limits.rows} technicalLimits={current.metadata?.limits}
    onClose={onClose} onDownload={download} onRefresh={() => {
      review.current = undefined; setError(undefined); setRetry(value => value + 1);
    }}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const next = calendarExportDatasetsForView(request.view).find(value => value === event.target.value);
          if (!next) throw new Error('Invalid Calendar CSV dataset.');
          if (next === dataset) return;
          review.current = undefined; setError(undefined); setDataset(next);
        }}>
        {calendarExportDatasetsForView(request.view).map(value => <option key={value} value={value}>{calendarExportLabels[value]}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(current.denied || current.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    <p className="m-0 text-sm text-muted">Shared visits count once. Participant workload and overlap person-pairs are non-additive.
      Past schedules do not prove missed attendance. Unavailable parent-domain totals are blank, not zero.</p>
    {current.metadata && <p className="m-0 text-sm text-muted">Snapshot: {current.metadata.asOf}. {current.metadata.coverage}</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}

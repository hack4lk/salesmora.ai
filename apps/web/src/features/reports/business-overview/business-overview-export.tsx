'use client';

import { useEffect, useRef, useState } from 'react';
import { FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { BusinessOverviewQuery, BusinessOverviewReadResult, BusinessOverviewExportPreview } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { loadOverviewCSVPreview, receiveOverviewCSV, saveOverviewCSV, overviewExportFilename,
  OverviewCSVChangedError, OverviewCSVDeniedError } from './business-overview-export.client';

export function BusinessOverviewExport({ query, authority, onClose, onReload }: {
  query: BusinessOverviewQuery; authority: BusinessOverviewReadResult; onClose: () => void; onReload: () => void;
}) {
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false), [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean; preview?: BusinessOverviewExportPreview }>({
    key: '', state: { kind: 'loading' }, denied: false,
  });
  const key = JSON.stringify([query, retry]);
  const result = resolved.key === key ? resolved : { state: { kind: 'loading' as const }, denied: false, preview: undefined };
  const review = useRef<{ id: string; preview: BusinessOverviewExportPreview } | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined), active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; operation.current?.abort(); };
  }, []);
  useEffect(() => {
    const abort = new AbortController(); operation.current = abort; review.current = undefined;
    void (async () => {
      try {
        const preview = await loadOverviewCSVPreview(query, authority, AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        const describe = (name: string, scope: { scope: string; archives?: string } | string | null) =>
          `${name}: ${scope === null ? 'unavailable' : typeof scope === 'string' ? scope
            : `${scope.scope}${scope.archives ? ` (archives ${scope.archives})` : ''}`}`;
        setResolved({ key, denied: false, preview, state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
          id, reportLabel: 'Overview', viewLabel: 'Authorized summary', periodLabel: `${query.period.from} - ${query.period.to}`,
          dateBasisLabel: 'Period and current snapshots', timezone: preview.timezone, filtersLabel: 'No filters',
          scopeLabel: [describe('Leads', preview.scopes.lead), describe('Jobs', preview.scopes.job),
            describe('Estimates', preview.scopes.estimate), describe('Calendar', preview.scopes.calendar)].join('; '),
          filename: overviewExportFilename(preview.today), expectedRows: preview.count,
        } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setError(failure instanceof Error ? failure.message : 'Overview CSV preview could not be loaded.');
        setResolved({ key, denied: failure instanceof OverviewCSVDeniedError,
          state: { kind: failure instanceof OverviewCSVChangedError ? 'changed' : 'error' } });
      }
    })();
    return () => abort.abort();
  }, [query, authority, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || result.denied || !selected || selected.id !== id) throw new Error('Refresh the Overview CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveOverviewCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveOverviewCSV(blob, overviewExportFilename(selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof OverviewCSVChangedError || failure instanceof OverviewCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof OverviewCSVDeniedError,
            state: { kind: failure instanceof OverviewCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Overview CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={!result.denied} state={result.state} pending={pending}
    deniedMessage={error}
    description="Export the authorized Business Overview summary for this period and the current snapshots."
    rowLimit={result.preview?.limits.rows} technicalLimits={result.preview?.limits} onClose={onClose} onDownload={download}
    onRefresh={() => { review.current = undefined; setError(undefined); setRetry(value => value + 1); }}>
    <p className="m-0 text-sm text-muted">Only export-authorized summary metrics are included. Unavailable sections are marked,
      not zero; export scopes may be narrower than the report. Current snapshots are not historical.</p>
    {result.preview && <p className="m-0 text-sm text-muted">{result.preview.coverage} Calendar Job scope:
      {' '}{result.preview.scopes.calendar?.jobs ?? 'unavailable'}; Work Order scope:
      {' '}{result.preview.scopes.calendar?.workOrders ?? 'unavailable'}.</p>}
    {error && !result.denied && <FormFeedback kind="error" message={error} />}
    {(result.denied || result.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}
